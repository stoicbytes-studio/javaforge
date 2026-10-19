#!/usr/bin/env node
/**
 * Compiles and runs every piece of Java in the curriculum against a real JDK:
 *
 *  - runnable lesson examples must print exactly their `expectedOutput`
 *  - predict-the-output checks: the correct option must equal the real output
 *    (or the program must fail to compile when `expectCompileError` is set)
 *  - interview "output" questions with a main method: same rule
 *  - coding challenges: the reference solution must pass every test, and the
 *    starter code must compile but NOT pass every test
 *
 * Usage: node scripts/verify-java-content.mjs [filter] [--executor http://localhost:8080]
 * Requires `javac` and `java` (JDK 21+) on PATH. With --executor, programs
 * are run through the JavaForge execution service API instead, which checks
 * that the service grades content exactly like a local JDK. Content files under
 * src/content must only use type-only imports so Node can load them directly.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { cpus, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');
const argv = process.argv.slice(2);
const executorFlag = argv.indexOf('--executor');
const executorUrl = executorFlag >= 0 ? argv[executorFlag + 1] : undefined;
const filter = argv.find((a, i) => !a.startsWith('--') && i !== executorFlag + 1);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('index.ts') ? [p] : [];
  });
}

function run(cmd, args, { cwd, input = '', timeoutMs = 15000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: { ...process.env, JAVA_TOOL_OPTIONS: '' } });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr: stderr.replace(/^Picked up JAVA_TOOL_OPTIONS.*\n/m, '') });
    });
    child.stdin.end(input);
  });
}

const compiled = new Map();
async function compile(source) {
  if (compiled.has(source)) return compiled.get(source);
  const promise = (async () => {
    const dir = mkdtempSync(join(tmpdir(), 'jf-verify-'));
    writeFileSync(join(dir, 'Main.java'), source);
    const res = await run('javac', ['-encoding', 'UTF-8', '-Xlint:none', '-d', dir, 'Main.java'], { cwd: dir });
    return { dir, ok: res.code === 0, errors: res.stderr };
  })();
  compiled.set(source, promise);
  return promise;
}

async function executeRemote(source, stdin) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${executorUrl}/api/v1/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: [{ name: 'Main.java', content: source }], mainClass: 'Main', stdin }),
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    const body = await res.json();
    if (!res.ok) return { compileError: `HTTP ${res.status}: ${body.message}` };
    if (!body.compile.success) return { compileError: body.compile.diagnostics.map((d) => `${d.line}: ${d.message}`).join('\n') };
    return { stdout: body.run.stdout, stderr: body.run.stderr, code: body.run.exitCode };
  }
  return { compileError: 'rate limited by executor' };
}

async function execute(source, stdin = '') {
  if (executorUrl) return executeRemote(source, stdin);
  const c = await compile(source);
  if (!c.ok) return { compileError: c.errors };
  const res = await run('java', ['-Xss8m', '-cp', c.dir, 'Main'], { cwd: c.dir, input: stdin });
  return { stdout: res.stdout, stderr: res.stderr, code: res.code };
}

/** Same comparison the execution service uses: trailing whitespace per line and trailing newlines ignored. */
export function normalize(s) {
  return s.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').replace(/\n+$/, '');
}

// Console encodings differ between JVMs and sandboxes, so expected output must be ASCII.
const NON_ASCII = /[^\x00-\x7F]/;

const jobs = [];
const seenIds = new Map();
function track(kind, id, file) {
  const key = `${kind}:${id}`;
  if (seenIds.has(key)) jobs.push({ label: key, file, fn: async () => `duplicate id (also in ${seenIds.get(key)})` });
  seenIds.set(key, file);
}

function collect(value, file) {
  if (Array.isArray(value)) return value.forEach((v) => collect(v, file));
  if (!value || typeof value !== 'object') return;

  // Lesson
  if (Array.isArray(value.examples) && Array.isArray(value.checks) && value.moduleId) {
    track('lesson', value.id, file);
    for (const ex of value.examples) {
      if (!ex.runnable) continue;
      jobs.push({
        label: `${value.id} › example ${ex.id}`,
        file,
        fn: async () => {
          const r = await execute(ex.code, ex.stdin ?? '');
          if (r.compileError) return `does not compile:\n${r.compileError}`;
          if (r.code !== 0 && ex.expectedOutput === undefined) return `exit ${r.code}: ${r.stderr}`;
          if (ex.expectedOutput !== undefined && NON_ASCII.test(ex.expectedOutput)) return 'expectedOutput contains non-ASCII characters';
          if (ex.expectedOutput !== undefined && normalize(r.stdout) !== normalize(ex.expectedOutput)) {
            return `output mismatch\n--- expected\n${ex.expectedOutput}\n--- actual\n${r.stdout}${r.stderr}`;
          }
        },
      });
    }
    for (const check of value.checks) {
      track('check', check.id, file);
      if (check.kind === 'mcq') {
        if (!check.options.some((o) => o.id === check.correctOptionId)) {
          jobs.push({ label: `${value.id} › ${check.id}`, file, fn: async () => 'correctOptionId not among options' });
        }
      }
      if (check.kind === 'multi-select') {
        if (!check.correctOptionIds.every((id) => check.options.some((o) => o.id === id))) {
          jobs.push({ label: `${value.id} › ${check.id}`, file, fn: async () => 'correctOptionIds not among options' });
        }
      }
      if (check.kind !== 'predict-output') continue;
      jobs.push({ label: `${value.id} › check ${check.id}`, file, fn: () => verifyOutputQuestion(check) });
    }
    for (const ex of value.walkthrough ? [value.walkthrough] : []) {
      if (!value.examples.some((e) => e.id === ex.exampleId)) {
        jobs.push({ label: `${value.id} › walkthrough`, file, fn: async () => `walkthrough references unknown example ${ex.exampleId}` });
      }
    }
    return;
  }

  // Coding challenge
  if (typeof value.starterCode === 'string' && typeof value.solution === 'string' && Array.isArray(value.tests)) {
    track('challenge', value.id, file);
    jobs.push({
      label: `challenge ${value.id}`,
      file,
      fn: async () => {
        const failures = [];
        if (value.tests.some((t) => NON_ASCII.test(t.expectedStdout))) return 'a test expects non-ASCII output';
        for (const t of value.tests) {
          const r = await execute(value.solution, t.stdin);
          if (r.compileError) return `solution does not compile:\n${r.compileError}`;
          if (normalize(r.stdout) !== normalize(t.expectedStdout)) {
            failures.push(`test ${t.id}: expected\n${t.expectedStdout}\nactual\n${r.stdout}${r.stderr}`);
          }
        }
        if (failures.length) return `solution fails:\n${failures.join('\n')}`;
        for (const sc of value.staticChecks ?? []) {
          const hit = new RegExp(sc.pattern).test(value.solution);
          if (hit !== sc.mustMatch) return `solution violates static check ${sc.id}`;
        }
        const starter = executorUrl ? await execute(value.starterCode, value.tests[0]?.stdin ?? '') : await compile(value.starterCode);
        if (starter.compileError || starter.ok === false) return `starter code does not compile:\n${starter.compileError ?? starter.errors}`;
        let allPass = true;
        for (const t of value.tests) {
          const r = await execute(value.starterCode, t.stdin);
          if (normalize(r.stdout ?? '') !== normalize(t.expectedStdout)) allPass = false;
        }
        if (allPass) return 'starter code already passes every test';
      },
    });
    return;
  }

  // Bug hunt: the code under investigation must compile.
  if (typeof value.code === 'string' && Array.isArray(value.buggyLines) && Array.isArray(value.rootCauseOptions)) {
    track('bug-hunt', value.id, file);
    jobs.push({
      label: `bug hunt ${value.id}`,
      file,
      fn: async () => {
        if (executorUrl) return;
        const c = await compile(value.code);
        if (!c.ok) return `bug hunt code does not compile:\n${c.errors}`;
      },
    });
    return;
  }

  // JVM Lab scenario: the program must print what the final step shows.
  if (typeof value.source === 'string' && Array.isArray(value.steps) && Array.isArray(value.concepts)) {
    track('jvm', value.id, file);
    const shown = [...value.steps].reverse().find((s) => s.output !== undefined)?.output;
    jobs.push({
      label: `jvm scenario ${value.id}`,
      file,
      fn: async () => {
        const r = await execute(value.source);
        if (r.compileError) return `scenario source does not compile:\n${r.compileError}`;
        if (shown !== undefined && normalize(r.stdout) !== normalize(shown)) {
          return `final step shows "${shown}" but the program printed:\n${r.stdout}`;
        }
      },
    });
    return;
  }

  // Interview output question
  if (value.kind === 'output' && typeof value.code === 'string' && value.code.includes('static void main') && value.options) {
    track('interview', value.id, file);
    jobs.push({ label: `interview ${value.id}`, file, fn: () => verifyOutputQuestion(value) });
    return;
  }
  if (typeof value.prompt === 'string' && value.modelAnswer) track('interview', value.id, file);

  for (const v of Object.values(value)) collect(v, file);
}

async function verifyOutputQuestion(q) {
  const correct = q.options.find((o) => o.id === q.correctOptionId);
  if (!correct) return 'correctOptionId not among options';
  if (!q.expectCompileError && NON_ASCII.test(correct.text)) return 'correct option contains non-ASCII characters';
  const r = await execute(q.code);
  if (q.expectCompileError) {
    return r.compileError ? undefined : `expected a compile error but it compiled and printed:\n${r.stdout}`;
  }
  if (r.compileError) return `does not compile:\n${r.compileError}`;
  const actual = normalize(r.stdout + (r.code !== 0 ? r.stderr.split('\n')[0] : ''));
  if (normalize(correct.text) !== actual) {
    return `correct option "${correct.text}" but program printed:\n${r.stdout}${r.stderr}`;
  }
  const dup = q.options.filter((o) => normalize(o.text) === actual);
  if (dup.length > 1) return 'more than one option matches the real output';
}

async function main() {
  const files = walk(contentDir);
  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    for (const value of Object.values(mod)) collect(value, file.replace(root + '/', ''));
  }
  const selected = filter ? jobs.filter((j) => j.label.includes(filter) || j.file.includes(filter)) : jobs;
  console.log(`Verifying ${selected.length} Java items from ${files.length} content files...`);

  let failed = 0;
  let index = 0;
  const workers = Array.from({ length: Math.max(1, cpus().length) }, async () => {
    while (index < selected.length) {
      const job = selected[index++];
      let error;
      try {
        error = await job.fn();
      } catch (e) {
        error = String(e?.stack ?? e);
      }
      if (error) {
        failed++;
        console.error(`\n✗ ${job.label}  (${job.file})\n${error}`);
      }
    }
  });
  await Promise.all(workers);
  for (const c of compiled.values()) rmSync((await c).dir, { recursive: true, force: true });

  if (failed) {
    console.error(`\n${failed} of ${selected.length} items failed.`);
    process.exit(1);
  }
  const target = executorUrl ? `execution service ${executorUrl}` : (await run('java', ['-version'])).stderr.split('\n')[0];
  console.log(`All ${selected.length} items verified against ${target}`);
}

main();

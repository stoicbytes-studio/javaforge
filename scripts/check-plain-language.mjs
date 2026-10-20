#!/usr/bin/env node
/**
 * Compares the definition and explanation text of concept pages with a git
 * revision, to check that a plain-language rewrite kept the meaning:
 * - every changed string keeps the same code spans, numbers and references
 *   (`code`, 21, JEP 444, §8.1.4, O(n log n), RFC 9110),
 * - key-term names, follow-up questions and step counts are unchanged,
 * and reports readability before and after (sentence length, long words).
 *
 * Usage: node scripts/check-plain-language.mjs [--base REV] [concept files...]
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const baseAt = args.indexOf('--base');
const base = baseAt >= 0 ? args.splice(baseAt, 2)[1] : 'HEAD';
const dir = join(root, 'src', 'content', 'concepts');
const files = args.length ? args.map((f) => resolve(f)) : readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => join(dir, f));

const tmp = mkdtempSync(join(tmpdir(), 'plain-'));
const load = async (file) => Object.assign({}, ...Object.values(await import(pathToFileURL(file).href)));
const loadBase = async (file) => {
  const out = join(tmp, basename(file));
  writeFileSync(out, execFileSync('git', ['show', `${base}:${relative(root, file)}`], { cwd: root }));
  return load(out);
};

/** The strings a plain-language pass may rewrite, keyed by a stable path. */
function texts(c) {
  const t = {};
  if (c.textbook) {
    t['textbook.definition'] = c.textbook.definition;
    c.textbook.terms.forEach((x) => (t[`textbook.term[${x.term}]`] = x.meaning));
  }
  t.interviewDefinition = c.interviewDefinition;
  (c.interviewFollowUps ?? []).forEach((f) => (t[`followUp[${f.question}]`] = f.answer));
  for (const d of c.diagrams) {
    t[`${d.id}.caption`] = d.caption;
    (d.explanation ?? []).forEach((s, i) => (t[`${d.id}.step${i + 1}`] = s));
  }
  return t;
}

const codeSpans = (s) => (s.match(/`[^`]+`/g) ?? []).sort();
// Numbers and references whose change would change the facts.
const facts = (s) =>
  (s.replace(/`[^`]+`/g, ' ').match(/(JEP|JSR|RFC|JDK|Java|SE)\s?\d+|§\s?[\d.]+|O\([^)]*\)|\d+(\.\d+)?%?/g) ?? [])
    .map((x) => x.replace(/\s+/g, ' '))
    .sort();
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

const sentences = (s) => s.replace(/`[^`]+`/g, 'code').split(/(?<=[.!?;:]\**)\s+/).filter((x) => /\w/.test(x));
const wordsOf = (s) => s.replace(/`[^`]+`/g, 'code').replace(/[*_]/g, '').match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
const syllables = (w) => {
  const v = w.toLowerCase().replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, v ? v.length : 1);
};
function stats(strings) {
  let sents = 0, words = 0, long = 0, syl = 0, longSentences = 0;
  for (const s of strings) {
    for (const x of sentences(s)) {
      const w = wordsOf(x);
      sents++;
      if (w.length > 25) longSentences++;
      words += w.length;
      for (const y of w) {
        const n = syllables(y);
        syl += n;
        if (n >= 3) long++;
      }
    }
  }
  return {
    wordsPerSentence: +(words / sents).toFixed(1),
    longWordPct: +((100 * long) / words).toFixed(1),
    sentencesOver25Words: longSentences,
    readingEase: +(206.835 - 1.015 * (words / sents) - 84.6 * (syl / words)).toFixed(1),
  };
}

const problems = [];
const before = [];
const after = [];
let changed = 0;
try {
  for (const file of files) {
    const [now, old] = [await load(file), await loadBase(file)];
    for (const [id, c] of Object.entries(now)) {
      const o = old[id];
      if (!o) continue;
      const tn = texts(c);
      const to = texts(o);
      for (const key of Object.keys(to)) if (!(key in tn)) problems.push(`${id}: ${key} was removed or renamed (key terms, follow-up questions and step counts must stay)`);
      for (const key of Object.keys(tn)) if (!(key in to)) problems.push(`${id}: ${key} is new (do not add terms, questions or steps)`);
      for (const [key, value] of Object.entries(tn)) {
        const prev = to[key];
        if (prev === undefined) continue;
        before.push(prev);
        after.push(value);
        if (prev === value) continue;
        changed++;
        if (!same(codeSpans(prev), codeSpans(value))) problems.push(`${id}: ${key} changed code spans\n    was ${JSON.stringify(codeSpans(prev))}\n    now ${JSON.stringify(codeSpans(value))}`);
        if (!same(facts(prev), facts(value))) problems.push(`${id}: ${key} changed numbers/references\n    was ${JSON.stringify(facts(prev))}\n    now ${JSON.stringify(facts(value))}`);
      }
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
for (const p of problems) console.log(p);
console.log(`Readability before: ${JSON.stringify(stats(before))}`);
console.log(`Readability after:  ${JSON.stringify(stats(after))}`);
console.log(problems.length ? `${problems.length} problem(s); ${changed} string(s) changed.` : `OK: ${changed} string(s) changed; code, numbers and references preserved.`);
process.exit(problems.length ? 1 : 0);

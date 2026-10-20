#!/usr/bin/env node
/**
 * Checks "Make it stick" memory files against the same rules as the content tests.
 * Usage: node scripts/check-memory.mjs src/content/memory/03-oop.ts [more files]
 * With no arguments, checks every file in src/content/memory.
 */
import { existsSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { memoryProblems } = await import(pathToFileURL(join(root, 'src', 'lib', 'illustration.ts')).href);
const { PICTOGRAMS } = await import(pathToFileURL(join(root, 'src', 'components', 'pictograms.ts')).href);
const dir = join(root, 'src', 'content', 'memory');
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => resolve(f))
  : readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => join(dir, f));

let problems = 0;
let aids = 0;
for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  // Memory files mirror the concept files; a lesson whose concept page has "types of"
  // sections must explain those types in simple words too.
  const conceptFile = join(root, 'src', 'content', 'concepts', basename(file));
  const concepts = existsSync(conceptFile) ? Object.assign({}, ...Object.values(await import(pathToFileURL(conceptFile).href))) : {};
  for (const value of Object.values(mod)) {
    if (!value || typeof value !== 'object') continue;
    for (const [lessonId, memory] of Object.entries(value)) {
      aids++;
      const found = memoryProblems(lessonId, memory, { needsTypes: Boolean(concepts[lessonId]?.variants?.length) });
      for (const item of memory?.picture?.items ?? []) if (!PICTOGRAMS[item.icon]) found.push(`${lessonId}: unknown pictogram "${item.icon}"`);
      for (const p of found) console.log(p);
      problems += found.length;
    }
  }
}
console.log(problems ? `${problems} problem(s) in ${aids} memory aid(s).` : `OK: ${aids} memory aid(s) pass.`);
process.exit(problems ? 1 : 0);

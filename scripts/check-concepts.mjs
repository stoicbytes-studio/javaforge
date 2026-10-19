#!/usr/bin/env node
/**
 * Checks concept-page files against the same rules as the content tests.
 * Usage: node scripts/check-concepts.mjs src/content/concepts/03-oop.ts [more files]
 * With no arguments, checks every file in src/content/concepts.
 */
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { conceptProblems } = await import(pathToFileURL(join(root, 'src', 'lib', 'diagram.ts')).href);
const dir = join(root, 'src', 'content', 'concepts');
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => resolve(f))
  : readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => join(dir, f));

let problems = 0;
let pages = 0;
const diagramIds = new Map();
for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  for (const value of Object.values(mod)) {
    if (!value || typeof value !== 'object') continue;
    for (const [lessonId, concepts] of Object.entries(value)) {
      pages++;
      const found = conceptProblems(lessonId, concepts);
      for (const d of concepts?.diagrams ?? []) {
        if (diagramIds.has(d.id)) found.push(`${lessonId}: diagram id ${d.id} also used in ${diagramIds.get(d.id)}`);
        diagramIds.set(d.id, lessonId);
      }
      for (const p of found) console.log(p);
      problems += found.length;
    }
  }
}
console.log(problems ? `${problems} problem(s) in ${pages} concept page(s).` : `OK: ${pages} concept page(s) pass.`);
process.exit(problems ? 1 : 0);

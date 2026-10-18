// Copies the Monaco editor runtime into public/ so the web build serves it
// from the app's own origin instead of a third-party CDN.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const target = join(root, 'public', 'monaco', 'vs');

if (!existsSync(source)) {
  console.warn('[copy-monaco] monaco-editor is not installed; web editor will fall back to the plain editor.');
  process.exit(0);
}
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log('[copy-monaco] copied Monaco runtime to public/monaco/vs');

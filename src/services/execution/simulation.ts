import { tokenizeJava } from '@/lib/javaTokenizer';
import type { CodeExecutor, Diagnostic, ExecutionRequest, ExecutionResponse } from './types';

export const SIMULATION_NOTICE =
  'Simulation mode: no Java runtime is connected, so your code was NOT compiled or executed. ' +
  'Only lightweight static checks ran. Connect the JavaForge execution service to get real compiler errors, output and test results.';

/**
 * Static sanity checks that can run anywhere. They catch common structural
 * mistakes (unbalanced delimiters, unterminated literals, a missing main
 * method) but are no substitute for javac.
 */
export function staticDiagnostics(source: string, mainClass: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const stack: { ch: string; line: number; column: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  let line = 1;
  let column = 1;

  for (const token of tokenizeJava(source)) {
    if (token.kind === 'string' && token.text.length > 1) {
      const quote = token.text.startsWith('"""') ? '"""' : token.text[0]!;
      const closed = quote === '"""' ? token.text.length >= 6 && token.text.endsWith('"""') : token.text.endsWith(quote) && !token.text.endsWith(`\\${quote}`);
      if (!closed) diagnostics.push({ line, column, severity: 'error', message: 'Unterminated string or character literal.' });
    } else if (token.kind === 'string' && token.text.length === 1) {
      diagnostics.push({ line, column, severity: 'error', message: 'Unterminated string or character literal.' });
    } else if (token.kind === 'comment' && token.text.startsWith('/*') && !token.text.endsWith('*/')) {
      diagnostics.push({ line, column, severity: 'error', message: 'Unterminated block comment.' });
    } else if (token.kind === 'plain') {
      for (const ch of token.text) {
        if (ch === '(' || ch === '[' || ch === '{') stack.push({ ch, line, column });
        else if (ch in pairs) {
          const open = stack.pop();
          if (!open || open.ch !== pairs[ch]) {
            diagnostics.push({ line, column, severity: 'error', message: `Unexpected '${ch}'${open ? ` (does not match '${open.ch}' on line ${open.line})` : ''}.` });
          }
        }
        if (ch === '\n') {
          line++;
          column = 1;
        } else column++;
      }
      continue;
    }
    for (const ch of token.text) {
      if (ch === '\n') {
        line++;
        column = 1;
      } else column++;
    }
  }
  for (const open of stack) {
    diagnostics.push({ line: open.line, column: open.column, severity: 'error', message: `'${open.ch}' is never closed.` });
  }
  if (!new RegExp(`\\bclass\\s+${mainClass}\\b`).test(source)) {
    diagnostics.push({ severity: 'error', message: `No class named ${mainClass} was found.` });
  }
  if (!/static\s+void\s+main\s*\(/.test(source)) {
    diagnostics.push({ severity: 'warning', message: 'No `public static void main(String[] args)` method was found.' });
  }
  return diagnostics;
}

export const simulationExecutor: CodeExecutor = {
  mode: 'simulation',
  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const started = Date.now();
    const diagnostics = request.files.flatMap((f) =>
      staticDiagnostics(f.content, request.mainClass).map((d) => ({ ...d, file: f.name })),
    );
    return {
      mode: 'simulation',
      compile: {
        success: !diagnostics.some((d) => d.severity === 'error'),
        diagnostics,
        timeMs: Date.now() - started,
      },
      notice: SIMULATION_NOTICE,
    };
  },
};

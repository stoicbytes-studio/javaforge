/**
 * Contract shared with the Java execution service (executor/). Keep in sync
 * with executor/src/main/java/.../api/*.java and docs/execution-api.md.
 */

export interface SourceFile {
  name: string;
  content: string;
}

export interface TestCaseInput {
  id: string;
  stdin: string;
  expectedStdout: string;
}

export interface ExecutionRequest {
  files: SourceFile[];
  mainClass: string;
  stdin?: string;
  testCases?: TestCaseInput[];
}

export interface Diagnostic {
  file?: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
  message: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timeMs: number;
  timedOut: boolean;
  outputTruncated: boolean;
}

export interface TestResult extends RunResult {
  id: string;
  passed: boolean;
}

export type ExecutionMode = 'remote' | 'simulation';

export interface ExecutionResponse {
  mode: ExecutionMode;
  compile: { success: boolean; diagnostics: Diagnostic[]; timeMs: number };
  run?: RunResult;
  tests?: TestResult[];
  /** Shown to the learner, e.g. the simulation-mode disclaimer. */
  notice?: string;
}

export interface ExecutorHealth {
  status: 'UP' | 'DOWN';
  javaVersion?: string;
  sandbox?: string;
}

export interface CodeExecutor {
  mode: ExecutionMode;
  execute(request: ExecutionRequest, signal?: AbortSignal): Promise<ExecutionResponse>;
}

/** Output comparison used for tests: ignores trailing whitespace on each line and trailing blank lines. */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n+$/, '');
}

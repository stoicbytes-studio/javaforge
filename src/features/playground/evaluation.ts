import type { ExecutionRequest, ExecutionResponse } from '@/services/execution/types';
import type { CodingChallenge, StaticCheck } from '@/types/curriculum';

export const MAIN_FILE = 'Main.java';
export const MAIN_CLASS = 'Main';

/** Score recorded for a pass after the reference solution was viewed. */
export const SOLUTION_VIEWED_SCORE = 0.5;

export interface StaticCheckResult {
  check: StaticCheck;
  passed: boolean;
}

export function runStaticChecks(challenge: Pick<CodingChallenge, 'staticChecks'>, code: string): StaticCheckResult[] {
  return (challenge.staticChecks ?? []).map((check) => {
    let matched = false;
    try {
      matched = new RegExp(check.pattern).test(code);
    } catch {
      matched = false;
    }
    return { check, passed: matched === check.mustMatch };
  });
}

export function buildRunRequest(code: string, stdin: string): ExecutionRequest {
  return { files: [{ name: MAIN_FILE, content: code }], mainClass: MAIN_CLASS, stdin };
}

export function buildSubmitRequest(code: string, challenge: CodingChallenge): ExecutionRequest {
  return {
    files: [{ name: MAIN_FILE, content: code }],
    mainClass: MAIN_CLASS,
    testCases: challenge.tests.map((t) => ({ id: t.id, stdin: t.stdin, expectedStdout: t.expectedStdout })),
  };
}

export interface SubmissionSummary {
  /** True only when every test passed on a real runtime and static checks pass. */
  passed: boolean;
  verified: boolean;
  passedTests: number;
  totalTests: number;
  staticFailures: StaticCheckResult[];
  message: string;
}

export function summarizeSubmission(
  response: ExecutionResponse,
  challenge: CodingChallenge,
  code: string,
): SubmissionSummary {
  const staticResults = runStaticChecks(challenge, code);
  const staticFailures = staticResults.filter((r) => !r.passed);
  const totalTests = challenge.tests.length;

  if (response.mode === 'simulation') {
    return {
      passed: false,
      verified: false,
      passedTests: 0,
      totalTests,
      staticFailures,
      message: response.compile.success
        ? 'Static checks passed, but tests cannot run in simulation mode. Connect the execution service to verify your solution.'
        : 'Static checks found problems. Fix them first.',
    };
  }
  if (!response.compile.success) {
    return { passed: false, verified: true, passedTests: 0, totalTests, staticFailures, message: 'Compilation failed. See Problems.' };
  }
  const tests = response.tests ?? [];
  const passedTests = tests.filter((t) => t.passed).length;
  const allPassed = passedTests === totalTests && tests.length === totalTests;
  const passed = allPassed && staticFailures.length === 0;
  return {
    passed,
    verified: true,
    passedTests,
    totalTests,
    staticFailures,
    message: passed
      ? `All ${totalTests} tests passed.`
      : allPassed
        ? 'All tests passed, but the solution does not meet the challenge constraints.'
        : `${passedTests}/${totalTests} tests passed.`,
  };
}

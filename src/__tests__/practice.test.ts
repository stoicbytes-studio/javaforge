import { scoreBugHunt, scoreIncident } from '@/features/bug-hunter/scoring';
import { evaluateWrittenAnswer } from '@/features/interviews/evaluator';
import { pickMockQuestions, sessionReport } from '@/features/interviews/mock';
import { buildSubmitRequest, runStaticChecks, summarizeSubmission } from '@/features/playground/evaluation';
import { staticDiagnostics } from '@/services/execution/simulation';
import { normalizeOutput, type ExecutionResponse } from '@/services/execution/types';
import { attempt } from '@/test-utils/fixtures';
import type { CodingChallenge } from '@/types/curriculum';
import type { BugHunt, Incident, InterviewQuestion } from '@/types/practice';

const question: InterviewQuestion = {
  id: 'q1',
  moduleId: 'collections',
  lessonIds: ['c-hashmap'],
  kind: 'internals',
  difficulty: 'intermediate',
  prompt: 'How does HashMap work?',
  rubric: [
    { id: 'hash', label: 'Uses hashCode to pick a bucket', weight: 2, matchers: ['hash\\s*code', 'hashcode'], tip: 'Mention hashCode.' },
    { id: 'equals', label: 'Uses equals within a bucket', weight: 1, matchers: ['equals'], tip: 'Mention equals.' },
    { id: 'resize', label: 'Resizes at the load factor', weight: 1, matchers: ['resiz', 'load factor'], tip: 'Mention resizing.' },
  ],
  misconceptions: [{ id: 'ts', pattern: 'hashmap is thread[- ]safe', correction: 'HashMap is not thread-safe.' }],
  modelAnswer: 'model',
  followUps: ['What changed in Java 8?'],
};

describe('interview rubric evaluator', () => {
  it('reports covered, missing, inaccuracies and a follow-up', () => {
    const f = evaluateWrittenAnswer(
      question,
      'It computes the hashCode of the key to choose a bucket, then compares keys with equals inside that bucket. Also HashMap is thread-safe in most cases which is good.',
    );
    expect(f.covered.map((p) => p.id)).toEqual(['hash', 'equals']);
    expect(f.missing.map((p) => p.id)).toEqual(['resize']);
    expect(f.inaccuracies).toHaveLength(1);
    expect(f.score).toBeCloseTo(0.75 - 0.15);
    expect(f.followUp).toBe('What changed in Java 8?');
    expect(f.improvements[0]).toMatch(/inaccurate/);
  });

  it('caps very short answers', () => {
    expect(evaluateWrittenAnswer(question, 'hashCode equals resize').score).toBeLessThanOrEqual(0.4);
  });

  it('does not flag a correct negation as a misconception', () => {
    const f = evaluateWrittenAnswer(question, 'HashMap is not thread-safe, so under concurrency you use ConcurrentHashMap instead of it today.');
    expect(f.inaccuracies).toHaveLength(0);
  });
});

describe('mock interview picker', () => {
  const bank: InterviewQuestion[] = ['a', 'b', 'c', 'd'].map((id, i) => ({
    ...question,
    id,
    kind: i % 2 === 0 ? 'conceptual' : 'output',
    moduleId: i < 3 ? 'collections' : 'oop',
  }));

  it('filters by topic and prefers questions not yet answered well', () => {
    const attempts = [attempt({ itemId: 'a', itemType: 'interview', score: 1 })];
    const picked = pickMockQuestions(bank, attempts, { moduleIds: ['collections'], difficulty: 'mixed', count: 2 }, 42);
    expect(picked).toHaveLength(2);
    expect(picked.map((q) => q.id)).not.toContain('a');
    expect(picked.every((q) => q.moduleId === 'collections')).toBe(true);
  });

  it('is deterministic for a seed and interleaves kinds', () => {
    const one = pickMockQuestions(bank, [], { moduleIds: [], difficulty: 'mixed', count: 4 }, 7);
    const two = pickMockQuestions(bank, [], { moduleIds: [], difficulty: 'mixed', count: 4 }, 7);
    expect(one.map((q) => q.id)).toEqual(two.map((q) => q.id));
    expect(one[0]!.kind).not.toBe(one[1]!.kind);
  });

  it('summarises a session', () => {
    const r = sessionReport(bank.slice(0, 2), { a: 0.9, b: 0.3 });
    expect(r.average).toBeCloseTo(0.6);
    expect(r.strongest.map((q) => q.id)).toEqual(['a']);
    expect(r.weakest.map((q) => q.id)).toEqual(['b']);
  });
});

const challenge = {
  id: 'ch',
  tests: [
    { id: 't1', name: 'a', stdin: '', expectedStdout: '1' },
    { id: 't2', name: 'b', stdin: '', expectedStdout: '2', hidden: true },
  ],
  staticChecks: [{ id: 'no-sort', description: 'No Arrays.sort', pattern: 'Arrays\\.sort', mustMatch: false }],
} as unknown as CodingChallenge;

const remote = (passed: boolean[]): ExecutionResponse => ({
  mode: 'remote',
  compile: { success: true, diagnostics: [], timeMs: 1 },
  tests: passed.map((p, i) => ({ id: `t${i + 1}`, passed: p, stdout: '', stderr: '', exitCode: 0, timeMs: 1, timedOut: false, outputTruncated: false })),
});

describe('challenge evaluation', () => {
  it('passes only when every test passes on a real runtime and constraints hold', () => {
    expect(summarizeSubmission(remote([true, true]), challenge, 'code').passed).toBe(true);
    expect(summarizeSubmission(remote([true, false]), challenge, 'code').passed).toBe(false);
    expect(summarizeSubmission(remote([true, true]), challenge, 'Arrays.sort(a)').passed).toBe(false);
  });

  it('never passes in simulation mode', () => {
    const sim: ExecutionResponse = { mode: 'simulation', compile: { success: true, diagnostics: [], timeMs: 0 } };
    const s = summarizeSubmission(sim, challenge, 'code');
    expect(s.passed).toBe(false);
    expect(s.verified).toBe(false);
  });

  it('sends every test, including hidden ones', () => {
    expect(buildSubmitRequest('x', challenge).testCases).toHaveLength(2);
  });

  it('evaluates static checks', () => {
    expect(runStaticChecks(challenge, 'Arrays.sort(x)')[0]!.passed).toBe(false);
  });

  it('normalises trailing whitespace like the execution service', () => {
    expect(normalizeOutput('a  \r\nb\n\n')).toBe('a\nb');
  });
});

describe('simulation static diagnostics', () => {
  it('accepts a well-formed program', () => {
    const ok = 'public class Main {\n  public static void main(String[] a) {\n    System.out.println("}{");\n  }\n}';
    expect(staticDiagnostics(ok, 'Main').filter((d) => d.severity === 'error')).toEqual([]);
  });

  it('reports an unclosed brace with its line', () => {
    const bad = 'public class Main {\n  public static void main(String[] a) {\n    int x = 1;\n}';
    const errors = staticDiagnostics(bad, 'Main').filter((d) => d.severity === 'error');
    expect(errors[0]!.message).toMatch(/never closed/);
    expect(errors[0]!.line).toBe(1);
  });

  it('reports an unterminated string and a missing Main class', () => {
    const d = staticDiagnostics('class App { String s = "oops; }', 'Main');
    expect(d.some((x) => /Unterminated/.test(x.message))).toBe(true);
    expect(d.some((x) => /No class named Main/.test(x.message))).toBe(true);
  });
});

describe('bug hunt and incident scoring', () => {
  const hunt = { buggyLines: [4, 5], correctRootCauseId: 'r', correctFixId: 'f' } as unknown as BugHunt;

  it('gives full marks only for exact lines, cause and fix', () => {
    expect(scoreBugHunt(hunt, [4, 5], 'r', 'f').score).toBeCloseTo(1);
    expect(scoreBugHunt(hunt, [4], 'r', 'f').location).toBeCloseTo(0.5);
    // Selecting everything does not earn location credit.
    expect(scoreBugHunt(hunt, Array.from({ length: 20 }, (_, i) => i + 1), 'x', 'f').location).toBeCloseTo(0.1);
  });

  const incident = {
    timeBudgetMinutes: 30,
    correctHypothesisId: 'h',
    actions: [
      { id: 'a', costMinutes: 10, useful: true },
      { id: 'b', costMinutes: 30, useful: false },
    ],
    fixes: [
      { id: 'good', correct: true },
      { id: 'bad', correct: false },
    ],
  } as unknown as Incident;

  it('rewards focused investigations', () => {
    const focused = scoreIncident(incident, ['a'], 'h', 'good');
    const scattered = scoreIncident(incident, ['a', 'b'], 'h', 'good');
    expect(focused.score).toBeCloseTo(1);
    expect(scattered.score).toBeLessThan(focused.score);
    expect(scoreIncident(incident, ['a'], 'x', 'bad').score).toBeCloseTo(0.2);
  });
});

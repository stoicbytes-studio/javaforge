import { INTERVIEW_QUESTIONS } from '@/content';
import { evaluateWrittenAnswer } from '@/features/interviews/evaluator';

/** Calibrates the rubric matchers against the model answers. */
describe('interview rubric calibration', () => {
  const written = INTERVIEW_QUESTIONS.filter((q) => (q.rubric?.length ?? 0) > 0);

  it.each(written.map((q) => [q.id, q] as const))('%s: the model answer scores at least 80%% with no inaccuracies', (_id, q) => {
    const f = evaluateWrittenAnswer(q, q.modelAnswer);
    expect(f.inaccuracies).toEqual([]);
    expect(f.score).toBeGreaterThanOrEqual(0.8);
  });

  it.each(written.map((q) => [q.id, q] as const))('%s: a vague answer scores low', (_id, q) => {
    const f = evaluateWrittenAnswer(q, 'It depends on the situation and you should follow best practices to make sure everything works well in the end.');
    expect(f.score).toBeLessThan(0.35);
  });
});

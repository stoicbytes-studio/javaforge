import type { InterviewQuestion, RubricPoint } from '@/types/practice';

/**
 * Transparent rubric-based evaluator for written interview answers.
 *
 * This is deterministic concept matching, NOT an AI model: each rubric point
 * lists phrases that indicate the concept was covered, and each known
 * misconception has a pattern that flags an inaccurate claim. The UI shows
 * exactly which points matched so the learner can judge the evaluation.
 */

export interface InterviewFeedback {
  score: number;
  covered: RubricPoint[];
  missing: RubricPoint[];
  inaccuracies: { claim: string; correction: string }[];
  improvements: string[];
  modelAnswer: string;
  followUp?: string;
  wordCount: number;
}

export const MISCONCEPTION_PENALTY = 0.15;
export const MIN_WORDS = 15;

function safeRegex(source: string): RegExp | null {
  try {
    return new RegExp(source, 'i');
  } catch {
    return null;
  }
}

export function normalizeAnswer(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/[‘’]/g, "'").trim();
}

export function evaluateWrittenAnswer(question: InterviewQuestion, rawAnswer: string, followUpIndex = 0): InterviewFeedback {
  const answer = normalizeAnswer(rawAnswer);
  const wordCount = answer.length === 0 ? 0 : answer.split(' ').length;
  const rubric = question.rubric ?? [];

  const covered: RubricPoint[] = [];
  const missing: RubricPoint[] = [];
  for (const point of rubric) {
    const hit = point.matchers.some((m) => safeRegex(m)?.test(answer));
    (hit ? covered : missing).push(point);
  }

  const inaccuracies: InterviewFeedback['inaccuracies'] = [];
  for (const mis of question.misconceptions ?? []) {
    const match = safeRegex(mis.pattern)?.exec(answer);
    if (match) inaccuracies.push({ claim: match[0], correction: mis.correction });
  }

  const totalWeight = rubric.reduce((s, p) => s + p.weight, 0) || 1;
  const coveredWeight = covered.reduce((s, p) => s + p.weight, 0);
  let score = coveredWeight / totalWeight - inaccuracies.length * MISCONCEPTION_PENALTY;
  if (wordCount < MIN_WORDS) score = Math.min(score, 0.4);
  score = Math.max(0, Math.min(1, score));

  const improvements = missing
    .sort((a, b) => b.weight - a.weight)
    .map((p) => p.tip);
  if (wordCount < MIN_WORDS) {
    improvements.unshift('Your answer is very short. Interviewers expect a definition, the reasoning behind it and an example.');
  }
  if (inaccuracies.length > 0) {
    improvements.unshift('Correct the inaccurate statement(s) first; a confident wrong claim costs more than an omission.');
  }

  const followUps = question.followUps;
  return {
    score,
    covered,
    missing,
    inaccuracies,
    improvements,
    modelAnswer: question.modelAnswer,
    followUp: followUps.length > 0 ? followUps[followUpIndex % followUps.length] : undefined,
    wordCount,
  };
}

/** Interview answers count as "correct" for streaks and goals at 60%+. */
export const INTERVIEW_PASS_SCORE = 0.6;

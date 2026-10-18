import type { MasterySnapshot } from '@/features/progress/mastery';

export interface InterviewReadiness {
  /** 0..1, or null when there is not enough evidence to estimate. */
  score: number | null;
  level: 'Not enough evidence' | 'Early' | 'Developing' | 'Solid' | 'Strong';
  answered: number;
  explanation: string;
}

export const MIN_ANSWERS_FOR_ESTIMATE = 5;

/**
 * An estimate of interview *practice* readiness, combining how well the
 * learner explains concepts with demonstrated coding and debugging. It is
 * deliberately not a hiring verdict and requires a minimum amount of evidence.
 */
export function interviewReadiness(mastery: MasterySnapshot): InterviewReadiness {
  const answered = mastery.dimensionEvidence.interview;
  if (answered < MIN_ANSWERS_FOR_ESTIMATE) {
    return {
      score: null,
      level: 'Not enough evidence',
      answered,
      explanation: `Answer at least ${MIN_ANSWERS_FOR_ESTIMATE} interview questions to get an estimate (${answered} so far).`,
    };
  }
  const score =
    0.5 * mastery.dimensions.interview + 0.25 * mastery.dimensions.coding + 0.25 * mastery.dimensions.debugging;
  const level = score < 0.4 ? 'Early' : score < 0.65 ? 'Developing' : score < 0.8 ? 'Solid' : 'Strong';
  return {
    score,
    level,
    answered,
    explanation: `Based on ${answered} interview answers (50%), independent coding (25%) and debugging (25%).`,
  };
}

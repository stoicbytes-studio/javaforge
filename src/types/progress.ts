import type { MasteryDimension } from './curriculum';

/** Private, user-owned learning records. */

export type AttemptItemType =
  | 'check'
  | 'challenge'
  | 'interview'
  | 'bug-hunt'
  | 'incident'
  | 'revision';

export interface Attempt {
  id: string;
  itemType: AttemptItemType;
  itemId: string;
  lessonId?: string;
  moduleId?: string;
  dimension: MasteryDimension;
  correct: boolean;
  /** 0..1 quality of the attempt before hint/verification adjustments. */
  score: number;
  hintsUsed: number;
  /**
   * False when the result could not be verified, e.g. a coding attempt that
   * ran in simulation mode instead of a real Java runtime.
   */
  verified: boolean;
  at: number;
}

export type RevisionGrade = 'again' | 'hard' | 'good' | 'easy';

export type RevisionSource =
  | { kind: 'prompt'; lessonId: string; promptId: string }
  | { kind: 'check'; lessonId: string; checkId: string };

export interface RevisionCard {
  id: string;
  source: RevisionSource;
  ease: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: number;
  createdAt: number;
  lastReviewedAt?: number;
  lastGrade?: RevisionGrade;
}

export interface Note {
  text: string;
  updatedAt: number;
}

export interface InterviewSessionRecord {
  id: string;
  startedAt: number;
  finishedAt?: number;
  questionIds: string[];
  timed: boolean;
  /** questionId -> 0..1 */
  scores: Record<string, number>;
}

export interface IncidentRun {
  incidentId: string;
  at: number;
  actionsTaken: string[];
  minutesUsed: number;
  hypothesisCorrect: boolean;
  fixCorrect: boolean;
  score: number;
}

export type DailyMinutes = 15 | 30 | 60 | 90;
export type ThemePreference = 'system' | 'dark' | 'light';
export type MotionPreference = 'system' | 'reduce' | 'full';
export type ExecutionMode = 'auto' | 'remote' | 'simulation';

export interface Settings {
  theme: ThemePreference;
  motion: MotionPreference;
  dailyMinutes: DailyMinutes;
  executionMode: ExecutionMode;
  /** Optional override; defaults to EXPO_PUBLIC_EXECUTOR_URL. */
  executorUrl?: string;
  displayName?: string;
}

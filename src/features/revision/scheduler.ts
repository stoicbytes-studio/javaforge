import { addDays, MINUTE } from '@/lib/time';
import type { RevisionCard, RevisionGrade, RevisionSource } from '@/types/progress';

/**
 * Spaced repetition scheduler (a simplified SM-2).
 *
 * - New cards become due one day after they are created, so the first review
 *   is a genuine delayed recall, not an immediate re-read.
 * - "again" resets the card and brings it back in 10 minutes.
 * - Successful reviews grow the interval by the card's ease factor.
 */

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_INTERVAL_DAYS = 180;
export const RELEARN_DELAY_MS = 10 * MINUTE;

export function cardIdFor(source: RevisionSource): string {
  return source.kind === 'prompt'
    ? `prompt:${source.lessonId}:${source.promptId}`
    : `check:${source.lessonId}:${source.checkId}`;
}

export function createCard(source: RevisionSource, now: number): RevisionCard {
  return {
    id: cardIdFor(source),
    source,
    ease: INITIAL_EASE,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    dueAt: addDays(now, 1),
    createdAt: now,
  };
}

export function reviewCard(card: RevisionCard, grade: RevisionGrade, now: number): RevisionCard {
  if (grade === 'again') {
    return {
      ...card,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      intervalDays: 0,
      repetitions: 0,
      lapses: card.lapses + 1,
      dueAt: now + RELEARN_DELAY_MS,
      lastReviewedAt: now,
      lastGrade: grade,
    };
  }

  let ease = card.ease;
  let interval: number;
  if (grade === 'hard') {
    ease = Math.max(MIN_EASE, ease - 0.15);
    interval = Math.max(1, Math.round(card.intervalDays * 1.2));
  } else if (grade === 'good') {
    interval = card.repetitions === 0 ? 1 : card.repetitions === 1 ? 3 : Math.round(card.intervalDays * ease);
  } else {
    ease = ease + 0.15;
    interval =
      card.repetitions === 0 ? 3 : card.repetitions === 1 ? 6 : Math.round(card.intervalDays * ease * 1.3);
  }
  interval = Math.min(MAX_INTERVAL_DAYS, Math.max(1, interval));

  return {
    ...card,
    ease,
    intervalDays: interval,
    repetitions: card.repetitions + 1,
    dueAt: addDays(now, interval),
    lastReviewedAt: now,
    lastGrade: grade,
  };
}

export function dueCards(cards: RevisionCard[], now: number): RevisionCard[] {
  return cards.filter((c) => c.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
}

/** Score recorded as an attempt for the retention dimension. */
export function gradeScore(grade: RevisionGrade): number {
  switch (grade) {
    case 'again':
      return 0;
    case 'hard':
      return 0.6;
    case 'good':
      return 0.9;
    case 'easy':
      return 1;
  }
}

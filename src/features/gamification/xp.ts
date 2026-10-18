import { attemptQuality, itemKey } from '@/features/progress/mastery';
import type { Attempt, AttemptItemType } from '@/types/progress';

/**
 * Experience points are derived from attempts — they are never stored or
 * granted for reading, clicking or time spent. Each assessable item pays
 * out once, at the best quality the learner has demonstrated on it, so
 * re-answering the same question cannot farm XP. Successful spaced
 * repetition reviews each pay a small amount because every one is a fresh
 * act of delayed recall.
 */

export const BASE_XP: Record<AttemptItemType, number> = {
  check: 10,
  challenge: 50,
  interview: 30,
  'bug-hunt': 40,
  incident: 100,
  revision: 4,
};

export type XpBaseResolver = (attempt: Attempt) => number;

export const defaultXpBase: XpBaseResolver = (attempt) => BASE_XP[attempt.itemType];

export interface XpBreakdown {
  total: number;
  byType: Record<AttemptItemType, number>;
}

export function computeXp(attempts: Attempt[], baseFor: XpBaseResolver = defaultXpBase): XpBreakdown {
  const best = new Map<string, { attempt: Attempt; quality: number }>();
  const byType: Record<AttemptItemType, number> = {
    check: 0,
    challenge: 0,
    interview: 0,
    'bug-hunt': 0,
    incident: 0,
    revision: 0,
  };
  let total = 0;

  for (const attempt of attempts) {
    if (!attempt.correct) continue;
    const quality = attemptQuality(attempt);
    if (attempt.itemType === 'revision') {
      const xp = Math.round(baseFor(attempt) * quality);
      byType.revision += xp;
      total += xp;
      continue;
    }
    const key = itemKey(attempt.itemType, attempt.itemId);
    const prev = best.get(key);
    if (!prev || quality > prev.quality) best.set(key, { attempt, quality });
  }

  for (const { attempt, quality } of best.values()) {
    const xp = Math.round(baseFor(attempt) * quality);
    byType[attempt.itemType] += xp;
    total += xp;
  }
  return { total, byType };
}

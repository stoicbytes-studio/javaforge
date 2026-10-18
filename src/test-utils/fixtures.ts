import type { Attempt } from '@/types/progress';

let n = 0;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const NOW = new Date('2026-10-14T12:00:00').getTime(); // a Wednesday

export function attempt(partial: Partial<Attempt> & Pick<Attempt, 'itemId'>): Attempt {
  n += 1;
  return {
    id: `a${n}`,
    itemType: 'check',
    dimension: 'conceptual',
    correct: true,
    score: 1,
    hintsUsed: 0,
    verified: true,
    at: NOW,
    ...partial,
  };
}

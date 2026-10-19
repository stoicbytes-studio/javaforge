import type { LessonConcepts } from '@/types/curriculum';

import { fundamentalsConcepts } from './01-fundamentals';

/** Concept pages for every lesson, keyed by lesson id. */
export const CONCEPTS: Record<string, LessonConcepts> = {
  ...fundamentalsConcepts,
};

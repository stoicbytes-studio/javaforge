import type { LessonConcepts } from '@/types/curriculum';

import { fundamentalsConcepts } from './01-fundamentals';
import { oopConcepts } from './03-oop';
import { oopMoreConcepts } from './03-oop-more';
import { ioConcepts } from './10-io';
import { jdbcConcepts } from './11-jdbc';
import { testingConcepts } from './12-testing';
import { designConcepts } from './13-design';
import { dsaConcepts } from './14-dsa';
import { springConcepts } from './15-spring';
import { performanceConcepts } from './16-performance';
import { productionConcepts } from './17-production';

/** Concept pages for every lesson, keyed by lesson id. */
export const CONCEPTS: Record<string, LessonConcepts> = {
  ...fundamentalsConcepts,
  ...oopConcepts,
  ...oopMoreConcepts,
  ...ioConcepts,
  ...jdbcConcepts,
  ...testingConcepts,
  ...designConcepts,
  ...dsaConcepts,
  ...springConcepts,
  ...performanceConcepts,
  ...productionConcepts,
};

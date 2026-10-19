import type { LessonConcepts } from '@/types/curriculum';

import { fundamentalsConcepts } from './01-fundamentals';
import { platformConcepts } from './02-platform';
import { oopConcepts } from './03-oop';
import { oopMoreConcepts } from './03-oop-more';
import { typesConcepts } from './04-types';
import { exceptionsConcepts } from './05-exceptions';
import { collectionsConcepts } from './06-collections';
import { functionalConcepts } from './07-functional';
import { jvmRuntimeConcepts } from './08-jvm-runtime';
import { concurrencyConcepts } from './09-concurrency';
import { ioConcepts } from './10-io';
import { jdbcConcepts } from './11-jdbc';
import { testingConcepts } from './12-testing';
import { designConcepts } from './13-design';
import { dsaConcepts } from './14-dsa';
import { springConcepts } from './15-spring';
import { performanceConcepts } from './16-performance';
import { productionConcepts } from './17-production';
import { asyncParallelConcepts } from './extra-async-parallel';
import { immutabilityBuildConcepts } from './extra-immutability-build';
import { numbersTimeConcepts } from './extra-numbers-time';
import { qualitySpringTestingConcepts } from './extra-quality-spring-testing';
import { regexReflectionConcepts } from './extra-regex-reflection';
import { serializationNioConcepts } from './extra-serialization-nio';

/** Concept pages for every lesson, keyed by lesson id. */
export const CONCEPTS: Record<string, LessonConcepts> = {
  ...fundamentalsConcepts,
  ...platformConcepts,
  ...oopConcepts,
  ...oopMoreConcepts,
  ...typesConcepts,
  ...exceptionsConcepts,
  ...collectionsConcepts,
  ...functionalConcepts,
  ...jvmRuntimeConcepts,
  ...concurrencyConcepts,
  ...ioConcepts,
  ...jdbcConcepts,
  ...testingConcepts,
  ...designConcepts,
  ...dsaConcepts,
  ...springConcepts,
  ...performanceConcepts,
  ...productionConcepts,
  ...numbersTimeConcepts,
  ...regexReflectionConcepts,
  ...immutabilityBuildConcepts,
  ...serializationNioConcepts,
  ...asyncParallelConcepts,
  ...qualitySpringTestingConcepts,
};

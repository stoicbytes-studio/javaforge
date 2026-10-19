import type { Lesson } from '@/types/curriculum';

import { asyncParallelLessons } from './async-parallel';
import { immutabilityBuildLessons } from './immutability-build';
import { jitLessons } from './jit';
import { numbersTimeLessons } from './numbers-time';
import { qualitySpringTestingLessons } from './quality-spring-testing';
import { regexReflectionLessons } from './regex-reflection';
import { serializationNioLessons } from './serialization-nio';

/** Lessons written after their module files; each is appended to the module named by its moduleId. */
export const EXTRA_LESSONS: Lesson[] = [
  ...numbersTimeLessons,
  ...regexReflectionLessons,
  ...immutabilityBuildLessons,
  ...serializationNioLessons,
  ...jitLessons,
  ...asyncParallelLessons,
  ...qualitySpringTestingLessons,
];

import type { MemoryAid } from '@/types/curriculum';

import { fundamentalsMemory } from './01-fundamentals';
import { platformMemory } from './02-platform';
import { oopMemory } from './03-oop';
import { oopMoreMemory } from './03-oop-more';
import { typesMemory } from './04-types';
import { exceptionsMemory } from './05-exceptions';
import { collectionsMemory } from './06-collections';
import { functionalMemory } from './07-functional';
import { jvmRuntimeMemory } from './08-jvm-runtime';
import { concurrencyMemory } from './09-concurrency';
import { ioMemory } from './10-io';
import { jdbcMemory } from './11-jdbc';
import { testingMemory } from './12-testing';
import { designMemory } from './13-design';
import { dsaMemory } from './14-dsa';
import { springMemory } from './15-spring';
import { performanceMemory } from './16-performance';
import { productionMemory } from './17-production';
import { asyncParallelMemory } from './extra-async-parallel';
import { immutabilityBuildMemory } from './extra-immutability-build';
import { jitMemory } from './extra-jit';
import { numbersTimeMemory } from './extra-numbers-time';
import { qualitySpringTestingMemory } from './extra-quality-spring-testing';
import { regexReflectionMemory } from './extra-regex-reflection';
import { serializationNioMemory } from './extra-serialization-nio';

/** "Make it stick" memory aids for every lesson, keyed by lesson id. */
export const MEMORY: Record<string, MemoryAid> = {
  ...fundamentalsMemory,
  ...platformMemory,
  ...oopMemory,
  ...oopMoreMemory,
  ...typesMemory,
  ...exceptionsMemory,
  ...collectionsMemory,
  ...functionalMemory,
  ...jvmRuntimeMemory,
  ...concurrencyMemory,
  ...ioMemory,
  ...jdbcMemory,
  ...testingMemory,
  ...designMemory,
  ...dsaMemory,
  ...springMemory,
  ...performanceMemory,
  ...productionMemory,
  ...asyncParallelMemory,
  ...immutabilityBuildMemory,
  ...jitMemory,
  ...numbersTimeMemory,
  ...qualitySpringTestingMemory,
  ...regexReflectionMemory,
  ...serializationNioMemory,
};

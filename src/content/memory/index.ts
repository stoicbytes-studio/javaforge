import type { MemoryAid } from '@/types/curriculum';

import { fundamentalsMemory } from './01-fundamentals';

/** "Make it stick" memory aids for every lesson, keyed by lesson id. */
export const MEMORY: Record<string, MemoryAid> = {
  ...fundamentalsMemory,
};

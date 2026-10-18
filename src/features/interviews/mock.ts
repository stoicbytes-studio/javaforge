import type { Difficulty } from '@/types/curriculum';
import type { Attempt } from '@/types/progress';
import type { InterviewQuestion } from '@/types/practice';

export interface MockConfig {
  moduleIds: string[];
  difficulty: Difficulty | 'mixed';
  count: number;
}

/** Deterministic PRNG so a seed reproduces the same interview (useful for tests). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a mock interview: questions the learner has not answered well come
 * first, kinds are interleaved so the session mixes explanation, output
 * prediction, debugging and scenarios, and ties are broken randomly.
 */
export function pickMockQuestions(
  bank: InterviewQuestion[],
  attempts: Attempt[],
  config: MockConfig,
  seed = Date.now(),
): InterviewQuestion[] {
  const rand = mulberry32(seed);
  const best = new Map<string, number>();
  for (const a of attempts) {
    if (a.itemType !== 'interview') continue;
    best.set(a.itemId, Math.max(best.get(a.itemId) ?? 0, a.score));
  }
  const pool = bank.filter(
    (q) =>
      (config.moduleIds.length === 0 || config.moduleIds.includes(q.moduleId)) &&
      (config.difficulty === 'mixed' || q.difficulty === config.difficulty),
  );
  const ranked = pool
    .map((q) => ({ q, need: 1 - (best.get(q.id) ?? 0), r: rand() }))
    .sort((a, b) => b.need - a.need || a.r - b.r);

  // Round-robin across kinds so one kind cannot dominate the session.
  const byKind = new Map<string, InterviewQuestion[]>();
  for (const { q } of ranked) {
    const list = byKind.get(q.kind) ?? [];
    list.push(q);
    byKind.set(q.kind, list);
  }
  const result: InterviewQuestion[] = [];
  const queues = [...byKind.values()];
  while (result.length < config.count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < config.count) result.push(next);
    }
  }
  return result;
}

export interface SessionReport {
  average: number;
  answered: number;
  strongest: InterviewQuestion[];
  weakest: InterviewQuestion[];
  weakModules: string[];
}

export function sessionReport(questions: InterviewQuestion[], scores: Record<string, number>): SessionReport {
  const answered = questions.filter((q) => scores[q.id] !== undefined);
  const average = answered.length ? answered.reduce((s, q) => s + scores[q.id]!, 0) / answered.length : 0;
  const sorted = [...answered].sort((a, b) => scores[b.id]! - scores[a.id]!);
  const weakest = sorted.filter((q) => scores[q.id]! < 0.6).reverse();
  return {
    average,
    answered: answered.length,
    strongest: sorted.filter((q) => scores[q.id]! >= 0.75).slice(0, 3),
    weakest: weakest.slice(0, 3),
    weakModules: [...new Set(weakest.map((q) => q.moduleId))],
  };
}

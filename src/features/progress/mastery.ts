import type { CurriculumModule, MasteryDimension } from '@/types/curriculum';
import type { Attempt, AttemptItemType, RevisionCard } from '@/types/progress';

/**
 * Mastery model
 * -------------
 * Mastery is evidence of demonstrated ability, never of time spent or pages
 * opened. Each assessable item (knowledge check, challenge, interview
 * question, bug hunt, incident) gets an item score from its attempts:
 *
 *   quality  = score × hintFactor × verificationFactor
 *   itemScore = exponentially weighted average of quality (α = 0.7)
 *
 * so a single unaided correct answer is worth 0.70, two in a row 0.91 and
 * three 0.97. Later failures pull the score back down. Unattempted items
 * count as 0, which means mastery cannot be reached by skipping.
 *
 * Retention comes from spaced-repetition cards: a card's strength grows with
 * the interval it has successfully survived (21 days = full strength).
 */

export const EWMA_ALPHA = 0.7;
export const HINT_PENALTY = 0.15;
export const MIN_HINT_FACTOR = 0.5;
export const UNVERIFIED_FACTOR = 0.5;
export const RETENTION_FULL_INTERVAL_DAYS = 21;

export const DIMENSIONS: MasteryDimension[] = [
  'conceptual',
  'coding',
  'debugging',
  'runtime',
  'interview',
  'retention',
];

export const DIMENSION_LABELS: Record<MasteryDimension, string> = {
  conceptual: 'Conceptual understanding',
  coding: 'Independent coding',
  debugging: 'Debugging',
  runtime: 'Runtime knowledge',
  interview: 'Interview communication',
  retention: 'Long-term retention',
};

/** An assessable item from the content catalog. */
export interface CatalogItem {
  itemType: AttemptItemType;
  itemId: string;
  moduleId: string;
  lessonId?: string;
  dimension: MasteryDimension;
}

export function hintFactor(hintsUsed: number): number {
  return Math.max(MIN_HINT_FACTOR, 1 - HINT_PENALTY * Math.max(0, hintsUsed));
}

export function attemptQuality(attempt: Attempt): number {
  const base = Math.min(1, Math.max(0, attempt.score));
  return base * hintFactor(attempt.hintsUsed) * (attempt.verified ? 1 : UNVERIFIED_FACTOR);
}

export function itemScore(attempts: Attempt[]): number {
  const ordered = [...attempts].sort((a, b) => a.at - b.at);
  let score = 0;
  for (const attempt of ordered) {
    score = EWMA_ALPHA * attemptQuality(attempt) + (1 - EWMA_ALPHA) * score;
  }
  return score;
}

export function cardStrength(card: RevisionCard): number {
  if (card.repetitions === 0 || card.lastGrade === 'again') return 0;
  return Math.min(1, card.intervalDays / RETENTION_FULL_INTERVAL_DAYS);
}

export function itemKey(itemType: AttemptItemType, itemId: string): string {
  return `${itemType}:${itemId}`;
}

export function groupAttempts(attempts: Attempt[]): Map<string, Attempt[]> {
  const map = new Map<string, Attempt[]>();
  for (const attempt of attempts) {
    if (attempt.itemType === 'revision') continue;
    const key = itemKey(attempt.itemType, attempt.itemId);
    const list = map.get(key);
    if (list) list.push(attempt);
    else map.set(key, [attempt]);
  }
  return map;
}

export type DimensionScores = Partial<Record<MasteryDimension, number>>;

export interface MasterySnapshot {
  overall: number;
  dimensions: Record<MasteryDimension, number>;
  /** Number of items (or cards) behind each dimension — 0 means "no evidence yet". */
  dimensionEvidence: Record<MasteryDimension, number>;
  lessons: Record<string, { mastery: number; dimensions: DimensionScores }>;
  modules: Record<string, number>;
  itemScores: Record<string, number>;
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;
}

export function computeMastery(
  modules: CurriculumModule[],
  catalog: CatalogItem[],
  attempts: Attempt[],
  cards: RevisionCard[],
): MasterySnapshot {
  const grouped = groupAttempts(attempts);
  const itemScores: Record<string, number> = {};
  for (const item of catalog) {
    const key = itemKey(item.itemType, item.itemId);
    itemScores[key] = itemScore(grouped.get(key) ?? []);
  }

  // Per-lesson dimension scores (items attached to a lesson + its revision cards).
  const lessonBuckets = new Map<string, Map<MasteryDimension, number[]>>();
  const bucket = (lessonId: string, dimension: MasteryDimension, value: number) => {
    let dims = lessonBuckets.get(lessonId);
    if (!dims) lessonBuckets.set(lessonId, (dims = new Map()));
    const list = dims.get(dimension);
    if (list) list.push(value);
    else dims.set(dimension, [value]);
  };
  for (const item of catalog) {
    if (item.lessonId) bucket(item.lessonId, item.dimension, itemScores[itemKey(item.itemType, item.itemId)] ?? 0);
  }
  for (const card of cards) bucket(card.source.lessonId, 'retention', cardStrength(card));

  const lessons: MasterySnapshot['lessons'] = {};
  const modulesOut: Record<string, number> = {};
  const allLessonMastery: number[] = [];
  for (const mod of modules) {
    const lessonValues: number[] = [];
    for (const lesson of mod.lessons) {
      const dims = lessonBuckets.get(lesson.id);
      const dimensionScores: DimensionScores = {};
      if (dims) for (const [dim, values] of dims) dimensionScores[dim] = mean(values);
      const mastery = mean(Object.values(dimensionScores) as number[]);
      lessons[lesson.id] = { mastery, dimensions: dimensionScores };
      lessonValues.push(mastery);
      allLessonMastery.push(mastery);
    }
    modulesOut[mod.id] = mean(lessonValues);
  }

  const dimensions = {} as Record<MasteryDimension, number>;
  const dimensionEvidence = {} as Record<MasteryDimension, number>;
  for (const dim of DIMENSIONS) {
    if (dim === 'retention') {
      dimensions[dim] = mean(cards.map(cardStrength));
      dimensionEvidence[dim] = cards.filter((c) => c.repetitions > 0).length;
      continue;
    }
    const items = catalog.filter((i) => i.dimension === dim);
    const attempted = items.filter((i) => grouped.has(itemKey(i.itemType, i.itemId)));
    // Global dimension scores are measured over what the learner has been
    // exposed to so far; unattempted items are reflected in lesson/module mastery.
    dimensions[dim] = mean(attempted.map((i) => itemScores[itemKey(i.itemType, i.itemId)] ?? 0));
    dimensionEvidence[dim] = attempted.length;
  }

  return {
    overall: mean(allLessonMastery),
    dimensions,
    dimensionEvidence,
    lessons,
    modules: modulesOut,
    itemScores,
  };
}

export interface LessonCompletion {
  attempted: number;
  total: number;
  correct: number;
  complete: boolean;
}

/**
 * A lesson is complete when every knowledge check has been attempted and at
 * least 70% of the latest answers are correct. Completion is not mastery.
 */
export function lessonCompletion(checkIds: string[], attempts: Attempt[]): LessonCompletion {
  const latest = new Map<string, Attempt>();
  for (const a of attempts) {
    if (a.itemType !== 'check' || !checkIds.includes(a.itemId)) continue;
    const prev = latest.get(a.itemId);
    if (!prev || prev.at <= a.at) latest.set(a.itemId, a);
  }
  const correct = [...latest.values()].filter((a) => a.correct).length;
  const total = checkIds.length;
  return {
    attempted: latest.size,
    total,
    correct,
    complete: total > 0 && latest.size === total && correct / total >= 0.7,
  };
}

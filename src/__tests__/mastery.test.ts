import { createCard, reviewCard } from '@/features/revision/scheduler';
import {
  attemptQuality,
  cardStrength,
  computeMastery,
  hintFactor,
  itemScore,
  lessonCompletion,
  type CatalogItem,
} from '@/features/progress/mastery';
import { attempt, DAY_MS, NOW } from '@/test-utils/fixtures';
import type { CurriculumModule, Lesson } from '@/types/curriculum';

const lesson = (id: string, moduleId: string): Lesson =>
  ({ id, moduleId, checks: [], revision: [], prerequisites: [] }) as unknown as Lesson;

const modules: CurriculumModule[] = [
  { id: 'm1', order: 1, lessons: [lesson('l1', 'm1'), lesson('l2', 'm1')] } as unknown as CurriculumModule,
];

const catalog: CatalogItem[] = [
  { itemType: 'check', itemId: 'c1', lessonId: 'l1', moduleId: 'm1', dimension: 'conceptual' },
  { itemType: 'check', itemId: 'c2', lessonId: 'l1', moduleId: 'm1', dimension: 'runtime' },
  { itemType: 'challenge', itemId: 'ch1', lessonId: 'l1', moduleId: 'm1', dimension: 'coding' },
  { itemType: 'check', itemId: 'c3', lessonId: 'l2', moduleId: 'm1', dimension: 'conceptual' },
];

describe('attempt quality', () => {
  it('penalises hints but never below the floor', () => {
    expect(hintFactor(0)).toBe(1);
    expect(hintFactor(2)).toBeCloseTo(0.7);
    expect(hintFactor(10)).toBe(0.5);
  });

  it('halves credit for unverified results', () => {
    expect(attemptQuality(attempt({ itemId: 'x', verified: false }))).toBe(0.5);
  });
});

describe('itemScore', () => {
  it('gives 0.7 for one unaided correct answer and grows with repetition', () => {
    expect(itemScore([attempt({ itemId: 'c1' })])).toBeCloseTo(0.7);
    expect(itemScore([attempt({ itemId: 'c1', at: 1 }), attempt({ itemId: 'c1', at: 2 })])).toBeCloseTo(0.91);
  });

  it('is pulled down by a later failure', () => {
    const score = itemScore([attempt({ itemId: 'c1', at: 1 }), attempt({ itemId: 'c1', at: 2, correct: false, score: 0 })]);
    expect(score).toBeCloseTo(0.21);
  });

  it('orders attempts by time regardless of input order', () => {
    const a = attempt({ itemId: 'c1', at: 2, correct: false, score: 0 });
    const b = attempt({ itemId: 'c1', at: 1 });
    expect(itemScore([a, b])).toBeCloseTo(0.21);
  });
});

describe('computeMastery', () => {
  it('is zero with no evidence and reports no evidence per dimension', () => {
    const m = computeMastery(modules, catalog, [], []);
    expect(m.overall).toBe(0);
    expect(m.dimensionEvidence.conceptual).toBe(0);
  });

  it('counts unattempted items in the same lesson as zero', () => {
    const m = computeMastery(modules, catalog, [attempt({ itemId: 'c1', lessonId: 'l1' })], []);
    // l1 has conceptual 0.7, runtime 0, coding 0 → mean 0.233
    expect(m.lessons.l1!.mastery).toBeCloseTo(0.7 / 3);
    expect(m.lessons.l2!.mastery).toBe(0);
    expect(m.modules.m1).toBeCloseTo(0.7 / 6);
    // Global dimension score is measured over attempted items only.
    expect(m.dimensions.conceptual).toBeCloseTo(0.7);
    expect(m.dimensionEvidence.conceptual).toBe(1);
  });

  it('adds retention from revision cards to the lesson', () => {
    let card = createCard({ kind: 'prompt', lessonId: 'l2', promptId: 'r1' }, NOW);
    card = reviewCard(card, 'good', NOW + DAY_MS); // 1 day
    card = reviewCard(card, 'good', NOW + 2 * DAY_MS); // 3 days
    const m = computeMastery(modules, catalog, [attempt({ itemId: 'c3', lessonId: 'l2' })], [card]);
    expect(cardStrength(card)).toBeCloseTo(3 / 21);
    expect(m.lessons.l2!.dimensions.retention).toBeCloseTo(3 / 21);
    expect(m.dimensions.retention).toBeCloseTo(3 / 21);
  });
});

describe('lessonCompletion', () => {
  it('requires every check attempted and 70% of latest answers correct', () => {
    const ids = ['a', 'b', 'c'];
    expect(lessonCompletion(ids, [attempt({ itemId: 'a' }), attempt({ itemId: 'b' })]).complete).toBe(false);
    const allButOne = [attempt({ itemId: 'a' }), attempt({ itemId: 'b' }), attempt({ itemId: 'c', correct: false, score: 0 })];
    expect(lessonCompletion(ids, allButOne).complete).toBe(false); // 2/3 = 67%
    const fixed = [...allButOne, attempt({ itemId: 'c', at: NOW + 1 })];
    expect(lessonCompletion(ids, fixed)).toEqual({ attempted: 3, total: 3, correct: 3, complete: true });
  });

  it('is never complete for a lesson with no checks', () => {
    expect(lessonCompletion([], []).complete).toBe(false);
  });
});

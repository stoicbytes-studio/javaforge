import { CATALOG, CHALLENGES, MODULES } from '@/content';
import { createCard } from '@/features/revision/scheduler';
import { computeMastery } from '@/features/progress/mastery';
import { buildDailyPlan, completedLessonIds, nextLesson, recommendMissions, weakConcepts } from '@/features/progress/recommendations';
import { attempt, DAY_MS, NOW } from '@/test-utils/fixtures';
import type { Attempt, RevisionCard } from '@/types/progress';

const first = MODULES[0]!.lessons[0]!;

function input(attempts: Attempt[], cards: RevisionCard[] = [], lastLessonId?: string) {
  return {
    modules: MODULES,
    challenges: CHALLENGES,
    mastery: computeMastery(MODULES, CATALOG, attempts, cards),
    attempts,
    cards,
    lastLessonId,
    now: NOW,
  };
}

const completeLesson = (lessonId = first.id) => {
  const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.id === lessonId)!;
  return lesson.checks.map((c) => attempt({ itemId: c.id, lessonId, dimension: c.dimension }));
};

describe('recommendations', () => {
  it('starts a new learner on the first lesson', () => {
    const missions = recommendMissions(input([]));
    expect(missions[0]!.kind).toBe('continue');
    expect(missions[0]!.href).toBe(`/learn/${first.moduleId}/${first.id}`);
  });

  it('moves on to the next lesson once one is complete', () => {
    const attempts = completeLesson();
    expect(completedLessonIds(MODULES, attempts).has(first.id)).toBe(true);
    expect(nextLesson(MODULES, completedLessonIds(MODULES, attempts))?.id).toBe(MODULES[0]!.lessons[1]!.id);
  });

  it('puts due revision first and explains why', () => {
    const card = { ...createCard({ kind: 'prompt', lessonId: first.id, promptId: 'r1' }, NOW - 2 * DAY_MS) };
    const missions = recommendMissions(input([], [card]));
    expect(missions[0]!.kind).toBe('revision');
    expect(missions[0]!.reason).toMatch(/delayed recall/);
  });

  it('flags repeated errors as repair missions and weak concepts', () => {
    const check = first.checks[0]!;
    const attempts = [
      attempt({ itemId: check.id, lessonId: first.id, correct: false, score: 0, at: NOW - 2000 }),
      attempt({ itemId: check.id, lessonId: first.id, correct: false, score: 0, at: NOW - 1000 }),
    ];
    const missions = recommendMissions(input(attempts));
    expect(missions.some((m) => m.kind === 'repair')).toBe(true);
    expect(weakConcepts(input(attempts))[0]!.lesson.id).toBe(first.id);
  });

  it('asks to re-solve hint-dependent challenges unaided', () => {
    const ch = CHALLENGES[0]!;
    const attempts = [attempt({ itemId: ch.id, itemType: 'challenge', hintsUsed: 2 })];
    expect(recommendMissions(input(attempts)).some((m) => m.kind === 'unaided')).toBe(true);
  });

  it('fits the daily plan into the time budget but always includes one mission', () => {
    const missions = [
      { id: 'a', kind: 'continue' as const, title: '', reason: '', href: '/', minutes: 40, priority: 3 },
      { id: 'b', kind: 'coding' as const, title: '', reason: '', href: '/', minutes: 10, priority: 2 },
      { id: 'c', kind: 'coding' as const, title: '', reason: '', href: '/', minutes: 10, priority: 1 },
    ];
    expect(buildDailyPlan(missions, 15).map((m) => m.id)).toEqual(['a']);
    expect(buildDailyPlan(missions, 60).map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });
});

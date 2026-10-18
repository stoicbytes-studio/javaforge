import { dueCards } from '@/features/revision/scheduler';
import { DAY } from '@/lib/time';
import type { CodingChallenge, CurriculumModule, Lesson } from '@/types/curriculum';
import type { Attempt, DailyMinutes, RevisionCard } from '@/types/progress';
import { lessonCompletion, type MasterySnapshot } from './mastery';

/**
 * Recommendation engine. Every mission states the evidence that produced it,
 * so the learner can see why it was suggested.
 */

export type MissionKind = 'revision' | 'repair' | 'continue' | 'coding' | 'unaided' | 'interview' | 'debugging';

export interface Mission {
  id: string;
  kind: MissionKind;
  title: string;
  reason: string;
  href: string;
  minutes: number;
  priority: number;
}

export interface RecommendationInput {
  modules: CurriculumModule[];
  challenges: CodingChallenge[];
  mastery: MasterySnapshot;
  attempts: Attempt[];
  cards: RevisionCard[];
  lastLessonId?: string;
  now: number;
}

export function lessonHref(lesson: Pick<Lesson, 'moduleId' | 'id'>): string {
  return `/learn/${lesson.moduleId}/${lesson.id}`;
}

function allLessons(modules: CurriculumModule[]): Lesson[] {
  return [...modules].sort((a, b) => a.order - b.order).flatMap((m) => m.lessons);
}

export function completedLessonIds(modules: CurriculumModule[], attempts: Attempt[]): Set<string> {
  const done = new Set<string>();
  for (const lesson of allLessons(modules)) {
    const status = lessonCompletion(lesson.checks.map((c) => c.id), attempts);
    if (status.complete) done.add(lesson.id);
  }
  return done;
}

/** Next lesson in curriculum order whose prerequisites are complete. */
export function nextLesson(modules: CurriculumModule[], completed: Set<string>): Lesson | undefined {
  const lessons = allLessons(modules);
  return (
    lessons.find((l) => !completed.has(l.id) && l.prerequisites.every((p) => completed.has(p))) ??
    lessons.find((l) => !completed.has(l.id))
  );
}

export interface WeakConcept {
  lesson: Lesson;
  mastery: number;
  recentErrors: number;
}

export function weakConcepts(input: RecommendationInput, limit = 5): WeakConcept[] {
  const lessons = allLessons(input.modules);
  const recent = input.attempts.filter((a) => a.at >= input.now - 14 * DAY);
  const result: WeakConcept[] = [];
  for (const lesson of lessons) {
    const touched = input.attempts.some((a) => a.lessonId === lesson.id && a.itemType !== 'revision');
    if (!touched) continue;
    const mastery = input.mastery.lessons[lesson.id]?.mastery ?? 0;
    const recentErrors = recent.filter((a) => a.lessonId === lesson.id && !a.correct).length;
    if (mastery < 0.5 || recentErrors >= 2) result.push({ lesson, mastery, recentErrors });
  }
  return result.sort((a, b) => a.mastery - b.mastery || b.recentErrors - a.recentErrors).slice(0, limit);
}

/** Items whose latest attempt is wrong after at least two misses. */
function repeatedErrors(attempts: Attempt[]): Map<string, number> {
  const byItem = new Map<string, Attempt[]>();
  for (const a of attempts) {
    if (a.itemType === 'revision' || !a.lessonId) continue;
    const list = byItem.get(a.itemId) ?? [];
    list.push(a);
    byItem.set(a.itemId, list);
  }
  const perLesson = new Map<string, number>();
  for (const list of byItem.values()) {
    list.sort((x, y) => x.at - y.at);
    const latest = list[list.length - 1]!;
    const misses = list.filter((a) => !a.correct).length;
    if (!latest.correct && misses >= 2 && latest.lessonId) {
      perLesson.set(latest.lessonId, (perLesson.get(latest.lessonId) ?? 0) + 1);
    }
  }
  return perLesson;
}

export function recommendMissions(input: RecommendationInput): Mission[] {
  const { modules, challenges, mastery, attempts, cards, now } = input;
  const missions: Mission[] = [];
  const lessons = allLessons(modules);
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const completed = completedLessonIds(modules, attempts);

  const due = dueCards(cards, now);
  if (due.length > 0) {
    missions.push({
      id: 'revision',
      kind: 'revision',
      title: `Review ${due.length} due card${due.length === 1 ? '' : 's'}`,
      reason: 'These concepts are scheduled for delayed recall; reviewing now strengthens long-term retention.',
      href: '/revision',
      minutes: Math.min(15, Math.max(3, Math.ceil(due.length * 0.75))),
      priority: 100,
    });
  }

  for (const [lessonId, count] of repeatedErrors(attempts)) {
    const lesson = lessonById.get(lessonId);
    if (!lesson) continue;
    missions.push({
      id: `repair:${lessonId}`,
      kind: 'repair',
      title: `Repair: ${lesson.title}`,
      reason: `${count} question${count === 1 ? ' was' : 's were'} answered incorrectly more than once. Re-read the explanation and retry.`,
      href: lessonHref(lesson),
      minutes: 10,
      priority: 90,
    });
  }

  const solvedUnaided = new Set(
    attempts.filter((a) => a.itemType === 'challenge' && a.correct && a.hintsUsed === 0).map((a) => a.itemId),
  );
  const solvedWithHints = new Set(
    attempts.filter((a) => a.itemType === 'challenge' && a.correct && a.hintsUsed > 0).map((a) => a.itemId),
  );
  const hintDependent = challenges.find((c) => solvedWithHints.has(c.id) && !solvedUnaided.has(c.id));
  if (hintDependent) {
    missions.push({
      id: `unaided:${hintDependent.id}`,
      kind: 'unaided',
      title: `Re-solve without hints: ${hintDependent.title}`,
      reason: 'You solved this with hints. Solving it unaided is what demonstrates independent coding.',
      href: `/practice/${hintDependent.id}`,
      minutes: 15,
      priority: 70,
    });
  }

  const last = input.lastLessonId ? lessonById.get(input.lastLessonId) : undefined;
  const continueLesson = last && !completed.has(last.id) ? last : nextLesson(modules, completed);
  if (continueLesson) {
    const status = lessonCompletion(continueLesson.checks.map((c) => c.id), attempts);
    missions.push({
      id: `continue:${continueLesson.id}`,
      kind: 'continue',
      title: status.attempted > 0 ? `Continue: ${continueLesson.title}` : `Start: ${continueLesson.title}`,
      reason:
        status.attempted > 0
          ? `${status.attempted}/${status.total} checks attempted in this lesson.`
          : 'Next lesson in the recommended sequence; its prerequisites are complete.',
      href: lessonHref(continueLesson),
      minutes: continueLesson.estimatedMinutes,
      priority: 80,
    });
  }

  const codingGap = (mastery.dimensions.conceptual ?? 0) - (mastery.dimensions.coding ?? 0);
  const unsolved = challenges.find(
    (c) => c.lessonId && completed.has(c.lessonId) && !attempts.some((a) => a.itemId === c.id && a.correct),
  );
  if (unsolved) {
    missions.push({
      id: `coding:${unsolved.id}`,
      kind: 'coding',
      title: `Code it: ${unsolved.title}`,
      reason:
        codingGap > 0.2
          ? 'Your conceptual score is well ahead of your coding score. Turn understanding into working code.'
          : 'You completed the lesson for this challenge but have not solved it yet.',
      href: `/practice/${unsolved.id}`,
      minutes: 20,
      priority: codingGap > 0.2 ? 85 : 60,
    });
  }

  if (completed.size >= 2 && (mastery.dimensionEvidence.interview ?? 0) < completed.size) {
    missions.push({
      id: 'interview',
      kind: 'interview',
      title: 'Practise explaining what you learned',
      reason: `You have completed ${completed.size} lessons but answered few interview questions on them.`,
      href: '/interview',
      minutes: 15,
      priority: 50,
    });
  }

  if (completed.size >= 3 && (mastery.dimensionEvidence.debugging ?? 0) === 0) {
    missions.push({
      id: 'debugging',
      kind: 'debugging',
      title: 'Hunt your first bug',
      reason: 'Debugging is tracked separately from coding and you have no debugging evidence yet.',
      href: '/bug-hunter',
      minutes: 10,
      priority: 55,
    });
  }

  return missions.sort((a, b) => b.priority - a.priority);
}

/** Greedily fits the highest-priority missions into the learner's daily budget. */
export function buildDailyPlan(missions: Mission[], dailyMinutes: DailyMinutes): Mission[] {
  const plan: Mission[] = [];
  let remaining = dailyMinutes;
  for (const mission of missions) {
    if (plan.length === 0 || mission.minutes <= remaining) {
      plan.push(mission);
      remaining -= mission.minutes;
    }
    if (remaining <= 0) break;
  }
  return plan;
}

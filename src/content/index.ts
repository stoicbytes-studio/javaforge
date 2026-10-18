import type { CatalogItem } from '@/features/progress/mastery';
import type { CodingChallenge, CurriculumModule, KnowledgeCheck, Lesson } from '@/types/curriculum';
import type { BugHunt, Incident, InterviewQuestion, JvmScenario, Project } from '@/types/practice';

import { exceptionsChallenges } from './challenges/exceptions';
import { fundamentalsChallenges } from './challenges/fundamentals';
import { oopChallenges } from './challenges/oop';
import { platformChallenges } from './challenges/platform';
import { typesChallenges } from './challenges/types';
import { fundamentalsModule } from './modules/01-fundamentals';
import { platformModule } from './modules/02-platform';
import { oopModule } from './modules/03-oop';
import { typesModule } from './modules/04-types';
import { exceptionsModule } from './modules/05-exceptions';
import { PLANNED_MODULES } from './modules/planned';

/**
 * Public curriculum content. Lives in the app bundle so the learning journey
 * works offline and without an account; scripts/generate-seed.mjs mirrors it
 * into the public Postgres tables.
 */

const WRITTEN_MODULES: CurriculumModule[] = [fundamentalsModule, platformModule, oopModule, typesModule, exceptionsModule];

const writtenIds = new Set(WRITTEN_MODULES.map((m) => m.id));
export const MODULES: CurriculumModule[] = [
  ...WRITTEN_MODULES,
  ...PLANNED_MODULES.filter((m) => !writtenIds.has(m.id)),
].sort((a, b) => a.order - b.order);

export const CHALLENGES: CodingChallenge[] = [...fundamentalsChallenges, ...platformChallenges, ...oopChallenges, ...typesChallenges, ...exceptionsChallenges];
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [];
export const BUG_HUNTS: BugHunt[] = [];
export const INCIDENTS: Incident[] = [];
export const PROJECTS: Project[] = [];
export const JVM_SCENARIOS: JvmScenario[] = [];

export const LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);

const moduleById = new Map(MODULES.map((m) => [m.id, m]));
const lessonById = new Map(LESSONS.map((l) => [l.id, l]));
const challengeById = new Map(CHALLENGES.map((c) => [c.id, c]));

export const getModule = (id: string) => moduleById.get(id);
export const getLesson = (id: string) => lessonById.get(id);
export const getChallenge = (id: string) => challengeById.get(id);
export const getInterviewQuestion = (id: string) => INTERVIEW_QUESTIONS.find((q) => q.id === id);
export const getBugHunt = (id: string) => BUG_HUNTS.find((b) => b.id === id);
export const getIncident = (id: string) => INCIDENTS.find((i) => i.id === id);
export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
export const getJvmScenario = (id: string) => JVM_SCENARIOS.find((s) => s.id === id);

export function findCheck(lessonId: string, checkId: string): KnowledgeCheck | undefined {
  return lessonById.get(lessonId)?.checks.find((c) => c.id === checkId);
}

export const BOSS_CHALLENGE_IDS = CHALLENGES.filter((c) => c.kind === 'boss').map((c) => c.id);

/** Every assessable item, used by the mastery model. */
export const CATALOG: CatalogItem[] = [
  ...LESSONS.flatMap((lesson) =>
    lesson.checks.map<CatalogItem>((check) => ({
      itemType: 'check',
      itemId: check.id,
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      dimension: check.dimension,
    })),
  ),
  ...CHALLENGES.map<CatalogItem>((c) => ({
    itemType: 'challenge',
    itemId: c.id,
    lessonId: c.lessonId,
    moduleId: c.moduleId,
    dimension: c.dimension,
  })),
  ...INTERVIEW_QUESTIONS.map<CatalogItem>((q) => ({
    itemType: 'interview',
    itemId: q.id,
    lessonId: q.lessonIds[0],
    moduleId: q.moduleId,
    dimension: 'interview',
  })),
  ...BUG_HUNTS.map<CatalogItem>((b) => ({ itemType: 'bug-hunt', itemId: b.id, moduleId: b.moduleId, dimension: 'debugging' })),
  ...INCIDENTS.map<CatalogItem>((i) => ({
    itemType: 'incident',
    itemId: i.id,
    moduleId: i.relatedModuleIds[0] ?? 'production',
    dimension: 'debugging',
  })),
];

/** XP base for an attempt: boss and harder challenges are worth more. */
export function xpBaseFor(attempt: { itemType: CatalogItem['itemType']; itemId: string }): number {
  if (attempt.itemType === 'challenge') {
    const c = challengeById.get(attempt.itemId);
    if (!c) return 50;
    if (c.kind === 'boss') return 150;
    return c.difficulty === 'advanced' ? 90 : c.difficulty === 'intermediate' ? 60 : 40;
  }
  const base = { check: 10, interview: 30, 'bug-hunt': 40, incident: 100, revision: 4 } as const;
  return base[attempt.itemType];
}

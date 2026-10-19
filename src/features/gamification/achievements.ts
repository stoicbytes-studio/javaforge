import type { MasterySnapshot } from '@/features/progress/mastery';
import type { Attempt, IncidentRun, InterviewSessionRecord, RevisionCard } from '@/types/progress';
import type { StreakInfo } from './streaks';

/**
 * Every achievement has a verifiable requirement computed from the learner's
 * records; nothing is granted for opening screens.
 */

export interface AchievementContext {
  attempts: Attempt[];
  cards: RevisionCard[];
  mastery: MasterySnapshot;
  streak: StreakInfo;
  incidentRuns: IncidentRun[];
  interviewSessions: InterviewSessionRecord[];
  bossChallengeIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  requirement: string;
  category: 'coding' | 'debugging' | 'knowledge' | 'consistency' | 'interview' | 'production';
  progress: (ctx: AchievementContext) => { current: number; target: number };
}

const distinctCorrect = (ctx: AchievementContext, pred: (a: Attempt) => boolean) =>
  new Set(ctx.attempts.filter((a) => a.correct && pred(a)).map((a) => a.itemId)).size;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-verified-run',
    title: 'It Compiles and Passes',
    requirement: 'Pass every test of a coding challenge on a real Java runtime.',
    category: 'coding',
    progress: (ctx) => ({
      current: Math.min(1, distinctCorrect(ctx, (a) => a.itemType === 'challenge' && a.verified)),
      target: 1,
    }),
  },
  {
    id: 'unaided-five',
    title: 'No Hints Needed',
    requirement: 'Solve 5 different coding challenges on a real Java runtime without using a hint.',
    category: 'coding',
    progress: (ctx) => ({
      current: distinctCorrect(ctx, (a) => a.itemType === 'challenge' && a.hintsUsed === 0 && a.verified),
      target: 5,
    }),
  },
  {
    id: 'bug-squasher',
    title: 'Bug Squasher',
    requirement: 'Correctly diagnose 5 different Bug Hunter cases.',
    category: 'debugging',
    progress: (ctx) => ({ current: distinctCorrect(ctx, (a) => a.itemType === 'bug-hunt'), target: 5 }),
  },
  {
    id: 'incident-commander',
    title: 'Incident Commander',
    requirement: 'Resolve a production incident with the correct root cause and fix.',
    category: 'production',
    progress: (ctx) => ({
      current: Math.min(1, ctx.incidentRuns.filter((r) => r.hypothesisCorrect && r.fixCorrect).length),
      target: 1,
    }),
  },
  {
    id: 'output-oracle',
    title: 'Output Oracle',
    requirement: 'Answer 20 runtime-behaviour questions correctly on the first try.',
    category: 'knowledge',
    progress: (ctx) => {
      const first = new Map<string, Attempt>();
      for (const a of [...ctx.attempts].sort((x, y) => x.at - y.at)) {
        if (a.itemType === 'check' && a.dimension === 'runtime' && !first.has(a.itemId)) first.set(a.itemId, a);
      }
      return { current: [...first.values()].filter((a) => a.correct && a.hintsUsed === 0).length, target: 20 };
    },
  },
  {
    id: 'core-foundations',
    title: 'Solid Foundations',
    requirement: 'Reach 70% mastery in Java Fundamentals.',
    category: 'knowledge',
    progress: (ctx) => ({ current: Math.round((ctx.mastery.modules['fundamentals'] ?? 0) * 100), target: 70 }),
  },
  {
    id: 'collections-core',
    title: 'Collections Insider',
    requirement: 'Reach 70% mastery in the Collections Framework module.',
    category: 'knowledge',
    progress: (ctx) => ({ current: Math.round((ctx.mastery.modules['collections'] ?? 0) * 100), target: 70 }),
  },
  {
    id: 'boss-slayer',
    title: 'Capstone Cleared',
    requirement: 'Pass a module boss challenge.',
    category: 'coding',
    progress: (ctx) => ({
      current: Math.min(1, distinctCorrect(ctx, (a) => a.itemType === 'challenge' && ctx.bossChallengeIds.includes(a.itemId))),
      target: 1,
    }),
  },
  {
    id: 'recall-week',
    title: 'It Stuck',
    requirement: 'Keep 10 revision cards alive at an interval of 7 days or more.',
    category: 'consistency',
    progress: (ctx) => ({
      current: ctx.cards.filter((c) => c.intervalDays >= 7 && c.lastGrade !== 'again').length,
      target: 10,
    }),
  },
  {
    id: 'streak-7',
    title: 'Seven-Day Rhythm',
    requirement: 'Demonstrate a correct answer on 7 consecutive days.',
    category: 'consistency',
    progress: (ctx) => ({ current: Math.min(7, ctx.streak.longest), target: 7 }),
  },
  {
    id: 'mock-interview',
    title: 'Composed Under Questioning',
    requirement: 'Finish a mock interview of 5+ questions averaging 70% or more.',
    category: 'interview',
    progress: (ctx) => {
      const ok = ctx.interviewSessions.some((s) => {
        const scores = Object.values(s.scores);
        return (
          s.finishedAt !== undefined &&
          scores.length >= 5 &&
          scores.reduce((sum, v) => sum + v, 0) / scores.length >= 0.7
        );
      });
      return { current: ok ? 1 : 0, target: 1 };
    },
  },
];

export interface AchievementStatus {
  achievement: Achievement;
  current: number;
  target: number;
  unlocked: boolean;
}

export function evaluateAchievements(ctx: AchievementContext): AchievementStatus[] {
  return ACHIEVEMENTS.map((achievement) => {
    const { current, target } = achievement.progress(ctx);
    return { achievement, current: Math.min(current, target), target, unlocked: current >= target };
  });
}

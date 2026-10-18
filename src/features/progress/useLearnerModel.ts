import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { BOSS_CHALLENGE_IDS, CATALOG, CHALLENGES, MODULES, xpBaseFor } from '@/content';
import { evaluateAchievements, type AchievementStatus } from '@/features/gamification/achievements';
import { computeStreak, weeklyGoals, type StreakInfo, type WeeklyGoal } from '@/features/gamification/streaks';
import { computeTier, type TierProgress } from '@/features/gamification/tiers';
import { computeXp, type XpBreakdown } from '@/features/gamification/xp';
import { useLearningStore } from '@/store/learningStore';
import { computeMastery, type MasterySnapshot } from './mastery';
import { buildDailyPlan, completedLessonIds, recommendMissions, weakConcepts, type Mission, type WeakConcept } from './recommendations';

export interface LearnerModel {
  mastery: MasterySnapshot;
  xp: XpBreakdown;
  tier: TierProgress;
  streak: StreakInfo;
  goals: WeeklyGoal[];
  achievements: AchievementStatus[];
  missions: Mission[];
  plan: Mission[];
  weak: WeakConcept[];
  completedLessons: Set<string>;
  dueCount: number;
  now: number;
}

/**
 * Derives every learner metric from raw records in one memoised pass.
 * Nothing here is stored: XP, tiers, mastery and achievements are always
 * recomputed from attempts, so they cannot drift from the evidence.
 */
export function useLearnerModel(): LearnerModel {
  const { attempts, cardsMap, incidentRuns, interviewSessions, dailyMinutes, lastLessonId } = useLearningStore(
    useShallow((s) => ({
      attempts: s.attempts,
      cardsMap: s.cards,
      incidentRuns: s.incidentRuns,
      interviewSessions: s.interviewSessions,
      dailyMinutes: s.settings.dailyMinutes,
      lastLessonId: s.lastLessonId,
    })),
  );

  return useMemo(() => {
    const now = Date.now();
    const cards = Object.values(cardsMap);
    const mastery = computeMastery(MODULES, CATALOG, attempts, cards);
    const xp = computeXp(attempts, xpBaseFor);
    const streak = computeStreak(attempts, now);
    const input = { modules: MODULES, challenges: CHALLENGES, mastery, attempts, cards, lastLessonId, now };
    const missions = recommendMissions(input);
    return {
      mastery,
      xp,
      tier: computeTier(xp.total, mastery),
      streak,
      goals: weeklyGoals(attempts, dailyMinutes, now),
      achievements: evaluateAchievements({
        attempts,
        cards,
        mastery,
        streak,
        incidentRuns,
        interviewSessions,
        bossChallengeIds: BOSS_CHALLENGE_IDS,
      }),
      missions,
      plan: buildDailyPlan(missions, dailyMinutes),
      weak: weakConcepts(input),
      completedLessons: completedLessonIds(MODULES, attempts),
      dueCount: cards.filter((c) => c.dueAt <= now).length,
      now,
    };
  }, [attempts, cardsMap, incidentRuns, interviewSessions, dailyMinutes, lastLessonId]);
}

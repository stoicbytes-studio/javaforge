import { evaluateAchievements } from '@/features/gamification/achievements';
import { computeStreak, weeklyGoals } from '@/features/gamification/streaks';
import { computeTier, TIERS } from '@/features/gamification/tiers';
import { computeXp } from '@/features/gamification/xp';
import { computeMastery, type MasterySnapshot } from '@/features/progress/mastery';
import { attempt, DAY_MS, NOW } from '@/test-utils/fixtures';

const emptyMastery = (): MasterySnapshot => computeMastery([], [], [], []);

describe('XP', () => {
  it('pays each item once at its best quality', () => {
    const xp = computeXp([
      attempt({ itemId: 'c1', hintsUsed: 2 }), // 10 * 0.7 = 7
      attempt({ itemId: 'c1' }), // 10 — replaces 7
      attempt({ itemId: 'c1' }), // no farming
    ]);
    expect(xp.total).toBe(10);
  });

  it('pays nothing for wrong answers', () => {
    expect(computeXp([attempt({ itemId: 'c1', correct: false, score: 0 })]).total).toBe(0);
  });

  it('pays every successful revision and halves unverified challenges', () => {
    const xp = computeXp([
      attempt({ itemId: 'card', itemType: 'revision', score: 1 }),
      attempt({ itemId: 'card', itemType: 'revision', score: 1 }),
      attempt({ itemId: 'ch', itemType: 'challenge', verified: false }),
    ]);
    expect(xp.byType.revision).toBe(8);
    expect(xp.byType.challenge).toBe(25);
  });
});

describe('tiers', () => {
  it('starts at Java Foundations', () => {
    expect(computeTier(0, emptyMastery()).current.id).toBe('foundations');
  });

  it('requires mastery as well as XP', () => {
    const tier = computeTier(100_000, emptyMastery());
    expect(tier.current.id).toBe('foundations');
    expect(tier.next?.id).toBe('app-developer');
    expect(tier.nextRequirements.find((r) => r.requirement.kind === 'xp')?.met).toBe(true);
    expect(tier.nextRequirements.some((r) => !r.met)).toBe(true);
  });

  it('advances when all requirements of the next tier are met', () => {
    const mastery = emptyMastery();
    mastery.modules = { fundamentals: 0.6, oop: 0.5 };
    expect(computeTier(400, mastery).current.id).toBe('app-developer');
  });

  it('has eight ranked tiers', () => {
    expect(TIERS.map((t) => t.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('streaks', () => {
  const day = (offset: number) => NOW + offset * DAY_MS;

  it('counts consecutive days with correct answers, ignoring wrong-only days', () => {
    const attempts = [
      attempt({ itemId: 'a', at: day(-3) }),
      attempt({ itemId: 'a', at: day(-2) }),
      attempt({ itemId: 'a', at: day(-1), correct: false, score: 0 }),
      attempt({ itemId: 'a', at: day(0) }),
    ];
    const s = computeStreak(attempts, NOW);
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
    expect(s.activeToday).toBe(true);
  });

  it('keeps yesterday’s streak alive before today’s first answer', () => {
    const attempts = [attempt({ itemId: 'a', at: day(-2) }), attempt({ itemId: 'a', at: day(-1) })];
    expect(computeStreak(attempts, NOW).current).toBe(2);
  });

  it('breaks after a missed day', () => {
    expect(computeStreak([attempt({ itemId: 'a', at: day(-2) })], NOW).current).toBe(0);
  });
});

describe('weekly goals', () => {
  it('scales targets with the daily schedule and counts only this week', () => {
    const lastWeek = NOW - 8 * DAY_MS;
    const attempts = [attempt({ itemId: 'c1' }), attempt({ itemId: 'c2', at: lastWeek })];
    const goals15 = weeklyGoals(attempts, 15, NOW);
    const goals90 = weeklyGoals(attempts, 90, NOW);
    expect(goals15.find((g) => g.id === 'checks')!.current).toBe(1);
    expect(goals90.find((g) => g.id === 'checks')!.target).toBeGreaterThan(goals15.find((g) => g.id === 'checks')!.target);
  });
});

describe('achievements', () => {
  it('unlocks only from verifiable evidence', () => {
    const ctx = {
      attempts: [attempt({ itemId: 'ch1', itemType: 'challenge', verified: false })],
      cards: [],
      mastery: emptyMastery(),
      streak: { current: 0, longest: 0, activeToday: false },
      incidentRuns: [],
      interviewSessions: [],
      bossChallengeIds: [],
    };
    const first = evaluateAchievements(ctx).find((a) => a.achievement.id === 'first-verified-run')!;
    expect(first.unlocked).toBe(false);
    ctx.attempts.push(attempt({ itemId: 'ch1', itemType: 'challenge', verified: true }));
    expect(evaluateAchievements(ctx).find((a) => a.achievement.id === 'first-verified-run')!.unlocked).toBe(true);
  });
});

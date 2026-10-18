import { addDays, dayKey, startOfWeek } from '@/lib/time';
import type { Attempt, DailyMinutes } from '@/types/progress';

/**
 * A day counts toward the streak only when the learner demonstrated
 * something: at least one correct attempt (any item, including revision).
 */
export function qualifyingDays(attempts: Attempt[]): Set<string> {
  const days = new Set<string>();
  for (const a of attempts) if (a.correct) days.add(dayKey(a.at));
  return days;
}

export interface StreakInfo {
  current: number;
  longest: number;
  activeToday: boolean;
}

export function computeStreak(attempts: Attempt[], now: number): StreakInfo {
  const days = qualifyingDays(attempts);
  const activeToday = days.has(dayKey(now));

  // The streak is still alive if the learner was active yesterday but not yet today.
  let cursor = activeToday ? now : addDays(now, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: string | undefined;
  for (const key of sorted) {
    if (prev && dayKey(addDays(new Date(`${prev}T12:00:00`).getTime(), 1)) === key) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = key;
  }
  return { current, longest: Math.max(longest, current), activeToday };
}

export interface WeeklyGoal {
  id: string;
  label: string;
  current: number;
  target: number;
}

const GOAL_TARGETS: Record<DailyMinutes, { checks: number; coding: number; reviews: number; interview: number; days: number }> = {
  15: { checks: 12, coding: 2, reviews: 10, interview: 2, days: 4 },
  30: { checks: 25, coding: 4, reviews: 20, interview: 4, days: 5 },
  60: { checks: 40, coding: 7, reviews: 35, interview: 8, days: 5 },
  90: { checks: 60, coding: 10, reviews: 50, interview: 12, days: 6 },
};

export function weeklyGoals(attempts: Attempt[], dailyMinutes: DailyMinutes, now: number): WeeklyGoal[] {
  const weekStart = startOfWeek(now);
  const thisWeek = attempts.filter((a) => a.at >= weekStart && a.at <= now && a.correct);
  const t = GOAL_TARGETS[dailyMinutes];
  const count = (pred: (a: Attempt) => boolean) => thisWeek.filter(pred).length;
  const distinct = (pred: (a: Attempt) => boolean) =>
    new Set(thisWeek.filter(pred).map((a) => a.itemId)).size;

  return [
    { id: 'checks', label: 'Knowledge checks answered correctly', current: count((a) => a.itemType === 'check'), target: t.checks },
    {
      id: 'coding',
      label: 'Coding or debugging problems solved',
      current: distinct((a) => a.itemType === 'challenge' || a.itemType === 'bug-hunt' || a.itemType === 'incident'),
      target: t.coding,
    },
    { id: 'reviews', label: 'Successful revision recalls', current: count((a) => a.itemType === 'revision'), target: t.reviews },
    { id: 'interview', label: 'Interview answers scoring 60%+', current: count((a) => a.itemType === 'interview'), target: t.interview },
    { id: 'days', label: 'Active learning days', current: new Set(thisWeek.map((a) => dayKey(a.at))).size, target: t.days },
  ];
}

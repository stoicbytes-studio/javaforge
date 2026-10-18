import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { AchievementStatus } from '@/features/gamification/achievements';
import type { StreakInfo } from '@/features/gamification/streaks';
import type { MasterySnapshot } from '@/features/progress/mastery';
import { DIMENSIONS } from '@/features/progress/mastery';
import { milestoneKey, useLearningStore, type LearningState } from '@/store/learningStore';
import type { Attempt, Note, RevisionCard } from '@/types/progress';
import { useAuth } from './auth';
import { supabase } from './supabase';

/**
 * Local-first sync. The device store is the source of truth while offline;
 * when signed in, records are upserted to Supabase (protected by RLS) and
 * remote records are merged back in:
 *   - attempts are append-only and merged by id
 *   - revision cards keep the most recently reviewed copy
 *   - notes keep the most recently edited copy
 *   - bookmarks and milestones are unioned
 * Derived metrics (mastery, streaks, achievements) are uploaded as snapshots
 * for reporting only; the client always recomputes them from raw records.
 */

type Row = Record<string, unknown>;

export const toAttemptRow = (userId: string, a: Attempt): Row => ({
  id: a.id,
  user_id: userId,
  item_type: a.itemType,
  item_id: a.itemId,
  lesson_id: a.lessonId ?? null,
  module_id: a.moduleId ?? null,
  dimension: a.dimension,
  correct: a.correct,
  score: a.score,
  hints_used: a.hintsUsed,
  verified: a.verified,
  attempted_at: new Date(a.at).toISOString(),
});

export const fromAttemptRow = (r: Row): Attempt => ({
  id: String(r.id),
  itemType: r.item_type as Attempt['itemType'],
  itemId: String(r.item_id),
  lessonId: (r.lesson_id as string | null) ?? undefined,
  moduleId: (r.module_id as string | null) ?? undefined,
  dimension: r.dimension as Attempt['dimension'],
  correct: Boolean(r.correct),
  score: Number(r.score),
  hintsUsed: Number(r.hints_used),
  verified: Boolean(r.verified),
  at: Date.parse(String(r.attempted_at)),
});

export const toCardRow = (userId: string, c: RevisionCard): Row => ({
  user_id: userId,
  card_id: c.id,
  source: c.source,
  ease: c.ease,
  interval_days: c.intervalDays,
  repetitions: c.repetitions,
  lapses: c.lapses,
  due_at: new Date(c.dueAt).toISOString(),
  created_at: new Date(c.createdAt).toISOString(),
  last_reviewed_at: c.lastReviewedAt ? new Date(c.lastReviewedAt).toISOString() : null,
  last_grade: c.lastGrade ?? null,
});

export const fromCardRow = (r: Row): RevisionCard => ({
  id: String(r.card_id),
  source: r.source as RevisionCard['source'],
  ease: Number(r.ease),
  intervalDays: Number(r.interval_days),
  repetitions: Number(r.repetitions),
  lapses: Number(r.lapses),
  dueAt: Date.parse(String(r.due_at)),
  createdAt: Date.parse(String(r.created_at)),
  lastReviewedAt: r.last_reviewed_at ? Date.parse(String(r.last_reviewed_at)) : undefined,
  lastGrade: (r.last_grade as RevisionCard['lastGrade']) ?? undefined,
});

async function check<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data;
}

export interface DerivedSnapshot {
  mastery: MasterySnapshot;
  streak: StreakInfo;
  achievements: AchievementStatus[];
}

export async function pushProgress(userId: string, state: LearningState, derived?: DerivedSnapshot): Promise<void> {
  if (!supabase) return;
  const db = supabase;
  const since = state.lastSyncedAt ?? 0;
  const newAttempts = state.attempts.filter((a) => a.at > since - 60_000);
  for (let i = 0; i < newAttempts.length; i += 500) {
    await check(db.from('attempts').upsert(newAttempts.slice(i, i + 500).map((a) => toAttemptRow(userId, a)), { onConflict: 'id', ignoreDuplicates: true }));
  }
  const cards = Object.values(state.cards);
  if (cards.length) await check(db.from('revision_cards').upsert(cards.map((c) => toCardRow(userId, c)), { onConflict: 'user_id,card_id' }));

  await check(db.from('bookmarks').delete().eq('user_id', userId));
  if (state.bookmarks.length) {
    await check(db.from('bookmarks').insert(state.bookmarks.map((lessonId) => ({ user_id: userId, lesson_id: lessonId }))));
  }
  const notes = Object.entries(state.notes);
  if (notes.length) {
    await check(
      db.from('notes').upsert(
        notes.map(([lessonId, n]) => ({ user_id: userId, lesson_id: lessonId, body: n.text, updated_at: new Date(n.updatedAt).toISOString() })),
        { onConflict: 'user_id,lesson_id' },
      ),
    );
  }
  const milestones = Object.entries(state.milestones);
  if (milestones.length) {
    await check(
      db.from('user_project_milestones').upsert(
        milestones.map(([key, at]) => {
          const [projectId, milestoneId] = key.split('/');
          return { user_id: userId, project_id: projectId, milestone_id: milestoneId, completed_at: new Date(at).toISOString() };
        }),
        { onConflict: 'user_id,project_id,milestone_id' },
      ),
    );
  }

  if (derived) {
    const now = new Date().toISOString();
    const masteryRows = [
      { user_id: userId, scope: 'overall', scope_id: 'overall', value: derived.mastery.overall, updated_at: now },
      ...Object.entries(derived.mastery.modules).map(([id, value]) => ({ user_id: userId, scope: 'module', scope_id: id, value, updated_at: now })),
      ...DIMENSIONS.map((d) => ({ user_id: userId, scope: 'dimension', scope_id: d, value: derived.mastery.dimensions[d], updated_at: now })),
    ];
    await check(db.from('mastery_records').upsert(masteryRows, { onConflict: 'user_id,scope,scope_id' }));
    await check(
      db.from('learning_streaks').upsert(
        { user_id: userId, current_streak: derived.streak.current, longest_streak: derived.streak.longest, updated_at: now },
        { onConflict: 'user_id' },
      ),
    );
    const unlocked = derived.achievements.filter((a) => a.unlocked);
    if (unlocked.length) {
      await check(
        db.from('user_achievements').upsert(
          unlocked.map((a) => ({ user_id: userId, achievement_id: a.achievement.id })),
          { onConflict: 'user_id,achievement_id', ignoreDuplicates: true },
        ),
      );
    }
  }
}

export type RemoteProgress = Partial<Pick<LearningState, 'attempts' | 'cards' | 'bookmarks' | 'notes' | 'milestones'>>;

export async function pullProgress(userId: string): Promise<RemoteProgress> {
  if (!supabase) return {};
  const db = supabase;
  const [attempts, cards, bookmarks, notes, milestones] = await Promise.all([
    check(db.from('attempts').select('*').eq('user_id', userId).order('attempted_at')),
    check(db.from('revision_cards').select('*').eq('user_id', userId)),
    check(db.from('bookmarks').select('lesson_id').eq('user_id', userId)),
    check(db.from('notes').select('lesson_id, body, updated_at').eq('user_id', userId)),
    check(db.from('user_project_milestones').select('project_id, milestone_id, completed_at').eq('user_id', userId)),
  ]);
  const notesMap: Record<string, Note> = {};
  for (const n of (notes ?? []) as Row[]) notesMap[String(n.lesson_id)] = { text: String(n.body), updatedAt: Date.parse(String(n.updated_at)) };
  const milestoneMap: Record<string, number> = {};
  for (const m of (milestones ?? []) as Row[]) {
    milestoneMap[milestoneKey(String(m.project_id), String(m.milestone_id))] = Date.parse(String(m.completed_at));
  }
  return {
    attempts: ((attempts ?? []) as Row[]).map(fromAttemptRow),
    cards: Object.fromEntries(((cards ?? []) as Row[]).map((r) => [String(r.card_id), fromCardRow(r)])),
    bookmarks: ((bookmarks ?? []) as Row[]).map((b) => String(b.lesson_id)),
    notes: notesMap,
    milestones: milestoneMap,
  };
}

export function useSync(derived?: DerivedSnapshot) {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Sign in to sync your progress.');
      const remote = await pullProgress(userId);
      useLearningStore.getState().mergeRemote(remote);
      await pushProgress(userId, useLearningStore.getState(), derived);
      useLearningStore.getState().markSynced(Date.now());
    },
  });
}

/** Syncs once after sign-in and then a few seconds after each new attempt. */
export function useAutoSync(derived?: DerivedSnapshot) {
  const { session } = useAuth();
  const sync = useSync(derived);
  const attemptCount = useLearningStore((s) => s.attempts.length);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const userId = session?.user.id;
  const { mutate } = sync;

  useEffect(() => {
    if (!userId) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => mutate(), 4_000);
    return () => clearTimeout(timer.current);
  }, [userId, attemptCount, mutate]);

  return sync;
}

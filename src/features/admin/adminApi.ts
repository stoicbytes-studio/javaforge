import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/services/auth';
import { supabase } from '@/services/supabase';

/**
 * Admin reporting through security-definer Postgres functions
 * (supabase/migrations/*_admin.sql). Each function re-checks admin membership
 * on the server, so hiding admin UI from non-admins is a convenience, not the
 * security boundary.
 */

export interface AdminOverview {
  totalUsers: number;
  newUsers7d: number;
  activeUsers7d: number;
  activeUsers30d: number;
  totalAttempts: number;
  attempts7d: number;
  verifiedChallengePasses: number;
  averageMastery: number;
  admins: number;
}

export interface DailyActivity {
  day: string;
  signups: number;
  activeUsers: number;
  attempts: number;
}

export interface ItemStat {
  itemType: string;
  itemId: string;
  attempts: number;
  learners: number;
  correctRate: number;
  avgHints: number;
}

export interface ModuleStat {
  moduleId: string;
  learners: number;
  attempts: number;
  correctRate: number;
  avgMastery: number | null;
}

export interface AdminUser {
  userId: string;
  email: string;
  displayName: string | null;
  createdAt: number;
  lastActiveAt: number | null;
  attempts: number;
  overallMastery: number | null;
  currentStreak: number | null;
  isAdmin: boolean;
}

type Row = Record<string, unknown>;
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const numOrNull = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const time = (v: unknown) => (v ? Date.parse(String(v)) : null);

export const toOverview = (r: Row): AdminOverview => ({
  totalUsers: num(r.total_users),
  newUsers7d: num(r.new_users_7d),
  activeUsers7d: num(r.active_users_7d),
  activeUsers30d: num(r.active_users_30d),
  totalAttempts: num(r.total_attempts),
  attempts7d: num(r.attempts_7d),
  verifiedChallengePasses: num(r.verified_challenge_passes),
  averageMastery: num(r.average_mastery),
  admins: num(r.admins),
});

export const toDaily = (r: Row): DailyActivity => ({
  day: String(r.day),
  signups: num(r.signups),
  activeUsers: num(r.active_users),
  attempts: num(r.attempts),
});

export const toItemStat = (r: Row): ItemStat => ({
  itemType: String(r.item_type),
  itemId: String(r.item_id),
  attempts: num(r.attempts),
  learners: num(r.learners),
  correctRate: num(r.correct_rate),
  avgHints: num(r.avg_hints),
});

export const toModuleStat = (r: Row): ModuleStat => ({
  moduleId: String(r.module_id),
  learners: num(r.learners),
  attempts: num(r.attempts),
  correctRate: num(r.correct_rate),
  avgMastery: numOrNull(r.avg_mastery),
});

export const toAdminUser = (r: Row): AdminUser => ({
  userId: String(r.user_id),
  email: String(r.email ?? ''),
  displayName: (r.display_name as string | null) ?? null,
  createdAt: time(r.created_at) ?? 0,
  lastActiveAt: time(r.last_active_at),
  attempts: num(r.attempts),
  overallMastery: numOrNull(r.overall_mastery),
  currentStreak: numOrNull(r.current_streak),
  isAdmin: Boolean(r.is_admin),
});

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Accounts are not configured for this build.');
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.code === '42501' ? 'Admin access required.' : error.message);
  return data as T;
}

/** Whether the signed-in user is an admin. False when signed out or local-only. */
export function useIsAdmin() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const query = useQuery({
    queryKey: ['is-admin', userId],
    queryFn: () => rpc<boolean>('is_admin'),
    enabled: !!userId && !!supabase,
    staleTime: 5 * 60_000,
  });
  return { isAdmin: !!userId && query.data === true, loading: !!userId && query.isLoading, error: query.error };
}

export const PAGE_SIZE = 25;

export function useAdminOverview(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'overview'], queryFn: async () => toOverview(await rpc<Row>('admin_overview')), enabled });
}

export function useAdminActivity(enabled: boolean, days = 30) {
  return useQuery({
    queryKey: ['admin', 'activity', days],
    queryFn: async () => (await rpc<Row[]>('admin_daily_activity', { days })).map(toDaily),
    enabled,
  });
}

export function useAdminModuleStats(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'modules'], queryFn: async () => (await rpc<Row[]>('admin_module_stats')).map(toModuleStat), enabled });
}

export function useAdminItemStats(enabled: boolean, minAttempts = 5) {
  return useQuery({
    queryKey: ['admin', 'items', minAttempts],
    queryFn: async () => (await rpc<Row[]>('admin_item_stats', { min_attempts: minAttempts, max_rows: 50 })).map(toItemStat),
    enabled,
  });
}

export function useAdminUsers(enabled: boolean, search: string) {
  return useInfiniteQuery({
    queryKey: ['admin', 'users', search],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await rpc<Row[]>('admin_list_users', { search: search || null, max_rows: PAGE_SIZE, skip: pageParam })).map(toAdminUser),
    getNextPageParam: (last, pages) => (last.length < PAGE_SIZE ? undefined : pages.length * PAGE_SIZE),
    enabled,
  });
}

export function useSetAdmin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => rpc<void>('admin_set_admin', { target: userId, make_admin: makeAdmin }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
}

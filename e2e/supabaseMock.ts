import type { Page, Route } from '@playwright/test';

/**
 * Stands in for Supabase Auth and PostgREST in e2e tests. The e2e build points
 * EXPO_PUBLIC_SUPABASE_URL at this address; nothing here talks to a real backend.
 */
export const SUPABASE_URL = 'http://127.0.0.1:54321';

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  password: string;
  admin: boolean;
}

export const LEARNER: MockUser = { id: '00000000-0000-4000-8000-00000000000b', email: 'learner@example.com', displayName: 'Learner', password: 'learner123', admin: false };
export const ADMIN: MockUser = { id: '00000000-0000-4000-8000-00000000000a', email: 'admin@example.com', displayName: 'Ada Admin', password: 'admin1234', admin: true };

const userJson = (u: MockUser) => ({
  id: u.id,
  aud: 'authenticated',
  role: 'authenticated',
  email: u.email,
  email_confirmed_at: '2026-10-01T00:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: { display_name: u.displayName },
  identities: [{ id: u.id, provider: 'email' }],
  created_at: '2026-10-01T00:00:00Z',
});

const session = (u: MockUser) => ({
  access_token: `token-${u.id}`,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: `refresh-${u.id}`,
  user: userJson(u),
});

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });

const days = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    day: new Date(Date.now() - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10),
    signups: i % 3,
    active_users: 2 + (i % 5),
    attempts: 10 + i,
  }));

export interface MockState {
  signUps: { email: string; displayName?: string }[];
  resetRequests: string[];
  adminChanges: { target: string; makeAdmin: boolean }[];
  rpcCalls: string[];
}

export async function mockSupabase(page: Page, users: MockUser[] = [LEARNER, ADMIN]): Promise<MockState> {
  const state: MockState = { signUps: [], resetRequests: [], adminChanges: [], rpcCalls: [] };
  const userByToken = (route: Route) => {
    const auth = route.request().headers()['authorization'] ?? '';
    return users.find((u) => auth === `Bearer token-${u.id}`);
  };

  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    const url = new URL(req.url());
    const body = req.postDataJSON?.() ?? {};

    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') {
      const u = users.find((x) => x.email === body.email && x.password === body.password);
      return u ? json(route, 200, session(u)) : json(route, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
    }
    if (url.pathname === '/auth/v1/signup') {
      state.signUps.push({ email: body.email, displayName: body.data?.display_name });
      // Email confirmation is on: Supabase returns the user without a session.
      return json(route, 200, { ...userJson({ ...LEARNER, id: '00000000-0000-4000-8000-0000000000cc', email: body.email, displayName: body.data?.display_name ?? '' }), email_confirmed_at: null });
    }
    if (url.pathname === '/auth/v1/recover') {
      state.resetRequests.push(body.email);
      return json(route, 200, {});
    }
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    if (url.pathname === '/auth/v1/user') {
      const u = userByToken(route);
      return u ? json(route, 200, userJson(u)) : json(route, 401, { msg: 'invalid token' });
    }

    if (url.pathname.startsWith('/rest/v1/rpc/')) {
      const fn = url.pathname.slice('/rest/v1/rpc/'.length);
      state.rpcCalls.push(fn);
      const u = userByToken(route);
      if (fn === 'is_admin') return json(route, 200, !!u?.admin);
      if (!u?.admin) return json(route, 403, { code: '42501', message: 'admin access required' });
      switch (fn) {
        case 'admin_overview':
          return json(route, 200, {
            total_users: 128, new_users_7d: 9, active_users_7d: 41, active_users_30d: 77, total_attempts: 5321,
            attempts_7d: 812, verified_challenge_passes: 233, average_mastery: 0.42, admins: 1,
          });
        case 'admin_daily_activity':
          return json(route, 200, days(body.days ?? 30));
        case 'admin_module_stats':
          return json(route, 200, [
            { module_id: 'fundamentals', learners: 90, attempts: 2100, correct_rate: 0.81, avg_mastery: 0.55 },
            { module_id: 'concurrency', learners: 12, attempts: 140, correct_rate: 0.46, avg_mastery: 0.21 },
          ]);
        case 'admin_item_stats':
          return json(route, 200, [
            { item_type: 'check', item_id: 'f1-c1', attempts: 60, learners: 40, correct_rate: 0.35, avg_hints: 1.2 },
            { item_type: 'challenge', item_id: 'boss-grade-report', attempts: 25, learners: 18, correct_rate: 0.52, avg_hints: 0.4 },
          ]);
        case 'admin_list_users': {
          const all = [
            { user_id: ADMIN.id, email: ADMIN.email, display_name: ADMIN.displayName, created_at: '2026-09-01T00:00:00Z', last_active_at: '2026-10-18T10:00:00Z', attempts: 120, overall_mastery: 0.6, current_streak: 5, is_admin: true },
            { user_id: LEARNER.id, email: LEARNER.email, display_name: LEARNER.displayName, created_at: '2026-10-02T00:00:00Z', last_active_at: null, attempts: 0, overall_mastery: null, current_streak: null, is_admin: false },
          ];
          const q = String(body.search ?? '').toLowerCase();
          return json(route, 200, all.filter((r) => !q || r.email.includes(q) || r.display_name.toLowerCase().includes(q)));
        }
        case 'admin_set_admin':
          state.adminChanges.push({ target: body.target, makeAdmin: body.make_admin });
          return json(route, 200, null);
      }
      return json(route, 404, { message: `unknown function ${fn}` });
    }

    // Progress sync tables: accept writes, return no remote rows.
    if (url.pathname.startsWith('/rest/v1/')) {
      return req.method() === 'GET' ? json(route, 200, []) : route.fulfill({ status: 201, headers: { 'access-control-allow-origin': '*' } });
    }
    return json(route, 404, {});
  });
  return state;
}

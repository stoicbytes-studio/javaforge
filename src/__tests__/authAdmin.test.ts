import { describeItem } from '@/features/admin/describeItem';
import { toAdminUser, toItemStat, toOverview } from '@/features/admin/adminApi';
import { friendlyAuthError, resetSchema, safeRedirect, signUpSchema } from '@/features/auth/AuthScreens';
import { parseAuthParams } from '@/services/auth';
import { CHALLENGES, LESSONS } from '@/content';

describe('auth forms', () => {
  const valid = { displayName: 'Ada', email: 'ada@example.com', password: 'secret123', confirm: 'secret123' };

  it('accepts a valid sign-up and normalises whitespace', () => {
    const r = signUpSchema.safeParse({ ...valid, email: '  ada@example.com ', displayName: ' Ada ' });
    expect(r.success).toBe(true);
    expect(r.success && r.data.email).toBe('ada@example.com');
  });

  it.each([
    [{ password: 'short1', confirm: 'short1' }, 'password'],
    [{ password: 'lettersonly', confirm: 'lettersonly' }, 'password'],
    [{ password: '12345678', confirm: '12345678' }, 'password'],
    [{ confirm: 'different1' }, 'confirm'],
    [{ email: 'not-an-email' }, 'email'],
    [{ displayName: 'A' }, 'displayName'],
  ])('rejects %o on %s', (patch, field) => {
    const r = signUpSchema.safeParse({ ...valid, ...patch });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.path[0] === field)).toBe(true);
  });

  it('requires matching passwords when resetting', () => {
    expect(resetSchema.safeParse({ password: 'newpass12', confirm: 'newpass12' }).success).toBe(true);
    expect(resetSchema.safeParse({ password: 'newpass12', confirm: 'newpass13' }).success).toBe(false);
  });

  it('only redirects within the app after sign-in', () => {
    expect(safeRedirect('/admin')).toBe('/admin');
    expect(safeRedirect('/learn/oop')).toBe('/learn/oop');
    expect(safeRedirect('https://evil.example')).toBe('/');
    expect(safeRedirect('//evil.example')).toBe('/');
    expect(safeRedirect('/\\evil.example')).toBe('/');
    expect(safeRedirect(undefined)).toBe('/');
  });

  it('turns common Supabase errors into plain guidance', () => {
    expect(friendlyAuthError(new Error('Invalid login credentials'))).toMatch(/do not match/);
    expect(friendlyAuthError(new Error('Email not confirmed'))).toMatch(/Confirm your email/);
    expect(friendlyAuthError(new Error('Something else'))).toBe('Something else');
  });

  it('reads auth tokens from query strings and fragments of deep links', () => {
    expect(parseAuthParams('javaforge://reset-password#access_token=a&refresh_token=r&type=recovery')).toEqual({
      access_token: 'a',
      refresh_token: 'r',
      type: 'recovery',
    });
    expect(parseAuthParams('javaforge://sign-in?code=xyz')).toEqual({ code: 'xyz' });
    expect(parseAuthParams('javaforge://sign-in')).toEqual({});
  });
});

describe('admin reports', () => {
  it('maps RPC rows, treating missing values as zero or unknown', () => {
    expect(toOverview({ total_users: '12', average_mastery: 0.5 }).totalUsers).toBe(12);
    expect(toOverview({}).activeUsers7d).toBe(0);
    const u = toAdminUser({ user_id: 'u1', email: 'a@b.c', created_at: '2026-10-01T00:00:00Z', last_active_at: null, attempts: '3', overall_mastery: null, is_admin: true });
    expect(u).toMatchObject({ attempts: 3, lastActiveAt: null, overallMastery: null, isAdmin: true, displayName: null });
    expect(toItemStat({ item_type: 'check', item_id: 'x', attempts: 5, learners: 2, correct_rate: '0.4', avg_hints: 1 }).correctRate).toBe(0.4);
  });

  it('describes items with titles and links into the app', () => {
    const lesson = LESSONS[0]!;
    const check = lesson.checks[0]!;
    const d = describeItem('check', check.id);
    expect(d.href).toBe(`/learn/${lesson.moduleId}/${lesson.id}`);
    expect(d.title).not.toMatch(/`/);
    const c = CHALLENGES[0]!;
    expect(describeItem('challenge', c.id)).toMatchObject({ title: c.title, href: `/practice/${c.id}` });
  });

  it('keeps unknown ids from older content versions readable', () => {
    expect(describeItem('check', 'removed-check')).toEqual({ title: 'removed-check', context: 'check (not in this app version)' });
  });
});

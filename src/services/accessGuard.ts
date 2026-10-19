/**
 * Decides what a visitor may see. When accounts are configured the learning
 * portal needs a signed-in session; the landing page and auth screens are
 * public. Local-only builds (no Supabase) have no accounts, so nothing is gated.
 */

export const PUBLIC_PATHS = ['/welcome', '/sign-in', '/sign-up', '/forgot-password', '/reset-password'] as const;
/**
 * Public screens that make no sense once signed in. /sign-in and /sign-up are left
 * out on purpose: they send the learner on to their requested page themselves, and
 * /reset-password must stay reachable.
 */
const GUEST_ONLY_PATHS = ['/welcome', '/forgot-password'];

export type AccessDecision = { action: 'wait' } | { action: 'allow' } | { action: 'redirect'; to: string };

export interface AccessInput {
  configured: boolean;
  loading: boolean;
  signedIn: boolean;
  recovering: boolean;
  pathname: string;
}

const normalise = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);

export const isPublicPath = (pathname: string) => (PUBLIC_PATHS as readonly string[]).includes(normalise(pathname));

export function decideAccess({ configured, loading, signedIn, recovering, pathname }: AccessInput): AccessDecision {
  const path = normalise(pathname);
  if (!configured) return { action: 'allow' };
  if (loading) return { action: 'wait' };
  if (recovering) return path === '/reset-password' ? { action: 'allow' } : { action: 'redirect', to: '/reset-password' };
  if (!signedIn) return isPublicPath(path) ? { action: 'allow' } : { action: 'redirect', to: '/welcome' };
  return GUEST_ONLY_PATHS.includes(path) ? { action: 'redirect', to: '/' } : { action: 'allow' };
}

/**
 * Public runtime configuration. Only EXPO_PUBLIC_* values are inlined into
 * the client bundle — never put a Supabase service-role key or any other
 * secret here.
 */
/**
 * Reduces a pasted Supabase address to its origin. Supabase answers "Invalid path
 * specified in request URL" when the base URL has a trailing slash or an API path
 * such as /rest/v1 or /auth/v1 appended, which is an easy mistake to make when
 * copying it into hosting settings.
 */
export function normaliseSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return '';
  }
}

export const env = {
  supabaseUrl: normaliseSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''),
  supabaseAnonKey: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
  executorUrl: (process.env.EXPO_PUBLIC_EXECUTOR_URL ?? '').trim(),
};

export const isSupabaseConfigured = env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;

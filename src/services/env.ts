/**
 * Public runtime configuration. Only EXPO_PUBLIC_* values are inlined into
 * the client bundle — never put a Supabase service-role key or any other
 * secret here.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  executorUrl: process.env.EXPO_PUBLIC_EXECUTOR_URL ?? '',
};

export const isSupabaseConfigured = env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;

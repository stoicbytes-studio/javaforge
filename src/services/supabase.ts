import './polyfills';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env, isSupabaseConfigured } from './env';

/**
 * Supabase client using only the public anon key. Row Level Security on every
 * user-owned table (supabase/migrations) is what protects learner data; the
 * client never holds privileged credentials.
 *
 * Null when the app is not configured for accounts (local-only mode).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { isSupabaseConfigured } from './env';
import { supabase } from './supabase';

export interface AuthValue {
  /** False when no Supabase project is configured: the app runs local-only. */
  configured: boolean;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  /** Sends a reset link. Resolves the same way whether or not the address has an account. */
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  /** True after the learner opened a password-recovery link, until they set a new password. */
  recovering: boolean;
}

const notConfigured = async (): Promise<never> => {
  throw new Error('Accounts are not configured for this build.');
};

const AuthContext = createContext<AuthValue>({
  configured: false,
  loading: false,
  session: null,
  signIn: notConfigured,
  signUp: notConfigured,
  signOut: async () => undefined,
  requestPasswordReset: notConfigured,
  updatePassword: notConfigured,
  recovering: false,
});

/** Where auth emails send the learner back to (web origin or the app's deep link). */
export const authRedirectUrl = (path: string) => Linking.createURL(path);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => active && setSession(data.session))
      .finally(() => active && setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // On web, supabase-js reads tokens from the URL itself (detectSessionInUrl).
  // Native apps receive confirmation and recovery links as deep links instead.
  const incomingUrl = Linking.useLinkingURL();
  useEffect(() => {
    if (!supabase || Platform.OS === 'web' || !incomingUrl) return;
    const params = parseAuthParams(incomingUrl);
    if (params.access_token && params.refresh_token) {
      supabase.auth
        .setSession({ access_token: params.access_token, refresh_token: params.refresh_token })
        .then(({ error }) => !error && params.type === 'recovery' && setRecovering(true));
    } else if (params.code) {
      supabase.auth.exchangeCodeForSession(params.code).then(({ error }) => !error && params.type === 'recovery' && setRecovering(true));
    }
  }, [incomingUrl]);

  const value = useMemo<AuthValue>(() => {
    if (!supabase) {
      return {
        configured: false,
        loading: false,
        session: null,
        signIn: notConfigured,
        signUp: notConfigured,
        signOut: async () => undefined,
        requestPasswordReset: notConfigured,
        updatePassword: notConfigured,
        recovering: false,
      };
    }
    const client = supabase;
    return {
      configured: true,
      loading,
      session,
      signIn: async (email, password) => {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password, displayName) => {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: displayName ? { display_name: displayName } : undefined,
            emailRedirectTo: authRedirectUrl('/sign-in'),
          },
        });
        if (error) throw error;
        return { needsConfirmation: !data.session };
      },
      signOut: async () => {
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },
      requestPasswordReset: async (email) => {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl('/reset-password') });
        // Rate limits and outages are worth reporting; "no such user" is never revealed by Supabase.
        if (error) throw error;
      },
      updatePassword: async (password) => {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setRecovering(false);
      },
      recovering,
    };
  }, [loading, session, recovering]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Reads auth parameters from both the query string and the fragment of a redirect URL. */
export function parseAuthParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash?.split('?')[1] ?? '';
  for (const part of [query, hash]) {
    for (const [k, v] of new URLSearchParams(part)) out[k] = v;
  }
  return out;
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}

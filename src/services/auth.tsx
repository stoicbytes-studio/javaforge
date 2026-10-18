import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured } from './env';
import { supabase } from './supabase';

export interface AuthValue {
  /** False when no Supabase project is configured: the app runs local-only. */
  configured: boolean;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
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
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => active && setSession(data.session))
      .finally(() => active && setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(() => {
    if (!supabase) {
      return { configured: false, loading: false, session: null, signIn: notConfigured, signUp: notConfigured, signOut: async () => undefined };
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
      signUp: async (email, password) => {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        return { needsConfirmation: !data.session };
      },
      signOut: async () => {
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },
    };
  }, [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { decideAccess } from '@/services/accessGuard';
import { AuthProvider, useAuth } from '@/services/auth';
import { useAutoSync } from '@/services/sync';
import { useHasHydrated } from '@/store/learningStore';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

/** Mirrors local progress to Supabase while signed in (no-op in local-only mode). */
function SyncManager() {
  const model = useLearnerModel();
  useAutoSync({ mastery: model.mastery, streak: model.streak, achievements: model.achievements });
  return null;
}

/**
 * Enforces access rules on every navigation: with accounts configured, only the
 * landing page and sign-in screens are public; the learning portal needs a session.
 * A password-recovery link signs the learner in, so they are sent to choose a new
 * password first.
 */
function AccessGate() {
  const { configured, loading, session, recovering } = useAuth();
  const pathname = usePathname();
  const decision = decideAccess({ configured, loading, signedIn: !!session, recovering, pathname });
  const target = decision.action === 'redirect' ? decision.to : undefined;
  useEffect(() => {
    if (target) router.replace(target as never);
  }, [target]);
  return null;
}

function ThemedStack() {
  const { colors, scheme } = useTheme();
  const { configured, loading, session, recovering } = useAuth();
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const decision = decideAccess({ configured, loading, signedIn: !!session, recovering, pathname });
  const blocked = decision.action !== 'allow';

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} accessibilityLabel="Loading your progress" />
      </View>
    );
  }
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {session ? <SyncManager /> : null}
      <AccessGate />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      {/* Covers the screens until the stored session is known and any redirect has happened,
          so a signed-out visitor never sees a flash of the learning portal. */}
      {blocked ? (
        <View
          pointerEvents="auto"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}
        >
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading" />
        </View>
      ) : null}
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }),
  );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ThemedStack />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

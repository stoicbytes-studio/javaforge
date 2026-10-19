import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useLearnerModel } from '@/features/progress/useLearnerModel';
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

/** A password-recovery link signs the learner in; send them to choose a new password first. */
function RecoveryRedirect() {
  const { recovering } = useAuth();
  const pathname = usePathname();
  useEffect(() => {
    if (recovering && pathname !== '/reset-password') router.replace('/reset-password');
  }, [recovering, pathname]);
  return null;
}

function ThemedStack() {
  const { session } = useAuth();
  const { colors, scheme } = useTheme();
  const hydrated = useHasHydrated();
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
      <RecoveryRedirect />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
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

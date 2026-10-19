import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState, PageHeader, Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useAuth } from '@/services/auth';
import { useSync } from '@/services/sync';
import { useLearningStore } from '@/store/learningStore';
import { spacing } from '@/theme/tokens';

export function AccountScreen() {
  const auth = useAuth();
  const model = useLearnerModel();
  const sync = useSync({ mastery: model.mastery, streak: model.streak, achievements: model.achievements });
  const lastSyncedAt = useLearningStore((s) => s.lastSyncedAt);

  return (
    <Screen maxWidth={640}>
      <BackLink href="/settings" label="Settings" />
      <PageHeader eyebrow="Account" title="Account and sync" />
      {!auth.configured ? (
        <EmptyState
          icon="user"
          title="Local-only mode"
          body="This build has no Supabase project configured, so accounts are disabled. Everything works offline and is stored on this device. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable sign-in and sync."
        />
      ) : auth.loading ? (
        <Text color="textMuted">Checking your session…</Text>
      ) : auth.session ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="heading">{(auth.session.user.user_metadata?.display_name as string | undefined) ?? 'Signed in'}</Text>
          <Text color="textMuted">{auth.session.user.email}</Text>
          <Text variant="small" color="textMuted">
            {lastSyncedAt ? `Last synced ${new Date(lastSyncedAt).toLocaleString()}.` : 'Not synced yet.'} Progress syncs automatically a few seconds after each attempt.
          </Text>
          {sync.error ? (
            <Text variant="small" color="danger">
              Sync failed: {(sync.error as Error).message}
            </Text>
          ) : null}
          <View style={styles.row}>
            <Button label="Sync now" icon="refresh" loading={sync.isPending} onPress={() => sync.mutate()} />
            <Button label="Change password" variant="secondary" onPress={() => router.push('/forgot-password')} />
            <Button label="Sign out" variant="ghost" icon="logOut" onPress={() => auth.signOut()} />
          </View>
        </Card>
      ) : (
        <Card style={{ gap: spacing.md }}>
          <Text variant="heading">Sync your progress</Text>
          <Text color="textMuted">
            Create a free account to keep your progress in sync across web, Android and iOS. Progress you already made on this device is merged in when you sign in.
          </Text>
          <View style={styles.row}>
            <Button label="Sign in" onPress={() => router.push('/sign-in')} />
            <Button label="Create account" variant="secondary" onPress={() => router.push('/sign-up')} />
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
});

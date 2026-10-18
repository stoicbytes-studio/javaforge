import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { z } from 'zod';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState, PageHeader, Screen } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useAuth } from '@/services/auth';
import { useSync } from '@/services/sync';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(72, 'Passwords are limited to 72 characters.'),
});
type Credentials = z.infer<typeof credentialsSchema>;

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
          <Text variant="heading">Signed in</Text>
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
            <Button label="Sign out" variant="ghost" onPress={() => auth.signOut()} />
          </View>
        </Card>
      ) : (
        <SignInForm />
      )}
    </Screen>
  );
}

function SignInForm() {
  const { colors } = useTheme();
  const auth = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<{ tone: 'danger' | 'success'; text: string }>();
  const { control, handleSubmit, formState } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async ({ email, password }) => {
    setMessage(undefined);
    try {
      if (mode === 'signin') {
        await auth.signIn(email, password);
      } else {
        const { needsConfirmation } = await auth.signUp(email, password);
        if (needsConfirmation) setMessage({ tone: 'success', text: 'Check your inbox to confirm your email, then sign in.' });
      }
    } catch (e) {
      setMessage({ tone: 'danger', text: (e as Error).message });
    }
  });

  return (
    <Card style={{ gap: spacing.md }}>
      <SegmentedTabs
        label="Account action"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'signin', label: 'Sign in' },
          { value: 'signup', label: 'Create account' },
        ]}
      />
      <Text variant="small" color="textMuted">
        Your existing local progress is merged into your account when you sign in.
      </Text>
      {(['email', 'password'] as const).map((name) => (
        <View key={name} style={{ gap: spacing.xs }}>
          <Text variant="small" weight="600">
            {name === 'email' ? 'Email' : 'Password'}
          </Text>
          <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={name === 'password'}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={name === 'email' ? 'email' : mode === 'signin' ? 'current-password' : 'new-password'}
                keyboardType={name === 'email' ? 'email-address' : 'default'}
                accessibilityLabel={name === 'email' ? 'Email' : 'Password'}
                style={[styles.input, { color: colors.text, borderColor: formState.errors[name] ? colors.danger : colors.border, backgroundColor: colors.surfaceAlt }]}
              />
            )}
          />
          {formState.errors[name] ? (
            <Text variant="small" color="danger">
              {formState.errors[name]?.message}
            </Text>
          ) : null}
        </View>
      ))}
      {message ? (
        <Text variant="small" color={message.tone}>
          {message.text}
        </Text>
      ) : null}
      <Button label={mode === 'signin' ? 'Sign in' : 'Create account'} onPress={() => submit()} loading={formState.isSubmitting} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 44, fontSize: 15 },
});

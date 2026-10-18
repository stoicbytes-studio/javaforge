import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Card, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { useAuth } from '@/services/auth';
import { env } from '@/services/env';
import { useExecutor } from '@/services/execution/useExecutor';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { DailyMinutes, ExecutionMode, MotionPreference, ThemePreference } from '@/types/progress';

const profileSchema = z.object({
  displayName: z.string().trim().max(40, 'Keep it under 40 characters.'),
  executorUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v), 'Enter a full http(s) URL, or leave empty to use the default.'),
});
type ProfileForm = z.infer<typeof profileSchema>;

export function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useLearningStore((s) => s.settings);
  const update = useLearningStore((s) => s.updateSettings);
  const resetProgress = useLearningStore((s) => s.resetProgress);
  const attemptCount = useLearningStore((s) => s.attempts.length);
  const auth = useAuth();
  const exec = useExecutor();
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, formState } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: settings.displayName ?? '', executorUrl: settings.executorUrl ?? '' },
  });
  const save = handleSubmit((v) => {
    update({ displayName: v.displayName || undefined, executorUrl: v.executorUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  });

  return (
    <Screen maxWidth={820}>
      <PageHeader eyebrow="Settings" title="Preferences" subtitle="Study schedule, appearance, code execution and your account." />

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="Daily study schedule" icon="clock" />
        <Text variant="small" color="textMuted">
          Sizes your daily plan and weekly goals. Recommendations are fitted into this budget.
        </Text>
        <SegmentedTabs<`${DailyMinutes}`>
          label="Minutes per day"
          value={`${settings.dailyMinutes}`}
          onChange={(v) => update({ dailyMinutes: Number(v) as DailyMinutes })}
          options={[
            { value: '15', label: '15 min' },
            { value: '30', label: '30 min' },
            { value: '60', label: '60 min' },
            { value: '90', label: '90 min' },
          ]}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="Appearance and motion" icon="sun" />
        <Text variant="small" weight="600">
          Theme
        </Text>
        <SegmentedTabs<ThemePreference>
          label="Theme"
          value={settings.theme}
          onChange={(theme) => update({ theme })}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'system', label: 'Follow system' },
          ]}
        />
        <Text variant="small" weight="600">
          Motion
        </Text>
        <SegmentedTabs<MotionPreference>
          label="Motion"
          value={settings.motion}
          onChange={(motion) => update({ motion })}
          options={[
            { value: 'system', label: 'Follow system' },
            { value: 'reduce', label: 'Reduce motion' },
            { value: 'full', label: 'Full motion' },
          ]}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <SectionHeader title="Profile and code execution" icon="terminal" />
        <FormField control={control} name="displayName" label="Display name" placeholder="Shown on the dashboard" error={formState.errors.displayName?.message} />
        <Text variant="small" weight="600">
          Execution mode
        </Text>
        <SegmentedTabs<ExecutionMode>
          label="Execution mode"
          value={settings.executionMode}
          onChange={(executionMode) => update({ executionMode })}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'remote', label: 'Always remote' },
            { value: 'simulation', label: 'Simulation only' },
          ]}
        />
        <Text variant="small" color="textMuted">
          Auto uses the execution service when it is healthy and falls back to clearly labelled simulation otherwise.
          {env.executorUrl ? ` Default service: ${env.executorUrl}.` : ' No default service is configured in this build.'}
        </Text>
        <FormField
          control={control}
          name="executorUrl"
          label="Execution service URL (optional override)"
          placeholder="https://executor.example.com"
          error={formState.errors.executorUrl?.message}
        />
        <View style={styles.row}>
          <Icon name={exec.executor.mode === 'remote' ? 'check' : 'info'} size={16} color={exec.executor.mode === 'remote' ? colors.success : colors.warning} />
          <Text variant="small" color="textMuted" style={{ flex: 1 }}>
            Status: {exec.executor.mode === 'remote' ? `connected${exec.health?.javaVersion ? ` (Java ${exec.health.javaVersion})` : ''}` : exec.reason}
          </Text>
        </View>
        <Button label={saved ? 'Saved' : 'Save'} icon="check" onPress={() => save()} disabled={!formState.isDirty && !saved} style={{ alignSelf: 'flex-start' }} />
      </Card>

      <LinkCard href="/settings/account" accessibilityLabel="Account and sync">
        <View style={styles.row}>
          <Icon name="user" color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">Account and sync</Text>
            <Text variant="small" color="textMuted">
              {!auth.configured
                ? 'Local-only mode: progress is stored on this device.'
                : auth.session
                  ? `Signed in as ${auth.session.user.email ?? 'learner'}`
                  : 'Sign in to back up and sync progress across devices.'}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} />
        </View>
      </LinkCard>

      <Card style={{ gap: spacing.sm, borderColor: colors.danger }}>
        <SectionHeader title="Reset progress" icon="alert" />
        <Text variant="small" color="textMuted">
          Deletes all {attemptCount} attempts, revision cards, notes, bookmarks and drafts on this device. Settings are kept. Synced cloud data is not deleted.
        </Text>
        {confirmReset ? (
          <View style={[styles.row, { flexWrap: 'wrap' }]}>
            <Button
              label="Yes, delete my local progress"
              variant="danger"
              onPress={() => {
                resetProgress();
                setConfirmReset(false);
              }}
            />
            <Button label="Cancel" variant="ghost" onPress={() => setConfirmReset(false)} />
          </View>
        ) : (
          <Button label="Reset progress…" variant="danger" onPress={() => setConfirmReset(true)} style={{ alignSelf: 'flex-start' }} />
        )}
      </Card>
    </Screen>
  );
}

function FormField({
  control,
  name,
  label,
  placeholder,
  error,
}: {
  control: ReturnType<typeof useForm<ProfileForm>>['control'];
  name: keyof ProfileForm;
  label: string;
  placeholder: string;
  error?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="small" weight="600">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={label}
            style={[styles.input, { color: colors.text, borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surfaceAlt }]}
          />
        )}
      />
      {error ? (
        <Text variant="small" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 44, fontSize: 15 },
});

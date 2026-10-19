import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useAuth } from '@/services/auth';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const email = z.string().trim().email('Enter a valid email address.');
const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(72, 'Passwords are limited to 72 characters.')
  .refine((p) => /[A-Za-z]/.test(p) && /[0-9]/.test(p), 'Use at least one letter and one number.');

export const signInSchema = z.object({ email, password: z.string().min(1, 'Enter your password.') });
export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Use at least 2 characters.').max(60, 'Use at most 60 characters.'),
    email,
    password: newPassword,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' });
export const forgotSchema = z.object({ email });
export const resetSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' });

/** Only same-app paths are accepted as post-sign-in destinations (no open redirects). */
export function safeRedirect(value: unknown): Href {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? (value as Href) : '/';
}

/** Supabase error messages are fine to show, but "invalid credentials" deserves friendlier wording. */
export function friendlyAuthError(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(message)) return 'That email and password do not match an account.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email address first: open the link we sent you, then sign in.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Wait a minute and try again.';
  if (/network|fetch/i.test(message)) return 'Could not reach the server. Check your connection and try again.';
  return message;
}

function AuthFrame({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
              <Text variant="small" weight="800" color="primary" mono>
                JF
              </Text>
            </View>
            <Text variant="heading" weight="800">
              JavaForge
            </Text>
          </View>
          <View style={{ gap: spacing.xs }}>
            <Text variant="title" accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? <Text color="textMuted">{subtitle}</Text> : null}
          </View>
          {auth.configured ? (
            <Card style={{ gap: spacing.md }}>{children}</Card>
          ) : (
            <Card style={{ gap: spacing.sm }}>
              <Text variant="heading">Accounts are not enabled in this build</Text>
              <Text color="textMuted">
                JavaForge is running in local-only mode: your progress is saved on this device and everything works without an account.
                To enable sign-in, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY and apply the migrations in supabase/.
              </Text>
            </Card>
          )}
          {footer}
          <Link href={auth.configured ? '/welcome' : '/'} style={{ alignSelf: 'center' }}>
            <Text variant="small" color="textMuted">
              {auth.configured ? 'Back to the home page' : 'Continue without an account'}
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Notice({ tone, children }: { tone: 'danger' | 'success'; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.notice, { backgroundColor: tone === 'danger' ? colors.dangerMuted : colors.successMuted }]}
    >
      <Icon name={tone === 'danger' ? 'alert' : 'check'} size={16} color={tone === 'danger' ? colors.danger : colors.success} />
      <Text variant="small" color={tone} style={{ flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

function FooterLink({ prompt, label, href }: { prompt: string; label: string; href: Href }) {
  return (
    <View style={styles.footer}>
      <Text variant="small" color="textMuted">
        {prompt}
      </Text>
      <Link href={href}>
        <Text variant="small" color="primary" weight="600">
          {label}
        </Text>
      </Link>
    </View>
  );
}

/** Leaves the auth screen once a session exists (e.g. after signing in). */
function useLeaveWhenSignedIn(destination: Href) {
  const { session, recovering } = useAuth();
  useEffect(() => {
    if (session && !recovering) router.replace(destination);
  }, [session, recovering, destination]);
}

export function SignInScreen() {
  const auth = useAuth();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const destination = safeRedirect(params.redirect);
  useLeaveWhenSignedIn(destination);
  const [error, setError] = useState<string>();
  const { control, handleSubmit, formState } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const submit = handleSubmit(async ({ email: address, password }) => {
    setError(undefined);
    try {
      await auth.signIn(address, password);
    } catch (e) {
      setError(friendlyAuthError(e));
    }
  });
  const redirectQuery = params.redirect ? `?redirect=${encodeURIComponent(String(params.redirect))}` : '';

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to sync your progress across devices."
      footer={<FooterLink prompt="New to JavaForge?" label="Create an account" href={`/sign-up${redirectQuery}` as Href} />}
    >
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <FormField control={control} name="email" label="Email" autoComplete="email" keyboardType="email-address" returnKeyType="next" />
      <FormField control={control} name="password" label="Password" secureTextEntry autoComplete="current-password" returnKeyType="go" onSubmitEditing={() => submit()} />
      <Link href="/forgot-password" style={{ alignSelf: 'flex-end' }}>
        <Text variant="small" color="primary">
          Forgot password?
        </Text>
      </Link>
      <Button label="Sign in" onPress={() => submit()} loading={formState.isSubmitting} fullWidth />
      <Text variant="small" color="textSubtle">
        Progress you made on this device before signing in is merged into your account.
      </Text>
    </AuthFrame>
  );
}

export function SignUpScreen() {
  const auth = useAuth();
  const params = useLocalSearchParams<{ redirect?: string }>();
  useLeaveWhenSignedIn(safeRedirect(params.redirect));
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const { control, handleSubmit, formState } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', confirm: '' },
  });
  const submit = handleSubmit(async ({ displayName, email: address, password }) => {
    setError(undefined);
    try {
      const { needsConfirmation } = await auth.signUp(address, password, displayName);
      if (needsConfirmation) setSentTo(address);
    } catch (e) {
      setError(friendlyAuthError(e));
    }
  });

  if (sentTo) {
    return (
      <AuthFrame title="Check your inbox" footer={<FooterLink prompt="Confirmed already?" label="Sign in" href="/sign-in" />}>
        <Notice tone="success">We sent a confirmation link to {sentTo}. Open it on this device to activate your account, then sign in.</Notice>
        <Text variant="small" color="textMuted">
          No email after a few minutes? Check your spam folder, or create the account again to resend the link.
        </Text>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Free. Your progress syncs across web, Android and iOS."
      footer={<FooterLink prompt="Already have an account?" label="Sign in" href="/sign-in" />}
    >
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <FormField control={control} name="displayName" label="Display name" autoCapitalize="words" autoComplete="name" />
      <FormField control={control} name="email" label="Email" autoComplete="email" keyboardType="email-address" />
      <FormField
        control={control}
        name="password"
        label="Password"
        secureTextEntry
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
      />
      <FormField control={control} name="confirm" label="Confirm password" secureTextEntry autoComplete="new-password" onSubmitEditing={() => submit()} />
      <Button label="Create account" onPress={() => submit()} loading={formState.isSubmitting} fullWidth />
    </AuthFrame>
  );
}

export function ForgotPasswordScreen() {
  const auth = useAuth();
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });
  const submit = handleSubmit(async ({ email: address }) => {
    setError(undefined);
    try {
      await auth.requestPasswordReset(address);
      setSent(true);
    } catch (e) {
      setError(friendlyAuthError(e));
    }
  });

  return (
    <AuthFrame
      title="Reset your password"
      subtitle="We will email you a link to choose a new password."
      footer={<FooterLink prompt="Remembered it?" label="Back to sign in" href="/sign-in" />}
    >
      {sent ? (
        <Notice tone="success">If an account exists for that address, a reset link is on its way. The link opens JavaForge so you can set a new password.</Notice>
      ) : (
        <>
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <FormField control={control} name="email" label="Email" autoComplete="email" keyboardType="email-address" onSubmitEditing={() => submit()} />
          <Button label="Send reset link" onPress={() => submit()} loading={formState.isSubmitting} fullWidth />
        </>
      )}
    </AuthFrame>
  );
}

export function ResetPasswordScreen() {
  const auth = useAuth();
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const { control, handleSubmit, formState } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm: '' },
  });
  const submit = handleSubmit(async ({ password }) => {
    setError(undefined);
    try {
      await auth.updatePassword(password);
      setDone(true);
    } catch (e) {
      setError(friendlyAuthError(e));
    }
  });

  if (done) {
    return (
      <AuthFrame title="Password updated">
        <Notice tone="success">Your new password is saved and you are signed in.</Notice>
        <Button label="Go to dashboard" onPress={() => router.replace('/')} fullWidth />
      </AuthFrame>
    );
  }
  if (auth.configured && !auth.loading && !auth.session) {
    return (
      <AuthFrame title="Link expired or invalid" footer={<FooterLink prompt="Need a new link?" label="Reset password" href="/forgot-password" />}>
        <Text color="textMuted">Open the most recent reset link from your email on this device. Links can only be used once and expire after an hour.</Text>
      </AuthFrame>
    );
  }
  return (
    <AuthFrame title="Choose a new password">
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <FormField control={control} name="password" label="New password" secureTextEntry autoComplete="new-password" hint="At least 8 characters, with a letter and a number." />
      <FormField control={control} name="confirm" label="Confirm new password" secureTextEntry autoComplete="new-password" onSubmitEditing={() => submit()} />
      <Button label="Save password" onPress={() => submit()} loading={formState.isSubmitting} fullWidth />
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  column: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: spacing.lg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, borderRadius: radius.md },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, flexWrap: 'wrap' },
});

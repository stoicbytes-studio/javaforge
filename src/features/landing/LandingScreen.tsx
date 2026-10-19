import { Link, router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { BUG_HUNTS, CHALLENGES, INCIDENTS, INTERVIEW_QUESTIONS, LESSONS, MODULES, PROJECTS } from '@/content';
import { JAVA_RELEASES } from '@/content/versions/javaReleases';
import { useAuth } from '@/services/auth';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const FIRST_JAVA = Math.min(...JAVA_RELEASES.map((r) => r.version));
const LAST_JAVA = Math.max(...JAVA_RELEASES.map((r) => r.version));

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'book',
    title: 'A full Java roadmap',
    body: `${MODULES.length} domains from your first program to concurrency, JDBC, Spring Boot and production engineering. ${LESSONS.length} lessons so far, each with examples, a walkthrough, real-world context and common mistakes.`,
  },
  {
    icon: 'code',
    title: 'Code that really runs',
    body: `${CHALLENGES.length} coding, debugging and boss challenges with tests. Code runs on a real JVM when an execution service is connected; otherwise the app says it is simulating.`,
  },
  {
    icon: 'cpu',
    title: 'See inside the JVM',
    body: 'Step through stack frames, the heap, class loading and garbage collection. Clearly labelled as simplified models.',
  },
  {
    icon: 'bug',
    title: 'Bug Hunter and incidents',
    body: `${BUG_HUNTS.length} broken programs to diagnose and ${INCIDENTS.length} simulated production incidents to investigate with metrics and logs.`,
  },
  {
    icon: 'message',
    title: 'Interview Arena',
    body: `${INTERVIEW_QUESTIONS.length} questions with timed mock sessions and rubric-based feedback. Rubric scoring, not AI grading.`,
  },
  {
    icon: 'layers',
    title: `Java ${FIRST_JAVA} to ${LAST_JAVA}`,
    body: 'What is final and what is still preview in every release, checked by compiling on real JDKs. Includes LTS upgrade checklists.',
  },
  {
    icon: 'folder',
    title: 'Projects',
    body: `${PROJECTS.length} milestone-based builds, from an expense tracker to a production-ready service.`,
  },
  {
    icon: 'refresh',
    title: 'Spaced revision',
    body: 'Questions you miss come back at the right time, so you remember what you learned.',
  },
];

const STEPS: { title: string; body: string }[] = [
  { title: 'Learn', body: 'Read a lesson, run the examples, answer the checks.' },
  { title: 'Practise', body: 'Solve challenges, hunt bugs, answer interview questions.' },
  { title: 'Prove it', body: 'Mastery comes only from what you demonstrate, across six dimensions.' },
  { title: 'Remember', body: 'Spaced revision keeps it fresh and shows what to practise next.' },
];

export function LandingScreen() {
  const { colors } = useTheme();
  const { layout } = useLayout();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const wide = layout !== 'compact';
  const accounts = auth.configured;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}>
      <View style={[styles.nav, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.container}>
          <View style={styles.navInner}>
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
            {accounts ? (
              <View style={styles.row}>
                <Button label="Sign in" size="sm" variant="ghost" onPress={() => router.push('/sign-in')} />
                {wide ? <Button label="Create account" size="sm" onPress={() => router.push('/sign-up')} /> : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <Section>
        <View style={{ gap: spacing.lg, alignItems: wide ? 'center' : 'flex-start', paddingVertical: wide ? spacing.xxxl : spacing.xl }}>
          <View style={[styles.pill, { backgroundColor: colors.primaryMuted }]}>
            <Text variant="caption" color="primary">
              Engineering Mastery
            </Text>
          </View>
          <Text variant="display" align={wide ? 'center' : 'left'} style={{ maxWidth: 820 }} accessibilityRole="header">
            Learn Java the way engineers actually use it
          </Text>
          <Text variant="body" color="textMuted" align={wide ? 'center' : 'left'} style={{ maxWidth: 680, fontSize: 17, lineHeight: 26 }}>
            From your first program to concurrency, databases, Spring Boot and production systems. JavaForge measures what you can actually do, not how many pages you opened:
            answered checks, code that passes tests, debugging and recall.
          </Text>
          <View style={[styles.row, { justifyContent: wide ? 'center' : 'flex-start' }]}>
            {accounts ? (
              <>
                <Button label="Create free account" icon="user" onPress={() => router.push('/sign-up')} />
                <Button label="Sign in" variant="secondary" onPress={() => router.push('/sign-in')} />
              </>
            ) : (
              <Button label="Start learning" iconRight="chevronRight" onPress={() => router.push('/')} />
            )}
          </View>
          <Text variant="small" color="textSubtle" align={wide ? 'center' : 'left'}>
            {accounts
              ? 'Free. Sign in to open the learning portal. Your progress syncs across web, Android and iOS.'
              : 'Your progress is saved on this device.'}
          </Text>
        </View>
      </Section>

      <Section>
        <View style={[styles.stats, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Stat value={String(MODULES.length)} label="domains in the roadmap" />
          <Stat value={String(LESSONS.length)} label="lessons" />
          <Stat value={String(CHALLENGES.length)} label="challenges" />
          <Stat value={`${FIRST_JAVA}-${LAST_JAVA}`} label="Java versions covered" />
        </View>
      </Section>

      <Section title="What you get" subtitle="Everything is built around demonstrated ability.">
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={{ width: wide ? (layout === 'expanded' ? '24%' : '48.5%') : '100%', flexGrow: 1, flexBasis: wide ? 240 : undefined }}>
              <Card style={{ gap: spacing.sm, height: '100%' }}>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                  <Icon name={f.icon} size={20} color={colors.primary} />
                </View>
                <Text variant="heading">{f.title}</Text>
                <Text variant="small" color="textMuted">
                  {f.body}
                </Text>
              </Card>
            </View>
          ))}
        </View>
      </Section>

      <Section title="How it works">
        <View style={[styles.grid, { gap: spacing.lg }]}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={{ flexGrow: 1, flexBasis: wide ? 200 : '100%', gap: spacing.xs }}>
              <Text variant="caption" color="primary">
                Step {i + 1}
              </Text>
              <Text variant="heading">{s.title}</Text>
              <Text variant="small" color="textMuted">
                {s.body}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section>
        <Card tone="raised" style={{ gap: spacing.sm }}>
          <View style={styles.row}>
            <Icon name="info" size={18} color={colors.accent} />
            <Text variant="heading">Honest by design</Text>
          </View>
          <Text color="textMuted">
            JavaForge never claims to make you job-ready. Progress, streaks and recommendations are computed from your real answers, and a result that could not be verified on a real
            Java runtime is marked as unverified and does not count as coding mastery. Preview features are never presented as standard Java.
          </Text>
        </Card>
      </Section>

      {accounts ? (
        <Section>
          <Card tone="outline" style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
            <Text variant="title" align="center">
              Ready to start?
            </Text>
            <Text color="textMuted" align="center">
              Create a free account to open the learning portal.
            </Text>
            <View style={[styles.row, { justifyContent: 'center' }]}>
              <Button label="Create free account" onPress={() => router.push('/sign-up')} />
              <Button label="Sign in" variant="secondary" onPress={() => router.push('/sign-in')} />
            </View>
          </Card>
        </Section>
      ) : null}

      <View style={styles.container}>
        <Text variant="small" color="textSubtle" align="center" style={{ paddingTop: spacing.lg }}>
          JavaForge · Engineering Mastery ·{' '}
          <Link href="/sign-in">
            <Text variant="small" color="textSubtle" style={{ textDecorationLine: 'underline' }}>
              {accounts ? 'Sign in' : 'Open the app'}
            </Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={[styles.container, { paddingVertical: spacing.xl, gap: spacing.lg }]}>
      {title ? (
        <View style={{ gap: spacing.xs }}>
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text color="textMuted">{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text variant="title">{value}</Text>
      <Text variant="small" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: spacing.lg },
  nav: { paddingBottom: spacing.sm },
  navInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  stats: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: radius.lg, paddingVertical: spacing.md },
  stat: { flexGrow: 1, flexBasis: 140, alignItems: 'center', paddingVertical: spacing.sm, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});

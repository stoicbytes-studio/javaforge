import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, Card, LinkCard } from '@/components/Card';
import { MetricChart } from '@/components/charts';
import { Icon, type IconName } from '@/components/Icon';
import { ProgressBar } from '@/components/Progress';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { BUG_HUNTS, CATALOG, CHALLENGES, getModule, INCIDENTS, INTERVIEW_QUESTIONS, LESSONS, MODULES, PROJECTS } from '@/content';
import { useAuth } from '@/services/auth';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import {
  useAdminActivity,
  useAdminItemStats,
  useAdminModuleStats,
  useAdminOverview,
  useAdminUsers,
  useIsAdmin,
  useSetAdmin,
  type AdminUser,
} from './adminApi';
import { describeItem } from './describeItem';

type Tab = 'overview' | 'learners' | 'content';

const pct = (v: number) => `${Math.round(v * 100)}%`;
const date = (t: number | null) => (t ? new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

export function AdminScreen() {
  const auth = useAuth();
  const { isAdmin, loading, error } = useIsAdmin();
  const [tab, setTab] = useState<Tab>('overview');

  let body: ReactNode;
  if (!auth.configured) {
    body = (
      <EmptyState
        icon="shield"
        title="Admin needs accounts"
        body="The admin dashboard reports on signed-in learners, so it needs a Supabase project. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY and apply the migrations in supabase/."
      />
    );
  } else if (auth.loading || loading) {
    body = <ActivityIndicator accessibilityLabel="Checking admin access" />;
  } else if (!auth.session) {
    body = (
      <EmptyState
        icon="lock"
        title="Sign in to continue"
        body="The admin dashboard is only available to signed-in administrators."
        action={<LinkButton href="/sign-in?redirect=%2Fadmin" label="Sign in" />}
      />
    );
  } else if (!isAdmin) {
    body = (
      <EmptyState
        icon="shield"
        title={error ? 'Could not check admin access' : 'Admin access required'}
        body={
          error
            ? (error as Error).message
            : `${auth.session.user.email} is not an administrator. An existing admin can grant access from the Learners tab; the first admin is added with SQL (see docs/admin.md).`
        }
      />
    );
  } else {
    body = (
      <>
        <SegmentedTabs
          label="Admin section"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'overview', label: 'Overview' },
            { value: 'learners', label: 'Learners' },
            { value: 'content', label: 'Content' },
          ]}
        />
        {tab === 'overview' ? <OverviewTab /> : tab === 'learners' ? <LearnersTab selfId={auth.session.user.id} /> : <ContentTab />}
      </>
    );
  }

  return (
    <Screen>
      <PageHeader eyebrow="Admin" title="Admin dashboard" subtitle="Platform health from real learner evidence. Learners' private notes and answers are never shown here." />
      {body}
    </Screen>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <LinkCard href={href as never} accessibilityLabel={label} style={{ alignSelf: 'flex-start' }}>
      <Text weight="600" color="primary">
        {label}
      </Text>
    </LinkCard>
  );
}

function QueryState({ loading, error, onRetry }: { loading: boolean; error: unknown; onRetry: () => void }) {
  if (loading) return <ActivityIndicator accessibilityLabel="Loading" />;
  if (error) {
    return (
      <Card style={{ gap: spacing.sm }}>
        <Text color="danger">{(error as Error).message}</Text>
        <Button label="Try again" size="sm" variant="secondary" icon="refresh" onPress={onRetry} style={{ alignSelf: 'flex-start' }} />
      </Card>
    );
  }
  return null;
}

function Kpi({ icon, label, value, detail }: { icon: IconName; label: string; value: string; detail?: string }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.kpi} accessible accessibilityLabel={`${label}: ${value}${detail ? `, ${detail}` : ''}`}>
      <View style={styles.row}>
        <Icon name={icon} size={16} color={colors.primary} />
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      </View>
      <Text variant="title">{value}</Text>
      {detail ? (
        <Text variant="small" color="textSubtle">
          {detail}
        </Text>
      ) : null}
    </Card>
  );
}

function OverviewTab() {
  const overview = useAdminOverview(true);
  const activity = useAdminActivity(true, 30);
  const modules = useAdminModuleStats(true);
  const { layout } = useLayout();
  const o = overview.data;
  const days = activity.data ?? [];

  return (
    <View style={{ gap: spacing.xl }}>
      <QueryState loading={overview.isLoading} error={overview.error} onRetry={() => overview.refetch()} />
      {o ? (
        <View style={styles.kpiGrid}>
          <Kpi icon="users" label="Learners" value={o.totalUsers.toLocaleString()} detail={`+${o.newUsers7d} in the last 7 days`} />
          <Kpi icon="activity" label="Active (7 days)" value={o.activeUsers7d.toLocaleString()} detail={`${o.activeUsers30d} in the last 30 days`} />
          <Kpi icon="target" label="Attempts (7 days)" value={o.attempts7d.toLocaleString()} detail={`${o.totalAttempts.toLocaleString()} all time`} />
          <Kpi icon="check" label="Verified challenge passes" value={o.verifiedChallengePasses.toLocaleString()} detail="Ran on a real JVM" />
          <Kpi icon="chart" label="Average mastery" value={pct(o.averageMastery)} detail="Learners who have synced" />
          <Kpi icon="shield" label="Admins" value={String(o.admins)} />
        </View>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <SectionHeader title="Last 30 days" icon="activity" />
        <QueryState loading={activity.isLoading} error={activity.error} onRetry={() => activity.refetch()} />
        {days.length > 0 ? (
          <View style={[styles.charts, layout === 'compact' && { flexDirection: 'column' }]}>
            <ChartCard title="Active learners per day" points={days.map((d) => d.activeUsers)} unit="learners" />
            <ChartCard title="Attempts per day" points={days.map((d) => d.attempts)} unit="attempts" />
            <ChartCard title="Sign-ups per day" points={days.map((d) => d.signups)} unit="sign-ups" />
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionHeader title="Modules" icon="book" />
        <QueryState loading={modules.isLoading} error={modules.error} onRetry={() => modules.refetch()} />
        {modules.data && modules.data.length === 0 ? <Text color="textMuted">No learner attempts yet.</Text> : null}
        {(modules.data ?? [])
          .slice()
          .sort((a, b) => (getModule(a.moduleId)?.order ?? 99) - (getModule(b.moduleId)?.order ?? 99))
          .map((m) => (
            <Card key={m.moduleId} style={{ gap: spacing.xs }}>
              <View style={styles.rowBetween}>
                <Text weight="600" style={{ flex: 1 }}>
                  {getModule(m.moduleId)?.title ?? m.moduleId}
                </Text>
                <Text variant="small" color="textMuted">
                  {m.learners} learners · {m.attempts} attempts
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text variant="small" color="textMuted">
                  Answers correct: {pct(m.correctRate)}
                </Text>
                <Text variant="small" color="textMuted">
                  Avg mastery {m.avgMastery === null ? '—' : pct(m.avgMastery)}
                </Text>
              </View>
              <ProgressBar value={m.correctRate} label={`${m.moduleId} correct rate`} height={5} />
            </Card>
          ))}
      </View>
    </View>
  );
}

function ChartCard({ title, points, unit }: { title: string; points: number[]; unit: string }) {
  const total = points.reduce((a, b) => a + b, 0);
  return (
    <Card style={{ flex: 1, gap: spacing.sm, minWidth: 0 }}>
      <View style={styles.rowBetween}>
        <Text variant="small" weight="600">
          {title}
        </Text>
        <Text variant="small" color="textMuted">
          {total.toLocaleString()} total
        </Text>
      </View>
      <MetricChart points={points} unit={unit} label={title} height={110} />
    </Card>
  );
}

function LearnersTab({ selfId }: { selfId: string }) {
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);
  const users = useAdminUsers(true, search);
  const rows = users.data?.pages.flat() ?? [];

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
        <Icon name="search" size={16} color={colors.textSubtle} />
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Search by email or name"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search learners"
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>
      <QueryState loading={users.isLoading} error={users.error} onRetry={() => users.refetch()} />
      {users.data && rows.length === 0 ? <Text color="textMuted">{search ? 'No learners match that search.' : 'No learners yet.'}</Text> : null}
      {rows.map((u) => (
        <LearnerRow key={u.userId} user={u} isSelf={u.userId === selfId} />
      ))}
      {users.hasNextPage ? (
        <Button label="Load more" variant="secondary" onPress={() => users.fetchNextPage()} loading={users.isFetchingNextPage} style={{ alignSelf: 'center' }} />
      ) : null}
    </View>
  );
}

function confirm(message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) onConfirm();
    return;
  }
  Alert.alert('Confirm', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm },
  ]);
}

function LearnerRow({ user: u, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const setAdmin = useSetAdmin();
  const toggle = () =>
    confirm(u.isAdmin ? `Remove admin access from ${u.email}?` : `Give ${u.email} full admin access?`, () =>
      setAdmin.mutate({ userId: u.userId, makeAdmin: !u.isAdmin }),
    );
  return (
    <Card style={{ gap: spacing.sm }}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text weight="600" numberOfLines={1}>
            {u.displayName ?? u.email}
          </Text>
          {u.displayName ? (
            <Text variant="small" color="textMuted" numberOfLines={1}>
              {u.email}
            </Text>
          ) : null}
        </View>
        <View style={styles.row}>
          {u.isAdmin ? <Badge label="Admin" tone="accent" icon="shield" /> : null}
          {isSelf ? <Badge label="You" tone="primary" /> : null}
        </View>
      </View>
      <View style={styles.stats}>
        <Stat label="Joined" value={date(u.createdAt)} />
        <Stat label="Last active" value={date(u.lastActiveAt)} />
        <Stat label="Attempts" value={u.attempts.toLocaleString()} />
        <Stat label="Mastery" value={u.overallMastery === null ? '—' : pct(u.overallMastery)} />
        <Stat label="Streak" value={u.currentStreak === null ? '—' : `${u.currentStreak}d`} />
      </View>
      {setAdmin.error ? (
        <Text variant="small" color="danger">
          {(setAdmin.error as Error).message}
        </Text>
      ) : null}
      {!isSelf ? (
        <Button
          label={u.isAdmin ? 'Remove admin' : 'Make admin'}
          size="sm"
          variant={u.isAdmin ? 'danger' : 'secondary'}
          icon="shield"
          loading={setAdmin.isPending}
          onPress={toggle}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : null}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 96 }}>
      <Text variant="caption" color="textSubtle">
        {label}
      </Text>
      <Text variant="small" weight="600">
        {value}
      </Text>
    </View>
  );
}

const MIN_ATTEMPT_OPTIONS = ['3', '5', '20'] as const;

function ContentTab() {
  const [minAttempts, setMinAttempts] = useState<(typeof MIN_ATTEMPT_OPTIONS)[number]>('5');
  const items = useAdminItemStats(true, Number(minAttempts));
  const inventory: { label: string; value: number }[] = [
    { label: 'Modules', value: MODULES.length },
    { label: 'Lessons', value: LESSONS.length },
    { label: 'Knowledge checks', value: CATALOG.filter((c) => c.itemType === 'check').length },
    { label: 'Challenges', value: CHALLENGES.length },
    { label: 'Interview questions', value: INTERVIEW_QUESTIONS.length },
    { label: 'Bug hunts', value: BUG_HUNTS.length },
    { label: 'Incidents', value: INCIDENTS.length },
    { label: 'Projects', value: PROJECTS.length },
  ];

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <SectionHeader title="Content in this app version" icon="layers" />
        <View style={styles.kpiGrid}>
          {inventory.map((i) => (
            <Card key={i.label} style={styles.inventory}>
              <Text variant="title">{i.value}</Text>
              <Text variant="small" color="textMuted">
                {i.label}
              </Text>
            </Card>
          ))}
        </View>
        <Text variant="small" color="textSubtle">
          Every runnable example and challenge is compiled and run on a real JDK by `npm run verify:java` before release.
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionHeader title="Hardest items" icon="alert" />
        <Text variant="small" color="textMuted">
          Items learners get wrong most often. A very low rate can mean a confusing question or a gap in the lesson.
        </Text>
        <SegmentedTabs
          label="Minimum attempts"
          value={minAttempts}
          onChange={setMinAttempts}
          options={MIN_ATTEMPT_OPTIONS.map((v) => ({ value: v, label: `≥ ${v} attempts` }))}
        />
        <QueryState loading={items.isLoading} error={items.error} onRetry={() => items.refetch()} />
        {items.data && items.data.length === 0 ? <Text color="textMuted">Not enough attempts yet.</Text> : null}
        {(items.data ?? []).map((s) => {
          const d = describeItem(s.itemType, s.itemId);
          const content = (
            <View style={{ gap: spacing.xs }}>
              <Text variant="caption" color="textSubtle">
                {d.context}
              </Text>
              <Text weight="600">{d.title}</Text>
              <View style={styles.rowBetween}>
                <Text variant="small" color={s.correctRate < 0.4 ? 'danger' : s.correctRate < 0.7 ? 'warning' : 'success'}>
                  {pct(s.correctRate)} correct
                </Text>
                <Text variant="small" color="textMuted">
                  {s.attempts} attempts · {s.learners} learners · {s.avgHints.toFixed(1)} hints avg
                </Text>
              </View>
            </View>
          );
          return d.href ? (
            <LinkCard key={`${s.itemType}:${s.itemId}`} href={d.href} accessibilityLabel={`${d.title}, ${pct(s.correctRate)} correct`}>
              {content}
            </LinkCard>
          ) : (
            <Card key={`${s.itemType}:${s.itemId}`}>{content}</Card>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 300, gap: spacing.xs },
  inventory: { flexGrow: 1, flexBasis: 140, gap: 2 },
  charts: { flexDirection: 'row', gap: spacing.md },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, minHeight: 44, fontSize: 15 },
});

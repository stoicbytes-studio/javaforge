import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, LinkCard, PressableLink } from '@/components/Card';
import { ActivityHeatmap, DimensionBars } from '@/components/charts';
import { Icon } from '@/components/Icon';
import { ProgressBar, ProgressRing } from '@/components/Progress';
import { SearchLink } from '@/components/SearchLink';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { MODULES, PROJECTS } from '@/content';
import { interviewReadiness } from '@/features/interviews/readiness';
import { DIMENSIONS, DIMENSION_LABELS } from '@/features/progress/mastery';
import type { Mission } from '@/features/progress/recommendations';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useLearningStore } from '@/store/learningStore';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const MISSION_ICONS = {
  revision: 'refresh',
  repair: 'target',
  continue: 'book',
  coding: 'code',
  unaided: 'lightbulb',
  interview: 'message',
  debugging: 'bug',
} as const;

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function DashboardScreen() {
  const model = useLearnerModel();
  const { layout } = useLayout();
  const { colors } = useTheme();
  const attempts = useLearningStore((s) => s.attempts);
  const dailyMinutes = useLearningStore((s) => s.settings.dailyMinutes);
  const milestones = useLearningStore((s) => s.milestones);
  const name = useLearningStore((s) => s.settings.displayName);
  const hasActivity = attempts.length > 0;
  const readiness = interviewReadiness(model.mastery);
  const [mission, ...rest] = model.plan;
  const twoCol = layout === 'expanded';

  const writtenModules = MODULES.filter((m) => m.lessons.length > 0);
  const milestoneTotal = PROJECTS.reduce((s, p) => s + p.milestones.length, 0);
  const milestoneDone = Object.keys(milestones).length;

  const main = (
    <View style={styles.column}>
      {mission ? <MissionHero mission={mission} /> : null}

      <Card>
        <SectionHeader
          title={`Today's plan · ${dailyMinutes} min`}
          icon="clock"
          action={
            <Link href="/settings" style={{ color: colors.primary, fontSize: 13 }}>
              Change
            </Link>
          }
        />
        <View style={{ gap: spacing.sm }}>
          {rest.length === 0 ? (
            <Text variant="small" color="textMuted">
              Your recommended mission fills today's time budget.
            </Text>
          ) : (
            rest.map((m) => <MissionRow key={m.id} mission={m} />)
          )}
        </View>
      </Card>

      <Card>
        <SectionHeader
          title="Module progress"
          icon="layers"
          action={
            <Link href="/learn" style={{ color: colors.primary, fontSize: 13 }}>
              Roadmap
            </Link>
          }
        />
        <View style={{ gap: spacing.md }}>
          {writtenModules.map((m) => {
            const done = m.lessons.filter((l) => model.completedLessons.has(l.id)).length;
            return (
              <PressableLink key={m.id} href={`/learn/${m.id}`} accessibilityLabel={`${m.title}: ${done} of ${m.lessons.length} lessons complete`}>
                <View style={{ gap: 4, width: '100%' }}>
                  <View style={styles.rowBetween}>
                    <Text variant="small" weight="600" style={{ flex: 1 }} numberOfLines={1}>
                      {m.order}. {m.shortTitle}
                    </Text>
                    <Text variant="small" color="textMuted">
                      {done}/{m.lessons.length} lessons · {Math.round((model.mastery.modules[m.id] ?? 0) * 100)}% mastery
                    </Text>
                  </View>
                  <ProgressBar value={model.mastery.modules[m.id] ?? 0} label={`${m.shortTitle} mastery`} height={6} />
                </View>
              </PressableLink>
            );
          })}
        </View>
      </Card>

      <Card>
        <SectionHeader title="Learning activity" icon="activity" />
        <ActivityHeatmap timestamps={attempts.filter((a) => a.correct).map((a) => a.at)} now={model.now} />
      </Card>
    </View>
  );

  const side = (
    <View style={styles.column}>
      <Card>
        <SectionHeader title="Mastery" icon="target" />
        <View style={[styles.row, { marginBottom: spacing.lg }]}>
          <ProgressRing value={model.mastery.overall} label="Overall mastery" size={84} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="small" color="textMuted">
              Overall mastery across all written lessons. Based on demonstrated answers, code and recall — not on lessons opened.
            </Text>
          </View>
        </View>
        <DimensionBars
          items={DIMENSIONS.map((d) => ({
            label: DIMENSION_LABELS[d],
            value: model.mastery.dimensions[d],
            evidence: model.mastery.dimensionEvidence[d],
            evidenceLabel: d === 'retention' ? 'cards reviewed' : 'items attempted',
          }))}
        />
      </Card>

      <Card>
        <SectionHeader title="Weekly goals" icon="trophy" />
        <View style={{ gap: spacing.md }}>
          {model.goals.map((g) => (
            <View key={g.id} style={{ gap: 4 }}>
              <View style={styles.rowBetween}>
                <Text variant="small" style={{ flex: 1 }}>
                  {g.label}
                </Text>
                <Text variant="small" weight="600" color={g.current >= g.target ? 'success' : 'text'}>
                  {g.current}/{g.target}
                </Text>
              </View>
              <ProgressBar value={g.current / g.target} label={g.label} color={g.current >= g.target ? colors.success : undefined} height={5} />
            </View>
          ))}
        </View>
      </Card>

      <LinkCard href="/revision" accessibilityLabel={`Revision queue: ${model.dueCount} due`}>
        <View style={styles.row}>
          <Icon name="refresh" color={model.dueCount > 0 ? colors.warning : colors.textMuted} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">Revision queue</Text>
            <Text variant="small" color="textMuted">
              {model.dueCount > 0
                ? `${model.dueCount} card${model.dueCount === 1 ? '' : 's'} due for delayed recall`
                : 'Nothing due. Cards appear a day after you complete a lesson or miss a question.'}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} />
        </View>
      </LinkCard>

      <Card>
        <SectionHeader title="Weak concepts" icon="alert" />
        {model.weak.length === 0 ? (
          <Text variant="small" color="textMuted">
            {hasActivity ? 'No weak spots detected in the lessons you have attempted.' : 'Weak concepts appear once you start answering questions.'}
          </Text>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {model.weak.map((w) => (
              <PressableLink key={w.lesson.id} href={`/learn/${w.lesson.moduleId}/${w.lesson.id}`}>
                <View style={[styles.rowBetween, { width: '100%' }]}>
                  <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                    {w.lesson.title}
                  </Text>
                  <Badge label={`${Math.round(w.mastery * 100)}%${w.recentErrors ? ` · ${w.recentErrors} misses` : ''}`} tone="warning" />
                </View>
              </PressableLink>
            ))}
          </View>
        )}
      </Card>

      <LinkCard href="/interview" accessibilityLabel={`Interview readiness: ${readiness.level}`}>
        <View style={{ gap: spacing.xs }}>
          <View style={styles.rowBetween}>
            <Text variant="heading">Interview readiness</Text>
            <Badge label={readiness.level} tone={readiness.score === null ? 'neutral' : readiness.score >= 0.65 ? 'success' : 'primary'} />
          </View>
          {readiness.score !== null ? <ProgressBar value={readiness.score} label="Interview readiness" /> : null}
          <Text variant="small" color="textMuted">
            {readiness.explanation} An estimate of practice, not a hiring verdict.
          </Text>
        </View>
      </LinkCard>

      <LinkCard href="/projects">
        <View style={styles.row}>
          <Icon name="folder" />
          <View style={{ flex: 1 }}>
            <Text variant="heading">Project milestones</Text>
            <Text variant="small" color="textMuted">
              {milestoneTotal === 0 ? 'Projects coming soon.' : `${milestoneDone} of ${milestoneTotal} milestones checked off`}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} />
        </View>
      </LinkCard>
    </View>
  );

  return (
    <Screen>
      <PageHeader
        eyebrow={model.tier.current.title}
        title={`${greeting(model.now)}${name ? `, ${name}` : ''}`}
        subtitle={
          hasActivity
            ? `${model.xp.total.toLocaleString()} XP · ${model.streak.current}-day streak · ${model.completedLessons.size} lessons complete`
            : 'Start with the first lesson. Everything you see here is computed from what you actually demonstrate.'
        }
      />
      <SearchLink />
      {!hasActivity ? (
        <EmptyState
          icon="book"
          title="No learning evidence yet"
          body="Mastery, streaks, XP and recommendations are calculated from your answers, code runs and revision recalls. Complete a lesson's checks to see them come alive."
        />
      ) : null}
      {twoCol ? (
        <View style={{ flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.7 }}>{main}</View>
          <View style={{ flex: 1 }}>{side}</View>
        </View>
      ) : (
        <View style={styles.column}>
          {main}
          {side}
        </View>
      )}
    </Screen>
  );
}

function MissionHero({ mission }: { mission: Mission }) {
  const { colors } = useTheme();
  return (
    <LinkCard
      href={mission.href as never}
      accessibilityLabel={`Today's mission: ${mission.title}`}
      style={{ backgroundColor: colors.brandMuted, borderColor: colors.brand, borderWidth: 1.5, padding: spacing.xl }}
    >
      <View style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <Badge label="Today's mission" tone="primary" icon="target" />
          <Text variant="small" color="textMuted">
            ~{mission.minutes} min
          </Text>
        </View>
        <View style={styles.row}>
          <Icon name={MISSION_ICONS[mission.kind]} size={24} color={colors.primary} />
          <Text variant="title" style={{ flex: 1 }}>
            {mission.title}
          </Text>
        </View>
        <Text variant="small" color="textMuted">
          Why: {mission.reason}
        </Text>
      </View>
    </LinkCard>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const { colors } = useTheme();
  return (
    <PressableLink href={mission.href as never} accessibilityLabel={`${mission.title}, about ${mission.minutes} minutes`}>
      <View style={[styles.missionRow, { borderColor: colors.border }]}>
        <Icon name={MISSION_ICONS[mission.kind]} size={18} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text variant="small" weight="600">
            {mission.title}
          </Text>
          <Text variant="small" color="textMuted" numberOfLines={2}>
            {mission.reason}
          </Text>
        </View>
        <Text variant="small" color="textMuted">
          {mission.minutes}m
        </Text>
      </View>
    </PressableLink>
  );
}

const styles = StyleSheet.create({
  column: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, width: '100%' },
});

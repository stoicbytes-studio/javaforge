import { StyleSheet, View } from 'react-native';

import { Badge, Card } from '@/components/Card';
import { DimensionBars } from '@/components/charts';
import { Icon } from '@/components/Icon';
import { ProgressBar, ProgressRing } from '@/components/Progress';
import { PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { MODULES } from '@/content';
import { TIERS } from '@/features/gamification/tiers';
import { useLearningStore } from '@/store/learningStore';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { DIMENSIONS, DIMENSION_LABELS } from './mastery';
import { useLearnerModel } from './useLearnerModel';

const XP_LABELS = {
  check: 'Knowledge checks',
  challenge: 'Coding challenges',
  interview: 'Interview answers',
  'bug-hunt': 'Bug hunts',
  incident: 'Incidents',
  revision: 'Revision recalls',
} as const;

export function ProgressScreen() {
  const model = useLearnerModel();
  const { colors } = useTheme();
  const { layout } = useLayout();
  const attempts = useLearningStore((s) => s.attempts);
  const wide = layout === 'expanded';
  const unlocked = model.achievements.filter((a) => a.unlocked).length;

  return (
    <Screen>
      <PageHeader
        eyebrow="Progress"
        title={model.tier.current.title}
        subtitle={model.tier.current.description}
        right={<ProgressRing value={model.mastery.overall} label="Overall mastery" size={84} />}
      />

      <View style={[styles.grid, wide && styles.gridWide]}>
        <Card style={[styles.cell, { gap: spacing.md }]}>
          <SectionHeader title="Career path" icon="layers" />
          {TIERS.map((tier) => {
            const reached = tier.rank <= model.tier.current.rank;
            const isNext = tier.rank === model.tier.current.rank + 1;
            return (
              <View key={tier.id} style={{ gap: spacing.xs }}>
                <View style={styles.row}>
                  <View style={[styles.tierDot, { backgroundColor: reached ? colors.success : isNext ? colors.primary : colors.surfaceAlt }]}>
                    {reached ? <Icon name="check" size={12} color={colors.onPrimary} strokeWidth={3} /> : null}
                  </View>
                  <Text weight={isNext || tier.rank === model.tier.current.rank ? '700' : '500'} color={reached || isNext ? 'text' : 'textSubtle'} style={{ flex: 1 }}>
                    {tier.title}
                  </Text>
                  {tier.rank === model.tier.current.rank ? <Badge label="Current" tone="success" /> : null}
                  {isNext ? <Badge label="Next" tone="primary" /> : null}
                </View>
                {isNext ? (
                  <View style={{ paddingLeft: 30, gap: spacing.sm }}>
                    {model.tier.nextRequirements.map((r) => (
                      <View key={r.label} style={{ gap: 3 }}>
                        <View style={styles.rowBetween}>
                          <Text variant="small" color={r.met ? 'success' : 'text'} style={{ flex: 1 }}>
                            {r.met ? '✓ ' : ''}
                            {r.label}
                          </Text>
                          <Text variant="small" color="textMuted">
                            {r.requirement.kind === 'xp' ? `${r.current}/${r.target}` : `${Math.round(r.current * 100)}%`}
                          </Text>
                        </View>
                        <ProgressBar value={r.target === 0 ? 1 : r.current / r.target} label={r.label} height={4} color={r.met ? colors.success : undefined} />
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
          <Text variant="small" color="textSubtle">
            Tiers need both experience and demonstrated mastery. Completing lessons alone never advances your tier.
          </Text>
        </Card>

        <View style={[styles.cell, { gap: spacing.lg }]}>
          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title={`${model.xp.total.toLocaleString()} XP`} icon="trophy" />
            {(Object.keys(XP_LABELS) as (keyof typeof XP_LABELS)[]).map((k) => (
              <View key={k} style={styles.rowBetween}>
                <Text variant="small">{XP_LABELS[k]}</Text>
                <Text variant="small" color="textMuted">
                  {model.xp.byType[k]} XP
                </Text>
              </View>
            ))}
            <Text variant="small" color="textSubtle">
              Each item pays out once at the best quality you have shown. Hints, viewed solutions and unverified runs reduce it.
            </Text>
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title="Consistency" icon="flame" />
            <View style={styles.rowBetween}>
              <Text variant="small">Current streak</Text>
              <Text variant="small" weight="700">
                {model.streak.current} day{model.streak.current === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text variant="small">Longest streak</Text>
              <Text variant="small">{model.streak.longest} days</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text variant="small">Total attempts</Text>
              <Text variant="small">{attempts.length}</Text>
            </View>
            <Text variant="small" color="textSubtle">
              A day counts when you answer at least one thing correctly.
            </Text>
          </Card>
        </View>
      </View>

      <View style={[styles.grid, wide && styles.gridWide]}>
        <Card style={styles.cell}>
          <SectionHeader title="Mastery dimensions" icon="target" />
          <DimensionBars
            items={DIMENSIONS.map((d) => ({
              label: DIMENSION_LABELS[d],
              value: model.mastery.dimensions[d],
              evidence: model.mastery.dimensionEvidence[d],
              evidenceLabel: d === 'retention' ? 'cards reviewed' : 'items attempted',
            }))}
          />
        </Card>
        <Card style={[styles.cell, { gap: spacing.md }]}>
          <SectionHeader title="Modules" icon="book" />
          {MODULES.filter((m) => m.lessons.length > 0).map((m) => (
            <View key={m.id} style={{ gap: 3 }}>
              <View style={styles.rowBetween}>
                <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                  {m.order}. {m.shortTitle}
                </Text>
                <Text variant="small" color="textMuted">
                  {Math.round((model.mastery.modules[m.id] ?? 0) * 100)}%
                </Text>
              </View>
              <ProgressBar value={model.mastery.modules[m.id] ?? 0} label={`${m.shortTitle} mastery`} height={5} />
            </View>
          ))}
        </Card>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionHeader title={`Achievements · ${unlocked}/${model.achievements.length}`} icon="trophy" />
        <View style={[styles.achievements, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {model.achievements.map((a) => (
            <Card key={a.achievement.id} style={[wide && { width: '32%', flexGrow: 1 }, { gap: spacing.xs, opacity: a.unlocked ? 1 : 0.85 }]} tone={a.unlocked ? 'raised' : 'default'}>
              <View style={styles.row}>
                <Icon name={a.unlocked ? 'trophy' : 'lock'} size={18} color={a.unlocked ? colors.warning : colors.textSubtle} />
                <Text weight="700" style={{ flex: 1 }}>
                  {a.achievement.title}
                </Text>
                {a.unlocked ? <Badge label="Unlocked" tone="success" /> : null}
              </View>
              <Text variant="small" color="textMuted">
                {a.achievement.requirement}
              </Text>
              {!a.unlocked ? (
                <View style={{ gap: 3 }}>
                  <ProgressBar value={a.current / a.target} label={`${a.achievement.title} progress`} height={4} />
                  <Text variant="small" color="textSubtle">
                    {a.current}/{a.target}
                  </Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.lg },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  cell: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  tierDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  achievements: { gap: spacing.md },
});

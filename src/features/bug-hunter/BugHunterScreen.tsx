import { StyleSheet, View } from 'react-native';

import { Badge, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { BUG_HUNTS, CHALLENGES, INCIDENTS } from '@/content';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export function BugHunterScreen() {
  const { colors } = useTheme();
  const attempts = useLearningStore((s) => s.attempts);
  const runs = useLearningStore((s) => s.incidentRuns);
  const best = new Map<string, number>();
  for (const a of attempts) if (a.itemType === 'bug-hunt') best.set(a.itemId, Math.max(best.get(a.itemId) ?? 0, a.score));
  const debuggingChallenges = CHALLENGES.filter((c) => c.kind === 'debugging');
  const solved = new Set(attempts.filter((a) => a.itemType === 'challenge' && a.correct).map((a) => a.itemId));

  return (
    <Screen>
      <PageHeader
        eyebrow="Bug Hunter"
        title="Debug like a production engineer"
        subtitle="Read symptoms and evidence, locate the defect, name the root cause and choose a fix. Debugging is scored separately from coding."
      />

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title="Production incidents" icon="activity" />
        {INCIDENTS.length === 0 ? <EmptyState title="No incidents yet" body="Incident simulations are being prepared." /> : null}
        {INCIDENTS.map((inc) => {
          const last = [...runs].reverse().find((r) => r.incidentId === inc.id);
          return (
            <LinkCard key={inc.id} href={`/bug-hunter/incident/${inc.id}`} accessibilityLabel={`${inc.severity} incident: ${inc.title}`}>
              <View style={styles.row}>
                <Icon name="alert" color={inc.severity === 'SEV1' ? colors.danger : colors.warning} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text weight="600">{inc.title}</Text>
                  <Text variant="small" color="textMuted" numberOfLines={2}>
                    {inc.service} · {inc.alert}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Badge label={inc.severity} tone={inc.severity === 'SEV1' ? 'danger' : 'warning'} />
                  {last ? <Badge label={`Last ${Math.round(last.score * 100)}%`} tone={last.hypothesisCorrect && last.fixCorrect ? 'success' : 'neutral'} /> : null}
                </View>
              </View>
            </LinkCard>
          );
        })}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title="Debugging cases" icon="bug" />
        {BUG_HUNTS.map((b) => (
          <LinkCard key={b.id} href={`/bug-hunter/${b.id}`}>
            <View style={styles.row}>
              <Icon name="bug" color={colors.warning} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text weight="600">{b.title}</Text>
                <Text variant="small" color="textMuted">
                  {b.category} · {b.difficulty}
                </Text>
              </View>
              {best.has(b.id) ? <Badge label={`Best ${Math.round(best.get(b.id)! * 100)}%`} tone={best.get(b.id)! >= 0.7 ? 'success' : 'warning'} /> : null}
            </View>
          </LinkCard>
        ))}
      </View>

      {debuggingChallenges.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Fix-it coding missions" icon="code" />
          <Text variant="small" color="textMuted" style={{ marginTop: -spacing.sm }}>
            Debugging challenges you fix and verify by running tests.
          </Text>
          {debuggingChallenges.map((c) => (
            <LinkCard key={c.id} href={`/practice/${c.id}`}>
              <View style={styles.row}>
                <Icon name="code" color={colors.primary} />
                <Text weight="600" style={{ flex: 1 }}>
                  {c.title}
                </Text>
                {solved.has(c.id) ? <Badge label="Solved" tone="success" /> : <Badge label={c.difficulty} />}
              </View>
            </LinkCard>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

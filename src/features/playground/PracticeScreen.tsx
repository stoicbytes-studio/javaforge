import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { CHALLENGES, MODULES } from '@/content';
import { useExecutor } from '@/services/execution/useExecutor';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { ExecutionBanner } from './ExecutionBanner';
import { SCRATCH_ID } from './scratch';

type Filter = 'all' | 'coding' | 'debugging' | 'boss' | 'unsolved';

export function PracticeScreen() {
  const { colors } = useTheme();
  const exec = useExecutor();
  const attempts = useLearningStore((s) => s.attempts);
  const [filter, setFilter] = useState<Filter>('all');
  const solved = new Set(attempts.filter((a) => a.itemType === 'challenge' && a.correct).map((a) => a.itemId));
  const verified = new Set(attempts.filter((a) => a.itemType === 'challenge' && a.correct && a.verified).map((a) => a.itemId));

  const visible = CHALLENGES.filter((c) => {
    if (filter === 'unsolved') return !solved.has(c.id);
    if (filter === 'all') return true;
    return c.kind === filter;
  });

  return (
    <Screen>
      <PageHeader
        eyebrow="Playground"
        title="Coding missions"
        subtitle={`${solved.size} of ${CHALLENGES.length} solved. Challenges are graded by running hidden and visible tests on a real JVM.`}
      />
      <ExecutionBanner state={exec} />

      <LinkCard href={`/practice/${SCRATCH_ID}`} accessibilityLabel="Open the free playground">
        <View style={styles.row}>
          <Icon name="terminal" color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">Free playground</Text>
            <Text variant="small" color="textMuted">
              Experiment with any Java program. Code examples from lessons open here.
            </Text>
          </View>
          <Icon name="chevronRight" size={18} />
        </View>
      </LinkCard>

      <SegmentedTabs
        label="Filter challenges"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'coding', label: 'Coding' },
          { value: 'debugging', label: 'Debugging' },
          { value: 'boss', label: 'Boss' },
          { value: 'unsolved', label: 'Unsolved' },
        ]}
      />

      {visible.length === 0 ? (
        <EmptyState icon="check" title="Nothing here" body="No challenges match this filter." />
      ) : (
        MODULES.map((m) => {
          const list = visible.filter((c) => c.moduleId === m.id);
          if (list.length === 0) return null;
          return (
            <View key={m.id} style={{ gap: spacing.sm }}>
              <SectionHeader title={`${m.order}. ${m.shortTitle}`} />
              {list.map((c) => (
                <LinkCard key={c.id} href={`/practice/${c.id}`} accessibilityLabel={`${c.title}${solved.has(c.id) ? ', solved' : ''}`} style={c.kind === 'boss' ? { borderColor: colors.accent } : undefined}>
                  <View style={styles.row}>
                    <Icon name={c.kind === 'debugging' ? 'bug' : c.kind === 'boss' ? 'trophy' : 'code'} color={c.kind === 'boss' ? colors.accent : c.kind === 'debugging' ? colors.warning : colors.primary} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text weight="600">{c.title}</Text>
                      <Text variant="small" color="textMuted" numberOfLines={1}>
                        {c.concepts.join(' · ')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Badge label={c.difficulty} />
                      {verified.has(c.id) ? (
                        <Badge label="Verified" tone="success" icon="check" />
                      ) : solved.has(c.id) ? (
                        <Badge label="Self-assessed" tone="warning" />
                      ) : null}
                    </View>
                  </View>
                </LinkCard>
              ))}
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

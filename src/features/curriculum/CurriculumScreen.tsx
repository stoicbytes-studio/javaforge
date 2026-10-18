import { StyleSheet, View } from 'react-native';

import { Badge, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/Progress';
import { PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getModule, MODULES } from '@/content';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { CurriculumModule, ModuleLevel } from '@/types/curriculum';

const LEVELS: { level: ModuleLevel; title: string; description: string }[] = [
  { level: 'core', title: 'Core Java path', description: 'The recommended sequence from first program to confident Core Java.' },
  { level: 'advanced', title: 'Advanced engineering', description: 'Runtime internals, concurrency, persistence, testing and Spring.' },
  { level: 'optional', title: 'Optional specialisation', description: 'Production and microservices topics for backend roles.' },
];

export function CurriculumScreen() {
  const { layout } = useLayout();
  const columns = layout === 'expanded' ? 2 : 1;
  return (
    <Screen>
      <PageHeader
        eyebrow="Curriculum"
        title="Learning roadmap"
        subtitle="Seventeen domains in a recommended order. Prerequisites are recommendations — every unlocked lesson is open to you."
      />
      {LEVELS.map(({ level, title, description }) => {
        const modules = MODULES.filter((m) => m.level === level);
        if (modules.length === 0) return null;
        return (
          <View key={level} style={{ gap: spacing.md }}>
            <View>
              <SectionHeader title={title} icon={level === 'core' ? 'book' : level === 'advanced' ? 'layers' : 'activity'} />
              <Text variant="small" color="textMuted" style={{ marginTop: -spacing.sm }}>
                {description}
              </Text>
            </View>
            <View style={[styles.grid, columns === 2 && { flexDirection: 'row', flexWrap: 'wrap' }]}>
              {modules.map((m) => (
                <View key={m.id} style={columns === 2 ? styles.half : undefined}>
                  <ModuleCard module={m} />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

function ModuleCard({ module: m }: { module: CurriculumModule }) {
  const { colors } = useTheme();
  const model = useLearnerModel();
  const planned = m.lessons.length === 0;
  const done = m.lessons.filter((l) => model.completedLessons.has(l.id)).length;
  const mastery = model.mastery.modules[m.id] ?? 0;
  const missingPrereqs = m.prerequisites
    .map((id) => getModule(id))
    .filter((p): p is CurriculumModule => !!p && p.lessons.length > 0 && !p.lessons.every((l) => model.completedLessons.has(l.id)));

  return (
    <LinkCard href={`/learn/${m.id}`} accessibilityLabel={`Module ${m.order}: ${m.title}${planned ? ', planned' : `, ${done} of ${m.lessons.length} lessons complete`}`} style={{ height: '100%' }}>
      <View style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text variant="caption" color="textSubtle">
            Module {m.order}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {planned ? <Badge label="Planned" tone="neutral" /> : null}
            {!planned && done === m.lessons.length ? <Badge label="Complete" tone="success" icon="check" /> : null}
            {m.level !== 'core' ? <Badge label={m.level} tone={m.level === 'advanced' ? 'accent' : 'neutral'} /> : null}
          </View>
        </View>
        <Text variant="heading">{m.title}</Text>
        <Text variant="small" color="textMuted">
          {m.summary}
        </Text>
        {planned ? (
          <Text variant="small" color="textSubtle">
            In development: {m.plannedTopics?.join(' · ')}
          </Text>
        ) : (
          <View style={{ gap: 4 }}>
            <View style={styles.rowBetween}>
              <Text variant="small" color="textMuted">
                {done}/{m.lessons.length} lessons complete
              </Text>
              <Text variant="small" weight="600">
                {Math.round(mastery * 100)}% mastery
              </Text>
            </View>
            <ProgressBar value={mastery} label={`${m.shortTitle} mastery`} height={6} />
          </View>
        )}
        {missingPrereqs.length > 0 ? (
          <View style={styles.row}>
            <Icon name="info" size={14} color={colors.textSubtle} />
            <Text variant="small" color="textSubtle" style={{ flex: 1 }}>
              Recommended first: {missingPrereqs.map((p) => p.shortTitle).join(', ')}
            </Text>
          </View>
        ) : null}
      </View>
    </LinkCard>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  half: { width: '49.3%', flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});

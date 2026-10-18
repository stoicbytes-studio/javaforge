import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Badge, Card, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/Progress';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CHALLENGES, getLesson, getModule } from '@/content';
import { lessonCompletion } from '@/features/progress/mastery';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export function ModuleScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const mod = getModule(moduleId ?? '');
  const model = useLearnerModel();
  const attempts = useLearningStore((s) => s.attempts);
  const { colors } = useTheme();

  if (!mod) {
    return (
      <Screen>
        <BackLink href="/learn" label="Curriculum" />
        <EmptyState icon="alert" title="Module not found" body="This module does not exist. It may have been renamed." />
      </Screen>
    );
  }

  const challenges = CHALLENGES.filter((c) => c.moduleId === mod.id);
  const solved = new Set(attempts.filter((a) => a.itemType === 'challenge' && a.correct).map((a) => a.itemId));
  const prereqs = mod.prerequisites.map((id) => getModule(id)).filter((m) => !!m);

  return (
    <Screen maxWidth={980}>
      <BackLink href="/learn" label="Curriculum" />
      <PageHeader eyebrow={`Module ${mod.order} · ${mod.level}`} title={mod.title} subtitle={mod.summary} />

      {prereqs.length > 0 ? (
        <View style={styles.row}>
          <Icon name="info" size={16} color={colors.textSubtle} />
          <Text variant="small" color="textMuted">
            Builds on: {prereqs.map((p) => p!.shortTitle).join(', ')}
          </Text>
        </View>
      ) : null}

      {mod.lessons.length === 0 ? (
        <EmptyState
          icon="clock"
          title="This module is planned"
          body={`Lessons are being written and reviewed for technical accuracy. Topics: ${mod.plannedTopics?.join(', ') ?? 'to be announced'}. Continue with the core path in the meantime.`}
        />
      ) : (
        <>
          <Card>
            <View style={{ gap: spacing.xs }}>
              <View style={styles.rowBetween}>
                <Text variant="heading">Module mastery</Text>
                <Text variant="heading">{Math.round((model.mastery.modules[mod.id] ?? 0) * 100)}%</Text>
              </View>
              <ProgressBar value={model.mastery.modules[mod.id] ?? 0} label="Module mastery" />
              <Text variant="small" color="textMuted">
                Mastery combines knowledge checks, coding challenges, interview answers and delayed recall for each lesson.
              </Text>
            </View>
          </Card>

          <View style={{ gap: spacing.sm }}>
            <SectionHeader title="Lessons" icon="book" />
            {mod.lessons.map((lesson, index) => {
              const status = lessonCompletion(lesson.checks.map((c) => c.id), attempts);
              const mastery = model.mastery.lessons[lesson.id]?.mastery ?? 0;
              const missing = lesson.prerequisites.filter((p) => !model.completedLessons.has(p)).map((p) => getLesson(p)?.title).filter(Boolean);
              return (
                <LinkCard key={lesson.id} href={`/learn/${mod.id}/${lesson.id}`} accessibilityLabel={`Lesson ${index + 1}: ${lesson.title}`}>
                  <View style={styles.lessonRow}>
                    <View
                      style={[
                        styles.step,
                        {
                          borderColor: status.complete ? colors.success : colors.borderStrong,
                          backgroundColor: status.complete ? colors.successMuted : 'transparent',
                        },
                      ]}
                    >
                      {status.complete ? (
                        <Icon name="check" size={16} color={colors.success} />
                      ) : (
                        <Text variant="small" weight="700" color="textMuted">
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text variant="heading">{lesson.title}</Text>
                      <Text variant="small" color="textMuted">
                        {lesson.summary}
                      </Text>
                      <View style={[styles.row, { flexWrap: 'wrap' }]}>
                        <Badge label={lesson.difficulty} tone="neutral" />
                        <Badge label={`${lesson.estimatedMinutes} min`} tone="neutral" icon="clock" />
                        <Badge
                          label={
                            status.complete
                              ? `Complete · ${Math.round(mastery * 100)}% mastery`
                              : status.attempted > 0
                                ? `${status.attempted}/${status.total} checks`
                                : 'Not started'
                          }
                          tone={status.complete ? 'success' : status.attempted > 0 ? 'primary' : 'neutral'}
                        />
                      </View>
                      {missing.length > 0 ? (
                        <Text variant="small" color="textSubtle">
                          Recommended first: {missing.join(', ')}
                        </Text>
                      ) : null}
                    </View>
                    <Icon name="chevronRight" size={18} />
                  </View>
                </LinkCard>
              );
            })}
          </View>

          {challenges.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <SectionHeader title="Coding missions" icon="code" />
              {challenges.map((c) => (
                <LinkCard key={c.id} href={`/practice/${c.id}`} accessibilityLabel={`${c.title}${solved.has(c.id) ? ', solved' : ''}`} style={c.kind === 'boss' ? { borderColor: colors.accent } : undefined}>
                  <View style={styles.row}>
                    <Icon name={c.kind === 'debugging' ? 'bug' : c.kind === 'boss' ? 'trophy' : 'code'} color={c.kind === 'boss' ? colors.accent : colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="600">
                        {c.title}
                      </Text>
                      <Text variant="small" color="textMuted">
                        {c.kind === 'boss' ? 'Capstone challenge combining the whole module' : c.concepts.join(' · ')}
                      </Text>
                    </View>
                    {solved.has(c.id) ? <Badge label="Solved" tone="success" icon="check" /> : <Badge label={c.difficulty} />}
                  </View>
                </LinkCard>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  step: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
});

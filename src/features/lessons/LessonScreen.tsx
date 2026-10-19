import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { IconButton } from '@/components/Button';
import { Badge, LinkCard } from '@/components/Card';
import { EmptyState, Screen } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { getModule } from '@/content';
import { lessonCompletion } from '@/features/progress/mastery';
import { useLearningStore } from '@/store/learningStore';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { Lesson } from '@/types/curriculum';
import { ConceptPanel } from './ConceptPanel';
import { ExamplesPanel } from './ExamplesPanel';
import { LessonContent } from './LessonContent';
import { NotesPanel } from './NotesPanel';
import { PracticePanel } from './PracticePanel';

type Pane = 'concept' | 'learn' | 'code' | 'practice' | 'notes';

export function LessonScreen() {
  const { moduleId, lessonId } = useLocalSearchParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const mod = getModule(moduleId ?? '');
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  const { layout } = useLayout();
  const { colors } = useTheme();
  const visitLesson = useLearningStore((s) => s.visitLesson);
  const scheduleLessonRevision = useLearningStore((s) => s.scheduleLessonRevision);
  const bookmarked = useLearningStore((s) => (lesson ? s.bookmarks.includes(lesson.id) : false));
  const toggleBookmark = useLearningStore((s) => s.toggleBookmark);
  const attempts = useLearningStore((s) => s.attempts);
  const [pane, setPane] = useState<Pane>('concept');
  const [mainPane, setMainPane] = useState<'concept' | 'lesson'>('concept');
  const [sidePane, setSidePane] = useState<'practice' | 'notes'>('practice');

  const complete = lesson
    ? lessonCompletion(
        lesson.checks.map((c) => c.id),
        attempts,
      ).complete
    : false;

  useEffect(() => {
    if (lesson) visitLesson(lesson.id);
  }, [lesson, visitLesson]);

  useEffect(() => {
    // Completing a lesson schedules its delayed-recall cards (idempotent).
    if (lesson && complete) scheduleLessonRevision(lesson);
  }, [lesson, complete, scheduleLessonRevision]);

  // Opening another lesson starts on its concept page again.
  const [shownLessonId, setShownLessonId] = useState(lessonId);
  if (shownLessonId !== lessonId) {
    setShownLessonId(lessonId);
    setPane('concept');
    setMainPane('concept');
  }

  if (!mod || !lesson) {
    return (
      <Screen>
        <BackLink href="/learn" label="Curriculum" />
        <EmptyState
          icon="alert"
          title="Lesson not found"
          body="This lesson does not exist or has moved. Pick it from the curriculum instead."
        />
      </Screen>
    );
  }

  const index = mod.lessons.findIndex((l) => l.id === lesson.id);
  const next = mod.lessons[index + 1];
  const header = (
    <View style={{ gap: spacing.sm }}>
      <BackLink href={`/learn/${mod.id}`} label={mod.shortTitle} />
      <View style={styles.titleRow}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="caption" color="primary">
            Lesson {index + 1} of {mod.lessons.length}
          </Text>
          <Text variant="display">{lesson.title}</Text>
        </View>
        <IconButton
          icon="bookmark"
          label={bookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
          active={bookmarked}
          onPress={() => toggleBookmark(lesson.id)}
        />
      </View>
      <Text color="textMuted">{lesson.summary}</Text>
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Badge label={lesson.difficulty} />
        <Badge label={`${lesson.estimatedMinutes} min`} icon="clock" />
        {complete ? <Badge label="Complete" tone="success" icon="check" /> : null}
      </View>
    </View>
  );

  const footer = next ? (
    <LinkCard href={`/learn/${mod.id}/${next.id}`} accessibilityLabel={`Next lesson: ${next.title}`}>
      <Text variant="caption" color="textSubtle">
        Next lesson
      </Text>
      <Text variant="heading">{next.title}</Text>
    </LinkCard>
  ) : null;

  if (layout === 'expanded') {
    return (
      <View style={[styles.split, { backgroundColor: colors.bg }]}>
        <ScrollView style={{ flex: 1.25 }} contentContainerStyle={styles.paneContent}>
          {header}
          {lesson.concepts ? (
            <SegmentedTabs
              label="Lesson view"
              value={mainPane}
              onChange={setMainPane}
              options={[
                { value: 'concept', label: 'Concept' },
                { value: 'lesson', label: 'Lesson & practice' },
              ]}
            />
          ) : null}
          {lesson.concepts && mainPane === 'concept' ? (
            <ConceptPanel concepts={lesson.concepts} />
          ) : (
            <>
              <LessonContent lesson={lesson} />
              <Text variant="title">Code examples</Text>
              <ExamplesPanel lesson={lesson} />
            </>
          )}
          {footer}
        </ScrollView>
        {/* Reading the concept page uses the full width; practice and notes return with the lesson view. */}
        {lesson.concepts && mainPane === 'concept' ? null : (
          <View
            style={[
              styles.sidePane,
              {
                borderLeftColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
              <SegmentedTabs
                label="Lesson tools"
                value={sidePane}
                onChange={setSidePane}
                options={[
                  { value: 'practice', label: 'Practice' },
                  { value: 'notes', label: 'Notes & related' },
                ]}
              />
            </View>
            <ScrollView contentContainerStyle={styles.paneContent}>
              {sidePane === 'practice' ? <PracticePanel lesson={lesson} /> : <NotesPanel key={lesson.id} lesson={lesson} />}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  return (
    <Screen maxWidth={860}>
      {header}
      <SegmentedTabs
        label="Lesson sections"
        value={pane}
        onChange={setPane}
        options={[
          ...(lesson.concepts ? [{ value: 'concept' as const, label: 'Concept' }] : []),
          { value: 'learn', label: 'Learn' },
          { value: 'code', label: 'Code' },
          {
            value: 'practice',
            label: 'Practice',
            badge: `${lesson.checks.length}`,
          },
          { value: 'notes', label: 'Notes' },
        ]}
      />
      <PaneBody pane={pane === 'concept' && !lesson.concepts ? 'learn' : pane} lesson={lesson} />
      {footer}
    </Screen>
  );
}

function PaneBody({ pane, lesson }: { pane: Pane; lesson: Lesson }) {
  switch (pane) {
    case 'concept':
      return lesson.concepts ? <ConceptPanel concepts={lesson.concepts} /> : <LessonContent lesson={lesson} />;
    case 'learn':
      return <LessonContent lesson={lesson} />;
    case 'code':
      return <ExamplesPanel lesson={lesson} />;
    case 'practice':
      return <PracticePanel lesson={lesson} />;
    case 'notes':
      return <NotesPanel key={lesson.id} lesson={lesson} />;
  }
}

const styles = StyleSheet.create({
  split: { flex: 1, flexDirection: 'row' },
  sidePane: { flex: 1, maxWidth: 560, borderLeftWidth: 1 },
  paneContent: {
    padding: spacing.xxl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, Card } from '@/components/Card';
import { Inline, Markdown } from '@/components/Markdown';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { findCheck, getLesson } from '@/content';
import { CheckRunner } from '@/features/lessons/CheckRunner';
import { addDays, DAY, formatRelativeDays, startOfDay } from '@/lib/time';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { RevisionCard, RevisionGrade } from '@/types/progress';
import { dueCards, reviewCard } from './scheduler';

const GRADES: { grade: RevisionGrade; label: string; variant: 'danger' | 'secondary' | 'primary' | 'success' }[] = [
  { grade: 'again', label: 'Again', variant: 'danger' },
  { grade: 'hard', label: 'Hard', variant: 'secondary' },
  { grade: 'good', label: 'Good', variant: 'primary' },
  { grade: 'easy', label: 'Easy', variant: 'success' },
];

function intervalLabel(card: RevisionCard, grade: RevisionGrade, now: number): string {
  const next = reviewCard(card, grade, now);
  return grade === 'again' ? '10 min' : `${next.intervalDays}d`;
}

export function RevisionScreen() {
  const cardsMap = useLearningStore((s) => s.cards);
  const review = useLearningStore((s) => s.review);
  const [now] = useState(() => Date.now());
  const cards = useMemo(() => Object.values(cardsMap), [cardsMap]);
  // The session queue is fixed when the screen opens so graded cards leave it.
  const [queue] = useState(() => dueCards(Object.values(useLearningStore.getState().cards), Date.now()).map((c) => c.id));
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [reviewed, setReviewed] = useState(0);

  const currentId = queue[position];
  const card = currentId ? cardsMap[currentId] : undefined;

  const grade = (g: RevisionGrade) => {
    if (!card) return;
    review(card.id, g);
    setReviewed((r) => r + 1);
    setPosition((p) => p + 1);
    setRevealed(false);
    setCheckResult(null);
  };

  const upcoming = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const start = startOfDay(addDays(now, i));
      days.push({ label: formatRelativeDays(start, now), count: cards.filter((c) => c.dueAt >= start && c.dueAt < start + DAY).length });
    }
    return days;
  }, [cards, now]);

  const learned = cards.filter((c) => c.intervalDays >= 7).length;

  return (
    <Screen maxWidth={860}>
      <PageHeader
        eyebrow="Revision"
        title="Delayed recall"
        subtitle="Cards are scheduled with spaced repetition. Recalling after a delay is the strongest evidence that you have actually learned something."
      />

      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Badge label={`${Math.max(0, queue.length - position)} due now`} tone={queue.length - position > 0 ? 'warning' : 'neutral'} />
        <Badge label={`${cards.length} cards total`} />
        <Badge label={`${learned} at 7+ day interval`} tone="success" />
        {reviewed > 0 ? <Badge label={`${reviewed} reviewed this session`} tone="primary" /> : null}
      </View>

      {card ? (
        <Card style={{ gap: spacing.lg }}>
          <CardFace
            card={card}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onCheckAnswered={(correct) => setCheckResult(correct)}
          />
          {card.source.kind === 'check' ? (
            checkResult !== null ? (
              <Button label="Continue" iconRight="chevronRight" onPress={() => grade(checkResult ? 'good' : 'again')} />
            ) : null
          ) : revealed ? (
            <View style={{ gap: spacing.sm }}>
              <Text variant="small" color="textMuted">
                How well did you recall it? Be honest — this schedules the next review.
              </Text>
              <View style={[styles.row, { flexWrap: 'wrap' }]}>
                {GRADES.map((g) => (
                  <Button
                    key={g.grade}
                    label={`${g.label} · ${intervalLabel(card, g.grade, Date.now())}`}
                    variant={g.variant}
                    size="sm"
                    onPress={() => grade(g.grade)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </Card>
      ) : (
        <EmptyState
          icon="check"
          title={reviewed > 0 ? 'Session complete' : 'Nothing due right now'}
          body={
            cards.length === 0
              ? 'Cards are created the day after you complete a lesson, and whenever you miss a knowledge check.'
              : reviewed > 0
                ? `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Come back when the next ones are due.`
                : 'All cards are scheduled for later. See the forecast below.'
          }
        />
      )}

      <Card>
        <SectionHeader title="Next 7 days" icon="clock" />
        <View style={{ gap: spacing.xs }}>
          {upcoming.map((d) => (
            <View key={d.label} style={styles.rowBetween}>
              <Text variant="small">{d.label}</Text>
              <Text variant="small" color={d.count > 0 ? 'text' : 'textSubtle'}>
                {d.count} card{d.count === 1 ? '' : 's'}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

function CardFace({
  card,
  revealed,
  onReveal,
  onCheckAnswered,
}: {
  card: RevisionCard;
  revealed: boolean;
  onReveal: () => void;
  onCheckAnswered: (correct: boolean) => void;
}) {
  const lesson = getLesson(card.source.lessonId);
  const header = (
    <View style={styles.rowBetween}>
      <Text variant="caption" color="primary">
        {lesson?.title ?? 'Lesson'}
      </Text>
      <Badge label={card.repetitions === 0 ? 'New' : `Interval ${card.intervalDays}d`} />
    </View>
  );

  if (card.source.kind === 'check') {
    const check = findCheck(card.source.lessonId, card.source.checkId);
    if (!check || !lesson) return <Text color="textMuted">This card refers to a question that no longer exists.</Text>;
    return (
      <View style={{ gap: spacing.md }}>
        {header}
        <Text variant="small" color="textMuted">
          You missed this question earlier. Answer it again without notes.
        </Text>
        <CheckRunner key={card.id} check={check} lessonId={lesson.id} moduleId={lesson.moduleId} onAnswered={onCheckAnswered} />
      </View>
    );
  }

  const { promptId } = card.source;
  const prompt = lesson?.revision.find((r) => r.id === promptId);
  if (!prompt) return <Text color="textMuted">This card refers to a prompt that no longer exists.</Text>;
  return (
    <View style={{ gap: spacing.md }}>
      {header}
      <Inline text={prompt.question} variant="heading" />
      {revealed ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="caption" color="textSubtle">
            Answer
          </Text>
          <Markdown source={prompt.answer} />
        </View>
      ) : (
        <>
          <Text variant="small" color="textMuted">
            Answer out loud or on paper first, then reveal.
          </Text>
          <Button label="Show answer" variant="secondary" onPress={onReveal} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});

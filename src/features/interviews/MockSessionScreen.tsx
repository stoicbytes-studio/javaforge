import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Badge, Card, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Inline } from '@/components/Markdown';
import { ProgressBar } from '@/components/Progress';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getInterviewQuestion, getLesson, getModule } from '@/content';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { InterviewQuestion } from '@/types/practice';
import { sessionReport } from './mock';
import { QuestionAnswerer } from './QuestionAnswerer';

export const SECONDS_PER_QUESTION = 180;

export function MockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = useLearningStore((s) => s.interviewSessions.find((x) => x.id === sessionId));
  const score = useLearningStore((s) => s.scoreInterviewQuestion);
  const finish = useLearningStore((s) => s.finishInterviewSession);
  const questions = useMemo(
    () => (session?.questionIds.map((id) => getInterviewQuestion(id)).filter((q): q is InterviewQuestion => !!q) ?? []),
    [session?.questionIds],
  );
  const firstUnanswered = questions.findIndex((q) => session?.scores[q.id] === undefined);
  const [index, setIndex] = useState(firstUnanswered === -1 ? 0 : firstUnanswered);

  if (!session) {
    return (
      <Screen>
        <BackLink href="/interview" label="Interview Arena" />
        <EmptyState icon="alert" title="Session not found" body="This mock interview does not exist on this device." />
      </Screen>
    );
  }

  if (session.finishedAt || index >= questions.length) {
    return <Report questions={questions} scores={session.scores} finished={!!session.finishedAt} onFinish={() => finish(session.id)} />;
  }

  const q = questions[index]!;
  const answered = session.scores[q.id] !== undefined;
  return (
    <Screen maxWidth={860}>
      <BackLink href="/interview" label="Interview Arena" />
      <View style={styles.rowBetween}>
        <Text variant="caption" color="primary">
          Question {index + 1} of {questions.length}
        </Text>
        {session.timed ? <Timer key={q.id} running={!answered} /> : null}
      </View>
      <ProgressBar value={index / questions.length} label="Interview progress" height={5} />
      <Card>
        <QuestionAnswerer key={q.id} question={q} onScored={(s) => score(session.id, q.id, s)} disabled={answered} />
      </Card>
      <View style={[styles.row, { justifyContent: 'flex-end' }]}>
        {!answered ? (
          <Button
            label="Skip question"
            variant="ghost"
            onPress={() => {
              score(session.id, q.id, 0);
              setIndex((i) => i + 1);
            }}
          />
        ) : null}
        <Button
          label={index === questions.length - 1 ? 'Finish and see report' : 'Next question'}
          iconRight="chevronRight"
          disabled={!answered}
          onPress={() => {
            if (index === questions.length - 1) finish(session.id);
            setIndex((i) => i + 1);
          }}
        />
      </View>
    </Screen>
  );
}

function Timer({ running }: { running: boolean }) {
  const { colors } = useTheme();
  const [remaining, setRemaining] = useState(SECONDS_PER_QUESTION);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = Math.floor(remaining / 60);
  const s = String(remaining % 60).padStart(2, '0');
  const low = remaining <= 30;
  return (
    <View
      style={styles.row}
      accessibilityLabel={`Time remaining ${m} minutes ${s} seconds`}
      accessibilityLiveRegion={remaining % 60 === 0 || remaining === 30 ? 'polite' : 'none'}
    >
      <Icon name="clock" size={16} color={low ? colors.danger : colors.textMuted} />
      <Text variant="small" weight="700" color={low ? 'danger' : 'textMuted'} mono>
        {remaining === 0 ? 'Time is up — wrap up your answer' : `${m}:${s}`}
      </Text>
    </View>
  );
}

function Report({
  questions,
  scores,
  finished,
  onFinish,
}: {
  questions: InterviewQuestion[];
  scores: Record<string, number>;
  finished: boolean;
  onFinish: () => void;
}) {
  const { colors } = useTheme();
  const report = sessionReport(questions, scores);
  useEffect(() => {
    if (!finished) onFinish();
  }, [finished, onFinish]);
  const recommended = report.weakest.flatMap((q) => q.lessonIds).map((id) => getLesson(id)).filter((l, i, arr) => !!l && arr.findIndex((x) => x?.id === l.id) === i);

  return (
    <Screen maxWidth={860}>
      <BackLink href="/interview" label="Interview Arena" />
      <PageHeader eyebrow="Mock interview report" title={`${Math.round(report.average * 100)}% average`} subtitle={`${report.answered} of ${questions.length} questions answered.`} />
      <Card style={{ gap: spacing.sm }}>
        <SectionHeader title="Question scores" icon="chart" />
        {questions.map((q) => (
          <View key={q.id} style={{ gap: 3 }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Inline text={q.prompt} variant="small" />
              </View>
              <Badge label={scores[q.id] === undefined ? '—' : `${Math.round(scores[q.id]! * 100)}%`} tone={(scores[q.id] ?? 0) >= 0.6 ? 'success' : 'warning'} />
            </View>
            <ProgressBar value={scores[q.id] ?? 0} label="Score" height={4} color={(scores[q.id] ?? 0) >= 0.6 ? colors.success : colors.warning} />
          </View>
        ))}
      </Card>
      {report.weakModules.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title="Focus next" icon="target" />
          <Text variant="small" color="textMuted">
            Weaker topics: {report.weakModules.map((id) => getModule(id)?.shortTitle ?? id).join(', ')}. Review these lessons, then retry the questions.
          </Text>
          {recommended.map((l) => (
            <LinkCard key={l!.id} href={`/learn/${l!.moduleId}/${l!.id}`}>
              <Text weight="600">{l!.title}</Text>
            </LinkCard>
          ))}
        </Card>
      ) : (
        <Card>
          <Text color="success" weight="600">
            No weak topics in this session. Try a harder difficulty or a timed session next.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});

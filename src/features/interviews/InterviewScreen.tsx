import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, Card, LinkCard } from '@/components/Card';
import { Inline } from '@/components/Markdown';
import { ProgressBar } from '@/components/Progress';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { INTERVIEW_QUESTIONS, MODULES } from '@/content';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useLearningStore } from '@/store/learningStore';
import { useLayout } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { Difficulty } from '@/types/curriculum';
import { pickMockQuestions } from './mock';
import { KIND_LABELS } from './QuestionAnswerer';
import { interviewReadiness } from './readiness';

type Tab = 'mock' | 'bank' | 'history';

export function InterviewScreen() {
  const { layout } = useLayout();
  const model = useLearnerModel();
  const readiness = interviewReadiness(model.mastery);
  const [tab, setTab] = useState<Tab>('mock');

  return (
    <Screen>
      <PageHeader
        eyebrow="Interview Arena"
        title="Practise explaining, predicting and debugging"
        subtitle={`${INTERVIEW_QUESTIONS.length} questions across ${new Set(INTERVIEW_QUESTIONS.map((q) => q.moduleId)).size} topics. Written answers are scored with transparent rubrics.`}
      />
      <Card style={{ gap: spacing.xs }}>
        <View style={styles.rowBetween}>
          <Text variant="heading">Readiness estimate</Text>
          <Badge label={readiness.level} tone={readiness.score === null ? 'neutral' : 'primary'} />
        </View>
        {readiness.score !== null ? <ProgressBar value={readiness.score} label="Interview readiness" /> : null}
        <Text variant="small" color="textMuted">
          {readiness.explanation} This estimates practice performance; it is not a hiring prediction.
        </Text>
      </Card>
      <SegmentedTabs
        label="Interview Arena sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'mock', label: 'Mock interview' },
          { value: 'bank', label: 'Question bank' },
          { value: 'history', label: 'Reports' },
        ]}
      />
      {tab === 'mock' ? <MockSetup wide={layout !== 'compact'} /> : tab === 'bank' ? <QuestionBank /> : <History />}
    </Screen>
  );
}

function MockSetup({ wide }: { wide: boolean }) {
  const attempts = useLearningStore((s) => s.attempts);
  const start = useLearningStore((s) => s.startInterviewSession);
  const topics = MODULES.filter((m) => INTERVIEW_QUESTIONS.some((q) => q.moduleId === m.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [count, setCount] = useState<'5' | '8' | '10'>('5');
  const [timed, setTimed] = useState<'on' | 'off'>('off');
  const preview = useMemo(
    () => pickMockQuestions(INTERVIEW_QUESTIONS, attempts, { moduleIds: selected, difficulty, count: Number(count) }, 1),
    [attempts, selected, difficulty, count],
  );

  if (INTERVIEW_QUESTIONS.length === 0) {
    return <EmptyState icon="message" title="No questions yet" body="The question bank is being prepared." />;
  }

  return (
    <Card style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="heading">Topics</Text>
        <Text variant="small" color="textMuted">
          Leave all unselected for a mixed interview. Questions you have not yet answered well come first.
        </Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {topics.map((m) => {
            const on = selected.includes(m.id);
            return (
              <Button
                key={m.id}
                label={m.shortTitle}
                size="sm"
                variant={on ? 'primary' : 'secondary'}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => setSelected((s) => (on ? s.filter((x) => x !== m.id) : [...s, m.id]))}
              />
            );
          })}
        </View>
      </View>
      <View style={[{ gap: spacing.lg }, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
        <Option label="Difficulty">
          <SegmentedTabs
            label="Difficulty"
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'mixed', label: 'Mixed' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
        </Option>
        <Option label="Questions">
          <SegmentedTabs label="Number of questions" value={count} onChange={setCount} options={[{ value: '5', label: '5' }, { value: '8', label: '8' }, { value: '10', label: '10' }]} />
        </Option>
        <Option label="Timer (3 min per question)">
          <SegmentedTabs label="Timed session" value={timed} onChange={setTimed} options={[{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }]} />
        </Option>
      </View>
      <Text variant="small" color="textMuted">
        {preview.length === 0
          ? 'No questions match these filters.'
          : `${preview.length} question${preview.length === 1 ? '' : 's'} available: ${[...new Set(preview.map((q) => KIND_LABELS[q.kind]))].join(', ')}.`}
      </Text>
      <Button
        label="Start mock interview"
        icon="play"
        disabled={preview.length === 0}
        style={{ alignSelf: 'flex-start' }}
        onPress={() => {
          const questions = pickMockQuestions(INTERVIEW_QUESTIONS, attempts, { moduleIds: selected, difficulty, count: Number(count) });
          const id = start(questions.map((q) => q.id), timed === 'on');
          router.push(`/interview/session/${id}`);
        }}
      />
    </Card>
  );
}

function Option({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="small" weight="600">
        {label}
      </Text>
      {children}
    </View>
  );
}

function QuestionBank() {
  const attempts = useLearningStore((s) => s.attempts);
  const [moduleId, setModuleId] = useState<string>('all');
  const best = new Map<string, number>();
  for (const a of attempts) if (a.itemType === 'interview') best.set(a.itemId, Math.max(best.get(a.itemId) ?? 0, a.score));
  const topics = MODULES.filter((m) => INTERVIEW_QUESTIONS.some((q) => q.moduleId === m.id));
  const list = INTERVIEW_QUESTIONS.filter((q) => moduleId === 'all' || q.moduleId === moduleId);
  return (
    <View style={{ gap: spacing.md }}>
      <SegmentedTabs label="Filter by topic" value={moduleId} onChange={setModuleId} options={[{ value: 'all', label: 'All topics' }, ...topics.map((m) => ({ value: m.id, label: m.shortTitle }))]} />
      {list.map((q) => (
        <LinkCard key={q.id} href={`/interview/question/${q.id}`}>
          <View style={{ gap: spacing.xs }}>
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
              <Badge label={KIND_LABELS[q.kind]} tone="primary" />
              <Badge label={q.difficulty} />
              {best.has(q.id) ? <Badge label={`Best ${Math.round(best.get(q.id)! * 100)}%`} tone={best.get(q.id)! >= 0.6 ? 'success' : 'warning'} /> : null}
            </View>
            <Inline text={q.prompt} variant="body" />
          </View>
        </LinkCard>
      ))}
    </View>
  );
}

function History() {
  const sessions = useLearningStore((s) => s.interviewSessions);
  const finished = [...sessions].filter((s) => s.finishedAt).reverse();
  if (finished.length === 0) {
    return <EmptyState icon="chart" title="No reports yet" body="Finish a mock interview to get a report with strengths, gaps and recommended lessons." />;
  }
  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader title="Completed mock interviews" icon="chart" />
      {finished.map((s) => {
        const scores = Object.values(s.scores);
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return (
          <LinkCard key={s.id} href={`/interview/session/${s.id}`}>
            <View style={styles.rowBetween}>
              <View>
                <Text weight="600">{new Date(s.startedAt).toLocaleString()}</Text>
                <Text variant="small" color="textMuted">
                  {scores.length}/{s.questionIds.length} answered{s.timed ? ' · timed' : ''}
                </Text>
              </View>
              <Badge label={`${Math.round(avg * 100)}%`} tone={avg >= 0.7 ? 'success' : avg >= 0.5 ? 'primary' : 'warning'} />
            </View>
          </LinkCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});

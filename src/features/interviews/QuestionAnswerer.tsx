import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, Card, LinkCard } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { Text } from '@/components/Text';
import { getChallenge } from '@/content';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { InterviewQuestion } from '@/types/practice';
import { evaluateWrittenAnswer, INTERVIEW_PASS_SCORE, type InterviewFeedback } from './evaluator';

export const KIND_LABELS: Record<InterviewQuestion['kind'], string> = {
  conceptual: 'Conceptual',
  internals: 'Internal working',
  output: 'Code output',
  debugging: 'Debugging',
  coding: 'Coding',
  scenario: 'Real-world scenario',
};

export const isWrittenQuestion = (q: InterviewQuestion) => !!q.rubric && q.rubric.length > 0;

/**
 * Presents any interview question, records the attempt and shows transparent
 * feedback. Calls onScored with 0..1 once the learner has answered.
 */
export function QuestionAnswerer({
  question,
  onScored,
  disabled,
}: {
  question: InterviewQuestion;
  onScored?: (score: number) => void;
  disabled?: boolean;
}) {
  const recordAttempt = useLearningStore((s) => s.recordAttempt);
  const [scored, setScored] = useState<number | null>(null);

  const record = (score: number) => {
    recordAttempt({
      itemType: 'interview',
      itemId: question.id,
      lessonId: question.lessonIds[0],
      moduleId: question.moduleId,
      dimension: 'interview',
      correct: score >= INTERVIEW_PASS_SCORE,
      score,
      hintsUsed: 0,
      verified: true,
    });
    setScored(score);
    onScored?.(score);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Badge label={KIND_LABELS[question.kind]} tone="primary" />
        <Badge label={question.difficulty} />
      </View>
      <Inline text={question.prompt} variant="title" />
      {question.code ? <CodeBlock code={question.code} /> : null}

      {isWrittenQuestion(question) ? (
        <WrittenAnswer question={question} onEvaluated={(f) => record(f.score)} locked={scored !== null || !!disabled} />
      ) : question.options && question.correctOptionId ? (
        <ChoiceAnswer question={question} onAnswered={(correct) => record(correct ? 1 : 0)} locked={scored !== null || !!disabled} />
      ) : (
        <CodingAnswer question={question} onDone={record} locked={scored !== null || !!disabled} />
      )}
    </View>
  );
}

function WrittenAnswer({ question, onEvaluated, locked }: { question: InterviewQuestion; onEvaluated: (f: InterviewFeedback) => void; locked: boolean }) {
  const { colors } = useTheme();
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback>();
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <View style={{ gap: spacing.md }}>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        multiline
        editable={!feedback && !locked}
        placeholder="Answer as you would in an interview: define it, explain how it works, give an example and a trade-off."
        placeholderTextColor={colors.textSubtle}
        accessibilityLabel="Your answer"
        textAlignVertical="top"
        style={[styles.answer, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
      />
      <View style={styles.rowBetween}>
        <Text variant="small" color="textSubtle">
          {words} words · voice answers are not available (no speech service configured)
        </Text>
        {!feedback ? (
          <Button
            label="Evaluate answer"
            icon="check"
            disabled={words === 0 || locked}
            onPress={() => {
              const f = evaluateWrittenAnswer(question, answer);
              setFeedback(f);
              onEvaluated(f);
            }}
          />
        ) : null}
      </View>
      {feedback ? <FeedbackReport feedback={feedback} /> : null}
    </View>
  );
}

export function FeedbackReport({ feedback }: { feedback: InterviewFeedback }) {
  const { colors } = useTheme();
  const pct = Math.round(feedback.score * 100);
  return (
    <View style={{ gap: spacing.md }} accessibilityLiveRegion="polite">
      <Card tone="raised" style={{ gap: spacing.xs }}>
        <View style={styles.rowBetween}>
          <Text variant="heading">Rubric score</Text>
          <Text variant="title" color={feedback.score >= INTERVIEW_PASS_SCORE ? 'success' : 'warning'}>
            {pct}%
          </Text>
        </View>
        <Text variant="small" color="textMuted">
          Evaluated with a transparent concept rubric (phrase matching), not an AI model. It can miss unusual wording — compare with the model answer and judge for yourself.
        </Text>
      </Card>

      <Section n={1} title="What is correct" tone="success">
        {feedback.covered.length === 0 ? (
          <Text variant="small" color="textMuted">
            None of the key points were detected.
          </Text>
        ) : (
          feedback.covered.map((p) => (
            <View key={p.id} style={styles.row}>
              <Icon name="check" size={15} color={colors.success} />
              <Text variant="small" style={{ flex: 1 }}>
                {p.label}
              </Text>
            </View>
          ))
        )}
      </Section>

      <Section n={2} title="What is missing" tone="warning">
        {feedback.missing.length === 0 ? (
          <Text variant="small" color="textMuted">
            You covered every rubric point.
          </Text>
        ) : (
          feedback.missing.map((p) => (
            <View key={p.id} style={styles.row}>
              <Icon name="x" size={15} color={colors.warning} />
              <Text variant="small" style={{ flex: 1 }}>
                {p.label}
              </Text>
            </View>
          ))
        )}
      </Section>

      <Section n={3} title="Technical inaccuracies" tone="danger">
        {feedback.inaccuracies.length === 0 ? (
          <Text variant="small" color="textMuted">
            No known misconceptions detected.
          </Text>
        ) : (
          feedback.inaccuracies.map((m, i) => (
            <View key={i} style={{ gap: 2 }}>
              <Text variant="small" color="danger">
                “{m.claim}”
              </Text>
              <Inline text={m.correction} variant="small" />
            </View>
          ))
        )}
      </Section>

      <Section n={4} title="How to improve" tone="primary">
        {feedback.improvements.length === 0 ? (
          <Text variant="small" color="textMuted">
            Strong answer. Practise delivering it concisely in under two minutes.
          </Text>
        ) : (
          feedback.improvements.map((tip, i) => <Inline key={i} text={`• ${tip}`} variant="small" />)
        )}
      </Section>

      <Section n={5} title="Interview-ready answer" tone="primary">
        <Markdown source={feedback.modelAnswer} compact />
      </Section>

      {feedback.followUp ? (
        <Section n={6} title="Likely follow-up question" tone="accent">
          <Inline text={feedback.followUp} variant="small" />
        </Section>
      ) : null}
    </View>
  );
}

function Section({ n, title, tone, children }: { n: number; title: string; tone: 'success' | 'warning' | 'danger' | 'primary' | 'accent'; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { borderLeftColor: colors[tone] }]}>
      <Text variant="small" weight="700">
        {n}. {title}
      </Text>
      {children}
    </View>
  );
}

function ChoiceAnswer({ question, onAnswered, locked }: { question: InterviewQuestion; onAnswered: (correct: boolean) => void; locked: boolean }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === question.correctOptionId;
  return (
    <View style={{ gap: spacing.md }}>
      <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
        {question.options!.map((o) => {
          const isCorrect = o.id === question.correctOptionId;
          const isSelected = o.id === selected;
          const border = submitted ? (isCorrect ? colors.success : isSelected ? colors.danger : colors.border) : isSelected ? colors.primary : colors.border;
          return (
            <Button
              key={o.id}
              label={o.text}
              variant="secondary"
              onPress={() => !submitted && !locked && setSelected(o.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: submitted || locked }}
              style={[{ justifyContent: 'flex-start', borderColor: border, borderWidth: 1.5 }, isSelected && !submitted && { backgroundColor: colors.primaryMuted }]}
            />
          );
        })}
      </View>
      {!submitted ? (
        <Button
          label="Submit answer"
          disabled={!selected || locked}
          onPress={() => {
            setSubmitted(true);
            onAnswered(correct);
          }}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <Text variant="heading" color={correct ? 'success' : 'danger'}>
            {correct ? 'Correct' : 'Incorrect'}
          </Text>
          {question.explanation ? <Markdown source={question.explanation} compact /> : null}
          <Card tone="raised" style={{ gap: spacing.xs }}>
            <Text variant="small" weight="700">
              How to say it in an interview
            </Text>
            <Markdown source={question.modelAnswer} compact />
          </Card>
          {question.followUps[0] ? (
            <Text variant="small" color="textMuted">
              Likely follow-up: {question.followUps[0]}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

function CodingAnswer({ question, onDone, locked }: { question: InterviewQuestion; onDone: (score: number) => void; locked: boolean }) {
  const challenge = question.challengeId ? getChallenge(question.challengeId) : undefined;
  const solvedVerified = useLearningStore((s) =>
    challenge ? s.attempts.some((a) => a.itemType === 'challenge' && a.itemId === challenge.id && a.correct && a.verified) : false,
  );
  const [done, setDone] = useState(false);
  return (
    <View style={{ gap: spacing.md }}>
      {challenge ? (
        <LinkCard href={`/practice/${challenge.id}`}>
          <View style={styles.row}>
            <Icon name="code" />
            <View style={{ flex: 1 }}>
              <Text weight="600">Solve it in the playground: {challenge.title}</Text>
              <Text variant="small" color="textMuted">
                {solvedVerified ? 'Solved and verified on a real JVM.' : 'Coding answers are graded by running tests, not by this page.'}
              </Text>
            </View>
          </View>
        </LinkCard>
      ) : null}
      {!done ? (
        <Button
          label={solvedVerified ? 'Record as answered (verified solve)' : 'Show discussion points'}
          variant="secondary"
          disabled={locked}
          onPress={() => {
            setDone(true);
            // Only a verified solve counts as a correct interview answer.
            onDone(solvedVerified ? 1 : 0);
          }}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : (
        <Card tone="raised" style={{ gap: spacing.xs }}>
          <Text variant="small" weight="700">
            What the interviewer listens for
          </Text>
          <Markdown source={question.modelAnswer} compact />
          {question.followUps.map((f) => (
            <Text key={f} variant="small" color="textMuted">
              Follow-up: {f}
            </Text>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  answer: { minHeight: 160, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, fontSize: 15, lineHeight: 22, fontFamily: fonts.sans },
  section: { borderLeftWidth: 3, paddingLeft: spacing.md, gap: spacing.xs },
});

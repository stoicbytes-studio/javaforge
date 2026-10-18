import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, Card, LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Inline } from '@/components/Markdown';
import { ProgressBar } from '@/components/Progress';
import { SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getChallenge, INTERVIEW_QUESTIONS } from '@/content';
import { lessonCompletion } from '@/features/progress/mastery';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { Lesson } from '@/types/curriculum';
import { CheckRunner } from './CheckRunner';

/** Knowledge checks (one at a time), then coding missions, interview questions and mastery criteria. */
export function PracticePanel({ lesson }: { lesson: Lesson }) {
  const { colors } = useTheme();
  const attempts = useLearningStore((s) => s.attempts);
  const status = lessonCompletion(lesson.checks.map((c) => c.id), attempts);
  const firstUnanswered = Math.max(0, lesson.checks.findIndex((c) => !attempts.some((a) => a.itemId === c.id)));
  const [index, setIndex] = useState(status.attempted === status.total ? 0 : firstUnanswered);
  const check = lesson.checks[index];
  const challenges = lesson.challengeIds.map((id) => getChallenge(id)).filter((c) => !!c);
  const questions = INTERVIEW_QUESTIONS.filter((q) => q.lessonIds.includes(lesson.id));
  const solved = new Set(attempts.filter((a) => a.correct && a.itemType === 'challenge').map((a) => a.itemId));
  const answered = new Set(attempts.filter((a) => a.itemType === 'interview').map((a) => a.itemId));

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text variant="heading">Knowledge checks</Text>
          {status.complete ? <Badge label="Lesson complete" tone="success" icon="check" /> : null}
        </View>
        <ProgressBar value={status.total ? status.attempted / status.total : 0} label="Checks attempted" height={6} />
        <Text variant="small" color="textMuted">
          {status.attempted}/{status.total} attempted · {status.correct} correct. Completion needs every check attempted with at least 70% correct.
        </Text>
        {status.complete ? (
          <Text variant="small" color="textMuted">
            Revision cards for this lesson are scheduled for tomorrow — delayed recall is what turns completion into mastery.
          </Text>
        ) : null}
      </Card>

      {check ? (
        <Card>
          <CheckRunner key={check.id} check={check} lessonId={lesson.id} moduleId={lesson.moduleId} index={index} total={lesson.checks.length} />
          <View style={[styles.rowBetween, { marginTop: spacing.lg }]}>
            <Button label="Previous" variant="ghost" icon="chevronLeft" size="sm" disabled={index === 0} onPress={() => setIndex((i) => i - 1)} />
            <View style={styles.dots}>
              {lesson.checks.map((c, i) => {
                const latest = [...attempts].reverse().find((a) => a.itemId === c.id);
                return (
                  <View
                    key={c.id}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: latest ? (latest.correct ? colors.success : colors.danger) : colors.surfaceAlt,
                        borderColor: i === index ? colors.primary : 'transparent',
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Button
              label="Next"
              variant="ghost"
              iconRight="chevronRight"
              size="sm"
              disabled={index >= lesson.checks.length - 1}
              onPress={() => setIndex((i) => i + 1)}
            />
          </View>
        </Card>
      ) : null}

      {challenges.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Coding missions" icon="code" />
          {challenges.map((c) => (
            <LinkCard key={c!.id} href={`/practice/${c!.id}`}>
              <View style={styles.row}>
                <Icon name={c!.kind === 'debugging' ? 'bug' : 'code'} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text weight="600">{c!.title}</Text>
                  <Text variant="small" color="textMuted">
                    {c!.kind === 'debugging' ? 'Debugging' : 'Coding'} · {c!.difficulty}
                  </Text>
                </View>
                {solved.has(c!.id) ? <Badge label="Solved" tone="success" icon="check" /> : <Icon name="chevronRight" size={18} />}
              </View>
            </LinkCard>
          ))}
        </View>
      ) : null}

      {questions.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Interview questions" icon="message" />
          {questions.map((q) => (
            <LinkCard key={q.id} href={`/interview/question/${q.id}`}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Inline text={q.prompt} variant="small" />
                </View>
                {answered.has(q.id) ? <Badge label="Answered" tone="success" /> : <Badge label={q.kind} />}
              </View>
            </LinkCard>
          ))}
        </View>
      ) : null}

      <Card>
        <SectionHeader title="Mastery criteria" icon="trophy" />
        <View style={{ gap: spacing.xs }}>
          {lesson.masteryCriteria.map((m) => (
            <Inline key={m} text={`• ${m}`} variant="small" />
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  dots: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
});

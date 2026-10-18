import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Card, LinkCard } from '@/components/Card';
import { EmptyState, Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getInterviewQuestion, getLesson } from '@/content';
import { spacing } from '@/theme/tokens';
import { QuestionAnswerer } from './QuestionAnswerer';

export function QuestionScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const question = getInterviewQuestion(questionId ?? '');
  const [attemptKey, setAttemptKey] = useState(0);
  const [answered, setAnswered] = useState(false);

  if (!question) {
    return (
      <Screen>
        <BackLink href="/interview" label="Interview Arena" />
        <EmptyState icon="alert" title="Question not found" body="This question does not exist." />
      </Screen>
    );
  }

  const lessons = question.lessonIds.map((id) => getLesson(id)).filter((l) => !!l);
  return (
    <Screen maxWidth={860}>
      <BackLink href="/interview" label="Interview Arena" />
      <Card>
        <QuestionAnswerer key={attemptKey} question={question} onScored={() => setAnswered(true)} />
      </Card>
      {answered ? (
        <Button
          label="Answer again from scratch"
          variant="secondary"
          icon="rotate"
          style={{ alignSelf: 'flex-start' }}
          onPress={() => {
            setAnswered(false);
            setAttemptKey((k) => k + 1);
          }}
        />
      ) : null}
      {lessons.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="heading">Review the material</Text>
          {lessons.map((l) => (
            <LinkCard key={l!.id} href={`/learn/${l!.moduleId}/${l!.id}`}>
              <Text weight="600">{l!.title}</Text>
              <Text variant="small" color="textMuted">
                {l!.summary}
              </Text>
            </LinkCard>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

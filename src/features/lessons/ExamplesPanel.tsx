import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Inline } from '@/components/Markdown';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { SCRATCH_ID } from '@/features/playground/scratch';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { Lesson } from '@/types/curriculum';

/** Code examples with copy, "open in playground" and a step-by-step execution walkthrough. */
export function ExamplesPanel({ lesson }: { lesson: Lesson }) {
  const { colors } = useTheme();
  const saveDraft = useLearningStore((s) => s.saveDraft);
  const [exampleId, setExampleId] = useState(lesson.examples[0]?.id ?? '');
  const [step, setStep] = useState(0);
  const example = lesson.examples.find((e) => e.id === exampleId) ?? lesson.examples[0];
  const walkthrough = lesson.walkthrough.exampleId === example?.id ? lesson.walkthrough : undefined;
  const current = walkthrough?.steps[step];

  if (!example) return null;

  const openInPlayground = () => {
    saveDraft(SCRATCH_ID, example.code);
    router.push(`/practice/${SCRATCH_ID}${example.stdin ? `?stdin=${encodeURIComponent(example.stdin)}` : ''}`);
  };

  return (
    <View style={{ gap: spacing.md }}>
      {lesson.examples.length > 1 ? (
        <SegmentedTabs
          label="Code examples"
          value={example.id}
          onChange={(id) => {
            setExampleId(id);
            setStep(0);
          }}
          options={lesson.examples.map((e) => ({ value: e.id, label: e.title }))}
        />
      ) : null}

      <CodeBlock code={example.code} title={example.title} highlight={current?.lines} />

      {example.stdin ? (
        <CodeBlock code={example.stdin.trimEnd()} title="Standard input" language="text" showLineNumbers={false} copyable={false} />
      ) : null}
      {example.expectedOutput !== undefined ? (
        <CodeBlock code={example.expectedOutput} title="Output (verified on JDK 21)" language="text" showLineNumbers={false} copyable={false} />
      ) : null}
      {example.explanation ? <Inline text={example.explanation} variant="small" color="textMuted" /> : null}

      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Button label="Open in playground" variant="secondary" icon="terminal" size="sm" onPress={openInPlayground} />
        {example.minJavaVersion ? (
          <Text variant="small" color="textMuted">
            Requires Java {example.minJavaVersion}+
          </Text>
        ) : null}
      </View>

      {walkthrough ? (
        <Card tone="raised" style={{ gap: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text variant="heading">Execution walkthrough</Text>
            <Text variant="small" color="textMuted">
              Step {step + 1} of {walkthrough.steps.length}
            </Text>
          </View>
          <View
            accessibilityLiveRegion="polite"
            style={[styles.stepBox, { borderLeftColor: colors.primary, backgroundColor: colors.surfaceAlt }]}
          >
            {current?.lines ? (
              <Text variant="caption" color="primary">
                {current.lines[0] === current.lines[1] ? `Line ${current.lines[0]}` : `Lines ${current.lines[0]}–${current.lines[1]}`}
              </Text>
            ) : null}
            <Inline text={current?.text ?? ''} variant="body" />
          </View>
          <View style={styles.row}>
            <IconButton icon="stepBack" label="Previous step" disabled={step === 0} onPress={() => setStep((s) => s - 1)} />
            <IconButton icon="stepForward" label="Next step" disabled={step >= walkthrough.steps.length - 1} onPress={() => setStep((s) => s + 1)} />
            <IconButton icon="rotate" label="Restart walkthrough" disabled={step === 0} onPress={() => setStep(0)} />
          </View>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBox: { borderLeftWidth: 3, borderRadius: radius.sm, padding: spacing.md, gap: spacing.xs },
});

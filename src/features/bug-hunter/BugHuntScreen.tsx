import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Badge, Card } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { EmptyState, Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getBugHunt } from '@/content';
import { useLearningStore } from '@/store/learningStore';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { ChoiceOption } from '@/types/curriculum';
import { scoreBugHunt } from './scoring';

type Step = 'locate' | 'cause' | 'fix' | 'review';
const STEPS: { id: Step; label: string }[] = [
  { id: 'locate', label: 'Locate' },
  { id: 'cause', label: 'Root cause' },
  { id: 'fix', label: 'Fix' },
  { id: 'review', label: 'Review' },
];

export function BugHuntScreen() {
  const { bugId } = useLocalSearchParams<{ bugId: string }>();
  const hunt = getBugHunt(bugId ?? '');
  const { layout } = useLayout();
  const { colors } = useTheme();
  const recordAttempt = useLearningStore((s) => s.recordAttempt);
  const [step, setStep] = useState<Step>('locate');
  const [lines, setLines] = useState<number[]>([]);
  const [cause, setCause] = useState<string>();
  const [fix, setFix] = useState<string>();
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof scoreBugHunt>>();

  if (!hunt) {
    return (
      <Screen>
        <BackLink href="/bug-hunter" label="Bug Hunter" />
        <EmptyState icon="alert" title="Case not found" body="This debugging case does not exist." />
      </Screen>
    );
  }

  const submit = () => {
    if (!cause || !fix) return;
    const r = scoreBugHunt(hunt, lines, cause, fix);
    setResult(r);
    recordAttempt({
      itemType: 'bug-hunt',
      itemId: hunt.id,
      moduleId: hunt.moduleId,
      dimension: 'debugging',
      correct: r.score >= 0.7,
      score: r.score,
      hintsUsed: hints,
      verified: true,
    });
    setStep('review');
  };

  const restart = () => {
    setStep('locate');
    setLines([]);
    setCause(undefined);
    setFix(undefined);
    setResult(undefined);
  };

  const evidence = (
    <View style={{ gap: spacing.md }}>
      <Card tone="raised" style={{ gap: spacing.xs }}>
        <Text variant="caption" color="danger">
          Symptom
        </Text>
        <Markdown source={hunt.symptom} compact />
      </Card>
      {hunt.evidence ? <CodeBlock code={hunt.evidence} title="Evidence" language="text" showLineNumbers={false} /> : null}
      <Text variant="small" color="textMuted">
        {step === 'locate' ? 'Tap the line(s) where the defect is.' : 'Code under investigation'}
      </Text>
      <CodeBlock
        code={hunt.code}
        selectedLines={step === 'review' ? hunt.buggyLines : lines}
        onLinePress={step === 'locate' ? (n) => setLines((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n])) : undefined}
        copyable={false}
      />
    </View>
  );

  const panel = (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.stepper} accessibilityRole="progressbar" accessibilityLabel={`Step ${STEPS.findIndex((s) => s.id === step) + 1} of 4`}>
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const done = STEPS.findIndex((x) => x.id === step) > i;
          return (
            <View key={s.id} style={[styles.stepPill, { backgroundColor: active ? colors.primaryMuted : done ? colors.successMuted : colors.surfaceAlt }]}>
              <Text variant="small" weight={active ? '700' : '500'} color={active ? 'primary' : done ? 'success' : 'textMuted'}>
                {i + 1}. {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {step === 'locate' ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="heading">Where is the defect?</Text>
          <Text variant="small" color="textMuted">
            Selected lines: {lines.length ? [...lines].sort((a, b) => a - b).join(', ') : 'none'}
          </Text>
          <Button label="Continue" iconRight="chevronRight" disabled={lines.length === 0} onPress={() => setStep('cause')} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : null}
      {step === 'cause' ? (
        <Choice title="What is the root cause?" options={hunt.rootCauseOptions} value={cause} onChange={setCause} onNext={() => setStep('fix')} onBack={() => setStep('locate')} />
      ) : null}
      {step === 'fix' ? (
        <Choice title="Which fix is correct?" options={hunt.fixOptions} value={fix} onChange={setFix} onNext={submit} nextLabel="Submit diagnosis" onBack={() => setStep('cause')} />
      ) : null}
      {step === 'review' && result ? (
        <View style={{ gap: spacing.md }} accessibilityLiveRegion="polite">
          <Card tone="raised" style={{ gap: spacing.sm }}>
            <View style={styles.rowBetween}>
              <Text variant="heading">Diagnosis score</Text>
              <Text variant="title" color={result.score >= 0.7 ? 'success' : 'warning'}>
                {Math.round(result.score * 100)}%
              </Text>
            </View>
            <ResultRow ok={result.location >= 0.99} label={`Location: ${Math.round(result.location * 100)}% overlap with lines ${hunt.buggyLines.join(', ')}`} />
            <ResultRow ok={result.cause === 1} label={`Root cause: ${hunt.rootCauseOptions.find((o) => o.id === hunt.correctRootCauseId)?.text}`} />
            <ResultRow ok={result.fix === 1} label="Fix" />
          </Card>
          {hunt.fixOptions.find((f) => f.id === hunt.correctFixId)?.code ? (
            <CodeBlock code={hunt.fixOptions.find((f) => f.id === hunt.correctFixId)!.code!} title="Corrected code" />
          ) : null}
          <Markdown source={hunt.explanation} />
          <Card style={{ gap: spacing.xs }}>
            <Text variant="heading">Prevention</Text>
            {hunt.prevention.map((p) => (
              <Inline key={p} text={`• ${p}`} variant="small" />
            ))}
          </Card>
          <Button label="Try again" variant="secondary" icon="rotate" onPress={restart} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : null}

      {step !== 'review' ? (
        <Card style={{ gap: spacing.sm }}>
          <View style={styles.rowBetween}>
            <Text variant="small" weight="700">
              Hints ({hints}/{hunt.hints.length})
            </Text>
            {hints < hunt.hints.length ? <Button label="Reveal hint" size="sm" variant="secondary" icon="lightbulb" onPress={() => setHints((h) => h + 1)} /> : null}
          </View>
          {hunt.hints.slice(0, hints).map((h, i) => (
            <Inline key={i} text={`${i + 1}. ${h}`} variant="small" />
          ))}
        </Card>
      ) : null}
    </View>
  );

  return (
    <Screen maxWidth={layout === 'expanded' ? 1280 : 860}>
      <BackLink href="/bug-hunter" label="Bug Hunter" />
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Text variant="title">{hunt.title}</Text>
        <Badge label={hunt.category} tone="warning" />
        <Badge label={hunt.difficulty} />
      </View>
      {layout === 'expanded' ? (
        <View style={{ flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.3 }}>{evidence}</View>
          <View style={{ flex: 1 }}>{panel}</View>
        </View>
      ) : (
        <>
          {evidence}
          {panel}
        </>
      )}
    </Screen>
  );
}

function ResultRow({ ok, label }: { ok: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Icon name={ok ? 'check' : 'x'} size={16} color={ok ? colors.success : colors.danger} />
      <Text variant="small" style={{ flex: 1 }}>
        {label}
      </Text>
    </View>
  );
}

function Choice({
  title,
  options,
  value,
  onChange,
  onNext,
  onBack,
  nextLabel = 'Continue',
}: {
  title: string;
  options: (ChoiceOption & { code?: string })[];
  value?: string;
  onChange: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <Text variant="heading">{title}</Text>
      <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <View key={o.id} style={[styles.option, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primaryMuted : colors.surface }]}>
              <Button
                label={o.text}
                variant="ghost"
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onChange(o.id)}
                style={{ justifyContent: 'flex-start', alignItems: 'flex-start', borderWidth: 0 }}
              />
              {o.code ? <CodeBlock code={o.code} showLineNumbers={false} copyable={false} /> : null}
            </View>
          );
        })}
      </View>
      <View style={styles.row}>
        <Button label="Back" variant="ghost" icon="chevronLeft" onPress={onBack} />
        <Button label={nextLabel} iconRight="chevronRight" disabled={!value} onPress={onNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  stepper: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  stepPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  option: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.xs, gap: spacing.xs },
});

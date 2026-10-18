import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Badge, Card } from '@/components/Card';
import { MetricChart } from '@/components/charts';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { ProgressBar } from '@/components/Progress';
import { EmptyState, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getIncident } from '@/content';
import { useLearningStore } from '@/store/learningStore';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { EvidenceItem } from '@/types/practice';
import { scoreIncident } from './scoring';

type Stage = 'investigate' | 'diagnose' | 'fix' | 'postmortem';

export function IncidentScreen() {
  const { incidentId } = useLocalSearchParams<{ incidentId: string }>();
  const incident = getIncident(incidentId ?? '');
  const { layout } = useLayout();
  const { colors } = useTheme();
  const recordAttempt = useLearningStore((s) => s.recordAttempt);
  const recordIncidentRun = useLearningStore((s) => s.recordIncidentRun);
  const [stage, setStage] = useState<Stage>('investigate');
  const [taken, setTaken] = useState<string[]>([]);
  const [hypothesis, setHypothesis] = useState<string>();
  const [fix, setFix] = useState<string>();
  const [result, setResult] = useState<ReturnType<typeof scoreIncident>>();

  const evidence = useMemo<EvidenceItem[]>(() => {
    if (!incident) return [];
    return [...incident.initialEvidence, ...taken.flatMap((id) => incident.actions.find((a) => a.id === id)?.reveals ?? [])];
  }, [incident, taken]);

  if (!incident) {
    return (
      <Screen>
        <BackLink href="/bug-hunter" label="Bug Hunter" />
        <EmptyState icon="alert" title="Incident not found" body="This incident scenario does not exist." />
      </Screen>
    );
  }

  const minutes = incident.actions.filter((a) => taken.includes(a.id)).reduce((s, a) => s + a.costMinutes, 0);
  const lastAction = taken.length ? incident.actions.find((a) => a.id === taken[taken.length - 1]) : undefined;

  const finish = () => {
    if (!hypothesis || !fix) return;
    const r = scoreIncident(incident, taken, hypothesis, fix);
    setResult(r);
    recordAttempt({
      itemType: 'incident',
      itemId: incident.id,
      moduleId: incident.relatedModuleIds[0],
      dimension: 'debugging',
      correct: r.hypothesisCorrect && r.fixCorrect,
      score: r.score,
      hintsUsed: 0,
      verified: true,
    });
    recordIncidentRun({
      incidentId: incident.id,
      at: Date.now(),
      actionsTaken: taken,
      minutesUsed: r.minutes,
      hypothesisCorrect: r.hypothesisCorrect,
      fixCorrect: r.fixCorrect,
      score: r.score,
    });
    setStage('postmortem');
  };

  const restart = () => {
    setStage('investigate');
    setTaken([]);
    setHypothesis(undefined);
    setFix(undefined);
    setResult(undefined);
  };

  const board = (
    <View style={{ gap: spacing.md }}>
      <SectionHeader title={`Evidence board · ${evidence.length}`} icon="layers" />
      {evidence.map((e) => (
        <EvidenceCard key={e.id} item={e} />
      ))}
    </View>
  );

  const controls = (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ gap: spacing.xs }}>
        <View style={styles.rowBetween}>
          <Text variant="small" weight="700">
            Investigation clock
          </Text>
          <Text variant="small" color={minutes > incident.timeBudgetMinutes ? 'danger' : 'textMuted'}>
            {minutes} / {incident.timeBudgetMinutes} min
          </Text>
        </View>
        <ProgressBar value={minutes / incident.timeBudgetMinutes} label="Time used" color={minutes > incident.timeBudgetMinutes ? colors.danger : colors.warning} height={6} />
        <Text variant="small" color="textSubtle">
          Each diagnostic action costs time. Prefer actions that test a hypothesis.
        </Text>
      </Card>

      {stage === 'investigate' ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Diagnostic actions" icon="search" />
          {lastAction ? (
            <View style={[styles.feedback, { borderColor: lastAction.useful ? colors.success : colors.border, backgroundColor: colors.surfaceAlt }]} accessibilityLiveRegion="polite">
              <Text variant="small" weight="700" color={lastAction.useful ? 'success' : 'textMuted'}>
                {lastAction.label}
              </Text>
              <Inline text={lastAction.feedback} variant="small" />
            </View>
          ) : null}
          {incident.actions.map((a) => {
            const done = taken.includes(a.id);
            return (
              <Button
                key={a.id}
                label={`${a.label} · ${a.costMinutes} min`}
                variant={done ? 'ghost' : 'secondary'}
                icon={done ? 'check' : 'search'}
                disabled={done}
                onPress={() => setTaken((t) => [...t, a.id])}
                style={{ justifyContent: 'flex-start' }}
              />
            );
          })}
          <Button label="I know the root cause" iconRight="chevronRight" onPress={() => setStage('diagnose')} disabled={taken.length === 0} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : null}

      {stage === 'diagnose' ? (
        <Pick
          title="What is the root cause?"
          options={incident.hypotheses.map((h) => ({ id: h.id, text: h.text }))}
          value={hypothesis}
          onChange={setHypothesis}
          onBack={() => setStage('investigate')}
          onNext={() => setStage('fix')}
        />
      ) : null}
      {stage === 'fix' ? (
        <Pick
          title="What do you change?"
          options={incident.fixes.map((f) => ({ id: f.id, text: f.text }))}
          value={fix}
          onChange={setFix}
          onBack={() => setStage('diagnose')}
          onNext={finish}
          nextLabel="Resolve incident"
        />
      ) : null}

      {stage === 'postmortem' && result ? (
        <View style={{ gap: spacing.md }} accessibilityLiveRegion="polite">
          <Card tone="raised" style={{ gap: spacing.sm }}>
            <View style={styles.rowBetween}>
              <Text variant="heading">Postmortem score</Text>
              <Text variant="title" color={result.hypothesisCorrect && result.fixCorrect ? 'success' : 'warning'}>
                {Math.round(result.score * 100)}%
              </Text>
            </View>
            <Text variant="small">
              {result.hypothesisCorrect ? '✓' : '✗'} Root cause · {result.fixCorrect ? '✓' : '✗'} Fix · Efficiency {Math.round(result.efficiency * 100)}% ({result.minutes} min, {taken.length} actions)
            </Text>
          </Card>
          <Card style={{ gap: spacing.xs }}>
            <Text variant="heading">Root cause</Text>
            <Markdown source={incident.rootCause} compact />
          </Card>
          {fix ? (
            <Card style={{ gap: spacing.xs }}>
              <Text variant="heading">Your fix</Text>
              <Inline text={incident.fixes.find((f) => f.id === fix)?.feedback ?? ''} variant="small" />
            </Card>
          ) : null}
          <Card style={{ gap: spacing.xs }}>
            <Text variant="heading">Prevention</Text>
            {incident.prevention.map((p) => (
              <Inline key={p} text={`• ${p}`} variant="small" />
            ))}
          </Card>
          <Card style={{ gap: spacing.xs }}>
            <Text variant="heading">Your investigation</Text>
            {taken.map((id, i) => {
              const a = incident.actions.find((x) => x.id === id)!;
              return (
                <Text key={id} variant="small" color={a.useful ? 'text' : 'textMuted'}>
                  {i + 1}. {a.label} ({a.costMinutes} min){a.useful ? '' : ' — low signal'}
                </Text>
              );
            })}
          </Card>
          <Button label="Run the incident again" variant="secondary" icon="rotate" onPress={restart} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen maxWidth={layout === 'expanded' ? 1280 : 860}>
      <BackLink href="/bug-hunter" label="Bug Hunter" />
      <View style={[styles.alert, { borderColor: colors.danger, backgroundColor: colors.dangerMuted }]}>
        <Icon name="alert" color={colors.danger} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={[styles.row, { flexWrap: 'wrap' }]}>
            <Badge label={incident.severity} tone="danger" />
            <Text variant="small" color="textMuted">
              {incident.service}
            </Text>
          </View>
          <Text variant="heading">{incident.title}</Text>
          <Inline text={incident.alert} variant="small" />
        </View>
      </View>
      <Markdown source={incident.context} />
      <Text variant="small" color="textSubtle">
        Synthetic scenario: logs, metrics and dumps are realistic but generated for training.
      </Text>
      {layout === 'expanded' ? (
        <View style={{ flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.3 }}>{board}</View>
          <View style={{ flex: 1 }}>{controls}</View>
        </View>
      ) : (
        <>
          {controls}
          {board}
        </>
      )}
    </Screen>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <Card style={{ gap: spacing.sm }}>
      <View style={styles.row}>
        <Badge label={item.kind} tone={item.kind === 'metric' ? 'primary' : item.kind === 'log' ? 'neutral' : 'accent'} />
        <Text weight="600" style={{ flex: 1 }}>
          {item.title}
        </Text>
      </View>
      {item.series ? <MetricChart points={item.series.points} unit={item.series.unit} threshold={item.series.threshold} label={item.series.label} /> : null}
      {item.content ? (
        item.kind === 'text' ? (
          <Markdown source={item.content} compact />
        ) : (
          <CodeBlock code={item.content} language={item.kind === 'code' ? 'java' : 'text'} showLineNumbers={item.kind === 'code'} copyable={false} />
        )
      ) : null}
    </Card>
  );
}

function Pick({
  title,
  options,
  value,
  onChange,
  onBack,
  onNext,
  nextLabel = 'Continue',
}: {
  title: string;
  options: { id: string; text: string }[];
  value?: string;
  onChange: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="heading">{title}</Text>
      <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
        {options.map((o) => (
          <Button
            key={o.id}
            label={o.text}
            variant="secondary"
            accessibilityRole="radio"
            accessibilityState={{ checked: o.id === value }}
            onPress={() => onChange(o.id)}
            style={[{ justifyContent: 'flex-start' }, o.id === value && { borderColor: colors.primary, backgroundColor: colors.primaryMuted }]}
          />
        ))}
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
  alert: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderRadius: radius.lg },
  feedback: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
});

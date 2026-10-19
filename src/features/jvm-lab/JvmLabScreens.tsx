import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { IconButton } from '@/components/Button';
import { Badge, Card, LinkCard } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline } from '@/components/Markdown';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { getJvmScenario, JVM_SCENARIOS } from '@/content';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { JvmPhase, JvmScenario } from '@/types/practice';
import { BytecodeView, ClassesView, HeapView, ThreadsView } from './JvmViews';

export const SIMULATION_DISCLAIMER =
  'Conceptual model, not a trace of a real JVM. HotSpot and other JVMs may optimise differently: the JIT can inline methods, escape analysis can remove allocations, and object layout, addresses and GC timing are implementation details.';

const PHASES: { id: JvmPhase; label: string }[] = [
  { id: 'compile', label: 'Compile' },
  { id: 'load', label: 'Load' },
  { id: 'link', label: 'Link' },
  { id: 'initialize', label: 'Init' },
  { id: 'execute', label: 'Execute' },
  { id: 'threads', label: 'Threads' },
  { id: 'gc', label: 'GC' },
];

const SPEEDS = { '0.5': 3000, '1': 1800, '2': 900 } as const;

export function JvmLabScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <PageHeader
        eyebrow="JVM Visualization Lab"
        title="See what the JVM does"
        subtitle="Step through compilation, class loading, stack frames, heap objects, references, garbage collection and threads."
      />
      <View style={[styles.note, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Icon name="info" size={16} color={colors.textMuted} />
        <Text variant="small" color="textMuted" style={{ flex: 1 }}>
          {SIMULATION_DISCLAIMER}
        </Text>
      </View>
      {JVM_SCENARIOS.length === 0 ? <EmptyState title="No scenarios yet" body="Visualizations are being prepared." /> : null}
      {JVM_SCENARIOS.map((s) => (
        <LinkCard key={s.id} href={`/jvm-lab/${s.id}`}>
          <View style={{ gap: spacing.xs }}>
            <View style={styles.rowBetween}>
              <Text variant="heading" style={{ flex: 1 }}>
                {s.title}
              </Text>
              <Badge label={`${s.steps.length} steps`} />
            </View>
            <Text variant="small" color="textMuted">
              {s.summary}
            </Text>
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
              {s.concepts.map((c) => (
                <Badge key={c} label={c} tone="accent" />
              ))}
            </View>
          </View>
        </LinkCard>
      ))}
    </Screen>
  );
}

export function JvmScenarioScreen() {
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const scenario = getJvmScenario(scenarioId ?? '');
  if (!scenario) {
    return (
      <Screen>
        <BackLink href="/jvm-lab" label="JVM Lab" />
        <EmptyState icon="alert" title="Scenario not found" body="This visualization does not exist." />
      </Screen>
    );
  }
  return <Player key={scenario.id} scenario={scenario} />;
}

type Pane = 'stack' | 'heap' | 'classes' | 'bytecode';

function Player({ scenario }: { scenario: JvmScenario }) {
  const { colors, reducedMotion } = useTheme();
  const { layout } = useLayout();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<keyof typeof SPEEDS>('1');
  const [highlight, setHighlight] = useState<string>();
  const [pane, setPane] = useState<Pane>('stack');
  const step = scenario.steps[index]!;
  const last = scenario.steps.length - 1;

  // Playback stops by itself at the last step.
  const isPlaying = playing && index < last;
  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setIndex((i) => Math.min(last, i + 1)), SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [isPlaying, index, last, speed]);

  const ref = { highlight, onHighlight: setHighlight };
  const phaseIndex = PHASES.findIndex((p) => p.id === step.phase);

  const controls = (
    <View style={[styles.controls, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <IconButton icon="rotate" label="Reset to first step" onPress={() => { setPlaying(false); setIndex(0); }} disabled={index === 0} />
      <IconButton icon="stepBack" label="Step backward" onPress={() => { setPlaying(false); setIndex((i) => Math.max(0, i - 1)); }} disabled={index === 0} />
      <IconButton icon={isPlaying ? 'pause' : 'play'} label={isPlaying ? 'Pause' : 'Play'} active={isPlaying} onPress={() => setPlaying(!isPlaying)} disabled={index >= last} />
      <IconButton icon="stepForward" label="Step forward" onPress={() => { setPlaying(false); setIndex((i) => Math.min(last, i + 1)); }} disabled={index >= last} />
      <Text variant="small" color="textMuted" style={{ marginHorizontal: spacing.sm }} accessibilityLiveRegion="polite">
        Step {index + 1}/{scenario.steps.length}
      </Text>
      <SegmentedTabs
        label="Playback speed"
        value={speed}
        onChange={setSpeed}
        options={[
          { value: '0.5', label: '0.5×' },
          { value: '1', label: '1×' },
          { value: '2', label: '2×' },
        ]}
      />
    </View>
  );

  const explanation = (
    <Card tone="raised" style={{ gap: spacing.sm, borderColor: colors.primary }}>
      <View style={[styles.phases]} accessibilityLabel={`Phase: ${step.phase}`}>
        {PHASES.map((p, i) => (
          <View key={p.id} style={[styles.phase, { backgroundColor: p.id === step.phase ? colors.primary : i < phaseIndex ? colors.primaryMuted : colors.surfaceAlt }]}>
            <Text variant="caption" style={{ color: p.id === step.phase ? colors.onPrimary : colors.textMuted, textTransform: 'none', letterSpacing: 0 }}>
              {p.label}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="heading">{step.title}</Text>
      <Inline text={step.explanation} variant="body" />
    </Card>
  );

  const source = <CodeBlock code={scenario.source} title="Program" highlight={step.line ? [step.line, step.line] : undefined} />;
  const output =
    step.output !== undefined ? <CodeBlock code={step.output || ' '} title="Console output" language="text" showLineNumbers={false} copyable={false} /> : null;

  const stack = <ThreadsView threads={step.threads} {...ref} />;
  const heap = <HeapView heap={step.heap} {...ref} />;
  const classes = <ClassesView classes={step.classes} {...ref} />;

  const header = (
    <View style={{ gap: spacing.sm }}>
      <BackLink href="/jvm-lab" label="JVM Lab" />
      <Text variant="title">{scenario.title}</Text>
      <Text variant="small" color="textSubtle">
        {SIMULATION_DISCLAIMER}
      </Text>
      {reducedMotion ? (
        <Text variant="small" color="textSubtle">
          Reduced motion is on: steps change without animation. Use the step buttons to control pacing.
        </Text>
      ) : null}
    </View>
  );

  if (layout === 'expanded') {
    return (
      <Screen maxWidth={1400}>
        {header}
        {controls}
        <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.05, gap: spacing.md }}>
            {explanation}
            {source}
            {step.bytecode ? (
              <View style={{ gap: spacing.xs }}>
                <SectionHeader title="Bytecode (javap -c)" icon="terminal" />
                <BytecodeView bytecode={step.bytecode} />
              </View>
            ) : null}
            {output}
          </View>
          <View style={{ flex: 1, gap: spacing.md }}>
            <Card>
              <SectionHeader title="Stack (per thread)" icon="layers" />
              {stack}
            </Card>
            <Card>
              <SectionHeader title="Method area / Metaspace" icon="book" />
              {classes}
            </Card>
          </View>
          <View style={{ flex: 1, gap: spacing.md }}>
            <Card>
              <SectionHeader title="Heap" icon="cpu" />
              {heap}
            </Card>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen maxWidth={860}>
      {header}
      {controls}
      {explanation}
      {source}
      {output}
      <SegmentedTabs
        label="Memory areas"
        value={pane}
        onChange={setPane}
        options={[
          { value: 'stack', label: 'Stack' },
          { value: 'heap', label: 'Heap', badge: `${step.heap.filter((o) => !o.collected).length}` },
          { value: 'classes', label: 'Classes' },
          ...(step.bytecode ? [{ value: 'bytecode' as const, label: 'Bytecode' }] : []),
        ]}
      />
      <Card>{pane === 'stack' ? stack : pane === 'heap' ? heap : pane === 'classes' ? classes : step.bytecode ? <BytecodeView bytecode={step.bytecode} /> : null}</Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  note: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderRadius: radius.md },
  controls: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs, padding: spacing.sm, borderWidth: 1, borderRadius: radius.lg },
  phases: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  phase: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
});

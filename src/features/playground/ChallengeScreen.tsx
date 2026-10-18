import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Badge, Card } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { EmptyState, Screen } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { getChallenge } from '@/content';
import { ExecutorError } from '@/services/execution/remote';
import type { ExecutionResponse } from '@/services/execution/types';
import { useExecutor } from '@/services/execution/useExecutor';
import { useLearningStore } from '@/store/learningStore';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { CodingChallenge } from '@/types/curriculum';
import { CodeEditor } from './CodeEditor';
import {
  buildRunRequest,
  buildSubmitRequest,
  runStaticChecks,
  SOLUTION_VIEWED_SCORE,
  summarizeSubmission,
  type SubmissionSummary,
} from './evaluation';
import { ExecutionBanner } from './ExecutionBanner';
import { OutputPanel } from './OutputPanel';
import { SCRATCH_ID, SCRATCH_TEMPLATE } from './scratch';

type CompactTab = 'task' | 'code' | 'output';

export function ChallengeScreen() {
  const params = useLocalSearchParams<{ challengeId: string; stdin?: string }>();
  const id = params.challengeId ?? '';
  const isScratch = id === SCRATCH_ID;
  const challenge = isScratch ? undefined : getChallenge(id);

  if (!isScratch && !challenge) {
    return (
      <Screen>
        <BackLink href="/practice" label="Playground" />
        <EmptyState icon="alert" title="Challenge not found" body="This challenge does not exist. Choose one from the playground." />
      </Screen>
    );
  }
  return <Workspace key={id} challenge={challenge} initialStdin={params.stdin} />;
}

function Workspace({ challenge, initialStdin }: { challenge?: CodingChallenge; initialStdin?: string }) {
  const { layout } = useLayout();
  const { colors } = useTheme();
  const draftKey = challenge?.id ?? SCRATCH_ID;
  const savedDraft = useLearningStore((s) => s.drafts[draftKey]);
  const saveDraft = useLearningStore((s) => s.saveDraft);
  const clearDraft = useLearningStore((s) => s.clearDraft);
  const recordAttempt = useLearningStore((s) => s.recordAttempt);
  const alreadySolved = useLearningStore((s) =>
    challenge ? s.attempts.some((a) => a.itemType === 'challenge' && a.itemId === challenge.id && a.correct) : false,
  );

  const starter = challenge?.starterCode ?? SCRATCH_TEMPLATE;
  const [code, setCode] = useState(savedDraft ?? starter);
  const [stdin, setStdin] = useState(initialStdin ?? challenge?.tests.find((t) => !t.hidden)?.stdin ?? '');
  const [hints, setHints] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [response, setResponse] = useState<ExecutionResponse>();
  const [summary, setSummary] = useState<SubmissionSummary>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<'run' | 'submit' | null>(null);
  const [tab, setTab] = useState<CompactTab>(challenge ? 'task' : 'code');
  const exec = useExecutor();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onChange = (next: string) => {
    setCode(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDraft(draftKey, next), 400);
  };
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const staticResults = useMemo(() => (challenge ? runStaticChecks(challenge, code) : []), [challenge, code]);

  const execute = async (kind: 'run' | 'submit') => {
    setBusy(kind);
    setError(undefined);
    setSummary(undefined);
    if (layout !== 'expanded') setTab('output');
    try {
      const request = kind === 'submit' && challenge ? buildSubmitRequest(code, challenge) : buildRunRequest(code, stdin);
      const res = await exec.executor.execute(request);
      setResponse(res);
      if (kind === 'submit' && challenge) {
        const s = summarizeSubmission(res, challenge, code);
        setSummary(s);
        // Only real executions are graded automatically.
        if (s.verified) {
          recordAttempt({
            itemType: 'challenge',
            itemId: challenge.id,
            lessonId: challenge.lessonId,
            moduleId: challenge.moduleId,
            dimension: challenge.dimension,
            correct: s.passed,
            score: s.passed ? (solutionShown ? SOLUTION_VIEWED_SCORE : 1) : s.passedTests / Math.max(1, s.totalTests) / 2,
            hintsUsed: hints,
            verified: true,
          });
        }
      }
    } catch (e) {
      setResponse(undefined);
      setError(e instanceof ExecutorError ? e.message : 'Unexpected error while running your code.');
    } finally {
      setBusy(null);
    }
  };

  const markSelfAssessed = () => {
    if (!challenge) return;
    recordAttempt({
      itemType: 'challenge',
      itemId: challenge.id,
      lessonId: challenge.lessonId,
      moduleId: challenge.moduleId,
      dimension: challenge.dimension,
      correct: true,
      score: 1,
      hintsUsed: hints,
      verified: false,
    });
    setSummary({
      passed: false,
      verified: false,
      passedTests: 0,
      totalTests: challenge.tests.length,
      staticFailures: [],
      message: 'Recorded as self-assessed (unverified). It earns half credit until verified on a real runtime.',
    });
  };

  const reset = () => {
    setCode(starter);
    clearDraft(draftKey);
    setResponse(undefined);
    setSummary(undefined);
    setError(undefined);
  };

  const toolbar = (
    <View style={[styles.row, { flexWrap: 'wrap' }]}>
      <Button label="Run" icon="play" onPress={() => execute('run')} loading={busy === 'run'} disabled={busy !== null} />
      {challenge ? (
        <Button label="Run tests" icon="check" variant="success" onPress={() => execute('submit')} loading={busy === 'submit'} disabled={busy !== null} />
      ) : null}
      <Button label="Reset" icon="rotate" variant="ghost" onPress={reset} disabled={busy !== null} accessibilityHint="Restores the starter code and clears your draft" />
    </View>
  );

  const stdinField = (
    <View style={{ gap: spacing.xs }}>
      <Text variant="caption" color="textSubtle">
        Standard input for Run
      </Text>
      <TextInput
        value={stdin}
        onChangeText={setStdin}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        accessibilityLabel="Standard input"
        placeholder="Input passed to your program"
        placeholderTextColor={colors.textSubtle}
        style={[styles.stdin, { borderColor: colors.border, color: colors.codeText, backgroundColor: colors.codeBg, fontFamily: fonts.mono }]}
      />
    </View>
  );

  const editor = (
    <View style={{ gap: spacing.md }}>
      <CodeEditor value={code} onChange={onChange} height={layout === 'expanded' ? 430 : 420} />
      {Platform.OS === 'web' ? (
        <Text variant="small" color="textSubtle">
          Keyboard: Tab indents inside the editor. Press Ctrl+M (Ctrl+Shift+M on macOS) to make Tab move focus instead.
        </Text>
      ) : null}
      {toolbar}
    </View>
  );

  const output = (
    <View style={{ gap: spacing.md }}>
      {stdinField}
      <OutputPanel response={response} error={error} tests={challenge?.tests} summary={summary} staticResults={staticResults} />
      {challenge && exec.executor.mode === 'simulation' && solutionShown && !alreadySolved ? (
        <Card tone="outline" style={{ gap: spacing.sm }}>
          <Text variant="small" color="textMuted">
            Without a Java runtime your solution cannot be tested. If, after comparing carefully, your code is equivalent to the reference solution, you can record a self-assessed attempt. It counts as unverified (half credit).
          </Text>
          <Button label="Record self-assessed solve" variant="secondary" size="sm" onPress={markSelfAssessed} />
        </Card>
      ) : null}
    </View>
  );

  const task = challenge ? <TaskPanel challenge={challenge} hints={hints} onHint={() => setHints((h) => h + 1)} solutionShown={solutionShown} onShowSolution={() => setSolutionShown(true)} solved={alreadySolved} /> : (
    <Card style={{ gap: spacing.sm }}>
      <Text variant="heading">Free playground</Text>
      <Text variant="small" color="textMuted">
        Write any Java program with a class named Main. Your code is saved on this device as you type.
      </Text>
    </Card>
  );

  const header = (
    <View style={{ gap: spacing.sm }}>
      <BackLink href="/practice" label="Playground" />
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Text variant="title" style={{ flexShrink: 1 }}>
          {challenge?.title ?? 'Scratch playground'}
        </Text>
        {challenge ? <Badge label={challenge.kind === 'boss' ? 'Boss challenge' : challenge.kind} tone={challenge.kind === 'boss' ? 'accent' : challenge.kind === 'debugging' ? 'warning' : 'primary'} /> : null}
        {challenge ? <Badge label={challenge.difficulty} /> : null}
        {alreadySolved ? <Badge label="Solved" tone="success" icon="check" /> : null}
      </View>
      <ExecutionBanner state={exec} />
    </View>
  );

  if (layout === 'expanded') {
    return (
      <View style={[styles.split, { backgroundColor: colors.bg }]}>
        <ScrollView style={[styles.left, { borderRightColor: colors.border }]} contentContainerStyle={styles.pad}>
          {header}
          {task}
        </ScrollView>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.pad}>
          {editor}
          {output}
        </ScrollView>
      </View>
    );
  }

  return (
    <Screen maxWidth={900}>
      {header}
      <SegmentedTabs
        label="Workspace"
        value={tab}
        onChange={setTab}
        options={[
          ...(challenge ? [{ value: 'task' as const, label: 'Task' }] : []),
          { value: 'code', label: 'Code' },
          { value: 'output', label: 'Output', badge: response?.tests ? `${response.tests.filter((t) => t.passed).length}/${response.tests.length}` : undefined },
        ]}
      />
      {tab === 'task' ? task : tab === 'code' ? editor : output}
    </Screen>
  );
}

function TaskPanel({
  challenge,
  hints,
  onHint,
  solutionShown,
  onShowSolution,
  solved,
}: {
  challenge: CodingChallenge;
  hints: number;
  onHint: () => void;
  solutionShown: boolean;
  onShowSolution: () => void;
  solved: boolean;
}) {
  const { colors } = useTheme();
  const visibleTests = challenge.tests.filter((t) => !t.hidden);
  return (
    <View style={{ gap: spacing.lg }}>
      <Markdown source={challenge.description} />
      {challenge.staticChecks?.length ? (
        <View style={{ gap: spacing.xs }}>
          <Text variant="caption" color="textSubtle">
            Constraints
          </Text>
          {challenge.staticChecks.map((s) => (
            <Text key={s.id} variant="small">
              • {s.description}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="textSubtle">
          Examples ({visibleTests.length} visible, {challenge.tests.length - visibleTests.length} hidden)
        </Text>
        {visibleTests.map((t) => (
          <View key={t.id} style={{ gap: spacing.xs }}>
            <Text variant="small" weight="600">
              {t.name}
            </Text>
            <View style={styles.ioRow}>
              <View style={{ flex: 1, minWidth: 140 }}>
                <CodeBlock code={t.stdin.trimEnd() || '(empty)'} title="Input" language="text" showLineNumbers={false} copyable={false} />
              </View>
              <View style={{ flex: 1, minWidth: 140 }}>
                <CodeBlock code={t.expectedStdout} title="Output" language="text" showLineNumbers={false} copyable={false} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <Card style={{ gap: spacing.sm }}>
        <View style={styles.row}>
          <Icon name="lightbulb" color={colors.warning} />
          <Text variant="heading" style={{ flex: 1 }}>
            Hints
          </Text>
          <Text variant="small" color="textMuted">
            {hints}/{challenge.hints.length} used
          </Text>
        </View>
        {challenge.hints.slice(0, hints).map((h, i) => (
          <Inline key={i} text={`${i + 1}. ${h}`} variant="small" />
        ))}
        {hints < challenge.hints.length ? (
          <Button label={`Reveal hint ${hints + 1}`} variant="secondary" size="sm" icon="lightbulb" onPress={onHint} accessibilityHint="Each hint lowers the mastery credit for this challenge" />
        ) : null}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text variant="heading">Reference solution and analysis</Text>
        {solutionShown || solved ? (
          <>
            <CodeBlock code={challenge.solution} title="Reference solution" />
            <Inline text={challenge.solutionExplanation} variant="small" />
            <View style={{ gap: 2 }}>
              <Text variant="small" weight="700">
                Complexity
              </Text>
              <Text variant="small">Time: {challenge.complexity.time}</Text>
              <Text variant="small">Space: {challenge.complexity.space}</Text>
              {challenge.complexity.notes ? <Text variant="small" color="textMuted">{challenge.complexity.notes}</Text> : null}
            </View>
          </>
        ) : (
          <>
            <Text variant="small" color="textMuted">
              Compare your approach with the reference after you have tried. Viewing it before passing reduces the credit for this challenge to 50%.
            </Text>
            <Button label="Show solution" variant="secondary" size="sm" onPress={onShowSolution} />
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  split: { flex: 1, flexDirection: 'row' },
  left: { width: 460, maxWidth: '42%', borderRightWidth: 1, flexGrow: 0 },
  pad: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ioRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  stdin: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, minHeight: 64, fontSize: 13 },
});

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import type { ExecutionResponse } from '@/services/execution/types';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { ChallengeTest } from '@/types/curriculum';
import type { StaticCheckResult, SubmissionSummary } from './evaluation';

type Tab = 'output' | 'tests' | 'problems';

export function OutputPanel({
  response,
  error,
  tests,
  summary,
  staticResults,
}: {
  response?: ExecutionResponse;
  error?: string;
  tests?: ChallengeTest[];
  summary?: SubmissionSummary;
  staticResults?: StaticCheckResult[];
}) {
  const { colors } = useTheme();
  const diagnostics = response?.compile.diagnostics ?? [];
  const [tab, setTab] = useState<Tab>('output');

  useEffect(() => {
    if (!response) return;
    if (!response.compile.success || (response.mode === 'simulation' && diagnostics.length > 0)) setTab('problems');
    else if (response.tests) setTab('tests');
    else setTab('output');
  }, [response, diagnostics.length]);

  if (error) {
    return (
      <View style={[styles.box, { borderColor: colors.danger, backgroundColor: colors.dangerMuted }]} accessibilityLiveRegion="polite">
        <Text variant="small" color="danger" weight="700">
          Execution failed
        </Text>
        <Text variant="small">{error}</Text>
      </View>
    );
  }
  if (!response) {
    return (
      <View style={[styles.box, { borderColor: colors.border }]}>
        <Text variant="small" color="textMuted">
          Run your code to see output here. "Run tests" checks every test case, including hidden ones.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }} accessibilityLiveRegion="polite">
      {summary ? (
        <View style={[styles.summary, { backgroundColor: summary.passed ? colors.successMuted : colors.surfaceAlt, borderColor: summary.passed ? colors.success : colors.border }]}>
          <Icon name={summary.passed ? 'check' : response.mode === 'simulation' ? 'info' : 'x'} color={summary.passed ? colors.success : colors.textMuted} />
          <Text variant="small" weight="600" style={{ flex: 1 }}>
            {summary.message}
          </Text>
        </View>
      ) : null}
      {response.notice ? (
        <Text variant="small" color="warning">
          {response.notice}
        </Text>
      ) : null}
      <SegmentedTabs
        label="Execution results"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'output', label: 'Output' },
          { value: 'tests', label: 'Tests', badge: response.tests ? `${response.tests.filter((t) => t.passed).length}/${response.tests.length}` : undefined },
          { value: 'problems', label: 'Problems', badge: diagnostics.length + (staticResults?.filter((s) => !s.passed).length ?? 0) > 0 ? `${diagnostics.length + (staticResults?.filter((s) => !s.passed).length ?? 0)}` : undefined },
        ]}
      />

      {tab === 'output' ? (
        response.run ? (
          <View style={{ gap: spacing.sm }}>
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
              <Badge label={`exit ${response.run.exitCode ?? '—'}`} tone={response.run.exitCode === 0 ? 'success' : 'danger'} />
              <Badge label={`${response.run.timeMs} ms`} icon="clock" />
              {response.run.timedOut ? <Badge label="Timed out" tone="danger" /> : null}
              {response.run.outputTruncated ? <Badge label="Output truncated" tone="warning" /> : null}
            </View>
            <CodeBlock code={response.run.stdout || '(no output)'} title="stdout" language="text" showLineNumbers={false} />
            {response.run.stderr ? <CodeBlock code={response.run.stderr} title="stderr" language="text" showLineNumbers={false} /> : null}
          </View>
        ) : (
          <Text variant="small" color="textMuted">
            {response.mode === 'simulation' ? 'No output: code was not executed in simulation mode.' : response.compile.success ? 'Use Run to see program output.' : 'The program did not compile.'}
          </Text>
        )
      ) : null}

      {tab === 'tests' ? (
        response.tests ? (
          <View style={{ gap: spacing.sm }}>
            {response.tests.map((result) => {
              const def = tests?.find((t) => t.id === result.id);
              return (
                <View key={result.id} style={[styles.test, { borderColor: result.passed ? colors.success : colors.danger }]}>
                  <View style={styles.row}>
                    <Icon name={result.passed ? 'check' : 'x'} size={16} color={result.passed ? colors.success : colors.danger} />
                    <Text variant="small" weight="600" style={{ flex: 1 }}>
                      {def?.hidden ? 'Hidden test' : def?.name ?? result.id}
                    </Text>
                    <Text variant="small" color="textMuted">
                      {result.timedOut ? 'timed out' : `${result.timeMs} ms`}
                    </Text>
                  </View>
                  {!result.passed && def && !def.hidden ? (
                    <View style={{ gap: spacing.xs }}>
                      <CodeBlock code={def.stdin.trimEnd() || '(empty)'} title="Input" language="text" showLineNumbers={false} copyable={false} />
                      <CodeBlock code={def.expectedStdout} title="Expected" language="text" showLineNumbers={false} copyable={false} />
                      <CodeBlock code={result.stdout || '(no output)'} title="Actual" language="text" showLineNumbers={false} copyable={false} />
                      {result.stderr ? <CodeBlock code={result.stderr} title="stderr" language="text" showLineNumbers={false} copyable={false} /> : null}
                    </View>
                  ) : null}
                  {!result.passed && def?.hidden ? (
                    <Text variant="small" color="textMuted">
                      Hidden tests do not reveal their input. Think about edge cases: empty, single element, negatives, extremes.
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <Text variant="small" color="textMuted">
            {response.mode === 'simulation' ? 'Tests require real execution.' : 'Use "Run tests" to evaluate every test case.'}
          </Text>
        )
      ) : null}

      {tab === 'problems' ? (
        <View style={{ gap: spacing.sm }}>
          {diagnostics.length === 0 && !(staticResults ?? []).some((s) => !s.passed) ? (
            <Text variant="small" color="textMuted">
              No problems found.
            </Text>
          ) : null}
          {diagnostics.map((d, i) => (
            <View key={i} style={[styles.row, { alignItems: 'flex-start' }]}>
              <Icon name="alert" size={16} color={d.severity === 'error' ? colors.danger : colors.warning} />
              <Text variant="small" style={{ flex: 1 }} mono>
                {d.line ? `${d.file ?? 'Main.java'}:${d.line}${d.column ? `:${d.column}` : ''}  ` : ''}
                {d.message}
              </Text>
            </View>
          ))}
          {(staticResults ?? [])
            .filter((s) => !s.passed)
            .map((s) => (
              <View key={s.check.id} style={styles.row}>
                <Icon name="target" size={16} color={colors.warning} />
                <Text variant="small">Constraint not met: {s.check.description}</Text>
              </View>
            ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  test: { borderLeftWidth: 3, paddingLeft: spacing.md, paddingVertical: spacing.xs, gap: spacing.xs },
});

import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/Button';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { Text } from '@/components/Text';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { ChoiceOption, KnowledgeCheck } from '@/types/curriculum';

/** Score for a correct answer given after the explanation was already revealed. */
export const RETRY_SCORE = 0.5;

export function isCorrectSelection(check: KnowledgeCheck, selected: string[]): boolean {
  if (check.kind === 'multi-select') {
    const want = new Set(check.correctOptionIds);
    return selected.length === want.size && selected.every((id) => want.has(id));
  }
  return selected.length === 1 && selected[0] === check.correctOptionId;
}

export function CheckRunner({
  check,
  lessonId,
  moduleId,
  index,
  total,
  onAnswered,
}: {
  check: KnowledgeCheck;
  lessonId: string;
  moduleId: string;
  index?: number;
  total?: number;
  onAnswered?: (correct: boolean) => void;
}) {
  const { colors } = useTheme();
  const recordAttempt = useLearningStore((s) => s.recordAttempt);
  const [selected, setSelected] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [missedBefore, setMissedBefore] = useState(false);
  const multi = check.kind === 'multi-select';
  const availableHints = check.hints ?? [];

  const toggle = (id: string) => {
    if (result) return;
    setSelected((cur) => (multi ? (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]) : [id]));
  };

  const submit = () => {
    const correct = isCorrectSelection(check, selected);
    recordAttempt({
      itemType: 'check',
      itemId: check.id,
      lessonId,
      moduleId,
      dimension: check.dimension,
      correct,
      score: correct ? (missedBefore ? RETRY_SCORE : 1) : 0,
      hintsUsed: hints,
      verified: true,
    });
    if (!correct) setMissedBefore(true);
    setResult(correct ? 'correct' : 'wrong');
    onAnswered?.(correct);
  };

  const retry = () => {
    setResult(null);
    setSelected([]);
  };

  const correctIds = check.kind === 'multi-select' ? check.correctOptionIds : [check.correctOptionId];
  const monoOptions = check.kind === 'predict-output';

  return (
    <View style={{ gap: spacing.md }} accessibilityLabel={`Question${index !== undefined ? ` ${index + 1} of ${total}` : ''}`}>
      <View style={styles.rowBetween}>
        <Text variant="caption" color="primary">
          {check.kind === 'predict-output' ? 'Predict the output' : multi ? 'Select all that apply' : 'Knowledge check'}
          {index !== undefined && total ? ` · ${index + 1}/${total}` : ''}
        </Text>
        <Text variant="caption" color="textSubtle">
          {check.dimension}
        </Text>
      </View>
      <Inline text={check.prompt} variant="heading" />
      {'code' in check && check.code ? <CodeBlock code={check.code} /> : null}

      <View accessibilityRole={multi ? undefined : 'radiogroup'} style={{ gap: spacing.sm }}>
        {check.options.map((opt) => (
          <OptionRow
            key={opt.id}
            option={opt}
            multi={multi}
            mono={monoOptions}
            selected={selected.includes(opt.id)}
            state={result ? (correctIds.includes(opt.id) ? 'correct' : selected.includes(opt.id) ? 'wrong' : 'idle') : 'idle'}
            disabled={!!result}
            onPress={() => toggle(opt.id)}
          />
        ))}
      </View>

      {hints > 0 ? (
        <View style={[styles.hintBox, { backgroundColor: colors.warningMuted }]}>
          {availableHints.slice(0, hints).map((h, i) => (
            <View key={i} style={styles.row}>
              <Icon name="lightbulb" size={16} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Inline text={h} variant="small" />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {result ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.feedback,
            { backgroundColor: result === 'correct' ? colors.successMuted : colors.dangerMuted, borderColor: result === 'correct' ? colors.success : colors.danger },
          ]}
        >
          <View style={styles.row}>
            <Icon name={result === 'correct' ? 'check' : 'x'} color={result === 'correct' ? colors.success : colors.danger} />
            <Text variant="heading" color={result === 'correct' ? 'success' : 'danger'}>
              {result === 'correct' ? (missedBefore ? 'Correct on retry' : 'Correct') : 'Not quite'}
            </Text>
          </View>
          <Markdown source={check.explanation} compact />
          {result === 'wrong' ? (
            <Text variant="small" color="textMuted">
              This question has been added to your revision queue so you can test yourself again after a delay.
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        {!result ? (
          <>
            <Button label="Check answer" icon="check" onPress={submit} disabled={selected.length === 0} />
            {hints < availableHints.length ? (
              <Button
                label={`Hint ${hints + 1} of ${availableHints.length}`}
                variant="secondary"
                icon="lightbulb"
                onPress={() => setHints((h) => h + 1)}
                accessibilityHint="Hints reduce the mastery credit for this question"
              />
            ) : null}
          </>
        ) : result === 'wrong' ? (
          <Button label="Try again" variant="secondary" icon="rotate" onPress={retry} />
        ) : null}
      </View>
    </View>
  );
}

function OptionRow({
  option,
  multi,
  mono,
  selected,
  state,
  disabled,
  onPress,
}: {
  option: ChoiceOption;
  multi: boolean;
  mono: boolean;
  selected: boolean;
  state: 'idle' | 'correct' | 'wrong';
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const border =
    state === 'correct' ? colors.success : state === 'wrong' ? colors.danger : selected ? colors.primary : colors.border;
  const bg =
    state === 'correct' ? colors.successMuted : state === 'wrong' ? colors.dangerMuted : selected ? colors.primaryMuted : colors.surface;
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={option.text.replace(/\n/g, ', ')}
      onPress={onPress}
      disabled={disabled}
      style={(s) => {
        const { hovered, focused } = s as { pressed: boolean; hovered?: boolean; focused?: boolean };
        return [
          styles.option,
          { borderColor: border, backgroundColor: hovered && !disabled && state === 'idle' && !selected ? colors.surfaceAlt : bg },
          focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
        ] as StyleProp<ViewStyle>;
      }}
    >
      <View style={[styles.marker, { borderColor: selected || state !== 'idle' ? border : colors.borderStrong, borderRadius: multi ? 4 : 10 }]}>
        {selected ? <View style={[styles.markerFill, { backgroundColor: border, borderRadius: multi ? 2 : 5 }]} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        {mono ? (
          <Text variant="small" style={{ fontFamily: fonts.mono }}>
            {option.text}
          </Text>
        ) : (
          <Inline text={option.text} variant="small" />
        )}
      </View>
      {state === 'correct' ? <Icon name="check" size={16} color={colors.success} /> : null}
      {state === 'wrong' ? <Icon name="x" size={16} color={colors.danger} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, minHeight: 48 },
  marker: { width: 20, height: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  markerFill: { width: 10, height: 10 },
  hintBox: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  feedback: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
});

import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing, typeScale } from '@/theme/tokens';

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number | `${number}%`;
  readOnly?: boolean;
  accessibilityLabel?: string;
}

/** Symbols that are slow to reach on phone keyboards. */
const SYMBOLS = ['{', '}', '(', ')', ';', '"', '=', '<', '>', '[', ']', '.', '+', '-', '!', '&', '|', '_', ':', '?'];
const INDENT = '    ';

/**
 * Touch-friendly editor used on iOS/Android (and as the web fallback when
 * Monaco cannot load). Monospace input, no autocorrect, a line-number gutter
 * and a row of symbol keys that insert at the cursor.
 */
export function PlainCodeEditor({ value, onChange, height = 360, readOnly, accessibilityLabel = 'Java code editor' }: CodeEditorProps) {
  const { colors } = useTheme();
  const selection = useRef({ start: value.length, end: value.length });
  const [forcedSelection, setForcedSelection] = useState<{ start: number; end: number } | undefined>();
  const lineCount = value.split('\n').length;

  const insert = (text: string) => {
    const { start, end } = selection.current;
    const next = value.slice(0, start) + text + value.slice(end);
    const cursor = start + text.length;
    onChange(next);
    selection.current = { start: cursor, end: cursor };
    setForcedSelection({ start: cursor, end: cursor });
  };

  const newlineWithIndent = () => {
    const { start } = selection.current;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const indent = /^\s*/.exec(value.slice(lineStart, start))?.[0] ?? '';
    insert('\n' + indent + (value[start - 1] === '{' ? INDENT : ''));
  };

  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.codeBg, height }]}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <ScrollView horizontal keyboardShouldPersistTaps="handled" contentContainerStyle={{ minWidth: '100%' }}>
          <View style={styles.row}>
            <View style={[styles.gutter, { borderRightColor: colors.border }]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              {Array.from({ length: lineCount }, (_, i) => (
                <Text key={i} style={[styles.code, { color: colors.textSubtle, textAlign: 'right' }]}>
                  {i + 1}
                </Text>
              ))}
            </View>
            <TextInput
              value={value}
              onChangeText={(t) => {
                setForcedSelection(undefined);
                onChange(t);
              }}
              onSelectionChange={(e) => {
                selection.current = e.nativeEvent.selection;
                setForcedSelection(undefined);
              }}
              selection={forcedSelection}
              editable={!readOnly}
              multiline
              scrollEnabled={false}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textAlignVertical="top"
              accessibilityLabel={accessibilityLabel}
              style={[styles.code, styles.input, { color: colors.codeText }]}
            />
          </View>
        </ScrollView>
      </ScrollView>
      {!readOnly ? (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          style={[styles.symbols, { borderTopColor: colors.border, backgroundColor: colors.surface }]}
          contentContainerStyle={{ gap: 4, padding: 4 }}
          accessibilityLabel="Symbol keys"
        >
          <SymbolKey label="Tab" onPress={() => insert(INDENT)} />
          <SymbolKey label="⏎" accessibilityLabel="New line with indentation" onPress={newlineWithIndent} />
          {SYMBOLS.map((s) => (
            <SymbolKey key={s} label={s} onPress={() => insert(s)} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function SymbolKey({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Insert ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.key, { backgroundColor: pressed ? colors.primaryMuted : colors.surfaceAlt, borderColor: colors.border }]}
    >
      <Text mono variant="small" weight="600">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingVertical: spacing.sm },
  gutter: { paddingHorizontal: spacing.sm, borderRightWidth: StyleSheet.hairlineWidth, minWidth: 36 },
  code: { fontFamily: fonts.mono, fontSize: typeScale.code.fontSize, lineHeight: typeScale.code.lineHeight },
  input: { flex: 1, minWidth: 600, paddingHorizontal: spacing.md, paddingTop: 0, paddingBottom: 0 },
  symbols: { flexGrow: 0, borderTopWidth: 1 },
  key: { minWidth: 40, height: 38, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
});

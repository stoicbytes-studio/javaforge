import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { tokenizeLines, type TokenKind } from '@/lib/javaTokenizer';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing, typeScale } from '@/theme/tokens';
import { Icon } from './Icon';
import { Text } from './Text';

export function useSyntaxColors(): Record<TokenKind, string> {
  const { colors, scheme } = useTheme();
  return useMemo(
    () => ({
      keyword: scheme === 'dark' ? '#C792EA' : '#7A3EB1',
      string: scheme === 'dark' ? '#A5D6A7' : '#2E7D32',
      comment: colors.textSubtle,
      number: scheme === 'dark' ? '#F2B880' : '#A0522D',
      annotation: scheme === 'dark' ? '#E5C07B' : '#8A6100',
      type: scheme === 'dark' ? '#82AAFF' : '#1F5BB5',
      plain: colors.codeText,
    }),
    [colors, scheme],
  );
}

export interface CodeBlockProps {
  code: string;
  title?: string;
  /** Inclusive, 1-based. */
  highlight?: [number, number];
  /** Lines the learner tapped (Bug Hunter); enables line selection when onLinePress is set. */
  selectedLines?: number[];
  onLinePress?: (line: number) => void;
  showLineNumbers?: boolean;
  copyable?: boolean;
  language?: 'java' | 'text';
}

export function CodeBlock({
  code,
  title,
  highlight,
  selectedLines,
  onLinePress,
  showLineNumbers = true,
  copyable = true,
  language = 'java',
}: CodeBlockProps) {
  const { colors } = useTheme();
  const syntax = useSyntaxColors();
  const [copied, setCopied] = useState(false);
  const lines = useMemo(
    () => (language === 'java' ? tokenizeLines(code) : code.split('\n').map((t) => [{ kind: 'plain' as const, text: t }])),
    [code, language],
  );
  const gutter = String(lines.length).length;

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
      {title || copyable ? (
        <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
          <Text variant="small" color="textMuted" mono numberOfLines={1} style={{ flex: 1 }}>
            {title ?? (language === 'java' ? 'Java' : 'Output')}
          </Text>
          {copyable ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Copied to clipboard' : 'Copy code'}
              onPress={copy}
              hitSlop={8}
              style={styles.copy}
            >
              <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? colors.success : colors.textMuted} />
              <Text variant="small" color={copied ? 'success' : 'textMuted'}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.scroll}>
        <View>
          {lines.map((tokens, i) => {
            const n = i + 1;
            const isHighlighted = highlight ? n >= highlight[0] && n <= highlight[1] : false;
            const isSelected = selectedLines?.includes(n) ?? false;
            const row = (
              <View
                style={[
                  styles.line,
                  isHighlighted && { backgroundColor: colors.primaryMuted },
                  isSelected && { backgroundColor: colors.warningMuted },
                ]}
              >
                {showLineNumbers ? (
                  <Text
                    style={[styles.code, { color: colors.textSubtle, width: gutter * 9 + 14, textAlign: 'right', paddingRight: 12 }]}
                    selectable={false}
                  >
                    {n}
                  </Text>
                ) : null}
                <Text style={[styles.code, { color: colors.codeText }]} selectable>
                  {tokens.length === 0
                    ? ' '
                    : tokens.map((t, j) => (
                        <Text key={j} style={{ color: syntax[t.kind], fontStyle: t.kind === 'comment' ? 'italic' : 'normal' }}>
                          {t.text}
                        </Text>
                      ))}
                </Text>
              </View>
            );
            return onLinePress ? (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`Line ${n}${isSelected ? ', selected' : ''}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onLinePress(n)}
              >
                {row}
              </Pressable>
            ) : (
              <View key={n}>{row}</View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    minHeight: 36,
  },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.xs, minHeight: 28 },
  scroll: { paddingVertical: spacing.sm, minWidth: '100%' },
  line: { flexDirection: 'row', paddingRight: spacing.lg, minHeight: typeScale.code.lineHeight },
  code: { fontFamily: fonts.mono, fontSize: typeScale.code.fontSize, lineHeight: typeScale.code.lineHeight },
});

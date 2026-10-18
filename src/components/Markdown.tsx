import { Fragment, useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import { CodeBlock } from './CodeBlock';
import { Text, type TextVariant } from './Text';

/**
 * Renders the small Markdown subset used by curriculum content:
 * paragraphs, `### ` headings, `- ` and `1. ` lists, `> ` callouts,
 * fenced code blocks, **bold** and `inline code`. Content is plain data —
 * no HTML is ever interpreted.
 */

type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; code: string; language: 'java' | 'text' };

export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === '') {
      i++;
      continue;
    }
    const fence = /^```(\w*)/.exec(line.trim());
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith('```')) body.push(lines[i++]!);
      i++;
      blocks.push({ type: 'code', code: body.join('\n'), language: fence[1] === 'java' ? 'java' : 'text' });
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h', text: line.slice(4) });
      i++;
      continue;
    }
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i]!)) items.push(lines[i++]!.slice(2));
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i]!)) items.push(lines[i++]!.replace(/^\d+\. /, ''));
      blocks.push({ type: 'ol', items });
      continue;
    }
    if (line.startsWith('> ')) {
      const body: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('> ')) body.push(lines[i++]!.slice(2));
      blocks.push({ type: 'quote', text: body.join(' ') });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !/^(```|### |- |\d+\. |> )/.test(lines[i]!)
    ) {
      para.push(lines[i++]!.trim());
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }
  return blocks;
}

export function Inline({ text, variant = 'body', color }: { text: string; variant?: TextVariant; color?: 'text' | 'textMuted' }) {
  const { colors } = useTheme();
  const parts = useMemo(() => text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean), [text]);
  return (
    <Text variant={variant} color={color}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} variant={variant} weight="700" color={color}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <Text
              key={i}
              variant={variant}
              style={{ fontFamily: fonts.mono, backgroundColor: colors.surfaceAlt, color: colors.codeText, fontSize: 13.5 }}
            >
              {` ${part.slice(1, -1)} `}
            </Text>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Text>
  );
}

export function Markdown({ source, compact }: { source: string; compact?: boolean }) {
  const { colors } = useTheme();
  const blocks = useMemo(() => parseBlocks(source), [source]);
  const variant: TextVariant = compact ? 'small' : 'body';
  const render = (block: Block, key: number): ReactNode => {
    switch (block.type) {
      case 'p':
        return <Inline key={key} text={block.text} variant={variant} />;
      case 'h':
        return (
          <Text key={key} variant="heading" style={{ marginTop: spacing.sm }}>
            {block.text}
          </Text>
        );
      case 'ul':
      case 'ol':
        return (
          <View key={key} style={{ gap: spacing.xs }}>
            {block.items.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <Text variant={variant} color="textMuted" style={styles.bullet}>
                  {block.type === 'ul' ? '•' : `${i + 1}.`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Inline text={item} variant={variant} />
                </View>
              </View>
            ))}
          </View>
        );
      case 'quote':
        return (
          <View key={key} style={[styles.quote, { borderLeftColor: colors.primary, backgroundColor: colors.primaryMuted }]}>
            <Inline text={block.text} variant={variant} />
          </View>
        );
      case 'code':
        return <CodeBlock key={key} code={block.code} language={block.language} showLineNumbers={block.code.split('\n').length > 3} />;
    }
  };
  return <View style={{ gap: spacing.md }}>{blocks.map(render)}</View>;
}

const styles = StyleSheet.create({
  listRow: { flexDirection: 'row', gap: spacing.sm },
  bullet: { minWidth: 16 },
  quote: { borderLeftWidth: 3, padding: spacing.md, borderRadius: radius.sm },
});

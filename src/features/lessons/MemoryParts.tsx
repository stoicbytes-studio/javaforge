import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Inline } from '@/components/Markdown';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { MemoryAid } from '@/types/curriculum';

/**
 * "In plain English": the lesson as a story with one big idea, three points and the
 * usual mix-up. Built on how memory works: a concrete story before abstraction,
 * a small number of chunks, and contrast with the thing people confuse it with.
 */
export function PlainEnglish({ memory }: { memory: MemoryAid }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={[styles.oneLiner, { backgroundColor: colors.brandMuted, borderColor: colors.brandStrong }]}>
        <Text variant="caption" style={{ color: colors.onBrandMuted }}>
          The big idea
        </Text>
        <Inline text={memory.oneLiner} variant="title" />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Icon name="book" size={16} color={colors.primary} />
          <Text variant="caption" color="primary">
            A story to remember it by
          </Text>
        </View>
        <Inline text={memory.story} variant="body" />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="heading">Remember just these three things</Text>
        {memory.keyPoints.map((k, i) => (
          <View key={i} style={[styles.point, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.number, { backgroundColor: colors.brand }]}>
              <Text weight="700" style={{ color: colors.onBrand }}>
                {String(i + 1)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Inline text={k} variant="body" />
            </View>
          </View>
        ))}
      </View>

      {memory.types?.map((group) => (
        <View key={group.title} style={{ gap: spacing.sm }}>
          <View style={styles.row}>
            <Icon name="layers" size={16} color={colors.primary} />
            <Text variant="heading">{`${group.title}, in simple words`}</Text>
          </View>
          <View style={styles.typeGrid}>
            {group.items.map((t) => (
              <View key={t.name} style={[styles.type, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.brand }]}>
                <Inline text={t.name} variant="heading" />
                <Inline text={t.simple} variant="small" color="textMuted" />
              </View>
            ))}
          </View>
        </View>
      ))}

      {memory.confusion ? (
        <View style={[styles.card, { backgroundColor: colors.warningMuted, borderColor: colors.warning }]}>
          <View style={styles.row}>
            <Icon name="alert" size={16} color={colors.warning} />
            <Text variant="caption" color="warning">
              {`Don't mix it up with ${memory.confusion.mixedUpWith}`}
            </Text>
          </View>
          <Inline text={memory.confusion.difference} variant="body" />
        </View>
      ) : null}

      {memory.tryIt ? (
        <View style={[styles.card, { backgroundColor: colors.successMuted, borderColor: colors.success }]}>
          <View style={styles.row}>
            <Icon name="clock" size={16} color={colors.success} />
            <Text variant="caption" color="success">
              Try it in one minute
            </Text>
          </View>
          <Inline text={memory.tryIt} variant="body" />
        </View>
      ) : null}
    </View>
  );
}

/**
 * Retrieval practice: answering from memory before looking strengthens recall far
 * more than re-reading, so each answer stays hidden until the learner asks for it.
 */
export function QuickRecall({ memory }: { memory: MemoryAid }) {
  const { colors } = useTheme();
  const [shown, setShown] = useState<Set<number>>(new Set());
  return (
    <View style={{ gap: spacing.md }}>
      <Text variant="small" color="textMuted">
        Answer in your head first, then reveal. Trying to remember is what makes it stick.
      </Text>
      {memory.recall.map((r, i) => {
        const open = shown.has(i);
        return (
          <View key={r.question} style={[styles.card, { backgroundColor: colors.surface, borderColor: open ? colors.brandStrong : colors.border }]}>
            <View style={styles.recallHead}>
              <Text variant="caption" color="primary">
                {`Q${i + 1}`}
              </Text>
              <View style={{ flex: 1 }}>
                <Inline text={r.question} variant="heading" />
              </View>
            </View>
            {open ? (
              <View style={[styles.answer, { backgroundColor: colors.brandMuted }]}>
                <Inline text={r.answer} variant="body" />
              </View>
            ) : (
              <Pressable
                onPress={() => setShown((s) => new Set(s).add(i))}
                accessibilityRole="button"
                accessibilityLabel={`Reveal answer ${i + 1}`}
                style={[styles.reveal, { borderColor: colors.brandStrong }]}
              >
                <Icon name="lightbulb" size={16} color={colors.primary} />
                <Text variant="small" weight="700" color="primary">
                  Reveal answer
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  oneLiner: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  type: { flexGrow: 1, flexBasis: 260, borderWidth: 1, borderLeftWidth: 4, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  number: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  recallHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  answer: { borderRadius: radius.md, padding: spacing.md },
  reveal: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
});

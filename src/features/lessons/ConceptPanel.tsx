import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Badge } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { DiagramView } from '@/components/DiagramView';
import { IllustrationView } from '@/components/IllustrationView';
import { Icon, type IconName } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { Text } from '@/components/Text';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { BreakdownItem, LessonConcepts, MemoryAid, VariantGroup } from '@/types/curriculum';
import { PlainEnglish, QuickRecall } from './MemoryParts';

/**
 * The concept page every lesson opens with. When the lesson has a memory aid it
 * starts in plain English (a story before the formal definition), puts the picture
 * beside the first flow diagram and ends with retrieval practice:
 * plain English, interview-level definition, mnemonic, contextual breakdown,
 * visuals, deep dive, quick recall. Each part has its own visual treatment.
 */
export function ConceptPanel({ concepts, memory }: { concepts: LessonConcepts; memory?: MemoryAid }) {
  let step = 0;
  const next = () => ++step;
  return (
    <View style={{ gap: spacing.xxl }}>
      {memory ? (
        <View style={{ gap: spacing.lg }}>
          <SectionTitle step={next()} icon="lightbulb" title="In plain English" subtitle="The simple version first: one big idea, a story and three things to keep." />
          <PlainEnglish memory={memory} />
        </View>
      ) : null}
      <InterviewSection concepts={concepts} step={next()} />
      <MnemonicSection concepts={concepts} step={next()} />
      <BreakdownSection items={concepts.breakdown} step={next()} />
      <VisualsSection concepts={concepts} memory={memory} step={next()} />
      {concepts.variants?.map((v) => <VariantSection key={v.title} group={v} />)}
      <DeepDiveSection concepts={concepts} step={next()} />
      {memory ? (
        <View style={{ gap: spacing.lg }}>
          <SectionTitle step={next()} icon="refresh" title="Quick recall" subtitle="Check yourself before moving on." />
          <QuickRecall memory={memory} />
        </View>
      ) : null}
    </View>
  );
}

function SectionTitle({ step, title, subtitle, icon }: { step: number; title: string; subtitle: string; icon: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <View style={[styles.stepBadge, { backgroundColor: colors.brand }]}>
        <Icon name={icon} size={16} color={colors.onBrand} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" color="textSubtle">
          {`Part ${step}`}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="small" color="textMuted">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InterviewSection({ concepts, step }: { concepts: LessonConcepts; step: number }) {
  const { colors } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <View style={{ gap: spacing.lg }}>
      <SectionTitle step={step} icon="message" title="Interview-level definition" subtitle="What a strong candidate says, in one breath." />
      <View style={[styles.quote, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.brand }]}>
        <Markdown source={concepts.interviewDefinition} />
      </View>
      {concepts.interviewFollowUps?.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="small" weight="700" color="textMuted">
            Likely follow-up questions
          </Text>
          {concepts.interviewFollowUps.map((f, i) => {
            const open = openIndex === i;
            return (
              <View key={f.question} style={[styles.followUp, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Pressable
                  onPress={() => setOpenIndex(open ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={f.question}
                  style={styles.followUpHead}
                >
                  <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} color={colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Inline text={f.question} variant="body" />
                  </View>
                </Pressable>
                {open ? (
                  <View style={{ paddingLeft: spacing.xl }}>
                    <Markdown source={f.answer} compact />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function MnemonicSection({ concepts, step }: { concepts: LessonConcepts; step: number }) {
  const { colors } = useTheme();
  const m = concepts.mnemonic;
  return (
    <View style={{ gap: spacing.lg }}>
      <SectionTitle step={step} icon="lightbulb" title="Remember it" subtitle="A memory hook you can recall under pressure." />
      <View style={[styles.mnemonic, { backgroundColor: colors.brandMuted, borderColor: colors.brand }]}>
        <Text variant="title" style={{ color: colors.onBrandMuted }}>
          {m.device}
        </Text>
        <View style={{ gap: spacing.sm }}>
          {m.expansion.map((e) => (
            <View key={e.key + e.meaning} style={styles.expansionRow}>
              <View style={[styles.keyChip, { backgroundColor: colors.brand }]}>
                <Text variant="small" weight="800" style={{ color: colors.onBrand }}>
                  {e.key}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Inline text={e.meaning} variant="body" />
              </View>
            </View>
          ))}
        </View>
        {m.visual ? (
          <View style={styles.row}>
            <Icon name="target" size={16} color={colors.onBrandMuted} />
            <View style={{ flex: 1 }}>
              <Inline text={m.visual} variant="small" color="textMuted" />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const BREAKDOWN_STYLE: Record<BreakdownItem['kind'], { icon: IconName; label: string; tone: 'brand' | 'accent' | 'success' | 'info' }> = {
  analogy: { icon: 'lightbulb', label: 'Analogy', tone: 'brand' },
  insight: { icon: 'cpu', label: 'Insight', tone: 'accent' },
  'real-world': { icon: 'activity', label: 'Real world', tone: 'success' },
  angle: { icon: 'layers', label: 'Another angle', tone: 'info' },
};

function BreakdownSection({ items, step }: { items: BreakdownItem[]; step: number }) {
  const { colors } = useTheme();
  const { layout } = useLayout();
  const two = layout !== 'compact';
  const toneColor = (t: (typeof BREAKDOWN_STYLE)[BreakdownItem['kind']]['tone']) =>
    t === 'brand' ? colors.brandStrong : t === 'accent' ? colors.accent : t === 'success' ? colors.success : colors.primary;
  return (
    <View style={{ gap: spacing.lg }}>
      <SectionTitle step={step} icon="book" title="Break it down" subtitle="Analogies, insights and how it shows up in real systems." />
      <View style={[styles.grid, two && { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {items.map((b) => {
          const s = BREAKDOWN_STYLE[b.kind];
          const c = toneColor(s.tone);
          return (
            <View
              key={b.title}
              style={[
                styles.breakdownCard,
                { backgroundColor: colors.surface, borderColor: colors.border, borderTopColor: c },
                two && { width: '48.5%', flexGrow: 1 },
              ]}
            >
              <View style={styles.row}>
                <Icon name={s.icon} size={16} color={c} />
                <Text variant="caption" style={{ color: c }}>
                  {s.label}
                </Text>
              </View>
              <Text variant="heading">{b.title}</Text>
              <Markdown source={b.body} compact />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function VisualsSection({ concepts, memory, step }: { concepts: LessonConcepts; memory?: MemoryAid; step: number }) {
  const [width, setWidth] = useState(0);
  // The picture sits next to the first flow (or architecture) diagram: the everyday
  // scene and the technical steps together, so one explains the other. Side by side
  // only when both stay readable; otherwise the picture goes directly above it.
  const paired = memory ? (concepts.diagrams.find((d) => d.kind === 'flow') ?? concepts.diagrams.find((d) => d.kind === 'architecture')) : undefined;
  const sideBySide = width >= 1100;
  return (
    <View style={{ gap: spacing.lg }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      <SectionTitle step={step} icon="grid" title="See it" subtitle="A picture to remember, then illustrations, flows and architecture diagrams." />
      {concepts.diagrams.map((d) =>
        d === paired && memory ? (
          <View key={d.id} style={sideBySide ? styles.pair : { gap: spacing.lg }}>
            <View style={sideBySide ? styles.pairPicture : styles.picture}>
              <IllustrationView picture={memory.picture} />
            </View>
            <View style={sideBySide ? styles.pairDiagram : undefined}>
              <DiagramView diagram={d} />
            </View>
          </View>
        ) : (
          <DiagramView key={d.id} diagram={d} />
        ),
      )}
      {memory && !paired ? (
        <View style={styles.picture}>
          <IllustrationView picture={memory.picture} />
        </View>
      ) : null}
    </View>
  );
}

function VariantSection({ group }: { group: VariantGroup }) {
  const { colors } = useTheme();
  const supportBadge = (s: VariantGroup['items'][number]['support']) =>
    s === 'supported' ? (
      <Badge label="Supported in Java" tone="success" icon="check" />
    ) : s === 'partial' ? (
      <Badge label="Partly supported" tone="warning" />
    ) : s === 'not-supported' ? (
      <Badge label="Not supported directly" tone="danger" icon="x" />
    ) : null;
  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.row}>
        <Icon name="layers" size={18} color={colors.primary} />
        <Text variant="title" style={{ flex: 1 }}>
          {group.title}
        </Text>
      </View>
      {group.intro ? <Markdown source={group.intro} compact /> : null}
      {group.items.map((item, i) => (
        <View key={item.name} style={[styles.variant, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.row, { flexWrap: 'wrap' }]}>
            <View style={[styles.index, { backgroundColor: colors.surfaceAlt }]}>
              <Text variant="small" weight="700" color="textMuted">
                {i + 1}
              </Text>
            </View>
            <Text variant="heading" style={{ flexShrink: 1 }}>
              {item.name}
            </Text>
            {supportBadge(item.support)}
          </View>
          <Markdown source={item.summary} compact />
          {item.note ? <Inline text={item.note} variant="small" color="textMuted" /> : null}
          {item.code ? <CodeBlock code={item.code} showLineNumbers={false} /> : null}
        </View>
      ))}
    </View>
  );
}

function DeepDiveSection({ concepts, step }: { concepts: LessonConcepts; step: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <SectionTitle step={step} icon="target" title="Go deeper" subtitle="Advanced insight for senior-level understanding, with sources." />
      {concepts.deepDive.map((d, i) => (
        <View key={d.title} style={[styles.deep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text variant="caption" color="primary">
              {`Insight ${i + 1}`}
            </Text>
          </View>
          <Text variant="heading">{d.title}</Text>
          <Markdown source={d.body} compact />
          {d.sources?.length ? (
            <View style={{ gap: 4, marginTop: spacing.xs }}>
              {d.sources.map((s) =>
                s.url ? (
                  <Pressable key={s.label} accessibilityRole="link" onPress={() => Linking.openURL(s.url!)} style={styles.row}>
                    <Icon name="external" size={14} color={colors.primary} />
                    <Text variant="small" color="primary" style={{ flex: 1, textDecorationLine: 'underline' }}>
                      {s.label}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={s.label} style={styles.row}>
                    <Icon name="book" size={14} color={colors.textSubtle} />
                    <Text variant="small" color="textMuted" style={{ flex: 1 }}>
                      {s.label}
                    </Text>
                  </View>
                ),
              )}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepBadge: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  quote: { borderWidth: 1, borderLeftWidth: 5, borderRadius: radius.lg, padding: spacing.xl },
  followUp: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  followUpHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  mnemonic: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg },
  expansionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  keyChip: { minWidth: 34, height: 30, paddingHorizontal: spacing.sm, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  grid: { gap: spacing.lg },
  breakdownCard: { borderWidth: 1, borderTopWidth: 4, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  variant: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  index: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  deep: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  pair: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  pairPicture: { flex: 2, minWidth: 0 },
  picture: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  pairDiagram: { flex: 3, minWidth: 0 },
});

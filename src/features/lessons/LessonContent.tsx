import { StyleSheet, View } from 'react-native';

import { Badge, Card } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Collapsible } from '@/components/Collapsible';
import { Icon } from '@/components/Icon';
import { Inline, Markdown } from '@/components/Markdown';
import { SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import type { Lesson } from '@/types/curriculum';

/** The reading part of a lesson: explanations, trade-offs, scenario and pitfalls. */
export function LessonContent({ lesson }: { lesson: Lesson }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <SectionHeader title="Learning objectives" icon="target" />
        <View style={{ gap: spacing.xs }}>
          {lesson.objectives.map((o) => (
            <View key={o} style={styles.row}>
              <Icon name="check" size={16} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Inline text={o} variant="small" />
              </View>
            </View>
          ))}
        </View>
      </Card>

      {lesson.versionNotes && lesson.versionNotes.length > 0 ? (
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          <Text variant="small" color="textMuted">
            Java versions:
          </Text>
          {lesson.versionNotes.map((v) => (
            <Badge key={v.feature} label={`${v.feature} · ${v.since}+${v.note ? ` (${v.note})` : ''}`} tone="accent" />
          ))}
        </View>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <SectionHeader title="In plain English" icon="book" />
        <Markdown source={lesson.plainEnglish} />
      </View>

      <Collapsible title="Technical deep dive" subtitle="How it works precisely" icon="cpu" initiallyOpen>
        <Markdown source={lesson.technical} />
      </Collapsible>

      <Collapsible title="Why it exists" icon="lightbulb">
        <Markdown source={lesson.whyItExists} />
      </Collapsible>

      <Collapsible title="When to use it — and when not to" icon="layers">
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text variant="small" weight="700" color="success">
              Use when
            </Text>
            {lesson.whenToUse.map((w) => (
              <Inline key={w} text={`• ${w}`} variant="small" />
            ))}
          </View>
          <View style={{ gap: spacing.xs }}>
            <Text variant="small" weight="700" color="danger">
              Avoid when
            </Text>
            {lesson.whenNotToUse.map((w) => (
              <Inline key={w} text={`• ${w}`} variant="small" />
            ))}
          </View>
        </View>
      </Collapsible>

      <Collapsible title={`Real world: ${lesson.realWorld.title}`} icon="activity">
        <Markdown source={lesson.realWorld.scenario} />
      </Collapsible>

      <Collapsible title="Common mistakes" subtitle={`${lesson.commonMistakes.length} pitfalls`} icon="alert">
        <View style={{ gap: spacing.lg }}>
          {lesson.commonMistakes.map((m) => (
            <View key={m.mistake} style={{ gap: spacing.xs }}>
              <Inline text={`**${m.mistake}**`} variant="body" />
              <Inline text={`Why it bites: ${m.why}`} variant="small" color="textMuted" />
              <Inline text={`Fix: ${m.fix}`} variant="small" />
              {m.code ? <CodeBlock code={m.code} showLineNumbers={false} /> : null}
            </View>
          ))}
        </View>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

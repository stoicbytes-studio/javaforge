import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { JvmClassEntry, JvmHeapObject, JvmStep, JvmThread, JvmValue } from '@/types/practice';

interface RefProps {
  highlight?: string;
  onHighlight: (id?: string) => void;
}

function RefChip({ id, highlight, onHighlight }: { id: string } & RefProps) {
  const { colors } = useTheme();
  const active = highlight === id;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reference to object ${id}. Highlight it in the heap.`}
      onPress={() => onHighlight(active ? undefined : id)}
      onHoverIn={() => onHighlight(id)}
      onHoverOut={() => onHighlight(undefined)}
      style={[styles.ref, { borderColor: colors.accent, backgroundColor: active ? colors.accent : colors.accentMuted }]}
    >
      <Text variant="small" mono style={{ color: active ? colors.onPrimary : colors.accent, fontSize: 12 }}>
        → #{id}
      </Text>
    </Pressable>
  );
}

function ValueRow({ v, ...ref }: { v: JvmValue } & RefProps) {
  return (
    <View style={styles.valueRow}>
      <Text variant="small" mono color="textMuted" style={{ minWidth: 64 }}>
        {v.name}
      </Text>
      {v.ref ? <RefChip id={v.ref} {...ref} /> : <Text variant="small" mono>{v.value}</Text>}
    </View>
  );
}

export function ThreadsView({ threads, ...ref }: { threads: JvmThread[] } & RefProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {threads.map((t) => (
        <View key={t.name} style={{ gap: spacing.xs }}>
          <View style={[styles.row, { flexWrap: 'wrap' }]}>
            <Text variant="small" weight="700">
              Thread “{t.name}”
            </Text>
            <Badge label={t.state} tone={t.state === 'RUNNABLE' ? 'success' : t.state === 'BLOCKED' ? 'danger' : t.state === 'TERMINATED' ? 'neutral' : 'warning'} />
            {t.holdsLock ? <Badge label={`holds ${t.holdsLock}`} tone="accent" /> : null}
            {t.waitingFor ? <Badge label={`waiting for ${t.waitingFor}`} tone="danger" /> : null}
          </View>
          {t.frames.length === 0 ? (
            <Text variant="small" color="textSubtle">
              (empty stack)
            </Text>
          ) : (
            // Top of stack first.
            [...t.frames].reverse().map((f, i) => (
              <View
                key={`${f.method}-${i}`}
                accessibilityLabel={`Stack frame ${f.method}${i === 0 ? ', top of stack' : ''}`}
                style={[styles.frame, { borderColor: i === 0 ? colors.primary : colors.border, backgroundColor: i === 0 ? colors.primaryMuted : colors.surfaceAlt }]}
              >
                <View style={styles.rowBetween}>
                  <Text variant="small" mono weight="700">
                    {f.method}
                  </Text>
                  {f.line ? (
                    <Text variant="small" color="textSubtle">
                      line {f.line}
                    </Text>
                  ) : null}
                </View>
                {f.locals.length === 0 ? (
                  <Text variant="small" color="textSubtle">
                    no locals
                  </Text>
                ) : (
                  f.locals.map((v) => <ValueRow key={v.name} v={v} {...ref} />)
                )}
                {f.operandStack && f.operandStack.length > 0 ? (
                  <Text variant="small" mono color="textMuted">
                    operand stack: [{f.operandStack.join(', ')}]
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      ))}
    </View>
  );
}

export function HeapView({ heap, ...ref }: { heap: JvmHeapObject[] } & RefProps) {
  const { colors } = useTheme();
  if (heap.length === 0) {
    return (
      <Text variant="small" color="textSubtle">
        No objects allocated yet.
      </Text>
    );
  }
  const pool = heap.filter((o) => o.inStringPool);
  const regular = heap.filter((o) => !o.inStringPool);
  const renderObject = (o: JvmHeapObject) => {
    const highlighted = ref.highlight === o.id;
    const border = o.collected ? colors.border : highlighted ? colors.accent : o.reachable === false ? colors.danger : o.reachable ? colors.success : colors.border;
    return (
      <View
        key={o.id}
        accessibilityLabel={`Object ${o.id}, ${o.type}${o.collected ? ', collected' : o.reachable === false ? ', unreachable' : o.reachable ? ', reachable' : ''}`}
        style={[
          styles.object,
          { borderColor: border, backgroundColor: highlighted ? colors.accentMuted : colors.surface, opacity: o.collected ? 0.4 : 1 },
          o.collected && { borderStyle: 'dashed' },
        ]}
      >
        <View style={[styles.rowBetween, { flexWrap: 'wrap' }]}>
          <Text variant="small" mono weight="700">
            #{o.id} {o.type}
          </Text>
          <View style={styles.row}>
            {o.generation ? <Badge label={o.generation} tone={o.generation === 'old' ? 'accent' : 'neutral'} /> : null}
            {o.collected ? <Badge label="collected" /> : o.reachable === false ? <Badge label="unreachable" tone="danger" /> : o.reachable ? <Badge label="reachable" tone="success" /> : null}
          </View>
        </View>
        {o.fields.map((v) => (
          <ValueRow key={v.name} v={v} {...ref} />
        ))}
        {o.note ? (
          <Text variant="small" color="textMuted">
            {o.note}
          </Text>
        ) : null}
      </View>
    );
  };
  return (
    <View style={{ gap: spacing.sm }}>
      {regular.map(renderObject)}
      {pool.length > 0 ? (
        <View style={[styles.pool, { borderColor: colors.borderStrong }]}>
          <Text variant="caption" color="textSubtle">
            String pool (inside the heap)
          </Text>
          {pool.map(renderObject)}
        </View>
      ) : null}
    </View>
  );
}

export function ClassesView({ classes, ...ref }: { classes: JvmClassEntry[] } & RefProps) {
  const { colors } = useTheme();
  if (classes.length === 0) {
    return (
      <Text variant="small" color="textSubtle">
        No classes loaded yet.
      </Text>
    );
  }
  return (
    <View style={{ gap: spacing.sm }}>
      {classes.map((c) => (
        <View key={c.name} style={[styles.frame, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
          <View style={[styles.rowBetween, { flexWrap: 'wrap' }]}>
            <Text variant="small" mono weight="700">
              {c.name}
            </Text>
            <View style={styles.row}>
              <Badge label={c.loader} />
              <Badge label={c.status} tone={c.status === 'initialized' ? 'success' : c.status === 'linked' ? 'primary' : 'warning'} />
            </View>
          </View>
          {c.staticFields?.map((v) => <ValueRow key={v.name} v={v} {...ref} />)}
        </View>
      ))}
    </View>
  );
}

export function BytecodeView({ bytecode }: { bytecode: NonNullable<JvmStep['bytecode']> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.code, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
      {bytecode.map((b, i) => (
        <Text
          key={i}
          style={{ fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 19, color: b.active ? colors.text : colors.textMuted, backgroundColor: b.active ? colors.primaryMuted : 'transparent', paddingHorizontal: 6 }}
        >
          {b.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 26 },
  ref: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  frame: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, gap: 2 },
  object: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.sm, gap: 2 },
  pool: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  code: { borderWidth: 1, borderRadius: radius.md, paddingVertical: spacing.sm },
});

import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { addDays, dayKey, startOfWeek } from '@/lib/time';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { ProgressBar } from './Progress';
import { Text } from './Text';

/** GitHub-style grid of correct attempts per day for the last `weeks` weeks. */
export function ActivityHeatmap({ timestamps, now, weeks = 12 }: { timestamps: number[]; now: number; weeks?: number }) {
  const { colors } = useTheme();
  const { columns, total, activeDays, max } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of timestamps) counts.set(dayKey(t), (counts.get(dayKey(t)) ?? 0) + 1);
    const first = addDays(startOfWeek(now), -(weeks - 1) * 7);
    const cols: { key: string; count: number; future: boolean }[][] = [];
    let sum = 0;
    let active = 0;
    let peak = 0;
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const ts = addDays(first, w * 7 + d);
        const key = dayKey(ts);
        const count = ts > now ? 0 : counts.get(key) ?? 0;
        if (count > 0) active++;
        sum += count;
        peak = Math.max(peak, count);
        col.push({ key, count, future: ts > now });
      }
      cols.push(col);
    }
    return { columns: cols, total: sum, activeDays: active, max: peak };
  }, [timestamps, now, weeks]);

  const shade = (count: number) => {
    if (count === 0) return colors.surfaceAlt;
    const level = Math.ceil((count / Math.max(1, max)) * 4);
    return [colors.primaryMuted, colors.primaryMuted, colors.primary + '99', colors.primary + 'CC', colors.primary][level]!;
  };

  return (
    <View
      accessible
      accessibilityLabel={`Coding and learning activity: ${total} correct answers over ${activeDays} active days in the last ${weeks} weeks`}
      style={{ gap: spacing.sm }}
    >
      <View style={styles.heatRow}>
        {columns.map((col, i) => (
          <View key={i} style={{ gap: 3 }}>
            {col.map((cell) => (
              <View
                key={cell.key}
                style={[
                  styles.cell,
                  { backgroundColor: cell.future ? 'transparent' : shade(cell.count), borderColor: colors.border },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <Text variant="small" color="textMuted">
        {total} correct answers · {activeDays} active days · last {weeks} weeks
      </Text>
    </View>
  );
}

export function DimensionBars({
  items,
}: {
  items: { label: string; value: number; evidence: number; evidenceLabel: string }[];
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {items.map((item, i) => (
        <View key={item.label} style={{ gap: 4 }}>
          <View style={styles.barLabel}>
            <Text variant="small" style={{ flex: 1 }}>
              {item.label}
            </Text>
            <Text variant="small" color={item.evidence === 0 ? 'textSubtle' : 'text'} weight="600">
              {item.evidence === 0 ? 'no data' : `${Math.round(item.value * 100)}%`}
            </Text>
          </View>
          <ProgressBar value={item.value} label={item.label} color={colors.series[i % colors.series.length]} height={6} />
          <Text variant="caption" color="textSubtle" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: '400' }}>
            {item.evidence} {item.evidenceLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Small line chart used by production incidents (synthetic metrics). */
export function MetricChart({
  points,
  unit,
  threshold,
  label,
  height = 120,
}: {
  points: number[];
  unit: string;
  threshold?: number;
  label: string;
  height?: number;
}) {
  const { colors } = useTheme();
  const width = 320;
  const pad = { l: 36, r: 8, t: 10, b: 18 };
  const max = Math.max(...points, threshold ?? 0) * 1.1 || 1;
  const x = (i: number) => pad.l + (i / Math.max(1, points.length - 1)) * (width - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (height - pad.t - pad.b);
  const last = points[points.length - 1] ?? 0;
  return (
    <View
      accessible
      accessibilityLabel={`${label}: from ${points[0]} to ${last} ${unit}${threshold !== undefined ? `, threshold ${threshold}` : ''}`}
    >
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Rect x={pad.l} y={pad.t} width={width - pad.l - pad.r} height={height - pad.t - pad.b} fill={colors.surfaceAlt} />
        {[0, 0.5, 1].map((f) => (
          <SvgText key={f} x={pad.l - 4} y={y(max * f) + 4} fontSize="9" fill={colors.textSubtle} textAnchor="end">
            {Math.round(max * f)}
          </SvgText>
        ))}
        {threshold !== undefined ? (
          <Line x1={pad.l} x2={width - pad.r} y1={y(threshold)} y2={y(threshold)} stroke={colors.danger} strokeDasharray="4 3" strokeWidth={1} />
        ) : null}
        <Polyline
          points={points.map((p, i) => `${x(i)},${y(p)}`).join(' ')}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <SvgText x={pad.l} y={height - 4} fontSize="9" fill={colors.textSubtle}>
          {`${points.length} samples · unit: ${unit}`}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  heatRow: { flexDirection: 'row', gap: 3, flexWrap: 'nowrap' },
  cell: { width: 12, height: 12, borderRadius: 3, borderWidth: StyleSheet.hairlineWidth },
  barLabel: { flexDirection: 'row', alignItems: 'center' },
});

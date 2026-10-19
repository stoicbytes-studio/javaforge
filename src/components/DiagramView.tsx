import { useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText, TSpan } from 'react-native-svg';

import { charsPerLine, describeDiagram, diagramSize, edgePoints, groupRect, nodeRect, wrapText } from '@/lib/diagram';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { Diagram, DiagramTone } from '@/types/curriculum';
import { Text } from './Text';

const LABEL_SIZE = 13;
const DETAIL_SIZE = 11;
/** Below this scale the text gets too small, so the diagram scrolls sideways instead. */
const MIN_SCALE = 0.72;

/** Renders a grid diagram (flow, architecture or concept illustration) as SVG on every platform. */
export function DiagramView({ diagram }: { diagram: Diagram }) {
  const { colors } = useTheme();
  const [available, setAvailable] = useState(0);
  const { width, height } = diagramSize(diagram);
  const scale = available ? Math.min(1, available / width) : 1;
  const renderScale = Math.max(scale, MIN_SCALE);
  const scrolls = available > 0 && scale < MIN_SCALE;

  const tone = (t: DiagramTone | undefined) => {
    switch (t) {
      case 'primary':
        return { fill: colors.primaryMuted, stroke: colors.primary, text: colors.text };
      case 'accent':
        return { fill: colors.accentMuted, stroke: colors.accent, text: colors.text };
      case 'success':
        return { fill: colors.successMuted, stroke: colors.success, text: colors.text };
      case 'warning':
        return { fill: colors.warningMuted, stroke: colors.warning, text: colors.text };
      case 'danger':
        return { fill: colors.dangerMuted, stroke: colors.danger, text: colors.text };
      default:
        return { fill: colors.surfaceAlt, stroke: colors.borderStrong, text: colors.text };
    }
  };

  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const svg = (
    <Svg width={width * renderScale} height={height * renderScale} viewBox={`0 0 ${width} ${height}`}>
      {(diagram.groups ?? []).map((g) => {
        const r = groupRect(g);
        const t = tone(g.tone);
        return (
          <G key={`g-${g.label}`}>
            <Rect x={r.x} y={r.y} width={r.w} height={r.h} rx={14} fill={t.fill} fillOpacity={0.35} stroke={t.stroke} strokeOpacity={0.5} strokeDasharray="6 5" />
          </G>
        );
      })}

      {diagram.edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const p = edgePoints(nodeRect(a), nodeRect(b));
        const stroke = colors.textSubtle;
        const angle = Math.atan2(p.y2 - p.y1, p.x2 - p.x1);
        const head = (x: number, y: number, ang: number) => {
          const s = 8;
          const pts = [
            [x, y],
            [x - s * Math.cos(ang - 0.45), y - s * Math.sin(ang - 0.45)],
            [x - s * Math.cos(ang + 0.45), y - s * Math.sin(ang + 0.45)],
          ];
          return pts.map((q) => q.join(',')).join(' ');
        };
        return (
          <G key={`e-${i}`}>
            <Line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={stroke} strokeWidth={1.6} strokeDasharray={e.dashed ? '5 4' : undefined} />
            <Polygon points={head(p.x2, p.y2, angle)} fill={stroke} />
            {e.both ? <Polygon points={head(p.x1, p.y1, angle + Math.PI)} fill={stroke} /> : null}
          </G>
        );
      })}

      {diagram.nodes.map((n) => {
        const r = nodeRect(n);
        const t = tone(n.tone);
        const label = wrapText(n.label, charsPerLine(n, LABEL_SIZE));
        const detail = n.detail ? wrapText(n.detail, charsPerLine(n, DETAIL_SIZE)) : [];
        const lineH = 16;
        const total = label.length * lineH + detail.length * 14;
        const startY = r.y + r.h / 2 - total / 2 + 12;
        const cx = r.x + r.w / 2;
        let shape;
        switch (n.shape) {
          case 'pill':
            shape = <Rect x={r.x} y={r.y + 6} width={r.w} height={r.h - 12} rx={(r.h - 12) / 2} fill={t.fill} stroke={t.stroke} strokeWidth={1.4} />;
            break;
          case 'cylinder':
            shape = (
              <G>
                <Path
                  d={`M ${r.x} ${r.y + 8} L ${r.x} ${r.y + r.h - 8} A ${r.w / 2} 8 0 0 0 ${r.x + r.w} ${r.y + r.h - 8} L ${r.x + r.w} ${r.y + 8}`}
                  fill={t.fill}
                  stroke={t.stroke}
                  strokeWidth={1.4}
                />
                <Ellipse cx={cx} cy={r.y + 8} rx={r.w / 2} ry={8} fill={t.fill} stroke={t.stroke} strokeWidth={1.4} />
              </G>
            );
            break;
          case 'note':
            shape = (
              <Path
                d={`M ${r.x} ${r.y} L ${r.x + r.w - 14} ${r.y} L ${r.x + r.w} ${r.y + 14} L ${r.x + r.w} ${r.y + r.h} L ${r.x} ${r.y + r.h} Z`}
                fill={t.fill}
                stroke={t.stroke}
                strokeWidth={1.4}
              />
            );
            break;
          default:
            shape = <Rect x={r.x} y={r.y} width={r.w} height={r.h} rx={10} fill={t.fill} stroke={t.stroke} strokeWidth={1.4} />;
        }
        return (
          <G key={`n-${n.id}`}>
            {shape}
            <SvgText x={cx} y={startY + (n.shape === 'cylinder' ? 4 : 0)} textAnchor="middle" fontFamily={fonts.sans} fill={t.text}>
              {label.map((line, i) => (
                <TSpan key={`l${i}`} x={cx} dy={i === 0 ? 0 : lineH} fontSize={LABEL_SIZE} fontWeight="700">
                  {line}
                </TSpan>
              ))}
              {detail.map((line, i) => (
                <TSpan key={`d${i}`} x={cx} dy={i === 0 && label.length ? 15 : 14} fontSize={DETAIL_SIZE} fill={colors.textMuted}>
                  {line}
                </TSpan>
              ))}
            </SvgText>
          </G>
        );
      })}

      {/* Labels go on top so boxes and arrows never hide them. */}
      {diagram.edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b || !e.label) return null;
        const p = edgePoints(nodeRect(a), nodeRect(b));
        const mx = (p.x1 + p.x2) / 2;
        const my = (p.y1 + p.y2) / 2;
        const w = e.label.length * 5.9 + 14;
        return (
          <G key={`el-${i}`}>
            <Rect x={mx - w / 2} y={my - 9} width={w} height={18} rx={9} fill={colors.surface} stroke={colors.border} />
            <SvgText x={mx} y={my + 3.5} fontSize={10.5} fill={colors.textMuted} textAnchor="middle" fontFamily={fonts.sans}>
              {e.label}
            </SvgText>
          </G>
        );
      })}
      {(diagram.groups ?? []).map((g) => {
        const r = groupRect(g);
        const text = g.label.toUpperCase();
        const w = text.length * 6.6 + 14;
        return (
          <G key={`gl-${g.label}`}>
            <Rect x={r.x + r.w - w - 8} y={r.y - 9} width={w} height={18} rx={9} fill={colors.surface} stroke={colors.border} />
            <SvgText x={r.x + r.w - 8 - w / 2} y={r.y + 3.5} fontSize={10} fontWeight="700" fill={colors.textMuted} textAnchor="middle" fontFamily={fonts.sans} letterSpacing={0.5}>
              {text}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onLayout={(e: LayoutChangeEvent) => setAvailable(e.nativeEvent.layout.width - spacing.lg * 2)}
    >
      <View style={styles.header}>
        <View style={[styles.kind, { backgroundColor: colors.primaryMuted }]}>
          <Text variant="caption" color="primary">
            {diagram.kind === 'concept' ? 'Illustration' : diagram.kind === 'flow' ? 'Flow' : 'Architecture'}
          </Text>
        </View>
        <Text variant="heading" style={{ flex: 1 }}>
          {diagram.title}
        </Text>
      </View>
      <View accessible accessibilityRole="image" accessibilityLabel={describeDiagram(diagram)} style={{ alignItems: scrolls ? 'stretch' : 'center' }}>
        {available === 0 ? (
          <View style={{ height: height * MIN_SCALE }} />
        ) : scrolls ? (
          <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: spacing.xs }}>
            {svg}
          </ScrollView>
        ) : (
          svg
        )}
      </View>
      <Text variant="small" color="textMuted">
        {diagram.caption}
      </Text>
      {scrolls ? (
        <Text variant="caption" color="textSubtle" style={{ textTransform: 'none', letterSpacing: 0 }}>
          Scroll sideways to see the whole diagram.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  kind: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
});

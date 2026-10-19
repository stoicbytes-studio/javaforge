import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { arrowPoints, CANVAS_H, CANVAS_W, describeIllustration, iconSize, ICON, LABEL_GAP, LABEL_SIZE, SCALE } from '@/lib/illustration';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { DiagramTone, Illustration } from '@/types/curriculum';
import { Inline } from './Markdown';
import { PICTOGRAMS } from './pictograms';
import { Text } from './Text';

/** Renders a "Make it stick" picture: everyday pictograms arranged as a little scene. */
export function IllustrationView({ picture }: { picture: Illustration }) {
  const { colors } = useTheme();
  const [available, setAvailable] = useState(0);
  const width = CANVAS_W * SCALE;
  const height = CANVAS_H * SCALE;
  const scale = available ? Math.min(1, available / width) : 1;

  // Pictograms use a stronger fill than diagram boxes so they read as pictures.
  const tone = (t: DiagramTone | undefined) => {
    switch (t) {
      case 'accent':
        return { fill: colors.accentMuted, stroke: colors.accent };
      case 'success':
        return { fill: colors.successMuted, stroke: colors.success };
      case 'warning':
        return { fill: colors.warningMuted, stroke: colors.warning };
      case 'danger':
        return { fill: colors.dangerMuted, stroke: colors.danger };
      case 'neutral':
        return { fill: colors.surfaceAlt, stroke: colors.textMuted };
      default:
        return { fill: colors.brand, stroke: colors.onBrandMuted };
    }
  };

  const u = (v: number) => v * SCALE;
  const arrowColor = colors.textSubtle;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.brandStrong }]}
      onLayout={(e: LayoutChangeEvent) => setAvailable(e.nativeEvent.layout.width - spacing.lg * 2)}
    >
      <View style={styles.header}>
        <View style={[styles.kind, { backgroundColor: colors.brand }]}>
          <Text variant="caption" style={{ color: colors.onBrand }}>
            Picture it
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Inline text={picture.title} variant="heading" />
        </View>
      </View>
      <View accessible accessibilityRole="image" accessibilityLabel={describeIllustration(picture)} style={{ alignItems: 'center' }}>
        {available === 0 ? (
          <View style={{ height: height * 0.6 }} />
        ) : (
          <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width} ${height}`}>
            <Rect x={0} y={0} width={width} height={height} rx={16} fill={colors.brandMuted} fillOpacity={0.55} />

            {(picture.arrows ?? []).map((a, i) => {
              const from = picture.items[a.from];
              const to = picture.items[a.to];
              if (!from || !to) return null;
              const p = arrowPoints(from, to);
              const ang = Math.atan2(p.y2 - p.y1, p.x2 - p.x1);
              const s = 9;
              const tx = u(p.x2);
              const ty = u(p.y2);
              const head = [[tx, ty], [tx - s * Math.cos(ang - 0.45), ty - s * Math.sin(ang - 0.45)], [tx - s * Math.cos(ang + 0.45), ty - s * Math.sin(ang + 0.45)]]
                .map((q) => q.join(','))
                .join(' ');
              return (
                <G key={`a-${i}`}>
                  <Line x1={u(p.x1)} y1={u(p.y1)} x2={u(p.x2)} y2={u(p.y2)} stroke={arrowColor} strokeWidth={2.2} strokeLinecap="round" strokeDasharray={a.dashed ? '7 6' : undefined} />
                  <Polygon points={head} fill={arrowColor} />
                </G>
              );
            })}

            {picture.items.map((item, i) => {
              const t = tone(item.tone);
              const s = iconSize(item);
              const k = u(s) / 48;
              const ox = u(item.x - s / 2);
              const oy = u(item.y - s / 2);
              return (
                <G key={`i-${i}`}>
                  <G transform={`translate(${ox} ${oy}) scale(${k})`}>
                    {PICTOGRAMS[item.icon].map((shape, j) => (
                      <Path
                        key={j}
                        d={shape.d}
                        fill={shape.fill === 'tone' ? t.fill : shape.fill === 'paper' ? colors.surface : shape.fill === 'ink' ? t.stroke : 'none'}
                        stroke={t.stroke}
                        strokeWidth={(shape.width ?? 2) * (ICON / s)}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ))}
                  </G>
                  <SvgText
                    x={u(item.x)}
                    y={u(item.y + s / 2 + LABEL_GAP + LABEL_SIZE * 0.85)}
                    fontSize={u(LABEL_SIZE)}
                    fontWeight="700"
                    fill={colors.text}
                    textAnchor="middle"
                    fontFamily={fonts.sans}
                  >
                    {item.label}
                  </SvgText>
                </G>
              );
            })}

            {/* Arrow labels on top so icons never hide them. */}
            {(picture.arrows ?? []).map((a, i) => {
              const from = picture.items[a.from];
              const to = picture.items[a.to];
              if (!from || !to || !a.label) return null;
              const p = arrowPoints(from, to);
              const mx = u((p.x1 + p.x2) / 2);
              const my = u((p.y1 + p.y2) / 2);
              const w = a.label.length * 7 + 16;
              return (
                <G key={`al-${i}`}>
                  <Rect x={mx - w / 2} y={my - 10} width={w} height={20} rx={10} fill={colors.surface} stroke={colors.border} />
                  <SvgText x={mx} y={my + 4.5} fontSize={12.5} fill={colors.textMuted} textAnchor="middle" fontFamily={fonts.sans}>
                    {a.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>
      <Inline text={picture.caption} variant="small" color="textMuted" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  kind: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
});

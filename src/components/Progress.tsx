import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { Text } from './Text';

export function ProgressBar({
  value,
  label,
  color,
  height = 8,
}: {
  /** 0..1 */
  value: number;
  label: string;
  color?: string;
  height?: number;
}) {
  const { colors } = useTheme();
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: pct, text: `${pct}%` }}
      style={[styles.track, { height, backgroundColor: colors.surfaceAlt }]}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color ?? colors.brandStrong }]} />
    </View>
  );
}

export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  label,
  color,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  color?: string;
}) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: pct, text: `${pct}%` }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.brandStrong}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text variant={size >= 72 ? 'heading' : 'small'} weight="700">
        {pct}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});

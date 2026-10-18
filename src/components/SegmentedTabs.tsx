import { Pressable, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

/** Accessible tab strip used for mobile lesson panes, filters and settings choices. */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  style,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[{ flexGrow: 0 }, style]}
      contentContainerStyle={[styles.row, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.badge ? `${opt.label}, ${opt.badge}` : opt.label}
            onPress={() => onChange(opt.value)}
            style={(state) => {
              const { focused } = state as { pressed: boolean; focused?: boolean };
              return [
                styles.tab,
                selected && { backgroundColor: colors.surfaceRaised, borderColor: colors.borderStrong },
                focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
              ] as StyleProp<ViewStyle>;
            }}
          >
            <Text variant="small" weight={selected ? '700' : '500'} color={selected ? 'text' : 'textMuted'}>
              {opt.label}
              {opt.badge ? ` · ${opt.badge}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 3, gap: 2, borderRadius: radius.md, borderWidth: 1 },
  tab: {
    paddingHorizontal: spacing.md,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

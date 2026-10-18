import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

/** Web Pressable reports hover/focus in its style callback; native only reports pressed. */
type InteractionState = { pressed: boolean; hovered?: boolean; focused?: boolean };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  style,
  fullWidth,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surfaceAlt, fg: colors.text, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.text, border: 'transparent' },
    danger: { bg: colors.dangerMuted, fg: colors.danger, border: colors.danger },
    success: { bg: colors.success, fg: colors.onPrimary, border: colors.success },
  }[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [
          styles.base,
          size === 'sm' ? styles.sm : styles.md,
          { backgroundColor: palette.bg, borderColor: palette.border },
          fullWidth && { alignSelf: 'stretch' },
          (hovered || pressed) && !isDisabled && { opacity: 0.86 },
          focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid', outlineOffset: 2 },
          isDisabled && { opacity: 0.45 },
          style,
        ] as StyleProp<ViewStyle>;
      }}
      {...rest}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={palette.fg} />
        ) : icon ? (
          <Icon name={icon} size={size === 'sm' ? 15 : 17} color={palette.fg} />
        ) : null}
        <Text variant={size === 'sm' ? 'small' : 'body'} weight="600" style={{ color: palette.fg, flexShrink: 1 }}>
          {label}
        </Text>
        {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 15 : 17} color={palette.fg} /> : null}
      </View>
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  active,
  disabled,
  size = 20,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [
          styles.iconButton,
          { backgroundColor: active ? colors.primaryMuted : hovered || pressed ? colors.surfaceAlt : 'transparent' },
          focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
          disabled && { opacity: 0.4 },
        ] as StyleProp<ViewStyle>;
      }}
    >
      <Icon name={icon} size={size} color={active ? colors.primary : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  md: { minHeight: 44, paddingHorizontal: spacing.lg },
  sm: { minHeight: 34, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});

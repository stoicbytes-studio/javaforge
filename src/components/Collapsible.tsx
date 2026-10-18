import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function Collapsible({
  title,
  icon,
  initiallyOpen = false,
  children,
  subtitle,
}: {
  title: string;
  icon?: IconName;
  initiallyOpen?: boolean;
  children: ReactNode;
  subtitle?: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        onPress={() => setOpen((o) => !o)}
        style={(state) => {
          const { focused } = state as { pressed: boolean; focused?: boolean };
          return [
            styles.header,
            focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
          ] as StyleProp<ViewStyle>;
        }}
      >
        {icon ? <Icon name={icon} size={18} color={colors.primary} /> : null}
        <View style={{ flex: 1 }}>
          <Text variant="heading">{title}</Text>
          {subtitle ? (
            <Text variant="small" color="textMuted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevronDown" size={18} />
        </View>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 52 },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
});

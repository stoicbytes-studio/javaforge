import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function Screen({
  children,
  maxWidth = 1180,
  scroll = true,
  padded = true,
  ...rest
}: ScrollViewProps & { children: ReactNode; maxWidth?: number; scroll?: boolean; padded?: boolean }) {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();
  const padding = padded ? (isWide ? spacing.xxl : spacing.lg) : 0;
  const inner = (
    <View style={[styles.inner, { maxWidth, paddingHorizontal: padding, paddingTop: padded ? padding : 0 }]}>{children}</View>
  );
  if (!scroll) {
    return <View style={[styles.flex, { backgroundColor: colors.bg, paddingTop: isWide ? 0 : insets.top }]}>{inner}</View>;
  }
  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingTop: isWide ? 0 : insets.top, paddingBottom: spacing.xxxl }}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {inner}
    </ScrollView>
  );
}

export function PageHeader({ title, subtitle, right, eyebrow }: { title: string; subtitle?: string; right?: ReactNode; eyebrow?: string }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1, minWidth: 220, gap: spacing.xs }}>
        {eyebrow ? (
          <Text variant="caption" color="primary">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="display">{title}</Text>
        {subtitle ? (
          <Text variant="body" color="textMuted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({ title, action, icon }: { title: string; action?: ReactNode; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 }}>
        {icon ? <Icon name={icon} size={18} color={colors.primary} /> : null}
        <Text variant="heading">{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function EmptyState({ icon = 'info', title, body, action }: { icon?: IconName; title: string; body: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { borderColor: colors.border }]}>
      <Icon name={icon} size={24} color={colors.textSubtle} />
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text variant="small" color="textMuted" align="center" style={{ maxWidth: 420 }}>
        {body}
      </Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { width: '100%', alignSelf: 'center', gap: spacing.xl },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.lg },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
  },
});

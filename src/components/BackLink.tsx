import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { Icon } from './Icon';
import { Text } from './Text';

/**
 * Explicit "up" navigation to a parent screen. Deep links may open a detail
 * screen with no history, so this navigates to a known parent rather than
 * calling router.back().
 */
export function BackLink({ href, label }: { href: Href; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Back to ${label}`}
      onPress={() => (router.canDismiss() ? router.dismissTo(href) : router.replace(href))}
      hitSlop={8}
      style={(state) => {
        const { focused } = state as { pressed: boolean; focused?: boolean };
        return [styles.link, focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' }] as StyleProp<ViewStyle>;
      }}
    >
      <Icon name="chevronLeft" size={16} color={colors.primary} />
      <Text variant="small" color="primary" weight="600">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', minHeight: 32 },
});

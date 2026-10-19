import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { Link, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function Card({ style, children, tone = 'default', ...rest }: ViewProps & { tone?: 'default' | 'raised' | 'outline' }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tone === 'outline' ? 'transparent' : tone === 'raised' ? colors.surfaceRaised : colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}


/** A card that navigates. Rendered as a real link on web for keyboard and middle-click support. */
export function LinkCard({
  href,
  children,
  style,
  accessibilityLabel,
}: {
  href: Href;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Link's asChild slot drops style functions on web, so hover/focus are tracked in
  // state and the slot receives one flat style object.
  const flat = StyleSheet.flatten([
    styles.card,
    { backgroundColor: hovered ? colors.surfaceAlt : colors.surface, borderColor: hovered ? colors.borderStrong : colors.border },
    focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
    style,
  ] as StyleProp<ViewStyle>);
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={flat}
      >
        {children}
      </Pressable>
    </Link>
  );
}

/** Unstyled pressable link for rows and inline blocks (Link without asChild renders Text on native). */
export function PressableLink({
  href,
  children,
  style,
  accessibilityLabel,
}: {
  href: Href;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const flat = StyleSheet.flatten([
    { borderRadius: radius.sm },
    hovered && { opacity: 0.8 },
    focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
    style,
  ] as StyleProp<ViewStyle>);
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={flat}
      >
        {children}
      </Pressable>
    </Link>
  );
}

type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: BadgeTone; icon?: IconName }) {
  const { colors } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    primary: { bg: colors.primaryMuted, fg: colors.primary },
    accent: { bg: colors.accentMuted, fg: colors.accent },
    success: { bg: colors.successMuted, fg: colors.success },
    warning: { bg: colors.warningMuted, fg: colors.warning },
    danger: { bg: colors.dangerMuted, fg: colors.danger },
  };
  const c = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {icon ? <Icon name={icon} size={12} color={c.fg} strokeWidth={2.2} /> : null}
      <Text variant="caption" style={{ color: c.fg, letterSpacing: 0.3 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});

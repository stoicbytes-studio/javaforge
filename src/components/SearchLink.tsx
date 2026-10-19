import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Icon } from './Icon';
import { Text } from './Text';

const isMac = Platform.OS === 'web' && typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** A search-box-shaped link that opens the global search screen. */
export function SearchLink({ placeholder = 'Search any Java concept, topic or question…' }: { placeholder?: string }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  // Link's asChild slot needs a flat style object on web.
  const style = StyleSheet.flatten([styles.box, { borderColor: hovered ? colors.brandStrong : colors.border, backgroundColor: colors.surface }]);
  return (
    <Link href="/search" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Open search" onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} style={style}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <Text color="textSubtle" style={{ flex: 1 }} numberOfLines={1}>
          {placeholder}
        </Text>
        {Platform.OS === 'web' ? (
          <View style={[styles.kbd, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
            <Text variant="caption" color="textMuted" style={{ textTransform: 'none', letterSpacing: 0 }}>
              {isMac ? '⌘ K' : 'Ctrl K'}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.lg, minHeight: 50 },
  kbd: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
});

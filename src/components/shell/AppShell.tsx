import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { forwardRef, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Link } from 'expo-router';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useIsAdmin } from '@/features/admin/adminApi';
import { useLearnerModel } from '@/features/progress/useLearnerModel';
import { useAuth } from '@/services/auth';
import { useLayout, useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { NAV_GROUPS, NAV_ITEMS } from './navigation';

/**
 * Responsive application frame. All destinations are registered once in a
 * hidden TabList; the visible navigation is either a sidebar (tablet/desktop)
 * or a bottom bar (phone). Each destination keeps its own stack.
 */
export function AppShell() {
  const { layout, isWide } = useLayout();
  const { colors } = useTheme();
  return (
    <Tabs style={[styles.root, { flexDirection: isWide ? 'row' : 'column', backgroundColor: colors.bg }]}>
      {isWide ? <Sidebar collapsed={layout === 'medium'} /> : null}
      <TabSlot style={{ flex: 1 }} />
      {!isWide ? <BottomBar /> : null}
      <TabList style={{ display: 'none' }}>
        {NAV_ITEMS.map((item) => (
          <TabTrigger key={item.name} name={item.name} href={item.href as never} />
        ))}
      </TabList>
    </Tabs>
  );
}

interface TriggerChildProps {
  isFocused?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  href?: string;
}

type PressState = { pressed: boolean; hovered?: boolean; focused?: boolean };

const SidebarItem = forwardRef<ComponentRef<typeof Pressable>, TriggerChildProps & { label: string; icon: IconName; collapsed: boolean }>(
  function SidebarItem({ isFocused, onPress, href, label, icon, collapsed }, ref) {
    const { colors } = useTheme();
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        // react-native-web renders an <a href> so links are crawlable and middle-clickable.
        {...({ href } as object)}
        accessibilityRole="link"
        accessibilityLabel={label}
        accessibilityState={{ selected: !!isFocused }}
        style={(state) => {
          const { hovered, focused } = state as PressState;
          return [
            styles.sideItem,
            collapsed && styles.sideItemCollapsed,
            { backgroundColor: isFocused ? colors.primaryMuted : hovered ? colors.surfaceAlt : 'transparent' },
            focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' },
          ] as StyleProp<ViewStyle>;
        }}
      >
        <Icon name={icon} size={19} color={isFocused ? colors.primary : colors.textMuted} />
        {collapsed ? (
          <Text variant="caption" color={isFocused ? 'primary' : 'textMuted'} style={{ textTransform: 'none', fontSize: 10.5 }} numberOfLines={1}>
            {label.split(' ')[0]}
          </Text>
        ) : (
          <Text variant="small" weight={isFocused ? '700' : '500'} color={isFocused ? 'text' : 'textMuted'}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  },
);

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { colors } = useTheme();
  const model = useLearnerModel();
  const { isAdmin } = useIsAdmin();
  return (
    <View
      accessibilityRole="navigation"
      style={[styles.sidebar, collapsed && styles.sidebarCollapsed, { backgroundColor: colors.surface, borderRightColor: colors.border }]}
    >
      <View style={[styles.brand, collapsed && { justifyContent: 'center', paddingHorizontal: 0 }]}>
        <View style={[styles.logo, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
          <Text variant="small" weight="800" color="primary" mono>
            JF
          </Text>
        </View>
        {!collapsed ? (
          <View>
            <Text variant="heading" weight="800">
              JavaForge
            </Text>
            <Text variant="caption" color="textSubtle" style={{ textTransform: 'none', letterSpacing: 0 }}>
              Engineering Mastery
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md }} showsVerticalScrollIndicator={false}>
        {NAV_GROUPS.map((group) => (
          <View key={group} style={{ gap: 2 }}>
            {!collapsed ? (
              <Text variant="caption" color="textSubtle" style={{ paddingHorizontal: spacing.md, marginBottom: 2 }}>
                {group}
              </Text>
            ) : null}
            {NAV_ITEMS.filter((n) => n.group === group && !n.hiddenOnWide && (!n.adminOnly || isAdmin)).map((item) => (
              <TabTrigger key={item.name} name={item.name} asChild>
                <SidebarItem label={item.label} icon={item.icon} collapsed={collapsed} />
              </TabTrigger>
            ))}
          </View>
        ))}
      </ScrollView>

      <AccountEntry collapsed={collapsed} />

      {!collapsed ? (
        <View style={[styles.tierCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text variant="caption" color="accent">
            {model.tier.current.title}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="small" color="textMuted">
              {model.xp.total.toLocaleString()} XP
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="flame" size={14} color={model.streak.current > 0 ? colors.warning : colors.textSubtle} />
              <Text variant="small" color="textMuted">
                {model.streak.current}d
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Sign-in call to action, or the signed-in learner's identity. Hidden in local-only builds. */
function AccountEntry({ collapsed }: { collapsed: boolean }) {
  const { colors } = useTheme();
  const { configured, session } = useAuth();
  if (!configured) return null;
  const signedIn = !!session;
  const label = signedIn ? (session.user.user_metadata?.display_name as string | undefined) ?? session.user.email ?? 'Account' : 'Sign in';
  return (
    <Link href={signedIn ? '/settings/account' : '/sign-in'} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={signedIn ? `Account: ${label}` : 'Sign in or create an account'}
        // Link's asChild slot passes styles straight to the DOM on web, so hand it a flat object.
        style={StyleSheet.flatten([
          styles.account,
          collapsed && { justifyContent: 'center', paddingHorizontal: 0 },
          { borderColor: signedIn ? colors.border : colors.primary, backgroundColor: signedIn ? 'transparent' : colors.primaryMuted },
        ])}
      >
        <Icon name="user" size={18} color={signedIn ? colors.textMuted : colors.primary} />
        {!collapsed ? (
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="small" weight="600" color={signedIn ? 'text' : 'primary'} numberOfLines={1}>
              {label}
            </Text>
            <Text variant="caption" color="textSubtle" style={{ textTransform: 'none', letterSpacing: 0 }} numberOfLines={1}>
              {signedIn ? 'Synced account' : 'Sync progress across devices'}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

const BottomItem = forwardRef<ComponentRef<typeof Pressable>, TriggerChildProps & { label: string; icon: IconName }>(function BottomItem(
  { isFocused, onPress, href, label, icon },
  ref,
) {
  const { colors } = useTheme();
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      {...({ href } as object)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      style={styles.bottomItem}
    >
      <View style={[styles.bottomPill, isFocused && { backgroundColor: colors.primaryMuted }]}>
        <Icon name={icon} size={21} color={isFocused ? colors.primary : colors.textMuted} />
      </View>
      <Text variant="caption" color={isFocused ? 'primary' : 'textMuted'} style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
        {label}
      </Text>
    </Pressable>
  );
});

const MOBILE_LABELS: Record<string, string> = { index: 'Home', learn: 'Learn', practice: 'Practice', interview: 'Interview', more: 'More' };

function BottomBar() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const items = NAV_ITEMS.filter((n) => n.primaryMobile || n.name === 'more');
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, spacing.xs) }]}
    >
      {items.map((item) => (
        <TabTrigger key={item.name} name={item.name} asChild>
          <BottomItem label={MOBILE_LABELS[item.name] ?? item.label} icon={item.icon} />
        </TabTrigger>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sidebar: { width: 248, borderRightWidth: 1, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.lg },
  sidebarCollapsed: { width: 84, paddingHorizontal: spacing.sm },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    borderRadius: radius.md,
  },
  sideItemCollapsed: { flexDirection: 'column', gap: 2, paddingHorizontal: 0, paddingVertical: spacing.sm, justifyContent: 'center' },
  account: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, minHeight: 44 },
  tierCard: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  bottomBar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: spacing.xs },
  bottomItem: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52, justifyContent: 'center' },
  bottomPill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: radius.pill },
});

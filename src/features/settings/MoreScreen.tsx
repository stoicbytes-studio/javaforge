import { View } from 'react-native';

import { LinkCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { NAV_ITEMS } from '@/components/shell/navigation';
import { PageHeader, Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useIsAdmin } from '@/features/admin/adminApi';
import { useAuth } from '@/services/auth';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const DESCRIPTIONS: Record<string, string> = {
  revision: 'Spaced-repetition reviews that are due today.',
  'jvm-lab': 'Step through stack frames, the heap, class loading and GC.',
  'bug-hunter': 'Diagnose broken code and production incidents.',
  projects: 'Build real applications milestone by milestone.',
  progress: 'Tiers, achievements and mastery by dimension.',
  settings: 'Study schedule, theme, code execution and account.',
  search: 'Find any concept, topic, challenge or Java feature.',
  admin: 'Learners, activity and content health.',
};

/** Phone-only menu for destinations that do not fit in the bottom bar. */
export function MoreScreen() {
  const { colors } = useTheme();
  const { configured, session } = useAuth();
  const { isAdmin } = useIsAdmin();
  const items = NAV_ITEMS.filter((n) => !n.primaryMobile && n.name !== 'more' && (!n.adminOnly || isAdmin));
  return (
    <Screen>
      <PageHeader title="More" />
      <View style={{ gap: spacing.sm }}>
        {configured ? (
          <LinkCard href={session ? '/settings/account' : '/sign-in'} accessibilityLabel={session ? 'Account and sync' : 'Sign in or create an account'}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Icon name="user" color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="heading">{session ? 'Account' : 'Sign in'}</Text>
                <Text variant="small" color="textMuted" numberOfLines={1}>
                  {session ? session.user.email : 'Create an account to sync progress across devices.'}
                </Text>
              </View>
              <Icon name="chevronRight" size={18} />
            </View>
          </LinkCard>
        ) : null}
        {items.map((item) => (
          <LinkCard key={item.name} href={item.href as never} accessibilityLabel={item.label}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Icon name={item.icon} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="heading">{item.label}</Text>
                <Text variant="small" color="textMuted">
                  {DESCRIPTIONS[item.name] ?? ''}
                </Text>
              </View>
              <Icon name="chevronRight" size={18} />
            </View>
          </LinkCard>
        ))}
      </View>
    </Screen>
  );
}

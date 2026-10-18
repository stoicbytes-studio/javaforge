import { Link } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotFound() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.bg, padding: 24 }}>
      <Text variant="title">Page not found</Text>
      <Text color="textMuted" align="center">
        This link does not match any lesson, challenge or page.
      </Text>
      <Link href="/" style={{ color: colors.primary, fontWeight: '600' }}>
        Go to the dashboard
      </Link>
    </View>
  );
}

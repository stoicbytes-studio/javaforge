import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { Text } from './Text';

/** The JavaForge "JF" mark: dark letters on the brand yellow. */
export function BrandMark({ size = 36 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.mark, { width: size, height: size, backgroundColor: colors.brand, borderColor: colors.brandStrong }]}
    >
      <Text variant="small" weight="800" mono style={{ color: colors.onBrand, fontSize: size * 0.38 }}>
        JF
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

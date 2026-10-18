import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts, typeScale } from '@/theme/tokens';
import type { Palette } from '@/theme/tokens';

export type TextVariant = keyof typeof typeScale;
type ColorKey = 'text' | 'textMuted' | 'textSubtle' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'onPrimary';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: ColorKey;
  mono?: boolean;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
}

export function Text({ variant = 'body', color = 'text', mono, weight, align, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const scale = typeScale[variant];
  const isHeading = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : undefined}
      style={[
        scale,
        { color: colors[color as keyof Palette] as string, fontFamily: mono ? fonts.mono : fonts.sans },
        variant === 'caption' && { textTransform: 'uppercase', letterSpacing: 0.6 },
        weight !== undefined && { fontWeight: weight },
        align !== undefined && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

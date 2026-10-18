import { Platform } from 'react-native';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  accent: string;
  accentMuted: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  codeBg: string;
  codeText: string;
  focus: string;
  /** Distinct, colour-blind-friendly series colours for charts and diagrams. */
  series: [string, string, string, string, string, string];
}

// Contrast: text/bg 14.9:1, textMuted/bg 7.4:1, primary/bg 6.2:1 (WCAG AA+).
export const darkPalette: Palette = {
  bg: '#0D0F14',
  surface: '#14171F',
  surfaceAlt: '#1A1E28',
  surfaceRaised: '#202533',
  border: '#272C39',
  borderStrong: '#363D4F',
  text: '#E7E9EF',
  textMuted: '#A3ACBC',
  textSubtle: '#7D879A',
  primary: '#7C95FF',
  primaryMuted: '#1E2747',
  onPrimary: '#0B0E1A',
  accent: '#A68BFF',
  accentMuted: '#2A2144',
  success: '#4CC38A',
  successMuted: '#14301F',
  warning: '#E5B454',
  warningMuted: '#352A12',
  danger: '#F06C64',
  dangerMuted: '#3A1A19',
  codeBg: '#0A0C10',
  codeText: '#D6DAE3',
  focus: '#9DB0FF',
  series: ['#7C95FF', '#4CC38A', '#E5B454', '#A68BFF', '#F06C64', '#4FC1D6'],
};

export const lightPalette: Palette = {
  bg: '#F5F6F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F6',
  surfaceRaised: '#FFFFFF',
  border: '#DDE1E9',
  borderStrong: '#C3C9D5',
  text: '#151821',
  textMuted: '#4A5263',
  textSubtle: '#6B7385',
  primary: '#3D5BD9',
  primaryMuted: '#E4E9FC',
  onPrimary: '#FFFFFF',
  accent: '#6B4FD1',
  accentMuted: '#ECE7FB',
  success: '#1E8150',
  successMuted: '#E2F4EA',
  warning: '#94640A',
  warningMuted: '#FBF0DA',
  danger: '#C2362E',
  dangerMuted: '#FBE5E3',
  codeBg: '#F2F4F8',
  codeText: '#1E2230',
  focus: '#3D5BD9',
  series: ['#3D5BD9', '#1E8150', '#B07A0E', '#6B4FD1', '#C2362E', '#127C8F'],
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;

export const fonts = {
  sans: Platform.select({
    web: 'Inter, "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    default: undefined,
  }),
  mono: Platform.select({
    web: 'ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
    ios: 'Menlo',
    default: 'monospace',
  }),
};

export const typeScale = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  heading: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
  caption: { fontSize: 11.5, lineHeight: 16, fontWeight: '600' as const },
  code: { fontSize: 13.5, lineHeight: 20, fontWeight: '400' as const },
};

export const breakpoints = { medium: 768, expanded: 1100 } as const;

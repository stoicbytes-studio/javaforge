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
  /** Text-safe brand colour for links, active states and icons. */
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  /** The JavaForge yellow: filled buttons, highlights, badges. Not for text on white. */
  brand: string;
  /** Text and icons placed on `brand`. */
  onBrand: string;
  /** Pale yellow wash for highlighted panels (mnemonics, callouts). */
  brandMuted: string;
  /** Text placed on `brandMuted`. */
  onBrandMuted: string;
  /** Deeper yellow for thin accents (borders, small icons) that must stay visible on white. */
  brandStrong: string;
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

/**
 * Light (default): warm white surfaces with JavaForge yellow.
 * Contrast on bg #FBFAF6: text 16.1:1, textMuted 7.0:1, textSubtle 4.7:1,
 * primary (amber 800) 5.9:1; onBrand on brand 13.9:1 (WCAG AA+).
 */
export const lightPalette: Palette = {
  bg: '#FBFAF6',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2E9',
  surfaceRaised: '#FFFFFF',
  border: '#ECE7DA',
  borderStrong: '#D9D2BF',
  text: '#1C1A14',
  textMuted: '#55503F',
  textSubtle: '#736C5A',
  primary: '#8A5A00',
  primaryMuted: '#FFF3C4',
  onPrimary: '#FFFFFF',
  brand: '#FFCC33',
  onBrand: '#1C1A14',
  brandMuted: '#FFF8DC',
  onBrandMuted: '#5C4300',
  brandStrong: '#E0A800',
  accent: '#3451B2',
  accentMuted: '#E8EDFB',
  success: '#1E7A4C',
  successMuted: '#E3F4EA',
  warning: '#A15C07',
  warningMuted: '#FDEFD9',
  danger: '#B42318',
  dangerMuted: '#FDE8E6',
  codeBg: '#FAF8F1',
  codeText: '#24211A',
  focus: '#E0A800',
  series: ['#E0A800', '#3451B2', '#1E7A4C', '#B42318', '#7A4FD1', '#127C8F'],
};

/** Dark: charcoal surfaces with the same yellow brand. */
export const darkPalette: Palette = {
  bg: '#121212',
  surface: '#1A1A18',
  surfaceAlt: '#22221F',
  surfaceRaised: '#2A2A26',
  border: '#302F2A',
  borderStrong: '#45433B',
  text: '#F3F1EA',
  textMuted: '#BDB8A8',
  textSubtle: '#9A9583',
  primary: '#FFD34D',
  primaryMuted: '#3A3112',
  onPrimary: '#1C1A14',
  brand: '#FFCC33',
  onBrand: '#1C1A14',
  brandMuted: '#2E2810',
  onBrandMuted: '#FFE38A',
  brandStrong: '#FFCC33',
  accent: '#8FA8FF',
  accentMuted: '#1E2540',
  success: '#5BCB8F',
  successMuted: '#14301F',
  warning: '#F0B44C',
  warningMuted: '#352A12',
  danger: '#F27A70',
  dangerMuted: '#3A1A19',
  codeBg: '#0F0F0E',
  codeText: '#E6E3DA',
  focus: '#FFD34D',
  series: ['#FFCC33', '#8FA8FF', '#5BCB8F', '#F27A70', '#B59CFF', '#4FC1D6'],
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 40, xxxl: 56 } as const;
export const radius = { sm: 8, md: 12, lg: 18, pill: 999 } as const;

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
  display: { fontSize: 32, lineHeight: 40, fontWeight: '800' as const },
  title: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  heading: { fontSize: 17, lineHeight: 25, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 26, fontWeight: '400' as const },
  small: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  caption: { fontSize: 11.5, lineHeight: 16, fontWeight: '700' as const },
  code: { fontSize: 13.5, lineHeight: 21, fontWeight: '400' as const },
};

export const breakpoints = { medium: 768, expanded: 1100 } as const;

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, useColorScheme, useWindowDimensions } from 'react-native';

import { useLearningStore } from '@/store/learningStore';
import { breakpoints, darkPalette, lightPalette, type Palette } from './tokens';

interface ThemeValue {
  colors: Palette;
  scheme: 'dark' | 'light';
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeValue>({ colors: darkPalette, scheme: 'dark', reducedMotion: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const themePref = useLearningStore((s) => s.settings.theme);
  const motionPref = useLearningStore((s) => s.settings.motion);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setSystemReduceMotion(v))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const scheme: 'dark' | 'light' = themePref === 'system' ? (system === 'light' ? 'light' : 'dark') : themePref;
  const reducedMotion = motionPref === 'system' ? systemReduceMotion : motionPref === 'reduce';

  const value = useMemo(
    () => ({ colors: scheme === 'dark' ? darkPalette : lightPalette, scheme, reducedMotion }),
    [scheme, reducedMotion],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}

export type LayoutClass = 'compact' | 'medium' | 'expanded';

export function useLayout(): { width: number; height: number; layout: LayoutClass; isWide: boolean } {
  const { width, height } = useWindowDimensions();
  const layout: LayoutClass =
    width >= breakpoints.expanded ? 'expanded' : width >= breakpoints.medium ? 'medium' : 'compact';
  return { width, height, layout, isWide: layout !== 'compact' };
}

import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import type { ReactElement } from 'react';

import { useTheme } from '@/theme/ThemeProvider';

/** Stroke icons drawn on a 24×24 grid (shapes inspired by the Lucide set). */
const ICONS = {
  home: <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  book: (
    <>
      <Path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
      <Path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3" />
    </>
  ),
  code: (
    <>
      <Polyline points="16 18 22 12 16 6" />
      <Polyline points="8 6 2 12 8 18" />
    </>
  ),
  cpu: (
    <>
      <Rect x="6" y="6" width="12" height="12" rx="1.5" />
      <Rect x="9.5" y="9.5" width="5" height="5" />
      <Path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  message: <Path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  bug: (
    <>
      <Rect x="7" y="8" width="10" height="13" rx="5" />
      <Path d="M12 12v9M9 5l1.5 3M15 5l-1.5 3M3 13h4M17 13h4M4 19l3-2M20 19l-3-2M4 7l3 2.5M20 7l-3 2.5" />
    </>
  ),
  folder: <Path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />,
  refresh: (
    <>
      <Path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <Path d="M21 3v5h-5" />
      <Path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <Path d="M3 21v-5h5" />
    </>
  ),
  chart: <Path d="M3 3v18h18M7 15l4-4 3 3 5-6" />,
  settings: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  grid: (
    <>
      <Rect x="3" y="3" width="7" height="7" rx="1" />
      <Rect x="14" y="3" width="7" height="7" rx="1" />
      <Rect x="3" y="14" width="7" height="7" rx="1" />
      <Rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  check: <Polyline points="20 6 9 17 4 12" />,
  x: <Path d="M18 6 6 18M6 6l12 12" />,
  chevronRight: <Polyline points="9 18 15 12 9 6" />,
  chevronLeft: <Polyline points="15 18 9 12 15 6" />,
  chevronDown: <Polyline points="6 9 12 15 18 9" />,
  play: <Path d="M7 4v16l13-8z" />,
  pause: <Path d="M7 4h3v16H7zM14 4h3v16h-3z" />,
  stepForward: <Path d="M5 4v16l10-8zM19 4v16" />,
  stepBack: <Path d="M19 4v16L9 12zM5 4v16" />,
  rotate: (
    <>
      <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <Path d="M3 3v5h5" />
    </>
  ),
  copy: (
    <>
      <Rect x="9" y="9" width="12" height="12" rx="2" />
      <Path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  bookmark: <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  lightbulb: (
    <>
      <Path d="M9 18h6M10 22h4" />
      <Path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" />
    </>
  ),
  lock: (
    <>
      <Rect x="4" y="11" width="16" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  flame: <Path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1.5 2-2 3.5-2 5-1.5-1-3-3-3-6C6 8 5 11.5 5 15c0 4.3 3 7 7 7z" />,
  trophy: (
    <>
      <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <Path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),
  target: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="12" r="5" />
      <Circle cx="12" cy="12" r="1" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="12 7 12 12 15 14" />
    </>
  ),
  alert: (
    <>
      <Path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <Path d="M12 9v4M12 17h.01" />
    </>
  ),
  terminal: (
    <>
      <Polyline points="4 17 10 11 4 5" />
      <Path d="M12 19h8" />
    </>
  ),
  sun: (
    <>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <Circle cx="9" cy="8" r="3.5" />
      <Path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
    </>
  ),
  shield: <Path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z" />,
  logOut: <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  layers: (
    <>
      <Path d="M12 2 2 7l10 5 10-5z" />
      <Path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </>
  ),
  activity: <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  edit: <Path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M21 21l-4.3-4.3" />
    </>
  ),
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 16v-4M12 8h.01" />
    </>
  ),
  external: <Path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />,
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { colors } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? colors.textMuted}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ICONS[name]}
    </Svg>
  );
}

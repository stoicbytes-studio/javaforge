import type { IconName } from '@/components/Icon';

export interface NavItemConfig {
  /** Route name inside the (main) tab navigator. */
  name: string;
  href: string;
  label: string;
  icon: IconName;
  group: 'Learn' | 'Practice' | 'Career' | 'Account';
  /** Shown in the phone bottom bar. */
  primaryMobile?: boolean;
  hiddenOnWide?: boolean;
  /** Only listed for administrators (the screen itself re-checks on the server). */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { name: 'index', href: '/', label: 'Dashboard', icon: 'home', group: 'Learn', primaryMobile: true },
  { name: 'learn', href: '/learn', label: 'Curriculum', icon: 'book', group: 'Learn', primaryMobile: true },
  { name: 'revision', href: '/revision', label: 'Revision', icon: 'refresh', group: 'Learn' },
  { name: 'practice', href: '/practice', label: 'Playground', icon: 'code', group: 'Practice', primaryMobile: true },
  { name: 'jvm-lab', href: '/jvm-lab', label: 'JVM Lab', icon: 'cpu', group: 'Practice' },
  { name: 'bug-hunter', href: '/bug-hunter', label: 'Bug Hunter', icon: 'bug', group: 'Practice' },
  { name: 'projects', href: '/projects', label: 'Projects', icon: 'folder', group: 'Practice' },
  { name: 'interview', href: '/interview', label: 'Interview Arena', icon: 'message', group: 'Career', primaryMobile: true },
  { name: 'progress', href: '/progress', label: 'Progress', icon: 'chart', group: 'Career' },
  { name: 'admin', href: '/admin', label: 'Admin', icon: 'shield', group: 'Account', adminOnly: true },
  { name: 'settings', href: '/settings', label: 'Settings', icon: 'settings', group: 'Account' },
  { name: 'more', href: '/more', label: 'More', icon: 'grid', group: 'Account', hiddenOnWide: true },
];

export const NAV_GROUPS: NavItemConfig['group'][] = ['Learn', 'Practice', 'Career', 'Account'];

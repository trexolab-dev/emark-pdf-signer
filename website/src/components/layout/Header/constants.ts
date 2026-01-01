/**
 * Header Navigation Constants
 */

import type { NavLink, NavGroup } from './types';

export const NAV_LINKS: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: 'features', isSection: true },
  { name: 'Gallery', href: 'gallery', isSection: true },
  { name: 'FAQ', href: 'faq', isSection: true },
];

export const MORE_LINKS: NavGroup = {
  name: 'More',
  items: [
    { name: 'Compatibility', href: 'compatibility', isSection: true },
    { name: 'How It Works', href: 'usage', isSection: true },
  ],
};

export const PAGE_LINKS: NavLink[] = [
  { name: 'Installation', href: '/installation' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'Diagrams', href: '/diagrams' },
];

export const GITHUB_URL = 'https://github.com/trexolab-dev/emark-pdf-signer';

export const SCROLL_SECTIONS = ['features', 'download', 'usage', 'faq', 'compatibility', 'gallery'];

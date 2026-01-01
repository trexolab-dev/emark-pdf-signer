/**
 * Footer Data
 *
 * Centralized data for the footer component.
 * All links and content are managed here for easy maintenance.
 */

import { Github, Star, Mail, type LucideIcon } from 'lucide-react';
import {
  GITHUB_URL,
  RELEASES_URL,
  ISSUES_URL,
  SOCIAL_LINKS,
} from '@/utils/constants';
import type { FooterLink } from './types';

// Additional types specific to footer
export interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
  ariaLabel: string;
  hoverColor: string;
}

export interface FooterSection {
  title: string;
  accentColor: string;
  links: FooterLink[];
}

// Quick Links - Internal navigation
export const QUICK_LINKS: FooterLink[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Installation', href: '/installation' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'FAQ', href: '/#faq' },
  { name: 'Download', href: '/#download' },
];

// Resources - External links to GitHub and other resources
export const RESOURCE_LINKS: FooterLink[] = [
  { name: 'GitHub Repository', href: GITHUB_URL, external: true },
  { name: 'Releases', href: RELEASES_URL, external: true },
  { name: 'Report Issues', href: ISSUES_URL, external: true },
  { name: 'Other Projects', href: '/projects', external: false },
];

// Social links with icons
export const SOCIAL_ICON_LINKS: SocialLink[] = [
  {
    name: 'GitHub',
    href: SOCIAL_LINKS.github,
    icon: Github,
    ariaLabel: 'GitHub',
    hoverColor: 'hover:text-primary hover:ring-primary/30',
  },
  {
    name: 'Star',
    href: SOCIAL_LINKS.stargazers,
    icon: Star,
    ariaLabel: 'Star on GitHub',
    hoverColor: 'hover:text-yellow-500 hover:ring-yellow-500/30',
  },
  {
    name: 'Email',
    href: SOCIAL_LINKS.email,
    icon: Mail,
    ariaLabel: 'Email',
    hoverColor: 'hover:text-primary hover:ring-primary/30',
  },
];

// Footer sections configuration
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Quick Links',
    accentColor: 'bg-primary',
    links: QUICK_LINKS,
  },
  {
    title: 'Resources',
    accentColor: 'bg-cyan-500',
    links: RESOURCE_LINKS,
  },
];

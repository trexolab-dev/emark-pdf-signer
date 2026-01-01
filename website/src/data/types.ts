import type { LucideIcon } from 'lucide-react';

// FAQ Types
export interface FAQ {
  question: string;
  answer: string;
  category: FAQCategory;
}

export type FAQCategory =
  | 'general'
  | 'technical'
  | 'legal'
  | 'features'
  | 'compatibility'
  | 'privacy';

export interface CategoryColor {
  bg: string;
  text: string;
}

// Feature Types
export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  iconBg: string;
  iconColor: string;
}

// Navigation Types
export interface NavLink {
  name: string;
  href: string;
  isSection?: boolean;
}

export interface NavGroup {
  name: string;
  items: NavLink[];
}

// Gallery Types
export interface GalleryImage {
  src: string;
  title: string;
  description: string;
}

// Steps/How It Works Types
export interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

// Download Types
export interface Platform {
  id: string;
  name: string;
  icon: LucideIcon;
  primaryAsset: string;
  secondaryAsset?: string;
  instructions: string[];
}

// Compatibility Types
export interface CompatibilityItem {
  name: string;
}

// Footer Types
export interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

// Troubleshooting Types
export interface TroubleshootingItem {
  title: string;
  solution: string;
  category: 'java' | 'certificate' | 'pdf';
}

// Navigation Section Types (for Installation page)
export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  time: string;
}

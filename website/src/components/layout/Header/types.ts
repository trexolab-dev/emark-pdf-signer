/**
 * Header Component Types
 */

export interface NavLink {
  name: string;
  href: string;
  isSection?: boolean;
}

export interface NavGroup {
  name: string;
  items: NavLink[];
}

export interface NavConfig {
  navLinks: NavLink[];
  moreLinks: NavGroup;
  pageLinks: NavLink[];
}

/**
 * Application Constants
 *
 * Centralized constants for the eMark PDF Signer website.
 * eMark PDF Signer is a product of TrexoLab.
 */

// Organization (TrexoLab)
export const ORG = {
  name: 'TrexoLab',
  website: 'https://trexolab.com',
  github: 'https://github.com/trexolab-dev',
  email: 'contact@trexolab.com',
} as const;

// Product URLs (eMark PDF Signer)
export const GITHUB_URL = 'https://github.com/trexolab-dev/emark-pdf-signer';
export const RELEASES_URL = 'https://github.com/trexolab-dev/emark-pdf-signer/releases';
export const WIKI_URL = 'https://github.com/trexolab-dev/emark-pdf-signer/wiki';
export const ISSUES_URL = 'https://github.com/trexolab-dev/emark-pdf-signer/issues';

// Social Links
export const SOCIAL_LINKS = {
  github: GITHUB_URL,
  stargazers: `${GITHUB_URL}/stargazers`,
  orgWebsite: ORG.website,
  email: `mailto:${ORG.email}`,
} as const;

// Animation timing constants (in milliseconds)
export const ANIMATION = {
  // Transition durations
  transitionFast: 150,
  transitionNormal: 300,
  transitionBase: 300,
  transitionSlow: 500,
  transitionVerySlow: 700,

  // Counter animation
  counterDuration: 2000,

  // Stagger delays for list animations
  staggerDelayFast: 50,
  staggerDelay: 75,
  staggerDelaySlow: 150,
  staggerDelayVerySlow: 200,

  // Debounce times
  debounceShort: 100,
  debounceBase: 300,

  // Scroll animation threshold
  scrollThreshold: 0.1,
} as const;

// Application metadata
export const APP_NAME = 'eMark PDF Signer';
export const APP_TAGLINE = 'Professional PDF Signing Made Simple';
export const APP_DESCRIPTION = 'Free, open-source PDF signing software for Windows, macOS, and Linux. Sign PDF documents with digital certificates using PKCS#12, PFX files, or USB security tokens.';
export const APP_SHORT_DESCRIPTION = 'A free alternative to Adobe Reader DC for professional PDF signing.';

export const APP_META = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  description: APP_DESCRIPTION,
  shortDescription: APP_SHORT_DESCRIPTION,
  version: '1.0.0',
} as const;

// Author/Organization information
export const AUTHOR = {
  name: ORG.name,
  github: ORG.github,
  email: ORG.email,
  website: ORG.website,
} as const;

// License information
export const LICENSE = {
  name: 'AGPL-3.0',
  url: 'https://github.com/trexolab-dev/emark-pdf-signer/blob/main/LICENSE',
} as const;

// Gallery configuration
export const GALLERY_CONFIG = {
  autoPlayInterval: 5000,
  transitionDuration: 700,
  thumbnailSize: { width: 96, height: 56 },
} as const;

// Section IDs for navigation
export const SECTIONS = {
  features: 'features',
  download: 'download',
  usage: 'usage',
  faq: 'faq',
  compatibility: 'compatibility',
  gallery: 'gallery',
} as const;

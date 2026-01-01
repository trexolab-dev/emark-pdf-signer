import type { GalleryImage } from './types';

// Gallery image data - using BASE_URL template for proper path resolution
// The paths use Vite's import.meta.env.BASE_URL for GitHub Pages deployment
const BASE = import.meta.env.BASE_URL;

export const galleryImages: GalleryImage[] = [
  { src: `${BASE}images/main.png`, title: 'Main Application Window', description: 'The clean and intuitive main interface of eMark PDF Signer' },
  { src: `${BASE}images/pdf-view.png`, title: 'PDF Viewer', description: 'View your PDF documents with clarity' },
  { src: `${BASE}images/signature-appearance.png`, title: 'Signature Appearance', description: 'Customize how your signature looks' },
  { src: `${BASE}images/certificate-selection.png`, title: 'Certificate Selection', description: 'Choose from your available certificates' },
  { src: `${BASE}images/signature-panel.png`, title: 'Signature Panel', description: 'Manage all signatures in one panel' },
  { src: `${BASE}images/signature-properties.png`, title: 'Signature Properties', description: 'View detailed signature information' },
  { src: `${BASE}images/signed-pdf-view.png`, title: 'Signed PDF View', description: 'See your signed document' },
  { src: `${BASE}images/Init-signature-opration.png`, title: 'Initialize Signature', description: 'Start the signing process' },
  { src: `${BASE}images/Existing-field-sign.png`, title: 'Existing Field Signing', description: 'Sign pre-defined signature fields' },
  { src: `${BASE}images/Signature-box-rectangle.png`, title: 'Signature Box', description: 'Draw your signature area' },
  { src: `${BASE}images/Trust-manager.png`, title: 'Trust Manager', description: 'Manage trusted certificates' },
  { src: `${BASE}images/setting-security.png`, title: 'Security Settings', description: 'Configure security options' },
  { src: `${BASE}images/setting-keystore.png`, title: 'Keystore Settings', description: 'Manage your keystore' },
  { src: `${BASE}images/save-signed-file-dialog.png`, title: 'Save Dialog', description: 'Save your signed document' },
];

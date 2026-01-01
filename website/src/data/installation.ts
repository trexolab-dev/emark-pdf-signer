import {
  Info,
  Monitor,
  Terminal,
  Apple,
  Settings,
  Shield,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import type { NavSection, TroubleshootingItem } from './types';

export const navSections: NavSection[] = [
  { id: 'prerequisites', label: 'Prerequisites', icon: Info, time: '2 min' },
  { id: 'windows', label: 'Windows', icon: Monitor, time: '5 min' },
  { id: 'linux', label: 'Linux', icon: Terminal, time: '5 min' },
  { id: 'macos', label: 'macOS', icon: Apple, time: '5 min' },
  { id: 'java-setup', label: 'Java Setup', icon: Settings, time: '3 min' },
  { id: 'certificate-setup', label: 'Certificate Setup', icon: Shield, time: '3 min' },
  { id: 'first-run', label: 'First Run', icon: CheckCircle, time: '2 min' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle, time: '—' },
];

export const troubleshootingItems: TroubleshootingItem[] = [
  {
    title: "Java not found / 'java' is not recognized",
    solution: "Java 8 is not installed or not in your PATH. Install Java 8 and ensure JAVA_HOME is set correctly. Run 'java -version' to verify — you must see version 1.8.x.",
    category: 'java',
  },
  {
    title: 'Application won\'t start or crashes immediately',
    solution: "This usually means wrong Java version. eMark requires EXACTLY Java 8. If 'java -version' shows 11, 17, 21, or anything other than 1.8.x, install Java 8 and set it as your default.",
    category: 'java',
  },
  {
    title: 'UnsupportedClassVersionError',
    solution: "This error confirms you're using a Java version other than 8. Install Java 8 (OpenJDK 8 or Oracle JDK 8) and make sure it's the active version.",
    category: 'java',
  },
  {
    title: 'Certificate not detected',
    solution: "For USB tokens, ensure the manufacturer's drivers are installed. For file-based certificates (.p12/.pfx), verify the file path is correct and you have the right password.",
    category: 'certificate',
  },
  {
    title: 'Signature validation fails',
    solution: 'The signing certificate may not be trusted by the PDF reader. Import the CA certificate into your trust store, or use a certificate from a recognized Certificate Authority.',
    category: 'certificate',
  },
  {
    title: "PDF won't open / displays incorrectly",
    solution: 'Verify the PDF is not corrupted. Try opening it in another PDF viewer first. Some heavily encrypted or DRM-protected PDFs may not be supported.',
    category: 'pdf',
  },
  {
    title: 'Token PIN is locked',
    solution: "When a token PIN is locked after multiple failed attempts, you must use the token manufacturer's management software to unlock or reset it. eMark cannot unlock hardware tokens - this is a security feature. Contact your token vendor for specific instructions.",
    category: 'certificate',
  },
  {
    title: 'PKCS#11 library not found',
    solution: "The PKCS#11 library path may be incorrect. Common paths: Windows: C:\\Windows\\System32\\*.dll, Linux: /usr/lib/*.so, macOS: /usr/local/lib/*.dylib. Check your token manufacturer's documentation for the exact library location.",
    category: 'certificate',
  },
  {
    title: 'Timestamp server connection failed',
    solution: 'Ensure you have internet connection. Check if a proxy is required (Settings → Network). The default TSA server (timestamp.comodoca.com) may be temporarily unavailable - try alternative servers like DigiCert or Sectigo.',
    category: 'pdf',
  },
  {
    title: "Signature appears valid but 'untrusted'",
    solution: "The signing certificate's Certificate Authority (CA) is not in your PDF reader's trust store. In eMark: Settings → Trust Certificates, add the CA certificate. In Adobe Reader: Edit → Preferences → Signatures → Identities & Trusted Certificates.",
    category: 'certificate',
  },
  {
    title: 'Configuration file location',
    solution: 'eMark configuration is stored in ~/.eMark/config.yml (your home directory). On Windows: C:\\Users\\YourName\\.eMark\\config.yml. You can edit this YAML file to configure timestamp servers, proxy settings, and PKCS#11 paths.',
    category: 'java',
  },
];

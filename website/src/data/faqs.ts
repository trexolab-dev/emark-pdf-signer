import type { FAQ, FAQCategory, CategoryColor } from './types';

export const faqs: FAQ[] = [
  {
    question: 'Is eMark PDF Signer really free?',
    answer:
      'Yes, eMark PDF Signer is free and open-source under the AGPL-3.0 license. You can use it for personal purposes without any cost. For commercial use, the AGPL-3.0 license requires that if you distribute the software or use it in a network service, you must make your source code available under the same license. There are no hidden fees or subscriptions.',
    category: 'general',
  },
  {
    question: 'What types of certificates does eMark PDF Signer support?',
    answer:
      'eMark PDF Signer supports PKCS#12/PFX certificate files, PKCS#11 hardware tokens (USB security tokens like eToken, SafeNet, Gemalto, Feitian), HSM devices, and Windows Certificate Store integration. Most common digital certificates work seamlessly.',
    category: 'technical',
  },
  {
    question: 'Are signatures created by eMark PDF Signer legally valid?',
    answer:
      'Yes, signatures created by eMark PDF Signer conform to PAdES (PDF Advanced Electronic Signatures) and ISO 32000 standards. When used with qualified certificates, they are legally recognized in many jurisdictions including the EU under eIDAS regulation and DSC in India.',
    category: 'legal',
  },
  {
    question: 'Does eMark PDF Signer require Java?',
    answer:
      'Yes, eMark PDF Signer requires exactly Java 8 to run on ALL platforms (Windows, macOS, and Linux). Higher versions (Java 11, 17, 21, etc.) are NOT supported and will cause errors. You must install Java 8 separately before running eMark PDF Signer. We recommend Eclipse Temurin (Adoptium) JDK 8.',
    category: 'technical',
  },
  {
    question: 'Can I verify signatures from other applications?',
    answer:
      'Yes, eMark PDF Signer can verify digital signatures created by any PDF signing application that follows standard signature formats. You can view certificate details, trust chain, signature validity, and timestamp information.',
    category: 'features',
  },
  {
    question: 'Is eMark PDF Signer compatible with Adobe Reader?',
    answer:
      'Absolutely. PDFs signed with eMark PDF Signer are fully compatible with Adobe Reader DC, Adobe Acrobat, and other major PDF applications. Signatures will be recognized and validated correctly.',
    category: 'compatibility',
  },
  {
    question: 'Does eMark PDF Signer work offline?',
    answer:
      'Yes, eMark PDF Signer operates 100% offline. All PDF processing happens locally on your computer. No internet connection is required except for optional OCSP/CRL certificate validation and RFC 3161 timestamping. Your documents are never uploaded to any server.',
    category: 'privacy',
  },
  {
    question: 'What operating systems does eMark PDF Signer support?',
    answer:
      'eMark PDF Signer runs on Windows (7 and later), Linux (Debian/Ubuntu with .deb package, others via JAR), and macOS (10.13+). The interface and features are consistent across all platforms.',
    category: 'compatibility',
  },
  {
    question: 'Can I use my USB token or smart card?',
    answer:
      'Yes, eMark PDF Signer fully supports USB tokens and smart cards via PKCS#11. Tested devices include HYP2003, ProxKey Token, Longmai mToken, and many others. Simply install the manufacturer driver and configure the PKCS#11 library path in eMark PDF Signer settings.',
    category: 'technical',
  },
  {
    question: 'Does eMark PDF Signer support timestamping?',
    answer:
      'Yes, eMark PDF Signer supports RFC 3161 timestamping which proves when a signature was created, extends validity beyond certificate expiration, and is a legal requirement in many jurisdictions. Popular free TSA servers like DigiCert and Sectigo are supported.',
    category: 'features',
  },
  {
    question: 'Can I sign password-protected PDFs?',
    answer:
      'Yes, eMark PDF Signer can open and sign password-protected PDF documents. Simply enter the document password when prompted, and you can proceed with signing as normal.',
    category: 'features',
  },
  {
    question: 'Is my data safe with eMark PDF Signer?',
    answer:
      'Yes, eMark PDF Signer is designed with privacy-first principles. It never uploads PDFs to cloud servers, tracks user behavior, collects personal information, or shares certificates. All processing happens locally and the source code is fully auditable.',
    category: 'privacy',
  },
  {
    question: "Why is my signature showing as untrusted?",
    answer:
      "A signature may appear untrusted if the signing certificate's CA (Certificate Authority) is not in the trust store. To fix this, go to Settings → Trust Certificates and import the CA certificate. Also ensure your internet connection is available for OCSP/CRL validation.",
    category: 'technical',
  },
  {
    question: 'Can I customize the signature appearance?',
    answer:
      'Yes, eMark PDF Signer allows you to customize your signature appearance including adding text, reason, location, date, and even custom images. You can preview exactly how your signature will look before applying it.',
    category: 'features',
  },
  {
    question: 'What is Long-Term Validation (LTV)?',
    answer:
      'LTV embeds all validation data (certificates, OCSP responses, CRLs) into the signed PDF, allowing signature verification even after certificates expire or revocation services become unavailable. eMark PDF Signer supports LTV for enterprise-grade document security.',
    category: 'technical',
  },
  {
    question: 'How do I report bugs or request features?',
    answer:
      'You can report bugs and request features through our GitHub Issues page. Please include your operating system, Java version, eMark PDF Signer version, and steps to reproduce any issues. We welcome community contributions!',
    category: 'general',
  },
  {
    question: 'What are certification levels and when should I use them?',
    answer:
      'Certification levels control what changes are allowed after signing: "Open" allows further signatures, "Form Filling Only" permits only form completion, "Form + Annotations" allows forms and comments, and "Locked" prevents all modifications. Use higher restriction levels for sensitive documents.',
    category: 'legal',
  },
  {
    question: 'What signature date formats are available?',
    answer:
      'eMark PDF Signer offers multiple date formats: Compact (2024.12.03 14:30:45), ISO (2024-12-03T14:30:45+00:00), Long Readable (Tuesday, December 03, 2024), Short (03/12/2024 14:30), Date Only (03 Dec 2024), and Legal Style (03 Dec 2024 at 14:30). Configure in signature appearance settings.',
    category: 'features',
  },
  {
    question: 'Can I sign multiple times on the same PDF?',
    answer:
      'Yes, eMark PDF Signer supports multiple signatures on a single PDF document. Each signature can have different certification levels, allowing workflows like initial approval followed by final authorization. The signature panel shows all signatures with their validation status.',
    category: 'features',
  },
  {
    question: 'Where is the configuration file stored?',
    answer:
      "eMark PDF Signer stores its configuration in ~/.eMark/config.yml (YAML format). This file contains your preferences including timestamp server settings, proxy configuration, PKCS#11 library paths, and active keystores. It's automatically created on first run.",
    category: 'technical',
  },
  {
    question: 'How do I configure a proxy server?',
    answer:
      'Open Settings and navigate to the Network/Proxy section. Enter your proxy host, port, and optionally username/password for authentication. This is needed if your network requires a proxy for OCSP/CRL validation or timestamping services.',
    category: 'technical',
  },
  {
    question: 'My token PIN is locked. How do I unlock it?',
    answer:
      "When a token PIN is locked due to too many failed attempts, you'll need to use the token manufacturer's management software to unlock or reset it. eMark PDF Signer cannot unlock tokens - this is a security feature of the hardware. Contact your token vendor for specific instructions.",
    category: 'technical',
  },
  {
    question: 'Can I open PDFs from the command line?',
    answer:
      'Yes, you can open a PDF directly by running: java -jar eMark-PDF-Signer.jar /path/to/document.pdf. You can also drag and drop PDF files onto the eMark PDF Signer window to open them. The app remembers your last used directory for convenience.',
    category: 'features',
  },
];

export const categoryColors: Record<FAQCategory, CategoryColor> = {
  general: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  technical: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
  legal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  features: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  compatibility: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  privacy: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const BASE_URL = 'https://trexolab-dev.github.io/emark-pdf-signer';
const DEFAULT_IMAGE = `${BASE_URL}/assets/og-image.png`;
const DEFAULT_TITLE = 'eMark PDF Signer – Free PDF Digital Signature Software | Sign PDF with DSC Token | jSignPDF Alternative';
const DEFAULT_DESCRIPTION = 'eMark PDF Signer is a free, open-source PDF signing software and modern jSignPDF alternative. Sign PDF documents with USB DSC tokens, PKCS#11, PKCS#12/PFX certificates. Get green tick valid signatures in Adobe Reader. Download for Windows, macOS & Linux.';
const DEFAULT_KEYWORDS = 'eMark PDF Signer, free PDF signer, PDF signing software, digital signature tool, jSignPDF alternative, sign PDF with DSC token, USB token PDF signing, PKCS#11 PDF signer, PKCS#12 PFX certificate, digital signature certificate India, DSC token signing, how to digitally sign PDF, green tick signature, green checkmark PDF, valid signature Adobe Reader, sign PDF free, open source PDF signer, DocuSign alternative free, Adobe Acrobat alternative, iText PDF signature, eSign PDF document, legally sign PDF, certificate based signature, RFC 3161 timestamp, PAdES signature, LTV signature, sign PDF with smart card, Windows certificate store, cross-platform PDF signer, Java PDF signing tool, visible signature PDF, sign existing PDF fields, PDF signature verification, trusted digital signature, Class 3 DSC signing, government tender PDF signing';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
  structuredData,
  noIndex = false,
  canonicalUrl,
}: SEOProps) {
  const fullTitle = title ? `${title} | eMark PDF Signer` : DEFAULT_TITLE;
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const canonical = canonicalUrl || fullUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="eMark PDF Signer" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@trexolab" />
      <meta name="twitter:creator" content="@trexolab" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Pre-defined structured data generators
export const structuredDataGenerators = {
  softwareApplication: () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'eMark PDF Signer',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'PDF Signing Tool',
    operatingSystem: ['Windows 10', 'Windows 11', 'macOS', 'Linux', 'Ubuntu', 'Debian', 'Fedora'],
    description: 'eMark PDF Signer is a free, open-source PDF signing software and modern alternative to jSignPDF and Adobe Reader DC. Sign PDF documents with USB DSC tokens, PKCS#11 hardware tokens, and PKCS#12/PFX certificates. Creates legally valid digital signatures with green tick checkmark verification.',
    url: BASE_URL,
    downloadUrl: 'https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/emark-pdf-signer-Setup.exe',
    softwareVersion: '1.0',
    datePublished: '2024-01-01',
    dateModified: '2025-12-03',
    author: {
      '@type': 'Organization',
      name: 'TrexoLab',
      url: 'https://github.com/trexolab-dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrexoLab',
      url: 'https://github.com/trexolab-dev',
    },
    license: 'https://opensource.org/licenses/AGPL-3.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    screenshot: `${BASE_URL}/images/main.png`,
    image: `${BASE_URL}/images/logo.png`,
    featureList: [
      'Digital PDF Signatures with X.509 Certificates',
      'Green Tick Checkmark Valid Signatures in Adobe Reader',
      'USB DSC Token Support (Class 2/3 DSC India)',
      'PKCS#12/PFX Certificate File Support',
      'PKCS#11 Hardware Token Support (eToken, SafeNet)',
      'Windows Certificate Store Integration',
      'PAdES-B, PAdES-T, PAdES-LT Standards',
      'RFC 3161 Timestamp Server Support',
      'Signature Verification and Validation',
      'Custom Signature Appearance with Images',
      'Sign Existing PDF Signature Fields',
      'Cross-Platform (Windows, macOS, Linux)',
      'Modern jSignPDF Alternative',
      'Free and Open Source (AGPL-3.0)',
    ],
    softwareRequirements: 'Java 8',
    fileSize: '50MB',
    installUrl: `${BASE_URL}/#/installation`,
  }),

  howTo: (title: string, description: string, steps: { name: string; text: string; image?: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    totalTime: 'PT15M',
    tool: {
      '@type': 'HowToTool',
      name: 'eMark PDF Signer',
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Digital Certificate (PKCS#12/PFX or USB Token)',
      },
      {
        '@type': 'HowToSupply',
        name: 'PDF Document to sign',
      },
    ],
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          '@type': 'ImageObject',
          url: step.image,
        },
      }),
    })),
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  faqPage: (faqs: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  techArticle: (title: string, description: string, imageUrl?: string) => ({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: description,
    author: {
      '@type': 'Organization',
      name: 'TrexoLab',
      url: 'https://github.com/trexolab-dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrexoLab',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
      },
    }),
    datePublished: '2024-01-01',
    dateModified: '2025-12-03',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': BASE_URL,
    },
  }),

  imageGallery: (images: { url: string; title: string; description: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'eMark PDF Signer Screenshots',
    description: 'Gallery of eMark PDF Signer application screenshots showing PDF signing features',
    image: images.map((img) => ({
      '@type': 'ImageObject',
      url: img.url,
      name: img.title,
      description: img.description,
    })),
  }),
};

export default SEO;

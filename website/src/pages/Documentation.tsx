import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Shield,
  Key,
  FileSignature,
  Settings,
  Lock,
  Clock,
  CheckCircle,
  HardDrive,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  ArrowUp,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/common/AnimatedSection';
import { SEO, structuredDataGenerators } from '@/components/common';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ANIMATION } from '@/utils/constants';

const docSections = [
  { id: 'overview', label: 'Overview', icon: BookOpen, time: '2 min' },
  { id: 'certificates', label: 'Certificate Types', icon: Key, time: '4 min' },
  { id: 'signing', label: 'Digital Signing', icon: FileSignature, time: '3 min' },
  { id: 'security', label: 'Security & Standards', icon: Shield, time: '4 min' },
  { id: 'timestamping', label: 'Timestamping', icon: Clock, time: '2 min' },
  { id: 'privacy', label: 'Privacy', icon: Lock, time: '2 min' },
  { id: 'usb-tokens', label: 'USB Tokens', icon: HardDrive, time: '3 min' },
  { id: 'configuration', label: 'Configuration', icon: Settings, time: '3 min' },
];

export function Documentation() {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  const progressPercentage = useMemo(() => {
    return Math.round((completedSections.size / docSections.length) * 100);
  }, [completedSections]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = docSections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 120;
      setShowScrollTop(window.scrollY > 500);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(docSections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
      }
      if (mobileNavOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIndex = docSections.findIndex((s) => s.id === activeSection);
        const newIndex = e.key === 'ArrowDown'
          ? Math.min(currentIndex + 1, docSections.length - 1)
          : Math.max(currentIndex - 1, 0);
        scrollToSection(docSections[newIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen, activeSection]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileNavOpen(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleSectionComplete = useCallback((sectionId: string) => {
    setCompletedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const breadcrumbStructuredData = structuredDataGenerators.breadcrumb([
    { name: 'Home', url: 'https://trexolab-dev.github.io/emark-pdf-signer/' },
    { name: 'Documentation', url: 'https://trexolab-dev.github.io/emark-pdf-signer/#/documentation' },
  ]);

  return (
    <>
      <SEO
        title="Documentation - eMark PDF Signer"
        description="Complete documentation for eMark PDF Signer. Learn about digital certificates, PKCS#11 tokens, signature standards, timestamping, and security features."
        keywords="eMark PDF Signer documentation, PDF signing guide, digital certificate tutorial, PKCS#11 guide, PAdES signatures, RFC 3161 timestamp, USB token signing"
        url="https://trexolab-dev.github.io/emark-pdf-signer/#/documentation"
        structuredData={breadcrumbStructuredData}
      />
      <article className="min-h-screen">
        {/* Hero Section */}
        <header
          ref={heroRef}
          className={`relative py-20 border-b border-white/10 overflow-hidden transition-all duration-700 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-primary/20 to-cyan-500/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl opacity-30" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary transition-colors cursor-pointer-custom flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Documentation</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/20 animate-pulse-glow">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Complete Guide
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                  <span className="gradient-text">Documentation</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  Complete guide to eMark's features, security standards, certificate types, and configuration options.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>~20 min total</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>{docSections.length} sections</span>
                  </div>
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="glass-card-premium p-6 lg:min-w-[320px]">
                <p className="text-sm font-medium text-foreground mb-4">Quick Jump</p>
                <div className="grid grid-cols-2 gap-2">
                  {docSections.slice(0, 6).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-primary/20 transition-colors text-sm text-muted-foreground hover:text-foreground cursor-pointer-custom"
                    >
                      <section.icon className="w-4 h-4" />
                      <span className="truncate">{section.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {completedSections.size > 0 && (
              <div className="mt-8 p-4 glass rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reading Progress</span>
                  <span className="text-sm text-primary font-semibold">{progressPercentage}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-cyan-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-8 relative">
            {/* Mobile Navigation */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40 flex flex-col gap-3">
              {showScrollTop && (
                <button
                  onClick={scrollToTop}
                  className="glass p-3 rounded-full shadow-lg cursor-pointer-custom hover:bg-primary/20 transition-all animate-fade-in"
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="w-5 h-5 text-primary" />
                </button>
              )}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="glass p-4 rounded-full shadow-lg cursor-pointer-custom hover:bg-primary/20 transition-all"
                aria-label="Toggle navigation menu"
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileNavOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileNavOpen && (
              <>
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
                  onClick={() => setMobileNavOpen(false)}
                />
                <div className="lg:hidden fixed bottom-24 right-6 z-40 glass-card p-3 rounded-2xl shadow-2xl animate-slide-up-fade w-72">
                  <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Jump to Section
                    </span>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                    {docSections.map((section, index) => {
                      const isCompleted = completedSections.has(section.id);
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all cursor-pointer-custom group ${
                            activeSection === section.id
                              ? 'bg-primary/15 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          }`}
                          style={{ animationDelay: `${index * ANIMATION.staggerDelayFast}ms` }}
                        >
                          <div className={`relative p-1.5 rounded-lg ${
                            activeSection === section.id ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                            <section.icon className="w-4 h-4" />
                            {isCompleted && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="block">{section.label}</span>
                            <span className="text-xs text-muted-foreground">{section.time}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <nav className="sticky top-24 glass-card p-4 rounded-2xl space-y-1" aria-label="Page sections">
                <div className="flex items-center justify-between px-4 py-2 mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    On This Page
                  </p>
                  {completedSections.size > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {completedSections.size}/{docSections.length}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-[26px] top-3 bottom-3 w-0.5 bg-white/10 rounded-full" />

                  {docSections.map((section, index) => {
                    const isActive = activeSection === section.id;
                    const isCompleted = completedSections.has(section.id);
                    const isPast = docSections.findIndex((s) => s.id === activeSection) > index;

                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all cursor-pointer-custom group relative ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                            : isActive
                              ? 'bg-primary shadow-lg shadow-primary/30'
                              : isPast
                                ? 'bg-white/20'
                                : 'bg-white/10 group-hover:bg-white/20'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <section.icon className={`w-3 h-3 ${isActive ? 'text-white' : ''}`} />
                          )}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <span className="block truncate">{section.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isActive ? 'text-primary/70' : 'text-muted-foreground'}`}>
                            {section.time}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionComplete(section.id);
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                            }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground text-center">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">K</kbd> to search
                  </p>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 space-y-16">
              {/* Overview */}
              <AnimatedSection id="overview" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={BookOpen}
                  title="Overview"
                  time="2 min"
                  isCompleted={completedSections.has('overview')}
                  onToggleComplete={() => toggleSectionComplete('overview')}
                />
                <div className="glass-card p-6 space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    eMark is a professional PDF signing application that creates legally valid digital signatures
                    compatible with Adobe Reader and other major PDF applications. It supports multiple certificate
                    sources and complies with international standards.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FeatureCard title="Cross-Platform" description="Works on Windows, Linux, and macOS with consistent features" />
                    <FeatureCard title="Multiple Certificate Sources" description="PKCS#12/PFX files, USB tokens, Windows Certificate Store" />
                    <FeatureCard title="Standards Compliant" description="PAdES-B, PAdES-T, PAdES-LT signature levels" />
                    <FeatureCard title="100% Offline" description="All processing happens locally, no cloud uploads" />
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-blue-400">Tip:</strong> For installation instructions, visit the{' '}
                      <Link to="/installation" className="text-primary hover:underline">Installation Guide</Link>.
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              {/* Certificate Types */}
              <AnimatedSection id="certificates" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={Key}
                  title="Certificate Types"
                  time="4 min"
                  isCompleted={completedSections.has('certificates')}
                  onToggleComplete={() => toggleSectionComplete('certificates')}
                />
                <div className="glass-card p-6 space-y-6">
                  <CertificateType
                    title="PKCS#12 / PFX Files"
                    description="File-based certificates containing both public certificate and private key. Select your PFX/P12 file directly when signing - no import required."
                    features={[
                      'Select PFX file at signing time',
                      'Password requested on each use (never stored)',
                      'No certificate import or storage needed',
                      'Works on all platforms (.p12 and .pfx)',
                    ]}
                    securityNote="Your certificate password is never stored - enter it each time you sign"
                  />

                  <CertificateType
                    title="PKCS#11 Hardware Tokens"
                    description="USB security tokens and smart cards that store private keys in tamper-resistant hardware. Recommended for high-security applications."
                    features={[
                      'Private key never leaves hardware',
                      'PIN-protected access',
                      'Meets highest security standards',
                      'Required for government/legal documents',
                    ]}
                    recommended
                  />

                  <CertificateType
                    title="Windows Certificate Store"
                    description="Native Windows integration for certificates installed in the system certificate store. Useful in enterprise environments."
                    features={[
                      'Centralized certificate management',
                      'Active Directory integration',
                      'Single sign-on compatible',
                      'Windows only',
                    ]}
                    platformNote="Windows"
                  />
                </div>
              </AnimatedSection>

              {/* Digital Signing */}
              <AnimatedSection id="signing" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={FileSignature}
                  title="Digital Signing"
                  time="3 min"
                  isCompleted={completedSections.has('signing')}
                  onToggleComplete={() => toggleSectionComplete('signing')}
                />
                <div className="glass-card p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Signature Appearance</h3>
                    <p className="text-muted-foreground">Customize how your signature appears on the document:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">Visible signatures:</strong> Display name, reason, location, date, and custom images</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">Invisible signatures:</strong> Embed signature without visual representation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">Existing fields:</strong> Sign pre-existing signature fields in PDFs</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Certification Levels</h3>
                    <p className="text-muted-foreground">Control what changes are allowed after signing:</p>
                    <div className="grid gap-3">
                      <CertificationLevel level="Open" description="No restrictions - allows further signatures and modifications" />
                      <CertificationLevel level="Form Filling Only" description="Permits only form field completion after signing" />
                      <CertificationLevel level="Form + Annotations" description="Allows forms and comments/annotations" />
                      <CertificationLevel level="Locked" description="Prevents all modifications after signing" recommended />
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Security & Standards */}
              <AnimatedSection id="security" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={Shield}
                  title="Security & Standards"
                  time="4 min"
                  isCompleted={completedSections.has('security')}
                  onToggleComplete={() => toggleSectionComplete('security')}
                />
                <div className="glass-card p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Compliance Standards</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <StandardCard standard="ISO 32000" description="PDF specification compliance" />
                      <StandardCard standard="PAdES" description="PDF Advanced Electronic Signatures" />
                      <StandardCard standard="PKCS#7" description="Cryptographic Message Syntax" />
                      <StandardCard standard="PKCS#11 v2.40" description="Hardware security device interface" />
                      <StandardCard standard="RFC 3161" description="Timestamping protocol" />
                      <StandardCard standard="RFC 5280" description="X.509 certificate validation" />
                      <StandardCard standard="RFC 6960" description="Online Certificate Status Protocol" />
                      <StandardCard standard="DSC (India)" description="Digital Signature Certificate support" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Certificate Validation Process</h3>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>1. Certificate Chain Verification (Root CA → End Entity)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>2. Validity Period Check (Not Before ≤ Now ≤ Not After)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>3. Revocation Check (OCSP and/or CRL)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>4. Key Usage Verification (Digital Signature, Non-Repudiation)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>5. Trust Anchor Validation (Trusted Root CA Store)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>6. Signature Integrity Check (Hash comparison)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Timestamping */}
              <AnimatedSection id="timestamping" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={Clock}
                  title="Timestamping"
                  time="2 min"
                  isCompleted={completedSections.has('timestamping')}
                  onToggleComplete={() => toggleSectionComplete('timestamping')}
                />
                <div className="glass-card p-6 space-y-6">
                  <p className="text-muted-foreground">
                    RFC 3161 timestamps provide cryptographic proof of when a signature was created.
                  </p>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Why Timestamping Matters</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>Proves signature was created at a specific time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>Extends signature validity beyond certificate expiration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>Legal requirement in many jurisdictions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>Prevents backdating attacks</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Popular Free TSA Servers</h3>
                    <div className="space-y-3">
                      <TSAServer name="DigiCert" url="http://timestamp.digicert.com" />
                      <TSAServer name="Sectigo" url="http://timestamp.sectigo.com" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Privacy */}
              <AnimatedSection id="privacy" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={Lock}
                  title="Privacy & Data Protection"
                  time="2 min"
                  isCompleted={completedSections.has('privacy')}
                  onToggleComplete={() => toggleSectionComplete('privacy')}
                />
                <div className="glass-card p-6 space-y-6">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h3 className="font-semibold text-emerald-400 mb-2">100% Offline Operation</h3>
                    <p className="text-sm text-muted-foreground">
                      All PDF processing happens locally on your computer. No internet connection required
                      except for optional OCSP/CRL validation and timestamping.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">What eMark Never Does</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <PrivacyItem text="Upload PDFs to cloud servers" />
                      <PrivacyItem text="Send data to external servers" />
                      <PrivacyItem text="Track user behavior or analytics" />
                      <PrivacyItem text="Store signing history externally" />
                      <PrivacyItem text="Collect personal information" />
                      <PrivacyItem text="Share certificates or keys" />
                      <PrivacyItem text="Phone home or check licenses" />
                      <PrivacyItem text="Display advertisements" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* USB Tokens */}
              <AnimatedSection id="usb-tokens" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={HardDrive}
                  title="Supported USB Tokens"
                  time="3 min"
                  isCompleted={completedSections.has('usb-tokens')}
                  onToggleComplete={() => toggleSectionComplete('usb-tokens')}
                />
                <div className="glass-card p-6 space-y-6">
                  <p className="text-muted-foreground">
                    eMark supports most PKCS#11 compatible USB tokens and hardware security modules.
                  </p>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tested Devices</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <TokenCard name="HYP2003" vendor="HyperPKI" />
                      <TokenCard name="ProxKey Token" vendor="Watchdata" />
                      <TokenCard name="mToken CryptoID" vendor="Longmai" />
                      <TokenCard name="SOFT HSM" vendor="Software HSM" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-medium text-blue-400 mb-2">Setup Instructions</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Install token driver from manufacturer</li>
                      <li>Configure PKCS#11 library path in eMark Settings → Security</li>
                      <li>Insert token and enter PIN when prompted</li>
                      <li>Select certificate and sign</li>
                    </ol>
                  </div>
                </div>
              </AnimatedSection>

              {/* Configuration */}
              <AnimatedSection id="configuration" className="scroll-mt-24" threshold={0.1}>
                <DocSectionHeader
                  icon={Settings}
                  title="Configuration"
                  time="3 min"
                  isCompleted={completedSections.has('configuration')}
                  onToggleComplete={() => toggleSectionComplete('configuration')}
                />
                <div className="glass-card p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Configuration File Location</h3>
                    <div className="space-y-3">
                      <ConfigPath os="Windows" path="C:\Users\YourName\.eMark\config.yml" />
                      <ConfigPath os="Linux/macOS" path="~/.eMark/config.yml" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Memory Profiles</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For large PDFs, use different memory profiles:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Profile</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Heap Size</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">RAM Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="py-2 px-3">Normal</td>
                            <td className="py-2 px-3">2GB</td>
                            <td className="py-2 px-3">4GB</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3">Large</td>
                            <td className="py-2 px-3">4GB</td>
                            <td className="py-2 px-3">8GB</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3">Extra Large</td>
                            <td className="py-2 px-3">8GB</td>
                            <td className="py-2 px-3">16GB</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Scroll to top (Desktop) */}
              {showScrollTop && (
                <div className="hidden lg:block fixed bottom-8 right-8 z-40">
                  <button
                    onClick={scrollToTop}
                    className="glass p-4 rounded-full shadow-lg cursor-pointer-custom hover:bg-primary/20 transition-all animate-fade-in group"
                    aria-label="Scroll to top"
                  >
                    <ArrowUp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </article>
    </>
  );
}

// Section Header Component
function DocSectionHeader({
  icon: Icon,
  title,
  time,
  isCompleted,
  onToggleComplete,
}: {
  icon: React.ElementType;
  title: string;
  time?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-linear-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center transition-all ${
          isCompleted ? 'ring-2 ring-emerald-500/50' : ''
        }`}>
          {isCompleted ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Icon className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {time && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {time} read
            </p>
          )}
        </div>
      </div>
      {onToggleComplete && (
        <button
          onClick={onToggleComplete}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer-custom ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10'
          }`}
        >
          <Check className="w-4 h-4" />
          {isCompleted ? 'Completed' : 'Mark done'}
        </button>
      )}
    </div>
  );
}

// Helper Components
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CertificateType({
  title,
  description,
  features,
  securityNote,
  platformNote,
  recommended,
}: {
  title: string;
  description: string;
  features: string[];
  securityNote?: string;
  platformNote?: string;
  recommended?: boolean;
}) {
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-semibold">{title}</h4>
        {recommended && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">
            Recommended
          </span>
        )}
        {platformNote && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
            {platformNote}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <ul className="space-y-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {securityNote && (
        <p className="mt-3 text-xs text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {securityNote}
        </p>
      )}
    </div>
  );
}

function CertificationLevel({
  level,
  description,
  recommended,
}: {
  level: string;
  description: string;
  recommended?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <div>
        <span className="font-medium">{level}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {recommended && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">
          Secure
        </span>
      )}
    </div>
  );
}

function StandardCard({ standard, description }: { standard: string; description: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="font-mono text-sm text-primary">{standard}</span>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function TSAServer({ name, url }: { name: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-white/10">
      <div>
        <span className="font-medium text-sm">{name}</span>
        <code className="block text-xs text-muted-foreground mt-0.5">{url}</code>
      </div>
      <button
        onClick={copyUrl}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer-custom"
        title="Copy URL"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function PrivacyItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="text-red-400">✗</span>
      <span>{text}</span>
    </div>
  );
}

function TokenCard({ name, vendor }: { name: string; vendor: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="font-medium text-sm">{name}</span>
      <p className="text-xs text-muted-foreground">{vendor}</p>
    </div>
  );
}

function ConfigPath({ os, path }: { os: string; path: string }) {
  const [copied, setCopied] = useState(false);

  const copyPath = async () => {
    await navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-white/10">
      <div>
        <span className="text-xs text-muted-foreground">{os}</span>
        <code className="block text-sm font-mono text-primary mt-0.5">{path}</code>
      </div>
      <button
        onClick={copyPath}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer-custom"
        title="Copy path"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

export default Documentation;

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Terminal,
  Apple,
  ChevronRight,
  AlertTriangle,
  Info,
  CheckCircle,
  Download,
  Settings,
  Shield,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  Coffee,
  Cpu,
  HardDrive,
  ChevronDown,
  Clock,
  Search,
  Sparkles,
  ArrowUp,
  Zap,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/common/AnimatedSection';
import { SEO, structuredDataGenerators } from '@/components/common';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ANIMATION } from '@/utils/constants';

const navSections = [
  { id: 'prerequisites', label: 'Prerequisites', icon: Info, time: '2 min' },
  { id: 'windows', label: 'Windows', icon: Monitor, time: '5 min' },
  { id: 'linux', label: 'Linux', icon: Terminal, time: '5 min' },
  { id: 'macos', label: 'macOS', icon: Apple, time: '5 min' },
  { id: 'java-setup', label: 'Java Setup', icon: Settings, time: '3 min' },
  { id: 'certificate-setup', label: 'Certificate Setup', icon: Shield, time: '3 min' },
  { id: 'first-run', label: 'First Run', icon: CheckCircle, time: '2 min' },
  { id: 'uninstall', label: 'Uninstall', icon: Trash2, time: '2 min' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle, time: '—' },
];

type LinuxTab = 'ubuntu' | 'fedora' | 'arch' | 'generic';

export function Installation() {
  const [activeSection, setActiveSection] = useState('prerequisites');
  const [linuxTab, setLinuxTab] = useState<LinuxTab>('ubuntu');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [troubleshootingFilter, setTroubleshootingFilter] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const totalSections = navSections.length - 1; // Exclude troubleshooting
    return Math.round((completedSections.size / totalSections) * 100);
  }, [completedSections]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navSections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 120;

      // Show scroll-to-top button after scrolling down
      setShowScrollTop(window.scrollY > 500);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navSections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
      }
      // Arrow key navigation when nav is focused
      if (mobileNavOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIndex = navSections.findIndex((s) => s.id === activeSection);
        const newIndex = e.key === 'ArrowDown'
          ? Math.min(currentIndex + 1, navSections.length - 1)
          : Math.max(currentIndex - 1, 0);
        scrollToSection(navSections[newIndex].id);
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

  // Structured data for installation guide
  const installationStructuredData = structuredDataGenerators.howTo(
    'How to Install eMark PDF Signer',
    'Complete step-by-step guide to install eMark PDF Signer on Windows, macOS, and Linux. Includes Java 8 setup, certificate configuration, and troubleshooting tips.',
    [
      { name: 'Check Prerequisites', text: 'Ensure you have Java 8 installed. Higher versions like Java 11, 17, or 21 are NOT supported.' },
      { name: 'Download eMark', text: 'Download the appropriate installer for your operating system from the official GitHub releases page.' },
      { name: 'Install Java 8 (if needed)', text: 'Download and install Java 8 from Eclipse Temurin (Adoptium) or Oracle. Verify with java -version command.' },
      { name: 'Run the Installer', text: 'For Windows: Run eMark-Setup.exe. For Linux: Use dpkg -i eMark.deb or run java -jar eMark.jar.' },
      { name: 'Configure Certificate', text: 'Go to Settings → Security and configure your certificate source (PKCS#12/PFX file, USB token, or Windows Certificate Store).' },
      { name: 'Start Signing PDFs', text: 'Open a PDF, click the signature tool, draw a signature box, select your certificate, and save the signed document.' },
    ]
  );

  const breadcrumbStructuredData = structuredDataGenerators.breadcrumb([
    { name: 'Home', url: 'https://trexolab-dev.github.io/emark-pdf-signer/' },
    { name: 'Installation Guide', url: 'https://trexolab-dev.github.io/emark-pdf-signer/#/installation' },
  ]);

  return (
    <>
      <SEO
        title="Installation Guide - How to Install eMark PDF Signer"
        description="Complete installation guide for eMark PDF Signer. Step-by-step instructions for Windows, macOS, and Linux. Learn how to set up Java 8, configure certificates, and start signing PDFs."
        keywords="eMark PDF Signer installation, install PDF signer, Windows PDF signing setup, Linux PDF signer install, macOS PDF signing, Java 8 setup, PKCS#12 configuration, digital certificate setup, USB token signing setup"
        url="https://trexolab-dev.github.io/emark-pdf-signer/#/installation"
        image="https://trexolab-dev.github.io/emark-pdf-signer/images/setting-keystore.png"
        structuredData={[installationStructuredData, breadcrumbStructuredData]}
      />
      <article className="min-h-screen">
        {/* Hero Section */}
        <header
          ref={heroRef}
          className={`relative py-20 border-b border-white/10 overflow-hidden transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-primary/20 to-cyan-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors cursor-pointer-custom flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Installation</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/20 animate-pulse-glow">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Easy Setup
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="gradient-text">Installation Guide</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                Get started with eMark PDF Signer in minutes. Follow our step-by-step instructions
                for Windows, macOS, or Linux.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>~15 min total</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>3 platforms supported</span>
                </div>
              </div>
            </div>

            {/* Quick Download Card */}
            <div className="glass-card-premium p-6 lg:min-w-[320px]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-foreground">Quick Download</p>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Latest
                </span>
              </div>

              <a href="https://github.com/trexolab-dev/emark-pdf-signer/releases/latest" target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 btn-gradient text-white border-0 cursor-pointer-custom group">
                  <Download className="w-4 h-4 group-hover:animate-bounce" />
                  Download eMark PDF Signer
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </Button>
              </a>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground text-center mb-3">Available for</p>
                <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center gap-1 group cursor-pointer-custom" onClick={() => scrollToSection('windows')}>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                      <Monitor className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs text-muted-foreground">Windows</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 group cursor-pointer-custom" onClick={() => scrollToSection('macos')}>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                      <Apple className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs text-muted-foreground">macOS</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 group cursor-pointer-custom" onClick={() => scrollToSection('linux')}>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                      <Terminal className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs text-muted-foreground">Linux</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {completedSections.size > 0 && (
            <div className="mt-8 p-4 glass rounded-xl animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Installation Progress</span>
                <span className="text-sm text-primary font-semibold">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-cyan-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completedSections.size} of {navSections.length - 1} sections completed
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8 relative">
          {/* Mobile Navigation Toggle + Scroll to Top */}
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
              aria-expanded={mobileNavOpen}
            >
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileNavOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileNavOpen && (
            <>
              {/* Backdrop */}
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
                onClick={() => setMobileNavOpen(false)}
              />
              <div
                className="lg:hidden fixed bottom-24 right-6 z-40 glass-card p-3 rounded-2xl shadow-2xl animate-slide-up-fade w-72"
                role="navigation"
                aria-label="Page sections"
              >
                <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-white/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Jump to Section
                  </span>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                  {navSections.map((section, index) => {
                    const isCompleted = completedSections.has(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all cursor-pointer-custom group ${activeSection === section.id
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          }`}
                        style={{ animationDelay: `${index * ANIMATION.staggerDelayFast}ms` }}
                      >
                        <div className={`relative p-1.5 rounded-lg ${activeSection === section.id ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'
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
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-72 shrink-0">
            <nav className="sticky top-24 glass-card p-4 rounded-2xl space-y-1" aria-label="Page sections">
              <div className="flex items-center justify-between px-4 py-2 mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  On This Page
                </p>
                {completedSections.size > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    {completedSections.size}/{navSections.length - 1}
                  </span>
                )}
              </div>

              {/* Visual Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[26px] top-3 bottom-3 w-0.5 bg-white/10 rounded-full" />

                {navSections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  const isCompleted = completedSections.has(section.id);
                  const isPast = navSections.findIndex((s) => s.id === activeSection) > index;

                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all cursor-pointer-custom group relative ${isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isCompleted
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
                        {section.id !== 'troubleshooting' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionComplete(section.id);
                            }}
                            className={`p-1 rounded-md transition-colors ${isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                              }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Keyboard shortcut hint */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">↑</kbd>{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">↓</kbd> to navigate
                </p>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-16">
            {/* Prerequisites */}
            <AnimatedSection id="prerequisites" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Info}
                title="Prerequisites"
                time="2 min"
                isCompleted={completedSections.has('prerequisites')}
                onToggleComplete={() => toggleSectionComplete('prerequisites')}
              />
              <div className="glass-card p-6 space-y-6">
                {/* Good News - Bundled Java */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
                  <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-emerald-500 to-emerald-600" />
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-emerald-400">No Java Installation Required!</p>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Easy Setup
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The <strong className="text-foreground">Windows, Linux (.deb), and macOS (.dmg)</strong> installers include a <strong className="text-emerald-400">bundled Java 8 runtime</strong>.
                        No separate Java installation is needed! Just download and install.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        <strong className="text-amber-400">Note:</strong> If you use the universal JAR file, you must have Java 8 installed separately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Requirements */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    System Requirements
                    <span className="text-xs text-muted-foreground font-normal">(Minimum)</span>
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <RequirementCard
                      icon={Coffee}
                      title="Java Version"
                      value="Java 8 only"
                      note="OpenJDK 8 or Oracle JDK 8"
                      highlight
                    />
                    <RequirementCard
                      icon={Cpu}
                      title="Memory"
                      value="2GB RAM"
                      note="4GB recommended"
                    />
                    <RequirementCard
                      icon={HardDrive}
                      title="Storage"
                      value="100MB"
                      note="Free disk space"
                    />
                  </div>
                </div>

                {/* Quick tip */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-blue-400">Tip:</strong> Use the native installers (Windows .exe, Linux .deb, macOS .dmg) for the easiest setup experience with bundled Java 8.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Windows */}
            <AnimatedSection id="windows" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Monitor}
                title="Windows Installation"
                time="2 min"
                isCompleted={completedSections.has('windows')}
                onToggleComplete={() => toggleSectionComplete('windows')}
              />
              <div className="glass-card p-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-emerald-400">Java Included!</strong> The Windows installer includes a bundled Java 8 runtime.
                    No separate Java installation is required.
                  </p>
                </div>

                <div className="space-y-8">
                  <Step number={1} title="Download the Installer">
                    <p className="text-muted-foreground mb-4">
                      Download the latest Windows installer (.exe) from GitHub releases.
                    </p>
                    <a href="https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/emark-pdf-signer-x64-setup.exe">
                      <Button className="gap-2 btn-gradient text-white border-0 cursor-pointer-custom">
                        <Download className="w-4 h-4" />
                        Download emark-pdf-signer-x64-setup.exe
                      </Button>
                    </a>
                  </Step>

                  <Step number={2} title="Run the Installer">
                    <p className="text-muted-foreground">
                      Double-click the downloaded installer file.
                      If Windows SmartScreen appears, click "More info" → "Run anyway".
                      Follow the installation wizard to complete the setup.
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <li>• Choose installation type: Per-user (current user) or Per-machine (all users)</li>
                    </ul>
                  </Step>

                  <Step number={3} title="Launch eMark">
                    <p className="text-muted-foreground">
                      After installation completes, launch eMark from:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Start Menu → eMark</li>
                      <li>• Desktop shortcut (if created)</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      <strong>Memory Profiles:</strong> Three shortcuts are available in the Start Menu:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• <strong>eMark PDF Signer</strong> - Normal (2GB)</li>
                      <li>• <strong>eMark PDF Signer (Large)</strong> - Large (4GB)</li>
                      <li>• <strong>eMark PDF Signer (Extra Large)</strong> - Extra Large (8GB)</li>
                    </ul>
                  </Step>
                </div>
              </div>
            </AnimatedSection>

            {/* Linux */}
            <AnimatedSection id="linux" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Terminal}
                title="Linux Installation"
                time="5 min"
                isCompleted={completedSections.has('linux')}
                onToggleComplete={() => toggleSectionComplete('linux')}
              />
              <div className="glass-card p-6">
                {/* Distribution Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                  {(['ubuntu', 'fedora', 'arch', 'generic'] as LinuxTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setLinuxTab(tab)}
                      className={`flex-1 min-w-[100px] px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer-custom ${linuxTab === tab
                          ? 'bg-primary text-white shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                      {tab === 'ubuntu' && 'Ubuntu/Debian'}
                      {tab === 'fedora' && 'Fedora/RHEL'}
                      {tab === 'arch' && 'Arch Linux'}
                      {tab === 'generic' && 'Other'}
                    </button>
                  ))}
                </div>

                {/* Ubuntu/Debian */}
                {linuxTab === 'ubuntu' && (
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-emerald-400">Java Included!</strong> The .deb package includes a bundled Java 8 runtime.
                        No separate Java installation is required.
                      </p>
                    </div>
                    <Step number={1} title="Download and Install .deb Package">
                      <CodeBlock code={`wget https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/emark-pdf-signer-x64.deb\nsudo dpkg -i emark-pdf-signer-x64.deb`} />
                    </Step>
                    <Step number={2} title="Launch eMark PDF Signer">
                      <p className="text-muted-foreground">
                        Run from terminal or find "eMark PDF Signer" in your applications menu:
                      </p>
                      <CodeBlock code="emark" />
                      <p className="text-sm text-muted-foreground mt-3">
                        <strong>Memory Profiles:</strong> Use different commands for larger memory allocation:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li>• <code className="code-inline">emark</code> - Normal (2GB)</li>
                        <li>• <code className="code-inline">emark-large</code> - Large (4GB)</li>
                        <li>• <code className="code-inline">emark-xlarge</code> - Extra Large (8GB)</li>
                      </ul>
                    </Step>
                  </div>
                )}

                {/* Fedora/RHEL */}
                {linuxTab === 'fedora' && (
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-amber-400">Note:</strong> RPM package not yet available. Use the JAR file with Java 8 installed.
                      </p>
                    </div>
                    <Step number={1} title="Install Java 8">
                      <p className="text-sm text-red-400 mb-3">
                        ⚠️ You must install Java 8 specifically. Higher versions will not work.
                      </p>
                      <CodeBlock code="sudo dnf install java-1.8.0-openjdk" />
                    </Step>
                    <Step number={2} title="Download the JAR File">
                      <CodeBlock code="wget https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/eMark-PDF-Signer.jar" />
                    </Step>
                    <Step number={3} title="Run eMark PDF Signer">
                      <CodeBlock code="java -jar eMark-PDF-Signer.jar" />
                    </Step>
                  </div>
                )}

                {/* Arch Linux */}
                {linuxTab === 'arch' && (
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-amber-400">Note:</strong> AUR package not yet available. Use the JAR file with Java 8 installed.
                      </p>
                    </div>
                    <Step number={1} title="Install Java 8 from AUR">
                      <p className="text-sm text-red-400 mb-3">
                        ⚠️ You must install Java 8 specifically. Higher versions will not work.
                      </p>
                      <CodeBlock code={`yay -S jdk8-openjdk\nsudo archlinux-java set java-8-openjdk`} />
                    </Step>
                    <Step number={2} title="Download the JAR File">
                      <CodeBlock code="wget https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/eMark-PDF-Signer.jar" />
                    </Step>
                    <Step number={3} title="Run eMark PDF Signer">
                      <CodeBlock code="java -jar eMark-PDF-Signer.jar" />
                    </Step>
                  </div>
                )}

                {/* Generic */}
                {linuxTab === 'generic' && (
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-amber-400">Note:</strong> For other distributions, use the JAR file with Java 8 installed.
                      </p>
                    </div>
                    <Step number={1} title="Verify Java 8 is Installed">
                      <p className="text-muted-foreground mb-3">
                        Check your Java version:
                      </p>
                      <CodeBlock code="java -version" />
                      <p className="text-sm text-muted-foreground mt-3">
                        Output must show <code className="code-inline">1.8.x</code>.
                        If you see 11, 17, 21, or any other version, install Java 8 for your distribution.
                      </p>
                    </Step>
                    <Step number={2} title="Download JAR File">
                      <a href="https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/eMark-PDF-Signer.jar">
                        <Button variant="outline" className="gap-2 cursor-pointer-custom">
                          <Download className="w-4 h-4" />
                          Download eMark-PDF-Signer.jar
                        </Button>
                      </a>
                    </Step>
                    <Step number={3} title="Run eMark PDF Signer">
                      <CodeBlock code="java -jar eMark-PDF-Signer.jar" />
                    </Step>
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* macOS */}
            <AnimatedSection id="macos" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Apple}
                title="macOS Installation"
                time="2 min"
                isCompleted={completedSections.has('macos')}
                onToggleComplete={() => toggleSectionComplete('macos')}
              />
              <div className="glass-card p-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-emerald-400">Java Included!</strong> The macOS DMG installer includes a bundled Java 8 runtime.
                    No separate Java installation is required.
                  </p>
                </div>

                <div className="space-y-8">
                  <Step number={1} title="Download the DMG Installer">
                    <p className="text-muted-foreground mb-4">
                      Download the latest macOS installer (.dmg) from GitHub releases.
                    </p>
                    <a href="https://github.com/trexolab-dev/emark-pdf-signer/releases/latest/download/emark-pdf-signer-x64-macos.dmg">
                      <Button className="gap-2 btn-gradient text-white border-0 cursor-pointer-custom">
                        <Download className="w-4 h-4" />
                        Download emark-pdf-signer-x64-macos.dmg
                      </Button>
                    </a>
                  </Step>
                  <Step number={2} title="Install the Application">
                    <p className="text-muted-foreground">
                      Open the downloaded DMG file and drag eMark PDF Signer to your Applications folder.
                    </p>
                  </Step>
                  <Step number={3} title="Launch eMark PDF Signer">
                    <p className="text-muted-foreground">
                      Open eMark PDF Signer from your Applications folder or Spotlight.
                    </p>
                    <p className="text-sm text-amber-400 mt-3">
                      <strong>Note:</strong> On first launch, you may need to right-click and select "Open" to bypass Gatekeeper,
                      or go to System Preferences → Security & Privacy and click "Open Anyway".
                    </p>
                  </Step>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground">
                    <strong>Alternative:</strong> If you prefer to use the JAR file with your own Java 8 installation:
                  </p>
                  <CodeBlock code="java -jar eMark-PDF-Signer.jar" className="mt-3" />
                </div>
              </div>
            </AnimatedSection>

            {/* Java Setup */}
            <AnimatedSection id="java-setup" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Settings}
                title="Java 8 Setup Guide"
                time="3 min"
                isCompleted={completedSections.has('java-setup')}
                onToggleComplete={() => toggleSectionComplete('java-setup')}
              />
              <div className="glass-card p-6 space-y-6">
                {/* Warning */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400">Java 8 Only — No Higher Versions</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      eMark is compiled for Java 8 and uses APIs specific to that version.
                      Java 11, 17, 21, and newer versions will cause runtime errors.
                    </p>
                  </div>
                </div>

                {/* Verify Version */}
                <div>
                  <h3 className="font-semibold mb-3">Verify Your Java Version</h3>
                  <p className="text-muted-foreground mb-3">Run this command to check:</p>
                  <CodeBlock code="java -version" />

                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm font-medium text-emerald-400 mb-2">✓ Correct Output</p>
                      <code className="text-xs text-muted-foreground">openjdk version "1.8.0_XXX"</code>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm font-medium text-red-400 mb-2">✗ Wrong Version</p>
                      <code className="text-xs text-muted-foreground">openjdk version "17.0.X" or "21.0.X"</code>
                    </div>
                  </div>
                </div>

                {/* Multiple Java Versions */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-400 mb-1">Multiple Java Versions?</p>
                    <p className="text-sm text-muted-foreground">
                      If you have multiple Java versions installed, set <code className="code-inline">JAVA_HOME</code> to Java 8,
                      or use a version manager like <strong>SDKMAN</strong>:
                    </p>
                    <CodeBlock code="sdk use java 8.0.XXX-open" className="mt-3" />
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Certificate Setup */}
            <AnimatedSection id="certificate-setup" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Shield}
                title="Certificate Setup"
                time="3 min"
                isCompleted={completedSections.has('certificate-setup')}
                onToggleComplete={() => toggleSectionComplete('certificate-setup')}
              />
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-6">
                  eMark supports multiple certificate sources for digitally signing your PDF documents:
                </p>

                <div className="grid gap-4">
                  <CertificateOption
                    title="PKCS#12 / PFX Files"
                    description="Select your certificate file (.p12 or .pfx) directly when signing - no import needed. Your password is requested each time and never stored."
                  />
                  <CertificateOption
                    title="USB Security Tokens / Smart Cards"
                    description="Configure PKCS#11 provider in settings. eMark detects compatible USB tokens (SafeNet, YubiKey, etc.) and smart cards for hardware-based signing."
                  />
                  <CertificateOption
                    title="Windows Certificate Store"
                    description="On Windows, eMark can access certificates installed in the Windows Certificate Store (certmgr). Enable this option in Security settings."
                    windows
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* First Run */}
            <AnimatedSection id="first-run" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={CheckCircle}
                title="First Run & Configuration"
                time="2 min"
                isCompleted={completedSections.has('first-run')}
                onToggleComplete={() => toggleSectionComplete('first-run')}
              />
              <div className="glass-card p-6">
                <div className="space-y-8">
                  <Step number={1} title="Launch eMark PDF Signer">
                    <p className="text-muted-foreground">
                      Start eMark PDF Signer from your applications menu, desktop shortcut, or terminal.
                    </p>
                  </Step>

                  <Step number={2} title="Configure Your Certificate">
                    <p className="text-muted-foreground">
                      Navigate to <strong>Settings → Security</strong> and configure your certificate source:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Select your .p12/.pfx file, or</li>
                      <li>• Configure PKCS#11 for USB tokens, or</li>
                      <li>• Enable Windows Certificate Store (Windows only)</li>
                    </ul>
                  </Step>

                  <Step number={3} title="Open a PDF Document">
                    <p className="text-muted-foreground">
                      Open a PDF file using <strong>File → Open</strong> or simply drag and drop a PDF onto the eMark PDF Signer window.
                    </p>
                  </Step>

                  <Step number={4} title="Sign Your Document">
                    <p className="text-muted-foreground">
                      Click the signature tool in the toolbar, draw a signature box on the page,
                      select your certificate, and save the signed document.
                    </p>
                  </Step>
                </div>
              </div>
            </AnimatedSection>

            {/* Uninstall */}
            <AnimatedSection id="uninstall" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader
                icon={Trash2}
                title="Clean Uninstall Guide"
                time="2 min"
                isCompleted={completedSections.has('uninstall')}
                onToggleComplete={() => toggleSectionComplete('uninstall')}
              />
              <div className="glass-card p-6 space-y-6">
                <p className="text-muted-foreground">
                  Follow these instructions to completely remove eMark PDF Signer and all associated data from your system.
                </p>

                {/* Windows Uninstall */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Windows</h3>
                  </div>
                  <div className="ml-13 space-y-4">
                    <Step number={1} title="Uninstall via Windows Settings">
                      <p className="text-muted-foreground mb-3">
                        Open Windows Settings and uninstall eMark PDF Signer:
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Open <strong>Settings</strong> → <strong>Apps</strong> → <strong>Installed Apps</strong></li>
                        <li>• Search for "eMark PDF Signer"</li>
                        <li>• Click the three dots menu → <strong>Uninstall</strong></li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        <strong>Alternative:</strong> Run the uninstaller directly from:
                      </p>
                      <CodeBlock code="C:\Program Files\eMark PDF Signer\unins000.exe" className="mt-2" />
                    </Step>
                    <Step number={2} title="Remove User Data (Optional)">
                      <p className="text-muted-foreground mb-3">
                        Delete the configuration folder to remove all settings and preferences:
                      </p>
                      <CodeBlock code={`rmdir /s /q "%USERPROFILE%\\.eMark"`} />
                      <p className="text-xs text-muted-foreground mt-2">
                        This folder contains: config.yml, logs, and cached data.
                      </p>
                    </Step>
                    <Step number={3} title="Remove Registry Entries (Optional)">
                      <p className="text-muted-foreground mb-3">
                        The uninstaller removes registry entries automatically. If needed, manually check:
                      </p>
                      <CodeBlock code={`HKEY_CURRENT_USER\\Software\\eMark PDF Signer\nHKEY_LOCAL_MACHINE\\SOFTWARE\\eMark PDF Signer`} />
                    </Step>
                  </div>
                </div>

                {/* Linux Uninstall */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Linux</h3>
                  </div>
                  <div className="ml-13 space-y-4">
                    <Step number={1} title="Uninstall Package">
                      <p className="text-muted-foreground mb-3">
                        Remove the installed package:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Debian/Ubuntu (.deb):</p>
                          <CodeBlock code="sudo dpkg -r emark" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Or using apt:</p>
                          <CodeBlock code="sudo apt remove emark" />
                        </div>
                      </div>
                    </Step>
                    <Step number={2} title="Remove User Data (Optional)">
                      <p className="text-muted-foreground mb-3">
                        Delete the configuration directory:
                      </p>
                      <CodeBlock code="rm -rf ~/.eMark" />
                    </Step>
                    <Step number={3} title="Remove Desktop Entry (If Exists)">
                      <p className="text-muted-foreground mb-3">
                        Remove any leftover desktop shortcuts:
                      </p>
                      <CodeBlock code={`rm -f ~/.local/share/applications/emark*.desktop\nsudo rm -f /usr/share/applications/emark*.desktop`} />
                    </Step>
                  </div>
                </div>

                {/* macOS Uninstall */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                      <Apple className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold">macOS</h3>
                  </div>
                  <div className="ml-13 space-y-4">
                    <Step number={1} title="Remove Application">
                      <p className="text-muted-foreground mb-3">
                        Move eMark to Trash:
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Open <strong>Finder</strong> → <strong>Applications</strong></li>
                        <li>• Right-click on <strong>eMark PDF Signer</strong> → <strong>Move to Trash</strong></li>
                        <li>• Empty Trash to complete removal</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        <strong>Or via Terminal:</strong>
                      </p>
                      <CodeBlock code="sudo rm -rf /Applications/eMark\ PDF\ Signer.app" className="mt-2" />
                    </Step>
                    <Step number={2} title="Remove User Data (Optional)">
                      <p className="text-muted-foreground mb-3">
                        Delete configuration and cache files:
                      </p>
                      <CodeBlock code={`rm -rf ~/.eMark\nrm -rf ~/Library/Application\\ Support/eMark\nrm -rf ~/Library/Caches/eMark\nrm -rf ~/Library/Preferences/com.trexolab.emark-pdf-signer.plist`} />
                    </Step>
                  </div>
                </div>

                {/* JAR File Users */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold">JAR File Users</h3>
                  </div>
                  <div className="ml-13">
                    <p className="text-muted-foreground mb-3">
                      If you used the standalone JAR file:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Delete the <code className="code-inline">eMark-PDF-Signer.jar</code> file</li>
                      <li>2. Remove configuration: <code className="code-inline">~/.eMark</code> (Linux/macOS) or <code className="code-inline">%USERPROFILE%\.eMark</code> (Windows)</li>
                    </ul>
                  </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-400 mb-1">What Gets Removed?</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Application files:</strong> Program binaries, bundled JRE, resources<br />
                      <strong>User data (~/.eMark):</strong> config.yml, logs, signature preferences, timestamp server settings<br />
                      <strong>Note:</strong> Your signed PDF files are NOT affected by uninstalling eMark PDF Signer.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Troubleshooting */}
            <AnimatedSection id="troubleshooting" className="scroll-mt-24" threshold={0.1}>
              <InstallationSectionHeader icon={HelpCircle} title="Troubleshooting" />
              <div className="glass-card p-6 space-y-6">
                {/* Search/Filter */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={troubleshootingFilter}
                    onChange={(e) => setTroubleshootingFilter(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <TroubleshootItem
                    title="Java not found / 'java' is not recognized"
                    solution="Java 8 is not installed or not in your PATH. Install Java 8 and ensure JAVA_HOME is set correctly. Run 'java -version' to verify — you must see version 1.8.x."
                    filter={troubleshootingFilter}
                    category="java"
                  />
                  <TroubleshootItem
                    title="Application won't start or crashes immediately"
                    solution="This usually means wrong Java version. eMark requires EXACTLY Java 8. If 'java -version' shows 11, 17, 21, or anything other than 1.8.x, install Java 8 and set it as your default."
                    filter={troubleshootingFilter}
                    category="java"
                  />
                  <TroubleshootItem
                    title="UnsupportedClassVersionError"
                    solution="This error confirms you're using a Java version other than 8. Install Java 8 (OpenJDK 8 or Oracle JDK 8) and make sure it's the active version."
                    filter={troubleshootingFilter}
                    category="java"
                  />
                  <TroubleshootItem
                    title="Certificate not detected"
                    solution="For USB tokens, ensure the manufacturer's drivers are installed. For file-based certificates (.p12/.pfx), verify the file path is correct and you have the right password."
                    filter={troubleshootingFilter}
                    category="certificate"
                  />
                  <TroubleshootItem
                    title="Signature validation fails"
                    solution="The signing certificate may not be trusted by the PDF reader. Import the CA certificate into your trust store, or use a certificate from a recognized Certificate Authority."
                    filter={troubleshootingFilter}
                    category="certificate"
                  />
                  <TroubleshootItem
                    title="PDF won't open / displays incorrectly"
                    solution="Verify the PDF is not corrupted. Try opening it in another PDF viewer first. Some heavily encrypted or DRM-protected PDFs may not be supported."
                    filter={troubleshootingFilter}
                    category="pdf"
                  />
                  <TroubleshootItem
                    title="Token PIN is locked"
                    solution="When a token PIN is locked after multiple failed attempts, you must use the token manufacturer's management software to unlock or reset it. eMark cannot unlock hardware tokens - this is a security feature. Contact your token vendor for specific instructions."
                    filter={troubleshootingFilter}
                    category="certificate"
                  />
                  <TroubleshootItem
                    title="PKCS#11 library not found"
                    solution="The PKCS#11 library path may be incorrect. Common paths: Windows: C:\\Windows\\System32\\*.dll, Linux: /usr/lib/*.so, macOS: /usr/local/lib/*.dylib. Check your token manufacturer's documentation for the exact library location."
                    filter={troubleshootingFilter}
                    category="certificate"
                  />
                  <TroubleshootItem
                    title="Timestamp server connection failed"
                    solution="Ensure you have internet connection. Check if a proxy is required (Settings → Network). The default TSA server (timestamp.comodoca.com) may be temporarily unavailable - try alternative servers like DigiCert or Sectigo."
                    filter={troubleshootingFilter}
                    category="pdf"
                  />
                  <TroubleshootItem
                    title="Signature appears valid but 'untrusted'"
                    solution="The signing certificate's Certificate Authority (CA) is not in your PDF reader's trust store. In eMark: Settings → Trust Certificates, add the CA certificate. In Adobe Reader: Edit → Preferences → Signatures → Identities & Trusted Certificates."
                    filter={troubleshootingFilter}
                    category="certificate"
                  />
                  <TroubleshootItem
                    title="Configuration file location"
                    solution="eMark PDF Signer configuration is stored in ~/.eMark/config.yml (your home directory). On Windows: C:\\Users\\YourName\\.eMark\\config.yml. You can edit this YAML file to configure timestamp servers, proxy settings, and PKCS#11 paths."
                    filter={troubleshootingFilter}
                    category="java"
                  />
                </div>

                {/* Help Links */}
                <div className="mt-4 p-5 rounded-2xl bg-linear-to-r from-primary/10 via-cyan-500/5 to-transparent border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-primary/20">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-2">Still having issues?</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        We're here to help! Check out these resources:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="https://github.com/trexolab-dev/emark-pdf-signer/wiki"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors cursor-pointer-custom"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <BookOpen className="w-4 h-4" />
                          Documentation
                        </a>
                        <a
                          href="https://github.com/trexolab-dev/emark-pdf-signer/issues"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-sm text-primary transition-colors cursor-pointer-custom"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Report an Issue
                        </a>
                      </div>
                    </div>
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

// Installation Section Header component (specialized for this page with completion tracking)
function InstallationSectionHeader({
  icon: Icon,
  title,
  badge,
  time,
  isCompleted,
  onToggleComplete,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  time?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-linear-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center transition-all ${isCompleted ? 'ring-2 ring-emerald-500/50' : ''
          }`}>
          {isCompleted ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Icon className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {badge}
              </span>
            )}
          </div>
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer-custom ${isCompleted
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

// Requirement Card
function RequirementCard({
  icon: Icon,
  title,
  value,
  note,
  highlight,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-5 rounded-xl text-center transition-all hover:scale-[1.02] ${highlight
        ? 'bg-linear-to-br from-primary/10 to-cyan-500/5 border border-primary/20 ring-1 ring-primary/10'
        : 'bg-white/5 border border-white/10 hover:border-white/20'
      }`}>
      <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${highlight ? 'bg-primary/20' : 'bg-white/10'
        }`}>
        <Icon className={`w-6 h-6 ${highlight ? 'text-primary' : 'text-primary'}`} />
      </div>
      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{title}</p>
      <p className={`font-bold text-lg ${highlight ? 'text-primary' : ''}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{note}</p>
    </div>
  );
}

// Step component
function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 min-w-0 group">
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary to-cyan-500 flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
          {number}
        </div>
        {/* Connector line */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%-1rem)] bg-linear-to-b from-primary/30 to-transparent hidden group-last:hidden sm:block" />
      </div>
      <div className="flex-1 pt-1.5 min-w-0 overflow-hidden pb-2">
        <h3 className="font-semibold mb-2 text-lg">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// Code Block with copy button and line numbers
function CodeBlock({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const showLineNumbers = lines.length > 1;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group w-full ${className}`}>
      <div className="w-full bg-slate-900/90 border border-white/10 rounded-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-slate-500 ml-2">Terminal</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all cursor-pointer-custom bg-slate-700/50 hover:bg-slate-600/50"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code content */}
        <div className="relative w-full overflow-x-auto scrollbar-thin p-4">
          <div className="flex">
            {showLineNumbers && (
              <div className="select-none pr-4 text-right border-r border-white/5 mr-4">
                {lines.map((_, i) => (
                  <div key={i} className="text-xs text-slate-600 font-mono leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <code className="text-sm text-slate-300 font-mono whitespace-pre block flex-1">
              {lines.map((line, i) => (
                <div key={i} className="leading-6 hover:bg-white/5 -mx-2 px-2 rounded">
                  {line || ' '}
                </div>
              ))}
            </code>
          </div>
        </div>
      </div>
      {/* Copy toast notification */}
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-emerald-500/90 text-white text-xs font-medium animate-fade-in shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}

// Certificate Option card
function CertificateOption({ title, description, recommended, windows }: { title: string; description: string; recommended?: boolean; windows?: boolean }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold">{title}</h3>
        {recommended && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
            Recommended
          </span>
        )}
        {windows && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
            Windows
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Troubleshoot Item with filter support
function TroubleshootItem({
  title,
  solution,
  filter = '',
  category,
}: {
  title: string;
  solution: string;
  filter?: string;
  category?: 'java' | 'certificate' | 'pdf';
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter logic
  const isVisible = useMemo(() => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      title.toLowerCase().includes(searchTerm) ||
      solution.toLowerCase().includes(searchTerm) ||
      (category && category.toLowerCase().includes(searchTerm))
    );
  }, [filter, title, solution, category]);

  if (!isVisible) return null;

  const categoryColors = {
    java: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    certificate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pdf: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all ${isOpen ? 'ring-1 ring-primary/20' : 'hover:border-white/20'
      }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors cursor-pointer-custom gap-3"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${isOpen ? 'bg-primary/20' : 'bg-white/10'}`}>
            <AlertTriangle className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <span className="font-medium truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {category && (
            <span className={`hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColors[category]}`}>
              {category}
            </span>
          )}
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0">
            <div className="pl-10">
              <p className="text-sm text-muted-foreground leading-relaxed">{solution}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Installation;

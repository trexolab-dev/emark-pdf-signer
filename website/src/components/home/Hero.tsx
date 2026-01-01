import { useState, useEffect } from 'react';
import { ArrowDown, Download, Github, Sparkles, Shield, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppPreview } from './AppPreview';
import { useGitHubStats } from '@/context/GitHubStatsContext';
import { scrollToSection } from '@/utils/utils';
import { GITHUB_URL } from '@/utils/constants';
import { DownloadChoiceDialog } from '@/components/common/DownloadChoiceDialog';

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated gradient orbs
function GradientOrbs() {
  return (
    <>
      {/* Primary orb */}
      <div
        className="orb orb-primary w-[500px] h-[500px] -top-48 -left-48"
        style={{ animationDelay: '0s' }}
      />
      {/* Secondary orb */}
      <div
        className="orb orb-secondary w-[400px] h-[400px] top-1/2 -right-32"
        style={{ animationDelay: '-5s' }}
      />
      {/* Tertiary orb */}
      <div
        className="orb orb-tertiary w-[300px] h-[300px] -bottom-24 left-1/4"
        style={{ animationDelay: '-10s' }}
      />
    </>
  );
}

// Badge component with animation
function AnimatedBadge({
  icon: Icon,
  text,
  delay = 0,
  variant = 'default',
}: {
  icon: React.ElementType;
  text: string;
  delay?: number;
  variant?: 'default' | 'success' | 'primary';
}) {
  const variantClasses = {
    default: 'bg-slate-800/50 ring-1 ring-slate-700/40 text-slate-300',
    success: 'bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400',
    primary: 'bg-primary/10 ring-1 ring-primary/20 text-primary',
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-500 ${variantClasses[variant]}`}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  // Use shared app metadata context
  const { version } = useGitHubStats();

  useEffect(() => {
    // Trigger animations after mount
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute inset-0 particle-grid opacity-30" />
      <GradientOrbs />
      <FloatingParticles />

      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-primary" />
            <div className="absolute inset-0 animate-pulse-ring">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
          <span className="text-sm font-medium">Free & Open Source PDF Signing Tool</span>
        </div>

        {/* Main Heading with staggered animation */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span
            className={`block transition-all duration-700 delay-100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="gradient-text-animated">Professional PDF Signing</span>
          </span>
          <span
            className={`block text-foreground mt-2 transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Made Simple
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 transition-all duration-700 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          eMark PDF Signer is a powerful, free alternative to Adobe Reader DC for signing PDF documents
          with digital certificates. Works on Windows, macOS, and Linux.
        </p>
        <p
          className={`text-sm text-yellow-500/80 mb-6 transition-all duration-700 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Requires Java 8 (higher versions not supported)
        </p>

        {/* Stats & Badges */}
        <div
          className={`flex flex-wrap items-center justify-center gap-3 mb-10 transition-all duration-700 delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {version && (
            <AnimatedBadge icon={Star} text={version} variant="primary" delay={0} />
          )}
          <AnimatedBadge icon={Shield} text="100% Free" delay={100} />
          <AnimatedBadge icon={Zap} text="No Registration" delay={200} />
          <AnimatedBadge icon={Download} text="Open Source" variant="success" delay={300} />
        </div>

        {/* CTA Buttons with enhanced styling */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-600 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="group">
            <Button
              size="lg"
              onClick={() => setDownloadDialogOpen(true)}
              className="gap-2 btn-premium text-white border-0 px-8 h-14 text-base font-semibold"
            >
              <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
              Download Now
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">Free</span>
            </Button>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 h-14 px-8 text-base transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20"
            >
              <Github className="w-5 h-5 transition-transform group-hover:rotate-12" />
              View on GitHub
            </Button>
          </a>
        </div>

        {/* App Preview with enhanced container */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 delay-700 ${
            isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}
        >
          <div className="relative group">
            {/* Glow effect behind the card */}
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

            <div className="relative glass-card-premium p-3 rounded-2xl">
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-2xl p-px bg-linear-to-r from-primary/50 via-transparent to-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <AppPreview />

              {/* Floating badge on preview */}
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-semibold shadow-lg animate-bounce-slow">
                Live Preview
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator with enhanced animation */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => scrollToSection('features')}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
          >
            <span className="text-sm group-hover:text-shimmer">Explore Features</span>
            <div className="relative">
              <ArrowDown className="w-5 h-5 animate-bounce" />
              <div className="absolute inset-0 animate-pulse-ring opacity-50">
                <ArrowDown className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />

      {/* Download Choice Dialog */}
      <DownloadChoiceDialog
        isOpen={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
      />
    </section>
  );
}

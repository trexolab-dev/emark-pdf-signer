/**
 * Features Section Component
 *
 * Displays the application features in a grid layout with animated cards.
 * Uses centralized components and hooks for consistency.
 */

import { Zap } from 'lucide-react';
import { useScrollAnimation } from '@/hooks';
import { features } from '@/data/features';
import { GITHUB_URL, ANIMATION } from '@/utils/constants';
import { SectionHeader, GlowCard, GlowCardContent } from '@/components/ui';
import type { Feature } from '@/data/types';

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isVisible: boolean;
}

function FeatureCard({ feature, index, isVisible }: FeatureCardProps) {
  return (
    <GlowCard index={index} isVisible={isVisible} disableTilt>
      <GlowCardContent>
        {/* Icon container with refined hover */}
        <div className="relative mb-5">
          <div
            className={`
              w-12 h-12 rounded-xl ${feature.iconBg}
              flex items-center justify-center
              ring-1 ring-white/5
              transition-all duration-500 ease-out
              group-hover:scale-105 group-hover:ring-white/10
              group-hover:shadow-lg
            `}
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
            }}
          >
            <feature.icon
              className={`w-6 h-6 ${feature.iconColor} transition-all duration-500 group-hover:scale-110`}
            />
          </div>

          {/* Subtle icon glow */}
          <div
            className={`
              absolute -inset-2 rounded-2xl bg-linear-to-br ${feature.color}
              opacity-0 group-hover:opacity-15 blur-2xl
              transition-opacity duration-700 pointer-events-none
            `}
          />
        </div>

        {/* Text content with smooth transitions */}
        <div className="relative space-y-2">
          <h3 className="text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-500">
            {feature.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-500">
            {feature.description}
          </p>
        </div>

        {/* Bottom accent line - clean edge-to-edge */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-px
            bg-linear-to-r ${feature.color}
            opacity-0 group-hover:opacity-60
            transition-all duration-700 ease-out
            origin-left scale-x-0 group-hover:scale-x-100
          `}
          style={{ margin: '-1.5rem', marginTop: 0, width: 'calc(100% + 3rem)' }}
        />
      </GlowCardContent>
    </GlowCard>
  );
}

export function Features() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.05 });

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 particle-grid opacity-20" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '-1s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <SectionHeader
            icon={Zap}
            badge="Powerful Features"
            title="Everything You Need"
            subtitle="Professional PDF signing with all the features you'd expect from premium software — completely free."
          />
        </div>

        {/* Features Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={gridVisible}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-700 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${features.length * ANIMATION.staggerDelay}ms` }}
        >
          <p className="text-slate-400 mb-4">
            And much more — all completely free and open source.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-cyan-400 transition-colors animated-underline"
          >
            <span>View all features on GitHub</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

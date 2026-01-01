/**
 * How It Works Section Component
 *
 * Displays step-by-step instructions for using the application.
 * Uses centralized components and hooks for consistency.
 */

import { FileUp, MousePointerClick, PenTool, Download, Play, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks';
import { SectionHeader, GlowCard, GlowCardContent } from '@/components/ui';
import { ANIMATION } from '@/utils/constants';

const steps = [
  {
    icon: FileUp,
    step: '01',
    title: 'Open PDF Document',
    description: 'Launch eMark and open the PDF file you want to sign. Drag and drop or use the file menu.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: PenTool,
    step: '02',
    title: 'Place Signature',
    description: 'Draw a signature box on the document or use an existing signature field. Customize appearance.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: MousePointerClick,
    step: '03',
    title: 'Select Certificate',
    description: 'Choose your digital certificate from a file (PKCS#12/PFX), USB token, or Windows store.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  {
    icon: Download,
    step: '04',
    title: 'Save Signed PDF',
    description: 'Save the signed document. Your digital signature is now embedded and verifiable.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
];

interface StepCardProps {
  step: typeof steps[0];
  index: number;
  isVisible: boolean;
  isLast: boolean;
}

function StepCard({ step, index, isVisible, isLast }: StepCardProps) {
  return (
    <div className="relative">
      {/* Connector Line - Desktop */}
      {!isLast && (
        <div className="hidden lg:block absolute top-14 left-[calc(100%-1rem)] w-[calc(100%-2rem)] h-px z-0">
          <div className={`h-full bg-linear-to-r ${step.color} opacity-20`} />
          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>
      )}

      <GlowCard index={index} isVisible={isVisible} disableTilt>
        <GlowCardContent>
          {/* Step Number Badge */}
          <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-linear-to-br ${step.color} flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all duration-500 group-hover:scale-110`}>
            {step.step}
          </div>

          {/* Icon */}
          <div className="relative mb-5">
            <div
              className={`
                w-12 h-12 rounded-xl ${step.bgColor}
                flex items-center justify-center
                ring-1 ring-white/5
                transition-all duration-500 ease-out
                group-hover:scale-105 group-hover:ring-white/10
              `}
            >
              <step.icon className={`w-6 h-6 ${step.iconColor} transition-all duration-500 group-hover:scale-110`} />
            </div>
            {/* Subtle icon glow */}
            <div className={`absolute -inset-2 rounded-2xl bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-700 pointer-events-none`} />
          </div>

          {/* Content */}
          <div className="relative space-y-2">
            <h3 className="text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-500">
              {step.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-500">
              {step.description}
            </p>
          </div>

          {/* Bottom accent line */}
          <div
            className={`
              absolute bottom-0 left-0 right-0 h-px
              bg-linear-to-r ${step.color}
              opacity-0 group-hover:opacity-60
              transition-all duration-700 ease-out
              origin-left scale-x-0 group-hover:scale-x-100
            `}
            style={{ margin: '-1.5rem', marginTop: 0, width: 'calc(100% + 3rem)' }}
          />
        </GlowCardContent>
      </GlowCard>
    </div>
  );
}

function DemoImage({
  src,
  alt,
  label,
  stepLabel,
  colorClass,
  isVisible,
  direction,
  delay = 0,
}: {
  src: string;
  alt: string;
  label: string;
  stepLabel: string;
  colorClass: string;
  isVisible: boolean;
  direction: 'left' | 'right';
  delay?: number;
}) {
  const translateClass = direction === 'left' ? '-translate-x-8' : 'translate-x-8';

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${translateClass}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Subtle outer glow */}
      <div className={`absolute -inset-1 bg-linear-to-r ${colorClass} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-700`} />

      <div className="relative p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 group-hover:border-slate-700/80 group-hover:bg-slate-900/80 transition-all duration-500">
        <div className="rounded-xl overflow-hidden bg-slate-900/50">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-500">
            {label}
          </p>
          <span className={`px-2.5 py-1 rounded-full ${colorClass.replace('/20', '/10')} text-xs font-medium`}>
            {stepLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation({ threshold: 0.05 });
  const { ref: imagesRef, isVisible: imagesVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="usage" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 particle-grid opacity-20" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <SectionHeader
            icon={Play}
            badge="Quick Start"
            title="How It Works"
            subtitle="Sign your PDF documents in just four simple steps. No complex setup required."
          />
        </div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <StepCard
              key={step.step}
              step={step}
              index={index}
              isVisible={stepsVisible}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Demo Images */}
        <div ref={imagesRef} className="grid md:grid-cols-2 gap-6">
          <DemoImage
            src={`${import.meta.env.BASE_URL}images/Init-signature-opration.png`}
            alt="Initialize Signature Operation"
            label="Initialize Signature Operation"
            stepLabel="Step 1-2"
            colorClass="from-blue-500/20 to-cyan-500/20"
            isVisible={imagesVisible}
            direction="left"
          />
          <DemoImage
            src={`${import.meta.env.BASE_URL}images/Signature-box-rectangle.png`}
            alt="Draw Signature Box"
            label="Draw Signature Box"
            stepLabel="Step 3-4"
            colorClass="from-emerald-500/20 to-teal-500/20"
            isVisible={imagesVisible}
            direction="right"
            delay={ANIMATION.transitionFast}
          />
        </div>
      </div>
    </section>
  );
}

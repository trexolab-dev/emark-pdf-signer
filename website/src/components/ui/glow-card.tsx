/**
 * GlowCard Component
 *
 * A reusable card component with elegant hover effects.
 * Professional, clean design with subtle animations.
 */

import { useCardTilt } from '@/hooks';
import { cn } from '@/utils/utils';
import { ANIMATION } from '@/utils/constants';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderColor?: string;
  index?: number;
  isVisible?: boolean;
  disableTilt?: boolean;
}

export function GlowCard({
  children,
  className,
  glowColor = 'rgba(14, 165, 233, 0.15)',
  borderColor = 'primary',
  index = 0,
  isVisible = true,
  disableTilt = false,
}: GlowCardProps) {
  const { ref, style, glowPosition, handlers } = useCardTilt({
    maxTilt: disableTilt ? 0 : 8,
    scale: disableTilt ? 1 : 1.02,
  });

  return (
    <div
      ref={ref}
      {...handlers}
      className={cn(
        'relative group transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
      style={{
        ...style,
        transitionDelay: `${index * ANIMATION.staggerDelay}ms`,
      }}
    >
      {/* Outer glow - subtle ambient light */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Border glow ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none',
          `bg-gradient-to-br from-${borderColor}/20 via-transparent to-cyan-500/20`
        )}
        style={{
          padding: '1px',
          background: `linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, transparent 50%, rgba(6, 182, 212, 0.3) 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Card content wrapper */}
      <div
        className={cn(
          'relative h-full rounded-2xl overflow-hidden transition-all duration-500',
          'bg-slate-900/60 backdrop-blur-xl',
          'border border-slate-800/60',
          'group-hover:border-slate-700/80 group-hover:bg-slate-900/80',
          'group-hover:shadow-lg group-hover:shadow-primary/5'
        )}
      >
        {/* Spotlight effect following mouse */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(14, 165, 233, 0.06), transparent 40%)`,
          }}
        />

        {children}
      </div>
    </div>
  );
}

/**
 * GlowCardContent - For consistent padding inside GlowCard
 */
interface GlowCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowCardContent({ children, className }: GlowCardContentProps) {
  return (
    <div className={cn('relative p-6', className)}>
      {children}
    </div>
  );
}

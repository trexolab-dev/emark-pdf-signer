/**
 * Section Container Component
 *
 * A wrapper component for consistent section layout and spacing.
 */

import { cn } from '@/utils/utils';

type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  size?: SectionSize;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'gradient' | 'mesh';
}

const sizeClasses: Record<SectionSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-24 md:py-32',
};

const backgroundClasses: Record<'transparent' | 'gradient' | 'mesh', string> = {
  transparent: '',
  gradient: 'gradient-aurora',
  mesh: 'gradient-mesh',
};

export function SectionContainer({
  children,
  id,
  className,
  size = 'xl',
  padding = 'md',
  background = 'transparent',
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size])}>
        {children}
      </div>
    </section>
  );
}

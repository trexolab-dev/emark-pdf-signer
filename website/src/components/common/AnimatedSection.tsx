/**
 * Animated Section Component
 *
 * A powerful wrapper component that provides scroll-triggered animations
 * with multiple animation styles, easing options, and stagger support.
 */

import type { ElementType, ReactNode, RefObject, CSSProperties } from 'react';
import { useScrollAnimation } from '@/hooks';
import { cn } from '@/utils/utils';

// Animation types available
type AnimationType =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'scale-up'
  | 'scale-down'
  | 'flip-up'
  | 'flip-down'
  | 'flip-left'
  | 'flip-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'rotate'
  | 'rotate-left'
  | 'rotate-right'
  | 'blur'
  | 'blur-up'
  | 'bounce'
  | 'elastic';

// Easing functions
type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce'
  | 'elastic';

interface AnimatedSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  animation?: AnimationType;
  /** @deprecated Use animation prop instead */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
  threshold?: number;
  easing?: EasingType;
  as?: ElementType;
  once?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
  style?: CSSProperties;
}

// Map legacy direction prop to new animation types
const legacyDirectionMap: Record<string, AnimationType> = {
  up: 'fade-up',
  down: 'fade-down',
  left: 'fade-left',
  right: 'fade-right',
  scale: 'scale',
};

// Animation configurations with initial and visible states
const animationConfigs: Record<AnimationType, { initial: string; visible: string; transform?: string }> = {
  // Fade animations
  'fade': {
    initial: 'opacity-0',
    visible: 'opacity-100',
  },
  'fade-up': {
    initial: 'opacity-0 translate-y-10',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-10',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-10',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-10',
    visible: 'opacity-100 translate-x-0',
  },

  // Scale animations
  'scale': {
    initial: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100',
  },
  'scale-up': {
    initial: 'opacity-0 scale-90 translate-y-4',
    visible: 'opacity-100 scale-100 translate-y-0',
  },
  'scale-down': {
    initial: 'opacity-0 scale-110 -translate-y-4',
    visible: 'opacity-100 scale-100 translate-y-0',
  },

  // Flip animations (using CSS custom properties for 3D)
  'flip-up': {
    initial: 'opacity-0 [transform:perspective(1000px)_rotateX(-30deg)]',
    visible: 'opacity-100 [transform:perspective(1000px)_rotateX(0deg)]',
  },
  'flip-down': {
    initial: 'opacity-0 [transform:perspective(1000px)_rotateX(30deg)]',
    visible: 'opacity-100 [transform:perspective(1000px)_rotateX(0deg)]',
  },
  'flip-left': {
    initial: 'opacity-0 [transform:perspective(1000px)_rotateY(30deg)]',
    visible: 'opacity-100 [transform:perspective(1000px)_rotateY(0deg)]',
  },
  'flip-right': {
    initial: 'opacity-0 [transform:perspective(1000px)_rotateY(-30deg)]',
    visible: 'opacity-100 [transform:perspective(1000px)_rotateY(0deg)]',
  },

  // Zoom animations
  'zoom-in': {
    initial: 'opacity-0 scale-50',
    visible: 'opacity-100 scale-100',
  },
  'zoom-out': {
    initial: 'opacity-0 scale-150',
    visible: 'opacity-100 scale-100',
  },

  // Slide animations (larger distance)
  'slide-up': {
    initial: 'opacity-0 translate-y-20',
    visible: 'opacity-100 translate-y-0',
  },
  'slide-down': {
    initial: 'opacity-0 -translate-y-20',
    visible: 'opacity-100 translate-y-0',
  },
  'slide-left': {
    initial: 'opacity-0 translate-x-20',
    visible: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    initial: 'opacity-0 -translate-x-20',
    visible: 'opacity-100 translate-x-0',
  },

  // Rotate animations
  'rotate': {
    initial: 'opacity-0 rotate-12',
    visible: 'opacity-100 rotate-0',
  },
  'rotate-left': {
    initial: 'opacity-0 -rotate-12 scale-95',
    visible: 'opacity-100 rotate-0 scale-100',
  },
  'rotate-right': {
    initial: 'opacity-0 rotate-12 scale-95',
    visible: 'opacity-100 rotate-0 scale-100',
  },

  // Blur animations
  'blur': {
    initial: 'opacity-0 blur-sm',
    visible: 'opacity-100 blur-0',
  },
  'blur-up': {
    initial: 'opacity-0 blur-sm translate-y-8',
    visible: 'opacity-100 blur-0 translate-y-0',
  },

  // Bounce animation
  'bounce': {
    initial: 'opacity-0 scale-75 translate-y-8',
    visible: 'opacity-100 scale-100 translate-y-0',
  },

  // Elastic animation
  'elastic': {
    initial: 'opacity-0 scale-50',
    visible: 'opacity-100 scale-100',
  },
};

// CSS easing functions
const easingMap: Record<EasingType, string> = {
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
};

export function AnimatedSection({
  children,
  id,
  className,
  animation,
  direction, // Legacy support
  delay = 0,
  duration = 700,
  threshold = 0.1,
  easing = 'ease-out',
  as: Component = 'section',
  once = true,
  stagger = false,
  staggerDelay = 100,
  style,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold, triggerOnce: once });

  // Resolve animation type (support legacy direction prop)
  const resolvedAnimation: AnimationType = animation || (direction ? legacyDirectionMap[direction] : 'fade-up');
  const config = animationConfigs[resolvedAnimation];

  // Build transition style
  const transitionStyle: CSSProperties = {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: easingMap[easing],
    transitionDelay: `${delay}ms`,
    ...style,
  };

  // Stagger children styles
  const staggerClass = stagger ? 'stagger-children' : '';

  return (
    <Component
      ref={ref as RefObject<HTMLElement>}
      id={id}
      className={cn(
        isVisible ? config.visible : config.initial,
        staggerClass,
        className
      )}
      style={transitionStyle}
      data-animation={resolvedAnimation}
      data-visible={isVisible}
    >
      {stagger ? (
        <>
          {Array.isArray(children)
            ? children.map((child, index) => (
                <div
                  key={index}
                  style={{
                    transitionDelay: `${delay + index * staggerDelay}ms`,
                    transitionProperty: 'opacity, transform',
                    transitionDuration: `${duration}ms`,
                    transitionTimingFunction: easingMap[easing],
                  }}
                  className={cn(
                    'transition-all',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                >
                  {child}
                </div>
              ))
            : children}
        </>
      ) : (
        children
      )}
    </Component>
  );
}

// Preset components for common use cases
export function FadeIn(props: Omit<AnimatedSectionProps, 'animation'>) {
  return <AnimatedSection animation="fade" {...props} />;
}

export function FadeUp(props: Omit<AnimatedSectionProps, 'animation'>) {
  return <AnimatedSection animation="fade-up" {...props} />;
}

export function FadeDown(props: Omit<AnimatedSectionProps, 'animation'>) {
  return <AnimatedSection animation="fade-down" {...props} />;
}

export function ScaleIn(props: Omit<AnimatedSectionProps, 'animation'>) {
  return <AnimatedSection animation="scale" easing="spring" {...props} />;
}

export function SlideUp(props: Omit<AnimatedSectionProps, 'animation'>) {
  return <AnimatedSection animation="slide-up" {...props} />;
}

export function BlurIn(props: Omit<AnimatedSectionProps, 'animation'>) {
  return <AnimatedSection animation="blur-up" {...props} />;
}

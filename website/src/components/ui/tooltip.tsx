/**
 * Tooltip Component
 *
 * A custom tooltip with glass morphism styling and smooth animations.
 * Supports multiple positions, custom delays, and optional arrow.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/utils';
import { ANIMATION } from '@/utils/constants';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** The content to display inside the tooltip */
  content: ReactNode;
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Position of the tooltip relative to the trigger */
  position?: TooltipPosition;
  /** Delay before showing the tooltip (ms) */
  delay?: number;
  /** Whether to show an arrow pointing to the trigger */
  showArrow?: boolean;
  /** Additional class names for the tooltip */
  className?: string;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Maximum width of the tooltip */
  maxWidth?: number;
  /** Offset from the trigger element (px) */
  offset?: number;
}

interface TooltipContentProps {
  content: ReactNode;
  position: TooltipPosition;
  triggerRect: DOMRect;
  showArrow: boolean;
  className?: string;
  maxWidth: number;
  offset: number;
  isVisible: boolean;
}

function TooltipContent({
  content,
  position,
  triggerRect,
  showArrow,
  className,
  maxWidth,
  offset,
  isVisible,
}: TooltipContentProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<CSSProperties>({});
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalPosition = position;
    let top = 0;
    let left = 0;

    // Calculate initial position
    const calculatePosition = (pos: TooltipPosition) => {
      switch (pos) {
        case 'top':
          return {
            top: triggerRect.top - tooltipRect.height - offset,
            left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
          };
        case 'bottom':
          return {
            top: triggerRect.bottom + offset,
            left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
          };
        case 'left':
          return {
            top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
            left: triggerRect.left - tooltipRect.width - offset,
          };
        case 'right':
          return {
            top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
            left: triggerRect.right + offset,
          };
      }
    };

    // Check if position fits in viewport and adjust if needed
    const initialPos = calculatePosition(position);
    top = initialPos.top;
    left = initialPos.left;

    // Flip position if it doesn't fit
    if (position === 'top' && top < 0) {
      finalPosition = 'bottom';
      const newPos = calculatePosition('bottom');
      top = newPos.top;
      left = newPos.left;
    } else if (position === 'bottom' && top + tooltipRect.height > viewportHeight) {
      finalPosition = 'top';
      const newPos = calculatePosition('top');
      top = newPos.top;
      left = newPos.left;
    } else if (position === 'left' && left < 0) {
      finalPosition = 'right';
      const newPos = calculatePosition('right');
      top = newPos.top;
      left = newPos.left;
    } else if (position === 'right' && left + tooltipRect.width > viewportWidth) {
      finalPosition = 'left';
      const newPos = calculatePosition('left');
      top = newPos.top;
      left = newPos.left;
    }

    // Constrain to viewport boundaries
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));

    setAdjustedPosition(finalPosition);
    setCoords({
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [triggerRect, position, offset]);

  // Animation classes based on position
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-out';
    if (!isVisible) {
      switch (adjustedPosition) {
        case 'top':
          return `${baseClasses} opacity-0 translate-y-1`;
        case 'bottom':
          return `${baseClasses} opacity-0 -translate-y-1`;
        case 'left':
          return `${baseClasses} opacity-0 translate-x-1`;
        case 'right':
          return `${baseClasses} opacity-0 -translate-x-1`;
      }
    }
    return `${baseClasses} opacity-100 translate-x-0 translate-y-0`;
  };

  // Arrow position styles
  const getArrowStyles = (): CSSProperties => {
    const arrowSize = 6;
    switch (adjustedPosition) {
      case 'top':
        return {
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        };
      case 'bottom':
        return {
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        };
      case 'left':
        return {
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
        };
      case 'right':
        return {
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
        };
    }
  };

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      className={cn(
        'fixed z-[9999] pointer-events-none',
        getAnimationClasses()
      )}
      style={coords}
    >
      <div
        className={cn(
          'relative px-3 py-2 text-sm text-slate-200 rounded-lg',
          'backdrop-blur-xl border border-slate-700/50',
          'bg-slate-900/90 shadow-xl shadow-black/20',
          'ring-1 ring-white/5',
          className
        )}
        style={{ maxWidth }}
      >
        {content}

        {/* Arrow */}
        {showArrow && (
          <div
            className="absolute w-3 h-3 bg-slate-900/90 border-slate-700/50"
            style={{
              ...getArrowStyles(),
              borderWidth: '1px',
              borderTopColor: adjustedPosition === 'bottom' ? 'rgba(51, 65, 85, 0.5)' : 'transparent',
              borderLeftColor: adjustedPosition === 'right' ? 'rgba(51, 65, 85, 0.5)' : 'transparent',
              borderRightColor: adjustedPosition === 'left' ? 'rgba(51, 65, 85, 0.5)' : 'transparent',
              borderBottomColor: adjustedPosition === 'top' ? 'rgba(51, 65, 85, 0.5)' : 'transparent',
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = ANIMATION.transitionFast,
  showArrow = true,
  className,
  disabled = false,
  maxWidth = 250,
  offset = 8,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTriggerRect = useCallback(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateTriggerRect();
      setIsOpen(true);
      // Trigger visibility after a frame to allow for enter animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);
  }, [delay, disabled, updateTriggerRect]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    // Wait for exit animation before unmounting
    hideTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => updateTriggerRect();

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, updateTriggerRect]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isOpen && triggerRect && (
        <TooltipContent
          content={content}
          position={position}
          triggerRect={triggerRect}
          showArrow={showArrow}
          className={className}
          maxWidth={maxWidth}
          offset={offset}
          isVisible={isVisible}
        />
      )}
    </>
  );
}

/**
 * Simple tooltip wrapper for common use cases
 */
interface SimpleTooltipProps {
  text: string;
  children: ReactNode;
  position?: TooltipPosition;
}

export function SimpleTooltip({ text, children, position = 'top' }: SimpleTooltipProps) {
  return (
    <Tooltip content={text} position={position}>
      {children}
    </Tooltip>
  );
}

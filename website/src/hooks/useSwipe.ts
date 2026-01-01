import { useState, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance to trigger swipe
  preventDefaultOnSwipe?: boolean;
}

interface UseSwipeReturn {
  handlers: SwipeHandlers;
  swiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  offset: { x: number; y: number };
}

export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultOnSwipe = false,
  } = options;

  const [swiping, setSwiping] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    setSwiping(true);
    setDirection(null);
    setOffset({ x: 0, y: 0 });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;

    touchEnd.current = { x: currentX, y: currentY };

    const diffX = touchStart.current.x - currentX;
    const diffY = touchStart.current.y - currentY;

    setOffset({ x: -diffX, y: -diffY });

    // Determine direction while swiping
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDirection(diffX > 0 ? 'left' : 'right');
    } else {
      setDirection(diffY > 0 ? 'up' : 'down');
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || !touchEnd.current) {
      setSwiping(false);
      setDirection(null);
      setOffset({ x: 0, y: 0 });
      return;
    }

    const diffX = touchStart.current.x - touchEnd.current.x;
    const diffY = touchStart.current.y - touchEnd.current.y;

    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);

    if (isHorizontalSwipe) {
      if (Math.abs(diffX) >= threshold) {
        if (diffX > 0) {
          // Swiped left
          if (preventDefaultOnSwipe) e.preventDefault();
          onSwipeLeft?.();
        } else {
          // Swiped right
          if (preventDefaultOnSwipe) e.preventDefault();
          onSwipeRight?.();
        }
      }
    } else {
      if (Math.abs(diffY) >= threshold) {
        if (diffY > 0) {
          // Swiped up
          if (preventDefaultOnSwipe) e.preventDefault();
          onSwipeUp?.();
        } else {
          // Swiped down
          if (preventDefaultOnSwipe) e.preventDefault();
          onSwipeDown?.();
        }
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
    setSwiping(false);
    setDirection(null);
    setOffset({ x: 0, y: 0 });
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventDefaultOnSwipe]);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    swiping,
    direction,
    offset,
  };
}

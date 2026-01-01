/**
 * Hook for 3D card tilt effect on mouse move
 * Also tracks mouse position for glow effects
 */

import { useState, useCallback, useRef } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface GlowPosition {
  x: number;
  y: number;
}

interface UseCardTiltOptions {
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  transitionDuration?: number;
}

interface UseCardTiltReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  style: React.CSSProperties;
  glowPosition: GlowPosition;
  isHovered: boolean;
  handlers: {
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave: () => void;
    onMouseEnter: () => void;
  };
}

export function useCardTilt(options: UseCardTiltOptions = {}): UseCardTiltReturn {
  const { maxTilt = 10, scale = 1.02, perspective = 1000, transitionDuration = 150 } = options;

  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, scale: 1 });
  const [glowPosition, setGlowPosition] = useState<GlowPosition>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTilt({ rotateX, rotateY, scale });
    setGlowPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
    setGlowPosition({ x: 50, y: 50 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const style: React.CSSProperties = {
    transform: `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${transitionDuration}ms ease-out`,
    transformStyle: 'preserve-3d',
  };

  return {
    ref,
    style,
    glowPosition,
    isHovered,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
  };
}

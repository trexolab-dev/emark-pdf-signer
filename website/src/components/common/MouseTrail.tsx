/**
 * Premium Custom Cursor for eMark
 *
 * Ultra-smooth, minimal, professional cursor design
 * inspired by high-end design tools and luxury brands.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Smooth spring physics for natural motion
class Spring {
  position: number;
  velocity: number;
  target: number;
  stiffness: number;
  damping: number;

  constructor(initial = 0, stiffness = 0.15, damping = 0.8) {
    this.position = initial;
    this.velocity = 0;
    this.target = initial;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update() {
    const force = (this.target - this.position) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.position += this.velocity;
    return this.position;
  }

  set(value: number) {
    this.target = value;
  }

  snap(value: number) {
    this.position = value;
    this.target = value;
    this.velocity = 0;
  }
}

// Configuration
const CONFIG = {
  dotSize: 8,
  ringSize: 40,
  ringStroke: 1.5,
  trailLength: 12,
  trailOpacity: 0.15,
  colors: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    success: '#22c55e',
  },
};

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotX = useRef(new Spring(-100, 0.2, 0.75));
  const dotY = useRef(new Spring(-100, 0.2, 0.75));
  const ringX = useRef(new Spring(-100, 0.08, 0.82));
  const ringY = useRef(new Spring(-100, 0.08, 0.82));
  const ringScale = useRef(new Spring(1, 0.12, 0.7));
  const dotScale = useRef(new Spring(1, 0.15, 0.7));
  const trailPoints = useRef<Array<{ x: number; y: number }>>([]);
  const particles = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    color: string;
  }>>([]);
  const frameId = useRef(0);
  const isVisible = useRef(true);
  const isHovering = useRef(false);
  const mousePos = useRef({ x: -100, y: -100 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const triggerCelebration = useCallback((x: number, y: number) => {
    const colors = [CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.accent, CONFIG.colors.success, '#ffffff'];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 2 + Math.random() * 4;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    dotX.current.set(e.clientX);
    dotY.current.set(e.clientY);
    ringX.current.set(e.clientX);
    ringY.current.set(e.clientY);
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLElement;
    const interactive = el.matches('a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"]), .cursor-pointer')
      || el.closest('a, button, [role="button"]');

    isHovering.current = !!interactive;
    ringScale.current.set(interactive ? 1.5 : 1);
    dotScale.current.set(interactive ? 0.5 : 1);
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLElement;
    const isDownload = el.closest('[href*="download"], [href*="releases"], .btn-gradient')
      || el.textContent?.toLowerCase().includes('download');

    if (isDownload) {
      triggerCelebration(e.clientX, e.clientY);
    }

    // Click pulse effect
    ringScale.current.snap(0.8);
    ringScale.current.set(isHovering.current ? 1.5 : 1);
  }, [triggerCelebration]);

  const handleMouseEnter = useCallback(() => {
    dotX.current.snap(mousePos.current.x);
    dotY.current.snap(mousePos.current.y);
    ringX.current.snap(mousePos.current.x);
    ringY.current.snap(mousePos.current.y);
  }, []);

  const handleVisibility = useCallback(() => {
    isVisible.current = !document.hidden;
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    const render = () => {
      if (!isVisible.current) {
        frameId.current = requestAnimationFrame(render);
        return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Update spring physics
      const dx = dotX.current.update();
      const dy = dotY.current.update();
      const rx = ringX.current.update();
      const ry = ringY.current.update();
      const rScale = ringScale.current.update();
      const dScale = dotScale.current.update();

      // Skip if off-screen
      if (dx < -50 && dy < -50) {
        frameId.current = requestAnimationFrame(render);
        return;
      }

      // Update trail
      const speed = Math.sqrt(
        Math.pow(dx - (trailPoints.current[0]?.x || dx), 2) +
        Math.pow(dy - (trailPoints.current[0]?.y || dy), 2)
      );

      if (speed > 1) {
        trailPoints.current.unshift({ x: dx, y: dy });
        if (trailPoints.current.length > CONFIG.trailLength) {
          trailPoints.current.pop();
        }
      }

      // Draw trail (subtle dotted path)
      if (trailPoints.current.length > 1) {
        for (let i = 1; i < trailPoints.current.length; i++) {
          const point = trailPoints.current[i];
          const progress = i / trailPoints.current.length;
          const alpha = (1 - progress) * CONFIG.trailOpacity;
          const size = (1 - progress * 0.5) * 2;

          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(14, 165, 233, ${alpha})`;
          ctx.fill();
        }
      }

      // Draw outer ring
      const ringSize = CONFIG.ringSize * rScale;

      // Ring glow
      const ringGlow = ctx.createRadialGradient(rx, ry, ringSize * 0.8, rx, ry, ringSize * 1.3);
      ringGlow.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      ringGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(rx, ry, ringSize * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = ringGlow;
      ctx.fill();

      // Ring stroke
      ctx.beginPath();
      ctx.arc(rx, ry, ringSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = isHovering.current
        ? 'rgba(14, 165, 233, 0.6)'
        : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = CONFIG.ringStroke;
      ctx.stroke();

      // Draw center dot
      const dotSize = CONFIG.dotSize * dScale;

      // Dot glow
      const dotGlow = ctx.createRadialGradient(dx, dy, 0, dx, dy, dotSize * 3);
      dotGlow.addColorStop(0, 'rgba(14, 165, 233, 0.3)');
      dotGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
      dotGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(dx, dy, dotSize * 3, 0, Math.PI * 2);
      ctx.fillStyle = dotGlow;
      ctx.fill();

      // Main dot with gradient
      const dotGradient = ctx.createRadialGradient(
        dx - dotSize * 0.3,
        dy - dotSize * 0.3,
        0,
        dx,
        dy,
        dotSize
      );
      dotGradient.addColorStop(0, '#ffffff');
      dotGradient.addColorStop(0.4, CONFIG.colors.primary);
      dotGradient.addColorStop(1, CONFIG.colors.secondary);

      ctx.beginPath();
      ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = dotGradient;
      ctx.fill();

      // Dot highlight
      ctx.beginPath();
      ctx.arc(dx - dotSize * 0.25, dy - dotSize * 0.25, dotSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();

      // Draw hover indicator (checkmark appears when hovering interactive elements)
      if (isHovering.current && rScale > 1.2) {
        const checkAlpha = Math.min((rScale - 1.2) / 0.3, 1);
        const checkSize = 6;
        const checkX = rx + ringSize / 2 - 2;
        const checkY = ry - ringSize / 2 + 2;

        ctx.save();
        ctx.globalAlpha = checkAlpha;

        // Checkmark background
        ctx.beginPath();
        ctx.arc(checkX, checkY, 8, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.colors.success;
        ctx.fill();

        // Checkmark stroke
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(checkX - checkSize * 0.35, checkY);
        ctx.lineTo(checkX - checkSize * 0.05, checkY + checkSize * 0.3);
        ctx.lineTo(checkX + checkSize * 0.35, checkY - checkSize * 0.25);
        ctx.stroke();

        ctx.restore();
      }

      // Update and draw particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.98;
        p.life -= 0.02;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        const alpha = p.life;
        const size = p.size * p.life;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      frameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('visibilitychange', handleVisibility);

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(frameId.current);
    };
  }, [isTouch, handleMouseMove, handleMouseOver, handleClick, handleMouseEnter, handleVisibility]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-9998"
      aria-hidden="true"
    />
  );
}

export default MouseTrail;

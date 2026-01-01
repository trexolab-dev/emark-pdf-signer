import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  Download,
  Grid3X3,
  Layers,
  BookOpen,
  Play,
  Pause,
  MousePointer2,
  Hand,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { diagrams, categoryLabels, diagramCategoryColors as categoryColors, type Diagram } from '@/data/diagrams';
import { SEO, structuredDataGenerators } from '@/components/common';

// Zoom controls configuration
const ZOOM_CONFIG = {
  min: 0.25,
  max: 5,
  step: 0.25,
  scrollStep: 0.1,
  default: 1,
};

// Custom hook for zoom and pan functionality
function useZoomPan(initialZoom = ZOOM_CONFIG.default) {
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const reset = useCallback(() => {
    setZoom(ZOOM_CONFIG.default);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_CONFIG.step, ZOOM_CONFIG.max));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - ZOOM_CONFIG.step, ZOOM_CONFIG.min);
      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    const clampedZoom = Math.max(ZOOM_CONFIG.min, Math.min(level, ZOOM_CONFIG.max));
    setZoom(clampedZoom);
    if (clampedZoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  // Zoom at mouse position (for double-click)
  const zoomAtPoint = useCallback((delta: number, clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    setZoom((prevZoom) => {
      const newZoom = Math.max(ZOOM_CONFIG.min, Math.min(prevZoom + delta, ZOOM_CONFIG.max));

      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
        return newZoom;
      }

      // Calculate the point under cursor in image space (before zoom)
      setPosition((prevPos) => {
        const pointX = (mouseX - containerCenterX - prevPos.x) / prevZoom;
        const pointY = (mouseY - containerCenterY - prevPos.y) / prevZoom;

        // After zoom, keep the same point under the cursor
        const newPosX = mouseX - containerCenterX - pointX * newZoom;
        const newPosY = mouseY - containerCenterY - pointY * newZoom;

        return { x: newPosX, y: newPosY };
      });

      return newZoom;
    });
  }, []);

  // Mouse wheel handler - use native event listener to properly prevent page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? -ZOOM_CONFIG.scrollStep : ZOOM_CONFIG.scrollStep;

      const rect = container.getBoundingClientRect();
      // Mouse position relative to container center
      const containerCenterX = rect.width / 2;
      const containerCenterY = rect.height / 2;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setZoom((prevZoom) => {
        const newZoom = Math.max(ZOOM_CONFIG.min, Math.min(prevZoom + delta, ZOOM_CONFIG.max));

        if (newZoom <= 1) {
          setPosition({ x: 0, y: 0 });
          return newZoom;
        }

        // Calculate the point under cursor in image space (before zoom)
        setPosition((prevPos) => {
          // Point under cursor relative to image center (accounting for current pan)
          const pointX = (mouseX - containerCenterX - prevPos.x) / prevZoom;
          const pointY = (mouseY - containerCenterY - prevPos.y) / prevZoom;

          // After zoom, keep the same point under the cursor
          const newPosX = mouseX - containerCenterX - pointX * newZoom;
          const newPosY = mouseY - containerCenterY - pointY * newZoom;

          return { x: newPosX, y: newPosY };
        });

        return newZoom;
      });
    };

    // Add with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // Mouse down handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double click handler
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (zoom === 1) {
      zoomAtPoint(1, e.clientX, e.clientY);
    } else {
      reset();
    }
  }, [zoom, zoomAtPoint, reset]);

  // Touch handlers for mobile
  const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance,
      };
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - touchStartRef.current.x;
      const newY = e.touches[0].clientY - touchStartRef.current.y;
      setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 2 && touchStartRef.current.distance) {
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = newDistance / touchStartRef.current.distance;
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setZoom((prev) => Math.max(ZOOM_CONFIG.min, Math.min(prev * scale, ZOOM_CONFIG.max)));
      touchStartRef.current.distance = newDistance;
      touchStartRef.current.x = centerX;
      touchStartRef.current.y = centerY;
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    setIsDragging(false);
  }, []);

  return {
    zoom,
    position,
    isDragging,
    containerRef,
    imageRef,
    reset,
    zoomIn,
    zoomOut,
    setZoomLevel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

// Thumbnail component
function DiagramThumbnail({
  diagram,
  isActive,
  onClick,
}: {
  diagram: Diagram;
  isActive: boolean;
  onClick: () => void;
}) {
  const colors = categoryColors[diagram.category];

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 w-32 sm:w-40 rounded-xl overflow-hidden transition-all duration-300 group ${
        isActive
          ? 'ring-2 ring-primary scale-105 shadow-lg shadow-primary/30'
          : 'ring-1 ring-slate-700/50 opacity-70 hover:opacity-100 hover:ring-slate-600'
      }`}
    >
      <div className="aspect-[4/3] bg-slate-900/50 p-2">
        <img
          src={diagram.src}
          alt={diagram.title}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
          {categoryLabels[diagram.category]}
        </span>
        <p className="text-xs text-white truncate mt-1">{diagram.title}</p>
      </div>
      {isActive && <div className="absolute inset-0 bg-primary/10" />}
    </button>
  );
}

// Zoom slider component
function ZoomSlider({
  zoom,
  onChange,
  min = ZOOM_CONFIG.min,
  max = ZOOM_CONFIG.max,
}: {
  zoom: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min * 100}
        max={max * 100}
        value={zoom * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-20 sm:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
        style={{
          background: `linear-gradient(to right, rgb(14, 165, 233) 0%, rgb(14, 165, 233) ${((zoom - min) / (max - min)) * 100}%, rgb(51, 65, 85) ${((zoom - min) / (max - min)) * 100}%, rgb(51, 65, 85) 100%)`,
        }}
      />
    </div>
  );
}

// Fullscreen Lightbox component
function DiagramLightbox({
  isOpen,
  diagram,
  onClose,
  onPrev,
  onNext,
  onNavigate,
}: {
  isOpen: boolean;
  diagram: Diagram | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNavigate: (index: number) => void;
}) {
  const {
    zoom,
    position,
    isDragging,
    containerRef,
    reset,
    zoomIn,
    zoomOut,
    setZoomLevel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useZoomPan();

  // Reset on diagram change
  useEffect(() => {
    reset();
  }, [diagram, reset]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrev, onNext, zoomIn, zoomOut, reset]);

  if (!isOpen || !diagram) return null;

  const colors = categoryColors[diagram.category];
  const currentIndex = diagrams.findIndex((d) => d.id === diagram.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      {/* Top toolbar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium">
            {currentIndex + 1} / {diagrams.length}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
            {categoryLabels[diagram.category]}
          </span>
          <span className="text-white/80 text-sm hidden sm:block">{diagram.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
            <button
              onClick={zoomOut}
              disabled={zoom <= ZOOM_CONFIG.min}
              className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <ZoomSlider zoom={zoom} onChange={setZoomLevel} />

            <span className="px-2 text-sm font-mono min-w-14 text-center">{Math.round(zoom * 100)}%</span>

            <button
              onClick={zoomIn}
              disabled={zoom >= ZOOM_CONFIG.max}
              className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              onClick={reset}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              title="Reset zoom (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Download button */}
          <a
            href={diagram.src}
            download={`${diagram.id}.svg`}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Download SVG"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-5 h-5" />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-red-500/50 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
        title="Previous (←)"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
        title="Next (→)"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Pan indicator */}
      {zoom > 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-sm text-white/70">
          <Hand className="w-4 h-4" />
          <span>Drag to pan</span>
        </div>
      )}

      {/* Main image container */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center pt-20 pb-36 px-20 overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          touchAction: 'none',
        }}
      >
        <img
          src={diagram.src}
          alt={diagram.title}
          className="max-w-full max-h-full object-contain bg-white rounded-lg p-4 shadow-2xl"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          draggable={false}
        />
      </div>

      {/* Bottom info and thumbnails */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4 px-4">
          <h3 className="text-lg font-semibold text-white">{diagram.title}</h3>
          <p className="text-sm text-white/60 max-w-2xl mx-auto">{diagram.description}</p>
        </div>

        {/* Thumbnails strip */}
        <div className="flex justify-center gap-3 px-4 overflow-x-auto scrollbar-thin pb-2 mx-auto max-w-4xl">
          {diagrams.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => onNavigate(idx)}
              className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-300 bg-white ${
                d.id === diagram.id
                  ? 'ring-2 ring-primary scale-105 shadow-lg shadow-primary/30'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <img src={d.src} alt={d.title} className="w-full h-full object-contain p-1" loading="lazy" />
            </button>
          ))}
        </div>

        {/* Keyboard hints */}
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-white/40 px-4">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10">→</kbd> Navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10">Scroll</kbd> Zoom at cursor
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10">Double-click</kbd> Toggle zoom
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10">Drag</kbd> Pan
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

// Main viewer component with zoom and pan
function DiagramViewer({
  diagram,
  onOpenFullscreen,
}: {
  diagram: Diagram;
  onOpenFullscreen: () => void;
}) {
  const {
    zoom,
    position,
    isDragging,
    containerRef,
    reset,
    zoomIn,
    zoomOut,
    setZoomLevel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useZoomPan();

  // Reset on diagram change
  useEffect(() => {
    reset();
  }, [diagram, reset]);

  const colors = categoryColors[diagram.category];

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 flex-wrap justify-end">
        {/* Category badge */}
        <span className={`px-2.5 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
          {categoryLabels[diagram.category]}
        </span>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50">
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_CONFIG.min}
            className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <ZoomSlider zoom={zoom} onChange={setZoomLevel} />

          <span className="px-2 text-xs font-mono min-w-12 text-center text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_CONFIG.max}
            className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            onClick={reset}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenFullscreen}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pan/Zoom indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {zoom > 1 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-xs text-slate-400">
            <Hand className="w-3.5 h-3.5" />
            <span>Drag to pan</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-xs text-slate-400">
            <MousePointer2 className="w-3.5 h-3.5" />
            <span>Scroll to zoom</span>
          </div>
        )}
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full bg-white rounded-xl overflow-hidden select-none"
        style={{ minHeight: '450px', maxHeight: '70vh' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-full h-full flex items-center justify-center p-4"
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            minHeight: '450px',
            touchAction: 'none',
          }}
        >
          <img
            src={diagram.src}
            alt={diagram.title}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Info below image */}
      <div className="mt-4 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{diagram.title}</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{diagram.description}</p>
      </div>

      {/* Usage hints */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MousePointer2 className="w-3.5 h-3.5" /> Scroll to zoom at cursor
        </span>
        <span className="flex items-center gap-1">
          <Hand className="w-3.5 h-3.5" /> Drag to pan when zoomed
        </span>
        <span>Double-click for fullscreen</span>
      </div>
    </div>
  );
}

// Main Diagrams page component
export function Diagrams() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: viewerRef, isVisible: viewerVisible } = useScrollAnimation({ threshold: 0.1 });

  const currentDiagram = diagrams[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !lightboxOpen) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % diagrams.length);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, lightboxOpen]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      // Reset autoplay timer
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        if (isAutoPlaying) {
          autoPlayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % diagrams.length);
          }, 5000);
        }
      }
    },
    [isAutoPlaying]
  );

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex === 0 ? diagrams.length - 1 : currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % diagrams.length);
  }, [currentIndex, goToSlide]);

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Structured data for diagrams page
  const imageGalleryStructuredData = structuredDataGenerators.imageGallery(
    diagrams.map((d) => ({
      url: `https://trexolab-dev.github.io/emark-pdf-signer${d.src}`,
      title: d.title,
      description: d.description,
    }))
  );

  const breadcrumbStructuredData = structuredDataGenerators.breadcrumb([
    { name: 'Home', url: 'https://trexolab-dev.github.io/emark-pdf-signer/' },
    { name: 'Architecture Diagrams', url: 'https://trexolab-dev.github.io/emark-pdf-signer/#/diagrams' },
  ]);

  const techArticleStructuredData = structuredDataGenerators.techArticle(
    'eMark PDF Signer Architecture Diagrams - System Design Documentation',
    'Technical architecture diagrams for eMark PDF Signer. Includes system architecture, workflow diagrams, component interaction, and sequence diagrams.',
    'https://trexolab-dev.github.io/emark-pdf-signer/diagrams/System_Architecture_Diagram.svg'
  );

  return (
    <>
      <SEO
        title="Architecture Diagrams - Technical Documentation"
        description="Explore eMark PDF Signer technical architecture and workflow diagrams. System design documentation including component interaction, sequence diagrams, and PDF signing workflow."
        keywords="eMark PDF Signer architecture, system design, technical diagrams, PDF signing workflow, component diagram, sequence diagram, software architecture, UML diagrams"
        url="https://trexolab-dev.github.io/emark-pdf-signer/#/diagrams"
        image="https://trexolab-dev.github.io/emark-pdf-signer/diagrams/System_Architecture_Diagram.svg"
        structuredData={[imageGalleryStructuredData, breadcrumbStructuredData, techArticleStructuredData]}
      />
      <div className="min-h-screen">
        {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative py-20 border-b border-white/10 overflow-hidden transition-all duration-700 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Diagrams</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-violet-500/20 animate-pulse-glow">
                  <Layers className="w-6 h-6 text-violet-400" />
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  Technical Documentation
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="gradient-text">Architecture Diagrams</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                Explore the technical architecture and workflow diagrams of eMark. Use scroll to zoom at cursor position, drag to pan when zoomed.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Grid3X3 className="w-4 h-4 text-violet-400" />
                  <span>{diagrams.length} diagrams</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Interactive viewer</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MousePointer2 className="w-4 h-4 text-emerald-400" />
                  <span>Scroll zoom + Drag pan</span>
                </div>
              </div>
            </div>

            {/* Quick navigation card */}
            <div className="glass-card-premium p-6 lg:min-w-[280px]">
              <p className="text-sm font-medium text-foreground mb-4">Quick Jump</p>
              <div className="space-y-2">
                {diagrams.map((diagram, index) => {
                  const colors = categoryColors[diagram.category];
                  return (
                    <button
                      key={diagram.id}
                      onClick={() => goToSlide(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        index === currentIndex
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${colors.bg.replace('/10', '')}`} />
                      <span className="truncate">{diagram.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          ref={viewerRef}
          className={`transition-all duration-700 ${
            viewerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Slider container */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

            <div className="relative glass-card-premium rounded-2xl p-4 sm:p-6">
              {/* Navigation arrows */}
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-primary/80 hover:border-primary/50 transition-all duration-300"
                aria-label="Previous diagram"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-primary/80 hover:border-primary/50 transition-all duration-300"
                aria-label="Next diagram"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Auto-play toggle */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-primary/80 transition-all duration-300"
                title={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Slide counter */}
              <div className="absolute top-4 right-20 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white text-sm">
                {currentIndex + 1} / {diagrams.length}
              </div>

              {/* Main viewer */}
              <div className="px-8 sm:px-12">
                <DiagramViewer diagram={currentDiagram} onOpenFullscreen={openLightbox} />
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {diagrams.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to diagram ${index + 1}`}
              >
                {index === currentIndex && isAutoPlaying && (
                  <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Thumbnail strip */}
          <div className="mt-6 overflow-x-auto scrollbar-thin pb-2">
            <div className="flex gap-4 justify-center min-w-max px-4">
              {diagrams.map((diagram, index) => (
                <DiagramThumbnail
                  key={diagram.id}
                  diagram={diagram}
                  isActive={index === currentIndex}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <DiagramLightbox
        isOpen={lightboxOpen}
        diagram={currentDiagram}
        onClose={closeLightbox}
        onPrev={goToPrev}
        onNext={goToNext}
        onNavigate={goToSlide}
      />
      </div>
    </>
  );
}

export default Diagrams;

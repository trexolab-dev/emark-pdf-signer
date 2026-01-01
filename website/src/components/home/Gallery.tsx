import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Images,
  Play,
  Pause
} from 'lucide-react';
import { useScrollAnimation, useSwipe } from '@/hooks';
import { galleryImages } from '@/data/gallery';
import { GALLERY_CONFIG } from '@/utils/constants';
import { Tooltip } from '@/components/ui';

// Slider navigation button component
function SliderButton({
  direction,
  onClick
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
}) {
  const tooltipContent = direction === 'prev' ? 'Previous slide' : 'Next slide';
  const tooltipPosition = direction === 'prev' ? 'right' : 'left';

  return (
    <div className={`absolute top-1/2 -translate-y-1/2 z-10 ${direction === 'prev' ? 'left-4' : 'right-4'}`}>
      <Tooltip content={tooltipContent} position={tooltipPosition}>
        <button
          onClick={onClick}
          className="p-3 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-primary/80 hover:border-primary/50 transition-all duration-300 group"
          aria-label={tooltipContent}
        >
          {direction === 'prev' ? (
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}

// Lightbox component with zoom
function Lightbox({
  isOpen,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onIndexChange,
  swipeHandlers,
}: {
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onIndexChange: (index: number) => void;
  swipeHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrev, onNext]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      handleResetZoom();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Top toolbar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-linear-to-b from-black/80 to-transparent"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium">
            {currentIndex + 1} / {galleryImages.length}
          </span>
          <span className="text-white/80 text-sm hidden sm:block">
            {galleryImages[currentIndex].title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
            <Tooltip content="Zoom out (-)" position="bottom" disabled={zoom <= 1}>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </Tooltip>
            <span className="px-2 text-sm font-mono min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip content="Zoom in (+)" position="bottom" disabled={zoom >= 4}>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </Tooltip>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <Tooltip content="Reset zoom (0)" position="bottom">
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Close button */}
          <Tooltip content="Close (Esc)" position="bottom">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Navigation arrows */}
      <Tooltip content="Previous (←)" position="right">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </Tooltip>
      <Tooltip content="Next (→)" position="left">
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </Tooltip>

      {/* Main image container */}
      <div
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center pt-16 pb-28 px-4 sm:px-20 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        {...(zoom === 1 && swipeHandlers ? swipeHandlers : {})}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <img
          src={galleryImages[currentIndex].src}
          alt={galleryImages[currentIndex].title}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Bottom info and thumbnails */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/90 via-black/60 to-transparent pt-8 pb-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Image info */}
        <div className="text-center mb-4 px-4">
          <h3 className="text-lg font-semibold text-white">{galleryImages[currentIndex].title}</h3>
          <p className="text-sm text-white/60">{galleryImages[currentIndex].description}</p>
        </div>

        {/* Thumbnails strip */}
        <div className="flex justify-center gap-2 px-4 overflow-x-auto scrollbar-thin pb-2 mx-auto max-w-4xl">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              onClick={() => onIndexChange(index)}
              className={`relative shrink-0 w-20 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentIndex
                  ? 'ring-2 ring-primary scale-105 shadow-lg shadow-primary/30'
                  : 'opacity-50 hover:opacity-100 hover:scale-102'
              }`}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Gallery() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: sliderContainerRef, isVisible: sliderVisible } = useScrollAnimation({ threshold: 0.1 });

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !lightboxOpen) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % galleryImages.length);
      }, GALLERY_CONFIG.autoPlayInterval);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, lightboxOpen]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    // Reset autoplay timer when manually changing slides
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (isAutoPlaying) {
        autoPlayRef.current = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % galleryImages.length);
        }, GALLERY_CONFIG.autoPlayInterval);
      }
    }
  }, [isAutoPlaying]);

  const goToPrevSlide = useCallback(() => {
    goToSlide(currentSlide === 0 ? galleryImages.length - 1 : currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const goToNextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % galleryImages.length);
  }, [currentSlide, goToSlide]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const lightboxPrev = () => {
    setLightboxIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const lightboxNext = () => {
    setLightboxIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Touch/swipe support for slider
  const { handlers: sliderSwipeHandlers, swiping, offset } = useSwipe({
    onSwipeLeft: goToNextSlide,
    onSwipeRight: goToPrevSlide,
    threshold: 50,
  });

  // Touch/swipe support for lightbox
  const { handlers: lightboxSwipeHandlers } = useSwipe({
    onSwipeLeft: lightboxNext,
    onSwipeRight: lightboxPrev,
    onSwipeDown: closeLightbox,
    threshold: 50,
  });

  return (
    <section id="gallery" className="py-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-900/30 to-transparent" />
      <div className="absolute inset-0 particle-grid opacity-20" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-8 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20 text-primary text-sm font-medium mb-6">
            <Images className="w-4 h-4" />
            <span>Visual Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-text">Screenshot Gallery</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Explore eMark's intuitive interface and powerful features through our interactive gallery.
          </p>
        </div>

        {/* Featured Slider */}
        <div
          ref={sliderContainerRef}
          className={`relative transition-all duration-1000 ${
            sliderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Main slider container */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

            <div
              ref={sliderRef}
              className="relative glass-card-premium rounded-2xl overflow-hidden touch-pan-y"
              {...sliderSwipeHandlers}
            >
              {/* Slider track - using original images at full height */}
              <div
                className={`flex transition-transform ${swiping ? 'duration-0' : 'duration-700'} ease-out`}
                style={{
                  transform: `translateX(calc(-${currentSlide * 100}% + ${swiping ? offset.x : 0}px))`,
                }}
              >
                {galleryImages.map((image, index) => (
                  <div
                    key={image.src}
                    className="w-full shrink-0 relative cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    {/* Full height image container */}
                    <div className="relative w-full" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-contain bg-slate-950/50"
                        style={{ minHeight: '500px', maxHeight: '70vh' }}
                        loading={index <= 2 ? 'eager' : 'lazy'}
                      />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                        <Maximize2 className="w-5 h-5" />
                        <span className="font-medium">Click to expand</span>
                      </div>
                    </div>
                    {/* Image info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                      <h3 className="text-xl font-semibold text-white mb-1">{image.title}</h3>
                      <p className="text-white/70 text-sm">{image.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <SliderButton direction="prev" onClick={goToPrevSlide} />
              <SliderButton direction="next" onClick={goToNextSlide} />

              {/* Play/Pause button */}
              <div className="absolute top-4 right-4 z-10">
                <Tooltip content={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'} position="left">
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="p-2 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-primary/80 transition-all duration-300"
                  >
                    {isAutoPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Current slide indicator */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white text-sm">
                {currentSlide + 1} / {galleryImages.length}
              </div>
            </div>
          </div>

          {/* Slider indicators */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentSlide && isAutoPlaying && (
                  <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Thumbnail strip under slider */}
          <div className="mt-4 overflow-x-auto scrollbar-thin pb-2">
            <div className="flex gap-3 justify-center min-w-max px-4">
              {galleryImages.map((image, index) => (
                <button
                  key={image.src}
                  onClick={() => goToSlide(index)}
                  className={`relative shrink-0 w-24 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                    index === currentSlide
                      ? 'ring-2 ring-primary scale-105 shadow-lg shadow-primary/30'
                      : 'opacity-60 hover:opacity-100 ring-1 ring-slate-700/50 hover:ring-slate-600'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {index === currentSlide && (
                    <div className="absolute inset-0 bg-primary/10" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onPrev={lightboxPrev}
        onNext={lightboxNext}
        onIndexChange={setLightboxIndex}
        swipeHandlers={lightboxSwipeHandlers}
      />
    </section>
  );
}

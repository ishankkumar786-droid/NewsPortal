'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ArticleImageItem {
  url?: string;
  alt?: string;
  caption?: string;
}

interface ArticleImageSliderProps {
  images: ArticleImageItem[];
  articleTitle: string;
  className?: string;
}

export function ArticleImageSlider({ images, articleTitle, className = '' }: ArticleImageSliderProps) {
  const validImages = images.filter(
    (img): img is ArticleImageItem & { url: string } => Boolean(img && img.url)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = validImages.length;

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Keyboard navigation when focused
  useEffect(() => {
    if (total <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total, goToPrev, goToNext]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      // Swiped left -> next
      goToNext();
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> prev
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) return null;

  // Single Image View (no slider needed)
  if (total === 1) {
    const singleImg = validImages[0];
    return (
      <figure
        className={cn('mb-6', className)}
        itemProp="image"
        itemScope
        itemType="https://schema.org/ImageObject"
      >
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-sm">
          <Image
            src={singleImg.url}
            alt={singleImg.alt || articleTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            itemProp="url"
          />
        </div>
        {singleImg.caption && (
          <figcaption className="text-sm text-muted-foreground text-center mt-2.5">
            {singleImg.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <figure
      className={cn('mb-6 group/slider', className)}
      itemProp="image"
      itemScope
      itemType="https://schema.org/ImageObject"
    >
      <div
        className="relative aspect-video rounded-xl overflow-hidden bg-black/90 shadow-md select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding images container */}
        <div
          className="flex w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {validImages.map((img, idx) => (
            <div key={img.url + idx} className="relative w-full h-full flex-shrink-0">
              <Image
                src={img.url}
                alt={img.alt || `${articleTitle} - Image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority={idx === 0}
                itemProp={idx === 0 ? 'url' : undefined}
              />
            </div>
          ))}
        </div>

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-xs font-medium border border-white/10 shadow-sm">
          <Images className="h-3.5 w-3.5" />
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={goToPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Bottom Indicator Dots */}
        <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-2">
          {validImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus:outline-none',
                currentIndex === idx
                  ? 'w-6 bg-white shadow-sm'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Caption for the currently active slide */}
      {currentImage.caption ? (
        <figcaption className="text-sm text-muted-foreground text-center mt-2.5 transition-all">
          {currentImage.caption}
        </figcaption>
      ) : (
        <figcaption className="text-xs text-muted-foreground/75 text-center mt-2 flex items-center justify-center gap-1">
          <span>
            Image {currentIndex + 1} of {total}
          </span>
          {currentIndex === 0 ? <span>(Primary Cover)</span> : <span>(Secondary)</span>}
        </figcaption>
      )}
    </figure>
  );
}

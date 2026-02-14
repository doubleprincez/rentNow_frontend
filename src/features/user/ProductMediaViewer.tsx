'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Apartment, Image, Video } from '@/types/apartment';
import VideoPlayer from './VideoPlayer';
import ImageDisplay from './ImageDisplay';
import ProductInfoPanel from './ProductInfoPanel';
import ProductInfoOverlay from './ProductInfoOverlay';
import ProgressIndicator from './ProgressIndicator';
import ErrorBoundary from './ErrorBoundary';
import NetworkStatus from './NetworkStatus';
import {
  supportsScrollSnap,
  getScrollSnapStyles,
  getMediaItemStyles,
  scrollToMediaItem
} from './scrollSnapDetection';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Props for the ProductMediaViewer component
 */
export interface ProductMediaViewerProps {
  apartment: Apartment;
  isLoggedIn: boolean;
  isSubscribed: boolean;
  token?: string;
}

/**
 * Represents a single media item (video or image) in the viewer
 */
export interface MediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
}

/**
 * Internal state management for the viewer component
 */
export interface ViewerState {
  currentMediaIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  isInfoExpanded: boolean; // Mobile only
  mediaItems: MediaItem[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Prepares and orders media items from apartment data
 * Videos are placed before images as per requirements
 * 
 * @param apartment - The apartment data containing videos and images
 * @returns Array of MediaItem objects ordered with videos first, then images
 */
export function prepareMediaItems(apartment: Apartment): MediaItem[] {
  const videos: MediaItem[] = apartment.videos
    ? Object.values(apartment.videos).map((video: Video, index: number) => ({
      id: `video-${index}`,
      type: 'video' as const,
      url: video.original_url,
      thumbnail: video.preview_url
    }))
    : [];

  const images: MediaItem[] = apartment.images
    ? Object.values(apartment.images).map((image: Image, index: number) => ({
      id: `image-${index}`,
      type: 'image' as const,
      url: image.original_url,
      thumbnail: image.preview_url
    }))
    : [];

  // Videos first, then images (Requirement 6.3)
  return [...videos, ...images];
}

/**
 * Gets media items or returns a fallback placeholder if no media exists
 * Handles edge cases where apartments have no videos or images
 * 
 * @param apartment - The apartment data
 * @returns Array of MediaItem objects, or placeholder if empty
 */
export function getMediaOrFallback(apartment: Apartment): MediaItem[] {
  const media = prepareMediaItems(apartment);

  // Handle empty media case (Requirement 6.4, 6.5)
  if (media.length === 0) {
    return [{
      id: 'placeholder',
      type: 'image',
      url: '/empty.png',
      thumbnail: '/empty.png'
    }];
  }

  return media;
}

// ============================================================================
// MediaItem Component (Memoized)
// ============================================================================

/**
 * Props for MediaItem component
 */
interface MediaItemComponentProps {
  item: MediaItem;
  index: number;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  shouldRender: boolean;
}

/**
 * MediaItem - Individual media item component (video or image)
 * Memoized to prevent unnecessary re-renders (Requirement 2.5)
 * 
 * Requirements: 2.5
 */
const MediaItemComponent = React.memo(function MediaItemComponent({
  item,
  index,
  isActive,
  isMuted,
  onMuteToggle,
  shouldRender
}: MediaItemComponentProps): JSX.Element {
  return (
    <div
      className="media-item h-full w-full bg-black"
      role="group"
      aria-label={`Media item ${index + 1}`}
      aria-roledescription={item.type === 'video' ? 'video' : 'image'}
    >
      {/* Lazy load: Only render media for visible + adjacent items */}
      {shouldRender ? (
        <>
          {/* Render VideoPlayer for videos, ImageDisplay for images */}
          {item.type === 'video' ? (
            <VideoPlayer
              url={item.url}
              thumbnail={item.thumbnail}
              isActive={isActive}
              isMuted={isMuted}
              onMuteToggle={onMuteToggle}
            />
          ) : (
            <ImageDisplay
              url={item.url}
              alt={`Property image ${index + 1}`}
            />
          )}
        </>
      ) : (
        // Placeholder for non-rendered items (virtual scrolling)
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-gray-500 text-sm" aria-live="polite">Loading...</div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.shouldRender === nextProps.shouldRender
  );
});

// ============================================================================
// MediaContainer Component
// ============================================================================

/**
 * Props for MediaContainer component
 */
interface MediaContainerProps {
  mediaItems: MediaItem[];
  currentMediaIndex: number;
  onMediaIndexChange: (index: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  onScrollStart: () => void;
  onScrollEnd: () => void;
}

/**
 * MediaContainer - Handles vertical scrolling with snap behavior
 * 
 * Features:
 * - CSS Scroll Snap for smooth transitions (Requirement 1.3, 4.4)
 * - Intersection Observer for active media detection (Requirement 4.3)
 * - Throttled scroll event handling for performance (Requirement 4.2)
 * - Keyboard navigation support (Requirement 4.5)
 * 
 * Requirements: 1.3, 4.2, 4.3, 4.4, 4.5
 */
function MediaContainer({
  mediaItems,
  currentMediaIndex,
  onMediaIndexChange,
  isMuted,
  onMuteToggle,
  onScrollStart,
  onScrollEnd
}: MediaContainerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  // Detect Scroll Snap support (Requirement 6.4)
  const [hasScrollSnapSupport, setHasScrollSnapSupport] = useState<boolean>(true);

  useEffect(() => {
    setHasScrollSnapSupport(supportsScrollSnap());
  }, []);

  // Handle single media item case - disable scrolling (Requirement 6.4)
  const isSingleItem = mediaItems.length === 1;

  // ============================================================================
  // Intersection Observer for Active Media Detection
  // ============================================================================

  const isUserScrollingRef = useRef<boolean>(false);
  const observerUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.5, // Media is considered active when 50% visible
      rootMargin: '0px'
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Only update if user is actively scrolling
      if (!isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Find the index of the intersecting media item
          const index = Array.from(mediaRefs.current.entries()).find(
            ([_, element]) => element === entry.target
          )?.[0];

          if (index !== undefined && index !== currentMediaIndex) {
            // Debounce the index change to prevent rapid updates
            if (observerUpdateTimeoutRef.current) {
              clearTimeout(observerUpdateTimeoutRef.current);
            }

            observerUpdateTimeoutRef.current = setTimeout(() => {
              onMediaIndexChange(index);
            }, 100);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all media items
    mediaRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      if (observerUpdateTimeoutRef.current) {
        clearTimeout(observerUpdateTimeoutRef.current);
      }
    };
  }, [currentMediaIndex, onMediaIndexChange]);

  // ============================================================================
  // Performance Monitoring (Requirement 2.5)
  // ============================================================================

  const frameTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number>(0);
  const lastFpsCheckRef = useRef<number>(Date.now());

  const monitorScrollPerformance = useCallback(() => {
    const now = performance.now();
    const delta = now - frameTimeRef.current;
    frameTimeRef.current = now;

    // Track FPS during scrolling
    if (isScrollingRef.current) {
      fpsCounterRef.current++;

      // Check FPS every second
      if (now - lastFpsCheckRef.current >= 1000) {
        const fps = fpsCounterRef.current;

        // Log warning if FPS drops below 60 (for development monitoring)
        if (process.env.NODE_ENV === 'development' && fps < 55) {
          console.warn(`Scroll performance: ${fps} FPS (target: 60 FPS)`);
        }

        fpsCounterRef.current = 0;
        lastFpsCheckRef.current = now;
      }
    }
  }, []);

  // ============================================================================
  // Optimized Scroll Event Handler with requestAnimationFrame
  // ============================================================================

  const handleScroll = useCallback(() => {
    const now = Date.now();
    const throttleDelay = 16; // ~60fps (Requirement 4.2)

    if (now - lastScrollTime.current < throttleDelay) {
      return;
    }

    lastScrollTime.current = now;

    // Use requestAnimationFrame for smooth 60fps performance (Requirement 2.5, 4.2)
    requestAnimationFrame(() => {
      // Monitor scroll performance
      monitorScrollPerformance();

      // Notify scroll start
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        onScrollStart();
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce snap completion (150ms after scroll stops)
      scrollTimeoutRef.current = setTimeout(() => {
        // Scroll has stopped, snap is complete
        isScrollingRef.current = false;
        onScrollEnd();
        // The Intersection Observer will handle index updates
      }, 150);
    });
  }, [onScrollStart, onScrollEnd, monitorScrollPerformance]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // ============================================================================
  // Keyboard Navigation Support - DISABLED TO PREVENT AUTO-SCROLL
  // ============================================================================

  // Keyboard navigation temporarily disabled to troubleshoot auto-scroll issues
  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     // Disable keyboard navigation for single item (Requirement 6.4)
  //     if (isSingleItem) return;
  //     
  //     if (event.key === 'ArrowDown') {
  //       event.preventDefault();
  //       // Navigate to next media item
  //       if (currentMediaIndex < mediaItems.length - 1) {
  //         const nextIndex = currentMediaIndex + 1;
  //         const nextElement = mediaRefs.current.get(nextIndex);
  //         if (nextElement && containerRef.current) {
  //           if (hasScrollSnapSupport) {
  //             nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //           } else {
  //             // Fallback scroll for browsers without Scroll Snap support
  //             scrollToMediaItem(containerRef.current, nextIndex, window.innerHeight);
  //           }
  //         }
  //       }
  //     } else if (event.key === 'ArrowUp') {
  //       event.preventDefault();
  //       // Navigate to previous media item
  //       if (currentMediaIndex > 0) {
  //         const prevIndex = currentMediaIndex - 1;
  //         const prevElement = mediaRefs.current.get(prevIndex);
  //         if (prevElement && containerRef.current) {
  //           if (hasScrollSnapSupport) {
  //             prevElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //           } else {
  //             // Fallback scroll for browsers without Scroll Snap support
  //             scrollToMediaItem(containerRef.current, prevIndex, window.innerHeight);
  //           }
  //         }
  //       }
  //     }
  //   };
  //   
  //   window.addEventListener('keydown', handleKeyDown);
  //   
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [currentMediaIndex, mediaItems.length, isSingleItem, hasScrollSnapSupport]);

  // ============================================================================
  // Virtual Scrolling - Only render visible + adjacent items (Requirement 2.5)
  // ============================================================================

  const shouldRenderMedia = useCallback((index: number): boolean => {
    // Always render current item and adjacent items (current ± 1)
    // This implements virtual scrolling for performance
    return Math.abs(index - currentMediaIndex) <= 1;
  }, [currentMediaIndex]);

  // ============================================================================
  // Video Preloading for Next Item (Requirement 3.1)
  // ============================================================================

  useEffect(() => {
    // Preload next video metadata for faster playback start
    const nextIndex = currentMediaIndex + 1;
    if (nextIndex < mediaItems.length && mediaItems[nextIndex].type === 'video') {
      const nextVideo = document.createElement('video');
      nextVideo.src = mediaItems[nextIndex].url;
      nextVideo.preload = 'metadata';
      // Video element will be garbage collected when no longer needed
    }
  }, [currentMediaIndex, mediaItems]);

  // ============================================================================
  // Reduced Motion Support for Accessibility
  // ============================================================================

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={`media-container h-full w-full bg-black mx-auto ${isSingleItem ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
      role="region"
      aria-label="Media viewer"
      aria-live="polite"
      aria-atomic="false"
      tabIndex={0}
    >
      <style jsx>{`
        .media-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {mediaItems.map((item, index) => {
        const shouldRender = shouldRenderMedia(index);
        const isActive = index === currentMediaIndex;

        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) {
                mediaRefs.current.set(index, el);
              } else {
                mediaRefs.current.delete(index);
              }
            }}
            className="min-h-full w-full flex-shrink-0 bg-black"
            style={{ height: '100%' }}
            data-index={index}
          >
            <MediaItemComponent
              item={item}
              index={index}
              isActive={isActive}
              isMuted={isMuted}
              onMuteToggle={onMuteToggle}
              shouldRender={shouldRender}
            />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProductMediaViewer - TikTok-style vertical scrolling media viewer
 * 
 * This component provides an immersive media viewing experience with:
 * - Vertical scroll navigation through videos and images
 * - Auto-play video functionality
 * - Responsive desktop/mobile layouts
 * - Product information display
 * - All existing apartment functionality (rent, book, chat, like, share)
 * 
 * Requirements: 6.1, 6.3, 6.4, 6.5
 */
export default function ProductMediaViewer({
  apartment,
  isLoggedIn,
  isSubscribed,
  token
}: ProductMediaViewerProps): JSX.Element {
  // ============================================================================
  // State Management
  // ============================================================================

  // Prepare media items on component mount
  const mediaItems = getMediaOrFallback(apartment);

  // Initialize component state (Requirement 6.1)
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isInfoExpanded, setIsInfoExpanded] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Handler for media index changes from MediaContainer
  const handleMediaIndexChange = useCallback((index: number) => {
    setCurrentMediaIndex(index);
  }, []);

  // Handler for mute toggle
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Handler for overlay expand/collapse
  const handleExpandedChange = useCallback((expanded: boolean) => {
    setIsInfoExpanded(expanded);
  }, []);

  // Handler for scroll start (visual feedback)
  const handleScrollStart = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  // Handler for scroll end (visual feedback)
  const handleScrollEnd = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  // ============================================================================
  // Responsive Layout Detection
  // ============================================================================

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile/desktop layout based on breakpoint (667px = md breakpoint)
    const mediaQuery = window.matchMedia('(max-width: 667px)');
    setIsMobile(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  // ============================================================================
  // Component Render
  // ============================================================================

  return (
    <ErrorBoundary>
      <div className="product-media-viewer fixed left-0 right-0 top-[64px] md:top-[75px] bottom-0 w-full overflow-hidden bg-black">
        {/* Network Status Indicator - Shows offline banner (Requirement 3.5, 6.4) */}
        <NetworkStatus />

        {/* Desktop Layout: Side-by-side (Requirement 1.1) */}
        {/* Mobile Layout: Full-screen with overlay (Requirement 2.1) */}
        <div className="flex flex-row h-full w-full">
          {/* MediaContainer with scroll snap functionality */}
          {/* Full width on mobile, 60% on desktop */}
          <div className="w-full md:w-[60%] h-full relative bg-black">
            <ErrorBoundary
              fallback={
                <div className="flex items-center justify-center h-full w-full bg-black">
                  <div className="flex flex-col items-center gap-4 text-white text-center px-4">
                    <div className="text-4xl">⚠️</div>
                    <p className="text-lg font-semibold">Media viewer error</p>
                    <p className="text-sm text-white/70">Unable to display media content</p>
                  </div>
                </div>
              }
            >
              <MediaContainer
                mediaItems={mediaItems}
                currentMediaIndex={currentMediaIndex}
                onMediaIndexChange={handleMediaIndexChange}
                isMuted={isMuted}
                onMuteToggle={handleMuteToggle}
                onScrollStart={handleScrollStart}
                onScrollEnd={handleScrollEnd}
              />
            </ErrorBoundary>
          </div>

          {/* ProductInfoPanel - Fixed sidebar for desktop (hidden on mobile) */}
          {/* Requirement 1.4: Fixed position during media scrolling */}
          <div className="hidden md:block md:w-[40%] h-full">
            <ErrorBoundary
              fallback={
                <div className="flex items-center justify-center h-full w-full bg-gray-900">
                  <div className="flex flex-col items-center gap-4 text-white text-center px-4">
                    <div className="text-4xl">⚠️</div>
                    <p className="text-lg font-semibold">Product info error</p>
                    <p className="text-sm text-white/70">Unable to display product information</p>
                  </div>
                </div>
              }
            >
              <ProductInfoPanel
                apartment={apartment}
                isLoggedIn={isLoggedIn}
                isSubscribed={isSubscribed}
                token={token}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* ProductInfoOverlay - Bottom sheet for mobile (hidden on desktop) */}
        {/* Requirement 2.1, 2.2: Full-screen with overlay on mobile */}
        {isMobile && (
          <ErrorBoundary>
            <ProductInfoOverlay
              apartment={apartment}
              isLoggedIn={isLoggedIn}
              isSubscribed={isSubscribed}
              token={token}
              isExpanded={isInfoExpanded}
              onExpandedChange={handleExpandedChange}
            />
          </ErrorBoundary>
        )}

        {/* Progress Indicator - Shows current position with visual feedback (Requirements 4.1, 4.2) */}
        <ProgressIndicator
          currentIndex={currentMediaIndex}
          totalCount={mediaItems.length}
          isTransitioning={isTransitioning}
        />
      </div>
    </ErrorBoundary>
  );
}
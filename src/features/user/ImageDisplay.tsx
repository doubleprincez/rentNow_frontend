'use client'
import React, { useState, useCallback } from 'react';
import Image from 'next/image';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Props for the ImageDisplay component
 */
export interface ImageDisplayProps {
  url: string;
  alt?: string;
  fallbackUrl?: string;
}

/**
 * ImageDisplay - Renders static images with loading and error handling
 * 
 * Features:
 * - Responsive image sizing to fill viewport height (Requirement 1.5)
 * - Loading states for image loading (Requirement 4.4)
 * - Error handling with fallback placeholder (Requirement 4.4)
 * - Optimized image loading with Next.js Image component
 * - Responsive srcset for optimal image loading (Requirement 2.5)
 * - Memoized for performance optimization (Requirement 2.5)
 * 
 * Requirements: 1.5, 4.4, 2.5
 */
function ImageDisplay({
  url,
  alt = 'Property image',
  fallbackUrl = '/empty.png'
}: ImageDisplayProps): JSX.Element {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Handle successful image load
   * Requirement 4.4: Loading states for image loading
   */
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);
  
  /**
   * Handle image load error with fallback
   * Requirement 4.4: Handle image load errors with fallback placeholder
   */
  const handleError = useCallback(() => {
    if (currentUrl !== fallbackUrl) {
      // Try fallback image
      setCurrentUrl(fallbackUrl);
      setIsLoading(true);
      setHasError(false);
    } else {
      // Fallback also failed
      setIsLoading(false);
      setHasError(true);
    }
  }, [currentUrl, fallbackUrl]);
  
  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <div className="relative w-full h-full bg-black">
      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm">Loading image...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-4 text-white text-center px-4">
            <div className="text-4xl">🖼️</div>
            <p className="text-lg font-semibold">Image unavailable</p>
            <p className="text-sm text-white/70">Unable to load this image</p>
          </div>
        </div>
      )}
      
      {/* Image Element */}
      {!hasError && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={currentUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 667px) 100vw, 60vw"
            onLoad={handleLoad}
            onError={handleError}
            priority={false}
            quality={85}
            loading="lazy"
            aria-label={alt}
          />
        </div>
      )}
    </div>
  );
}

// Memoize ImageDisplay to prevent unnecessary re-renders (Requirement 2.5)
export default React.memo(ImageDisplay, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.url === nextProps.url &&
    prevProps.alt === nextProps.alt &&
    prevProps.fallbackUrl === nextProps.fallbackUrl
  );
});

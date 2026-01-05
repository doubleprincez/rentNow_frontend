/**
 * Scroll Snap Support Detection Utility
 * 
 * Detects browser support for CSS Scroll Snap and provides
 * fallback behavior for unsupported browsers.
 * 
 * Requirement 6.4: Implement fallback for browsers without Scroll Snap support
 */

/**
 * Checks if the browser supports CSS Scroll Snap
 * @returns true if scroll snap is supported, false otherwise
 */
export function supportsScrollSnap(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for CSS.supports API
  if (typeof CSS !== 'undefined' && CSS.supports) {
    return (
      CSS.supports('scroll-snap-type', 'y mandatory') ||
      CSS.supports('scroll-snap-type', 'mandatory')
    );
  }

  // Fallback: Check if the property exists on a test element
  const testElement = document.createElement('div');
  const style = testElement.style as any;
  
  return (
    'scrollSnapType' in style ||
    'webkitScrollSnapType' in style ||
    'msScrollSnapType' in style
  );
}

/**
 * Gets the appropriate scroll snap CSS properties based on browser support
 * @returns CSS properties object for scroll snap or fallback
 */
export function getScrollSnapStyles(): React.CSSProperties {
  const hasSupport = supportsScrollSnap();

  if (hasSupport) {
    return {
      scrollSnapType: 'y mandatory',
      WebkitOverflowScrolling: 'touch'
    };
  }

  // Fallback: Use smooth scrolling without snap
  return {
    WebkitOverflowScrolling: 'touch'
  };
}

/**
 * Gets the appropriate media item CSS properties based on browser support
 * @returns CSS properties object for media items
 */
export function getMediaItemStyles(): React.CSSProperties {
  const hasSupport = supportsScrollSnap();

  if (hasSupport) {
    return {
      scrollSnapAlign: 'start',
      scrollSnapStop: 'normal'
    };
  }

  // Fallback: No snap properties
  return {};
}

/**
 * Programmatically scrolls to a specific media item with fallback behavior
 * @param container - The scroll container element
 * @param index - The index of the media item to scroll to
 * @param itemHeight - The height of each media item (typically viewport height)
 */
export function scrollToMediaItem(
  container: HTMLElement | null,
  index: number,
  itemHeight: number
): void {
  if (!container) return;

  const hasSupport = supportsScrollSnap();
  const targetScrollTop = index * itemHeight;

  if (hasSupport) {
    // Use native scroll with snap
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  } else {
    // Fallback: Manual smooth scroll implementation
    const startScrollTop = container.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const duration = 300; // ms
    const startTime = performance.now();

    function animateScroll(currentTime: number) {
      if (!container) return;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      container.scrollTop = startScrollTop + distance * easeProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }
}

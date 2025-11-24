# Implementation Plan

- [x] 1. Create ProductMediaViewer component structure








  - Create the main ProductMediaViewer component file at `src/features/user/ProductMediaViewer.tsx`
  - Define TypeScript interfaces for component props (ProductMediaViewerProps, ViewerState, MediaItem)
  - Implement the prepareMediaItems function to order videos before images
  - Implement the getMediaOrFallback function for handling empty media cases
  - Set up initial component state management with useState hooks
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [x] 2. Implement MediaContainer with scroll snap functionality




  - Create the MediaContainer component with CSS scroll snap styling
  - Implement scroll event handling with throttling for performance
  - Add Intersection Observer to detect the currently active media item
  - Implement scroll position state management atylcurrentMediaIndex updates
  - Add keyboard navigation support (arrow up/down keys)
  - _Requirements: 1.3, 4.2, 4.3, 4.4, 4.5_

- [x] 3. Build VideoPlayer component with auto-play logic




  - Create VideoPlayer component with video element and ref management
  - Implement Intersection Observer for auto-play/pause based on viewport visibility
  - Add video controls (play/pause overlay, mute/unmute button)
  - Implement loading states and error handling for video playback
  - Ensure only one video plays at a time across all media items
  - Add video buffering indicators
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_





- [x] 4. Create ImageDisplay component






  - Build ImageDisplay component for rendering static images
  - Implement responsive image sizing to fill viewport height



  - Add loading states for image loading
  - Handle image load errors with fallback placeholder
  - _Requirements: 1.5, 4.4_

- [x] 5. Build ProductInfoPanel for desktop layout






  - Create ProductInfoPanel component with fixed positioning for desktop
  - Implement scrollable content area for product details



  - Add all product information sections (title, price, location, amenities, description)
  - Include agent/business information display with subscription-based visibility
  - Add action buttons section (Rent Now, Book Visitation, Chat)
  - Implement like/share controls at the bottom
  - Apply responsive styling to hide below md breakpoint (667px)
  - _Requirements: 1.1, 1.4, 5.1, 5.2, 5.5_

- [x] 6. Build ProductInfoOverlay for mobile layout




  - Create ProductInfoOverlay component with bottom sheet styling
  - Implement collapsed state showing minimal info (title, price, location)
  - Implement expanded state showing full product details
  - Add swipe gesture detection for expand/collapse functionality



  - Add semi-transparent background overlay
  - Ensure action buttons are always accessible in both states
  - Apply responsive styling to show only on mobile (below md breakpoint)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1_

- [x] 7. Implement progress indicator and navigation UI








  - Create progress indicator component showing current position (e.g., "3 / 10")



  - Position indicator in a non-intrusive location (top corner)
  - Add visual feedback during scroll transitions
  - Implement smooth transition animations (300ms duration)
  - _Requirements: 4.1, 4.2_

- [x] 8. Integrate existing functionality from ApartmentClient



  - Port rent booking logic with date selection and duration calculation
  - Port visitation booking logic with datetime picker
  - Integrate chat dialog functionality
  - Implement like/unlike functionality with optimistic updates
  - Add share buttons (Facebook, WhatsApp) with proper URLs
  - Ensure all dialogs (Rent Now, Book Visitation) work within new layout
  - Preserve login redirect logic for unauthenticated users
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
- [x] 9. Update find-homes/[id] page to use ProductMediaViewer





















- [ ] 9. Update find-homes/[id] page to use ProductMediaViewer


  - Modify `src/app/find-homes/[id]/page.tsx` to import ProductMediaViewer
  - Replace ApartmentClient with ProductMediaViewer component
  - Pass apartment data and user state (isLoggedIn, isSubscribed, token) as props
  - Ensure metadata generation remains unchanged
  - Keep Suspense wrapper and loading states
  - _Requirements: 6.2, 6.3_

- [x] 10. Add responsive behavior and mobile optimizations


  - Implement touch swipe gesture support for mobile navigation
  - Add CSS media queries for desktop/mobile layout switching
  - Optimize scroll performance with requestAnimationFrame
  - Implement lazy loading for adjacent media items only
  - Add reduced motion support for accessibility
  - Test and refine breakpoint transitions
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.5, 4.5_

- [x] 11. Implement error handling and edge cases





  - Add error boundaries for component-level error catching
  - Handle video playback errors with retry functionality
  - Implement fallback for browsers without Scroll Snap support
  - Handle single media item case (disable scrolling)
  - Add network error handling with offline indicators
  - Implement timeout handling for slow video loading (10 second max)
  - _Requirements: 3.5, 6.4, 6.5_
-


- [x] 12. Performance optimization and final polish



  - Memoize MediaItem components with React.memo
  - Implement virtual scrolling to render only visible + adjacent items
  - Add video preloading for next item metadata
  - Optimize image loading with responsive srcset
  - Add ARIA labels and keyboard accessibility features
  - Test scroll performance to ensure 60fps
  - Verify video playback starts within 200ms of visibility
  - _Requirements: 2.5, 3.1, 4.2_

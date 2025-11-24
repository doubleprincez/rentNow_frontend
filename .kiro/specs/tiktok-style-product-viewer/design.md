# Design Document

## Overview

The TikTok-style Product Viewer transforms the apartment detail page into an immersive vertical scrolling experience. The design prioritizes video content, implements smooth snap-scrolling mechanics, and provides responsive layouts optimized for both desktop and mobile viewing. The component will be built using React with TypeScript, leveraging existing UI components and the Tailwind CSS design system.

## Architecture

### Component Structure

```
ProductMediaViewer (New Component)
├── MediaContainer
│   ├── MediaItem (Video)
│   │   ├── VideoPlayer
│   │   └── VideoControls
│   └── MediaItem (Image)
│       └── ImageDisplay
├── ProductInfoPanel (Desktop)
│   ├── ProductHeader
│   ├── ProductDetails
│   ├── ActionButtons
│   └── AgentInfo
└── ProductInfoOverlay (Mobile)
    ├── CollapsibleHeader
    ├── ProductDetails
    └── ActionButtons
```

### File Organization

- **New Component**: `src/features/user/ProductMediaViewer.tsx` - Main viewer component
- **Updated Page**: `src/app/find-homes/[id]/page.tsx` - Integration point
- **Existing Dependencies**: 
  - `src/types/apartment.ts` - Type definitions (no changes)
  - `src/features/landing/components/ApartmentClient.tsx` - Reference for business logic
  - UI components from `src/components/ui/`

## Components and Interfaces

### 1. ProductMediaViewer Component

**Purpose**: Main container component that orchestrates the media viewing experience

**Props Interface**:
```typescript
interface ProductMediaViewerProps {
  apartment: Apartment;
  isLoggedIn: boolean;
  isSubscribed: boolean;
  token?: string;
}
```

**State Management**:
```typescript
interface ViewerState {
  currentMediaIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  isInfoExpanded: boolean; // Mobile only
  mediaItems: MediaItem[];
}

interface MediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
}
```

**Key Responsibilities**:
- Combine and order videos before images
- Manage scroll position and active media
- Handle responsive layout switching
- Coordinate video playback state
- Preserve all existing functionality (rent, book, chat, like, share)

### 2. MediaContainer Component

**Purpose**: Handles vertical scrolling and snap behavior

**Implementation Details**:
- Uses CSS Scroll Snap for smooth transitions
- Implements Intersection Observer API for detecting active media
- Manages scroll event throttling for performance
- Provides swipe gesture support on touch devices

**CSS Strategy**:
```css
.media-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.media-item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  height: 100vh;
}
```

### 3. VideoPlayer Component

**Purpose**: Handles video playback with auto-play/pause logic

**Features**:
- Auto-play when in viewport (using Intersection Observer)
- Auto-pause when scrolled away
- Muted by default with unmute control
- Loading states and error handling
- Play/pause overlay controls

**Playback Logic**:
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      });
    },
    { threshold: 0.5 }
  );
  
  if (videoRef.current) {
    observer.observe(videoRef.current);
  }
  
  return () => observer.disconnect();
}, []);
```

### 4. ProductInfoPanel (Desktop)

**Purpose**: Fixed sidebar displaying product information on desktop

**Layout**:
- Fixed position on right side (40% width)
- Scrollable content area for long descriptions
- All action buttons visible
- Agent information section
- Like/share controls at bottom

**Responsive Breakpoint**: Hidden below `md` (667px)

### 5. ProductInfoOverlay (Mobile)

**Purpose**: Collapsible overlay for product information on mobile

**Behavior**:
- Initially shows minimal info (title, price, location)
- Swipe up to expand full details
- Swipe down to collapse
- Semi-transparent background for media visibility
- Action buttons always accessible

**States**:
- Collapsed: 25% of screen height (bottom)
- Expanded: 80% of screen height (bottom sheet style)

## Data Models

### MediaItem Processing

Transform apartment data into ordered media array:

```typescript
function prepareMediaItems(apartment: Apartment): MediaItem[] {
  const videos: MediaItem[] = apartment.videos 
    ? Object.values(apartment.videos).map((video, index) => ({
        id: `video-${index}`,
        type: 'video',
        url: video.original_url,
        thumbnail: video.preview_url
      }))
    : [];
  
  const images: MediaItem[] = apartment.images
    ? Object.values(apartment.images).map((image, index) => ({
        id: `image-${index}`,
        type: 'image',
        url: image.preview_url,
        thumbnail: image.preview_url
      }))
    : [];
  
  // Videos first, then images
  return [...videos, ...images];
}
```

### Fallback Handling

```typescript
function getMediaOrFallback(apartment: Apartment): MediaItem[] {
  const media = prepareMediaItems(apartment);
  
  if (media.length === 0) {
    return [{
      id: 'placeholder',
      type: 'image',
      url: '/placeholder.jpg',
      thumbnail: '/placeholder.jpg'
    }];
  }
  
  return media;
}
```

## Error Handling

### Video Playback Errors

1. **Network Errors**: Display retry button with error message
2. **Format Errors**: Skip to next media item automatically
3. **Loading Timeout**: Show loading indicator for max 10 seconds, then error state

### Scroll Performance

1. **Throttle scroll events**: Maximum 60fps (16ms intervals)
2. **Debounce snap completion**: 150ms after scroll stops
3. **Lazy load media**: Load adjacent items only (current ± 1)

### Edge Cases

1. **No Media**: Display placeholder image with full product info
2. **Single Media**: Disable scroll, show as static view
3. **Network Interruption**: Cache current media, show offline indicator
4. **Browser Compatibility**: Fallback to standard scrolling if Scroll Snap unsupported

## Testing Strategy

### Unit Tests

1. **Media Processing**:
   - Test video/image ordering
   - Test empty media handling
   - Test data transformation

2. **State Management**:
   - Test media index updates
   - Test playback state transitions
   - Test overlay expand/collapse

### Integration Tests

1. **Scroll Behavior**:
   - Test snap-to-item functionality
   - Test swipe gesture recognition
   - Test keyboard navigation (arrow keys)

2. **Video Playback**:
   - Test auto-play on scroll
   - Test pause on scroll away
   - Test single video playing at a time

3. **Responsive Layout**:
   - Test desktop sidebar layout
   - Test mobile overlay layout
   - Test breakpoint transitions

### User Interaction Tests

1. **Action Buttons**:
   - Test "Rent Now" dialog flow
   - Test "Book Visitation" dialog flow
   - Test chat dialog opening
   - Test like/unlike functionality
   - Test share functionality

2. **Media Controls**:
   - Test video mute/unmute
   - Test video play/pause overlay
   - Test progress indicator updates

### Performance Tests

1. **Scroll Performance**: Maintain 60fps during scrolling
2. **Video Loading**: Start playback within 200ms of visibility
3. **Memory Management**: No memory leaks with multiple videos
4. **Initial Load**: Component renders within 500ms

## Implementation Notes

### Existing Functionality Preservation

All existing features from `ApartmentClient.tsx` must be preserved:
- Rent booking with date selection and duration calculation
- Visitation booking with datetime picker
- Chat dialog with agent
- Like/unlike with optimistic updates
- Share buttons (Facebook, WhatsApp)
- Agent/business information display
- Subscription-based contact info visibility
- Login redirect for unauthenticated users

### Accessibility Considerations

1. **Keyboard Navigation**: Arrow keys for media navigation
2. **Screen Readers**: Proper ARIA labels for media items and controls
3. **Focus Management**: Maintain focus visibility during interactions
4. **Video Captions**: Support for video captions if available
5. **Reduced Motion**: Respect `prefers-reduced-motion` for animations

### Browser Compatibility

- **Target Browsers**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **Scroll Snap**: Widely supported, fallback to standard scroll
- **Intersection Observer**: Polyfill for older browsers if needed
- **Video Autoplay**: Handle autoplay policy restrictions

### Performance Optimizations

1. **Virtual Scrolling**: Only render visible + adjacent media items
2. **Image Optimization**: Use responsive images with srcset
3. **Video Preloading**: Preload next video metadata only
4. **Debounced Scroll**: Throttle scroll event handlers
5. **Memoization**: Memoize media item components with React.memo

## Design Decisions and Rationales

### Why Scroll Snap over Custom Scroll Logic?

CSS Scroll Snap provides native, performant scrolling with minimal JavaScript. It handles momentum scrolling, accessibility, and works across devices without complex gesture detection.

### Why Intersection Observer for Video Playback?

Intersection Observer is the most performant way to detect element visibility. It's passive, doesn't block the main thread, and provides precise visibility ratios for triggering playback.

### Why Separate Desktop/Mobile Components?

Desktop and mobile layouts have fundamentally different interaction patterns. Separate components allow for cleaner code, easier maintenance, and better performance by avoiding unnecessary conditional rendering.

### Why Videos Before Images?

Videos provide richer content and are typically the primary selling point for properties. Prioritizing them ensures users see the most engaging content first, matching TikTok/Shorts user expectations.

### Why Fixed Info Panel on Desktop?

Keeping product information visible while scrolling through media reduces cognitive load and allows users to reference details without interrupting their browsing flow.

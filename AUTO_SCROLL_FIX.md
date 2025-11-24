# Auto-Scroll Fix

## Problem
The media viewer was scrolling automatically by itself without user interaction. This was caused by overly aggressive scroll snap settings and smooth scroll behavior.

## Root Causes

1. **`scrollBehavior: 'smooth'`** - Applied to the scroll container, causing any programmatic scroll adjustments to animate smoothly, which could trigger continuous scrolling
2. **`scrollSnapStop: 'always'`** - Too aggressive, forcing the browser to snap to every item even during momentum scrolling
3. **Combination Effect** - These settings together caused the browser to continuously adjust scroll position

## Solutions

### 1. Removed Smooth Scroll Behavior
**File**: `src/features/user/scrollSnapDetection.ts`

```tsx
// Before
return {
  scrollSnapType: 'y mandatory',
  scrollBehavior: 'smooth',  // ← Removed
  WebkitOverflowScrolling: 'touch'
};

// After
return {
  scrollSnapType: 'y mandatory',
  WebkitOverflowScrolling: 'touch'
};
```

**Why**: `scrollBehavior: 'smooth'` can cause the browser to continuously animate scroll adjustments, leading to auto-scrolling behavior.

### 2. Changed scrollSnapStop to 'normal'
**File**: `src/features/user/scrollSnapDetection.ts`

```tsx
// Before
return {
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always'  // ← Too aggressive
};

// After
return {
  scrollSnapAlign: 'start',
  scrollSnapStop: 'normal'  // ← More natural
};
```

**Why**: `scrollSnapStop: 'always'` forces the browser to stop at every snap point, which can cause jerky behavior and auto-scrolling. `'normal'` allows natural momentum scrolling.

### 3. Removed Inline scrollBehavior Override
**File**: `src/features/user/ProductMediaViewer.tsx`

```tsx
// Before
<div style={{
  ...getScrollSnapStyles(),
  scrollBehavior: prefersReducedMotion ? 'auto' : 'smooth'  // ← Removed
}}>

// After
<div style={{
  ...getScrollSnapStyles()
}}>
```

**Why**: This was overriding the scroll snap styles and forcing smooth behavior even after we removed it from the utility function.

## How Scroll Snap Works Now

### Scroll Snap Configuration
```css
/* Container */
scroll-snap-type: y mandatory;
-webkit-overflow-scrolling: touch;

/* Items */
scroll-snap-align: start;
scroll-snap-stop: normal;
```

### Behavior
- **User scrolls**: Natural scroll with momentum
- **Scroll ends**: Snaps to nearest item
- **No auto-scroll**: Only responds to user input
- **Smooth snapping**: Natural deceleration to snap point

## Scroll Snap Stop Values

### 'always' (Previous - Too Aggressive)
```
User scrolls down
  ↓
Item 1 → STOP → Item 2 → STOP → Item 3
         ↑              ↑
    Forced stop    Forced stop
```
- Forces stop at every snap point
- Prevents momentum scrolling
- Can cause auto-scrolling as browser tries to enforce stops

### 'normal' (Current - Natural)
```
User scrolls down with momentum
  ↓
Item 1 → Item 2 → Item 3 → Natural stop at Item 4
                            ↑
                    Snaps to nearest when momentum ends
```
- Allows natural momentum scrolling
- Snaps to nearest item when scroll ends
- No forced stops or auto-scrolling

## User Experience Now

### Desktop
1. User scrolls with mouse wheel or trackpad
2. Scroll has natural momentum
3. When scroll stops, snaps to nearest item
4. No auto-scrolling or jerky behavior

### Mobile
1. User swipes up/down
2. Natural touch momentum
3. Snaps to item when swipe ends
4. Smooth, TikTok-like experience

### Keyboard
1. User presses Arrow Up/Down
2. Programmatic scroll to next/previous item
3. Uses `scrollIntoView()` for smooth transition
4. No interference with natural scrolling

## Benefits

1. **No Auto-Scrolling**: Viewer only scrolls when user interacts
2. **Natural Feel**: Momentum scrolling feels native
3. **Smooth Snapping**: Items snap naturally at end of scroll
4. **Better UX**: More like TikTok and other social media apps
5. **Accessible**: Works well with all input methods

## Testing Checklist

### Auto-Scroll Prevention
- [ ] Page loads: No auto-scrolling
- [ ] After interaction: No continuous scrolling
- [ ] Idle state: Stays on current item
- [ ] Video plays: No scroll triggered
- [ ] Video ends: No scroll triggered

### Natural Scrolling
- [ ] Mouse wheel: Natural momentum
- [ ] Trackpad swipe: Natural momentum
- [ ] Touch swipe: Natural momentum
- [ ] Keyboard arrows: Smooth transition
- [ ] All methods: Snaps to item at end

### Snap Behavior
- [ ] Scroll stops: Snaps to nearest item
- [ ] Fast scroll: Can skip items (momentum)
- [ ] Slow scroll: Snaps to next item
- [ ] No jerky stops during scroll
- [ ] Smooth deceleration to snap point

### Edge Cases
- [ ] Single item: No scrolling
- [ ] First item: Can't scroll up
- [ ] Last item: Can't scroll down
- [ ] Rapid scrolling: Handles gracefully
- [ ] Scroll during video: No conflicts

## Technical Details

### CSS Scroll Snap
- **Type**: `y mandatory` - Vertical snapping required
- **Align**: `start` - Snap to start of each item
- **Stop**: `normal` - Natural momentum scrolling
- **Behavior**: Native browser scroll (no smooth override)

### JavaScript Scroll
- **Keyboard**: Uses `scrollIntoView({ behavior: 'smooth' })`
- **Programmatic**: Only triggered by user keyboard input
- **Intersection Observer**: Detects active item, doesn't trigger scroll
- **No Auto-Scroll**: No timers or automatic scroll triggers

## Browser Compatibility

- ✅ Chrome/Edge - Full support
- ✅ Firefox - Full support
- ✅ Safari - Full support
- ✅ All modern browsers with scroll snap

## Related Files
- `src/features/user/scrollSnapDetection.ts` - Scroll snap utilities
- `src/features/user/ProductMediaViewer.tsx` - Main viewer component
- `src/features/user/VideoPlayer.tsx` - Video playback
- `src/features/user/ImageDisplay.tsx` - Image display

## Related Fixes
- **VERTICAL_SCROLL_FIX.md** - Initial scroll snap setup
- **DESKTOP_NAVIGATION_FIX.md** - Navigation indicators
- **MEDIA_VIEWER_POSITIONING_FIX.md** - Container positioning

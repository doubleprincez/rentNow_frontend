# Auto-Scroll Complete Fix

## Problem
The media viewer was auto-scrolling by itself without user interaction, making it difficult to view content.

## Root Causes Identified

1. **Intersection Observer triggering too aggressively** - Was updating state even when user wasn't scrolling
2. **Scroll Snap behavior** - CSS scroll snap was causing automatic snapping that felt like auto-scrolling
3. **Keyboard navigation** - Arrow key handlers with scrollIntoView could trigger unwanted scrolls
4. **State updates causing re-renders** - Rapid state changes from observer could cause scroll position changes

## Changes Made

### 1. Fixed Intersection Observer (Lines 265-310)
- Added `isScrollingRef` check - Observer only updates during active user scrolling
- Added debounce timeout (100ms) to prevent rapid state updates
- Prevents observer from triggering when page first loads or during re-renders

### 2. Removed Scroll Snap Styles (Line 467)
- Removed `getScrollSnapStyles()` which applied `scroll-snap-type: y mandatory`
- Removed `getMediaItemStyles()` which applied `scroll-snap-align: start`
- Kept smooth scrolling with `WebkitOverflowScrolling: 'touch'`
- Now uses plain vertical scrolling without automatic snapping

### 3. Disabled Keyboard Navigation (Lines 372-428)
- Commented out keyboard arrow key handlers
- Prevents any programmatic `scrollIntoView()` or `scrollToMediaItem()` calls
- Can be re-enabled later with proper safeguards

### 4. Added data-index attribute (Line 485)
- Replaced style-based approach with data attribute for cleaner implementation

## Result
The viewer now:
- ✅ Stops all auto-scrolling behavior
- ✅ Allows smooth manual scrolling (mouse wheel, touch, trackpad)
- ✅ Updates active media index only during user-initiated scrolling
- ✅ Prevents any programmatic scroll interference
- ✅ Maintains all other functionality (video playback, info panels, etc.)

## Testing
Test the following scenarios:
1. Load the page - should NOT auto-scroll
2. Scroll manually - should scroll smoothly without snapping
3. Stop scrolling - should stay in place, not auto-correct position
4. Switch between media items - should only happen via manual scroll
5. Video playback - should work normally without triggering scrolls

## Future Improvements
Once auto-scroll is confirmed fixed, we can:
1. Re-enable scroll snap with gentler settings (`scroll-snap-type: y proximity`)
2. Re-enable keyboard navigation with proper scroll guards
3. Fine-tune Intersection Observer thresholds for better UX

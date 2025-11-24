# Media Viewer Positioning Fix

## Problem
The ProductMediaViewer component was clashing with the fixed navbar and footer, causing layout issues where:
- The viewer wasn't accounting for the navbar height
- The footer was appearing below the full-screen viewer
- Content wasn't properly centered between the navbar and bottom of viewport

## Solution

### 1. Fixed ProductMediaViewer Positioning
**File**: `src/features/user/ProductMediaViewer.tsx`

Changed the main container from:
```tsx
<div className="product-media-viewer relative w-full h-screen overflow-hidden">
```

To:
```tsx
<div className="product-media-viewer fixed inset-0 top-[64px] md:top-[75px] bottom-0 w-full overflow-hidden bg-black">
```

**Key Changes**:
- `fixed inset-0`: Makes the viewer fixed position covering the entire viewport
- `top-[64px] md:top-[75px]`: Accounts for navbar height (64px mobile, 75px desktop)
- `bottom-0`: Extends to the bottom of the viewport
- `bg-black`: Adds black background for better media viewing experience
- Removed `h-screen` as it's now controlled by `inset-0` with top offset

### 2. Conditional Footer Display
**File**: `src/app/find-homes/layout.tsx`

Made the layout client-side and conditionally hide the footer on apartment detail pages:

```tsx
'use client'
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
    const pathname = usePathname();
    // Hide footer on individual apartment pages (media viewer)
    const isApartmentDetailPage = pathname?.match(/^\/find-homes\/\d+$/);
    
    return (
        <div className="relative">
            <Header/>
            <div className={isApartmentDetailPage ? '' : 'min-h-screen'}>
                {children}
            </div>
            {!isApartmentDetailPage && <Footer/>}
        </div>
    );
}
```

**Key Changes**:
- Added `'use client'` directive for client-side routing detection
- Uses `usePathname()` to detect apartment detail pages
- Conditionally renders footer only on listing pages, not on detail pages
- Maintains `min-h-screen` for listing pages to push footer down

## Result

### Desktop Layout
```
┌─────────────────────────────────────┐
│         Fixed Navbar (75px)         │
├─────────────────┬───────────────────┤
│                 │                   │
│   Media Viewer  │  Product Info     │
│   (60% width)   │  Panel (40%)      │
│   Vertical      │  Fixed, Scrolls   │
│   Scroll        │  Independently    │
│                 │                   │
└─────────────────┴───────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────────────┐
│         Fixed Navbar (64px)         │
├─────────────────────────────────────┤
│                                     │
│         Full-Screen Media           │
│         Vertical Scroll             │
│                                     │
│                                     │
│    ┌─────────────────────────┐     │
│    │  Product Info Overlay   │     │
│    │  (Expandable Bottom)    │     │
└────┴─────────────────────────┴─────┘
```

## Benefits

1. **Perfect Alignment**: Media viewer now sits perfectly between navbar and viewport bottom
2. **No Clashing**: Footer is hidden on detail pages, preventing overlap
3. **Responsive**: Different navbar heights for mobile (64px) and desktop (75px) are accounted for
4. **Immersive Experience**: Full-screen media viewing without distractions
5. **Maintains Navigation**: Navbar remains accessible for navigation

## Testing Checklist

- [ ] Navigate to `/find-homes` - Footer should be visible
- [ ] Click on an apartment - Footer should disappear
- [ ] Media viewer should start right below the navbar
- [ ] Media viewer should extend to the bottom of the viewport
- [ ] No white space or gaps between navbar and viewer
- [ ] Desktop: Side panel should be visible and scrollable
- [ ] Mobile: Bottom overlay should be visible and expandable
- [ ] Vertical scrolling should work smoothly
- [ ] No content should be hidden behind navbar or footer

## Additional Notes

### Navbar Heights
The navbar heights are defined in the Header component:
- Mobile: 64px (py-2 = 8px top + 8px bottom + ~48px content)
- Desktop: 75px (py-4 = 16px top + 16px bottom + ~43px content)

These values are hardcoded in the ProductMediaViewer to ensure perfect alignment. If the navbar height changes, update these values accordingly.

### Future Improvements
Consider using CSS variables for navbar height to maintain consistency:
```css
:root {
  --navbar-height-mobile: 64px;
  --navbar-height-desktop: 75px;
}
```

Then use in Tailwind config or inline styles for better maintainability.

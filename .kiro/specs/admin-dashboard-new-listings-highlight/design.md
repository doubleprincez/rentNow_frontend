# Design Document: Admin Dashboard New Listings Highlight

## Overview

This feature enhances the existing admin dashboard apartment listing view to make newly uploaded properties easily identifiable and prioritized. The system builds upon the existing `isRecentlyUploaded` utility and sorting functionality, adding visual indicators, improved filtering, and better UX for admins to quickly identify and approve new listings.

## Current State Analysis

### Existing Implementation

The system already has:
- ✅ `isRecentlyUploaded()` utility function (checks if created within 48 hours)
- ✅ "Recent First" toggle button in ViewApartments component
- ✅ Backend sorting support via `sort=created_at&order=desc` query parameter
- ✅ Basic "Recently Uploaded" badge display
- ✅ Pagination support

### Gaps to Address

- ❌ No visual distinction between "NEW" (< 24 hours) and "RECENT" (24-48 hours)
- ❌ No "URGENT" indicator for listings pending > 48 hours
- ❌ No date range filters (Last 24 Hours, Last 7 Days, Last 30 Days)
- ❌ No timestamp display showing "2 hours ago" format
- ❌ No count of filtered results
- ❌ Backend doesn't default to newest-first sorting

## Architecture

### High-Level Flow

```
Admin Views Apartments List
    ↓
Backend Returns Apartments (Sorted by created_at DESC by default)
    ↓
Frontend Applies Visual Indicators
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│                 │                 │                 │
< 24 hours    24-48 hours      > 48 hours (unpublished)
│                 │                 │
"NEW" Badge   "RECENT" Badge   "URGENT" Badge
Green          Blue             Red/Orange
```

### Component Updates

**ViewApartments.tsx** (Existing - Enhanced):
- Add date range filter dropdown
- Enhance badge system with three states
- Add relative timestamp display
- Add filtered results count
- Improve visual hierarchy

**Backend API** (Existing - Enhanced):
- Default sorting to newest-first
- Add date range filter support
- Return metadata (total, filtered count)

## Components and Interfaces

### 1. Enhanced ViewApartments Component

**Location**: `src/features/admin/dashboard/components/ViewApartments.tsx`

**New State**:
```typescript
interface ViewApartmentsState {
  apartments: Apartment[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  selectedApartment: Apartment | null;
  sortByRecent: boolean;
  dateFilter: 'all' | '24h' | '7d' | '30d'; // NEW
  filteredCount: number; // NEW
}
```

**New Props/Filters**:
```typescript
interface DateFilterOption {
  value: 'all' | '24h' | '7d' | '30d';
  label: string;
  description: string;
}

const dateFilterOptions: DateFilterOption[] = [
  { value: 'all', label: 'All Time', description: 'Show all apartments' },
  { value: '24h', label: 'Last 24 Hours', description: 'Show new uploads' },
  { value: '7d', label: 'Last 7 Days', description: 'Show recent uploads' },
  { value: '30d', label: 'Last 30 Days', description: 'Show this month' },
];
```

### 2. Enhanced Badge System

**Location**: `src/lib/apartment-utils.ts`

**New Functions**:
```typescript
/**
 * Gets the badge type for an apartment based on creation time and publish status
 */
export type BadgeType = 'new' | 'recent' | 'urgent' | 'none';

export interface ApartmentBadgeInfo {
  type: BadgeType;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}

export const getApartmentBadge = (
  createdAt: string | undefined,
  published: boolean
): ApartmentBadgeInfo => {
  if (!createdAt) {
    return { type: 'none', label: '', variant: 'outline', className: '' };
  }

  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  // URGENT: Unpublished for more than 48 hours
  if (!published && diffInHours > 48) {
    return {
      type: 'urgent',
      label: 'URGENT',
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 border-red-300',
    };
  }

  // NEW: Less than 24 hours old
  if (diffInHours <= 24) {
    return {
      type: 'new',
      label: 'NEW',
      variant: 'default',
      className: 'bg-green-100 text-green-800 border-green-300',
    };
  }

  // RECENT: Between 24-48 hours old
  if (diffInHours <= 48) {
    return {
      type: 'recent',
      label: 'RECENT',
      variant: 'secondary',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  }

  return { type: 'none', label: '', variant: 'outline', className: '' };
};

/**
 * Formats a timestamp to relative time (e.g., "2 hours ago", "1 day ago")
 */
export const formatRelativeTime = (timestamp: string | undefined): string => {
  if (!timestamp) return 'Unknown';

  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};
```

### 3. Backend API Enhancements

**Location**: `rentnow_back/app/Classes/Repositories/Apartments/ApartmentRepository.php`

**Enhanced getApartments Method**:
```php
public function getApartments(Request $request)
{
    $model = $this->model->with($this->with);

    // Search functionality (existing)
    if ($request->has('search')) {
        $search = $request->get('search');
        $model = $model->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', '%' . $search . '%')
                ->orWhere('description', 'LIKE', '%' . $search . '%')
                ->orWhereHas('tags', function ($q2) use ($search) {
                    $q2->where('name', 'LIKE', '%' . $search . '%');
                });
        });
    }

    // Date range filter (NEW)
    if ($request->has('date_filter')) {
        $filter = $request->get('date_filter');
        $now = now();
        
        switch ($filter) {
            case '24h':
                $model = $model->where('created_at', '>=', $now->subHours(24));
                break;
            case '7d':
                $model = $model->where('created_at', '>=', $now->subDays(7));
                break;
            case '30d':
                $model = $model->where('created_at', '>=', $now->subDays(30));
                break;
        }
    }

    // Sorting (Enhanced - default to newest first)
    $sortField = $request->get('sort', 'created_at');
    $sortOrder = $request->get('order', 'desc');
    $model = $model->orderBy($sortField, $sortOrder);

    // Get total count before pagination
    $totalCount = $model->count();

    // Pagination
    $perPage = $request->get('per_page', 12);
    $result = $model->paginate($perPage);

    // Add metadata
    $result->appends([
        'total_count' => $totalCount,
        'filtered_count' => $result->total(),
    ]);

    return $this->custom_paginator(
        $result->items()->map->formatData(),
        $perPage,
        $request->get('page') ?? 1
    );
}
```

### 4. Frontend API Service Enhancement

**Location**: `src/features/admin/dashboard/api/get-all-apartments.ts`

**Enhanced Function**:
```typescript
export const getAllApartments = async (
  page: number = 1,
  search: string = '',
  adminToken: string | null | undefined = null,
  sortByRecent: boolean = false,
  dateFilter: 'all' | '24h' | '7d' | '30d' = 'all' // NEW
) => {
  try {
    let token: string | null | undefined = adminToken;

    if (!token) {
      token = getFormData('adminToken');
    }

    const sortParam = sortByRecent ? '&sort=created_at&order=desc' : '';
    const dateParam = dateFilter !== 'all' ? `&date_filter=${dateFilter}` : '';
    
    const response = await axios.get<ApiResponse>(
      baseURL + `/apartments?page=${page}&search=${search}${sortParam}${dateParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## UI/UX Enhancements

### 1. Filter Bar Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Search Input]  [Date Filter ▼]  [Recent First Toggle]     │
│                                                               │
│  Showing 15 of 150 apartments                                │
└─────────────────────────────────────────────────────────────┘
```

### 2. Table Row Visual Hierarchy

**NEW Listing (< 24 hours)**:
- Green "NEW" badge
- Subtle green background tint on row
- Bold title text
- Relative timestamp: "2 hours ago"

**RECENT Listing (24-48 hours)**:
- Blue "RECENT" badge
- Normal row styling
- Regular title text
- Relative timestamp: "1 day ago"

**URGENT Listing (> 48 hours unpublished)**:
- Red "URGENT" badge
- Subtle red/orange background tint
- Bold title text
- Relative timestamp: "3 days ago"
- Pulsing animation on badge

### 3. Badge Component Styling

```typescript
<Badge 
  variant={badgeInfo.variant}
  className={`${badgeInfo.className} text-xs font-semibold flex items-center gap-1`}
>
  {badgeInfo.type === 'new' && <Sparkles className="h-3 w-3" />}
  {badgeInfo.type === 'urgent' && <AlertCircle className="h-3 w-3 animate-pulse" />}
  {badgeInfo.type === 'recent' && <Clock className="h-3 w-3" />}
  {badgeInfo.label}
</Badge>
```

## Data Models

### Frontend Types (Enhanced)

```typescript
export interface Apartment {
  id: number;
  agent: string;
  agent_email: string;
  category: string;
  title: string;
  description: string;
  number_of_rooms: string;
  amount: string;
  duration: string;
  state_code: string;
  published: boolean;
  can_rate: boolean;
  city_code: string;
  created_at: string;
  new: boolean;
  images: Record<string, {
    preview_url: string;
    original_url: string;
  }>;
  videos: Record<string, {
    original_url: string;
  }>;
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filtered_count?: number; // NEW
  total_count?: number; // NEW
  data: Record<string, Apartment>;
}
```

## Performance Considerations

### Database Optimization

**Add Index on created_at**:
```sql
ALTER TABLE apartments ADD INDEX idx_created_at (created_at DESC);
ALTER TABLE apartments ADD INDEX idx_published_created (published, created_at DESC);
```

### Frontend Optimization

- Memoize badge calculations with `useMemo`
- Debounce search input (300ms)
- Cache filter results in React Query
- Virtualize table rows for large datasets (future enhancement)

## Error Handling

### Backend Errors

- Invalid date_filter parameter: Return 400 with error message
- Database query timeout: Return 503 with retry suggestion
- Missing authentication: Return 401 with redirect to login

### Frontend Errors

- API failure: Show error alert with retry button
- Empty results: Show "No apartments found" message
- Network timeout: Show offline indicator

## Testing Strategy

### Unit Tests

**apartment-utils.ts**:
- `getApartmentBadge()` returns correct badge for each time range
- `formatRelativeTime()` formats timestamps correctly
- Edge cases: null/undefined timestamps, future dates

**ViewApartments Component**:
- Date filter changes trigger API call
- Badge displays correctly for each apartment type
- Filtered count updates correctly

### Integration Tests

**Admin Dashboard Flow**:
1. Admin logs in
2. Navigates to view apartments
3. Sees newest listings at top by default
4. Applies "Last 24 Hours" filter
5. Sees only new listings with green badges
6. Clicks on listing to view details
7. Publishes listing
8. Badge updates/disappears

### E2E Tests

**Complete Workflow**:
1. Agent creates new apartment
2. Admin receives email notification
3. Admin opens dashboard
4. New apartment appears at top with "NEW" badge
5. Admin reviews and publishes
6. Badge changes to published status

## Implementation Notes

### Migration Path

**Phase 1**: Backend enhancements (no breaking changes)
- Add date_filter support to API
- Add indexes to database
- Default sorting to newest-first

**Phase 2**: Frontend utility functions
- Enhance apartment-utils.ts
- Add new badge logic
- Add relative time formatting

**Phase 3**: UI updates
- Update ViewApartments component
- Add date filter dropdown
- Enhance badge display

**Phase 4**: Testing & refinement
- Test across different time zones
- Verify performance with large datasets
- A/B test badge colors and styles

### Configuration

All configuration should be in `next.config.ts` (no sensitive data needed for this feature):

```typescript
const nextConfig = {
  // Existing config...
  
  env: {
    // Admin dashboard settings
    ADMIN_LISTINGS_PER_PAGE: '12',
    ADMIN_NEW_LISTING_HOURS: '24',
    ADMIN_RECENT_LISTING_HOURS: '48',
    ADMIN_URGENT_LISTING_HOURS: '48',
  },
};
```

### Accessibility

- Badge colors have sufficient contrast (WCAG AA)
- Relative timestamps have full date on hover
- Keyboard navigation for filters
- Screen reader announcements for badge states

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Monitoring and Analytics

### Key Metrics

- Average time from submission to approval
- Number of urgent listings per day
- Admin response time by time of day
- Filter usage statistics

### Dashboards

- Real-time pending listings count
- Approval rate trends
- Admin activity heatmap
- Listing age distribution

## Future Enhancements

- Bulk actions (approve multiple listings)
- Custom date range picker
- Email digest of pending listings
- Push notifications for urgent listings
- Auto-approval rules based on agent reputation

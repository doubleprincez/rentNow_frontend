# Implementation Plan

- [x] 1. Add database indexes for performance
  - Add index on `apartments.created_at` column (DESC)
  - Add composite index on `apartments.published` and `apartments.created_at`
  - Test query performance with EXPLAIN
  - _Requirements: 1.1, 1.4_

- [x] 2. Fix backend apartment repository to show unpublished apartments to admins





  - **CRITICAL BUG**: Remove `where('published', true)` filter from `getApartments()` method for admin users
  - Add logic to check if user is admin (account_id > 3) and skip published filter
  - Properly calculate `filtered_count` (count after date filter) and `total_count` (count before date filter)
  - Ensure metadata is returned correctly in the response
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.3_

- [x] 3. Enhance apartment utility functions
  - Update `getApartmentBadge()` function to return badge info for NEW/RECENT/URGENT states
  - Implement `formatRelativeTime()` function for human-readable timestamps
  - Add TypeScript interfaces for BadgeType and ApartmentBadgeInfo
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3_

- [x] 4. Update frontend API service
  - Add `dateFilter` parameter to `getAllApartments()` function
  - Update API call to include date_filter query parameter
  - Update TypeScript interfaces to include filtered_count and total_count
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Add date filter dropdown to ViewApartments component
  - Create date filter options array (All, Last 24 Hours, Last 7 Days, Last 30 Days)
  - Add Select component for date filter
  - Connect filter to state management
  - Trigger API call on filter change
  - Reset to page 1 when filter changes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Enhance badge display system
  - Replace existing badge logic with `getApartmentBadge()` function
  - Add icon components (Sparkles for NEW, AlertCircle for URGENT, Clock for RECENT)
  - Implement three badge variants with appropriate colors
  - Add pulsing animation for URGENT badges
  - Apply subtle row background tints for NEW and URGENT listings
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Add relative timestamp display
  - Use `formatRelativeTime()` to show "2 hours ago" format
  - Add tooltip with full date/time on hover
  - Display in table cell or near title
  - Update on component mount and when data changes
  - _Requirements: 4.1, 4.2_

- [x] 8. Add filtered results count display
  - Show "Showing X of Y apartments" text above table
  - Update count when filters change
  - Handle loading and error states
  - _Requirements: 3.4_

- [x] 9. Implement URGENT indicator for long-pending listings
  - Check if listing is unpublished AND created > 48 hours ago
  - Display red URGENT badge with pulsing animation
  - Apply red/orange background tint to row
  - _Requirements: 4.3, 4.4_

- [x] 10. Update table styling and visual hierarchy
  - Add conditional row styling based on badge type
  - Make NEW listing titles bold
  - Add subtle background colors for NEW (green tint) and URGENT (red tint)
  - Ensure sufficient color contrast for accessibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 11. Add configuration to next.config.ts
  - Add ADMIN_LISTINGS_PER_PAGE environment variable
  - Add ADMIN_NEW_LISTING_HOURS (24) environment variable
  - Add ADMIN_RECENT_LISTING_HOURS (48) environment variable
  - Add ADMIN_URGENT_LISTING_HOURS (48) environment variable
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 4.3_

- [x] 12. Optimize performance
  - Implement debounce on search input (300ms)
  - _Requirements: 1.1, 1.4_

- [x] 13. Update modal/detail view
  - Show badge in apartment detail modal
  - Display full creation timestamp
  - Show relative time with tooltip
  - Update status badge styling
  - _Requirements: 2.1, 2.2, 4.1, 4.2_

- [x] 14. Add error handling and loading states
  - Handle API errors gracefully with retry button
  - Show loading skeleton for table rows
  - Display empty state message when no results
  - _Requirements: 1.4, 3.4_

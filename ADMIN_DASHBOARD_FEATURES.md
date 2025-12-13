# Admin Dashboard - New Listings Highlight Feature

## Overview

The admin dashboard now includes enhanced features to help administrators quickly identify and prioritize newly uploaded property listings for approval.

## Features

### 1. Three-Tier Badge System

Apartments are automatically categorized and badged based on their upload time and publication status:

#### 🟢 NEW Badge (< 24 hours)
- **Color**: Green
- **Criteria**: Uploaded within the last 24 hours
- **Visual**: Green background tint on table row
- **Icon**: Sparkles ✨

#### 🔵 RECENT Badge (24-48 hours)
- **Color**: Blue
- **Criteria**: Uploaded between 24-48 hours ago
- **Visual**: Normal row styling
- **Icon**: Clock 🕐

#### 🔴 URGENT Badge (> 48 hours unpublished)
- **Color**: Red
- **Criteria**: Unpublished for more than 48 hours
- **Visual**: Red/orange background tint with pulsing animation
- **Icon**: Alert Circle ⚠️ (animated)

### 2. Date Range Filters

Filter apartments by upload date:

- **All Time**: Show all apartments (default)
- **Last 24 Hours**: Show only new uploads
- **Last 7 Days**: Show recent uploads from the past week
- **Last 30 Days**: Show uploads from the current month

### 3. Sorting Options

- **Newest First** (default): Apartments sorted by creation date, newest at the top
- **Custom Sorting**: Toggle to switch between newest-first and other sorting options

### 4. Relative Timestamps

Each apartment displays a human-readable timestamp:
- "Just now"
- "5 minutes ago"
- "2 hours ago"
- "1 day ago"
- Full date for older listings

Hover over any timestamp to see the exact date and time.

### 5. Filtered Results Count

The dashboard displays:
- Number of apartments matching current filters
- Total number of apartments in the system
- Example: "Showing 15 of 150 apartments"

## How to Use

### Viewing New Listings

1. Navigate to **Admin Dashboard** → **View Apartments**
2. By default, apartments are sorted with newest first
3. Look for green "NEW" badges to identify listings from the last 24 hours
4. Click on any apartment title to view full details

### Filtering by Date

1. Click the **Calendar dropdown** in the filter bar
2. Select your desired time range:
   - Last 24 Hours (for new uploads)
   - Last 7 Days (for recent activity)
   - Last 30 Days (for monthly overview)
3. The table updates automatically with filtered results

### Identifying Urgent Listings

1. Look for red "URGENT" badges with pulsing animation
2. These indicate apartments that have been pending approval for more than 48 hours
3. Prioritize reviewing these listings to maintain platform quality

### Searching and Filtering

1. Use the **Search bar** to find specific apartments by title, description, or tags
2. Combine search with date filters for precise results
3. Search is debounced (300ms delay) for better performance

## Configuration

All settings are configured in `next.config.ts`:

```typescript
env: {
  ADMIN_LISTINGS_PER_PAGE: '12',        // Apartments per page
  ADMIN_NEW_LISTING_HOURS: '24',        // Hours for "NEW" badge
  ADMIN_RECENT_LISTING_HOURS: '48',     // Hours for "RECENT" badge
  ADMIN_URGENT_LISTING_HOURS: '48',     // Hours before "URGENT" badge
}
```

## Backend Requirements

### Database Indexes

The following indexes have been added for optimal performance:

```sql
-- Index on created_at for sorting
CREATE INDEX idx_apartments_created_at ON apartments(created_at DESC);

-- Composite index for filtering pending listings
CREATE INDEX idx_apartments_published_created ON apartments(published, created_at);
```

### API Endpoints

The apartments API now supports additional query parameters:

```
GET /api/apartments?page=1&search=&sort=created_at&order=desc&date_filter=24h
```

**Parameters**:
- `page`: Page number (default: 1)
- `search`: Search term for title/description/tags
- `sort`: Field to sort by (default: created_at)
- `order`: Sort direction (default: desc)
- `date_filter`: Time range filter (all, 24h, 7d, 30d)

## Performance Optimizations

1. **Debounced Search**: Search input has a 300ms debounce to reduce API calls
2. **Memoized Calculations**: Badge calculations are memoized for better performance
3. **Database Indexes**: Optimized queries with proper indexes
4. **Efficient Pagination**: Server-side pagination with metadata

## Troubleshooting

### Badges Not Showing

**Issue**: Apartments don't display NEW/RECENT/URGENT badges

**Solutions**:
1. Check that `created_at` field exists in apartment data
2. Verify server time zone matches expected timezone
3. Clear browser cache and reload

### Filters Not Working

**Issue**: Date filters don't update the apartment list

**Solutions**:
1. Check browser console for API errors
2. Verify backend supports `date_filter` parameter
3. Ensure database indexes are created (run migrations)

### Slow Performance

**Issue**: Dashboard loads slowly with many apartments

**Solutions**:
1. Run database migrations to add indexes
2. Reduce `ADMIN_LISTINGS_PER_PAGE` in config
3. Check server resources and database performance

### Timestamps Incorrect

**Issue**: Relative timestamps show wrong values

**Solutions**:
1. Verify server timezone configuration
2. Check that `created_at` is stored in UTC
3. Ensure client browser timezone is correct

## Best Practices

### For Administrators

1. **Check Daily**: Review the dashboard daily for new listings
2. **Prioritize URGENT**: Address urgent listings first to maintain quality
3. **Use Filters**: Leverage date filters to focus on specific time ranges
4. **Quick Actions**: Use the modal view for fast approval/rejection

### For Developers

1. **Run Migrations**: Always run database migrations after deployment
2. **Monitor Performance**: Watch query performance with large datasets
3. **Test Timezones**: Test with different server/client timezones
4. **Cache Wisely**: Use appropriate cache strategies for API responses

## Future Enhancements

Planned improvements for future releases:

- [ ] Bulk approval actions
- [ ] Custom date range picker
- [ ] Email digest of pending listings
- [ ] Push notifications for urgent listings
- [ ] Auto-approval rules based on agent reputation
- [ ] Advanced filtering (by location, price range, etc.)
- [ ] Export filtered results to CSV

## Support

For issues or questions:
1. Check this documentation first
2. Review the troubleshooting section
3. Check browser console for errors
4. Contact the development team with error details

---

**Last Updated**: February 4, 2025
**Version**: 1.0.0

# Requirements Document

## Introduction

This feature enhances the admin dashboard to make newly uploaded property listings easily identifiable. Admins need to quickly spot and prioritize new listings for approval, ensuring timely review and publication of properties.

## Glossary

- **Admin Dashboard**: The administrative interface where admins manage property listings
- **New Listing**: A property listing created within the last 24-48 hours
- **Listing Status Indicator**: Visual element (badge, highlight, or icon) that marks new listings
- **Admin User**: A user with administrative privileges (account_id > 3)

## Requirements

### Requirement 1

**User Story:** As an admin user, I want newly uploaded apartments to appear at the top of the listings table, so that I can review them immediately without searching

#### Acceptance Criteria

1. WHEN an Admin User views the apartments list, THE Admin Dashboard SHALL display apartments sorted by creation date in descending order with newest first
2. THE Admin Dashboard SHALL maintain the sort order across pagination
3. WHERE an Admin User applies additional filters, THE Admin Dashboard SHALL preserve the newest-first sort order within filtered results
4. THE Admin Dashboard SHALL load the first page with newest listings within 2 seconds

### Requirement 2

**User Story:** As an admin user, I want visual indicators on new listings, so that I can quickly identify which apartments were recently submitted

#### Acceptance Criteria

1. WHEN an apartment was created within the last 24 hours, THE Admin Dashboard SHALL display a "NEW" badge on the listing row
2. THE Admin Dashboard SHALL use a distinct background color or highlight for listings created within the last 24 hours
3. WHEN an apartment was created between 24-48 hours ago, THE Admin Dashboard SHALL display a "RECENT" badge with different styling
4. THE Admin Dashboard SHALL remove visual indicators after 48 hours from creation time

### Requirement 3

**User Story:** As an admin user, I want to filter listings by submission date, so that I can focus on reviewing recent submissions

#### Acceptance Criteria

1. THE Admin Dashboard SHALL provide a filter option for "Last 24 Hours" submissions
2. THE Admin Dashboard SHALL provide a filter option for "Last 7 Days" submissions
3. THE Admin Dashboard SHALL provide a filter option for "Last 30 Days" submissions
4. WHERE a date filter is applied, THE Admin Dashboard SHALL display the count of matching listings

### Requirement 4

**User Story:** As an admin user, I want to see the submission timestamp for each listing, so that I can assess how long a listing has been pending

#### Acceptance Criteria

1. THE Admin Dashboard SHALL display the creation timestamp in human-readable format (e.g., "2 hours ago", "1 day ago")
2. THE Admin Dashboard SHALL show the exact date and time on hover over the timestamp
3. WHERE a listing is pending for more than 48 hours, THE Admin Dashboard SHALL display an "URGENT" indicator
4. THE Admin Dashboard SHALL sort urgent listings to the top when "Urgent Only" filter is applied

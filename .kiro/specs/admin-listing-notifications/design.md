# Design Document: Admin Listing Notifications

## Overview

This feature implements an email notification system that alerts administrators when new property listings are submitted. The system leverages Laravel's existing event-listener architecture, mail system, and queue infrastructure to deliver timely notifications with retry capabilities.

The implementation will extend the existing `NewApartmentEvent` and `NewApartmentListener` to send rich HTML emails to all admin users when a new apartment listing is created.

## Architecture

### High-Level Flow

```
Apartment Creation (ApartmentRepository)
    ↓
NewApartmentEvent Dispatched
    ↓
NewApartmentListener Triggered
    ↓
AdminListingNotificationMail Queued
    ↓
Email Sent to All Admin Users
    ↓
Notification Log Created
```

### Components

1. **Event System**: Existing `NewApartmentEvent` (already in place)
2. **Listener**: Enhanced `NewApartmentListener` to handle admin notifications
3. **Mailable**: New `AdminListingNotificationMail` class for email content
4. **Job**: Queued email sending with retry logic
5. **Notification Log**: Database table to track notification attempts
6. **Admin Configuration**: Environment variables and settings for admin emails
7. **Daily Summary Command**: Scheduled command for daily pending listings summary

## Components and Interfaces

### 1. Event Dispatcher Integration

**Location**: `app/Classes/Repositories/Apartments/ApartmentRepository.php`

The `createApartment` method will dispatch the `NewApartmentEvent` after successful apartment creation:

```php
public function createApartment(Request $request): Model|Builder|null
{
    // ... existing creation logic ...
    
    event(new NewApartmentEvent($model));
    
    return $model;
}
```

### 2. Enhanced Event Listener

**Location**: `app/Listeners/NewApartmentListener.php`

The listener will:
- Retrieve all admin users (account_id > 3)
- Queue notification emails for each admin
- Log notification attempts

```php
public function handle(NewApartmentEvent $event): void
{
    $admins = User::where('account_id', '>', 3)->get();
    
    foreach ($admins as $admin) {
        Mail::to($admin->email)
            ->queue(new AdminListingNotificationMail($event->apartment, $admin));
    }
}
```

### 3. Mailable Class

**Location**: `app/Mail/AdminListingNotificationMail.php`

Responsible for:
- Formatting email content with apartment details
- Including property images (up to 3 thumbnails)
- Providing direct link to admin approval page
- Responsive HTML design

**Properties**:
- `Apartment $apartment`
- `User $admin`

**Methods**:
- `envelope()`: Sets subject and from address
- `content()`: Returns view with apartment data
- `attachments()`: Returns empty array (images embedded in HTML)

### 4. Email View Template

**Location**: `resources/views/emails/admin-listing-notification.blade.php`

HTML email template featuring:
- Apartment title and description
- Property details (address, price, bedrooms, type)
- Thumbnail images (up to 3)
- Call-to-action button linking to admin dashboard
- Responsive design for mobile and desktop

### 5. Notification Logging

**Database Table**: `admin_notification_logs`

Schema:
```php
- id (bigint, primary key)
- apartment_id (bigint, foreign key)
- admin_user_id (bigint, foreign key)
- notification_type (enum: 'instant', 'daily_summary')
- status (enum: 'pending', 'sent', 'failed')
- sent_at (timestamp, nullable)
- failed_reason (text, nullable)
- retry_count (integer, default 0)
- created_at (timestamp)
- updated_at (timestamp)
```

**Model**: `app/Models/AdminNotificationLog.php`

### 6. Queue Configuration

**Queue Connection**: Use existing `QUEUE_CONNECTION` from `.env`

**Retry Logic**:
- Maximum 3 retry attempts
- 5-minute delay between retries
- Implemented via Laravel's queue retry mechanism

**Job Configuration**:
```php
public $tries = 3;
public $backoff = 300; // 5 minutes in seconds
```

### 7. Admin Email Configuration

**Environment Variables** (`.env`):
```
ADMIN_NOTIFICATION_EMAILS=admin1@example.com,admin2@example.com
```

**Fallback**: If not configured, query database for users with `account_id > 3`

### 8. Daily Summary Command

**Location**: `app/Console/Commands/SendDailyPendingListingsSummary.php`

**Scheduled**: Daily at 09:00 local time

**Functionality**:
- Query apartments where `published = false`
- Count pending listings
- Calculate oldest pending listing age
- Send summary email to all admins if count > 0

**Mailable**: `app/Mail/DailyPendingListingsSummaryMail.php`

## Data Models

### Apartment Model (Existing)

Relevant fields:
- `id`: Unique identifier
- `user_id`: Foreign key to listing creator
- `category_id`: Property category
- `title`: Property title
- `description`: Property description
- `number_of_rooms`: Number of bedrooms
- `amount`: Rental price
- `currency_code`: Currency for amount
- `security_deposit`: Security deposit amount
- `security_deposit_currency_code`: Currency for deposit
- `country_code`: Country location
- `state_code`: State location
- `city_code`: City location
- `published`: Boolean approval status
- `created_at`: Submission timestamp

### User Model (Existing)

Relevant fields:
- `id`: Unique identifier
- `name`: User full name
- `email`: Email address
- `account_id`: Account type (1=tenant, 2=agent, 3=partner, 4+=admin, 5=app admin)

### AdminNotificationLog Model (New)

Fields as defined in schema above.

## Error Handling

### Email Delivery Failures

1. **Retry Mechanism**: Laravel queue automatically retries failed jobs up to 3 times
2. **Logging**: All failures logged to `admin_notification_logs` table with failure reason
3. **Monitoring**: Failed jobs visible in Laravel Horizon/queue dashboard
4. **Fallback**: Daily summary ensures no listings are missed

### Invalid Email Addresses

1. **Validation**: Email addresses validated before sending
2. **Bounce Handling**: Depends on SMTP provider configuration
3. **Logging**: Invalid emails logged in notification logs

### Missing Configuration

1. **Graceful Degradation**: If `ADMIN_NOTIFICATION_EMAILS` not set, query database
2. **Empty Admin List**: Log warning but don't throw exception
3. **Missing Apartment Data**: Skip notification and log error

### Queue Connection Issues

1. **Sync Fallback**: If queue fails, emails sent synchronously
2. **Error Logging**: Queue failures logged to Laravel log
3. **Monitoring**: Queue health monitored via Laravel Horizon

## Testing Strategy

### Unit Tests

**Location**: `tests/Unit/Mail/AdminListingNotificationMailTest.php`

Tests:
- Email content includes all required apartment details
- Email includes correct number of images (max 3)
- Email contains valid approval link
- Email renders correctly with missing optional data

**Location**: `tests/Unit/Listeners/NewApartmentListenerTest.php`

Tests:
- Listener retrieves correct admin users
- Listener queues email for each admin
- Listener creates notification log entries
- Listener handles empty admin list gracefully

### Feature Tests

**Location**: `tests/Feature/AdminNotificationTest.php`

Tests:
- Creating apartment triggers notification event
- Notification emails queued for all admins
- Email delivery succeeds with valid SMTP config
- Failed emails retry up to 3 times
- Notification logs created with correct status

**Location**: `tests/Feature/DailyPendingListingsSummaryTest.php`

Tests:
- Command sends summary when pending listings exist
- Command skips sending when no pending listings
- Summary includes correct count and oldest listing age
- Summary email sent to all admins

### Integration Tests

**Location**: `tests/Integration/ApartmentCreationFlowTest.php`

Tests:
- End-to-end apartment creation with notification
- Event dispatched correctly from repository
- Listener processes event successfully
- Email queued and sent
- Notification log updated

### Manual Testing Checklist

1. Create test apartment via API
2. Verify email received by admin users
3. Check email formatting on desktop and mobile
4. Verify approval link navigates to correct page
5. Test with missing images
6. Test with invalid admin email
7. Test queue retry on failure
8. Test daily summary command
9. Verify notification logs accuracy

## Implementation Notes

### Email Service Provider

The system uses Laravel's mail configuration from `config/mail.php`. Ensure production environment has:
- Valid SMTP credentials
- Appropriate rate limits configured
- SPF/DKIM records for sender domain

### Queue Worker

For production deployment:
- Configure queue worker as systemd service or supervisor process
- Set appropriate worker count based on email volume
- Monitor queue depth and processing time
- Configure failed job handling

### Performance Considerations

- Emails queued asynchronously to avoid blocking apartment creation
- Batch processing for multiple admins
- Image thumbnails embedded as URLs (not attachments) to reduce email size
- Database indexes on `apartment_id` and `admin_user_id` in notification logs

### Security Considerations

- Admin approval links include signed URLs to prevent tampering
- Email content sanitized to prevent XSS
- Admin email addresses not exposed in email headers
- Rate limiting on notification sending to prevent abuse

### Scalability

- Queue-based architecture supports high volume
- Notification logs can be archived/pruned periodically
- Email service can be swapped (SMTP, SES, Mailgun) without code changes
- Horizontal scaling supported via multiple queue workers

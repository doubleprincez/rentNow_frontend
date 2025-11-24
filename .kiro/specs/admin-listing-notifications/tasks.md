# Implementation Plan

- [x] 1. Create database migration and model for notification logging


  - Create migration file for `admin_notification_logs` table with all required fields (apartment_id, admin_user_id, notification_type, status, sent_at, failed_reason, retry_count)
  - Add foreign key constraints to apartment_id and admin_user_id
  - Create `AdminNotificationLog` model with fillable fields and relationships
  - Define enum casts for notification_type and status fields
  - _Requirements: 1.4_



- [ ] 2. Create the admin listing notification mailable class
  - Create `AdminListingNotificationMail` mailable class with apartment and admin properties
  - Implement envelope() method with dynamic subject including property title
  - Implement content() method returning the email view with apartment data


  - Configure queue connection and retry settings (3 attempts, 5-minute backoff)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Create responsive HTML email template
  - Create blade template at `resources/views/emails/admin-listing-notification.blade.php`
  - Include apartment title, description, address, price, and bedroom count


  - Embed up to 3 property thumbnail images using Spatie Media Library URLs
  - Add call-to-action button with signed URL to admin approval page
  - Implement responsive CSS for mobile and desktop viewing
  - _Requirements: 2.1, 2.2, 2.3, 2.4_



- [ ] 4. Enhance NewApartmentListener to send admin notifications
  - Update `NewApartmentListener` to query all admin users (account_id > 3)
  - Queue `AdminListingNotificationMail` for each admin user
  - Create notification log entry for each queued email with 'pending' status


  - Add error handling for empty admin list
  - _Requirements: 1.1, 3.1, 3.2_

- [x] 5. Integrate event dispatching in apartment creation flow


  - Update `ApartmentRepository::createApartment()` to dispatch `NewApartmentEvent` after successful creation
  - Ensure event is dispatched within the database transaction
  - Add event to `EventServiceProvider` $listen array mapping
  - _Requirements: 1.1_



- [ ] 6. Implement notification logging and retry tracking
  - Create event listener for `MessageSent` event to update notification log status to 'sent'
  - Create event listener for `MessageSendingFailed` event to update notification log with failure reason and increment retry_count
  - Add database indexes on apartment_id and admin_user_id in migration
  - _Requirements: 1.3, 1.4_



- [ ] 7. Add admin email configuration support
  - Add `ADMIN_NOTIFICATION_EMAILS` to `.env.example` with documentation
  - Create config entry in `config/mail.php` for admin notification emails
  - Update listener to use configured emails as fallback to database query
  - Implement email validation before queuing notifications
  - _Requirements: 3.1, 3.3, 3.4_



- [ ] 8. Create daily pending listings summary command
  - Create artisan command `SendDailyPendingListingsSummary` 
  - Query apartments where published = false



  - Calculate count and oldest pending listing age
  - Create `DailyPendingListingsSummaryMail` mailable with summary data
  - Queue summary email to all admin users if pending count > 0
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Create daily summary email template
  - Create blade template at `resources/views/emails/daily-pending-listings-summary.blade.php`
  - Display count of pending listings
  - Show oldest pending listing age in human-readable format
  - Include direct link to admin dashboard pending listings view
  - Use responsive HTML design
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 10. Schedule daily summary command
  - Register command in `app/Console/Kernel.php` schedule method
  - Set schedule to run daily at 09:00 local time
  - Add command to documentation for manual testing
  - _Requirements: 4.1_

- [ ] 11. Update environment configuration documentation
  - Document required SMTP configuration in README
  - Add example admin notification email configuration
  - Document queue worker setup requirements
  - Add troubleshooting section for common email issues
  - _Requirements: 3.3_

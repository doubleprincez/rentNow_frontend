# Requirements Document

## Introduction

This feature implements a video advertisement gate for guest users (non-logged-in visitors) who want to view agent contact details on property listing pages. This monetization strategy generates revenue while maintaining a good user experience for authenticated users.

## Glossary

- **Video Ad Gate**: A mechanism that requires users to watch a video advertisement before accessing content
- **Guest User**: A visitor who is not logged in to the platform
- **Authenticated User**: A logged-in user with an active session
- **Subscribed User**: A user with an active subscription that bypasses ad requirements
- **Non-Subscribed User**: Any user (guest or authenticated) without an active subscription
- **Agent Details**: Contact information including phone number, email, and WhatsApp link
- **Ad Completion**: The state when a video advertisement has been watched to completion or skipped after minimum duration
- **Ad System**: Third-party advertising platform (Google AdSense, Ad Manager, or custom solution)

## Requirements

### Requirement 1

**User Story:** As a non-subscribed user, I want to see agent information is available but gated, so that I understand I need to watch an ad or subscribe to access it

#### Acceptance Criteria

1. WHEN a Non-Subscribed User views a property listing page, THE System SHALL display agent name and profile picture without contact details
2. THE System SHALL display a "View Contact Details" button with an ad icon indicator
3. THE System SHALL show a tooltip explaining "Watch a short ad to view contact details" on button hover
4. WHERE a Non-Subscribed User is on the page, THE System SHALL blur or hide phone number, email, and WhatsApp button

### Requirement 2

**User Story:** As a non-subscribed user, I want to watch a video ad to unlock agent contact details, so that I can contact the agent without subscribing

#### Acceptance Criteria

1. WHEN a Non-Subscribed User clicks "View Contact Details", THE System SHALL display a video ad player modal
2. THE System SHALL load and play a video advertisement from the configured ad provider
3. THE System SHALL disable the skip button for the first 5 seconds of the advertisement
4. WHEN the ad completes or is skipped after minimum duration, THE System SHALL unlock agent contact details for 4 minutes

### Requirement 3

**User Story:** As a subscribed user, I want immediate access to agent contact details without watching ads, so that I can quickly contact agents for properties I'm interested in

#### Acceptance Criteria

1. WHEN a Subscribed User views a property listing page, THE System SHALL display all agent contact details immediately without ad gate
2. THE System SHALL NOT display the "View Contact Details" button for Subscribed Users
3. THE System SHALL show phone number, email, and WhatsApp button in clear, unblurred format
4. THE System SHALL maintain this behavior across all property listing pages

### Requirement 4

**User Story:** As a non-subscribed user, I want my ad-viewing session to persist temporarily, so that I don't have to watch ads repeatedly for every property

#### Acceptance Criteria

1. WHEN a Non-Subscribed User completes watching an ad, THE System SHALL store the unlock state in browser session storage
2. THE System SHALL maintain unlocked access for 4 minutes from ad completion
3. WHERE the session expires, THE System SHALL require watching another ad to unlock details
4. THE System SHALL display a countdown timer showing remaining unlocked time

### Requirement 5

**User Story:** As a platform administrator, I want to configure which ad system to use, so that I can optimize revenue and user experience

#### Acceptance Criteria

1. THE System SHALL support Google AdSense for Video integration
2. THE System SHALL support Google Ad Manager integration
3. THE System SHALL support custom video ad URLs as fallback
4. WHERE no ad provider is configured, THE System SHALL display a promotional video about the platform

### Requirement 6

**User Story:** As a platform administrator, I want to track ad completion rates and unlock events, so that I can measure the effectiveness of the ad gate

#### Acceptance Criteria

1. WHEN a Non-Subscribed User views the ad modal, THE System SHALL log an "ad_impression" event
2. WHEN a Non-Subscribed User completes watching an ad, THE System SHALL log an "ad_completed" event
3. WHEN a Non-Subscribed User skips an ad, THE System SHALL log an "ad_skipped" event with watch duration
4. WHEN agent details are unlocked, THE System SHALL log an "agent_details_unlocked" event with method (ad_watched or subscribed)

### Requirement 7

**User Story:** As a platform administrator, I want to view comprehensive ad statistics in the admin dashboard, so that I can analyze ad performance and optimize revenue

#### Acceptance Criteria

1. THE System SHALL provide an admin dashboard page displaying ad statistics
2. THE System SHALL show total ad impressions with daily, weekly, and monthly breakdowns
3. THE System SHALL display ad completion rates and skip rates with visual charts
4. THE System SHALL show average watch duration for skipped advertisements
5. THE System SHALL provide user breakdown statistics (guest, authenticated, subscribed users)

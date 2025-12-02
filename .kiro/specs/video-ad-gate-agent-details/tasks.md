# Implementation Plan

- [x] 1. Set up ad session management infrastructure


  - Create AdSessionManager service for handling unlock states in browser sessionStorage
  - Implement session validation and expiration logic (4-minute duration)
  - Add session state persistence across page navigation
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Create core ad gate components

  - [x] 2.1 Build AdGatedAgentDetails component


    - Create component to manage display state of agent details for non-subscribed users
    - Implement blurred/hidden contact information display
    - Add "View Contact Details" button with ad icon indicator
    - Include tooltip explaining ad requirement on button hover
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Build VideoAdModal component


    - Create full-screen modal for video advertisement playback
    - Implement modal open/close functionality with proper focus management
    - Add loading states and error handling for ad loading failures
    - Include accessibility features (ARIA labels, keyboard navigation)
    - _Requirements: 2.1_

  - [x] 2.3 Build VideoAdPlayer component


    - Create video player with skip button functionality (disabled for first 5 seconds)
    - Implement ad completion and skip event handling
    - Add progress indicator for ad playback
    - Handle video loading, play, pause, and error states
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 3. Implement ad provider integrations

  - [x] 3.1 Create Google IMA SDK integration


    - Set up Google IMA SDK loading and initialization
    - Implement VAST tag request and ad loading functionality
    - Handle IMA ad events (loaded, started, completed, skipped, error)
    - Add proper cleanup and disposal of IMA resources
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Create custom video ad support


    - Implement direct HTML5 video element integration as fallback
    - Add custom controls for skip functionality
    - Handle manual event tracking for custom ads
    - Implement fallback promotional content when no ads available
    - _Requirements: 5.3, 5.4_

  - [x] 3.3 Build ad configuration management


    - Create AdConfiguration interface and validation
    - Implement provider selection logic (Google IMA, custom, fallback)
    - Add environment variable configuration for ad settings
    - Handle ad provider fallback mechanisms
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Integrate ad gate with existing agent details display

  - [x] 4.1 Modify ProductInfoPanel component


    - Update agent details section to use subscription check instead of authentication
    - Integrate AdGatedAgentDetails component for non-subscribed users
    - Maintain existing direct display for subscribed users
    - Ensure proper responsive behavior on desktop
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Modify ProductInfoOverlay component


    - Update mobile overlay to use subscription check instead of authentication
    - Integrate AdGatedAgentDetails component for mobile non-subscribed users
    - Maintain existing direct display for subscribed users on mobile
    - Ensure proper touch interactions and mobile UX
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4_

- [x] 5. Implement analytics and event tracking

  - [x] 5.1 Create AdAnalytics service


    - Build analytics service for tracking ad-related events
    - Implement event batching and offline queuing
    - Add retry mechanisms for failed analytics requests
    - Handle privacy-compliant event collection
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.2 Add event tracking to ad components


    - Integrate analytics tracking in VideoAdModal (ad_impression events)
    - Add tracking to VideoAdPlayer (ad_started, ad_completed, ad_skipped events)
    - Implement unlock event tracking (agent_details_unlocked events)
    - Include watch duration tracking for skipped ads
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Build admin statistics dashboard (Backend)

  - [x] 6.1 Create database schema for ad statistics


    - Design and create ad_events table for storing analytics data
    - Add indexes for efficient querying of statistics
    - Implement data retention policies for analytics data
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_



  - [ ] 6.2 Build ad statistics API endpoints
    - Create API endpoints for retrieving ad statistics data
    - Implement aggregation queries for daily, weekly, monthly breakdowns
    - Add filtering and date range functionality
    - Include user type breakdown calculations


    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 6.3 Create admin dashboard page
    - Build admin dashboard page for viewing ad statistics


    - Implement charts and visualizations for ad performance metrics


    - Add date range selectors and filtering options
    - Include export functionality for statistics data
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Add error handling and fallback mechanisms


  - [ ] 7.1 Implement ad loading error handling
    - Add error boundaries for ad-related components
    - Implement retry mechanisms for failed ad loads
    - Create fallback content when ads are unavailable
    - Handle ad blocker detection and user messaging
    - _Requirements: 5.4_

  - [ ] 7.2 Add network connectivity handling
    - Implement offline detection and user messaging
    - Add retry functionality for network failures
    - Handle graceful degradation when analytics fail
    - Ensure core functionality works without ad providers
    - _Requirements: 5.4_

- [ ] 8. Write comprehensive tests
  - [ ] 8.1 Create unit tests for ad session management
    - Test AdSessionManager session storage operations
    - Test session validation and expiration logic
    - Test session persistence across page navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 8.2 Create component tests for ad gate UI
    - Test AdGatedAgentDetails component rendering and interactions
    - Test VideoAdModal component modal behavior and accessibility
    - Test VideoAdPlayer component playback and skip functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [ ] 8.3 Create integration tests for ad providers
    - Test Google IMA SDK integration and event handling
    - Test custom video ad functionality and fallbacks
    - Test ad configuration management and provider selection
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 8.4 Create end-to-end tests for complete user flows
    - Test complete guest user journey (view ad → unlock details)
    - Test authenticated non-subscribed user flow
    - Test subscribed user bypass functionality
    - Test mobile responsive behavior and touch interactions
    - _Requirements: All requirements_

- [ ] 9. Performance optimization and accessibility
  - [ ] 9.1 Implement lazy loading for ad components
    - Add code splitting for ad-related components
    - Implement lazy loading of ad SDK scripts
    - Optimize video preloading for faster playback
    - Add performance monitoring for ad loading times
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 9.2 Add accessibility features
    - Implement proper ARIA labels and roles for ad components
    - Add keyboard navigation support for ad controls
    - Include screen reader announcements for unlock state changes
    - Test with screen readers and accessibility tools
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Configuration and deployment setup
  - [ ] 10.1 Set up environment configuration
    - Add environment variables for ad provider settings
    - Configure ad skip delay and session duration settings
    - Set up analytics endpoint configuration
    - Add admin dashboard access controls
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 10.2 Update existing authentication flows
    - Ensure subscription status is properly checked in user state
    - Update Redux store to include subscription information
    - Verify subscription validation across all relevant components
    - Test subscription state persistence and updates
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
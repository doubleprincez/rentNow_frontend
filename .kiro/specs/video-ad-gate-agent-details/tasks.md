# Implementation Plan

- [ ] 1. Set up backend ad event logging system
  - Create migration for `ad_events` table with event_type, apartment_id, watch_duration, user_agent, ip_address, session_id fields
  - Create `AdEvent` model with fillable fields and apartment relationship
  - Create `AdEventController` with store method for logging events
  - Add API route `POST /api/ad-events` for event logging
  - Add indexes on apartment_id, event_type, and created_at for performance
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Create ad configuration system
  - Add ad configuration variables to `.env.example` (VAST tag URL, fallback video, skip delay, session duration)
  - Create config file `config/ads.php` for ad system settings
  - Create `AdConfigController` with index method returning ad configuration
  - Add API route `GET /api/ad-config` for fetching configuration
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Install and configure Video.js with IMA SDK
  - Install npm packages: `video.js`, `videojs-contrib-ads`, `videojs-ima`
  - Install type definitions: `@types/video.js`
  - Create Video.js CSS import in global styles
  - Create IMA SDK script loader utility for dynamic loading
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Create VideoAdPlayer component
  - Create `src/components/ads/VideoAdPlayer.tsx` with Video.js integration
  - Implement IMA SDK initialization with VAST tag loading
  - Add event handlers for ad impression, completion, skip, and error
  - Implement 5-second skip delay enforcement
  - Add cleanup logic for unmounting
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Create AdModal component
  - Create `src/components/ads/AdModal.tsx` with full-screen overlay
  - Integrate VideoAdPlayer component
  - Add loading states and error handling with retry button
  - Implement close button (disabled during ad playback)
  - Add responsive design for mobile and desktop
  - _Requirements: 2.1, 2.2_

- [ ] 6. Implement session management utilities
  - Create `src/lib/adSessionManager.ts` with session storage functions
  - Implement `isSessionValid()` to check unlock status
  - Implement `storeUnlockSession()` to save 30-minute session
  - Implement `getRemainingTime()` for countdown timer
  - Implement `clearExpiredSession()` for cleanup
  - Add fallback for private browsing/disabled storage
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Create AgentDetailsGate component
  - Create `src/components/property/AgentDetailsGate.tsx` with gate logic
  - Check authentication status from Redux store
  - Manage unlock state and session storage
  - Implement countdown timer display
  - Add "View Contact Details" button with ad icon
  - Handle ad modal trigger and completion
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Create AgentContactDetails component
  - Create `src/components/property/AgentContactDetails.tsx` for agent info display
  - Implement locked state with blurred contact details
  - Implement unlocked state with full contact details
  - Add phone number, email, and WhatsApp button
  - Show countdown timer when unlocked for guests
  - Display full details immediately for authenticated users
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3_

- [ ] 9. Create ad event logging service
  - Create `src/services/adEventService.ts` for API calls
  - Implement `logAdImpression()` function
  - Implement `logAdCompleted()` function
  - Implement `logAdSkipped()` function with duration
  - Implement `logAgentDetailsUnlocked()` function
  - Add error handling and retry logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 10. Integrate AgentDetailsGate into ProductMediaViewer
  - Update `ProductMediaViewer.tsx` to use AgentDetailsGate component
  - Pass apartment and agent data to AgentDetailsGate
  - Pass authentication status from props
  - Remove any existing login requirements for viewing agent info
  - Ensure booking appointment CTA also triggers ad gate for guests
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3_

- [ ] 11. Add ad configuration fetching
  - Create React Query hook `useAdConfig()` for fetching ad configuration
  - Implement caching with 1-hour stale time
  - Add loading and error states
  - Use configuration in VideoAdPlayer component
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 12. Implement error handling and fallbacks
  - Add VAST tag error handling with fallback to promotional video
  - Implement network error retry mechanism
  - Add IMA SDK error logging
  - Handle session storage quota exceeded
  - Add graceful degradation for private browsing
  - Show user-friendly error messages
  - _Requirements: 2.2, 2.3_

- [ ] 13. Add analytics and monitoring
  - Create analytics dashboard API endpoint for ad metrics
  - Implement aggregation queries for impression rate, completion rate, skip rate
  - Add real-time metrics tracking
  - Create admin dashboard view for ad performance
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 14. Optimize performance and bundle size
  - Implement lazy loading for Video.js and IMA SDK
  - Add code splitting for ad components
  - Prefetch VAST tags on page load
  - Optimize Video.js bundle with tree-shaking
  - Add loading indicators for better UX
  - _Requirements: 2.1, 2.2_

- [ ] 15. Update documentation and environment setup
  - Document Google Ad Manager setup process
  - Add VAST tag configuration guide
  - Document fallback video requirements
  - Add troubleshooting section for common issues
  - Update README with ad system overview
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

# Design Document: Video Ad Gate for Agent Details

## Overview

This feature implements a pre-roll video advertisement system that gates access to agent contact details for guest (non-authenticated) users. The system uses Google IMA SDK with VAST-compliant video ads, integrated through Video.js player in a Next.js/React environment. Authenticated users bypass the ad gate entirely.

## Architecture

### High-Level Flow

```
User Views Property Listing
    ↓
Check Authentication Status
    ↓
┌─────────────────┴─────────────────┐
│                                   │
Authenticated User          Guest User
│                                   │
Show Agent Details          Show Blurred/Hidden Details
Immediately                         │
                                    │
                            User Clicks "View Details"
                                    │
                            Check Session Storage
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            Session Valid                   Session Expired
            (< 30 min)                              │
                    │                               │
            Unlock Details                  Show Video Ad Modal
                                                    │
                                            Load VAST Ad via IMA SDK
                                                    │
                                            User Watches Ad
                                                    │
                                            Ad Completes/Skipped
                                                    │
                                            Store Session (30 min)
                                                    │
                                            Unlock Agent Details
                                                    │
                                            Log Ad Event
```

### Technology Stack

**Frontend (Next.js/React)**:
- Video.js 8.x - Base video player
- videojs-contrib-ads - Ad framework for Video.js
- videojs-ima - Google IMA SDK integration
- Session Storage API - Temporary unlock state
- React Context/Redux - Global state management

**Backend (Laravel)**:
- Ad event logging API endpoint
- Analytics aggregation
- Configuration management

**Ad Serving**:
- Google Ad Manager (GAM) - Primary ad source
- VAST 4.x compliant tags
- Fallback to custom promotional videos

## Components and Interfaces

### 1. Frontend Components

#### 1.1 VideoAdPlayer Component

**Location**: `src/components/ads/VideoAdPlayer.tsx`

**Purpose**: Wrapper component for Video.js with IMA SDK integration

**Props**:
```typescript
interface VideoAdPlayerProps {
  vastTagUrl: string;
  onAdComplete: () => void;
  onAdSkipped: (watchDuration: number) => void;
  onAdError: (error: Error) => void;
  onAdImpression: () => void;
}
```

**Key Features**:
- Initializes Video.js player with IMA plugin
- Handles VAST tag loading
- Manages ad playback lifecycle
- Enforces 5-second skip delay
- Cleans up resources on unmount

**Dependencies**:
```bash
npm install video.js videojs-contrib-ads videojs-ima
npm install --save-dev @types/video.js
```

#### 1.2 AgentDetailsGate Component

**Location**: `src/components/property/AgentDetailsGate.tsx`

**Purpose**: Manages the ad gate logic and UI state

**Props**:
```typescript
interface AgentDetailsGateProps {
  agent: Agent;
  isAuthenticated: boolean;
  apartmentId: string;
}
```

**State Management**:
```typescript
interface GateState {
  isUnlocked: boolean;
  showAdModal: boolean;
  unlockExpiresAt: number | null;
  remainingTime: number;
}
```

**Key Features**:
- Checks authentication status
- Manages session storage for unlock state
- Displays countdown timer
- Triggers ad modal
- Shows/hides agent contact details

#### 1.3 AgentContactDetails Component

**Location**: `src/components/property/AgentContactDetails.tsx`

**Purpose**: Displays agent contact information with conditional visibility

**Props**:
```typescript
interface AgentContactDetailsProps {
  agent: Agent;
  isUnlocked: boolean;
  onUnlockClick: () => void;
}
```

**Display States**:
- **Locked (Guest)**: Blurred contact info with "View Contact Details" button
- **Unlocked (Guest)**: Full contact details with countdown timer
- **Authenticated**: Full contact details, no restrictions

#### 1.4 AdModal Component

**Location**: `src/components/ads/AdModal.tsx`

**Purpose**: Full-screen modal for video ad playback

**Features**:
- Full-screen overlay
- Video ad player integration
- Loading states
- Error handling with retry
- Close button (disabled during ad)

### 2. Backend Components

#### 2.1 Ad Event Logging API

**Endpoint**: `POST /api/ad-events`

**Request Body**:
```json
{
  "event_type": "ad_impression" | "ad_completed" | "ad_skipped" | "agent_details_unlocked",
  "apartment_id": "123",
  "watch_duration": 15,
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1",
  "session_id": "abc123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Event logged successfully"
}
```

**Database Table**: `ad_events`

```sql
CREATE TABLE ad_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type ENUM('ad_impression', 'ad_completed', 'ad_skipped', 'agent_details_unlocked'),
    apartment_id BIGINT,
    watch_duration INT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    session_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);
```

#### 2.2 Ad Configuration API

**Endpoint**: `GET /api/ad-config`

**Response**:
```json
{
  "vast_tag_url": "https://pubads.g.doubleclick.net/gampad/ads?...",
  "fallback_video_url": "https://cdn.rentnow.ng/promo.mp4",
  "skip_delay_seconds": 5,
  "session_duration_minutes": 30,
  "enabled": true
}
```

**Environment Variables**:
```env
AD_SYSTEM_ENABLED=true
AD_VAST_TAG_URL=https://pubads.g.doubleclick.net/gampad/ads?...
AD_FALLBACK_VIDEO_URL=https://cdn.rentnow.ng/promo.mp4
AD_SKIP_DELAY_SECONDS=5
AD_SESSION_DURATION_MINUTES=30
```

### 3. Session Management

#### 3.1 Session Storage Schema

**Key**: `rentnow_ad_unlock_session`

**Value**:
```json
{
  "unlocked": true,
  "expiresAt": 1704123456789,
  "apartmentIds": ["123", "456"],
  "sessionId": "abc123xyz"
}
```

**Functions**:
```typescript
// Check if session is valid
function isSessionValid(): boolean

// Store unlock session
function storeUnlockSession(apartmentId: string): void

// Get remaining time
function getRemainingTime(): number

// Clear expired session
function clearExpiredSession(): void
```

### 4. Video.js IMA Integration

#### 4.1 Player Initialization

```typescript
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

const player = videojs('video-ad-player', {
  controls: true,
  autoplay: false,
  preload: 'auto',
});

player.ima({
  adTagUrl: vastTagUrl,
  disableCustomPlaybackForIOS10Plus: true,
  showControlsForJSAds: true,
  debug: process.env.NODE_ENV === 'development',
});
```

#### 4.2 Event Handlers

```typescript
// Ad started
player.ima.addEventListener('ads-manager-loaded', () => {
  onAdImpression();
});

// Ad completed
player.ima.addEventListener('ads-ad-ended', () => {
  onAdComplete();
});

// Ad skipped
player.ima.addEventListener('ads-ad-skipped', () => {
  const duration = player.ima.getCurrentTime();
  onAdSkipped(duration);
});

// Ad error
player.ima.addEventListener('ads-error', (error) => {
  onAdError(error);
});
```

## Data Models

### Frontend Types

```typescript
// Agent information
interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  profile_picture: string;
}

// Ad configuration
interface AdConfig {
  vastTagUrl: string;
  fallbackVideoUrl: string;
  skipDelaySeconds: number;
  sessionDurationMinutes: number;
  enabled: boolean;
}

// Ad event
interface AdEvent {
  eventType: 'ad_impression' | 'ad_completed' | 'ad_skipped' | 'agent_details_unlocked';
  apartmentId: string;
  watchDuration?: number;
  sessionId: string;
}
```

### Backend Models

**AdEvent Model** (`app/Models/AdEvent.php`):
```php
class AdEvent extends Model
{
    protected $fillable = [
        'event_type',
        'apartment_id',
        'watch_duration',
        'user_agent',
        'ip_address',
        'session_id',
    ];

    protected $casts = [
        'watch_duration' => 'integer',
    ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }
}
```

## Error Handling

### Ad Loading Failures

1. **VAST Tag Error**: Fallback to promotional video
2. **Network Error**: Show retry button with error message
3. **IMA SDK Error**: Log error and show manual unlock option (with warning)

### Session Storage Failures

1. **Storage Quota Exceeded**: Use in-memory fallback
2. **Private Browsing**: Warn user and require ad per page view
3. **Storage Disabled**: Graceful degradation to per-view ads

### Video Player Errors

1. **Codec Not Supported**: Show alternative ad format
2. **Autoplay Blocked**: Show play button with instructions
3. **Player Initialization Failed**: Fallback to image ad or skip

## Security Considerations

### Client-Side Validation

- Session storage can be manipulated - backend should not rely on it for critical decisions
- Ad completion events logged to backend for analytics
- IP-based rate limiting to prevent abuse

### Privacy Compliance

- No PII collected without consent
- Session IDs are random UUIDs
- IP addresses hashed for analytics
- GDPR-compliant ad providers only

### Rate Limiting

- Max 10 ad views per IP per hour
- Max 50 unlock events per session per day
- Suspicious patterns flagged for review

## Performance Considerations

### Lazy Loading

- Video.js and IMA SDK loaded only when ad modal opens
- VAST tags prefetched on page load for faster ad display
- Agent details pre-rendered but hidden (no additional API calls)

### Caching

- Ad configuration cached for 1 hour
- VAST responses cached by browser
- Session state in memory + storage for fast access

### Bundle Size

- Video.js: ~250KB (gzipped)
- IMA SDK: ~150KB (gzipped)
- Total impact: ~400KB additional bundle size
- Loaded asynchronously to not block initial render

## Testing Strategy

### Unit Tests

**VideoAdPlayer Component**:
- Initializes Video.js correctly
- Loads VAST tag
- Fires callbacks on ad events
- Cleans up on unmount

**AgentDetailsGate Component**:
- Shows details for authenticated users
- Hides details for guests
- Manages session storage correctly
- Countdown timer updates

### Integration Tests

**Ad Flow**:
- Guest user sees blurred details
- Clicking "View Details" opens ad modal
- Ad plays and completes
- Details unlock after ad
- Session persists for 30 minutes

**Authentication Flow**:
- Authenticated users see details immediately
- No ad modal shown
- No session storage used

### E2E Tests

**Complete User Journey**:
1. Visit property page as guest
2. Click "View Contact Details"
3. Watch video ad
4. Verify details unlocked
5. Navigate to another property
6. Verify session still valid
7. Wait 30 minutes
8. Verify session expired

## Implementation Notes

### Google Ad Manager Setup

1. Create GAM account
2. Create ad unit for "Property Listing - Agent Details"
3. Generate VAST tag URL
4. Configure targeting (geography, device, etc.)
5. Set up creative (video ads)
6. Test with Google IMA Inspector

### VAST Tag Example

```
https://pubads.g.doubleclick.net/gampad/ads?
  iu=/21775744923/external/single_ad_samples
  &sz=640x480
  &cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear
  &ciu_szs=300x250
  &gdfp_req=1
  &output=vast
  &unviewed_position_start=1
  &env=vp
  &impl=s
  &correlator=
```

### Fallback Video Requirements

- Format: MP4 (H.264 + AAC)
- Resolution: 1280x720 or 1920x1080
- Duration: 15-30 seconds
- Size: < 5MB
- Content: Platform promotional video

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

### Accessibility

- Keyboard navigation support
- Screen reader announcements
- Closed captions on promotional videos
- Skip button clearly labeled
- High contrast mode support

## Monitoring and Analytics

### Key Metrics

- Ad impression rate
- Ad completion rate
- Ad skip rate (after 5 seconds)
- Average watch duration
- Unlock conversion rate
- Session duration distribution

### Dashboards

- Real-time ad performance
- Revenue estimates (if monetized)
- User behavior patterns
- Error rates and types
- Browser/device breakdown

### Alerts

- Ad error rate > 5%
- VAST tag loading failures
- Unusual skip patterns
- Session storage failures

## Migration Path

### Phase 1: Infrastructure Setup
- Install Video.js and IMA SDK
- Create ad event logging system
- Set up Google Ad Manager account

### Phase 2: Component Development
- Build VideoAdPlayer component
- Create AgentDetailsGate component
- Implement session management

### Phase 3: Integration
- Update ProductMediaViewer to use AgentDetailsGate
- Add ad modal to property pages
- Connect to backend logging API

### Phase 4: Testing & Optimization
- Test across browsers and devices
- Optimize bundle size
- A/B test ad duration and skip delay

### Phase 5: Launch
- Enable for 10% of users
- Monitor metrics
- Gradual rollout to 100%

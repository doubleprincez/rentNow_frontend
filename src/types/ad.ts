/**
 * Ad-related type definitions for the Video Ad Gate system
 */

export interface AdConfiguration {
  provider: 'google_ima' | 'google_adsense' | 'custom' | 'fallback';
  vastTag?: string;
  adUnitId?: string;
  customVideoUrl?: string;
  skipDelay: number; // seconds before skip is allowed
  fallbackContent?: {
    videoUrl: string;
    title: string;
    description: string;
  };
}

export interface AdSession {
  unlockedAt: number; // timestamp
  expiresAt: number; // timestamp
  sessionId: string;
}

export interface AdEvent {
  eventType: 'impression' | 'started' | 'completed' | 'skipped' | 'unlocked';
  timestamp: number;
  sessionId: string;
  apartmentId: string;
  watchDuration?: number;
  adProvider?: string;
  userType?: 'guest' | 'authenticated' | 'subscribed';
}

export interface AdStatsDashboard {
  impressions: {
    total: number;
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  completionRate: number;
  skipRate: number;
  averageWatchDuration: number;
  unlockEvents: {
    total: number;
    byMethod: {
      ad_watched: number;
      subscribed: number;
    };
  };
  userBreakdown: {
    guest: number;
    authenticated: number;
    subscribed: number;
  };
}

export interface AdProvider {
  loadAd(config: AdConfiguration): Promise<void>;
  play(): void;
  pause(): void;
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
  isCompleted(): boolean;
}

export interface AdGatedAgentDetailsProps {
  apartment: any; // Using any for now, will be typed properly when integrated
  onUnlock: () => void;
  isUnlocked: boolean;
  remainingTime?: number;
}

export interface VideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
  onAdSkipped: (watchDuration: number) => void;
  adConfig: AdConfiguration;
  apartmentId: string;
}

export interface VideoAdPlayerProps {
  adConfig: AdConfiguration;
  onComplete: () => void;
  onSkipped: (duration: number) => void;
  onError: (error: Error) => void;
  onStarted?: () => void;
}

export interface AdAnalyticsEvent {
  type: AdEvent['eventType'];
  apartmentId: string;
  sessionId: string;
  watchDuration?: number;
  adProvider?: string;
  userType?: 'guest' | 'authenticated' | 'subscribed';
  metadata?: Record<string, any>;
}

export interface AdConfig {
  GOOGLE_IMA_SDK_URL: string;
  GOOGLE_ADSENSE_CLIENT_ID?: string;
  GOOGLE_AD_MANAGER_NETWORK_CODE?: string;
  CUSTOM_AD_ENDPOINT?: string;
  AD_SKIP_DELAY: number;
  SESSION_DURATION: number; // 240 seconds (4 minutes)
  ANALYTICS_ENDPOINT: string;
}

export type AdProviderType = AdConfiguration['provider'];

export interface AdLoadError extends Error {
  code?: string;
  adProvider?: string;
  vastErrorCode?: number;
}

export interface AdPlaybackState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  currentTime: number;
  duration: number;
  canSkip: boolean;
  error?: AdLoadError;
}

export interface AdSessionState {
  isUnlocked: boolean;
  remainingTime: number;
  sessionId: string | null;
  unlockedAt: number | null;
  expiresAt: number | null;
}
/**
 * Ad Analytics Service
 * 
 * Handles tracking of ad-related events for analytics with:
 * - Event batching and offline queuing
 * - Retry mechanisms for failed analytics requests
 * - Privacy-compliant event collection
 */

import { AdAnalyticsEvent, AdEvent } from '@/types/ad';
import { getUserType } from '@/utils/adConfig';
import { networkAwareFetch } from '@/hooks/useNetworkStatus';

interface QueuedEvent extends AdAnalyticsEvent {
  timestamp: number;
  retryCount: number;
}

export class AdAnalytics {
  private static instance: AdAnalytics | null = null;
  private eventQueue: QueuedEvent[] = [];
  private isOnline = true;
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly MAX_QUEUE_SIZE = 100;

  private constructor() {
    this.setupNetworkListeners();
    this.startBatchTimer();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AdAnalytics {
    if (!AdAnalytics.instance) {
      AdAnalytics.instance = new AdAnalytics();
    }
    return AdAnalytics.instance;
  }

  /**
   * Track ad impression event
   */
  static trackImpression(
    apartmentId: string,
    sessionId: string,
    adProvider?: string,
    isLoggedIn?: boolean,
    isSubscribed?: boolean,
    metadata?: Record<string, any>
  ): void {
    const analytics = AdAnalytics.getInstance();
    analytics.trackEvent({
      type: 'impression',
      apartmentId,
      sessionId,
      adProvider,
      userType: getUserType(isLoggedIn || false, isSubscribed || false),
      metadata
    });
  }

  /**
   * Track ad started event
   */
  static trackStarted(
    apartmentId: string,
    sessionId: string,
    adProvider?: string,
    isLoggedIn?: boolean,
    isSubscribed?: boolean,
    metadata?: Record<string, any>
  ): void {
    const analytics = AdAnalytics.getInstance();
    analytics.trackEvent({
      type: 'started',
      apartmentId,
      sessionId,
      adProvider,
      userType: getUserType(isLoggedIn || false, isSubscribed || false),
      metadata
    });
  }

  /**
   * Track ad completed event
   */
  static trackCompleted(
    apartmentId: string,
    sessionId: string,
    watchDuration?: number,
    adProvider?: string,
    isLoggedIn?: boolean,
    isSubscribed?: boolean,
    metadata?: Record<string, any>
  ): void {
    const analytics = AdAnalytics.getInstance();
    analytics.trackEvent({
      type: 'completed',
      apartmentId,
      sessionId,
      watchDuration,
      adProvider,
      userType: getUserType(isLoggedIn || false, isSubscribed || false),
      metadata
    });
  }

  /**
   * Track ad skipped event
   */
  static trackSkipped(
    apartmentId: string,
    sessionId: string,
    watchDuration: number,
    adProvider?: string,
    isLoggedIn?: boolean,
    isSubscribed?: boolean,
    metadata?: Record<string, any>
  ): void {
    const analytics = AdAnalytics.getInstance();
    analytics.trackEvent({
      type: 'skipped',
      apartmentId,
      sessionId,
      watchDuration,
      adProvider,
      userType: getUserType(isLoggedIn || false, isSubscribed || false),
      metadata
    });
  }

  /**
   * Track agent details unlocked event
   */
  static trackUnlocked(
    apartmentId: string,
    sessionId: string,
    method: 'ad_watched' | 'subscribed',
    isLoggedIn?: boolean,
    isSubscribed?: boolean,
    metadata?: Record<string, any>
  ): void {
    const analytics = AdAnalytics.getInstance();
    analytics.trackEvent({
      type: 'unlocked',
      apartmentId,
      sessionId,
      userType: getUserType(isLoggedIn || false, isSubscribed || false),
      metadata: {
        ...metadata,
        unlockMethod: method
      }
    });
  }

  /**
   * Track a generic ad event
   */
  private trackEvent(event: AdAnalyticsEvent): void {
    const queuedEvent: QueuedEvent = {
      ...event,
      timestamp: Date.now(),
      retryCount: 0
    };

    // Add to queue
    this.eventQueue.push(queuedEvent);

    // Limit queue size
    if (this.eventQueue.length > this.MAX_QUEUE_SIZE) {
      this.eventQueue.shift(); // Remove oldest event
    }

    // Try to send immediately if online and queue is getting full
    if (this.isOnline && this.eventQueue.length >= this.BATCH_SIZE) {
      this.sendBatch();
    }
  }

  /**
   * Setup network connectivity listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Initial online status
    this.isOnline = navigator.onLine;
  }

  /**
   * Start batch timer for periodic sending
   */
  private startBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.sendBatch();
      }
    }, this.BATCH_TIMEOUT);
  }

  /**
   * Process pending events when coming back online
   */
  private processPendingEvents(): void {
    if (this.eventQueue.length > 0) {
      this.sendBatch();
    }
  }

  /**
   * Send a batch of events to the analytics endpoint
   */
  private async sendBatch(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) return;

    // Take up to BATCH_SIZE events from the queue
    const eventsToSend = this.eventQueue.splice(0, this.BATCH_SIZE);

    try {
      const response = await networkAwareFetch('/api/ad-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend.map(event => ({
            type: event.type,
            apartmentId: event.apartmentId,
            sessionId: event.sessionId,
            timestamp: event.timestamp,
            watchDuration: event.watchDuration,
            adProvider: event.adProvider,
            userType: event.userType,
            metadata: event.metadata
          }))
        })
      }, 2); // 2 retries

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      // Events sent successfully
      console.debug(`Sent ${eventsToSend.length} analytics events`);

    } catch (error) {
      console.warn('Failed to send analytics events:', error);

      // Retry failed events
      const retriableEvents = eventsToSend
        .filter(event => event.retryCount < this.MAX_RETRIES)
        .map(event => ({
          ...event,
          retryCount: event.retryCount + 1
        }));

      // Add back to front of queue for retry
      this.eventQueue.unshift(...retriableEvents);

      // Schedule retry
      if (retriableEvents.length > 0) {
        setTimeout(() => {
          this.sendBatch();
        }, this.RETRY_DELAY * Math.pow(2, retriableEvents[0].retryCount)); // Exponential backoff
      }
    }
  }

  /**
   * Get current queue statistics
   */
  getQueueStats(): {
    queueSize: number;
    isOnline: boolean;
    pendingEvents: number;
    failedEvents: number;
  } {
    const pendingEvents = this.eventQueue.filter(e => e.retryCount === 0).length;
    const failedEvents = this.eventQueue.filter(e => e.retryCount > 0).length;

    return {
      queueSize: this.eventQueue.length,
      isOnline: this.isOnline,
      pendingEvents,
      failedEvents
    };
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Force send all queued events immediately
   */
  async flush(): Promise<void> {
    while (this.eventQueue.length > 0 && this.isOnline) {
      await this.sendBatch();
    }
  }

  /**
   * Destroy the analytics instance
   */
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Try to send remaining events
    if (this.isOnline && this.eventQueue.length > 0) {
      this.flush().catch(error => {
        console.warn('Failed to flush analytics events on destroy:', error);
      });
    }

    AdAnalytics.instance = null;
  }

  /**
   * Create a privacy-compliant event payload
   */
  private static createPrivacyCompliantPayload(event: AdAnalyticsEvent): Record<string, any> {
    return {
      type: event.type,
      apartmentId: event.apartmentId,
      sessionId: event.sessionId, // This should be a non-personal session identifier
      timestamp: Date.now(),
      watchDuration: event.watchDuration,
      adProvider: event.adProvider,
      userType: event.userType,
      // Only include non-personal metadata
      metadata: event.metadata ? AdAnalytics.sanitizeMetadata(event.metadata) : undefined
    };
  }

  /**
   * Remove any potentially personal information from metadata
   */
  private static sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    // Allow list of safe metadata keys
    const allowedKeys = [
      'unlockMethod',
      'adDuration',
      'skipTime',
      'deviceType',
      'browserType',
      'screenSize',
      'connectionType',
      'adFormat',
      'adCategory'
    ];

    for (const key of allowedKeys) {
      if (key in metadata) {
        sanitized[key] = metadata[key];
      }
    }

    return sanitized;
  }

  /**
   * Check if analytics is enabled (GDPR compliance)
   */
  static isAnalyticsEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for consent cookie or localStorage flag
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'true';
  }

  /**
   * Enable analytics (set consent)
   */
  static enableAnalytics(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', 'true');
    }
  }

  /**
   * Disable analytics (revoke consent)
   */
  static disableAnalytics(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', 'false');
      // Clear any existing analytics instance
      const instance = AdAnalytics.instance;
      if (instance) {
        instance.clearQueue();
      }
    }
  }
}

// Export convenience functions
export const trackAdImpression = AdAnalytics.trackImpression;
export const trackAdStarted = AdAnalytics.trackStarted;
export const trackAdCompleted = AdAnalytics.trackCompleted;
export const trackAdSkipped = AdAnalytics.trackSkipped;
export const trackAgentDetailsUnlocked = AdAnalytics.trackUnlocked;

export default AdAnalytics;
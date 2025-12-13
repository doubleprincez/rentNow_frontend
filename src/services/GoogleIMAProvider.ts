/**
 * Google IMA SDK Provider
 * 
 * Handles Google Interactive Media Ads (IMA) SDK integration for VAST/VPAID ads
 */

import { AdProvider, AdConfiguration, AdLoadError } from '@/types/ad';
import { loadScript } from '@/utils/adConfig';

// Extend Window interface to include Google IMA SDK
declare global {
  interface Window {
    google?: {
      ima: {
        AdDisplayContainer: new (videoElement: HTMLVideoElement, adContainer: HTMLElement) => any;
        AdsLoader: new () => any;
        AdsManagerLoadedEvent: {
          Type: {
            ADS_MANAGER_LOADED: string;
          };
        };
        AdsRequest: new () => any;
        ViewMode: {
          NORMAL: string;
          FULLSCREEN: string;
        };
        AdEvent: {
          Type: {
            LOADED: string;
            STARTED: string;
            COMPLETE: string;
            SKIPPED: string;
            PAUSED: string;
            RESUMED: string;
            FIRST_QUARTILE: string;
            MIDPOINT: string;
            THIRD_QUARTILE: string;
            USER_CLOSE: string;
            CLICK: string;
            ALL_ADS_COMPLETED: string;
          };
        };
        AdErrorEvent: {
          Type: {
            AD_ERROR: string;
          };
        };
        UiElements: {
          AD_ATTRIBUTION: string;
          COUNTDOWN: string;
        };
        settings: {
          setVpaidMode: (mode: number) => void;
          setDisableCustomPlaybackForIOS10Plus: (disable: boolean) => void;
        };
        VERSION: string;
      };
    };
  }
}

export class GoogleIMAProvider implements AdProvider {
  private adsLoader: any = null;
  private adsManager: any = null;
  private adDisplayContainer: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private adContainer: HTMLElement | null = null;
  private isInitialized = false;
  private isDestroyed = false;

  // Event callbacks
  private onLoadedCallback?: () => void;
  private onStartedCallback?: () => void;
  private onCompleteCallback?: () => void;
  private onSkippedCallback?: () => void;
  private onErrorCallback?: (error: AdLoadError) => void;

  constructor(
    videoElement: HTMLVideoElement,
    adContainer: HTMLElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ) {
    this.videoElement = videoElement;
    this.adContainer = adContainer;
    this.onLoadedCallback = callbacks?.onLoaded;
    this.onStartedCallback = callbacks?.onStarted;
    this.onCompleteCallback = callbacks?.onComplete;
    this.onSkippedCallback = callbacks?.onSkipped;
    this.onErrorCallback = callbacks?.onError;
  }

  /**
   * Initialize Google IMA SDK
   */
  private async initializeIMA(): Promise<void> {
    if (this.isInitialized || this.isDestroyed) return;

    try {
      // Load Google IMA SDK
      await loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js');

      if (!window.google?.ima) {
        throw new Error('Google IMA SDK failed to load');
      }

      // Configure IMA settings
      window.google.ima.settings.setVpaidMode((window.google.ima as any).ImaSdkSettings?.VpaidMode?.ENABLED || 0);
      window.google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);

      this.isInitialized = true;
    } catch (error) {
      const imaError: AdLoadError = new Error('Failed to initialize Google IMA SDK');
      imaError.code = 'IMA_INIT_ERROR';
      imaError.adProvider = 'google_ima';
      throw imaError;
    }
  }

  /**
   * Load ad using VAST tag
   */
  async loadAd(config: AdConfiguration): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('Provider has been destroyed');
    }

    try {
      await this.initializeIMA();

      if (!this.videoElement || !this.adContainer || !window.google?.ima) {
        throw new Error('Required elements or IMA SDK not available');
      }

      // Create ad display container
      this.adDisplayContainer = new window.google.ima.AdDisplayContainer(
        this.videoElement,
        this.adContainer
      );

      // Create ads loader
      this.adsLoader = new window.google.ima.AdsLoader();

      // Add event listeners
      this.adsLoader.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this.onAdsManagerLoaded.bind(this),
        false
      );

      this.adsLoader.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError.bind(this),
        false
      );

      // Create ads request
      const adsRequest = new window.google.ima.AdsRequest();
      adsRequest.adTagUrl = config.vastTag;
      adsRequest.linearAdSlotWidth = this.videoElement.clientWidth;
      adsRequest.linearAdSlotHeight = this.videoElement.clientHeight;
      adsRequest.nonLinearAdSlotWidth = this.videoElement.clientWidth;
      adsRequest.nonLinearAdSlotHeight = this.videoElement.clientHeight / 3;

      // Request ads
      this.adsLoader.requestAds(adsRequest);

    } catch (error) {
      const loadError: AdLoadError = error instanceof Error 
        ? error as AdLoadError
        : new Error('Unknown error loading ad');
      loadError.adProvider = 'google_ima';
      this.onErrorCallback?.(loadError);
      throw loadError;
    }
  }

  /**
   * Handle ads manager loaded event
   */
  private onAdsManagerLoaded(adsManagerLoadedEvent: any): void {
    try {
      // Get the ads manager
      this.adsManager = adsManagerLoadedEvent.getAdsManager(
        this.videoElement,
        {
          width: this.videoElement?.clientWidth || 640,
          height: this.videoElement?.clientHeight || 360
        }
      );

      // Add ads manager event listeners
      this.adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.LOADED,
        this.onAdLoaded.bind(this)
      );

      this.adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.STARTED,
        this.onAdStarted.bind(this)
      );

      this.adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.COMPLETE,
        this.onAdComplete.bind(this)
      );

      this.adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.SKIPPED,
        this.onAdSkipped.bind(this)
      );

      this.adsManager.addEventListener(
        window.google!.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError.bind(this)
      );

      // Initialize ads manager
      this.adsManager.init(
        this.videoElement?.clientWidth || 640,
        this.videoElement?.clientHeight || 360,
        window.google!.ima.ViewMode.NORMAL
      );

    } catch (error) {
      const managerError: AdLoadError = new Error('Failed to initialize ads manager');
      managerError.code = 'ADS_MANAGER_ERROR';
      managerError.adProvider = 'google_ima';
      this.onErrorCallback?.(managerError);
    }
  }

  /**
   * Handle ad loaded event
   */
  private onAdLoaded(): void {
    this.onLoadedCallback?.();
  }

  /**
   * Handle ad started event
   */
  private onAdStarted(): void {
    this.onStartedCallback?.();
  }

  /**
   * Handle ad complete event
   */
  private onAdComplete(): void {
    this.onCompleteCallback?.();
  }

  /**
   * Handle ad skipped event
   */
  private onAdSkipped(): void {
    this.onSkippedCallback?.();
  }

  /**
   * Handle ad error event
   */
  private onAdError(adErrorEvent: any): void {
    const error: AdLoadError = new Error(adErrorEvent.getError()?.getMessage() || 'Ad error occurred');
    error.code = adErrorEvent.getError()?.getErrorCode()?.toString() || 'UNKNOWN_ERROR';
    error.adProvider = 'google_ima';
    error.vastErrorCode = adErrorEvent.getError()?.getVastErrorCode?.() || undefined;
    
    this.onErrorCallback?.(error);
  }

  /**
   * Start ad playback
   */
  play(): void {
    if (this.adsManager && !this.isDestroyed) {
      try {
        // Initialize ad display container
        this.adDisplayContainer?.initialize();
        
        // Start ads manager
        this.adsManager.start();
      } catch (error) {
        const playError: AdLoadError = new Error('Failed to start ad playback');
        playError.code = 'PLAYBACK_ERROR';
        playError.adProvider = 'google_ima';
        this.onErrorCallback?.(playError);
      }
    }
  }

  /**
   * Pause ad playback
   */
  pause(): void {
    if (this.adsManager && !this.isDestroyed) {
      try {
        this.adsManager.pause();
      } catch (error) {
        console.warn('Failed to pause ad:', error);
      }
    }
  }

  /**
   * Resume ad playback
   */
  resume(): void {
    if (this.adsManager && !this.isDestroyed) {
      try {
        this.adsManager.resume();
      } catch (error) {
        console.warn('Failed to resume ad:', error);
      }
    }
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (this.adsManager && !this.isDestroyed) {
      try {
        return this.adsManager.getCurrentTime() || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  /**
   * Get ad duration
   */
  getDuration(): number {
    if (this.adsManager && !this.isDestroyed) {
      try {
        return this.adsManager.getDuration() || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  /**
   * Check if ad is completed
   */
  isCompleted(): boolean {
    // This would need to be tracked through event handlers
    return false;
  }

  /**
   * Resize ads manager
   */
  resize(width: number, height: number): void {
    if (this.adsManager && !this.isDestroyed) {
      try {
        this.adsManager.resize(width, height, window.google!.ima.ViewMode.NORMAL);
      } catch (error) {
        console.warn('Failed to resize ad:', error);
      }
    }
  }

  /**
   * Destroy the provider and clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;

    try {
      if (this.adsManager) {
        this.adsManager.destroy();
        this.adsManager = null;
      }

      if (this.adsLoader) {
        this.adsLoader.destroy();
        this.adsLoader = null;
      }

      this.adDisplayContainer = null;
      this.videoElement = null;
      this.adContainer = null;
      this.isDestroyed = true;
    } catch (error) {
      console.warn('Error during IMA provider cleanup:', error);
    }
  }

  /**
   * Check if IMA SDK is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.google?.ima;
  }

  /**
   * Get IMA SDK version
   */
  static getVersion(): string {
    return window.google?.ima?.VERSION || 'Unknown';
  }
}
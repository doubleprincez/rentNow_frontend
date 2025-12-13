/**
 * Custom Video Ad Provider
 * 
 * Handles direct HTML5 video element integration as fallback for ad networks
 */

import { AdProvider, AdConfiguration, AdLoadError } from '@/types/ad';

export class CustomVideoAdProvider implements AdProvider {
  private videoElement: HTMLVideoElement | null = null;
  private isDestroyed = false;
  private startTime = 0;
  private completed = false;
  private isSkipped = false;

  // Event callbacks
  private onLoadedCallback?: () => void;
  private onStartedCallback?: () => void;
  private onCompleteCallback?: () => void;
  private onSkippedCallback?: () => void;
  private onErrorCallback?: (error: AdLoadError) => void;

  constructor(
    videoElement: HTMLVideoElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ) {
    this.videoElement = videoElement;
    this.onLoadedCallback = callbacks?.onLoaded;
    this.onStartedCallback = callbacks?.onStarted;
    this.onCompleteCallback = callbacks?.onComplete;
    this.onSkippedCallback = callbacks?.onSkipped;
    this.onErrorCallback = callbacks?.onError;

    this.setupEventListeners();
  }

  /**
   * Set up video element event listeners
   */
  private setupEventListeners(): void {
    if (!this.videoElement || this.isDestroyed) return;

    const video = this.videoElement;

    // Handle video loaded
    const handleLoadedData = () => {
      this.onLoadedCallback?.();
    };

    // Handle video started
    const handlePlay = () => {
      if (this.startTime === 0) {
        this.startTime = Date.now();
        this.onStartedCallback?.();
      }
    };

    // Handle video ended
    const handleEnded = () => {
      if (!this.isSkipped) {
        this.completed = true;
        this.onCompleteCallback?.();
      }
    };

    // Handle video errors
    const handleError = () => {
      const error: AdLoadError = new Error('Video failed to load or play');
      error.code = 'VIDEO_ERROR';
      error.adProvider = 'custom';
      this.onErrorCallback?.(error);
    };

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Store cleanup function
    this.cleanup = () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }

  private cleanup?: () => void;

  /**
   * Load ad using custom video URL
   */
  async loadAd(config: AdConfiguration): Promise<void> {
    if (this.isDestroyed || !this.videoElement) {
      throw new Error('Provider has been destroyed or video element not available');
    }

    try {
      let videoUrl: string | undefined;

      switch (config.provider) {
        case 'custom':
          videoUrl = config.customVideoUrl;
          break;
        case 'fallback':
          videoUrl = config.fallbackContent?.videoUrl;
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      if (!videoUrl) {
        throw new Error('No video URL provided');
      }

      // Validate video URL
      if (!this.isValidVideoUrl(videoUrl)) {
        throw new Error('Invalid video URL format');
      }

      // Set video source
      this.videoElement.src = videoUrl;
      this.videoElement.load();

      // Wait for video to be ready
      await this.waitForVideoReady();

    } catch (error) {
      const loadError: AdLoadError = error instanceof Error 
        ? error as AdLoadError
        : new Error('Unknown error loading custom video ad');
      loadError.adProvider = 'custom';
      this.onErrorCallback?.(loadError);
      throw loadError;
    }
  }

  /**
   * Validate video URL format
   */
  private isValidVideoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);
      const validExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );
      
      // Allow URLs without extensions (streaming URLs, etc.)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || hasValidExtension;
    } catch {
      return false;
    }
  }

  /**
   * Wait for video to be ready for playback
   */
  private waitForVideoReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.videoElement) {
        reject(new Error('Video element not available'));
        return;
      }

      const video = this.videoElement;
      const timeout = setTimeout(() => {
        reject(new Error('Video load timeout'));
      }, 10000); // 10 second timeout

      const handleCanPlay = () => {
        clearTimeout(timeout);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = () => {
        clearTimeout(timeout);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        reject(new Error('Video failed to load'));
      };

      if (video.readyState >= 3) { // HAVE_FUTURE_DATA
        resolve();
      } else {
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
      }
    });
  }

  /**
   * Start video playback
   */
  play(): void {
    if (this.videoElement && !this.isDestroyed) {
      this.videoElement.play().catch(error => {
        const playError: AdLoadError = new Error('Failed to start video playback');
        playError.code = 'PLAYBACK_ERROR';
        playError.adProvider = 'custom';
        this.onErrorCallback?.(playError);
      });
    }
  }

  /**
   * Pause video playback
   */
  pause(): void {
    if (this.videoElement && !this.isDestroyed) {
      this.videoElement.pause();
    }
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (this.videoElement && !this.isDestroyed) {
      return this.videoElement.currentTime;
    }
    return 0;
  }

  /**
   * Get video duration
   */
  getDuration(): number {
    if (this.videoElement && !this.isDestroyed) {
      return this.videoElement.duration || 0;
    }
    return 0;
  }

  /**
   * Check if video is completed
   */
  isCompleted(): boolean {
    return this.completed;
  }

  /**
   * Skip the current ad
   */
  skip(): void {
    if (this.isDestroyed || this.completed || this.isSkipped) return;

    this.isSkipped = true;
    
    if (this.videoElement) {
      this.videoElement.pause();
    }

    this.onSkippedCallback?.();
  }

  /**
   * Get watch duration in milliseconds
   */
  getWatchDuration(): number {
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Check if video is currently playing
   */
  isPlaying(): boolean {
    if (!this.videoElement || this.isDestroyed) return false;
    return !this.videoElement.paused && !this.videoElement.ended && this.videoElement.readyState > 2;
  }

  /**
   * Set video volume
   */
  setVolume(volume: number): void {
    if (this.videoElement && !this.isDestroyed) {
      this.videoElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Mute/unmute video
   */
  setMuted(muted: boolean): void {
    if (this.videoElement && !this.isDestroyed) {
      this.videoElement.muted = muted;
    }
  }

  /**
   * Seek to specific time
   */
  seekTo(time: number): void {
    if (this.videoElement && !this.isDestroyed) {
      this.videoElement.currentTime = Math.max(0, Math.min(this.getDuration(), time));
    }
  }

  /**
   * Get video metadata
   */
  getMetadata(): {
    duration: number;
    currentTime: number;
    volume: number;
    muted: boolean;
    readyState: number;
    networkState: number;
  } {
    if (!this.videoElement || this.isDestroyed) {
      return {
        duration: 0,
        currentTime: 0,
        volume: 0,
        muted: true,
        readyState: 0,
        networkState: 0
      };
    }

    return {
      duration: this.videoElement.duration || 0,
      currentTime: this.videoElement.currentTime,
      volume: this.videoElement.volume,
      muted: this.videoElement.muted,
      readyState: this.videoElement.readyState,
      networkState: this.videoElement.networkState
    };
  }

  /**
   * Destroy the provider and clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;

    try {
      // Clean up event listeners
      this.cleanup?.();

      // Stop video playback
      if (this.videoElement) {
        this.videoElement.pause();
        this.videoElement.src = '';
        this.videoElement.load();
      }

      this.videoElement = null;
      this.isDestroyed = true;
    } catch (error) {
      console.warn('Error during custom video provider cleanup:', error);
    }
  }

  /**
   * Check if custom video provider is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && 'HTMLVideoElement' in window;
  }

  /**
   * Create fallback promotional video configuration
   */
  static createFallbackConfig(): AdConfiguration {
    return {
      provider: 'fallback',
      skipDelay: 5,
      fallbackContent: {
        videoUrl: '/videos/platform-promo.mp4',
        title: 'Welcome to RentNow.ng',
        description: 'Your trusted platform for finding quality rental properties'
      }
    };
  }

  /**
   * Validate video file format support
   */
  static canPlayType(mimeType: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const video = document.createElement('video');
    const canPlay = video.canPlayType(mimeType);
    return canPlay === 'probably' || canPlay === 'maybe';
  }

  /**
   * Get supported video formats
   */
  static getSupportedFormats(): string[] {
    const formats = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime'
    ];

    return formats.filter(format => CustomVideoAdProvider.canPlayType(format));
  }
}
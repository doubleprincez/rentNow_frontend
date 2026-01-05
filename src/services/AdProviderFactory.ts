/**
 * Ad Provider Factory
 * 
 * Handles ad provider selection logic, configuration validation, and fallback mechanisms
 */

import { AdProvider, AdConfiguration, AdLoadError } from '@/types/ad';
import { GoogleIMAProvider } from './GoogleIMAProvider';
import { CustomVideoAdProvider } from './CustomVideoAdProvider';
import { validateAdConfiguration, getFallbackConfiguration } from '@/utils/adConfig';

export class AdProviderFactory {
  /**
   * Create appropriate ad provider based on configuration
   */
  static async createProvider(
    config: AdConfiguration,
    videoElement: HTMLVideoElement,
    adContainer?: HTMLElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ): Promise<AdProvider> {
    // Validate configuration
    if (!validateAdConfiguration(config)) {
      throw new Error('Invalid ad configuration');
    }

    try {
      switch (config.provider) {
        case 'google_ima':
          return await this.createGoogleIMAProvider(config, videoElement, adContainer, callbacks);
        
        case 'google_adsense':
          // For now, treat AdSense similar to IMA
          return await this.createGoogleIMAProvider(config, videoElement, adContainer, callbacks);
        
        case 'custom':
          return this.createCustomVideoProvider(config, videoElement, callbacks);
        
        case 'fallback':
          return this.createFallbackProvider(config, videoElement, callbacks);
        
        default:
          throw new Error(`Unsupported ad provider: ${config.provider}`);
      }
    } catch (error) {
      // If primary provider fails, try fallback
      console.warn('Primary ad provider failed, falling back to custom video:', error);
      return this.createFallbackProvider(getFallbackConfiguration(), videoElement, callbacks);
    }
  }

  /**
   * Create Google IMA provider
   */
  private static async createGoogleIMAProvider(
    config: AdConfiguration,
    videoElement: HTMLVideoElement,
    adContainer?: HTMLElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ): Promise<GoogleIMAProvider> {
    if (!adContainer) {
      throw new Error('Ad container required for Google IMA provider');
    }

    if (!config.vastTag) {
      throw new Error('VAST tag required for Google IMA provider');
    }

    const provider = new GoogleIMAProvider(videoElement, adContainer, callbacks);
    await provider.loadAd(config);
    return provider;
  }

  /**
   * Create custom video provider
   */
  private static createCustomVideoProvider(
    config: AdConfiguration,
    videoElement: HTMLVideoElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ): CustomVideoAdProvider {
    if (!config.customVideoUrl) {
      throw new Error('Custom video URL required for custom provider');
    }

    return new CustomVideoAdProvider(videoElement, callbacks);
  }

  /**
   * Create fallback provider
   */
  private static createFallbackProvider(
    config: AdConfiguration,
    videoElement: HTMLVideoElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ): CustomVideoAdProvider {
    if (!config.fallbackContent?.videoUrl) {
      throw new Error('Fallback video URL required for fallback provider');
    }

    return new CustomVideoAdProvider(videoElement, callbacks);
  }

  /**
   * Get provider priority order based on availability and configuration
   */
  static getProviderPriority(config: AdConfiguration): AdConfiguration['provider'][] {
    const priority: AdConfiguration['provider'][] = [];

    // Add configured provider first
    priority.push(config.provider);

    // Add fallback providers in order of preference
    if (config.provider !== 'google_ima' && config.vastTag) {
      priority.push('google_ima');
    }

    if (config.provider !== 'custom' && config.customVideoUrl) {
      priority.push('custom');
    }

    // Always add fallback as last resort
    if (config.provider !== 'fallback') {
      priority.push('fallback');
    }

    return priority;
  }

  /**
   * Test provider availability
   */
  static async testProviderAvailability(provider: AdConfiguration['provider']): Promise<boolean> {
    try {
      switch (provider) {
        case 'google_ima':
          return GoogleIMAProvider.isAvailable();
        
        case 'google_adsense':
          return GoogleIMAProvider.isAvailable();
        
        case 'custom':
        case 'fallback':
          return CustomVideoAdProvider.isAvailable();
        
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Create provider with automatic fallback
   */
  static async createProviderWithFallback(
    config: AdConfiguration,
    videoElement: HTMLVideoElement,
    adContainer?: HTMLElement,
    callbacks?: {
      onLoaded?: () => void;
      onStarted?: () => void;
      onComplete?: () => void;
      onSkipped?: () => void;
      onError?: (error: AdLoadError) => void;
    }
  ): Promise<{
    provider: AdProvider;
    usedProvider: AdConfiguration['provider'];
    config: AdConfiguration;
  }> {
    const priorityList = this.getProviderPriority(config);
    let lastError: Error | null = null;

    for (const providerType of priorityList) {
      try {
        // Test if provider is available
        const isAvailable = await this.testProviderAvailability(providerType);
        if (!isAvailable) {
          continue;
        }

        // Create configuration for this provider
        const providerConfig = this.createConfigForProvider(config, providerType);
        
        // Validate configuration
        if (!validateAdConfiguration(providerConfig)) {
          continue;
        }

        // Create provider
        const provider = await this.createProvider(
          providerConfig,
          videoElement,
          adContainer,
          callbacks
        );

        return {
          provider,
          usedProvider: providerType,
          config: providerConfig
        };

      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to create ${providerType} provider:`, error);
        continue;
      }
    }

    // If all providers failed, throw the last error
    throw lastError || new Error('No ad providers available');
  }

  /**
   * Create configuration for specific provider
   */
  private static createConfigForProvider(
    baseConfig: AdConfiguration,
    provider: AdConfiguration['provider']
  ): AdConfiguration {
    const config: AdConfiguration = {
      ...baseConfig,
      provider
    };

    switch (provider) {
      case 'fallback':
        if (!config.fallbackContent) {
          config.fallbackContent = {
            videoUrl: '/videos/platform-promo.mp4',
            title: 'Welcome to RentNow.ng',
            description: 'Your trusted platform for finding quality rental properties'
          };
        }
        break;
    }

    return config;
  }

  /**
   * Get provider capabilities
   */
  static getProviderCapabilities(provider: AdConfiguration['provider']): {
    supportsSkip: boolean;
    supportsVAST: boolean;
    supportsVPAID: boolean;
    supportsAnalytics: boolean;
    requiresContainer: boolean;
  } {
    switch (provider) {
      case 'google_ima':
      case 'google_adsense':
        return {
          supportsSkip: true,
          supportsVAST: true,
          supportsVPAID: true,
          supportsAnalytics: true,
          requiresContainer: true
        };
      
      case 'custom':
      case 'fallback':
        return {
          supportsSkip: true,
          supportsVAST: false,
          supportsVPAID: false,
          supportsAnalytics: false,
          requiresContainer: false
        };
      
      default:
        return {
          supportsSkip: false,
          supportsVAST: false,
          supportsVPAID: false,
          supportsAnalytics: false,
          requiresContainer: false
        };
    }
  }

  /**
   * Validate provider requirements
   */
  static validateProviderRequirements(
    config: AdConfiguration,
    hasAdContainer: boolean
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const capabilities = this.getProviderCapabilities(config.provider);

    // Check container requirement
    if (capabilities.requiresContainer && !hasAdContainer) {
      errors.push(`${config.provider} provider requires an ad container element`);
    }

    // Check provider-specific requirements
    switch (config.provider) {
      case 'google_ima':
      case 'google_adsense':
        if (!config.vastTag && !config.adUnitId) {
          errors.push('Google providers require either vastTag or adUnitId');
        }
        break;
      
      case 'custom':
        if (!config.customVideoUrl) {
          errors.push('Custom provider requires customVideoUrl');
        }
        break;
      
      case 'fallback':
        if (!config.fallbackContent?.videoUrl) {
          errors.push('Fallback provider requires fallbackContent.videoUrl');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
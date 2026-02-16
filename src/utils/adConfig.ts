/**
 * Ad Configuration Utility
 * 
 * Handles ad provider configuration, validation, and fallback mechanisms
 */

import { AdConfiguration, AdConfig } from '@/types/ad';
import {
  GOOGLE_IMA_SDK_URL,
  GOOGLE_ADSENSE_CLIENT_ID,
  GOOGLE_AD_MANAGER_NETWORK_CODE,
  CUSTOM_AD_ENDPOINT,
  AD_SKIP_DELAY,
  AD_SESSION_DURATION,
  ANALYTICS_ENDPOINT
} from '@/../next.config';

/**
 * Get ad configuration from next.config.ts constants
 */
export function getAdConfig(): AdConfig {
  return {
    GOOGLE_IMA_SDK_URL,
    GOOGLE_ADSENSE_CLIENT_ID: GOOGLE_ADSENSE_CLIENT_ID || undefined,
    GOOGLE_AD_MANAGER_NETWORK_CODE: GOOGLE_AD_MANAGER_NETWORK_CODE || undefined,
    CUSTOM_AD_ENDPOINT: CUSTOM_AD_ENDPOINT || undefined,
    AD_SKIP_DELAY,
    SESSION_DURATION: AD_SESSION_DURATION,
    ANALYTICS_ENDPOINT
  };
}

/**
 * Create ad configuration based on environment and preferences
 */
export function createAdConfiguration(): AdConfiguration {
  const config = getAdConfig();

  // Determine provider based on available configuration
  let provider: AdConfiguration['provider'] = 'fallback';
  let vastTag: string | undefined;
  let adUnitId: string | undefined;

  if (config.GOOGLE_AD_MANAGER_NETWORK_CODE) {
    provider = 'google_ima';
    // Use your actual Ad Manager network code to generate VAST tag
    vastTag = `https://pubads.g.doubleclick.net/gampad/ads?iu=/${config.GOOGLE_AD_MANAGER_NETWORK_CODE}/rentnow_video_ads&sz=640x480&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&url=[referrer_url]&description_url=[description_url]&tfcd=0&npa=0&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=${Date.now()}`;
  } else if (config.GOOGLE_ADSENSE_CLIENT_ID) {
    provider = 'google_adsense';
    adUnitId = config.GOOGLE_ADSENSE_CLIENT_ID;
  } else if (config.CUSTOM_AD_ENDPOINT) {
    provider = 'custom';
  }

  return {
    provider,
    vastTag,
    adUnitId,
    customVideoUrl: config.CUSTOM_AD_ENDPOINT,
    skipDelay: config.AD_SKIP_DELAY,
    fallbackContent: {
      videoUrl: '/videos/platform-promo.mp4', // Fallback promotional video
      title: 'Discover Amazing Properties on RentNow.ng',
      description: 'Find your perfect home with thousands of verified listings'
    }
  };
}

/**
 * Validate ad configuration
 */
export function validateAdConfiguration(config: AdConfiguration): boolean {
  if (!config.provider) return false;

  switch (config.provider) {
    case 'google_ima':
      return !!config.vastTag;
    case 'google_adsense':
      return !!config.adUnitId;
    case 'custom':
      return !!config.customVideoUrl;
    case 'fallback':
      return !!config.fallbackContent?.videoUrl;
    default:
      return false;
  }
}

/**
 * Get fallback configuration when primary provider fails
 */
export function getFallbackConfiguration(): AdConfiguration {
  return {
    provider: 'fallback',
    skipDelay: AD_SKIP_DELAY,
    fallbackContent: {
      videoUrl: '/videos/platform-promo.mp4',
      title: 'Welcome to RentNow.ng',
      description: 'Your trusted platform for finding quality rental properties'
    }
  };
}

/**
 * Create VAST tag URL for Google Ad Manager
 */
export function createVastTagUrl(networkCode: string, adUnitPath: string): string {
  const correlator = Date.now();
  return `https://pubads.g.doubleclick.net/gampad/ads?iu=/${networkCode}/${adUnitPath}&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=${correlator}`;
}

/**
 * Check if ad blocker is likely present
 */
export function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    // Create a test element that ad blockers typically block
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
}

/**
 * Load external script dynamically
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
}

/**
 * Get user type for analytics
 */
export function getUserType(isLoggedIn: boolean, isSubscribed: boolean): 'guest' | 'authenticated' | 'subscribed' {
  if (isSubscribed) return 'subscribed';
  if (isLoggedIn) return 'authenticated';
  return 'guest';
}

export default {
  getAdConfig,
  createAdConfiguration,
  validateAdConfiguration,
  getFallbackConfiguration,
  createVastTagUrl,
  detectAdBlocker,
  loadScript,
  getUserType
};
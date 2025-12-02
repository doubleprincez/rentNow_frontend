/**
 * Ad Configuration Utility
 * 
 * Handles ad provider configuration, validation, and fallback mechanisms
 */

import { AdConfiguration, AdConfig } from '@/types/ad';

// Default configuration values
const DEFAULT_CONFIG: AdConfig = {
  GOOGLE_IMA_SDK_URL: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
  AD_SKIP_DELAY: 5, // 5 seconds
  SESSION_DURATION: 240, // 4 minutes in seconds
  ANALYTICS_ENDPOINT: '/api/ad-analytics'
};

/**
 * Get ad configuration from environment variables
 */
export function getAdConfig(): AdConfig {
  return {
    GOOGLE_IMA_SDK_URL: process.env.NEXT_PUBLIC_GOOGLE_IMA_SDK_URL || DEFAULT_CONFIG.GOOGLE_IMA_SDK_URL,
    GOOGLE_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
    GOOGLE_AD_MANAGER_NETWORK_CODE: process.env.NEXT_PUBLIC_GOOGLE_AD_MANAGER_NETWORK_CODE,
    CUSTOM_AD_ENDPOINT: process.env.NEXT_PUBLIC_CUSTOM_AD_ENDPOINT,
    AD_SKIP_DELAY: parseInt(process.env.NEXT_PUBLIC_AD_SKIP_DELAY || '5'),
    SESSION_DURATION: parseInt(process.env.NEXT_PUBLIC_AD_SESSION_DURATION || '240'),
    ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || DEFAULT_CONFIG.ANALYTICS_ENDPOINT
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
    // Example VAST tag for Google Ad Manager
    vastTag = `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=${Date.now()}`;
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
    skipDelay: DEFAULT_CONFIG.AD_SKIP_DELAY,
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
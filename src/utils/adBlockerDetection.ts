/**
 * Ad Blocker Detection Utility
 * 
 * Detects if ad blocker software is present and provides appropriate messaging
 */

export interface AdBlockerDetectionResult {
  isBlocked: boolean;
  method: 'element' | 'request' | 'script' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detect ad blocker using multiple methods
 */
export async function detectAdBlocker(): Promise<AdBlockerDetectionResult> {
  const results = await Promise.allSettled([
    detectByElement(),
    detectByRequest(),
    detectByScript()
  ]);

  // Analyze results and return most confident detection
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.isBlocked) {
      return result.value;
    }
  }

  return {
    isBlocked: false,
    method: 'unknown',
    confidence: 'low'
  };
}

/**
 * Detect ad blocker by creating test elements
 */
function detectByElement(): Promise<AdBlockerDetectionResult> {
  return new Promise((resolve) => {
    try {
      // Create elements that ad blockers typically hide
      const testElements = [
        { className: 'adsbox', tagName: 'div' },
        { className: 'ad-banner', tagName: 'div' },
        { className: 'advertisement', tagName: 'div' },
        { className: 'google-ad', tagName: 'div' }
      ];

      let blockedCount = 0;

      testElements.forEach(({ className, tagName }) => {
        const element = document.createElement(tagName);
        element.className = className;
        element.style.position = 'absolute';
        element.style.left = '-10000px';
        element.style.width = '1px';
        element.style.height = '1px';
        element.innerHTML = '&nbsp;';

        document.body.appendChild(element);

        setTimeout(() => {
          const isBlocked = element.offsetHeight === 0 || 
                           element.offsetWidth === 0 || 
                           element.style.display === 'none' ||
                           element.style.visibility === 'hidden';

          if (isBlocked) {
            blockedCount++;
          }

          document.body.removeChild(element);

          // If this is the last element, resolve
          if (testElements.indexOf({ className, tagName }) === testElements.length - 1) {
            const isBlocked = blockedCount > 0;
            resolve({
              isBlocked,
              method: 'element',
              confidence: blockedCount >= 2 ? 'high' : 'medium'
            });
          }
        }, 100);
      });
    } catch (error) {
      resolve({
        isBlocked: false,
        method: 'element',
        confidence: 'low'
      });
    }
  });
}

/**
 * Detect ad blocker by making test requests
 */
function detectByRequest(): Promise<AdBlockerDetectionResult> {
  return new Promise((resolve) => {
    try {
      // Test URLs that ad blockers typically block
      const testUrls = [
        '/ads.js',
        '/google-ads.js',
        '/advertisement.js'
      ];

      let blockedCount = 0;
      let completedRequests = 0;

      testUrls.forEach(url => {
        const img = new Image();
        
        img.onload = () => {
          completedRequests++;
          checkComplete();
        };

        img.onerror = () => {
          blockedCount++;
          completedRequests++;
          checkComplete();
        };

        // Set a small timeout
        setTimeout(() => {
          if (completedRequests < testUrls.length) {
            blockedCount++;
            completedRequests++;
            checkComplete();
          }
        }, 1000);

        img.src = url + '?t=' + Date.now();
      });

      function checkComplete() {
        if (completedRequests >= testUrls.length) {
          const isBlocked = blockedCount === testUrls.length;
          resolve({
            isBlocked,
            method: 'request',
            confidence: isBlocked ? 'high' : 'medium'
          });
        }
      }
    } catch (error) {
      resolve({
        isBlocked: false,
        method: 'request',
        confidence: 'low'
      });
    }
  });
}

/**
 * Detect ad blocker by checking for blocked scripts
 */
function detectByScript(): Promise<AdBlockerDetectionResult> {
  return new Promise((resolve) => {
    try {
      // Check if common ad-related global variables are blocked
      const adVariables = [
        'google_ad_client',
        'googletag',
        'adsbygoogle'
      ];

      const blockedVariables = adVariables.filter(variable => {
        return typeof (window as any)[variable] === 'undefined';
      });

      // Check for ad blocker specific properties
      const adBlockerIndicators = [
        () => !!(window as any).uBlock,
        () => !!(window as any).AdBlock,
        () => !!(window as any).adblockplus,
        () => {
          try {
            return (window as any).getComputedStyle(document.createElement('div')).display === 'none';
          } catch {
            return false;
          }
        }
      ];

      const detectedIndicators = adBlockerIndicators.filter(check => {
        try {
          return check();
        } catch {
          return false;
        }
      });

      const isBlocked = blockedVariables.length > 0 || detectedIndicators.length > 0;

      resolve({
        isBlocked,
        method: 'script',
        confidence: detectedIndicators.length > 0 ? 'high' : 'medium'
      });
    } catch (error) {
      resolve({
        isBlocked: false,
        method: 'script',
        confidence: 'low'
      });
    }
  });
}

/**
 * Get user-friendly message for ad blocker detection
 */
export function getAdBlockerMessage(result: AdBlockerDetectionResult): {
  title: string;
  message: string;
  suggestion: string;
} {
  if (!result.isBlocked) {
    return {
      title: 'No Ad Blocker Detected',
      message: 'Advertisements should load normally.',
      suggestion: 'If you\'re still having issues, please check your internet connection.'
    };
  }

  return {
    title: 'Ad Blocker Detected',
    message: 'It looks like you have ad blocking software enabled. This prevents advertisements from loading.',
    suggestion: 'To view agent contact details, please disable your ad blocker for this site or consider subscribing for an ad-free experience.'
  };
}

/**
 * Check if specific ad provider is likely blocked
 */
export async function isProviderBlocked(provider: 'google' | 'custom'): Promise<boolean> {
  switch (provider) {
    case 'google':
      return checkGoogleAdsBlocked();
    case 'custom':
      return checkCustomAdsBlocked();
    default:
      return false;
  }
}

/**
 * Check if Google Ads is blocked
 */
async function checkGoogleAdsBlocked(): Promise<boolean> {
  try {
    // Try to load Google Ads script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    
    return new Promise((resolve) => {
      script.onload = () => {
        document.head.removeChild(script);
        resolve(false); // Not blocked
      };
      
      script.onerror = () => {
        document.head.removeChild(script);
        resolve(true); // Blocked
      };
      
      setTimeout(() => {
        if (script.parentNode) {
          document.head.removeChild(script);
        }
        resolve(true); // Assume blocked if timeout
      }, 3000);
      
      document.head.appendChild(script);
    });
  } catch {
    return true;
  }
}

/**
 * Check if custom ads are blocked
 */
async function checkCustomAdsBlocked(): Promise<boolean> {
  try {
    // Test if we can create and display ad-like elements
    const testElement = document.createElement('div');
    testElement.className = 'custom-ad-test';
    testElement.style.width = '300px';
    testElement.style.height = '250px';
    testElement.style.position = 'absolute';
    testElement.style.left = '-10000px';
    
    document.body.appendChild(testElement);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const isBlocked = testElement.offsetHeight === 0 || testElement.offsetWidth === 0;
        document.body.removeChild(testElement);
        resolve(isBlocked);
      }, 100);
    });
  } catch {
    return true;
  }
}

/**
 * Show ad blocker notification to user
 */
export function showAdBlockerNotification(onDisable?: () => void, onSubscribe?: () => void) {
  // This would integrate with your notification system
  // For now, we'll just log it
  console.warn('Ad blocker detected. Some features may not work properly.');
  
  // You could show a toast notification or modal here
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('Ad Blocker Detected', {
        body: 'Please disable your ad blocker or subscribe for the best experience.',
        icon: '/favicon.ico'
      });
    }
  }
}
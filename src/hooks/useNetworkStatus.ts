/**
 * Network Status Hook
 * 
 * Provides network connectivity status and handles offline scenarios
 */

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
}

export interface UseNetworkStatusReturn extends NetworkStatus {
  retryConnection: () => Promise<boolean>;
  isRetrying: boolean;
}

/**
 * Hook to monitor network connectivity status
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('4g');
  const [isRetrying, setIsRetrying] = useState(false);

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    setIsOnline(navigator.onLine);

    // Check connection quality if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || '4g');
        
        // Consider 2g and slow-2g as slow connections
        const slowTypes = ['slow-2g', '2g'];
        setIsSlowConnection(slowTypes.includes(connection.effectiveType));
      }
    }
  }, []);

  // Retry connection by making a test request
  const retryConnection = useCallback(async (): Promise<boolean> => {
    setIsRetrying(true);
    
    try {
      // Make a lightweight request to test connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health-check', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      setIsOnline(isConnected);
      
      return isConnected;
    } catch (error) {
      setIsOnline(false);
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Initial status
    updateNetworkStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateNetworkStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection quality changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }
    };
  }, [updateNetworkStatus]);

  return {
    isOnline,
    isSlowConnection,
    connectionType,
    effectiveType,
    retryConnection,
    isRetrying
  };
}

/**
 * Hook for handling offline queue functionality
 */
export function useOfflineQueue<T>(
  processItem: (item: T) => Promise<void>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    storageKey?: string;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, storageKey = 'offline_queue' } = options;
  const { isOnline } = useNetworkStatus();
  const [queue, setQueue] = useState<Array<T & { retryCount: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load queue from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
    }
  }, [storageKey]);

  // Save queue to storage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }, [queue, storageKey]);

  // Process queue when online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [isOnline, queue.length, isProcessing]);

  const addToQueue = useCallback((item: T) => {
    setQueue(prev => [...prev, { ...item, retryCount: 0 }]);
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);

    const itemsToProcess = [...queue];
    const failedItems: Array<T & { retryCount: number }> = [];

    for (const item of itemsToProcess) {
      try {
        await processItem(item);
        // Item processed successfully, remove from queue
      } catch (error) {
        console.warn('Failed to process queue item:', error);
        
        if (item.retryCount < maxRetries) {
          // Add back to queue with incremented retry count
          failedItems.push({ ...item, retryCount: item.retryCount + 1 });
        }
        // If max retries exceeded, item is dropped
      }
    }

    setQueue(failedItems);
    setIsProcessing(false);

    // If there are failed items, retry after delay
    if (failedItems.length > 0) {
      setTimeout(() => {
        if (isOnline) {
          processQueue();
        }
      }, retryDelay);
    }
  }, [isProcessing, queue, processItem, maxRetries, retryDelay, isOnline]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    addToQueue,
    queueSize: queue.length,
    isProcessing,
    clearQueue
  };
}

/**
 * Network-aware fetch wrapper
 */
export async function networkAwareFetch(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry on network errors
    if (retries > 0 && (
      error instanceof TypeError || // Network error
      (error as Error).name === 'AbortError' // Timeout
    )) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return networkAwareFetch(url, options, retries - 1);
    }

    throw error;
  }
}

/**
 * Check if current connection is suitable for video content
 */
export function isConnectionSuitableForVideo(networkStatus: NetworkStatus): boolean {
  if (!networkStatus.isOnline) return false;
  
  // Consider slow connections unsuitable for video
  if (networkStatus.isSlowConnection) return false;
  
  // Check effective connection type
  const unsuitableTypes = ['slow-2g', '2g'];
  return !unsuitableTypes.includes(networkStatus.effectiveType);
}

/**
 * Get recommended video quality based on connection
 */
export function getRecommendedVideoQuality(networkStatus: NetworkStatus): 'low' | 'medium' | 'high' {
  if (!networkStatus.isOnline || networkStatus.isSlowConnection) {
    return 'low';
  }

  switch (networkStatus.effectiveType) {
    case '4g':
      return 'high';
    case '3g':
      return 'medium';
    default:
      return 'low';
  }
}
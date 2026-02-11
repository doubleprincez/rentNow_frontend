'use client'
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * NetworkStatus - Displays offline indicator when network is unavailable
 * 
 * Monitors browser online/offline events and displays a banner
 * when the user loses internet connectivity.
 * 
 * Requirement 3.5, 6.4: Network error handling with offline indicators
 */
export default function NetworkStatus(): JSX.Element | null {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState<boolean>(false);

  useEffect(() => {
    // Initialize with current online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything if online
  if (isOnline && !showOfflineBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">
          {isOnline ? 'Connection restored' : 'No internet connection'}
        </span>
      </div>
    </div>
  );
}

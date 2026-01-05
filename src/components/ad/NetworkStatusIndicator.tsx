'use client'

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface NetworkStatusIndicatorProps {
  showWhenOnline?: boolean;
  onRetry?: () => void;
}

/**
 * NetworkStatusIndicator - Shows network connectivity status
 * 
 * Displays different states:
 * - Online with good connection
 * - Online with slow connection
 * - Offline
 * - Retrying connection
 */
export default function NetworkStatusIndicator({
  showWhenOnline = false,
  onRetry
}: NetworkStatusIndicatorProps) {
  const { isOnline, isSlowConnection, effectiveType, retryConnection, isRetrying } = useNetworkStatus();

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !isSlowConnection && !showWhenOnline) {
    return null;
  }

  const handleRetry = async () => {
    const success = await retryConnection();
    if (success && onRetry) {
      onRetry();
    }
  };

  // Offline state
  if (!isOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">No internet connection</span>
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-600 p-1"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Slow connection warning
  if (isSlowConnection) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Slow connection detected ({effectiveType})
          </span>
        </div>
      </div>
    );
  }

  // Online with good connection (only show if explicitly requested)
  if (showWhenOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-medium">
            Connected ({effectiveType})
          </span>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Inline network status component for use within other components
 */
export function InlineNetworkStatus() {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>Offline</span>
      </div>
    );
  }

  if (isSlowConnection) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>Slow connection</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600 text-sm">
      <Wifi className="w-4 h-4" />
      <span>{effectiveType.toUpperCase()}</span>
    </div>
  );
}
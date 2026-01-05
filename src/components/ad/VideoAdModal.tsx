'use client'

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoAdModalProps, AdLoadError } from '@/types/ad';
import VideoAdPlayer from './VideoAdPlayer';
import { createPortal } from 'react-dom';
import { trackAdImpression } from '@/services/AdAnalytics';
import AdSessionManager from '@/services/AdSessionManager';
import AdErrorBoundary from './AdErrorBoundary';
import { detectAdBlocker, getAdBlockerMessage } from '@/utils/adBlockerDetection';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import { useNetworkStatus, isConnectionSuitableForVideo } from '@/hooks/useNetworkStatus';

/**
 * VideoAdModal Component
 * 
 * Full-screen modal for video advertisement playback with:
 * - Modal open/close functionality with proper focus management
 * - Loading states and error handling for ad loading failures
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Analytics event tracking
 */
export default function VideoAdModal({
  isOpen,
  onClose,
  onAdComplete,
  onAdSkipped,
  adConfig,
  apartmentId
}: VideoAdModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AdLoadError | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const networkStatus = useNetworkStatus();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle focus management, analytics, and ad blocker detection
  useEffect(() => {
    if (isOpen) {
      // Check for ad blocker
      detectAdBlocker().then(result => {
        if (result.isBlocked) {
          setAdBlockerDetected(true);
          setError({
            name: 'AdBlockerError',
            message: getAdBlockerMessage(result).message,
            code: 'AD_BLOCKER_DETECTED'
          } as AdLoadError);
        }
      });

      // Track ad impression when modal opens
      const sessionId = AdSessionManager.getSessionId() || 'no-session';
      trackAdImpression(
        apartmentId,
        sessionId,
        adConfig.provider,
        false, // We don't have user state here, will be handled by parent
        false,
        {
          adProvider: adConfig.provider,
          modalOpened: true
        }
      );

      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, apartmentId, adConfig.provider]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
        case 'Tab':
          // Trap focus within modal
          event.preventDefault();
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleAdComplete = () => {
    setIsLoading(false);
    onAdComplete();
  };

  const handleAdSkipped = (watchDuration: number) => {
    setIsLoading(false);
    onAdSkipped(watchDuration);
  };

  const handleAdError = (error: Error) => {
    setIsLoading(false);
    
    // Check if error is network-related
    if (!networkStatus.isOnline) {
      setError({
        name: 'NetworkError',
        message: 'No internet connection. Please check your network and try again.',
        code: 'NETWORK_OFFLINE'
      } as AdLoadError);
    } else if (!isConnectionSuitableForVideo(networkStatus)) {
      setError({
        name: 'SlowConnectionError',
        message: 'Your connection is too slow for video content. Please try again with a better connection.',
        code: 'CONNECTION_TOO_SLOW'
      } as AdLoadError);
    } else {
      setError(error as AdLoadError);
    }
  };

  const handleAdStarted = () => {
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setAdBlockerDetected(false);
    setRetryCount(prev => prev + 1);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-modal-title"
      aria-describedby="ad-modal-description"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full h-full max-w-4xl max-h-screen bg-black rounded-lg overflow-hidden focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span id="ad-modal-title" className="text-white text-sm font-medium">
              Advertisement
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mute Toggle */}
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              aria-label={isMuted ? 'Unmute ad' : 'Mute ad'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            {/* Close Button - Only show if not loading */}
            {!isLoading && (
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                aria-label="Close advertisement"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Network Status Indicator */}
        <NetworkStatusIndicator onRetry={handleRetry} />

        {/* Content Area */}
        <div className="w-full h-full flex items-center justify-center">
          {/* Loading State */}
          {isLoading && !error && (
            <div className="flex flex-col items-center gap-4 text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading advertisement...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center gap-4 text-white max-w-md mx-auto p-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {adBlockerDetected ? 'Ad Blocker Detected' : 'Unable to Load Advertisement'}
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {adBlockerDetected 
                    ? 'Please disable your ad blocker or subscribe for an ad-free experience.'
                    : (error.message || 'There was a problem loading the ad. Please try again.')
                  }
                </p>
                <div className="flex gap-3">
                  {!adBlockerDetected && retryCount < 3 && networkStatus.isOnline && (
                    <Button
                      onClick={handleRetry}
                      disabled={networkStatus.isRetrying}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
                    >
                      {networkStatus.isRetrying ? 'Retrying...' : `Try Again (${3 - retryCount} left)`}
                    </Button>
                  )}
                  {!networkStatus.isOnline && (
                    <Button
                      onClick={networkStatus.retryConnection}
                      disabled={networkStatus.isRetrying}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                    >
                      {networkStatus.isRetrying ? 'Checking...' : 'Check Connection'}
                    </Button>
                  )}
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 px-4 py-2"
                  >
                    Close
                  </Button>
                </div>
                {adBlockerDetected && (
                  <p className="text-xs text-gray-400 mt-3">
                    Tip: Look for an ad blocker icon in your browser's address bar
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Video Ad Player */}
          {!error && (
            <AdErrorBoundary
              onError={(error) => {
                console.error('Video ad player error:', error);
                handleAdError(error);
              }}
              fallback={
                <div className="flex flex-col items-center gap-4 text-white max-w-md mx-auto p-6">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Video Player Error</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      The video player encountered an error. This might be due to browser compatibility issues.
                    </p>
                    <Button
                      onClick={handleRetry}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              }
            >
              <VideoAdPlayer
                adConfig={adConfig}
                onComplete={handleAdComplete}
                onSkipped={handleAdSkipped}
                onError={handleAdError}
                onStarted={handleAdStarted}
              />
            </AdErrorBoundary>
          )}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p id="ad-modal-description" className="text-white/70 text-xs text-center">
            Watch this short advertisement to unlock agent contact details for 4 minutes
          </p>
        </div>
      </div>

      {/* Backdrop Click Handler */}
      <div
        className="absolute inset-0 -z-10"
        onClick={handleClose}
        aria-hidden="true"
      />
    </div>
  );

  // Render modal using portal to ensure it's rendered at the document root
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
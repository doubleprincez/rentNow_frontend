'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoAdPlayerProps, AdPlaybackState } from '@/types/ad';
import { trackAdStarted, trackAdCompleted, trackAdSkipped } from '@/services/AdAnalytics';
import AdSessionManager from '@/services/AdSessionManager';

/**
 * VideoAdPlayer Component
 * 
 * Handles video ad playback with:
 * - Skip button functionality (disabled for first 5 seconds)
 * - Ad completion and skip event handling
 * - Progress indicator for ad playback
 * - Video loading, play, pause, and error states
 */
export default function VideoAdPlayer({
  adConfig,
  onComplete,
  onSkipped,
  onError,
  onStarted
}: VideoAdPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackState, setPlaybackState] = useState<AdPlaybackState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    isSkipped: false,
    currentTime: 0,
    duration: 0,
    canSkip: false,
    error: undefined
  });

  const startTimeRef = useRef<number>(Date.now());
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setPlaybackState(prev => ({
        ...prev,
        duration: video.duration,
        isLoading: false
      }));
    };

    const handleCanPlay = () => {
      setPlaybackState(prev => ({
        ...prev,
        isLoading: false
      }));
      
      // Auto-play the video
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        onError?.(new Error('Auto-play failed. Please click play to start the ad.'));
      });
    };

    const handlePlay = () => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false
      }));
      
      // Track ad started event
      const sessionId = AdSessionManager.getSessionId() || 'no-session';
      trackAdStarted(
        'current-apartment', // This will be passed from parent in real implementation
        sessionId,
        adConfig.provider,
        false,
        false,
        {
          adProvider: adConfig.provider,
          adDuration: video.duration || 0
        }
      );
      
      onStarted?.();
      
      // Enable skip button after configured delay
      skipTimeoutRef.current = setTimeout(() => {
        setPlaybackState(prev => ({
          ...prev,
          canSkip: true
        }));
      }, adConfig.skipDelay * 1000);
    };

    const handlePause = () => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: true
      }));
    };

    const handleTimeUpdate = () => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: video.currentTime
      }));
    };

    const handleEnded = () => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: false,
        isCompleted: true
      }));
      
      // Track ad completed event
      const sessionId = AdSessionManager.getSessionId() || 'no-session';
      const watchDuration = Date.now() - startTimeRef.current;
      trackAdCompleted(
        'current-apartment',
        sessionId,
        watchDuration,
        adConfig.provider,
        false,
        false,
        {
          adProvider: adConfig.provider,
          adDuration: video.duration || 0,
          completionRate: 100
        }
      );
      
      onComplete();
    };

    const handleError = (event: Event) => {
      const error = new Error('Video failed to load or play');
      setPlaybackState(prev => ({
        ...prev,
        isLoading: false,
        error: error
      }));
      
      onError(error);
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Set video source based on ad configuration
    const videoSource = getVideoSource();
    if (videoSource) {
      video.src = videoSource;
      video.load();
    } else {
      onError(new Error('No valid video source found'));
    }

    return () => {
      // Cleanup event listeners
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
    };
  }, [adConfig, onComplete, onSkipped, onError, onStarted]);

  const getVideoSource = (): string | null => {
    switch (adConfig.provider) {
      case 'custom':
        return adConfig.customVideoUrl || null;
      case 'fallback':
        return adConfig.fallbackContent?.videoUrl || null;
      case 'google_ima':
      case 'google_adsense':
        // For now, use fallback for Google providers
        // In a real implementation, this would integrate with Google IMA SDK
        return adConfig.fallbackContent?.videoUrl || '/videos/platform-promo.mp4';
      default:
        return null;
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playbackState.isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        onError(new Error('Failed to play video'));
      });
    }
  };

  const handleSkip = () => {
    if (!playbackState.canSkip) return;

    const watchDuration = Date.now() - startTimeRef.current;
    
    // Track ad skipped event
    const sessionId = AdSessionManager.getSessionId() || 'no-session';
    trackAdSkipped(
      'current-apartment',
      sessionId,
      watchDuration,
      adConfig.provider,
      false,
      false,
      {
        adProvider: adConfig.provider,
        adDuration: playbackState.duration,
        skipTime: playbackState.currentTime,
        completionRate: playbackState.duration > 0 ? (playbackState.currentTime / playbackState.duration) * 100 : 0
      }
    );
    
    setPlaybackState(prev => ({
      ...prev,
      isSkipped: true,
      isPlaying: false
    }));
    
    onSkipped(watchDuration);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = playbackState.duration > 0 
    ? (playbackState.currentTime / playbackState.duration) * 100 
    : 0;

  const remainingTime = Math.max(0, adConfig.skipDelay - playbackState.currentTime);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
        preload="metadata"
        aria-label="Advertisement video"
      />

      {/* Loading Overlay */}
      {playbackState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {!playbackState.isLoading && !playbackState.isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={handlePlayPause}
            variant="ghost"
            size="lg"
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4"
            aria-label={playbackState.isPlaying ? 'Pause ad' : 'Play ad'}
          >
            {playbackState.isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      {!playbackState.isLoading && (
        <div className="absolute bottom-16 left-4 right-4">
          <div className="w-full bg-white/30 rounded-full h-1">
            <div
              className="bg-orange-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-white text-xs">
            <span>{formatTime(playbackState.currentTime)}</span>
            <span>{formatTime(playbackState.duration)}</span>
          </div>
        </div>
      )}

      {/* Skip Button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={handleSkip}
          disabled={!playbackState.canSkip}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${playbackState.canSkip 
              ? 'bg-white/90 hover:bg-white text-black' 
              : 'bg-white/30 text-white/70 cursor-not-allowed'
            }
          `}
          aria-label={playbackState.canSkip ? 'Skip advertisement' : `Skip available in ${Math.ceil(remainingTime)} seconds`}
        >
          <div className="flex items-center gap-2">
            <SkipForward className="w-4 h-4" />
            {playbackState.canSkip ? (
              'Skip Ad'
            ) : (
              `Skip in ${Math.ceil(remainingTime)}s`
            )}
          </div>
        </Button>
      </div>

      {/* Ad Info */}
      {adConfig.fallbackContent && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <h3 className="text-white text-lg font-semibold mb-1">
            {adConfig.fallbackContent.title}
          </h3>
          <p className="text-white/80 text-sm">
            {adConfig.fallbackContent.description}
          </p>
        </div>
      )}
    </div>
  );
}
'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Props for the VideoPlayer component
 */
export interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

/**
 * VideoPlayer - Handles video playback with auto-play logic
 * 
 * Features:
 * - Auto-play when in viewport (Requirement 3.1)
 * - Auto-pause when scrolled away (Requirement 3.2)
 * - Muted by default with unmute control (Requirement 3.3)
 * - Only one video plays at a time (Requirement 3.4)
 * - Loading and buffering indicators (Requirement 3.5)
 * - Play/pause overlay controls
 * - Error handling with retry functionality
 * - Memoized for performance optimization (Requirement 2.5)
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 2.5
 */
function VideoPlayer({
  url,
  thumbnail,
  isActive,
  isMuted,
  onMuteToggle,
  onPlayStateChange
}: VideoPlayerProps): JSX.Element {
  // ============================================================================
  // Refs and State
  // ============================================================================
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // Auto-play/Pause Logic based on Intersection Observer
  // ============================================================================
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Requirement 3.1: Auto-play when active (within 200ms)
    // Requirement 3.2: Auto-pause when scrolled away
    // Requirement 3.4: Only one video plays at a time
    if (isActive) {
      const playStartTime = performance.now();
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            const playDuration = performance.now() - playStartTime;
            
            // Performance monitoring: Log if playback takes longer than 200ms (Requirement 3.1)
            if (process.env.NODE_ENV === 'development' && playDuration > 200) {
              console.warn(`Video playback started in ${playDuration.toFixed(0)}ms (target: <200ms)`);
            }
            
            setIsPlaying(true);
            setIsLoading(false);
            setHasError(false);
            onPlayStateChange?.(true);
          })
          .catch((error) => {
            // Handle autoplay restrictions
            console.warn('Video autoplay failed:', error);
            setIsPlaying(false);
            setIsLoading(false);
            onPlayStateChange?.(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  }, [isActive, onPlayStateChange]);
  
  // ============================================================================
  // Mute State Synchronization
  // ============================================================================
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Requirement 3.3: Muted by default with visible unmute control
    video.muted = isMuted;
  }, [isMuted]);
  
  // ============================================================================
  // Loading Timeout Handler
  // ============================================================================
  
  useEffect(() => {
    // Requirement 3.5: Timeout handling for slow video loading (10 second max)
    if (isLoading && isActive) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setHasError(true);
          setIsLoading(false);
        }
      }, 10000); // 10 seconds
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, isActive]);
  
  // ============================================================================
  // Video Event Handlers
  // ============================================================================
  
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);
  
  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setIsBuffering(false);
  }, []);
  
  const handleWaiting = useCallback(() => {
    // Requirement 3.5: Display video buffering indicators
    setIsBuffering(true);
  }, []);
  
  const handlePlaying = useCallback(() => {
    setIsBuffering(false);
    setIsLoading(false);
  }, []);
  
  const handleError = useCallback(() => {
    // Requirement 3.5: Error handling for video playback
    setHasError(true);
    setIsLoading(false);
    setIsBuffering(false);
    setIsPlaying(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);
  
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);
  
  // ============================================================================
  // Manual Play/Pause Toggle
  // ============================================================================
  
  const handlePlayPauseClick = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasError) return;
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            onPlayStateChange?.(true);
          })
          .catch((error) => {
            console.warn('Manual play failed:', error);
          });
      }
    }
  }, [isPlaying, hasError, onPlayStateChange]);
  
  // ============================================================================
  // Retry Handler for Errors
  // ============================================================================
  
  const handleRetry = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setHasError(false);
    setIsLoading(true);
    
    // Reload the video
    video.load();
    
    // Try to play if active
    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            onPlayStateChange?.(true);
          })
          .catch((error) => {
            console.warn('Retry play failed:', error);
            setHasError(true);
            setIsLoading(false);
          });
      }
    }
  }, [isActive, onPlayStateChange]);
  
  // ============================================================================
  // Show/Hide Controls on Interaction
  // ============================================================================
  
  const handleVideoClick = useCallback(() => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  }, []);
  
  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <div 
      className="relative w-full h-full bg-black"
      onClick={handleVideoClick}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={url}
        poster={thumbnail}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        loop
        muted={isMuted}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleError}
        onEnded={handleEnded}
        preload="metadata"
        aria-label={`Video player - ${isPlaying ? 'playing' : 'paused'}`}
        aria-live="polite"
      />
      
      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
      
      {/* Buffering Indicator */}
      {isBuffering && !hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error State with Retry */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-4 text-white text-center px-4">
            <div className="text-4xl">⚠️</div>
            <p className="text-lg font-semibold">Video playback error</p>
            <p className="text-sm text-white/70">Unable to load this video</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Play/Pause Overlay Control */}
      {!hasError && !isLoading && (showControls || !isPlaying) && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transition: 'opacity 0.3s' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPauseClick();
            }}
            className="pointer-events-auto w-16 h-16 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" fill="white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            )}
          </button>
        </div>
      )}
      
      {/* Mute/Unmute Button */}
      {!hasError && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          className="absolute bottom-20 right-4 w-12 h-12 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </button>
      )}
    </div>
  );
}

// Memoize VideoPlayer to prevent unnecessary re-renders (Requirement 2.5)
export default React.memo(VideoPlayer, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.url === nextProps.url &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.thumbnail === nextProps.thumbnail
  );
});

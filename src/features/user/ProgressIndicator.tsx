'use client'
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface ProgressIndicatorProps {
  currentIndex: number;
  totalCount: number;
  isTransitioning?: boolean;
}

/**
 * ProgressIndicator - Shows current position and navigation hints
 * Displays on desktop to help users navigate through media items
 */
export default function ProgressIndicator({
  currentIndex,
  totalCount,
  isTransitioning = false
}: ProgressIndicatorProps): JSX.Element {
  if (totalCount <= 1) return <></>;

  const canGoUp = currentIndex > 0;
  const canGoDown = currentIndex < totalCount - 1;

  return (
    <div className="hidden md:flex fixed right-[41%] top-1/2 -translate-y-1/2 flex-col items-center gap-2 z-20 pointer-events-none">
      {/* Up Arrow Hint */}
      <div
        className={`w-10 h-10 cursor-pointer flex items-center justify-center rounded-full transition-all ${
          canGoUp
            ? 'bg-white/20 text-white'
            : 'bg-white/5 text-white/20'
        }`}
        aria-label="Scroll up for previous media"
      >
        <ChevronUp className="w-6 h-6" />
      </div>

      {/* Progress Dots */}
      <div className="flex flex-col items-center gap-1.5 py-2">
        {Array.from({ length: Math.min(totalCount, 10) }).map((_, index) => {
          // Show max 10 dots, highlight current position
          const actualIndex = totalCount > 10 
            ? Math.floor((index / 9) * (totalCount - 1))
            : index;
          const isCurrent = actualIndex === currentIndex || 
            (totalCount > 10 && Math.abs(actualIndex - currentIndex) < totalCount / 20);
          
          return (
            <div
              key={index}
              className={`rounded-full transition-all ${
                isCurrent
                  ? 'w-2 h-6 bg-white'
                  : 'w-2 h-2 bg-white/30'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              aria-label={`Media ${currentIndex + 1} of ${totalCount}`}
              aria-current={isCurrent ? 'true' : 'false'}
            />
          );
        })}
      </div>

      {/* Down Arrow Hint */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
          canGoDown
            ? 'bg-white/20 text-white'
            : 'bg-white/5 text-white/20'
        }`}
        aria-label="Scroll down for next media"
      >
        <ChevronDown className="w-6 h-6" />
      </div>

      {/* Scroll Hint (shows for first item) */}
      {currentIndex === 0 && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/70 text-xs whitespace-nowrap animate-pulse">
          Scroll or use mouse wheel
        </div>
      )}
    </div>
  );
}

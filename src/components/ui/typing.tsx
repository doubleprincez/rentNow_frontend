"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
}

export function TypingAnimation({
  text,
  duration = 150,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setDisplayedText(""); // Reset text when component mounts or text changes
    let currentIndex = 0;

    const typingEffect = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => text.substring(0, currentIndex + 1));
        currentIndex += 1;
      } else {
        clearInterval(typingEffect);
        setIsAnimating(false);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [text, duration]);

  return (
    <h1
      className={cn(
        "font-display text-center font-bold tracking-[-0.02em] drop-shadow-sm",
        className
      )}
    >
      {displayedText}
    </h1>
  );
}
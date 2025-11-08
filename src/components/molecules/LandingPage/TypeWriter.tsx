"use client";

import { useState, useEffect } from "react";

interface TypewriterHeadlineProps {
  prefix: string;
  keywords: string[];
  suffix: string;
  typingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  keywordClassName?: string;
}

export function TypewriterHeadline({
  prefix,
  keywords,
  suffix,
  typingSpeed = 100,
  pauseDuration = 2000,
  className = "",
  keywordClassName = "",
}: TypewriterHeadlineProps) {
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // Show full text immediately without animation
      setDisplayedText(keywords[currentKeywordIndex]);
      return;
    }

    const currentKeyword = keywords[currentKeywordIndex];

    if (!isDeleting) {
      // Typing forward
      if (displayedText.length < currentKeyword.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentKeyword.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause before deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting backward
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, typingSpeed / 2); // Delete faster than typing
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next keyword
        setIsDeleting(false);
        setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
      }
    }
  }, [
    displayedText,
    isDeleting,
    currentKeywordIndex,
    keywords,
    typingSpeed,
    pauseDuration,
  ]);

  return (
    <h1 className={className}>
      {prefix}{" "}
      <span className={keywordClassName}>
        {displayedText}
        <span className="animate-pulse">|</span>
      </span>{" "}
      {suffix}
    </h1>
  );
}

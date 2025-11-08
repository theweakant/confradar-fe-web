"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/utils";

interface HoverRevealSquareProps {
  title: string;
  hoverInfo?: string[];
  detailNumber?: string;
  detailTitle?: string;
  detailDescription?: string;
  className?: string;
  children?: React.ReactNode;
}

export function HoverRevealSquare({
  title,
  hoverInfo,
  detailNumber,
  detailTitle,
  detailDescription,
  className,
  children,
}: HoverRevealSquareProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsHovered((prev) => !prev);
    }
  };

  const animationDuration = prefersReducedMotion
    ? "duration-0"
    : "duration-500";

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isHovered}
          aria-label={`${title}. Press Enter to reveal details.`}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative w-full aspect-square flex items-center justify-center cursor-pointer",
            "border border-white/10 transition-all",
            animationDuration,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          )}
        >
          <h3
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center px-6 text-balance",
              "transition-opacity",
              animationDuration,
              isHovered && hoverInfo ? "opacity-0" : "opacity-100",
            )}
          >
            {title}
          </h3>

          {hoverInfo && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all",
                animationDuration,
                isHovered
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75 pointer-events-none",
              )}
            >
              <div className="w-[85%] aspect-square rounded-full bg-[#0066FF] flex items-center justify-center p-8 shadow-2xl">
                <div className="text-center space-y-2">
                  {hoverInfo.map((item, index) => (
                    <p
                      key={index}
                      className="text-sm md:text-base lg:text-lg font-semibold text-white"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {children}
        </div>
      </div>

      {(detailNumber || detailTitle || detailDescription) && (
        <div
          className={cn(
            "flex flex-col items-center mt-6 transition-all",
            animationDuration,
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none",
          )}
        >
          {/* Connector Line */}
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent mb-4" />

          {detailNumber && (
            <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-2">
              {detailNumber}
            </p>
          )}

          {detailTitle && (
            <h4 className="text-xl md:text-2xl font-bold text-[#FF4500] mb-3">
              {detailTitle}
            </h4>
          )}

          {detailDescription && (
            <p className="text-sm md:text-base text-white/70 leading-relaxed text-center max-w-sm text-pretty">
              {detailDescription}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

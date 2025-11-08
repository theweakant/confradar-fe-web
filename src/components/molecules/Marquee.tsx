"use client";

import type { CSSProperties } from "react";
import { cn } from "@/utils/utils";

interface MarqueeProps {
  text: string | string[];
  speed?: number;
  className?: string;
  textClassName?: string;
  separator?: string;
}

export function Marquee({
  text,
  speed = 30,
  className,
  textClassName,
  separator = " • ",
}: MarqueeProps) {
  const textArray = Array.isArray(text) ? text : [text];
  const content = textArray.join(separator);

  // Duplicate content for seamless loop
  const duplicatedContent = `${content}${separator}${content}${separator}`;

  return (
    <div className={cn("relative overflow-hidden w-full", className)}>
      <div
        className="flex whitespace-nowrap"
        style={
          {
            animation: `marquee ${speed}s linear infinite`,
          } as CSSProperties
        }
      >
        <span className={cn("inline-block", textClassName)}>
          {duplicatedContent}
        </span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

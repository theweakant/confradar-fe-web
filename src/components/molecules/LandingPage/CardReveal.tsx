"use client"

import { useEffect, useState } from "react"

interface CardRevealProps {
  name: string
  delay: number
  index: number
  totalCards: number
}

export function CardReveal({ name, delay, index, totalCards }: CardRevealProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("trusted-by-section")
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [delay])

  const platformRadius = 165
  const cardRadius = 45
  const gap = 50
  const orbitRadius = platformRadius + cardRadius + gap

  const angle = (index / totalCards) * 2 * Math.PI - Math.PI / 2
  const finalLeft = `calc(50% + ${Math.cos(angle) * orbitRadius}px - 65px)`
  const finalBottom = `calc(50% + ${Math.sin(angle) * orbitRadius}px - 58px)`

  const randomRotation = -15 + ((index * 13) % 30)

  return (
    <div
      className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full border border-blue-400/40 flex items-center justify-center bg-gradient-to-b from-blue-900/70 to-blue-700/50 backdrop-blur-md hover:scale-110 cursor-pointer transition-all duration-300"
      style={{
        left: isVisible ? finalLeft : `${20 + ((index * 7) % 60)}%`,
        bottom: isVisible ? finalBottom : "100vh",
        transform: `rotate(${randomRotation}deg)`,
        ...(isVisible
          ? {
              animationName: `bounceDrop-${index}`,
              animationDuration: "2s",
              animationTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              animationFillMode: "forwards",
            }
          : {}),
        zIndex: 10,
      }}
    >
      <span className="text-white text-sm md:text-base font-semibold text-center px-2 leading-tight">
        {name}
      </span>

      <style jsx>{`
        @keyframes bounceDrop-${index} {
          0% {
            bottom: 100vh;
            left: ${20 + ((index * 7) % 60)}%;
            animation-timing-function: ease-in;
          }
          40% {
            bottom: ${finalBottom};
            left: ${finalLeft};
            animation-timing-function: ease-out;
          }
          50% {
            bottom: calc(${finalBottom} + 70px);
            animation-timing-function: ease-in;
          }
          65% {
            bottom: ${finalBottom};
            animation-timing-function: ease-out;
          }
          75% {
            bottom: calc(${finalBottom} + 40px);
            animation-timing-function: ease-in;
          }
          85% {
            bottom: ${finalBottom};
            animation-timing-function: ease-out;
          }
          92% {
            bottom: calc(${finalBottom} + 20px);
          }
          100% {
            bottom: ${finalBottom};
            left: ${finalLeft};
          }
        }
      `}</style>
    </div>
  )
}

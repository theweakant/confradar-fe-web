"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface SponsorLogoRevealProps {
  src: string
  alt: string
  delay: number
  position: { top: string; left: string }
}

export function SponsorLogoReveal({ src, alt, delay, position }: SponsorLogoRevealProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("sponsors-section")
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return (
    <div
      className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/20 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-700 ease-out z-10 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: isVisible ? "translateY(0)" : "translateY(-100px)",
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
    </div>
  )
}

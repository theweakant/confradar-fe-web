"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/utils/utils"

interface ConferenceRevealCardProps {
  imageSrc: string
  title: string
  date?: string
  description?: string
  delay?: number
  direction?: "left" | "right"
  className?: string
  onClick?: () => void
}

export function ConferenceRevealCard({
  imageSrc,
  title,
  date,
  description,
  delay = 0,
  direction = "left",
  className,
  onClick,
}: ConferenceRevealCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentCard = cardRef.current
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true)
            }, delay)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    )

    if (currentCard) {
      observer.observe(currentCard)
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard)
      }
    }
  }, [delay])

  return (
    <div ref={cardRef} className={cn("relative overflow-hidden cursor-pointer group", className)} onClick={onClick}>
      <div
        className={cn(
          "transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]",
          "motion-reduce:transition-none motion-reduce:transform-none",
          isVisible
            ? "opacity-100 translate-x-0"
            : direction === "left"
              ? "opacity-0 -translate-x-8"
              : "opacity-0 translate-x-8",
        )}
      >
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {(title || date || description) && (
          <div className="mt-3 space-y-1">
            {title && <h3 className="font-semibold text-sm text-foreground line-clamp-1">{title}</h3>}
            {date && <p className="text-xs text-muted-foreground">{date}</p>}
            {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
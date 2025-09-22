"use client"

import { useEffect, useState } from "react"

export default function StatisticsSection() {
  const [isVisible, setIsVisible] = useState(false)

  const stats = [
    { number: "1,000+", label: "Hội thảo đã tổ chức" },
    { number: "50,000+", label: "Người tham gia" },
    { number: "500+", label: "Tổ chức đối tác" },
    { number: "95%", label: "Độ hài lòng người dùng" },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("statistics")
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
    <section id="statistics" className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Con số ấn tượng</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Được tin tưởng bởi cộng đồng công nghệ và nghiên cứu Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className={`text-4xl lg:text-5xl font-bold mb-2 transition-all duration-1000 ${
                  isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {stat.number}
              </div>
              <div className="text-primary-foreground/80 text-sm lg:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

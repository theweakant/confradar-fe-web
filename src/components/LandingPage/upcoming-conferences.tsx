"use client"

import { useState } from "react"
import { ConferenceRevealCard } from "@/components/molecules/LandingPage/RevealCard"
import { Button } from "@/components/ui/button"

interface Conference {
  id: string
  title: string
  date: string
  time?: string
  location?: string
  speaker?: string
  speakerTitle?: string
  type: "tech" | "research"
  imageSrc: string
  description?: string
  tags?: string[]
}

const conferences: Conference[] = [
  {
    id: "1",
    title: "Hệ Thống Thiết Kế Quy Mô Lớn",
    date: "14 THÁNG 8",
    time: "14:00 UTC",
    type: "tech",
    imageSrc: "/design-systems-conference-with-colorful-lights.jpg",
    description: "Xây dựng hệ thống thiết kế bền vững cho các ứng dụng doanh nghiệp",
  },
  {
    id: "2",
    title: "Hội Nghị Thiết Kế Tương Lai",
    date: "21 THÁNG 8",
    time: "16:00 UTC",
    speaker: "Emma Price",
    speakerTitle: "Trưởng nhóm Thiết kế sản phẩm tại Slack",
    type: "tech",
    imageSrc: "/professional-woman-speaker-at-tech-conference-with.jpg",
    description: "Khám phá tương lai của tư duy thiết kế và đổi mới sáng tạo",
    tags: ["TRỰC TIẾP + GHI HÌNH"],
  },
  {
    id: "3",
    title: "Triển Lãm Thiết Kế Hệ Thống",
    date: "28 THÁNG 8",
    time: "15:00 UTC",
    type: "research",
    imageSrc: "/design-expo-with-colorful-stage-and-yellow-green-l.jpg",
    description: "Nghiên cứu các phương pháp tiếp cận hệ thống trong thiết kế hiện đại",
  },
  {
    id: "4",
    title: "Hội Thảo ScaleUp",
    date: "5 THÁNG 9",
    time: "13:00 UTC",
    type: "tech",
    imageSrc: "/large-tech-conference-audience-from-behind-speaker.jpg",
    description: "Chiến lược mở rộng sản phẩm và đội ngũ trong thời đại mới",
  },
]

export default function UpcomingConferences() {
  const [selectedConference, setSelectedConference] = useState<Conference>(conferences[1])

  return (
    <section className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter">
          SỰ KIỆN SẮP DIỄN RA
        </h1>
      </div>

      <div className="relative min-h-[calc(100vh-200px)]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={selectedConference.imageSrc || "/placeholder.svg"}
            alt={selectedConference.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/90" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-end mb-16 lg:mb-24">
            <div className="max-w-md space-y-6">
              <div className="space-y-3">
                <p className="text-xs text-gray-300 uppercase tracking-widest font-medium">
                  {selectedConference.date} · {selectedConference.time}
                </p>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-balance">
                  {selectedConference.title}
                </h2>

                {selectedConference.tags && (
                  <p className="text-sm text-gray-300 tracking-wide">
                    {selectedConference.tags.map((tag) => `[${tag}]`).join(" ")}
                  </p>
                )}

                {selectedConference.speaker && (
                  <div className="pt-2">
                    <p className="text-base text-gray-200 leading-relaxed">
                      Với {selectedConference.speaker},
                      <br />
                      <span className="text-gray-300">{selectedConference.speakerTitle}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button
                size="lg"
                className={cn(
                  "w-full sm:w-auto px-10 py-6 text-base font-bold tracking-wide uppercase rounded-md",
                  selectedConference.type === "tech"
                    ? "bg-blue-700 hover:bg-blue-800 text-white border border-blue-600"
                    : "bg-purple-700 hover:bg-purple-800 text-white border border-purple-600",
                )}
              >
                THAM GIA NGAY
              </Button>
            </div>
          </div>

          {/* Conference Grid with Reveal Animation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {conferences.map((conference, index) => (
              <ConferenceRevealCard
                key={conference.id}
                imageSrc={conference.imageSrc}
                title={conference.title}
                date={conference.date}
                delay={index * 100}
                direction="left"
                className={cn(
                  "transition-all duration-300 cursor-pointer",
                  selectedConference.id === conference.id ? "ring-2 ring-offset-2 ring-offset-black" : "",
                  conference.type === "tech" ? "ring-blue-500" : "ring-purple-500",
                )}
                onClick={() => setSelectedConference(conference)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

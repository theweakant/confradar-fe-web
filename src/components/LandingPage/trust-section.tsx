"use client"

import { Button } from "@/components/ui/button"
import { SponsorLogoReveal } from "@/components/molecules/LandingPage/SponsorLogoReveal"

export default function TrustedByCollaborator() {
  const sponsors = [
    // Top left quadrant
    { name: "MoMo", logo: "/images/LandingPage/logo_sponser/payment_logo/logo_momo.png", position: { top: "8%", left: "15%" } },
    { name: "MB", logo: "/images/LandingPage/logo_sponser/payment_logo/logo_mbbank.jpg", position: { top: "18%", left: "8%" } },
    { name: "ZaloPay", logo: "/images/LandingPage/logo_sponser/payment_logo/logo_zalopay.png", position: { top: "32%", left: "12%" } },

    // Bottom left quadrant
    { name: "FPT Telecom", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_fpt_telecom.png", position: { top: "55%", left: "8%" } },
    { name: "Grab", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_grab.png", position: { top: "68%", left: "18%" } },
    { name: "Shopee", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_shopee.png", position: { top: "78%", left: "28%" } },

    // Top right quadrant
    { name: "VNG", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_VNG.png", position: { top: "12%", left: "72%" } },
    { name: "VNPT", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_vnpt.png", position: { top: "22%", left: "85%" } },
    { name: "ORCID", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_ORCID.png", position: { top: "35%", left: "88%" } },

    // Bottom right quadrant
    { name: "Microsoft", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_microsoft.png", position: { top: "58%", left: "85%" } },
    { name: "DigitalOcean", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_DigitalOcean.png", position: { top: "70%", left: "75%" } },
    { name: "FPT", logo: "/images/LandingPage/logo_sponser/tech_logo/logo_FPT.png", position: { top: "82%", left: "68%" } },
  ]

  return (
    <section id="sponsors-section" className="relative min-h-screen bg-black py-20 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full border border-white/5" />
        <div className="absolute bottom-1/4 left-0 w-56 h-56 rounded-full border border-white/5" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h2 className="uppercase text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-20 tracking-tight">
          Được Tin Cậy Bởi Các Đối Tác
        </h2>

        {/* Main content area */}
        <div className="relative h-[600px] md:h-[700px] max-w-6xl mx-auto">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[420px] md:h-[420px] rounded-full bg-blue-600 flex flex-col items-center justify-center p-8 z-0">
            <h3 className="uppercase text-xl md:text-2xl font-black text-white text-center mb-6 leading-tight">
              ĐƯA HỘI NGHỊ CỦA BẠN
              <br />
              đến HỆ THỐNG CỦA CHÚNG TÔI
            </h3>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 font-bold px-8 py-6 text-md uppercase">
              HỢP TÁC NGAY
            </Button>
          </div>

          {sponsors.map((sponsor, index) => (
            <SponsorLogoReveal
              key={sponsor.name}
              src={sponsor.logo}
              alt={`${sponsor.name} logo`}
              delay={index * 100}
              position={sponsor.position}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

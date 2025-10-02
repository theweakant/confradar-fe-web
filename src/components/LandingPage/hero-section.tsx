"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section
      className="relative py-12 lg:py-20"
      style={{
        backgroundImage: "url('/images/LandingPage/background/dark_gradient_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-6">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/50 p-6 lg:p-8 min-h-[350px] lg:min-h-[480px]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 20%, rgba(255, 100, 50, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(0, 200, 200, 0.4) 0%, transparent 50%), rgba(0, 0, 0, 0.3)",
                }}
              />
              <div className="relative z-10">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">Hội Nghị 3D Visionaries</h1>
                <p className="text-base lg:text-lg text-[#D1D5DB] mb-8 lg:mb-10">12 tháng 10 - Đại học FPT</p>
                <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white">
                  Sôi Động <br /> Hơn Bao Giờ Hết
                </p>
              </div>
            </div>

            {/* Booking Card */}
            <Link
              href="#ticket"
              className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-5 lg:p-6 min-h-[350px] lg:min-h-[480px]"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-2xl text-[#D1D5DB]">Đặt vé</p>
              <div className="flex h-full flex-col justify-end">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl lg:text-3xl font-semibold text-white">
                    Nhận <br /> Vé Online Ngay
                  </h2>
                  <div className="w-11 h-11 rounded-full bg-zinc-700/50 flex items-center justify-center group-hover:bg-zinc-600/50 transition flex-shrink-0">
                    <ArrowUpRight className="w-5 h-5 text-[#D1D5DB]" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-4 lg:gap-6">
              <Link
                href="#tech-conference"
                className="group relative overflow-hidden rounded-3xl border transition-all p-4 lg:p-5 flex-1 min-h-[165px] lg:min-h-[230px]"
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  borderColor: "rgba(59, 130, 246, 0.2)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)")}
              >
                <p className="text-xs text-[#D1D5DB] mb-2">Hội thảo công nghệ</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-lg lg:text-xl font-semibold text-white leading-tight">
                    Khám Phá <br /> công nghệ
                  </h2>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition flex-shrink-0"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                </div>
              </Link>


              <Link
                href="#research-conference"
                className="group relative overflow-hidden rounded-3xl border transition-all p-4 lg:p-5 flex-1 min-h-[165px] lg:min-h-[230px]"
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  borderColor: "rgba(139, 92, 246, 0.2)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)")}
              >
                <p className="text-xs text-[#D1D5DB] mb-2">Hội nghị nghiên cứu</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-lg lg:text-xl font-semibold text-white leading-tight">
                    Nghiên cứu <br /> khoa học
                  </h2>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition flex-shrink-0"
                    style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Leadership Card */}
            <Link
              href="/leadership"
              className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-4 lg:p-5 min-h-[160px] lg:min-h-[190px]"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-xs text-[#D1D5DB] mb-2">Lãnh đạo</p>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg lg:text-xl font-semibold text-white leading-tight">
                  Nhìn Thấy <br /> Tương Lai
                </h2>
                <p className="text-[11px] leading-tight text-[#6B7280] max-w-[130px]">
                  Học hỏi từ các nhà lãnh đạo toàn cầu và định hình tương lai.
                </p>
              </div>
            </Link>

            {/* Workshops Card */}
            <Link
              href="/workshops"
              className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-4 lg:p-5 min-h-[160px] lg:min-h-[190px]"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-xs text-[#D1D5DB] mb-2">Hội thảo</p>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg lg:text-xl font-semibold text-white leading-tight">
                  Thực Hành <br /> Trực Tiếp
                </h2>
                <p className="text-[11px] leading-tight text-[#6B7280] max-w-[130px]">
                  Khám phá các hội thảo do chuyên gia hàng đầu dẫn dắt.
                </p>
              </div>
            </Link>

            {/* Afterparty Card */}
            <Link
              href="/afterparty"
              className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-4 lg:p-5 min-h-[160px] lg:min-h-[190px]"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-xs text-[#6B7280] mb-2">Tiệc sau sự kiện</p>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg lg:text-xl font-semibold text-white leading-tight">
                  Ăn Mừng <br /> Cùng Nhau
                </h2>
                <p className="text-[11px] leading-tight text-[#6B7280] max-w-[130px]">
                  Tham gia cùng chúng tôi trong một đêm tiệc khó quên.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
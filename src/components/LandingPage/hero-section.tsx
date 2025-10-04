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
              className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-6 lg:p-8 min-h-[350px] lg:min-h-[480px]"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-3xl lg:text-4xl text-[#D1D5DB]">Đặt vé</p>
              <div className="flex h-full flex-col justify-end">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white py-8 leading-tight">
                    Nhận <br /> Vé Online
                  </h2>
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-zinc-700/50 flex items-center justify-center group-hover:bg-zinc-600/50 transition flex-shrink-0">
                    <ArrowUpRight className="w-6 h-6 lg:w-7 lg:h-7 text-[#D1D5DB]" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-4 lg:gap-6">
          <Link
            href="#tech-conference"
            className="group relative overflow-hidden rounded-3xl border transition-all 
                      p-6 lg:p-7 flex-1 min-h-[200px] lg:min-h-[260px] flex flex-col justify-between"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(59, 130, 246, 0.2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)")
            }
          >
            <p className="text-sm md:text-base text-[#D1D5DB] mb-3">
              Hội thảo công nghệ
            </p>
            <div className="flex items-end justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                Khám Phá <br /> công nghệ
              </h2>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0"
                style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
              >
                <ArrowUpRight className="w-5 h-5 text-[#3B82F6]" />
              </div>
            </div>
          </Link>

          <Link
            href="#research-conference"
            className="group relative overflow-hidden rounded-3xl border transition-all 
                      p-6 lg:p-7 flex-1 min-h-[200px] lg:min-h-[260px] flex flex-col justify-between"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(139, 92, 246, 0.2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)")
            }
          >
            <p className="text-sm md:text-base text-[#D1D5DB] mb-3">
              Hội nghị nghiên cứu
            </p>
            <div className="flex items-end justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                Nghiên cứu <br /> khoa học
              </h2>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0"
                style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
              >
                <ArrowUpRight className="w-5 h-5 text-[#8B5CF6]" />
              </div>
            </div>
          </Link>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Leadership Card */}
{/* Leadership Card */}
<Link
  href="/leadership"
  className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 
             hover:border-zinc-600/50 transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
  style={{
    background: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(10px)",
  }}
>
  <p className="text-sm text-[#D1D5DB] mb-3">Lãnh đạo</p>
  <div className="flex items-start justify-between gap-4">
    <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug">
      Nhìn Thấy <br /> Tương Lai
    </h2>
    <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
      Học hỏi từ các nhà lãnh đạo toàn cầu và định hình tương lai.
    </p>
  </div>
</Link>

{/* Workshops Card */}
<Link
  href="/workshops"
  className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 
             hover:border-zinc-600/50 transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
  style={{
    background: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(10px)",
  }}
>
  <p className="text-sm text-[#D1D5DB] mb-3">Hội thảo</p>
  <div className="flex items-start justify-between gap-4">
    <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug">
      Thực Hành <br /> Trực Tiếp
    </h2>
    <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
      Khám phá các hội thảo do chuyên gia hàng đầu dẫn dắt.
    </p>
  </div>
</Link>

{/* Afterparty Card */}
<Link
  href="/afterparty"
  className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 
             hover:border-zinc-600/50 transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
  style={{
    background: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(10px)",
  }}
>
  <p className="text-sm text-[#D1D5DB] mb-3">Tiệc sau sự kiện</p>
  <div className="flex items-start justify-between gap-4">
    <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug">
      Ăn Mừng <br /> Cùng Nhau
    </h2>
    <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
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
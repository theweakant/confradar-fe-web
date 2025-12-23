"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConferenceResponse } from "@/types/conference.type";
import { useConference } from "@/redux/hooks/useConference";

export default function HeroSection() {
  const {
    fetchConferencesWithPrices,
    lazyConferencesWithPrices,
    lazyWithPricesLoading,
    lazyWithPricesError,
  } = useConference();

  const [featuredConference, setFeaturedConference] =
    useState<ConferenceResponse | null>(null);

  useEffect(() => {
    // Fetch conferences when component mounts
    const loadConferences = async () => {
      try {
        await fetchConferencesWithPrices({
          page: 1,
          pageSize: 10,
        });
      } catch (error) {
        console.error("Failed to fetch conferences:", error);
      }
    };

    loadConferences();
  }, [fetchConferencesWithPrices]);

  useEffect(() => {
    // Set featured conference (first one or based on your criteria)
    if (lazyConferencesWithPrices && lazyConferencesWithPrices.items.length > 0) {
      setFeaturedConference(lazyConferencesWithPrices.items[0]);
    }
  }, [lazyConferencesWithPrices]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isEmpty =
    !lazyWithPricesLoading &&
    !lazyWithPricesError &&
    (!lazyConferencesWithPrices ||
      lazyConferencesWithPrices.items.length === 0);

  return (
    <section
      className="relative py-12 lg:py-20"
      style={{
        backgroundImage:
          "url('/images/LandingPage/background/dark_gradient_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-6">
            {/* Hero Card - Dynamic */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/50 p-6 lg:p-8 min-h-[350px] lg:min-h-[480px]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 20%, rgba(255, 100, 50, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(0, 200, 200, 0.4) 0%, transparent 50%), rgba(0, 0, 0, 0.3)",
                }}
              />
              <div className="relative z-10">
                {lazyWithPricesLoading && (
                  // Loading skeleton
                  <div className="animate-pulse">
                    <div className="h-12 bg-zinc-700/50 rounded-lg mb-4 w-3/4"></div>
                    <div className="h-6 bg-zinc-700/50 rounded-lg mb-8 w-1/2"></div>
                    <div className="h-10 bg-zinc-700/50 rounded-lg w-2/3"></div>
                  </div>
                )}

                {!lazyWithPricesLoading && lazyWithPricesError && (
                  // Error state
                  <div>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 text-red-400">
                      Không thể tải hội nghị
                    </h1>
                    <p className="text-base lg:text-lg text-[#D1D5DB] mb-6">
                      {lazyWithPricesError.data?.message || "Vui lòng thử lại sau"}
                    </p>

                    <Link
                      href="/customer/discovery"
                      className="inline-flex items-center gap-3 rounded-full 
                   bg-white/10 hover:bg-white/20 transition px-6 py-3"
                    >
                      <span className="text-white font-semibold">
                        Đi tới trang khám phá
                      </span>
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </Link>
                  </div>
                )}

                {!lazyWithPricesLoading && !lazyWithPricesError && featuredConference && (
                  // Featured conference
                  <>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">
                      {featuredConference.conferenceName || "Hội Nghị Sắp Diễn Ra"}
                    </h1>

                    <p className="text-base lg:text-lg text-[#D1D5DB] mb-8 lg:mb-10">
                      {featuredConference.startDate
                        ? formatDate(featuredConference.startDate)
                        : "Ngày sắp công bố"}
                      {featuredConference.address && ` - ${featuredConference.address}`}
                    </p>

                    {/* <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white">
                      {featuredConference.description?.split(".")[0] || "Sôi Động"} <br />
                      {featuredConference.description?.split(".")[1] || "Hơn Bao Giờ Hết"}
                    </p> */}

                    {featuredConference.availableSlot !== undefined && (
                      <p className="text-sm text-[#D1D5DB] mt-4">
                        Còn {featuredConference.availableSlot} chỗ trống
                      </p>
                    )}
                  </>
                )}

                {!lazyWithPricesLoading && !lazyWithPricesError && isEmpty && (
                  // Empty state
                  <div className="flex flex-col justify-center h-full">
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
                      Chưa có hội thảo <br /> hoặc hội nghị sắp tới
                    </h1>

                    <p className="text-base lg:text-lg text-[#D1D5DB] mb-8 max-w-xl">
                      Hiện tại chưa có sự kiện nào sắp diễn ra.
                      Hãy khám phá các hội thảo và hội nghị đang mở đăng ký để tham gia cùng chúng tôi.
                    </p>

                    <Link
                      href="/customer/discovery"
                      className="inline-flex items-center gap-3 w-fit rounded-full 
                   bg-white/10 hover:bg-white/20 transition px-6 py-3"
                    >
                      <span className="text-white font-semibold">
                        Khám phá hội thảo & hội nghị
                      </span>
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </Link>
                  </div>
                )}
              </div>
              {/* <div className="relative z-10">
                {lazyWithPricesLoading ? (
                  // Loading skeleton
                  <div className="animate-pulse">
                    <div className="h-12 bg-zinc-700/50 rounded-lg mb-4 w-3/4"></div>
                    <div className="h-6 bg-zinc-700/50 rounded-lg mb-8 w-1/2"></div>
                    <div className="h-10 bg-zinc-700/50 rounded-lg w-2/3"></div>
                  </div>
                ) : lazyWithPricesError ? (
                  // Error state
                  <div className="text-red-400">
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-3">
                      Không thể tải hội nghị
                    </h1>
                    <p className="text-base lg:text-lg text-[#D1D5DB]">
                      {lazyWithPricesError.data?.message || "Vui lòng thử lại sau"}
                    </p>
                  </div>
                ) : featuredConference ? (
                  // Display featured conference data
                  <>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">
                      {featuredConference.conferenceName || "Hội Nghị Sắp Diễn Ra"}
                    </h1>
                    <p className="text-base lg:text-lg text-[#D1D5DB] mb-8 lg:mb-10">
                      {featuredConference.startDate
                        ? formatDate(featuredConference.startDate)
                        : "Ngày sắp công bố"}
                      {featuredConference.address && ` - ${featuredConference.address}`}
                    </p>
                    <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white">
                      {featuredConference.description?.split(".")[0] || "Sôi Động"} <br />{" "}
                      {featuredConference.description?.split(".")[1] || "Hơn Bao Giờ Hết"}
                    </p>
                    {featuredConference.availableSlot !== undefined && (
                      <p className="text-sm text-[#D1D5DB] mt-4">
                        Còn {featuredConference.availableSlot} chỗ trống
                      </p>
                    )}
                  </>
                ) : (
                  // Fallback to default content
                  <>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">
                      Hội Nghị 3D Visionaries
                    </h1>
                    <p className="text-base lg:text-lg text-[#D1D5DB] mb-8 lg:mb-10">
                      12 tháng 10 - Đại học FPT
                    </p>
                    <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white">
                      Sôi Động <br /> Hơn Bao Giờ Hết
                    </p>
                  </>
                )}
              </div> */}
            </div>

            {/* Booking Card */}
            <Link
              href={
                featuredConference?.isResearchConference
                  ? `/customer/discovery/research/${featuredConference.conferenceId}`
                  : `/customer/discovery/technical/${featuredConference?.conferenceId}`
              }
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
                    Đăng ký <br /> Online
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
                (e.currentTarget.style.borderColor =
                  "rgba(59, 130, 246, 0.4)")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(59, 130, 246, 0.2)")
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
                (e.currentTarget.style.borderColor =
                  "rgba(139, 92, 246, 0.4)")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(139, 92, 246, 0.2)")
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
            {lazyWithPricesLoading ? (
              // Loading skeleton for price cards
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-3xl border border-zinc-800/50 p-5 lg:p-6 min-h-[180px] lg:min-h-[210px] animate-pulse"
                    style={{
                      background: "rgba(0, 0, 0, 0.45)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="h-4 bg-zinc-700/50 rounded w-20 mb-3"></div>
                    <div className="h-8 bg-zinc-700/50 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-zinc-700/50 rounded w-full"></div>
                  </div>
                ))}
              </>
            ) : featuredConference?.conferencePrices && featuredConference.conferencePrices.length > 0 ? (
              // Display ticket prices dynamically
              featuredConference.conferencePrices.slice(0, 3).map((price, index) => {
                const formatPrice = (priceValue?: number) => {
                  if (!priceValue) return "Liên hệ";
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(priceValue);
                };

                const gradientColors = [
                  { border: "rgba(59, 130, 246, 0.3)", hover: "rgba(59, 130, 246, 0.5)" },
                  { border: "rgba(139, 92, 246, 0.3)", hover: "rgba(139, 92, 246, 0.5)" },
                  { border: "rgba(236, 72, 153, 0.3)", hover: "rgba(236, 72, 153, 0.5)" },
                ];

                const color = gradientColors[index % 3];

                return (
                  <Link
                    key={price.conferencePriceId}
                    href={
                      featuredConference?.isResearchConference
                        ? `/customer/discovery/research/${featuredConference.conferenceId}`
                        : `/customer/discovery/technical/${featuredConference?.conferenceId}`
                    }
                    className="group relative overflow-hidden rounded-3xl border transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
                    style={{
                      background: "rgba(0, 0, 0, 0.45)",
                      backdropFilter: "blur(10px)",
                      borderColor: color.border,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = color.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = color.border)}
                  >
                    <p className="text-sm text-[#D1D5DB] mb-3">{price.ticketName || `Loại phí đăng ký ${index + 1}`}</p>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug mb-2">
                          {formatPrice(price.ticketPrice)}
                        </h2>
                        {price.availableSlot !== undefined && (
                          <p className="text-xs text-[#9CA3AF]">
                            Còn {price.availableSlot}/{price.totalSlot || 0} chỗ
                          </p>
                        )}
                      </div>
                      <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
                        {price.ticketDescription || "Đăng ký ngay để nhận ưu đãi đặc biệt"}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              // Fallback to default cards when no prices available
              <>
                <Link
                  href={
                    featuredConference?.isResearchConference
                      ? `/customer/discovery/research/${featuredConference.conferenceId}`
                      : `/customer/discovery/technical/${featuredConference?.conferenceId}`
                  }
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

                <Link
                  href={
                    featuredConference?.isResearchConference
                      ? `/customer/discovery/research/${featuredConference.conferenceId}`
                      : `/customer/discovery/technical/${featuredConference?.conferenceId}`
                  }
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

                <Link
                  href={
                    featuredConference?.isResearchConference
                      ? `/customer/discovery/research/${featuredConference.conferenceId}`
                      : `/customer/discovery/technical/${featuredConference?.conferenceId}`
                  }
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
              </>
            )}
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
          </div> */}
        </div>
      </div>
    </section>
  );
}

// "use client";

// import { ArrowUpRight } from "lucide-react";
// import Link from "next/link";

// export default function HeroSection() {
//   return (
//     <section
//       className="relative py-12 lg:py-20"
//       style={{
//         backgroundImage:
//           "url('/images/LandingPage/background/dark_gradient_background.jpg')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="space-y-4 lg:space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-6">
//             {/* Hero Card */}
//             <div className="relative overflow-hidden rounded-3xl border border-zinc-800/50 p-6 lg:p-8 min-h-[350px] lg:min-h-[480px]">
//               <div
//                 className="absolute inset-0"
//                 style={{
//                   background:
//                     "radial-gradient(ellipse at 80% 20%, rgba(255, 100, 50, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(0, 200, 200, 0.4) 0%, transparent 50%), rgba(0, 0, 0, 0.3)",
//                 }}
//               />
//               <div className="relative z-10">
//                 <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">
//                   Hội Nghị 3D Visionaries
//                 </h1>
//                 <p className="text-base lg:text-lg text-[#D1D5DB] mb-8 lg:mb-10">
//                   12 tháng 10 - Đại học FPT
//                 </p>
//                 <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white">
//                   Sôi Động <br /> Hơn Bao Giờ Hết
//                 </p>
//               </div>
//             </div>

//             {/* Booking Card */}
//             <Link
//               href="#ticket"
//               className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-6 lg:p-8 min-h-[350px] lg:min-h-[480px]"
//               style={{
//                 background: "rgba(0, 0, 0, 0.4)",
//                 backdropFilter: "blur(10px)",
//               }}
//             >
//               <p className="text-3xl lg:text-4xl text-[#D1D5DB]">Đặt vé</p>
//               <div className="flex h-full flex-col justify-end">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white py-8 leading-tight">
//                     Nhận <br /> Vé Online
//                   </h2>
//                   <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-zinc-700/50 flex items-center justify-center group-hover:bg-zinc-600/50 transition flex-shrink-0">
//                     <ArrowUpRight className="w-6 h-6 lg:w-7 lg:h-7 text-[#D1D5DB]" />
//                   </div>
//                 </div>
//               </div>
//             </Link>

//             <div className="flex flex-col gap-4 lg:gap-6">
//               <Link
//                 href="#tech-conference"
//                 className="group relative overflow-hidden rounded-3xl border transition-all
//                       p-6 lg:p-7 flex-1 min-h-[200px] lg:min-h-[260px] flex flex-col justify-between"
//                 style={{
//                   background: "rgba(0, 0, 0, 0.5)",
//                   backdropFilter: "blur(12px)",
//                   borderColor: "rgba(59, 130, 246, 0.2)",
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.currentTarget.style.borderColor =
//                     "rgba(59, 130, 246, 0.4)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.borderColor =
//                     "rgba(59, 130, 246, 0.2)")
//                 }
//               >
//                 <p className="text-sm md:text-base text-[#D1D5DB] mb-3">
//                   Hội thảo công nghệ
//                 </p>
//                 <div className="flex items-end justify-between">
//                   <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
//                     Khám Phá <br /> công nghệ
//                   </h2>
//                   <div
//                     className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0"
//                     style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
//                   >
//                     <ArrowUpRight className="w-5 h-5 text-[#3B82F6]" />
//                   </div>
//                 </div>
//               </Link>

//               <Link
//                 href="#research-conference"
//                 className="group relative overflow-hidden rounded-3xl border transition-all
//                       p-6 lg:p-7 flex-1 min-h-[200px] lg:min-h-[260px] flex flex-col justify-between"
//                 style={{
//                   background: "rgba(0, 0, 0, 0.5)",
//                   backdropFilter: "blur(12px)",
//                   borderColor: "rgba(139, 92, 246, 0.2)",
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.currentTarget.style.borderColor =
//                     "rgba(139, 92, 246, 0.4)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.borderColor =
//                     "rgba(139, 92, 246, 0.2)")
//                 }
//               >
//                 <p className="text-sm md:text-base text-[#D1D5DB] mb-3">
//                   Hội nghị nghiên cứu
//                 </p>
//                 <div className="flex items-end justify-between">
//                   <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
//                     Nghiên cứu <br /> khoa học
//                   </h2>
//                   <div
//                     className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0"
//                     style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
//                   >
//                     <ArrowUpRight className="w-5 h-5 text-[#8B5CF6]" />
//                   </div>
//                 </div>
//               </Link>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
//             {/* Leadership Card */}
//             {/* Leadership Card */}
//             <Link
//               href="/leadership"
//               className="group relative overflow-hidden rounded-3xl border border-zinc-800/50
//              hover:border-zinc-600/50 transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
//               style={{
//                 background: "rgba(0, 0, 0, 0.45)",
//                 backdropFilter: "blur(10px)",
//               }}
//             >
//               <p className="text-sm text-[#D1D5DB] mb-3">Lãnh đạo</p>
//               <div className="flex items-start justify-between gap-4">
//                 <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug">
//                   Nhìn Thấy <br /> Tương Lai
//                 </h2>
//                 <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
//                   Học hỏi từ các nhà lãnh đạo toàn cầu và định hình tương lai.
//                 </p>
//               </div>
//             </Link>

//             {/* Workshops Card */}
//             <Link
//               href="/workshops"
//               className="group relative overflow-hidden rounded-3xl border border-zinc-800/50
//              hover:border-zinc-600/50 transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
//               style={{
//                 background: "rgba(0, 0, 0, 0.45)",
//                 backdropFilter: "blur(10px)",
//               }}
//             >
//               <p className="text-sm text-[#D1D5DB] mb-3">Hội thảo</p>
//               <div className="flex items-start justify-between gap-4">
//                 <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug">
//                   Thực Hành <br /> Trực Tiếp
//                 </h2>
//                 <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
//                   Khám phá các hội thảo do chuyên gia hàng đầu dẫn dắt.
//                 </p>
//               </div>
//             </Link>

//             {/* Afterparty Card */}
//             <Link
//               href="/afterparty"
//               className="group relative overflow-hidden rounded-3xl border border-zinc-800/50
//              hover:border-zinc-600/50 transition-all p-5 lg:p-6 min-h-[180px] lg:min-h-[210px]"
//               style={{
//                 background: "rgba(0, 0, 0, 0.45)",
//                 backdropFilter: "blur(10px)",
//               }}
//             >
//               <p className="text-sm text-[#D1D5DB] mb-3">Tiệc sau sự kiện</p>
//               <div className="flex items-start justify-between gap-4">
//                 <h2 className="text-xl lg:text-2xl font-semibold text-white leading-snug">
//                   Ăn Mừng <br /> Cùng Nhau
//                 </h2>
//                 <p className="text-xs lg:text-sm text-[#9CA3AF] leading-snug max-w-[160px]">
//                   Tham gia cùng chúng tôi trong một đêm tiệc khó quên.
//                 </p>
//               </div>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

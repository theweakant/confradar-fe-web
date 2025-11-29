"use client";

import React, { useState } from "react";

interface BannerFilterProps {
  onFilterChange?: (filter: "technical" | "research" | "all") => void;
  className?: string;
}

const ConferenceBanner: React.FC<BannerFilterProps> = ({
  onFilterChange,
  className = "",
}) => {
  const [activeFilter, setActiveFilter] = useState<
    "technical" | "research" | "all"
  >("all");

  const handleFilterClick = (filter: "technical" | "research" | "all") => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div
      className={`relative w-full h-96 lg:h-[500px] overflow-hidden rounded-lg ${className}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
          linear-gradient(
              135deg,
              rgba(255,255,255,0.2) 0%,
              rgba(0,0,0,0.4) 50%,
              rgba(128,128,128,0.2) 100%
            ),
         url('/images/customer_route/confbannerbg1.jpg')
       `,
          backgroundSize: "cover, cover, contain",
          backgroundPosition: "center, center, center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <g stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none">
          {/* <path d="M -600 0 L 600 400 L 1200 0" />
          <path d="M -400 0 L 600 350 L 1100 0" />
          <path d="M -100 0 L 600 300 L 1000 0" /> */}

          <path d="M 0 200 L 600 600 L 1200 200" />
          <path d="M 100 200 L 600 550 L 1100 200" />
          <path d="M 200 200 L 600 500 L 1000 200" />
        </g>
      </svg>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
            KHÁM PHÁ CONFRADAR
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            NÂNG TẦM KIẾN THỨC!
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Tham gia các hội thảo & hội nghị hàng đầu để cập nhật xu hướng công nghệ và
            nghiên cứu mới nhất
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <button
            onClick={() => handleFilterClick("all")}
            className={`
      px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105
      ${
        activeFilter === "all"
          ? "bg-white text-gray-900 shadow-xl"
          : "bg-gray-900/80 text-white border-2 border-white/30 hover:bg-white hover:text-gray-900"
      }
    `}
          >
            Tất cả
          </button>

          <button
            onClick={() => handleFilterClick("technical")}
            className={`
              px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105
              ${
                activeFilter === "technical"
                  ? "bg-white text-gray-900 shadow-xl"
                  : "bg-gray-900/80 text-white border-2 border-white/30 hover:bg-white hover:text-gray-900"
              }
            `}
          >
            Hội thảo Công nghệ
          </button>

          <button
            onClick={() => handleFilterClick("research")}
            className={`
              px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105
              ${
                activeFilter === "research"
                  ? "bg-white text-gray-900 shadow-xl"
                  : "bg-gray-900/80 text-white border-2 border-white/30 hover:bg-white hover:text-gray-900"
              }
            `}
          >
            Hội nghị Nghiên cứu
          </button>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

export default ConferenceBanner;

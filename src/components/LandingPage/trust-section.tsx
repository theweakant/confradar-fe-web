"use client";

import { Button } from "@/components/ui/button";
import { CardReveal } from "@/components/molecules/LandingPage/CardReveal";

export default function Home() {
  const items = [
    { name: "Explore", delay: 0 },
    { name: "TechConf", delay: 100 },
    { name: "Workshop", delay: 200 },
    { name: "Keynote", delay: 300 },
    { name: "Demo", delay: 400 },
    { name: "Discussions", delay: 500 },
    { name: "Become Reviewer", delay: 600 },
    { name: "Wishlist", delay: 700 },
    { name: "Favorites", delay: 800 },
    { name: "My Papers", delay: 900 },
    { name: "External Conferences", delay: 1000 },
    { name: "Network", delay: 1100 },
    { name: "My Schedule", delay: 1200 },
    { name: "Notifications", delay: 1300 },
  ];

  return (
    <section
      id="trusted-by-section"
      className="relative min-h-screen bg-black py-20 overflow-hidden flex flex-col"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-48 h-48 rounded-full border border-white/5" />
        <div className="absolute top-20 right-32 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute top-1/3 left-10 w-56 h-56 rounded-full border border-white/5" />
        <div className="absolute bottom-1/3 right-20 w-52 h-52 rounded-full border border-white/5" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full border border-white/5" />
        <div className="absolute top-1/2 right-10 w-36 h-36 rounded-full border border-white/5" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <h2 className="uppercase text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-16 tracking-tight">
          Tin Dùng Bởi Các Đối Tác
        </h2>

        <div className="relative flex-1 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[600px]">
          {/* Falling text cards */}
          {items.map((item, index) => (
            <CardReveal
              key={item.name}
              name={item.name}
              delay={item.delay}
              index={index}
              totalCards={items.length}
            />
          ))}

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-60 h-60 md:w-76 md:h-76 rounded-full bg-blue-600
                       flex flex-col items-center justify-center p-6 md:p-8 shadow-2xl"
            style={{ zIndex: 20 }}
          >
            <h3 className="uppercase text-xl md:text-2xl font-black text-white text-center mb-4 leading-tight tracking-wide">
              Đưa Hội Nghị Của Bạn
              <br />
              Đến Mọi Người
            </h3>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90 font-bold px-8 py-5 text-base md:text-lg uppercase tracking-wide"
            >
              Hợp Tác Ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

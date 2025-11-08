import { TypewriterHeadline } from "@/components/molecules/LandingPage/TypeWriter";
import { Button } from "@/components/ui/button";

export default function ExploreConferences() {
  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-900" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Small label */}
        <p className="text-zinc-400 text-sm font-medium tracking-widest uppercase mb-8">
          ConfRadar
        </p>

        {/* Typewriter headline */}
        <TypewriterHeadline
          prefix="Khám phá"
          keywords={["Công nghệ", "Nghiên cứu"]}
          suffix="ngay hôm nay"
          typingSpeed={100}
          pauseDuration={2000}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-12 leading-tight"
          keywordClassName="text-orange-500"
        />

        {/* CTA Button */}
        <Button
          size="lg"
          className="uppercase bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-lg rounded-lg transition-all duration-300 hover:scale-105"
        >
          tham gia ngay
        </Button>
      </div>
    </section>
  );
}

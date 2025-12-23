import Image from "next/image";
import { Marquee } from "@/components/molecules/Marquee";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Image Section */}
      <section className="relative w-full">
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <Image
            src="/images/LandingPage/conf_img/speaker_img.png"
            alt="Conference speakers and attendees"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* Marquee Section */}
      <section className="bg-black py-12 md:py-16">
        <Marquee
          text={["CÔNG NGHỆ", "NGHIÊN CỨU", "WORKSHOPS"]}
          speed={60}
          separator=" • "
          className="bg-black"
          textClassName="text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tight"
        />
      </section>

      {/* CTA Button Section */}
      <section className="bg-black pb-20 flex justify-center">
        <Button
          size="lg"
          className="uppercase bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-lg px-8 py-6 rounded-md transition-colors"
        >
          khám phá
        </Button>
      </section>
    </main>
  );
}

import Header from "@/components/LandingPage/header"
import HeroSection from "@/components/LandingPage/hero-section"
import FeaturesSection from "@/components/LandingPage/feature-section"
import HowItWorks from "@/components/LandingPage/how-it-work-section"
import PopularEvents from "@/components/LandingPage/popular-event"
import OrganizersSection from "@/components/LandingPage/organizer-section"
import StatisticsSection from "@/components/LandingPage/static-section"
import Footer from "@/components/LandingPage/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <PopularEvents />
        <OrganizersSection />
        <StatisticsSection />
      </main>
      <Footer />
    </div>
  )
}

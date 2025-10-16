import Header from "@/components/LandingPage/header"
import HeroSection from "@/components/LandingPage/hero-section"
import FeaturesSection from "@/components/LandingPage/feature-section"
import WhatWeOffer from "@/components/LandingPage/what-we-offer"
import UpcomingConferences from "@/components/LandingPage/upcoming-conferences"
import TrustedByCollaborator from "@/components/LandingPage/trust-section"
import ExploreConferences from "@/components/LandingPage/explore-section"

import Footer from "@/components/LandingPage/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhatWeOffer />
        <UpcomingConferences />
        <TrustedByCollaborator />
        <ExploreConferences/>
      </main>
      <Footer />
    </div>
  )
}

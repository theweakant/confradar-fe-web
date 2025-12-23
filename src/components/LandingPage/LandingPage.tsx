import Header from "@/components/LandingPage/header";
import HeroSection from "@/components/LandingPage/hero-section";
import FeaturesSection from "@/components/LandingPage/feature-section";
import WhatWeOffer from "@/components/LandingPage/what-we-offer";
import UpcomingConferences from "@/components/LandingPage/upcoming-conferences";
import TrustedByCollaborator from "@/components/LandingPage/trust-section";
import ExploreConferences from "@/components/LandingPage/explore-section";

// import AboutUs from "./AboutUs";
// import Policy from "./Policy";
// import FAQ from "./FAQ";

import Footer from "@/components/LandingPage/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhatWeOffer />
        {/* <UpcomingConferences /> */}
        {/* <TrustedByCollaborator /> */}
        <ExploreConferences />

        {/* <AboutUs/>  
        <Policy/>
        <FAQ/> */}
      </main>
      <Footer />
    </div>
  );
}

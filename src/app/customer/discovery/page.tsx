"use client";

import ConferenceBanner from "@/components/(user)/customer/discovery/ConferenceBanner";
import ConferenceBrowser from "@/components/(user)/customer/discovery/conference-browser/ConferenceBrowser";
import { useState } from "react";

export default function DiscoveryPage() {
  const [bannerFilter, setBannerFilter] = useState<
    "technical" | "research" | "all"
  >("all");

  return (
    // <div>
    //     <h1 className="text-2xl font-bold">DiscoveryPage</h1>
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-amber-50">
      <ConferenceBanner onFilterChange={setBannerFilter} />
      <ConferenceBrowser bannerFilter={bannerFilter} />
    </div>
  );
}

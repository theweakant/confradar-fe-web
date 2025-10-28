"use client"

import ConferenceBanner from "@/components/(user)/customer/discovery/ConferenceBanner";
import ConferenceBrowser from "@/components/(user)/customer/discovery/conference-browser/ConferenceBrowser";
import { useState } from "react";

export default function DiscoveryPage() {
    const [bannerFilter, setBannerFilter] = useState<'technical' | 'research'>('technical');

    return (
        // <div>
        //     <h1 className="text-2xl font-bold">DiscoveryPage</h1>
        // </div>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
            <ConferenceBanner onFilterChange={setBannerFilter} />
            <ConferenceBrowser bannerFilter={bannerFilter} />
        </div>
    );
}

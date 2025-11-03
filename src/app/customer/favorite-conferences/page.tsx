"use client"

import FavoriteConferences from "@/components/(user)/customer/favorite-conferences/FavoriteConferences";
// import ReportManagementScreen from "@/components/(user)/customer/ReportManagementScreen";

export default function FavoriteConferencesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden">
            <FavoriteConferences />
            {/* <PaperTrackingScreen /> */}
            {/* <SubmitPaperScreen /> */}
            {/* <ReportManagementScreen /> */}
        </div>
    );
}
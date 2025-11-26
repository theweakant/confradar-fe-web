"use client"

import { useState } from "react";
import { Users, Globe } from "lucide-react";
// import ManageExternalReviewer from "@/components/(user)/workspace/organizer/ManageExternalReviewer/ManageExternalReviewer";
import ManageLocalReviewer from "@/components/(user)/workspace/organizer/ManageLocalReviewer/ManageLocalReviewer";

export default function ManageCustomerPage() {
  const [activeTab, setActiveTab] = useState<"LocalReviewer" | "ExternalReviewer">("LocalReviewer");
  const handleTabChange = (tab: "LocalReviewer" | "ExternalReviewer") => {
    setActiveTab(tab);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 bg-white">
        <div className="flex gap-1">
          <button
            onClick={() => handleTabChange("LocalReviewer")}
            className={`pb-4 px-6 font-medium text-sm transition-all relative ${activeTab === "LocalReviewer"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Người đánh giá nội bộ của tổ chức</span>
            </div>
            {activeTab === "LocalReviewer" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>

          <button
            onClick={() => handleTabChange("ExternalReviewer")}
            className={`pb-4 px-6 font-medium text-sm transition-all relative ${activeTab === "ExternalReviewer"
              ? "text-green-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Người đánh giá thuê theo hợp đồng</span>
            </div>
            {activeTab === "ExternalReviewer" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "LocalReviewer" && <ManageLocalReviewer />}
        {/* {activeTab === "ExternalReviewer" && <ManageExternalReviewer />} */}
      </div>
    </div>
  );
}
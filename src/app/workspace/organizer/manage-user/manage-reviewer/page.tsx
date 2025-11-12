import { useState } from "react";
import { Users, Globe } from "lucide-react";
import ManageExternalReviewer from "@/components/(user)/workspace/organizer/ManageExternalReviewer/ManageExternalReviewer";
import ManageLocalReviewer from "@/components/(user)/workspace/organizer/ManageLocalReviewer/ManageLocalReviewer";

export default function ManageCustomerPage() {
  const [activeTab, setActiveTab] = useState<"LocalReviewer" | "ExternalReviewer">("LocalReviewer");
  const handleTabChange = (tab: "LocalReviewer" | "ExternalReviewer") => {
    setActiveTab(tab);
  };

  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex gap-4">
        <button
          onClick={() => handleTabChange("LocalReviewer")}
          className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === "LocalReviewer"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Local Reviewer</span>
          </div>
          {activeTab === "LocalReviewer" && (
            <ManageLocalReviewer />
          )}
        </button>
        <button
          onClick={() => handleTabChange("ExternalReviewer")}
          className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === "ExternalReviewer"
            ? "text-green-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>External Reviewer</span>
          </div>
          {activeTab === "ExternalReviewer" && (
            <ManageExternalReviewer />
          )}
        </button>
      </div>
    </div>
  );
}

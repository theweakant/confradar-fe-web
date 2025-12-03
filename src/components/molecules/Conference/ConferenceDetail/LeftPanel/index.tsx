// components/LeftPanel/index.tsx

import { getFilteredTabs, type TabId } from "../constants/tab";
import type { CommonConference } from "@/types/conference.type";
import { TabContent } from "./TabContent";
import { MetaInfoSection } from "./InfoSection";

interface LeftPanelProps {
  primaryTab: "detail" | "action";
  activeSubtab: TabId;
  onSubtabChange: (subtab: TabId) => void;
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  isCollaborator: boolean;
  userRoles: string[];    
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
}

export function LeftPanel({
  primaryTab,
  activeSubtab,
  onSubtabChange,
  conference,
  conferenceType,
  isCollaborator,
  userRoles,     
  getCategoryName,
  getStatusName,
  getCityName,
}: LeftPanelProps) {
  const tabs = getFilteredTabs(primaryTab, conferenceType, userRoles);

  // 👇 Xác định organizer dựa trên userRoles (điều chỉnh nếu logic khác)
  const isOrganizer = userRoles.includes("Conference Organizer");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 pt-6 mb-12">
          <MetaInfoSection
            conference={conference}
            getCategoryName={getCategoryName}
            getStatusName={getStatusName}
            getCityName={getCityName}
            isOrganizer={isOrganizer}
          />
        </div>

        <div className="border-b border-gray-200">
          <div className="px-6">
            <div className="flex gap-8">
              {tabs.map((tab) => {
                const isActive = activeSubtab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onSubtabChange(tab.id)}
                    className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-gray-900 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          <TabContent
            activeSubtab={activeSubtab}
            conference={conference}
            conferenceType={conferenceType}
            isCollaborator={isCollaborator}
          />
        </div>
      </div>
    </div>
  );
}
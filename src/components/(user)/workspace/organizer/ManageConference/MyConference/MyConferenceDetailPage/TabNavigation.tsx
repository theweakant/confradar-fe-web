// components/pages/ConferenceDetailPage/TabNavigation.tsx
import { Info, Users, Calendar, FileText, MessageCircle, Clock } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isResearch: boolean; // ✅ true = research, false = technical
}

export function TabNavigation({ activeTab, onTabChange, isResearch }: TabNavigationProps) {
  // Bộ tab cho Technical Conference
  const technicalTabs = [
    { id: "information", label: "Thông tin cơ bản", icon: Info },
    { id: "customer-requests", label: "Yêu cầu của khách", icon: Users },
    { id: "ticket-holders", label: "Khách đã mua vé", icon: Calendar },
  ];

  // Bộ tab cho Research Conference
  const researchTabs = [
    { id: "information", label: "Thông tin cơ bản", icon: Info },
    { id: "paper-phase", label: "Bài báo", icon: FileText },
    { id: "research-timeline", label: "Research Timeline", icon: Clock },
    { id: "customer-requests", label: "Yêu cầu của tác giả", icon: MessageCircle },
    { id: "ticket-holders", label: "Người tham dự", icon: Calendar },

    // Bạn có thể thêm tab khác như: "Reviewers", "Schedule", v.v.
  ];

  const tabs = isResearch ? researchTabs : technicalTabs;

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 min-w-max ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
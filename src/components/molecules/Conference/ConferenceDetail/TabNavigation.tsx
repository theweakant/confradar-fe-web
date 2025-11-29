// components/pages/ConferenceDetailPage/TabNavigation.tsx

import {
  Info,
  DollarSign,
  ShieldCheck,
  Calendar,
  ImageIcon,
  FileText,
  BookOpen,
  Users,
  MessageCircle,
  Clock,
  RefreshCw,
  ClipboardList 
} from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isResearch: boolean;
}

export function TabNavigation({ activeTab, onTabChange, isResearch }: TabNavigationProps) {
  const baseTabs = [
    { id: "information", label: "Thông tin cơ bản", icon: Info },
    { id: "price", label: "Chi phí", icon: DollarSign },
    { id: "refund-policy", label: "Hoàn trả & Chính sách", icon: ShieldCheck },
    { id: "session", label: "Session", icon: Calendar },
    { id: "sponsors-media", label: "Sponsors & Media", icon: ImageIcon },
    { id: "refund-requests", label: "Yêu cầu hoàn tiền", icon: RefreshCw },
    { id: "ticket-holders", label: "Khách đã mua", icon: Users },
  ];

  const researchOnlyTabs = [
    { id: "research-materials", label: "Tài liệu nghiên cứu", icon: FileText },
    { id: "research-info", label: "Research Info", icon: BookOpen },
    { id: "paper-phase", label: "Bài báo", icon: FileText },
    { id: "research-timeline", label: "Research Timeline", icon: Clock },
    { id: "paper-assignment", label: "Xếp bài báo", icon: ClipboardList  },

    { id: "other-requests", label: "Yêu cầu khác", icon: MessageCircle },
  ];

  const tabs = isResearch ? [...baseTabs, ...researchOnlyTabs] : baseTabs;

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
// components/HeaderSection.tsx
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommonConference } from "@/types/conference.type";
import { TAB_GROUPS } from "./constants/tabConfig";

interface HeaderSectionProps {
  conference: CommonConference;
  onBack: () => void;
  dropdownActions?: React.ReactNode;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  primaryTab: "detail" | "action";
  onPrimaryTabChange: (tab: "detail" | "action") => void;
}

export function HeaderSection({
  onBack,
  dropdownActions,
  primaryTab,
  onPrimaryTabChange,
}: HeaderSectionProps) {

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top row: Back button and Actions */}
        <div className="flex items-center justify-between">
          {/* Left: Back button and Primary Tabs */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Primary Tabs */}
            <div className="flex items-center gap-6">
              {TAB_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = primaryTab === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => onPrimaryTabChange(group.id)}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{group.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {dropdownActions}
          </div>
        </div>
      </div>
    </div>
  );
}
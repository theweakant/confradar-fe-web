import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommonConference } from "@/types/conference.type";
import { TAB_GROUPS } from "./constants/tab";

interface HeaderSectionProps {
  conference: CommonConference;
  onBack: () => void;
  actions?: React.ReactNode;      
  extraActions?: React.ReactNode;  
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  primaryTab: "detail" | "action";
  onPrimaryTabChange: (tab: "detail" | "action") => void;
}

export function HeaderSection({
  onBack,
  actions,
  extraActions,
  primaryTab,
  onPrimaryTabChange,
}: HeaderSectionProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 p-1 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Button>

            <div className="w-px h-6 bg-gray-200"></div>

            <div className="flex items-center gap-2 ml-3">
              {TAB_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActive = primaryTab === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => onPrimaryTabChange(group.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{group.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {extraActions}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}
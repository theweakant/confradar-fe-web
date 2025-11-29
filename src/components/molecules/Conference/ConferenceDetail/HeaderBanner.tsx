// components/HeaderSection.tsx
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommonConference } from "@/types/conference.type";

interface HeaderSectionProps {
  conference: CommonConference;
  onBack: () => void;
  dropdownActions?: React.ReactNode;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
}

export function HeaderSection({
  conference,
  onBack,
  dropdownActions,
  getCategoryName,
  getStatusName,
}: HeaderSectionProps) {
  const statusName = getStatusName(conference.conferenceStatusId ?? "");
  
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      "Draft": "bg-gray-100 text-gray-700",
      "Pending": "bg-yellow-100 text-yellow-700",
      "Preparing": "bg-blue-100 text-blue-700",
      "Ready": "bg-purple-100 text-purple-700",
      "Completed": "bg-green-100 text-green-700",
      "Canceled": "bg-red-100 text-red-700",
      "OnHold": "bg-orange-100 text-orange-700",
      "On Hold": "bg-orange-100 text-orange-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-start justify-between">
          {/* Left: Back button + Title */}
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {conference.conferenceName}
              </h1>
              <p className="text-sm text-gray-600 mb-3">
                {conference.description || "Mô tả"}
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(statusName)}`}>
                  {statusName}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {getCategoryName(conference.conferenceCategoryId ?? "")}
                </span>
                {conference.isResearchConference && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Research
                  </span>
                )}
                {conference.isInternalHosted && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ConfRadar
                  </span>
                )}
              </div>
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
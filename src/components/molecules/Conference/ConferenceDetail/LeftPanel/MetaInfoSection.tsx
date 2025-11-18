// components/LeftPanel/MetaInfoSection.tsx
import { formatDate } from "@/helper/format";
import type { CommonConference } from "@/types/conference.type";

interface MetaInfoSectionProps {
  conference: CommonConference;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
}

export function MetaInfoSection({
  conference,
  getCategoryName,
  getStatusName,
  getCityName,
}: MetaInfoSectionProps) {
  const statusName = getStatusName(conference.conferenceStatusId ?? "");
  
  // Status color mapping
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
    <div className="space-y-6">
      {/* Conference Title & Description */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {conference.conferenceName}
        </h2>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {conference.conferenceId}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {conference.description || "The design system in the web version currently needs improvement and includes the addition of several other components."}
        </p>
      </div>

      {/* Meta Information Grid */}
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Status</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(statusName)}`}>
            {statusName}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Assigned to</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900 font-medium">
              {getCategoryName(conference.conferenceCategoryId ?? "")}
            </span>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Start date</span>
          <span className="text-sm text-gray-900 font-medium">
            {formatDate(conference.startDate)}
          </span>
        </div>

        {/* End Date */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Due date</span>
          <span className="text-sm text-gray-900 font-medium">
            {formatDate(conference.endDate)}
          </span>
        </div>

        {/* City */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Priority</span>
          <span className="text-sm text-gray-900 font-medium">
            {getCityName(conference.cityId ?? "")}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Capacity</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-gray-900 font-bold">
              {conference.availableSlot}
            </span>
            <span className="text-sm text-gray-500">
              / {conference.totalSlot} slots
            </span>
          </div>
        </div>

        {/* Type Badges */}
        <div className="flex items-start">
          <span className="text-sm text-gray-500 w-32 flex-shrink-0">Type</span>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              conference.isInternalHosted
                ? "bg-green-50 text-green-700"
                : "bg-gray-50 text-gray-600"
            }`}>
              {conference.isInternalHosted ? "ConfRadar" : "Partner"}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              conference.isResearchConference
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-50 text-gray-600"
            }`}>
              {conference.isResearchConference ? "Research" : "Technical"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
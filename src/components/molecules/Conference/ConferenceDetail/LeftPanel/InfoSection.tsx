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
  return (
    <div className="space-y-6">
      {/* Conference Title & Description */}
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {conference.conferenceName}
          </h1>
          {conference.conferenceId && (
            <span className="text-xs text-gray-400 font-mono">
              #{conference.conferenceId}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {conference.description || "Hệ thống thiết kế trong phiên bản web hiện tại cần cải thiện và bổ sung thêm một số thành phần khác."}
        </p>
      </div>

      {/* Grid Layout: Info on Left, Banner on Right */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Meta Information */}
        <div className="space-y-4">
          {/* Category */}
          <div className="flex items-start">
            <span className="text-sm text-gray-500 w-32 flex-shrink-0">Phân loại</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 font-medium">
                {getCategoryName(conference.conferenceCategoryId ?? "")}
              </span>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="flex items-start">
            <span className="text-sm text-gray-500 w-32 flex-shrink-0">Thời gian</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(conference.startDate)}
              </span>
              <span className="text-sm text-gray-500">→</span>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(conference.endDate)}
              </span>
            </div>
          </div>

          {/* City */}
          <div className="flex items-start">
            <span className="text-sm text-gray-500 w-32 flex-shrink-0">Thành phố</span>
            <span className="text-sm text-gray-900 font-medium">
              {getCityName(conference.cityId ?? "")}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-start">
            <span className="text-sm text-gray-500 w-32 flex-shrink-0">Sức chứa</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-900 font-bold">
                {conference.availableSlot}
              </span>
              <span className="text-sm text-gray-500">
                / {conference.totalSlot} chỗ
              </span>
            </div>
          </div>

          {/* Type Badges */}
          <div className="flex items-start">
            <span className="text-sm text-gray-500 w-32 flex-shrink-0">Loại hình</span>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                conference.isInternalHosted
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-50 text-gray-600"
              }`}>
                {conference.isInternalHosted ? "ConfRadar" : "Đối tác"}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                conference.isResearchConference
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-600"
              }`}>
                {conference.isResearchConference ? "Nghiên cứu" : "Kỹ thuật"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Banner Image */}
        <div className="relative">
          {conference.bannerImageUrl ? (
            <div className="aspect-video rounded-lg overflow-hidden shadow-md">
              <img
                src={conference.bannerImageUrl}
                alt={`${conference.conferenceName} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Chưa có ảnh banner</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
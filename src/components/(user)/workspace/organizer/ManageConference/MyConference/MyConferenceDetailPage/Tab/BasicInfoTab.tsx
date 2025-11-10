// components/pages/ConferenceDetailPage/BasicInfoTab.tsx
import { Info } from "lucide-react";
import { formatDate } from "@/helper/format";
import type { CommonConference } from "../index1"; // hoặc import từ "@/types/conference.type"

interface BasicInfoTabProps {
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
  currentStatusName: string;
}

export function BasicInfoTab({
  conference,
  conferenceType,
  getCategoryName,
  getStatusName,
  getCityName,
  currentStatusName,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Thông tin cơ bản
          </h2>
          <p className="text-muted-foreground text-sm">
            Xem chi tiết về sự kiện hội nghị
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* ConfRadar / Đối tác */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              conference.isInternalHosted
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
            }`}
          >
            <span>{conference.isInternalHosted ? "ConfRadar" : "Đối tác"}</span>
          </div>

          {/* Công nghệ / Nghiên cứu */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              conference.isResearchConference
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
            }`}
          >
            <span>{conference.isResearchConference ? "Nghiên cứu" : "Công nghệ"}</span>
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Thông tin cơ bản{" "}
            <span className="text-muted-foreground text-sm">
              # {conference.conferenceId}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Tên hội nghị" value={conference.conferenceName} />
          <InfoField
            label="Danh mục"
            value={getCategoryName(conference.conferenceCategoryId ?? "")}
          />
          <InfoField
            label="Trạng thái"
            value={getStatusName(conference.conferenceStatusId ?? "")}
          />
          <InfoField
            label="Ngày tạo"
            value={formatDate(conference.createdAt)}
          />
        </div>
      </div>

      {/* Dates Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Lịch trình
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Ngày bắt đầu"
            value={formatDate(conference.startDate)}
          />
          <InfoField
            label="Ngày kết thúc"
            value={formatDate(conference.endDate)}
          />
          <InfoField
            label="Bắt đầu bán vé"
            value={formatDate(conference.ticketSaleStart)}
          />
          <InfoField
            label="Kết thúc bán vé"
            value={formatDate(conference.ticketSaleEnd)}
          />
        </div>
      </div>

      {/* Capacity & Location Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Địa điểm & Sức chứa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Địa chỉ" value={conference.address} />
          <InfoField
            label="Thành phố"
            value={getCityName(conference.cityId ?? "")}
          />
          <InfoField label="Tổng chỗ ngồi" value={conference.totalSlot} />
          <InfoField label="Chỗ còn lại" value={conference.availableSlot} />
        </div>
      </div>

      {/* Description Section */}
      {conference.description && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Mô tả</h3>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm">
            {conference.description}
          </p>
        </div>
      )}

      {/* === Timeline Section (Technical ONLY with data) === */}
      {conferenceType === "technical" &&
        conference.conferenceTimelines &&
        conference.conferenceTimelines.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Tiến độ
                </h3>
              </div>
            </div>

            {/* Status Flow Guide */}
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              {/* Status Progress Bar */}
              <div className="relative flex items-center justify-between mb-6">
                {/* Pending */}
                <div className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`w-full h-12 border-2 rounded-l-full flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Pending"
                        ? "bg-yellow-200 dark:bg-yellow-800/50 border-yellow-400 dark:border-yellow-600 shadow-lg"
                        : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Pending"
                          ? "text-yellow-800 dark:text-yellow-200"
                          : "text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      Pending
                    </span>
                  </div>
                  <div className="absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-t-2 border-b-2 border-r-2 transform skew-x-[-20deg] origin-top-left ${
                        currentStatusName === "Pending"
                          ? "bg-yellow-200 dark:bg-yellow-800/50 border-yellow-400 dark:border-yellow-600"
                          : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Preparing */}
                <div className="flex flex-col items-center flex-1 relative -ml-6">
                  <div
                    className={`w-full h-12 border-t-2 border-b-2 flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Preparing"
                        ? "bg-blue-200 dark:bg-blue-800/50 border-blue-400 dark:border-blue-600 shadow-lg"
                        : "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Preparing"
                          ? "text-blue-800 dark:text-blue-200"
                          : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      Preparing
                    </span>
                  </div>
                  <div className="absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-t-2 border-b-2 border-r-2 transform skew-x-[-20deg] origin-top-left ${
                        currentStatusName === "Preparing"
                          ? "bg-blue-200 dark:bg-blue-800/50 border-blue-400 dark:border-blue-600"
                          : "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Ready */}
                <div className="flex flex-col items-center flex-1 relative -ml-6">
                  <div
                    className={`w-full h-12 border-t-2 border-b-2 flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Ready"
                        ? "bg-purple-200 dark:bg-purple-800/50 border-purple-400 dark:border-purple-600 shadow-lg"
                        : "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Ready"
                          ? "text-purple-800 dark:text-purple-200"
                          : "text-purple-700 dark:text-purple-300"
                      }`}
                    >
                      Ready
                    </span>
                  </div>
                  <div className="absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-t-2 border-b-2 border-r-2 transform skew-x-[-20deg] origin-top-left ${
                        currentStatusName === "Ready"
                          ? "bg-purple-200 dark:bg-purple-800/50 border-purple-400 dark:border-purple-600"
                          : "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Completed */}
                <div className="flex flex-col items-center flex-1 relative -ml-6">
                  <div
                    className={`w-full h-12 border-2 rounded-r-full flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Completed"
                        ? "bg-green-200 dark:bg-green-800/50 border-green-400 dark:border-green-600 shadow-lg"
                        : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Completed"
                          ? "text-green-800 dark:text-green-200"
                          : "text-green-700 dark:text-green-300"
                      }`}
                    >
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional States */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
                    ["On Hold", "OnHold"].includes(currentStatusName)
                      ? "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 shadow-lg"
                      : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  }`}
                >
                  <div
                    className={`w-8 h-8 border rounded flex items-center justify-center flex-shrink-0 ${
                      ["On Hold", "OnHold"].includes(currentStatusName)
                        ? "bg-orange-200 dark:bg-orange-800/50 border-orange-400 dark:border-orange-600"
                        : "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        ["On Hold", "OnHold"].includes(currentStatusName)
                          ? "text-orange-800 dark:text-orange-200"
                          : "text-orange-700 dark:text-orange-300"
                      }`}
                    >
                      OH
                    </span>
                  </div>
                  <div
                    className={`text-[10px] ${
                      ["On Hold", "OnHold"].includes(currentStatusName)
                        ? "text-orange-800 dark:text-orange-200"
                        : "text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    <div className="font-semibold">On Hold</div>
                    <div className="text-[9px]">Ready ⇄ On Hold</div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
                    currentStatusName === "Canceled"
                      ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 shadow-lg"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div
                    className={`w-8 h-8 border rounded flex items-center justify-center flex-shrink-0 ${
                      currentStatusName === "Canceled"
                        ? "bg-red-200 dark:bg-red-800/50 border-red-400 dark:border-red-600"
                        : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        currentStatusName === "Canceled"
                          ? "text-red-800 dark:text-red-200"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      CX
                    </span>
                  </div>
                  <div
                    className={`text-[10px] ${
                      currentStatusName === "Canceled"
                        ? "text-red-800 dark:text-red-200"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    <div className="font-semibold">Canceled</div>
                    <div className="text-[9px]">Từ Preparing/OnHold</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline History */}
            <div className="space-y-3">
              {conference.conferenceTimelines?.map(
                (timeline, index) => {
                  const isLast =
                    index === (conference.conferenceTimelines?.length ?? 0) - 1;
                  return (
                    <div
                      key={timeline.conferenceTimelineId}
                      className="relative"
                    >
                      {!isLast && (
                        <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-border"></div>
                      )}

                      <div className="bg-background border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {(conference.conferenceTimelines?.length ?? 0) -
                                  index}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                                  {timeline.previousStatusName}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                                  {timeline.afterwardStatusName}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(timeline.changeDate)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {timeline.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
    </div>
  );
}

// --- Reusable InfoField ---
interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">
        {value != null && value !== "" ? String(value) : "N/A"}
      </p>
    </div>
  );
}
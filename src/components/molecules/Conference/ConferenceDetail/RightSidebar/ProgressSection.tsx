// components/RightSidebar/ProgressTimelineSection.tsx
import { Clock } from "lucide-react";
import type { CommonConference } from "@/types/conference.type";

interface ProgressTimelineSectionProps {
  conference: CommonConference;
  getStatusName: (id: string) => string;
  onOpenTimeline?: () => void;
}

export function ProgressTimelineSection({
  conference,
  getStatusName,
  onOpenTimeline,
}: ProgressTimelineSectionProps) {
  const statusName = getStatusName(conference.conferenceStatusId ?? "");

  const statusToPercent: Record<string, number> = {
    Draft: 0,
    Pending: 0,
    Preparing: 0,
    "OnHold": 25,
    Ready: 50,
    Completed: 100,
    Canceled: 0, 
  };

  const progressPercentage = statusToPercent[statusName] ?? 0;

  // Các trạng thái sẽ hiển thị trên timeline (bắt đầu từ Preparing)
  const visibleStatuses = ["Preparing", "OnHold", "Ready", "Completed"];
  const statusColors: Record<string, string> = {
    Preparing: "bg-blue-500",
    "OnHold": "bg-orange-500",
    Ready: "bg-purple-500",
    Completed: "bg-green-500",
  };

  // Tính ngày đến khai mạc (giữ nguyên)
  const calculateDaysUntilStart = () => {
    if (!conference.startDate) return null;
    const now = new Date();
    const start = new Date(conference.startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilStart = calculateDaysUntilStart();

  const getTimeLabel = () => {
    if (daysUntilStart === null) return "Chưa xác định";
    if (daysUntilStart > 0) return `${daysUntilStart} ngày`;
    if (conference.endDate) {
      const now = new Date();
      const end = new Date(conference.endDate);
      if (now > end) return "Đã kết thúc";
    }
    return "Đang diễn ra";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">Tiến độ</h3>
        {onOpenTimeline && (
          <button
            onClick={onOpenTimeline}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
          >
            Xem
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Thời gian đến khai mạc */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Đến ngày khai mạc</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {getTimeLabel()}
          </span>
        </div>

        {/* Thanh tiến độ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
              <span className="text-sm font-medium text-gray-900">Tiến độ</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Thanh tiến độ với các mốc - đã rút gọn width */}
          <div className="relative pt-2">
            <div className="relative max-w-[100%] mx-auto"> {/* ← Giảm width, căn giữa */}
              {/* Background bar */}
              <div className="h-2 bg-gray-200 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Các điểm mốc */}
              <div className="absolute inset-0">
                {visibleStatuses.map((status) => {
                  const percent = statusToPercent[status] ?? 0;
                  const isCompleted = progressPercentage >= percent;
                  const isCurrent = status === statusName;

                  return (
                    <div
                      key={status}
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{ left: `${percent}%` }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full z-10 transition-all ${
                          isCompleted ? statusColors[status] : "bg-gray-300"
                        } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Indicator động */}
              {progressPercentage > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-md z-20 transition-all duration-500"
                  style={{ left: `calc(${progressPercentage}% - 6px)` }}
                />
              )}
            </div>

            {/* Nhãn trạng thái - căn chỉnh theo thanh mới */}
            <div className="relative mt-3 max-w-[93%] mx-auto">
              {visibleStatuses.map((status) => {
                const percent = statusToPercent[status] ?? 0;
                const isCompleted = progressPercentage >= percent;
                const isCurrent = status === statusName;

                return (
                  <div
                    key={status}
                    className={`absolute text-[10px] whitespace-nowrap text-center transition-colors ${
                      isCurrent
                        ? "text-blue-600 font-semibold"
                        : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                    style={{
                      left: `${percent}%`,
                      transform: "translateX(-50%)",
                      top: "100%",
                      width: "auto",
                    }}
                  >
                    {status === "OnHold" ? "OnHold" : status}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trạng thái hiện tại */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Trạng thái hiện tại</span>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                statusName === "Preparing"
                  ? "bg-blue-100 text-blue-700"
                  : statusName === "On Hold"
                  ? "bg-orange-100 text-orange-700"
                  : statusName === "Ready"
                  ? "bg-purple-100 text-purple-700"
                  : statusName === "Completed"
                  ? "bg-green-100 text-green-700"
                  : statusName === "Canceled"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {statusName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
// components/molecules/Status/ValidationAlerts.tsx

import { AlertCircle, AlertTriangle, Clock } from "lucide-react";

interface ValidationAlertsProps {
  missingRequired: string[];
  missingRecommended: string[];
  isLoading?: boolean;
}

export const ConferenceValidationAlerts = ({
  missingRequired,
  missingRecommended,
  isLoading = false,
}: ValidationAlertsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
        <span>Đang kiểm tra dữ liệu...</span>
      </div>
    );
  }

  return (
    <>
      {missingRequired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-2">
                Cần hoàn thành các bước sau:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {missingRequired.map((msg, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {missingRecommended.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Gợi ý cải thiện:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {missingRecommended.map((msg, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {missingRequired.length === 0 && missingRecommended.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-800">
              Đủ điều kiện để cập nhật trạng thái
            </p>
          </div>
        </div>
      )}
    </>
  );
};

interface TimeValidationAlertsProps {
  expiredDates: string[];
  message?: string;
  isLoading?: boolean;
}

export const TimeValidationAlerts = ({
  expiredDates,
  message,
  isLoading = false,
}: TimeValidationAlertsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
        <span>Đang kiểm tra thời gian...</span>
      </div>
    );
  }

  if (expiredDates.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-green-800">
            Thời gian vẫn còn hợp lệ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            {message || "Các mốc thời gian sau đã qua:"}
          </p>
          <ul className="list-disc list-inside space-y-1 max-h-48 overflow-y-auto">
            {expiredDates.map((date, idx) => (
              <li key={idx} className="text-sm text-orange-700">
                {date}
              </li>
            ))}
          </ul>
          <p className="text-xs text-orange-600 mt-3 font-medium">
            Vui lòng cập nhật lại các mốc thời gian này trước khi chuyển sang trạng thái Ready
          </p>
        </div>
      </div>
    </div>
  );
};
import { useState } from "react";
import PaperAssignmentCalendar from "@/components/molecules/Calendar/SessionCalendar/PaperAssignmentCalendar";

interface PaperAssignmentTabProps {
  conferenceId: string;
}

export const PaperAssignmentTab: React.FC<PaperAssignmentTabProps> = ({ conferenceId }) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Section */}
      <div className="px-2 py-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Xếp bài báo vào session
        </h2>
        <p className="text-sm text-gray-600">
          Chọn một bài báo từ danh sách bên phải, sau đó click vào phiên họp để xem chi tiết và gán.
        </p>
        
        {/* Status Indicator */}
        {selectedPaperId && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">
              Đã chọn bài báo - Click vào phiên để gán
            </span>
            <button
              onClick={() => setSelectedPaperId(null)}
              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="Hủy chọn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="flex-1 overflow-auto px-2">
        <PaperAssignmentCalendar
          conferenceId={conferenceId}
          onPaperSelected={setSelectedPaperId}
          selectedPaperId={selectedPaperId}
          startDate={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>
  );
};
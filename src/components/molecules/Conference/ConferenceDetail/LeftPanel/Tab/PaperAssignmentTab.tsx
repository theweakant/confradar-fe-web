// src/components/.../PaperAssignmentTab.tsx
import { useState, useCallback } from "react";
import PaperAssignmentCalendar from "@/components/molecules/Calendar/SessionCalendar/PaperAssignmentCalendar";
import { SessionDetailForScheduleResponse } from "@/types/conference.type";
import { useAssignPresenterToSessionMutation } from "@/redux/services/paper.service";
import { toast } from "sonner";

interface PaperAssignmentTabProps {
  conferenceId: string;
}

export const PaperAssignmentTab: React.FC<PaperAssignmentTabProps> = ({ conferenceId }) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [assignPresenter, { isLoading: isAssigning }] = useAssignPresenterToSessionMutation();

  const handleSessionSelected = useCallback(
    (session: SessionDetailForScheduleResponse) => {
      if (!selectedPaperId) {
        toast.info("Vui lòng chọn một bài báo trước khi gán vào phiên.");
        return;
      }

      if (!session.conferenceSessionId) {
        toast.error("Phiên không hợp lệ.");
        return;
      }

      toast.custom(
        (t) => (
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-lg max-w-md">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Xác nhận gán bài báo</h3>
              <p className="text-sm text-gray-600">
                Bạn có chắc muốn gán bài báo này vào phiên{" "}
                <span className="font-semibold text-gray-900">&quot;{session.title}&quot;</span>?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => toast.dismiss(t)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  toast.dismiss(t);
                  try {
                    await assignPresenter({
                      paperId: selectedPaperId,
                      sessionId: session.conferenceSessionId!,
                    }).unwrap();

                    toast.success("Đã gán bài báo vào phiên thành công!");
                    setSelectedPaperId(null);
                  } catch (err) {
                    console.error("Gán bài báo thất bại:", err);
                    toast.error("Không thể gán bài báo vào phiên. Vui lòng thử lại.");
                  }
                }}
                disabled={isAssigning}
              >
                {isAssigning ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    },
    [selectedPaperId, assignPresenter, isAssigning]
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Section */}
      <div className="px-2 py-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Xếp bài báo vào session
        </h2>
        <p className="text-sm text-gray-600">
          Chọn một bài báo từ danh sách bên phải, sau đó click vào phiên họp để gán bài báo vào.
        </p>
        
        {/* Status Indicator */}
        {selectedPaperId && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">
              Đã chọn bài báo - Click vào phiên để gán
            </span>
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="flex-1 overflow-auto">
        <PaperAssignmentCalendar // 🔸 ĐÃ CẬP NHẬT
          conferenceId={conferenceId}
          onPaperSelected={setSelectedPaperId}
          onSessionSelected={handleSessionSelected}
          startDate={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>
  );
};
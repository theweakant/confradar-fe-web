import { useState, useCallback, Fragment } from "react";
import SessionCalendar from "@/components/molecules/Calendar/SessionCalendar/SessionCalendar";
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
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700 max-w-sm">
          <p className="text-sm mb-3">
            Bạn có chắc muốn gán bài báo này vào phiên <span className="font-semibold">{session.title}</span>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded"
              onClick={() => toast.dismiss(t)}
            >
              Hủy
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await assignPresenter({
                    paperId: selectedPaperId,
                    sessionId: session.conferenceSessionId!, // ✅ Đổi thành conferenceSessionId
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
    <div className="p-2">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Xếp bài báo vào phiên họp</h2>
      <p className="text-sm text-gray-400 mb-6">
        Chọn một bài báo từ danh sách bên phải, sau đó click vào phiên họp để gán bài báo vào.
      </p>

      <SessionCalendar
        conferenceId={conferenceId}
        onPaperSelected={setSelectedPaperId}
        onSessionSelected={handleSessionSelected}
        startDate={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
};
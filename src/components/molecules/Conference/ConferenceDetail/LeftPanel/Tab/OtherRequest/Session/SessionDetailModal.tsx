// components/OtherRequestTab/Session/SessionDetailModal.tsx
import { useState } from "react";
import {
  User,
  FileText,
  Calendar,
  CheckCircle,
  Layers,
  FileSearch,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderStatusBadge } from "../utils/utils";
import { ApproveChangeSession } from "@/components/molecules/Status/ApproveChangeSession";
import type { PendingSessionChangeResponse } from "@/types/assigningpresentersession.type";

// Helper: Định dạng ngày YYYY-MM-DD → DD/MM/YYYY
const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

// Helper: Định dạng thời gian "HH:mm:ss" → "HH:mm"
const formatTime = (timeStr?: string): string => {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5); // "12:00:00" → "12:00"
};

interface SessionDetailModalProps {
  request: PendingSessionChangeResponse | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SessionDetailModal({ request, open, onClose, onSuccess }: SessionDetailModalProps) {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  if (!request) return null;

  const current = request.currentSession;
  const next = request.newSession;

  // Luôn trả về object có { title, subtitle }
  const sessionDisplay = (session: PendingSessionChangeResponse["currentSession"]) => {
    if (!session) {
      return {
        title: "Không có thông tin",
        subtitle: "—",
      };
    }
    const time = `${formatTime(session.startTime)} – ${formatTime(session.endTime)}`;
    const date = session.date ? formatDate(session.date) : "—";
    const room = session.room?.displayName || "—";
    return {
      title: session.title || "Không có tiêu đề",
      subtitle: `${time} | ${date} | ${room}`,
    };
  };

  const currentDisplay = sessionDisplay(current);
  const newDisplay = sessionDisplay(next);

  const handleApproveClick = () => {
    setIsApproveModalOpen(true);
  };

  const handleApproveSuccess = () => {
    setIsApproveModalOpen(false);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Chi tiết yêu cầu đổi phiên
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gửi lúc: {request.requestAt ? formatDate(request.requestAt.split("T")[0]) : "N/A"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Request ID & Status - Same Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Bài báo:</p>
                <p className="text-lg font-bold text-blue-600">{request.paparTile}</p>
              </div>
            </div>
            <div>{renderStatusBadge(request.globalStatusName)}</div>
          </div>
          {/* Session Change - Side by Side */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 mb-6">
            {/* Current Session */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Session hiện tại:</p>
                  <p className="text-sm font-bold text-gray-900">{currentDisplay.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{currentDisplay.subtitle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="self-center text-xl font-bold text-blue-600 px-2">→</div>

            {/* New Session */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">Session mới:</p>
                  <p className="text-sm font-bold text-blue-800">{newDisplay.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{newDisplay.subtitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requested By */}
          <div className="flex items-start gap-3 mb-4">
            <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Người yêu cầu:</p>
              <p className="text-sm font-medium text-gray-900">
                {request.requestedByName || "Không có"}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="flex items-start gap-3 mb-4">
            <FileSearch className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Lý do thay đổi:</p>
              <p className="text-sm font-medium text-gray-900">
                {request.reason || "Không có lý do được cung cấp"}
              </p>
            </div>
          </div>

          {request.reviewedAt && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Thời gian xét duyệt:</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(request.reviewedAt.split("T")[0])}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t flex justify-end">
            {request.globalStatusName === "Pending" && (
              <button
                onClick={handleApproveClick}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Chấp nhận
              </button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Approve Modal */}
      <ApproveChangeSession
        open={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        sessionChangeRequestId={request.sessionChangeRequestId}
        paperTitle={`Đổi phiên: ${currentDisplay.title} → ${newDisplay.title}`}
        onSuccess={handleApproveSuccess}
      />
    </Dialog>
  );
}
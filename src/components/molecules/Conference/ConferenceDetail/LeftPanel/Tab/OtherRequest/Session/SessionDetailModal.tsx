// components/OtherRequestTab/Session/SessionDetailModal.tsx
import { useState } from "react";
import { X, User, FileText, Calendar, CheckCircle, Layers, FileSearch } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/helper/format";
import { renderStatusBadge } from "../utils/utils";
import { ApproveChangeSession } from "@/components/molecules/Status/ApproveChangeSession";
import type { PendingSessionChangeResponse } from "@/types/assigningpresentersession.type";

interface SessionDetailModalProps {
  request: PendingSessionChangeResponse | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SessionDetailModal({ request, open, onClose, onSuccess }: SessionDetailModalProps) {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  
  if (!request) return null;

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
            Gửi lúc: {request.requestAt ? formatDate(request.requestAt) : "N/A"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Request ID & Status - Same Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-start gap-3">
              <Layers className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Mã yêu cầu:</p>
                <p className="text-lg font-bold text-blue-600">#{request.sessionChangeRequestId}</p>
              </div>
            </div>
            <div>
              {renderStatusBadge(request.globalStatusName)}
            </div>
          </div>

          {/* Single Column Layout */}
          <div className="space-y-6">
            {/* Session Change - Highlighted Side by Side with Arrow */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-3 flex-1">
                <Layers className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Phiên hiện tại:</p>
                  <p className="text-sm font-bold text-gray-900">{request.currentSessionId || "—"}</p>
                </div>
              </div>
              
              <div className="text-xl font-bold text-blue-600 px-2">→</div>
              
              <div className="flex items-start gap-3 flex-1">
                <Layers className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Phiên mới:</p>
                  <p className="text-sm font-bold text-blue-800">{request.newSessionId || "—"}</p>
                </div>
              </div>
            </div>

            {/* Requested By */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Người yêu cầu:</p>
                <p className="text-sm font-medium text-gray-900">{request.requestedByName || "Không có"}</p>
              </div>
            </div>

            {/* Other Fields */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileSearch className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Lý do thay đổi:</p>
                  <p className="text-sm font-medium text-gray-900">{request.reason || "Không có lý do được cung cấp"}</p>
                </div>
              </div>

              {request.reviewedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Thời gian xét duyệt:</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(request.reviewedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t flex justify-end">
            <button 
              onClick={handleApproveClick}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Chấp nhận
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Approve Modal */}
      <ApproveChangeSession
        open={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        sessionChangeRequestId={request.sessionChangeRequestId}
        paperTitle={`Session: ${request.currentSessionId} → ${request.newSessionId}`}
        onSuccess={handleApproveSuccess}
      />
    </Dialog>
  );
}
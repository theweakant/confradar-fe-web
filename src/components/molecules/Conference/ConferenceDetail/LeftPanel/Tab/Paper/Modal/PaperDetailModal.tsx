"use client";

import { X, FileText, Users, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PaperDetail } from "@/types/statistics.type";

interface PaperDetailModalProps {
  paper: PaperDetail;
  onClose: () => void;
  onOpenAssignDialog: () => void;
  onOpenDecisionDialog: () => void;
  disableDecision?: boolean;
  abstractDecideStart?: string;
  abstractDecideEnd?: string;
}

const phaseStyles: Record<string, { bg: string; text: string }> = {
  Abstract: { bg: "bg-blue-100", text: "text-blue-800" },
  FullPaper: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Revision: { bg: "bg-amber-100", text: "text-amber-800" },
  CameraReady: { bg: "bg-purple-100", text: "text-purple-800" },
  default: { bg: "bg-gray-100", text: "text-gray-800" },
};

const statusStyles: Record<string, { icon: string; color: string }> = {
  Pending: { icon: "⏳", color: "text-yellow-600" },
  Accepted: { icon: "✓", color: "text-green-600" },
  Rejected: { icon: "✗", color: "text-red-600" },
  Revise: { icon: "⚠", color: "text-orange-600" },
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function PaperDetailModal({
  paper,
  onClose,
  onOpenAssignDialog,
  onOpenDecisionDialog,
  disableDecision = false,
  abstractDecideStart,
  abstractDecideEnd,
}: PaperDetailModalProps) {
  const hasReviewers = paper.assignedReviewers && paper.assignedReviewers.length > 0;

  const abstractNotSubmitted = !paper.abstractPhase;
  const abstractPending = paper.abstractPhase?.status === "Pending";
  const abstractDecided =
    paper.abstractPhase &&
    (paper.abstractPhase.status === "Accepted" || paper.abstractPhase.status === "Rejected");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết bài báo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Tiêu đề: {paper.title}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      phaseStyles[paper.paperPhase]?.bg || phaseStyles.default.bg
                    } ${phaseStyles[paper.paperPhase]?.text || phaseStyles.default.text}`}
                  >
                    {paper.paperPhase}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Mã bài báo:</span> {paper.paperId}
                  </div>
                  <div>
                    <span className="font-medium">Người nộp:</span> {paper.submittingAuthorName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 sticky top-0 z-10 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Tiến trình bài báo
            </h4>
            <div className="relative">
              {(() => {
                const PHASE_ORDER = ["Abstract", "FullPaper", "Revision", "CameraReady"];
                const currentPhaseIndex = PHASE_ORDER.indexOf(paper.paperPhase);

                const isActiveOrPassed = (phase: string) => {
                  const idx = PHASE_ORDER.indexOf(phase);
                  return idx <= currentPhaseIndex && idx !== -1;
                };

                return (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-lg ${
                          isActiveOrPassed("Abstract")
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isActiveOrPassed("Abstract")
                          ? paper.abstractPhase?.status
                            ? statusStyles[paper.abstractPhase.status]?.icon || "●"
                            : "●"
                          : "○"}
                      </div>
                      <div className="text-xs font-medium text-gray-700">Abstract</div>
                      {paper.abstractPhase && (
                        <div
                          className={`text-xs ${
                            statusStyles[paper.abstractPhase.status]?.color || "text-gray-500"
                          }`}
                        >
                          {paper.abstractPhase.status}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2">
                      {isActiveOrPassed("FullPaper") && (
                        <div className="h-full bg-blue-500 w-full"></div>
                      )}
                    </div>

                    <div className="flex-1 text-center">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-lg ${
                          isActiveOrPassed("FullPaper")
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isActiveOrPassed("FullPaper")
                          ? paper.fullPaperPhase?.status
                            ? statusStyles[paper.fullPaperPhase.status]?.icon || "●"
                            : "●"
                          : "○"}
                      </div>
                      <div className="text-xs font-medium text-gray-700">Full Paper</div>
                      {paper.fullPaperPhase && (
                        <div
                          className={`text-xs ${
                            statusStyles[paper.fullPaperPhase.status]?.color || "text-gray-500"
                          }`}
                        >
                          {paper.fullPaperPhase.status}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2">
                      {isActiveOrPassed("Revision") && (
                        <div className="h-full bg-blue-500 w-full"></div>
                      )}
                    </div>

                    <div className="flex-1 text-center">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-lg ${
                          isActiveOrPassed("Revision")
                            ? "bg-amber-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isActiveOrPassed("Revision")
                          ? paper.revisionPhase?.status
                            ? statusStyles[paper.revisionPhase.status]?.icon || "●"
                            : "●"
                          : "○"}
                      </div>
                      <div className="text-xs font-medium text-gray-700">Revision</div>
                      {paper.revisionPhase && (
                        <div
                          className={`text-xs ${
                            statusStyles[paper.revisionPhase.status]?.color || "text-gray-500"
                          }`}
                        >
                          {paper.revisionPhase.status}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2">
                      {isActiveOrPassed("CameraReady") && (
                        <div className="h-full bg-blue-500 w-full"></div>
                      )}
                    </div>

                    <div className="flex-1 text-center">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-lg ${
                          isActiveOrPassed("CameraReady")
                            ? "bg-purple-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isActiveOrPassed("CameraReady") ? "✓" : "○"}
                      </div>
                      <div className="text-xs font-medium text-gray-700">Camera Ready</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {(abstractDecideStart || abstractDecideEnd) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-1">Thời gian duyệt Abstract</h5>
              <p className="text-xs text-blue-700 mb-2">
                Chỉ có thể duyệt abstract trong khoảng thời gian này
              </p>
              <p className="text-sm text-blue-800">
                Từ {formatDate(abstractDecideStart)} → {formatDate(abstractDecideEnd)}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {paper.abstractPhase && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">Abstract Phase</h5>
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Tiêu đề:</strong> {paper.abstractPhase.title}
                </p>
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Mô tả:</strong> {paper.abstractPhase.description}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Trạng thái:</strong> {paper.abstractPhase.status}
                </p>
              </div>
            )}

            {paper.fullPaperPhase && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h5 className="font-semibold text-emerald-900 mb-2">Full Paper Phase</h5>
                <p className="text-sm text-emerald-800 mb-1">
                  <strong>Tiêu đề:</strong> {paper.fullPaperPhase.title}
                </p>
                <p className="text-sm text-emerald-800 mb-1">
                  <strong>Mô tả:</strong> {paper.fullPaperPhase.description}
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Trạng thái:</strong> {paper.fullPaperPhase.status}
                </p>
              </div>
            )}

            {paper.revisionPhase && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h5 className="font-semibold text-amber-900 mb-2">Revision Phase</h5>
                <p className="text-sm text-amber-800">
                  <strong>Trạng thái:</strong> {paper.revisionPhase.status}
                </p>
              </div>
            )}

            {paper.cameraReadyPhase && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2">Camera Ready Phase</h5>
                <p className="text-sm text-purple-800 mb-1">
                  <strong>Tiêu đề:</strong> {paper.cameraReadyPhase.title}
                </p>
                <p className="text-sm text-purple-800 mb-1">
                  <strong>Mô tả:</strong> {paper.cameraReadyPhase.description}
                </p>
                <p className="text-sm text-purple-800">
                  <strong>Trạng thái:</strong> {paper.cameraReadyPhase.status}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Reviewer đã gán ({paper.assignedReviewers?.length || 0})
            </h4>
              {hasReviewers ? (
                <div className="flex flex-wrap gap-2">
                  {paper.assignedReviewers.map((reviewer) => (
                    <div
                      key={reviewer.userId}
                      className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xs">
                          {reviewer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700">{reviewer.name}</span>
                      {reviewer.isHeadReviewer && (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
                          <span>★</span> Head
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có reviewer nào được gán</p>
              )}
          </div>

          {abstractPending && (
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                onClick={onOpenAssignDialog}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Step 1: Gán Reviewer
              </Button>
              <Button
                onClick={onOpenDecisionDialog}
                disabled={disableDecision}
                className={`flex-1 text-white ${
                  disableDecision
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Step 2: Duyệt Abstract
              </Button>
            </div>
          )}

          {abstractNotSubmitted && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <strong>Đang chờ tác giả nộp Abstract.</strong>
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Bài báo này chưa có Abstract. Vui lòng đợi tác giả nộp trước khi gán reviewer và duyệt.
              </p>
            </div>
          )}

          {abstractDecided && paper.abstractPhase && (
            <div
              className={`border rounded-lg p-4 ${
                paper.abstractPhase.status === "Accepted"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-sm flex items-center gap-2 ${
                  paper.abstractPhase.status === "Accepted"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                <span className="text-lg">
                  {paper.abstractPhase.status === "Accepted" ? "✓" : "✗"}
                </span>
                <strong>
                  Abstract đã được{" "}
                  {paper.abstractPhase.status === "Accepted" ? "chấp nhận" : "từ chối"}.
                </strong>
              </p>
              <p
                className={`text-xs mt-2 ${
                  paper.abstractPhase.status === "Accepted"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                Không thể thay đổi quyết định này.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
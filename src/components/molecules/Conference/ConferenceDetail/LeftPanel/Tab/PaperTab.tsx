"use client";

import { useState } from "react";
import { FileText, Users, Clock, X, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetSubmittedPapersQuery, useGetAssignReviewersQuery } from "@/redux/services/statistics.service";
import { useGetReviewersListQuery } from "@/redux/services/user.service";
import {
  useAssignPaperToReviewerMutation,
  useListPendingAbstractsQuery,
  useDecideAbstractStatusMutation,
} from "@/redux/services/paper.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { ReviewerListResponse } from "@/types/user.type";

interface PaperTabProps {
  conferenceId: string;
}

interface Abstract {
  abstractId: string;
  paperId: string;
  presenterName: string;
  conferenceName: string;
  globalStatusName: string;
  createdAt: string;
  abstractUrl: string;
}

type DecisionType = "Accepted" | "Rejected";

export function PaperTab({ conferenceId }: PaperTabProps) {
  // Assignment Modal States
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [isHeadReviewer, setIsHeadReviewer] = useState(false);

  // Pending Abstracts States
  const [showPendingAbstracts, setShowPendingAbstracts] = useState(false);
  const [selectedAbstract, setSelectedAbstract] = useState<Abstract | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<DecisionType | null>(null);

  // Queries
  const {
    data: papersData,
    isLoading: isLoadingPapers,
    isError: isErrorPapers,
  } = useGetSubmittedPapersQuery(conferenceId ? conferenceId : skipToken);

  const {
    data: reviewersData,
    isLoading: isLoadingReviewers,
    isError: isErrorReviewers,
  } = useGetAssignReviewersQuery(conferenceId ? conferenceId : skipToken);

  const { data: reviewersListData, isLoading: isLoadingReviewersList } =
    useGetReviewersListQuery();

  const { data: pendingAbstractsResponse, isLoading: isLoadingAbstracts } =
    useListPendingAbstractsQuery(conferenceId ? conferenceId : skipToken);

  // Mutations
  const [assignPaper, { isLoading: isAssigning }] = useAssignPaperToReviewerMutation();
  const [decideAbstractStatus, { isLoading: isDeciding }] = useDecideAbstractStatusMutation();

  const isLoading = isLoadingPapers || isLoadingReviewers;
  const isError = isErrorPapers || isErrorReviewers;

  const phaseStyles: Record<string, { bg: string; text: string }> = {
    Abstract: { bg: "bg-blue-100", text: "text-blue-800" },
    FullPaper: { bg: "bg-emerald-100", text: "text-emerald-800" },
    Revision: { bg: "bg-amber-100", text: "text-amber-800" },
    CameraReady: { bg: "bg-purple-100", text: "text-purple-800" },
    default: { bg: "bg-gray-100", text: "text-gray-800" },
  };

  // Assignment Modal Handlers
  const handlePaperClick = (paperId: string) => {
    setSelectedPaperId(paperId);
    setSelectedReviewer("");
    setIsHeadReviewer(false);
  };

  const handleCloseModal = () => {
    setSelectedPaperId(null);
    setSelectedReviewer("");
    setIsHeadReviewer(false);
  };

  const handleAssign = async () => {
    if (!selectedReviewer) {
      toast.error("Vui lòng chọn reviewer!");
      return;
    }

    if (!selectedPaperId) return;

    try {
      const res = await assignPaper({
        userId: selectedReviewer,
        paperId: selectedPaperId,
        isHeadReviewer,
      }).unwrap();

      toast.success(res.message || "Giao reviewer thành công!");
      handleCloseModal();
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err?.message || "Giao reviewer thất bại!";
      toast.error(errorMessage);
    }
  };

  // Pending Abstracts Handlers
  const handleOpenDecisionDialog = (abstract: Abstract) => {
    setSelectedAbstract(abstract);
    setShowDecisionDialog(true);
  };

  const handleDecisionClick = (decision: DecisionType) => {
    setPendingDecision(decision);
    setShowDecisionDialog(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedAbstract || !pendingDecision) return;

    try {
      await decideAbstractStatus({
        paperId: selectedAbstract.paperId,
        abstractId: selectedAbstract.abstractId,
        globalStatus: pendingDecision,
      }).unwrap();

      toast.success(
        pendingDecision === "Accepted"
          ? "Đã chấp nhận bài báo thành công!"
          : "Đã từ chối bài báo thành công!"
      );

      setShowConfirmDialog(false);
      setSelectedAbstract(null);
      setPendingDecision(null);
    } catch (error) {
      const apiError = error as { data?: ApiError };
      const message = apiError.data?.message || "Có lỗi xảy ra khi xử lý bài báo";
      toast.error(message);
      console.error("Error processing abstract:", error);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setShowDecisionDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
        <p className="text-gray-500">Không thể lấy danh sách bài báo hoặc phản biện.</p>
      </div>
    );
  }

  const papers = papersData?.data?.paperDetails || [];
  const reviewers = reviewersData?.data || [];
  const reviewersList = reviewersListData?.data ?? [];
  const selectedPaper = papers.find(p => p.paperId === selectedPaperId);
  const pendingAbstracts = pendingAbstractsResponse?.data || [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowPendingAbstracts(true)}
          >
            <Clock className="w-4 h-4" />
            Chờ duyệt ({pendingAbstracts.length})
          </Button>
        </div>

        <section className="bg-white rounded-xl p-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 inline">Bài báo đã nộp</h2>
              <span className="text-sm text-gray-500 ml-2">({papers.length} bài báo)</span>
            </div>
          </div>

          {papers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có bài báo nào được nộp</p>
            </div>
          ) : (
            <div className="space-y-3">
              {papers.map((paper) => (
                <div
                  key={paper.paperId}
                  onClick={() => handlePaperClick(paper.paperId)}
                  className="group p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/30 hover:shadow-md transition-all duration-200 bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-6 w-full">
                    <div className="flex items-start gap-3 flex-[4]">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                          {paper.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="truncate">#{paper.submittingAuthorId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-[2]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex -space-x-2">
                          {paper.assignedReviewers && paper.assignedReviewers.length > 0 ? (
                            <>
                              {paper.assignedReviewers.slice(0, 3).map((reviewer, idx) => (
                                <Avatar key={idx} className="w-8 h-8 ring-2 ring-white">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xs font-medium">
                                    {reviewer.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {paper.assignedReviewers.length > 3 && (
                                <Avatar className="w-8 h-8 ring-2 ring-white">
                                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-medium">
                                    +{paper.assignedReviewers.length - 3}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </>
                          ) : (
                            <Avatar className="w-8 h-8 ring-2 ring-white">
                              <AvatarFallback className="bg-gray-100">
                                <Users className="w-4 h-4 text-gray-400" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {paper.assignedReviewers?.length || 0} Người
                        </span>
                      </div>
                    </div>

                    <div className="flex-[2]">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Giai đoạn</div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            phaseStyles[paper.paperPhase]?.bg || phaseStyles.default.bg
                          } ${phaseStyles[paper.paperPhase]?.text || phaseStyles.default.text}`}
                        >
                          {paper.paperPhase}
                        </span>
                      </div>
                    </div>

                    <div className="flex-[2]">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Tiến độ</div>
                        <div className="flex gap-1 justify-center">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              ["Abstract", "FullPaper", "Revision", "CameraReady"].includes(paper.paperPhase)
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              ["FullPaper", "Revision", "CameraReady"].includes(paper.paperPhase)
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              ["Revision", "CameraReady"].includes(paper.paperPhase)
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              paper.paperPhase === "CameraReady" ? "bg-green-500" : "bg-gray-300"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 inline">Danh sách Phản biện</h2>
              <span className="text-sm text-gray-500 ml-2">({reviewers.length} người)</span>
            </div>
          </div>

          {reviewers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có phản biện nào được phân công</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewers.map((reviewer) => (
                <div
                  key={reviewer.reviewerId}
                  className="relative p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="absolute top-3 right-3">
                    <div className="bg-transparent border border-gray-500 text-black text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {reviewer.assignedPaperCount} bài
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 pr-20">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-lg font-semibold">
                          {reviewer.reviewerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">{reviewer.reviewerName}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="truncate">#{reviewer.reviewerId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(reviewer.assignedPaperCount, 5) }, (_, i) => {
                          const colors = [
                            "bg-gradient-to-br from-cyan-400 to-cyan-600",
                            "bg-gradient-to-br from-indigo-400 to-indigo-600",
                            "bg-gradient-to-br from-violet-400 to-violet-600",
                            "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600",
                            "bg-gradient-to-br from-amber-400 to-amber-600",
                          ];
                          return (
                            <Avatar key={i} className="w-6 h-6 ring-1 ring-white">
                              <AvatarFallback
                                className={`${colors[i % colors.length]} text-white text-xs font-semibold`}
                              >
                                {i + 1}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                        {reviewer.assignedPaperCount > 5 && (
                          <Avatar className="w-8 h-8 ring-2 ring-white">
                            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-semibold">
                              +{reviewer.assignedPaperCount - 5}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Assignment Modal */}
      {selectedPaperId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Giao reviewer cho bài báo
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedPaper && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {selectedPaper.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>#{selectedPaper.submittingAuthorId}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          phaseStyles[selectedPaper.paperPhase]?.bg || phaseStyles.default.bg
                        } ${phaseStyles[selectedPaper.paperPhase]?.text || phaseStyles.default.text}`}>
                          {selectedPaper.paperPhase}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Reviewer
                </label>
                <select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  disabled={isLoadingReviewersList}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn reviewer --</option>
                  {isLoadingReviewersList ? (
                    <option disabled>Đang tải...</option>
                  ) : reviewersList.length === 0 ? (
                    <option disabled>Không có reviewer nào</option>
                  ) : (
                    reviewersList.map((rev: ReviewerListResponse) => (
                      <option key={rev.userId} value={rev.userId}>
                        {rev.fullName || rev.email || rev.userId}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={isHeadReviewer}
                  onChange={(e) => setIsHeadReviewer(e.target.checked)}
                  id="isHeadReviewer"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isHeadReviewer" className="text-sm font-medium text-gray-700">
                  Giao làm Head Reviewer
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button
                onClick={handleCloseModal}
                variant="outline"
                className="border border-gray-300 hover:bg-gray-100"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAssign}
                disabled={isAssigning || isLoadingReviewersList || !selectedReviewer}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAssigning ? "Đang xử lý..." : "Giao reviewer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Abstracts Modal */}
      {showPendingAbstracts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Danh sách abstract chờ duyệt
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pendingAbstracts.length} abstract đang chờ quyết định
                </p>
              </div>
              <button
                onClick={() => setShowPendingAbstracts(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingAbstracts ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : pendingAbstracts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không có bài báo nào
                  </h3>
                  <p className="text-gray-600">
                    Hiện tại không có abstract nào đang chờ duyệt
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAbstracts.map((abstract) => (
                    <div
                      key={abstract.abstractId}
                      className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Abstract ID: {abstract.abstractId.substring(0, 8)}...
                          </h3>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">Diễn giả: {abstract.presenterName}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{abstract.conferenceName}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span>Trạng thái: {abstract.globalStatusName}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span>
                                Ngày nộp:{" "}
                                {new Date(abstract.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              {abstract.globalStatusName}
                            </span>
                            <a
                              href={abstract.abstractUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xem file
                            </a>
                          </div>
                        </div>

                        <Button
                          className="ml-4 flex-shrink-0"
                          onClick={() => handleOpenDecisionDialog(abstract)}
                          disabled={isDeciding}
                        >
                          Quyết định
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quyết định bài báo</DialogTitle>
            <DialogDescription>
              Vui lòng chọn quyết định cho bài báo này
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleDecisionClick("Accepted")}
            >
              Chấp nhận
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDecisionClick("Rejected")}
            >
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận quyết định</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ không thể hoàn tác. Bạn có chắc chắn muốn{" "}
              {pendingDecision === "Accepted" ? "chấp nhận" : "từ chối"} bài báo này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirm}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDecision}
              disabled={isDeciding}
              className={
                pendingDecision === "Accepted"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isDeciding ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
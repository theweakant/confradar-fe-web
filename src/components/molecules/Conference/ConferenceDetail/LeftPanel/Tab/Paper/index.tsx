"use client";

import { useGlobalTime } from "@/utils/TimeContext";
import { useState } from "react";
import { FileText, Calendar } from "lucide-react";
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
  useDecideAbstractStatusMutation,
} from "@/redux/services/paper.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";

import { PaperList } from "./List/PaperList";
import { ReviewerList } from "./List/ReviewerList";
import { PaperDetailModal } from "./Modal/PaperDetailModal";
import { AssignReviewerDialog } from "./Modal/AssignReviewerDialog";
import { DecisionDialog } from "./Modal/DecisionDialog";
import { DecisionType } from "@/types/paper.type";
import { ResearchConferenceDetailResponse, ResearchConferencePhaseResponse } from "@/types/conference.type";

interface PaperTabProps {
  conferenceId: string;
  conferenceData?: ResearchConferenceDetailResponse;
}

export function PaperTab({ conferenceId, conferenceData }: PaperTabProps) {
  const { now } = useGlobalTime();
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState<
    { userId: string; isHeadReviewer: boolean }[]
  >([]);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<DecisionType | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>("");

  const {
    data: papersData,
    isLoading: isLoadingPapers,
    isError: isErrorPapers,
    refetch: refetchPapers,
  } = useGetSubmittedPapersQuery(conferenceId ? conferenceId : skipToken);

  const {
    data: reviewersData,
    isLoading: isLoadingReviewers,
    isError: isErrorReviewers,
  } = useGetAssignReviewersQuery(conferenceId ? conferenceId : skipToken);

  const { data: reviewersListData, isLoading: isLoadingReviewersList } =
    useGetReviewersListQuery();

  const [assignPaper, { isLoading: isAssigning }] = useAssignPaperToReviewerMutation();
  const [decideAbstractStatus, { isLoading: isDeciding }] = useDecideAbstractStatusMutation();

  const isLoading = isLoadingPapers || isLoadingReviewers;
  const isError = isErrorPapers || isErrorReviewers;

  const activePhase = conferenceData?.researchPhase?.find(
    (phase: ResearchConferencePhaseResponse) => phase.isActive
  );
  const fallbackPhase = conferenceData?.researchPhase?.[0];
  const effectivePhase = activePhase || fallbackPhase;

  const abstractDecideStart = effectivePhase?.abstractDecideStatusStart;
  const abstractDecideEnd = effectivePhase?.abstractDecideStatusEnd;

  // const isWithinAbstractDecisionPeriod = () => {
  //   if (!abstractDecideStart || !abstractDecideEnd) return false;
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const startDate = new Date(abstractDecideStart);
  //   const endDate = new Date(abstractDecideEnd);
  //   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
  //   startDate.setHours(0, 0, 0, 0);
  //   endDate.setHours(23, 59, 59, 999);
  //   return today >= startDate && today <= endDate;
  // };

const isWithinAbstractDecisionPeriod = () => {
  if (!abstractDecideStart || !abstractDecideEnd) return false;
  const today = new Date(now); 
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(abstractDecideStart);
  const endDate = new Date(abstractDecideEnd);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  return today >= startDate && today <= endDate;
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

  const handlePaperClick = (paperId: string) => {
    setSelectedPaperId(paperId);
  };

  const handleClosePaperDetail = () => {
    setSelectedPaperId(null);
  };

  const handleOpenAssignDialog = () => {
    setShowAssignDialog(true);
    setSelectedReviewers([]);
  };

  const handleCloseAssignDialog = () => {
    setShowAssignDialog(false);
    setSelectedReviewers([]);
  };

  const handleAssignReviewer = async () => {
    if (selectedReviewers.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 reviewer!");
      return;
    }
    if (!selectedPaperId) return;

    try {
      const res = await assignPaper({
        paperId: selectedPaperId,
        reviewers: selectedReviewers,
      }).unwrap();

      toast.success(res.message || "Giao reviewer thành công!");
      handleCloseAssignDialog();
      refetchPapers();
    } catch (error: unknown) {
      const err = error as { data?: ApiError };
      const errorMessage = err?.data?.message || "Có lỗi xảy ra khi giao reviewer";
      toast.error(errorMessage);
    }
  };

  const handleOpenDecisionDialog = () => {
    const paper = papersData?.data?.paperDetails.find(p => p.paperId === selectedPaperId);
    const hasReviewers = paper?.assignedReviewers && paper.assignedReviewers.length > 0;

    if (!hasReviewers) {
      toast.warning("Bài báo chưa có reviewer. Vui lòng gán ít nhất 1 reviewer trước khi duyệt.");
      return;
    }

    if (!paper?.abstractPhase || paper.abstractPhase.status !== "Pending") {
      toast.warning("Abstract này không ở trạng thái chờ duyệt.");
      return;
    }

    const abstractId = paper.abstractPhase.id;
    if (!abstractId) {
      toast.error("Không tìm thấy abstract ID!");
      return;
    }

    setShowDecisionDialog(true);
  };

  const handleConfirmDecision = async () => {
    const paper = papersData?.data?.paperDetails.find(p => p.paperId === selectedPaperId);
    if (!paper || !pendingDecision) return;

    const abstractId = paper.abstractPhase?.id;
    if (!abstractId) {
      toast.error("Không tìm thấy abstract ID!");
      return;
    }

    try {
      await decideAbstractStatus({
        paperId: paper.paperId,
        abstractId: abstractId,
        globalStatus: pendingDecision,
        reason: decisionReason.trim(),
      }).unwrap();

      toast.success(
        pendingDecision === "Accepted"
          ? "Đã chấp nhận bài báo thành công!"
          : "Đã từ chối bài báo thành công!"
      );

      setShowConfirmDialog(false);
      setPendingDecision(null);
      setDecisionReason("");
      handleClosePaperDetail();
      refetchPapers();
    } catch (error) {
      const apiError = error as { data?: ApiError };
      const message = apiError.data?.message || "Có lỗi xảy ra khi xử lý bài báo";
      toast.error(message);
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
        <p className="text-gray-500">Không thể lấy danh sách bài báo hoặc reviewer.</p>
      </div>
    );
  }

  const papers = papersData?.data?.paperDetails || [];
  const reviewers = reviewersData?.data || [];
  const reviewersList = reviewersListData?.data ?? [];
  const selectedPaper = papers.find((p) => p.paperId === selectedPaperId);

  const availableReviewers = reviewersList.filter((reviewer) => {
    if (!selectedPaper) return true;
    const assignedReviewerIds = new Set(
      selectedPaper.assignedReviewers?.map((r) => r.userId) || []
    );
    return !assignedReviewerIds.has(reviewer.userId);
  });

  return (
    <>
      <div className="space-y-6">
        {abstractDecideStart && abstractDecideEnd ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Thời gian duyệt Abstract</h3>
                {isWithinAbstractDecisionPeriod() ? (
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Đang trong thời gian duyệt
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                    Ngoài thời gian duyệt
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-700">
              Từ {formatDate(abstractDecideStart)} → {formatDate(abstractDecideEnd)}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              Không tìm thấy thời gian duyệt abstract.
            </p>
          </div>
        )}

        <PaperList papers={papers} onPaperClick={handlePaperClick} />
        <ReviewerList reviewers={reviewers} />
      </div>

      {selectedPaperId && selectedPaper && (
        <PaperDetailModal
          paper={selectedPaper}
          onClose={handleClosePaperDetail}
          onOpenAssignDialog={handleOpenAssignDialog}
          onOpenDecisionDialog={handleOpenDecisionDialog}
          disableDecision={!isWithinAbstractDecisionPeriod()}
          abstractDecideStart={abstractDecideStart}
          abstractDecideEnd={abstractDecideEnd}
        />
      )}

      <AssignReviewerDialog
        open={showAssignDialog}
        onClose={handleCloseAssignDialog}
        selectedReviewers={selectedReviewers}
        reviewersList={availableReviewers}
        isLoadingReviewersList={isLoadingReviewersList}
        isAssigning={isAssigning}
        onReviewersChange={setSelectedReviewers}
        onAssign={handleAssignReviewer}
        existingReviewers={selectedPaper?.assignedReviewers || []}
      />

      <DecisionDialog
        open={showDecisionDialog}
        onClose={() => setShowDecisionDialog(false)}
        onDecisionClick={(decision, reason) => {
          setPendingDecision(decision);
          setDecisionReason(reason);
          setShowDecisionDialog(false);
          setShowConfirmDialog(true);
        }}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận quyết định</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ không thể hoàn tác. Bạn có chắc chắn muốn{" "}
              {pendingDecision === "Accepted" ? "chấp nhận" : "từ chối"} bài báo này?
              {decisionReason && (
                <div className="mt-2 text-sm">
                  <strong>Lý do:</strong> {decisionReason}
                </div>
              )}
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
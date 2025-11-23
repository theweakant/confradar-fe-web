"use client";

import { useState } from "react";
import { Clock, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PaperList } from "./List/PaperList";
import { ReviewerList } from "./List/ReviewerList";
import { AssignmentModal } from "./Modal/AssignmentModal";
import { AbstractList } from "./List/AbstractList";
import { Abstract1, DecisionType } from "@/types/paper.type";
import { ResearchPhase, ResearchConferenceDetailResponse, ResearchConferencePhaseResponse } from "@/types/conference.type";

interface PaperTabProps {
  conferenceId: string;
  conferenceData?: ResearchConferenceDetailResponse; 
}

export function PaperTab({ conferenceId, conferenceData }: PaperTabProps) {
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [isHeadReviewer, setIsHeadReviewer] = useState(false);

  const [showPendingAbstracts, setShowPendingAbstracts] = useState(false);
  const [selectedAbstract, setSelectedAbstract] = useState<Abstract1 | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<DecisionType | null>(null);

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

  const [assignPaper, { isLoading: isAssigning }] = useAssignPaperToReviewerMutation();
  const [decideAbstractStatus, { isLoading: isDeciding }] = useDecideAbstractStatusMutation();

  const isLoading = isLoadingPapers || isLoadingReviewers;
  const isError = isErrorPapers || isErrorReviewers;

  const activePhase = conferenceData?.researchPhase?.find(
    (phase: ResearchConferencePhaseResponse) => phase.isActive
  );

  const isAbstractReviewPeriod = () => {
    if (!activePhase) return false;

    const startStr = activePhase.abstractDecideStatusStart;
    const endStr = activePhase.abstractDecideStatusEnd;

    if (!startStr || !endStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return today >= startDate && today <= endDate;
  };

  const isPastReviewPeriod = () => {
    if (!activePhase) return false;

    const endStr = activePhase.abstractDecideStatusEnd;

    if (!endStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(endStr);

    if (isNaN(endDate.getTime())) return false;

    endDate.setHours(23, 59, 59, 999);

    return today > endDate;
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
    setSelectedReviewer("");
    setIsHeadReviewer(false);
  };

  const handleCloseAssignmentModal = () => {
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
      handleCloseAssignmentModal();
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err?.message || "Giao reviewer thất bại!";
      toast.error(errorMessage);
    }
  };

  const handleOpenDecisionDialog = (abstract: Abstract1) => {
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

  const handlePendingAbstractsClick = () => {
    if (!canReviewAbstracts) {
      if (isPastReviewPeriod()) {
        toast.warning("Đã hết thời gian duyệt Abstract!");
      } else {
        toast.warning("Chưa đến thời gian duyệt Abstract!");
      }
      return;
    }
    setShowPendingAbstracts(true);
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
  const selectedPaper = papers.find((p) => p.paperId === selectedPaperId);
  const pendingAbstracts = pendingAbstractsResponse?.data || [];
  const canReviewAbstracts = isAbstractReviewPeriod();

  const getReviewStatus = () => {
    if (!activePhase) return null;
    
    if (canReviewAbstracts) {
      return {
        label: "Đang trong thời gian duyệt",
        color: "bg-green-100 text-green-700"
      };
    } else if (isPastReviewPeriod()) {
      return {
        label: "Đã hết thời gian duyệt",
        color: "bg-red-100 text-red-700"
      };
    } else {
      return {
        label: "Chưa đến thời gian duyệt",
        color: "bg-amber-100 text-amber-700"
      };
    }
  };

  const reviewStatus = getReviewStatus();

  return (
    <>
      <div className="space-y-6">
        {activePhase && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Thời gian duyệt Abstract</h3>
                {reviewStatus && (
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${reviewStatus.color}`}>
                    {reviewStatus.label}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handlePendingAbstractsClick}
                disabled={!canReviewAbstracts}
              >
                <Clock className="w-4 h-4" />
                Chờ duyệt ({pendingAbstracts.length})
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">
                {formatDate(activePhase.abstractDecideStatusStart)}
              </span>
              <span className="text-blue-600 font-medium">→</span>
              <span className="text-gray-700">
                {formatDate(activePhase.abstractDecideStatusEnd)}
              </span>
            </div>
          </div>
        )}

        <PaperList papers={papers} onPaperClick={handlePaperClick} />

        <ReviewerList reviewers={reviewers} />
      </div>

      {selectedPaperId && (
        <AssignmentModal
          paper={selectedPaper}
          selectedReviewer={selectedReviewer}
          isHeadReviewer={isHeadReviewer}
          reviewersList={reviewersList}
          isLoadingReviewersList={isLoadingReviewersList}
          isAssigning={isAssigning}
          onClose={handleCloseAssignmentModal}
          onAssign={handleAssign}
          onReviewerChange={setSelectedReviewer}
          onHeadReviewerChange={setIsHeadReviewer}
        />
      )}

      {showPendingAbstracts && (
        <AbstractList
          abstracts={pendingAbstracts}
          isLoading={isLoadingAbstracts}
          isDeciding={isDeciding}
          showDecisionDialog={showDecisionDialog}
          showConfirmDialog={showConfirmDialog}
          pendingDecision={pendingDecision}
          onClose={() => setShowPendingAbstracts(false)}
          onOpenDecision={handleOpenDecisionDialog}
          onDecisionClick={handleDecisionClick}
          onConfirmDecision={handleConfirmDecision}
          onCancelConfirm={handleCancelConfirm}
          setShowDecisionDialog={setShowDecisionDialog}
          setShowConfirmDialog={setShowConfirmDialog}
        />
      )}
    </>
  );
}
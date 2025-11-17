"use client";

import { useParams } from "next/navigation";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";
import {
  useLazyGetPaperDetailForReviewerQuery,
} from "@/redux/services/paper.service";
import React, { useCallback, useEffect, useState } from "react";
import { ApiError, ApiResponse } from "@/types/api.type";
import FullPaperPhase from "./FullPaperPhase";
import RevisionPaperPhase from "./RevisionPaperPhase";
import CameraReadyPhase from "./CameraReadyPhase";
import { PaperDetailForReviewer, PaperDetailWrapperForReviewer } from "@/types/paper.type";
import { steps } from "@/helper/paper";
import PaperStepIndicator from "@/components/molecules/PaperStepIndicator";

export default function ReviewPaperPage() {
  const params = useParams();
  const paperId = params.paperId as string;

  // const { data, isLoading, error } = useGetPaperDetailForReviewerQuery(paperId);
  const [getPaperDetailForReviewer, { data, isLoading, error }] = useLazyGetPaperDetailForReviewerQuery();
  // const paperDetail = data?.data;
  const [paperDetail, setPaperDetail] = useState<PaperDetailForReviewer | null>(
    null,
  );
  const [paperDetailWrapper, setPaperDetailWrapper] = useState<PaperDetailWrapperForReviewer | null>(
    null,
  );
  const currentPhase = paperDetail?.currentResearchConferencePhase;

  const [currentStage, setCurrentStage] = useState<number>(0);
  const [maxReachedStage, setMaxReachedStage] = useState<number>(0);
  const [isValidPhase, setIsValidPhase] = useState<boolean>(true);

  const reviewerStages = steps.filter(s => s.label.toLowerCase() !== "abstract");

  const fetchPaperDetail = useCallback(
    async (paperId: string): Promise<ApiResponse<PaperDetailWrapperForReviewer>> => {
      try {
        const result = await getPaperDetailForReviewer(paperId).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [getPaperDetailForReviewer],
  );

  useEffect(() => {
    const loadPaperDetail = async () => {
      if (!paperId) return;

      // setIsLoadingPaperDetail(true);
      // setPaperDetailError(null);

      try {
        const response = await fetchPaperDetail(paperId);
        setPaperDetail(response.data.paperDetail);
      } catch (error: unknown) {

      }
    };

    loadPaperDetail();
    fetchPaperDetail(paperId)
  }, [paperId, fetchPaperDetail])

  useEffect(() => {
    if (paperDetail?.currentPaperPhase) {

      const currentPhaseIndex = reviewerStages.findIndex(
        (obj) =>
          obj.label.toLowerCase() ===
          paperDetail.currentPaperPhase!.phaseName?.toLowerCase(),
      );


      if (currentPhaseIndex !== -1) {
        setCurrentStage(currentPhaseIndex);
        setMaxReachedStage(currentPhaseIndex);
        setIsValidPhase(true);
      } else {
        setIsValidPhase(false);
      }
    }
  }, [paperDetail]);

  const hiddenStepIndexes = React.useMemo(() => {
    const hidden: number[] = [];

    if (paperDetail?.fullPaper?.reviewStatusName?.toLowerCase() === 'accepted') {
      hidden.push(1);
    }

    return hidden;
  }, [paperDetail?.fullPaper?.reviewStatusName]);

  const { completedStepIndexes, failedStepIndexes } = React.useMemo(() => {
    const completed: number[] = [];
    const failed: number[] = [];

    if (!paperDetail) return { completedStepIndexes: completed, failedStepIndexes: failed };

    if (paperDetail.fullPaper?.reviewStatusName?.toLowerCase() === 'accepted' || paperDetail.fullPaper?.reviewStatusName?.toLowerCase() === 'revise') completed.push(0);
    else if (paperDetail.fullPaper?.reviewStatusName?.toLowerCase() === 'rejected') failed.push(0);

    if (paperDetail.revisionPaper?.globalStatusName?.toLowerCase() === 'accepted') completed.push(1);
    else if (paperDetail.revisionPaper?.globalStatusName?.toLowerCase() === 'rejected') failed.push(1);

    if (paperDetail.cameraReady?.globalStatusName?.toLowerCase() === 'accepted') completed.push(2);
    else if (paperDetail.cameraReady?.globalStatusName?.toLowerCase() === 'rejected') failed.push(2);

    return { completedStepIndexes: completed, failedStepIndexes: failed };
  }, [paperDetail]);


  // useEffect(() => {
  //   if (paperDetail?.currentPaperPhase) {
  //     const currentPhaseIndex = stages3step.findIndex(
  //       (obj) =>
  //         obj.label.toLowerCase() ===
  //         paperDetail.currentPaperPhase!.phaseName?.toLowerCase(),
  //     );

  //     if (currentPhaseIndex !== -1) {
  //       setCurrentStage(currentPhaseIndex + 1);
  //       setMaxReachedStage(currentPhaseIndex + 1);
  //       setIsValidPhase(true);
  //       setActiveTab(
  //         currentPhaseIndex + 1 === 1 ? "fullPaper" : currentPhaseIndex + 1 === 2 ? "revision" : "cameraReady"
  //       );
  //     } else {
  //       setIsValidPhase(false);
  //     }
  //   }
  // }, [paperDetail]);

  const getStatusIcon = (statusName?: string) => {
    if (!statusName) return <Clock className="w-5 h-5 text-gray-600" />;
    const normalizedStatus = statusName.toLowerCase();
    if (normalizedStatus === "accepted") {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (normalizedStatus === "rejected") {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else if (normalizedStatus === "pending") {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (statusName?: string) => {
    if (!statusName) return "bg-gray-100 text-gray-800 border-gray-200";
    const normalizedStatus = statusName.toLowerCase();
    if (normalizedStatus === "accepted") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (normalizedStatus === "rejected") {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (normalizedStatus === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết bài báo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Có lỗi xảy ra khi tải chi tiết bài báo
          </p>
        </div>
      </div>
    );
  }

  // No data
  if (!paperDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin bài báo</p>
        </div>
      </div>
    );
  }

  if (!isValidPhase && paperDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-sm p-8 border-2 border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy giai đoạn review phù hợp
              </h2>
              <p className="text-gray-600 mb-6">
                Bài báo này không thuộc giai đoạn nào có thể review được (Full Paper, Revision, Camera Ready)
              </p>

              {/* Paper Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin bài báo:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paper ID:</span>
                    <span className="font-medium text-gray-900">{paperId}</span>
                  </div>
                  {paperDetail.currentPaperPhase && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giai đoạn hiện tại:</span>
                      <span className="font-medium text-gray-900">
                        {paperDetail.currentPaperPhase.phaseName || "Không xác định"}
                      </span>
                    </div>
                  )}
                  {/* {paperDetail.title && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiêu đề:</span>
                    <span className="font-medium text-gray-900 text-right ml-4">
                      {paperDetail.title}
                    </span>
                  </div>
                )} */}
                </div>
              </div>

              {/* Acceptable Phases */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Các giai đoạn có thể review:
                </h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {reviewerStages.map((stage, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                    >
                      {stage.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="px-6"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Tải lại trang
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Paper Detail Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Header */}
          <div className="pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Chi tiết bài báo
            </h2>
            <p className="text-sm text-gray-500 mt-1">Paper ID: {paperId}</p>
          </div>

          {/* Role Badge with Decision Button */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-200 rounded-full text-xs">
                  {paperDetail.isHeadReviewer ? "HEAD REVIEWER" : "REVIEWER"}
                </span>
                {paperDetail.isHeadReviewer
                  ? "Bạn là Head Reviewer cho bài báo này"
                  : "Bạn là Reviewer cho bài báo này"}
              </p>
            </div>
          </div>
          {currentPhase && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Thời hạn các giai đoạn
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Đăng ký:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentPhase.registrationStartDate)} -{" "}
                    {formatDate(currentPhase.registrationEndDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Full Paper:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentPhase.fullPaperStartDate)} -{" "}
                    {formatDate(currentPhase.fullPaperEndDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Review:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentPhase.reviewStartDate)} -{" "}
                    {formatDate(currentPhase.reviewEndDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Revision:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentPhase.reviseStartDate)} -{" "}
                    {formatDate(currentPhase.reviseEndDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Camera Ready:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(currentPhase.cameraReadyStartDate)} -{" "}
                    {formatDate(currentPhase.cameraReadyEndDate)}
                  </p>
                </div>
              </div>

              {(currentPhase.revisionRoundsDetail?.length || 0) > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-xs font-semibold text-blue-900">
                    Revision Rounds:
                  </span>
                  <div className="mt-2 space-y-1">
                    {[...(currentPhase.revisionRoundsDetail || [])]
                      .sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0))
                      .map((round) => (
                        <div
                          key={round.revisionRoundDeadlineId}
                          className="text-xs"
                        >
                          <span className="text-gray-600">
                            Round {round.roundNumber}:
                          </span>
                          <span className="font-medium text-gray-900 ml-2">
                            {round.startSubmissionDate
                              ? formatDate(round.startSubmissionDate)
                              : "N/A"}{" "}
                            - {formatDate(round.endSubmissionDate)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar Navigation */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Các giai đoạn bài báo</h3>

            <div className="px-6">
              <PaperStepIndicator
                steps={reviewerStages}
                currentStep={currentStage}
                maxReachedStep={maxReachedStage}
                onStepChange={(stepIndex) => { setCurrentStage(stepIndex); }}
                hiddenStepIndexes={hiddenStepIndexes}
                completedStepIndexes={completedStepIndexes}
                failedStepIndexes={failedStepIndexes}
              />
              {/* <Slider
                min={1}
                max={3}
                step={1}
                marks={{
                  1: <span className="text-xs text-gray-600">Full Paper</span>,
                  2: <span className="text-xs text-gray-600">Revision Paper</span>,
                  3: <span className="text-xs text-gray-600">Camera Ready</span>,
                }}
                value={currentStage}
                disabled={!isValidPhase}
                onBeforeChange={(value) => {
                  if (typeof value !== "number") return;

                  if (value > maxReachedStage) {
                    alert("Bạn không thể bỏ qua giai đoạn hiện tại.");
                    return;
                  }

                  console.log("ne", value)

                  setCurrentStage(value);
                    setActiveTab(
                      value === 1 ? "fullPaper"
                        : value === 2 ? "revision"
                          : "cameraReady"
                    );
                }}
                trackStyle={[{ backgroundColor: "#3b82f6", height: 8 }]}
                handleStyle={{
                  borderColor: "#3b82f6",
                  height: 20,
                  width: 20,
                  marginTop: -9,
                  backgroundColor: "#60a5fa",
                }}
                railStyle={{ backgroundColor: "#e5e7eb", height: 8 }}
              /> */}
            </div>

            <div className="mt-10 text-sm text-gray-600 text-center">
              Giai đoạn hiện tại:{" "}
              <span className="text-blue-600 font-semibold">
                {paperDetail.currentPaperPhase?.phaseName ||
                  paperDetail.currentPaperPhase?.paperPhaseId}
              </span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pt-4">
            {currentStage === 0 && (
              <FullPaperPhase
                paperDetail={paperDetail}
                currentPhase={currentPhase}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                paperId={paperId}
              />
            )}
            {currentStage === 1 && (
              <RevisionPaperPhase
                paperDetail={paperDetail}
                currentPhase={currentPhase}
                paperId={paperId}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            )}
            {currentStage === 2 && (
              <CameraReadyPhase
                paperDetail={paperDetail}
                currentPhase={currentPhase}
                paperId={paperId}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

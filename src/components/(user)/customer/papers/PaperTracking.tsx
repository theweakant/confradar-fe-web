"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import AbstractPhase from "./AbstractPhase";
import FullPaperPhase from "./FullPaperPhase";
import RevisionPhase from "./RevisionPhase";
import CameraReadyPhase from "./CameraReadyPhase";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import type { PaperPhase, PaperDetailResponse } from "@/types/paper.type";
import { steps } from "@/helper/paper";
import PaperStepIndicator from "@/components/molecules/PaperStepIndicator";

const PaperTracking = () => {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [maxReachedStage, setMaxReachedStage] = useState<number>(1);

  const [paperDetail, setPaperDetail] = useState<PaperDetailResponse | null>(
    null,
  );
  const [isLoadingPaperDetail, setIsLoadingPaperDetail] =
    useState<boolean>(false);
  const [paperDetailError, setPaperDetailError] = useState<string | null>(null);

  const params = useParams();
  const paperId = params?.id as string;

  const {
    paperPhases,
    paperPhasesError,
    fetchPaperDetail,
    loading: paperPhasesLoading,
  } = usePaperCustomer();

  useEffect(() => {
    const loadPaperDetail = async () => {
      if (!paperId) return;

      setIsLoadingPaperDetail(true);
      setPaperDetailError(null);

      try {
        const response = await fetchPaperDetail(paperId);
        setPaperDetail(response.data);
      } catch (error: unknown) {
        // Handle API error
        // if (error?.data?.Message) {
        //   setPaperDetailError(error.data.Message);
        // } else if (error?.data?.Errors) {
        //   const errors = Object.values(error.data.Errors);
        //   setPaperDetailError(errors.length > 0 ? errors[0] as string : "Có lỗi xảy ra khi tải chi tiết bài báo");
        // } else {
        //   setPaperDetailError("Có lỗi xảy ra khi tải chi tiết bài báo");
        // }
        setPaperDetailError("Có lỗi xảy ra khi tải chi tiết bài báo");
      } finally {
        setIsLoadingPaperDetail(false);
      }
    };

    loadPaperDetail();
  }, [paperId, fetchPaperDetail]);

  useEffect(() => {
    if (paperPhases.length > 0 && paperDetail?.currentPhase) {
      // const currentPhaseIndex = paperPhases.findIndex(
      //   (phase: PaperPhase) => phase.paperPhaseId === paperDetail.currentPhase.paperPhaseId
      // );

      const currentPhaseIndex = steps.findIndex(
        (obj) =>
          obj.label.toLowerCase() ===
          paperDetail.currentPhase!.phaseName?.toLowerCase(),
      );

      if (currentPhaseIndex !== -1) {
        setCurrentStage(currentPhaseIndex);
        setMaxReachedStage(currentPhaseIndex);
      }
    }
  }, [paperPhases, paperDetail]);

  const hiddenStepIndexes = React.useMemo(() => {
    const hidden: number[] = [];

    if (paperDetail?.fullPaper?.reviewStatus?.toLowerCase() === 'accepted') {
      hidden.push(2);
    }

    return hidden;
  }, [paperDetail?.fullPaper?.reviewStatus]);

  const { completedStepIndexes, failedStepIndexes } = React.useMemo(() => {
    const completed: number[] = [];
    const failed: number[] = [];

    if (!paperDetail) return { completedStepIndexes: completed, failedStepIndexes: failed };

    if (paperDetail.abstract?.status?.toLowerCase() === 'accepted') {
      completed.push(0);
    } else if (paperDetail.abstract?.status?.toLowerCase() === 'rejected') {
      failed.push(0);
    }

    const fullPaperStatus = paperDetail.fullPaper?.reviewStatus?.toLowerCase();

    if (fullPaperStatus === "accepted" || fullPaperStatus === "revise") {
      completed.push(1);
    } else if (fullPaperStatus === 'rejected') {
      failed.push(1);
    }

    if (paperDetail.revisionPaper?.overallStatus?.toLowerCase() === 'accepted') {
      completed.push(2);
    } else if (paperDetail.revisionPaper?.overallStatus?.toLowerCase() === 'rejected') {
      failed.push(2);
    }

    if (paperDetail.cameraReady?.status?.toLowerCase() === 'accepted') {
      completed.push(3);
    } else if (paperDetail.cameraReady?.status?.toLowerCase() === 'rejected') {
      failed.push(3);
    }

    return { completedStepIndexes: completed, failedStepIndexes: failed };
  }, [paperDetail]);

  const maxStageAllowed = failedStepIndexes.length > 0 ? failedStepIndexes[0] + 1 : 4;

  // const stages = [
  //   { id: 1, label: "Abstract" },
  //   { id: 2, label: "FullPaper" },
  //   { id: 3, label: "Revise" },
  //   { id: 4, label: "CameraReady" },
  // ];

  // const stages = paperPhases.length > 0
  //   ? paperPhases.map((phase: PaperPhase, index: number) => ({
  //     id: index + 1,
  //     label: phase.phaseName || `Phase ${index + 1}`
  //   }))
  //   : [
  //     { id: 1, label: 'Abstract' },
  //     { id: 2, label: 'Full Paper' },
  //     { id: 3, label: 'Revision' },
  //     { id: 4, label: 'Camera Ready' },
  //   ];

  // Get error message for paper phases
  const getPaperPhasesErrorMessage = (): string => {
    if (!paperPhasesError) return "";

    if (paperPhasesError.data?.message) {
      return paperPhasesError.data.message;
    }

    if (paperPhasesError.data?.errors) {
      const errors = Object.values(paperPhasesError.data.errors);
      return errors.length > 0
        ? errors[0]
        : "Có lỗi xảy ra khi tải danh sách phases";
    }

    return "Có lỗi xảy ra khi tải danh sách phases";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Theo dõi bài báo</h2>
              <p className="text-gray-400">
                {paperId
                  ? `Paper ID: ${paperId}`
                  : "Theo dõi tiến độ bài báo của bạn. Nhấn nút Tiếp tục theo dõi để xem chi tiết hoặc sử dụng thanh tiến độ bên dưới."}
              </p>
              {paperDetail?.currentPhase && (
                <p className="text-blue-400 text-sm mt-1">
                  Giai đoạn hiện tại:{" "}
                  {paperDetail.currentPhase.phaseName ||
                    paperDetail.currentPhase.paperPhaseId}
                </p>
              )}
            </div>

            {(paperPhasesLoading || isLoadingPaperDetail) && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Đang tải dữ liệu...</p>
                </div>
              </div>
            )}

            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              (paperPhasesError || paperDetailError) && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mb-10">
                  <h3 className="text-red-400 font-semibold mb-2">
                    Lỗi tải dữ liệu
                  </h3>
                  {paperPhasesError && (
                    <p className="text-red-300 text-sm mb-2">
                      Phases: {getPaperPhasesErrorMessage()}
                    </p>
                  )}
                  {paperDetailError && (
                    <p className="text-red-300 text-sm">
                      Paper Detail: {paperDetailError}
                    </p>
                  )}
                  <button
                    className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Thử lại
                  </button>
                </div>
              )}

            {!paperId && !paperPhasesLoading && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6 mb-10">
                <h3 className="text-yellow-400 font-semibold mb-2">
                  Thiếu thông tin
                </h3>
                <p className="text-yellow-300 text-sm">
                  Không tìm thấy Paper ID trong URL. Vui lòng kiểm tra lại đường
                  dẫn.
                </p>
              </div>
            )}

            {/* Paper Overview */}
            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              !paperPhasesError &&
              !paperDetailError &&
              paperDetail && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 my-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="text-blue-400">📄</span>
                      Thông tin bài báo
                    </h2>
                    {paperDetail.currentPhase && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-medium">Giai đoạn hiện tại:</span>
                        <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                          {paperDetail.currentPhase.phaseName || "Chưa xác định"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Paper ID</p>
                        <p className="text-white font-mono text-lg">{paperDetail.paperId}</p>
                      </div>

                      {paperDetail.title && (
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Tiêu đề</p>
                          <p className="text-white font-medium">{paperDetail.title}</p>
                        </div>
                      )}

                      {paperDetail.created && (
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ngày tạo</p>
                          <p className="text-white">
                            {new Date(paperDetail.created).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {paperDetail.rootAuthor && (
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tác giả chính</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {paperDetail.rootAuthor.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{paperDetail.rootAuthor.fullName}</p>
                              {paperDetail.rootAuthor.userId && (
                                <p className="text-gray-400 text-sm">Mã tài khoản: {paperDetail.rootAuthor.userId}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {paperDetail.coAuthors && paperDetail.coAuthors.length > 0 && (
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                            Đồng tác giả ({paperDetail.coAuthors.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {paperDetail.coAuthors.map((author) => (
                              <div
                                key={author.userId}
                                className="px-3 py-1 bg-gray-600/50 rounded-full text-sm text-gray-200 flex items-center gap-2"
                              >
                                <span className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-semibold">
                                  {author.fullName?.charAt(0).toUpperCase()}
                                </span>
                                {author.fullName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {paperDetail.description && (
                    <div className="mt-6 bg-gray-700/30 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Mô tả</p>
                      <p className="text-gray-200 leading-relaxed">{paperDetail.description}</p>
                    </div>
                  )}
                </div>
              )}

            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              paperPhases.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-10">
                  <h3 className="text-lg font-semibold mb-4">
                    Các giai đoạn bài báo
                  </h3>

                  <div className="px-6">

                    <PaperStepIndicator
                      steps={steps}
                      currentStep={currentStage}
                      maxReachedStep={maxReachedStage}
                      onStepChange={(stepIndex) => setCurrentStage(stepIndex)}
                      hiddenStepIndexes={hiddenStepIndexes}
                      completedStepIndexes={completedStepIndexes}
                      failedStepIndexes={failedStepIndexes}
                    />
                  </div>

                  <div className="mt-4 text-sm text-gray-400 text-center">
                    Giai đoạn hiện tại:{" "}
                    <span className="text-blue-400 font-semibold">
                      {steps[currentStage]?.label}
                    </span>
                    {paperDetail?.currentPhase && (
                      <span className="text-gray-500 ml-2">
                        (ID: {paperDetail.currentPhase.paperPhaseId})
                      </span>
                    )}
                  </div>
                </div>
              )}

            {/* Paper Phases */}
            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              !paperPhasesError &&
              !paperDetailError &&
              paperPhases.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">

                  {failedStepIndexes.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-6 text-center">
                      <p className="text-red-400 font-semibold">
                        Bài báo của bạn đã bị từ chối ở giai đoạn:{" "}
                        {steps[failedStepIndexes[0]]?.label || "Không xác định"}.
                      </p>
                      <p className="text-red-300 text-sm">
                        Bạn không thể tiếp tục nộp các giai đoạn sau.
                      </p>
                    </div>
                  )}

                  {/* Render phase nếu currentStage <= maxStageAllowed */}
                  {currentStage === 0 && currentStage <= maxStageAllowed && (
                    <AbstractPhase
                      paperId={paperId}
                      abstract={paperDetail?.abstract || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {currentStage === 1 && currentStage <= maxStageAllowed && (
                    <FullPaperPhase
                      paperId={paperId}
                      fullPaper={paperDetail?.fullPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {currentStage === 2 && currentStage <= maxStageAllowed && (
                    <RevisionPhase
                      paperId={paperId}
                      revisionPaper={paperDetail?.revisionPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                      revisionDeadline={paperDetail?.revisionDeadline}
                    />
                  )}
                  {currentStage === 3 && currentStage <= maxStageAllowed && (
                    <CameraReadyPhase
                      paperId={paperId}
                      cameraReady={paperDetail?.cameraReady || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {/* {currentStage === 1 && currentStage <= maxStageAllowed && (
                    <AbstractPhase
                      paperId={paperId}
                      abstract={paperDetail?.abstract || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {currentStage === 2 && currentStage <= maxStageAllowed && (
                    <FullPaperPhase
                      paperId={paperId}
                      fullPaper={paperDetail?.fullPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {currentStage === 3 && currentStage <= maxStageAllowed && (
                    <RevisionPhase
                      paperId={paperId}
                      revisionPaper={paperDetail?.revisionPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                      revisionDeadline={paperDetail?.revisionDeadline}
                    />
                  )}
                  {currentStage === 4 && currentStage <= maxStageAllowed && (
                    <CameraReadyPhase
                      paperId={paperId}
                      cameraReady={paperDetail?.cameraReady || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )} */}
                </div>
              )}

            {/* {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              !paperPhasesError &&
              !paperDetailError &&
              paperPhases.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">
                  {currentStage === 1 && (
                    <AbstractPhase
                      paperId={paperId}
                      abstract={paperDetail?.abstract || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {currentStage === 2 && (
                    <FullPaperPhase
                      paperId={paperId}
                      fullPaper={paperDetail?.fullPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}
                  {currentStage === 3 && (
                    <RevisionPhase
                      paperId={paperId}
                      revisionPaper={paperDetail?.revisionPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                      revisionDeadline={paperDetail?.revisionDeadline}
                    />
                  )}
                  {currentStage === 4 && (
                    <CameraReadyPhase
                      paperId={paperId}
                      cameraReady={paperDetail?.cameraReady || null}
                      researchPhase={paperDetail?.researchPhase}
                    />
                  )}

                  {currentStage > 4 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {stages4Step.find((s) => s.id === currentStage)?.label}
                      </h3>
                      <p className="text-gray-400">
                        Giai đoạn này chưa có component hiển thị cụ thể.
                      </p>
                      {paperDetail?.currentPhase && (
                        <div className="mt-4 text-sm text-gray-500">
                          <p>
                            Phase ID: {paperDetail.currentPhase.paperPhaseId}
                          </p>
                          <p>
                            Phase Name:{" "}
                            {paperDetail.currentPhase.phaseName || "N/A"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )} */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaperTracking;
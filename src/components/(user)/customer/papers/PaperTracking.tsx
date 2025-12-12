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
import { Calendar, Users } from "lucide-react";
import TimelineDialog from "@/components/molecules/TimelineDialog";
import PaymentPhase from "./PaymentPhase";
import { useGlobalTime } from "@/utils/TimeContext";
import AssignCoauthorDialog from "./AssignCoauthorDialog";

const PaperTracking = () => {
  const { now } = useGlobalTime();
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [maxReachedStage, setMaxReachedStage] = useState<number>(1);

  const [paperDetail, setPaperDetail] = useState<PaperDetailResponse | null>(
    null,
  );
  const [isLoadingPaperDetail, setIsLoadingPaperDetail] =
    useState<boolean>(false);
  const [paperDetailError, setPaperDetailError] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const [isAssignCoauthorOpen, setIsAssignCoauthorOpen] = useState(false);

  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const params = useParams();
  const paperId = params?.id as string;


  const canAssignCoauthor = paperDetail?.cameraReady?.status?.toLowerCase() === 'accepted';

  const {
    paperPhases,
    paperPhasesError,
    fetchPaperDetail,
    loading: paperPhasesLoading,

    handleUpdatePaperInfo
  } = usePaperCustomer();

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

  useEffect(() => {


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

    const cameraReadyAccepted = paperDetail.cameraReady?.status?.toLowerCase() === 'accepted';
    const hasTicketId = paperDetail.ticketId !== null && paperDetail.ticketId !== undefined;

    if (hasTicketId) {
      // Đã thanh toán
      completed.push(4);
    } else if (cameraReadyAccepted) {

      const paymentStart = paperDetail.researchPhase?.authorPaymentStart
        ? new Date(paperDetail.researchPhase.authorPaymentStart)
        : null;

      const paymentEnd = paperDetail.researchPhase?.authorPaymentEnd
        ? new Date(paperDetail.researchPhase.authorPaymentEnd)
        : null;

      if (paymentEnd && now > paymentEnd) {
        failed.push(4);
      }
    }
    return { completedStepIndexes: completed, failedStepIndexes: failed };
  }, [paperDetail, now]);

  let maxStageAllowed = 4;
  if (failedStepIndexes.length > 0) {
    maxStageAllowed = failedStepIndexes[0];
  }

  if (paperDetail?.cameraReady?.status?.toLowerCase() !== 'accepted') {
    maxStageAllowed = Math.min(maxStageAllowed, 3);
  }

  useEffect(() => {
    if (!paperDetail) return;

    const cameraReadyAccepted =
      paperDetail.cameraReady?.status?.toLowerCase() === "accepted";

    if (cameraReadyAccepted) {
      setCurrentStage(4);
      setMaxReachedStage(4);
    }
  }, [paperDetail]);

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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Theo dõi bài báo</h2>
              <p className="text-gray-600">
                {paperId
                  ? `Mã bài báo của bạn: ${paperId}`
                  : "Theo dõi tiến độ bài báo của bạn. Nhấn   nút Tiếp tục theo dõi để xem chi tiết hoặc sử dụng thanh tiến độ bên dưới."}
              </p>
              {paperDetail?.currentPhase && (
                <p className="text-blue-600 text-sm mt-1">
                  Giai đoạn hiện tại:{" "}
                  {paperDetail.currentPhase.phaseName ||
                    paperDetail.currentPhase.paperPhaseId}
                </p>
              )}

              {paperDetail?.researchPhase && (
                <button
                  onClick={() => setIsTimelineOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Xem lịch trình đầy đủ
                </button>
              )}
            </div>

            {(paperPhasesLoading || isLoadingPaperDetail) && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 mb-10 shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
                </div>
              </div>
            )}

            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              (paperPhasesError || paperDetailError) && (
                <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-10">
                  <h3 className="text-red-700 font-semibold mb-2">
                    Lỗi tải dữ liệu
                  </h3>
                  {paperPhasesError && (
                    <p className="text-red-600 text-sm mb-2">
                      Phases: {getPaperPhasesErrorMessage()}
                    </p>
                  )}
                  {paperDetailError && (
                    <p className="text-red-600 text-sm">
                      Paper Detail: {paperDetailError}
                    </p>
                  )}
                  <button
                    className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
                    onClick={() => window.location.reload()}
                  >
                    Thử lại
                  </button>
                </div>
              )}

            {!paperId && !paperPhasesLoading && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-10">
                <h3 className="text-yellow-700 font-semibold mb-2">
                  Thiếu thông tin
                </h3>
                <p className="text-yellow-600 text-sm">
                  Không tìm thấy Paper ID trong URL. Vui lòng kiểm tra lại đường
                  dẫn.
                </p>
              </div>
            )}

            {/* Paper Overview */}
            {/* Combined Overview Card */}
            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              !paperPhasesError &&
              !paperDetailError &&
              paperDetail && (
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 my-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Thông tin tổng quan</h2>
                    <div className="flex items-center gap-3">
                      {paperDetail.currentPhase && (
                        <span className="px-2.5 py-1 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-xs font-medium">
                          {paperDetail.currentPhase.phaseName || "Chưa xác định"}
                        </span>
                      )}
                      <button
                        onClick={() => setIsAssignCoauthorOpen(true)}
                        disabled={!canAssignCoauthor}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${canAssignCoauthor
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        title={canAssignCoauthor ? "Thêm đồng tác giả" : "Chỉ có thể thêm đồng tác giả sau khi Camera Ready được chấp nhận"}
                      >
                        <Users className="w-4 h-4" />
                        Thêm đồng tác giả
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: Paper Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                        <span className="text-blue-600">📄</span>
                        <h3 className="text-sm font-semibold text-gray-900">Thông tin bài báo</h3>
                      </div>

                      {paperDetail.title && (
                        <div className="bg-gray-100 rounded-lg p-3 relative">
                          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Tiêu đề</p>
                          <p className="text-gray-900 text-sm font-medium leading-snug">{paperDetail.title}</p>

                          <button
                            className="absolute top-2 right-2 text-xs text-blue-600 hover:underline"
                            onClick={() => {
                              setEditTitle(paperDetail.title || "");
                              setEditDescription(paperDetail.description || "");
                              setIsEditInfoOpen(true);
                            }}
                          >
                            Chỉnh sửa
                          </button>
                        </div>
                      )}


                      {/* {paperDetail.title && (
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Tiêu đề</p>
                          <p className="text-gray-900 text-sm font-medium leading-snug">{paperDetail.title}</p>
                        </div>
                      )} */}

                      <div className="grid grid-cols-2 gap-3">
                        {paperDetail.created && (
                          <div className="bg-gray-100 rounded-lg p-3">
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Ngày tạo</p>
                            <p className="text-gray-900 text-xs">
                              {new Date(paperDetail.created).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}

                        {paperDetail.rootAuthor && (
                          <div className="bg-gray-100 rounded-lg p-3">
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Tác giả chính</p>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                                {paperDetail.rootAuthor.fullName?.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-gray-900 text-xs font-medium truncate">{paperDetail.rootAuthor.fullName}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {paperDetail.coAuthors && paperDetail.coAuthors.length > 0 && (
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-2">
                            Đồng tác giả ({paperDetail.coAuthors.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {paperDetail.coAuthors.map((author) => (
                              <div
                                key={author.userId}
                                className="px-2 py-1 bg-gray-200 rounded-full text-[11px] text-gray-700 flex items-center gap-1.5"
                              >
                                <span className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-[9px] font-semibold text-white">
                                  {author.fullName?.charAt(0).toUpperCase()}
                                </span>
                                {author.fullName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {paperDetail.description && (
                        <div className="bg-blue-50 rounded-lg p-3 border-l-2 border-blue-500">
                          <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Miêu tả</p>
                          <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">{paperDetail.description}</p>
                        </div>
                      )}

                      {/* Publishing Link */}
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">
                          Link xuất bản bài báo của bạn
                        </p>

                        {paperDetail.publishingLink ? (
                          <a
                            href={paperDetail.publishingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm font-medium underline break-all"
                          >
                            {paperDetail.publishingLink}
                          </a>
                        ) : (
                          <p className="text-gray-500 text-xs italic">
                            Hiện chưa có link xuất bản.
                            <br />
                            <span className="text-gray-400">
                              (Link xuất bản bài báo này chỉ có nếu bạn đăng ký loại phí có xuất bản bài báo)
                            </span>
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Right: Conference Information */}
                    {paperDetail.researchConferenceInfo && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                          <span className="text-green-600">🎓</span>
                          <h3 className="text-sm font-semibold text-gray-900">Thông tin hội nghị</h3>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4">
                          {paperDetail.researchConferenceInfo.conferenceName && (
                            // <div className="bg-gray-100 rounded-lg p-3 w-1/4">
                            <div className="w-2/4">
                              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Tên hội nghị</p>
                              <p className="text-gray-900 text-sm font-medium leading-snug">
                                {paperDetail.researchConferenceInfo.conferenceName}
                              </p>
                            </div>
                          )}
                          {paperDetail.researchConferenceInfo.bannerImageFileUrl && (
                            <div className="flex-1">
                              <img
                                src={paperDetail.researchConferenceInfo.bannerImageFileUrl}
                                alt="Banner"
                                className="w-full h-16 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {paperDetail.researchConferenceInfo.startDate && (
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Bắt đầu</p>
                              <p className="text-gray-900 text-xs">
                                {new Date(paperDetail.researchConferenceInfo.startDate).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          )}

                          {paperDetail.researchConferenceInfo.endDate && (
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Kết thúc</p>
                              <p className="text-gray-900 text-xs">
                                {new Date(paperDetail.researchConferenceInfo.endDate).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          )}
                        </div>

                        {paperDetail.researchConferenceInfo.address && (
                          <div className="bg-gray-100 rounded-lg p-3">
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Địa điểm</p>
                            <p className="text-gray-900 text-xs leading-snug">
                              {paperDetail.researchConferenceInfo.address}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          {paperDetail.researchConferenceInfo.totalSlot !== null &&
                            paperDetail.researchConferenceInfo.totalSlot !== undefined && (
                              <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Slot khả dụng</p>
                                <div className="flex items-baseline gap-1">
                                  <p className="text-gray-900 text-lg font-bold">
                                    {paperDetail.researchConferenceInfo.availableSlot}
                                  </p>
                                  <p className="text-gray-600 text-xs">
                                    / {paperDetail.researchConferenceInfo.totalSlot}
                                  </p>
                                </div>
                                <div className="mt-1.5 w-full bg-gray-300 rounded-full h-1.5">
                                  <div
                                    className="bg-green-500 h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${((paperDetail.researchConferenceInfo.availableSlot ?? 0) / paperDetail.researchConferenceInfo.totalSlot) * 100}%`
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                          {paperDetail.researchConferenceInfo.statusName && (
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Trạng thái</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                {paperDetail.researchConferenceInfo.statusName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}


            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              paperPhases.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-10 shadow-sm">
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

                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Giai đoạn hiện tại:{" "}
                    <span className="text-blue-600 font-semibold">
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
                <div className="bg-white rounded-xl p-6 border border-gray-200 mt-8 shadow-sm">

                  {failedStepIndexes.length > 0 && (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 text-center">
                      <p className="text-red-700 font-semibold">
                        Bài báo của bạn đã bị từ chối ở giai đoạn:{" "}
                        {steps[failedStepIndexes[0]]?.label || "Không xác định"}.
                      </p>
                      <p className="text-red-600 text-sm">
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
                      researchConferenceInfo={paperDetail?.researchConferenceInfo}
                      onSubmittedAbstract={loadPaperDetail}
                    />
                  )}
                  {currentStage === 1 && currentStage <= maxStageAllowed && (
                    <FullPaperPhase
                      paperId={paperId}
                      fullPaper={paperDetail?.fullPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                      onSubmittedFullPaper={loadPaperDetail}
                    />
                  )}
                  {currentStage === 2 && currentStage <= maxStageAllowed && (
                    <RevisionPhase
                      paperId={paperId}
                      revisionPaper={paperDetail?.revisionPaper || null}
                      researchPhase={paperDetail?.researchPhase}
                      revisionDeadline={paperDetail?.revisionDeadline}
                      onSubmittedRevision={loadPaperDetail}
                    />
                  )}
                  {currentStage === 3 && currentStage <= maxStageAllowed && (
                    <CameraReadyPhase
                      paperId={paperId}
                      cameraReady={paperDetail?.cameraReady || null}
                      researchPhase={paperDetail?.researchPhase}
                      onSubmittedCameraReady={loadPaperDetail}
                    />
                  )}

                  {currentStage === 4 && currentStage <= maxStageAllowed && (
                    <PaymentPhase
                      paperId={paperId}
                      conferenceId={paperDetail?.researchConferenceInfo?.conferenceId ?? undefined}
                      researchPhase={paperDetail?.researchPhase}
                      onPaymentSuccess={loadPaperDetail}
                    />
                  )}
                </div>
              )}
          </div>
        </main>
      </div>

      {isEditInfoOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Chỉnh sửa bài báo</h3>

            <div className="mb-3">
              <label className="text-xs text-gray-600">Tiêu đề</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-600">Mô tả</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm h-28"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 text-sm bg-gray-200 rounded-lg"
                onClick={() => setIsEditInfoOpen(false)}
              >
                Hủy
              </button>

              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={async () => {
                  try {
                    await handleUpdatePaperInfo(paperId, {
                      title: editTitle,
                      description: editDescription,
                    });

                    setIsEditInfoOpen(false);
                    loadPaperDetail(); // reload lại dữ liệu
                  } catch (err) {
                    alert("Cập nhật thất bại");
                  }
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <TimelineDialog
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        phaseData={paperDetail?.researchPhase}
        revisionDeadlines={paperDetail?.revisionDeadline}
        variant="submitted"
        theme="light"
      />

      <AssignCoauthorDialog
        isOpen={isAssignCoauthorOpen}
        onClose={() => setIsAssignCoauthorOpen(false)}
        paperId={paperId}
        conferenceId={paperDetail?.researchConferenceInfo?.conferenceId}
        currentCoauthors={paperDetail?.coAuthors || []}
        onSuccess={loadPaperDetail}
      />
    </div>
  );
};

export default PaperTracking;

// "use client";
// import React, { useState, useEffect } from "react";
// import { useParams } from "next/navigation";

// import Slider from "rc-slider";
// import "rc-slider/assets/index.css";
// import AbstractPhase from "./AbstractPhase";
// import FullPaperPhase from "./FullPaperPhase";
// import RevisionPhase from "./RevisionPhase";
// import CameraReadyPhase from "./CameraReadyPhase";
// import { usePaperCustomer } from "@/redux/hooks/usePaper";
// import type { PaperPhase, PaperDetailResponse } from "@/types/paper.type";
// import { steps } from "@/helper/paper";
// import PaperStepIndicator from "@/components/molecules/PaperStepIndicator";
// import { Calendar } from "lucide-react";
// import TimelineDialog from "@/components/molecules/TimelineDialog";

// const PaperTracking = () => {
//   const [currentStage, setCurrentStage] = useState<number>(1);
//   const [maxReachedStage, setMaxReachedStage] = useState<number>(1);

//   const [paperDetail, setPaperDetail] = useState<PaperDetailResponse | null>(
//     null,
//   );
//   const [isLoadingPaperDetail, setIsLoadingPaperDetail] =
//     useState<boolean>(false);
//   const [paperDetailError, setPaperDetailError] = useState<string | null>(null);
//   const [isTimelineOpen, setIsTimelineOpen] = useState(false);

//   const params = useParams();
//   const paperId = params?.id as string;

//   const {
//     paperPhases,
//     paperPhasesError,
//     fetchPaperDetail,
//     loading: paperPhasesLoading,
//   } = usePaperCustomer();

//   const loadPaperDetail = async () => {
//     if (!paperId) return;

//     setIsLoadingPaperDetail(true);
//     setPaperDetailError(null);

//     try {
//       const response = await fetchPaperDetail(paperId);
//       setPaperDetail(response.data);
//     } catch (error: unknown) {
//       setPaperDetailError("Có lỗi xảy ra khi tải chi tiết bài báo");
//     } finally {
//       setIsLoadingPaperDetail(false);
//     }
//   };

//   useEffect(() => {


//     loadPaperDetail();
//   }, [paperId, fetchPaperDetail]);

//   useEffect(() => {
//     if (paperPhases.length > 0 && paperDetail?.currentPhase) {
//       const currentPhaseIndex = steps.findIndex(
//         (obj) =>
//           obj.label.toLowerCase() ===
//           paperDetail.currentPhase!.phaseName?.toLowerCase(),
//       );

//       if (currentPhaseIndex !== -1) {
//         setCurrentStage(currentPhaseIndex);
//         setMaxReachedStage(currentPhaseIndex);
//       }
//     }
//   }, [paperPhases, paperDetail]);

//   const hiddenStepIndexes = React.useMemo(() => {
//     const hidden: number[] = [];

//     if (paperDetail?.fullPaper?.reviewStatus?.toLowerCase() === 'accepted') {
//       hidden.push(2);
//     }

//     return hidden;
//   }, [paperDetail?.fullPaper?.reviewStatus]);

//   const { completedStepIndexes, failedStepIndexes } = React.useMemo(() => {
//     const completed: number[] = [];
//     const failed: number[] = [];

//     if (!paperDetail) return { completedStepIndexes: completed, failedStepIndexes: failed };

//     if (paperDetail.abstract?.status?.toLowerCase() === 'accepted') {
//       completed.push(0);
//     } else if (paperDetail.abstract?.status?.toLowerCase() === 'rejected') {
//       failed.push(0);
//     }

//     const fullPaperStatus = paperDetail.fullPaper?.reviewStatus?.toLowerCase();

//     if (fullPaperStatus === "accepted" || fullPaperStatus === "revise") {
//       completed.push(1);
//     } else if (fullPaperStatus === 'rejected') {
//       failed.push(1);
//     }

//     if (paperDetail.revisionPaper?.overallStatus?.toLowerCase() === 'accepted') {
//       completed.push(2);
//     } else if (paperDetail.revisionPaper?.overallStatus?.toLowerCase() === 'rejected') {
//       failed.push(2);
//     }

//     if (paperDetail.cameraReady?.status?.toLowerCase() === 'accepted') {
//       completed.push(3);
//     } else if (paperDetail.cameraReady?.status?.toLowerCase() === 'rejected') {
//       failed.push(3);
//     }

//     return { completedStepIndexes: completed, failedStepIndexes: failed };
//   }, [paperDetail]);

//   const maxStageAllowed = failedStepIndexes.length > 0 ? failedStepIndexes[0] + 1 : 4;

//   // Get error message for paper phases
//   const getPaperPhasesErrorMessage = (): string => {
//     if (!paperPhasesError) return "";

//     if (paperPhasesError.data?.message) {
//       return paperPhasesError.data.message;
//     }

//     if (paperPhasesError.data?.errors) {
//       const errors = Object.values(paperPhasesError.data.errors);
//       return errors.length > 0
//         ? errors[0]
//         : "Có lỗi xảy ra khi tải danh sách phases";
//     }

//     return "Có lỗi xảy ra khi tải danh sách phases";
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="flex">
//         <main className="flex-1 p-6">
//           <div className="max-w-7xl mx-auto">
//             <div className="mb-8">
//               <h2 className="text-2xl font-bold mb-2">Theo dõi bài báo</h2>
//               <p className="text-gray-400">
//                 {paperId
//                   ? `Mã bài báo của bạn: ${paperId}`
//                   : "Theo dõi tiến độ bài báo của bạn. Nhấn   nút Tiếp tục theo dõi để xem chi tiết hoặc sử dụng thanh tiến độ bên dưới."}
//               </p>
//               {paperDetail?.currentPhase && (
//                 <p className="text-blue-400 text-sm mt-1">
//                   Giai đoạn hiện tại:{" "}
//                   {paperDetail.currentPhase.phaseName ||
//                     paperDetail.currentPhase.paperPhaseId}
//                 </p>
//               )}

//               {paperDetail?.researchPhase && (
//                 <button
//                   onClick={() => setIsTimelineOpen(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
//                 >
//                   <Calendar className="w-4 h-4" />
//                   Xem lịch trình đầy đủ
//                 </button>
//               )}
//             </div>

//             {(paperPhasesLoading || isLoadingPaperDetail) && (
//               <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-10">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//                   <p className="text-gray-400 mt-2">Đang tải dữ liệu...</p>
//                 </div>
//               </div>
//             )}

//             {!paperPhasesLoading &&
//               !isLoadingPaperDetail &&
//               (paperPhasesError || paperDetailError) && (
//                 <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mb-10">
//                   <h3 className="text-red-400 font-semibold mb-2">
//                     Lỗi tải dữ liệu
//                   </h3>
//                   {paperPhasesError && (
//                     <p className="text-red-300 text-sm mb-2">
//                       Phases: {getPaperPhasesErrorMessage()}
//                     </p>
//                   )}
//                   {paperDetailError && (
//                     <p className="text-red-300 text-sm">
//                       Paper Detail: {paperDetailError}
//                     </p>
//                   )}
//                   <button
//                     className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                     onClick={() => window.location.reload()}
//                   >
//                     Thử lại
//                   </button>
//                 </div>
//               )}

//             {!paperId && !paperPhasesLoading && (
//               <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6 mb-10">
//                 <h3 className="text-yellow-400 font-semibold mb-2">
//                   Thiếu thông tin
//                 </h3>
//                 <p className="text-yellow-300 text-sm">
//                   Không tìm thấy Paper ID trong URL. Vui lòng kiểm tra lại đường
//                   dẫn.
//                 </p>
//               </div>
//             )}

//             {/* Paper Overview */}
//             {!paperPhasesLoading &&
//               !isLoadingPaperDetail &&
//               !paperPhasesError &&
//               !paperDetailError &&
//               paperDetail && (
//                 <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 my-6 shadow-lg">
//                   <div className="flex items-center justify-between mb-4">
//                     <h2 className="text-lg font-bold text-white">Thông tin tổng quan</h2>
//                     {paperDetail.currentPhase && (
//                       <span className="px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
//                         {paperDetail.currentPhase.phaseName || "Chưa xác định"}
//                       </span>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                     {/* Left: Paper Information */}
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
//                         <span className="text-blue-400">📄</span>
//                         <h3 className="text-sm font-semibold text-white">Thông tin bài báo</h3>
//                       </div>

//                       {paperDetail.title && (
//                         <div className="bg-gray-700/30 rounded-lg p-3">
//                           <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Tiêu đề</p>
//                           <p className="text-white text-sm font-medium leading-snug">{paperDetail.title}</p>
//                         </div>
//                       )}

//                       <div className="grid grid-cols-2 gap-3">
//                         {paperDetail.created && (
//                           <div className="bg-gray-700/30 rounded-lg p-3">
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Ngày tạo</p>
//                             <p className="text-white text-xs">
//                               {new Date(paperDetail.created).toLocaleDateString("vi-VN")}
//                             </p>
//                           </div>
//                         )}

//                         {paperDetail.rootAuthor && (
//                           <div className="bg-gray-700/30 rounded-lg p-3">
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Tác giả chính</p>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
//                                 {paperDetail.rootAuthor.fullName?.charAt(0).toUpperCase()}
//                               </div>
//                               <p className="text-white text-xs font-medium truncate">{paperDetail.rootAuthor.fullName}</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {paperDetail.coAuthors && paperDetail.coAuthors.length > 0 && (
//                         <div className="bg-gray-700/30 rounded-lg p-3">
//                           <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2">
//                             Đồng tác giả ({paperDetail.coAuthors.length})
//                           </p>
//                           <div className="flex flex-wrap gap-1.5">
//                             {paperDetail.coAuthors.map((author) => (
//                               <div
//                                 key={author.userId}
//                                 className="px-2 py-1 bg-gray-600/50 rounded-full text-[11px] text-gray-200 flex items-center gap-1.5"
//                               >
//                                 <span className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-[9px] font-semibold">
//                                   {author.fullName?.charAt(0).toUpperCase()}
//                                 </span>
//                                 {author.fullName}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {paperDetail.description && (
//                         <div className="bg-gray-700/20 rounded-lg p-3 border-l-2 border-blue-500">
//                           <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Mô tả</p>
//                           <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">{paperDetail.description}</p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Right: Conference Information */}
//                     {paperDetail.researchConferenceInfo && (
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
//                           <span className="text-green-400">🎓</span>
//                           <h3 className="text-sm font-semibold text-white">Thông tin hội nghị</h3>
//                         </div>

//                         <div className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-4">
//                           {paperDetail.researchConferenceInfo.conferenceName && (
//                             // <div className="bg-gray-700/30 rounded-lg p-3 w-1/4">
//                             <div className="w-2/4">
//                               <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Tên hội nghị</p>
//                               <p className="text-white text-sm font-medium leading-snug">
//                                 {paperDetail.researchConferenceInfo.conferenceName}
//                               </p>
//                             </div>
//                           )}
//                           {paperDetail.researchConferenceInfo.bannerImageFileUrl && (
//                             <div className="flex-1">
//                               <img
//                                 src={paperDetail.researchConferenceInfo.bannerImageFileUrl}
//                                 alt="Banner"
//                                 className="w-full h-16 object-cover rounded-lg"
//                               />
//                             </div>
//                           )}
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                           {paperDetail.researchConferenceInfo.startDate && (
//                             <div className="bg-gray-700/30 rounded-lg p-3">
//                               <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Bắt đầu</p>
//                               <p className="text-white text-xs">
//                                 {new Date(paperDetail.researchConferenceInfo.startDate).toLocaleDateString("vi-VN")}
//                               </p>
//                             </div>
//                           )}

//                           {paperDetail.researchConferenceInfo.endDate && (
//                             <div className="bg-gray-700/30 rounded-lg p-3">
//                               <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Kết thúc</p>
//                               <p className="text-white text-xs">
//                                 {new Date(paperDetail.researchConferenceInfo.endDate).toLocaleDateString("vi-VN")}
//                               </p>
//                             </div>
//                           )}
//                         </div>

//                         {paperDetail.researchConferenceInfo.address && (
//                           <div className="bg-gray-700/30 rounded-lg p-3">
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Địa điểm</p>
//                             <p className="text-white text-xs leading-snug">
//                               {paperDetail.researchConferenceInfo.address}
//                             </p>
//                           </div>
//                         )}

//                         <div className="grid grid-cols-2 gap-3">
//                           {paperDetail.researchConferenceInfo.totalSlot !== null &&
//                             paperDetail.researchConferenceInfo.totalSlot !== undefined && (
//                               <div className="bg-gray-700/30 rounded-lg p-3">
//                                 <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Slot khả dụng</p>
//                                 <div className="flex items-baseline gap-1">
//                                   <p className="text-white text-lg font-bold">
//                                     {paperDetail.researchConferenceInfo.availableSlot}
//                                   </p>
//                                   <p className="text-gray-400 text-xs">
//                                     / {paperDetail.researchConferenceInfo.totalSlot}
//                                   </p>
//                                 </div>
//                                 <div className="mt-1.5 w-full bg-gray-600 rounded-full h-1.5">
//                                   <div
//                                     className="bg-green-500 h-1.5 rounded-full transition-all"
//                                     style={{
//                                       width: `${((paperDetail.researchConferenceInfo.availableSlot ?? 0) / paperDetail.researchConferenceInfo.totalSlot) * 100}%`
//                                     }}
//                                   />
//                                 </div>
//                               </div>
//                             )}

//                           {paperDetail.researchConferenceInfo.statusName && (
//                             <div className="bg-gray-700/30 rounded-lg p-3">
//                               <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Trạng thái</p>
//                               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
//                                 {paperDetail.researchConferenceInfo.statusName}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}


//             {!paperPhasesLoading &&
//               !isLoadingPaperDetail &&
//               paperPhases.length > 0 && (
//                 <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-10">
//                   <h3 className="text-lg font-semibold mb-4">
//                     Các giai đoạn bài báo
//                   </h3>

//                   <div className="px-6">

//                     <PaperStepIndicator
//                       steps={steps}
//                       currentStep={currentStage}
//                       maxReachedStep={maxReachedStage}
//                       onStepChange={(stepIndex) => setCurrentStage(stepIndex)}
//                       hiddenStepIndexes={hiddenStepIndexes}
//                       completedStepIndexes={completedStepIndexes}
//                       failedStepIndexes={failedStepIndexes}
//                     />
//                   </div>

//                   <div className="mt-4 text-sm text-gray-400 text-center">
//                     Giai đoạn hiện tại:{" "}
//                     <span className="text-blue-400 font-semibold">
//                       {steps[currentStage]?.label}
//                     </span>
//                     {paperDetail?.currentPhase && (
//                       <span className="text-gray-500 ml-2">
//                         (ID: {paperDetail.currentPhase.paperPhaseId})
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}

//             {/* Paper Phases */}
//             {!paperPhasesLoading &&
//               !isLoadingPaperDetail &&
//               !paperPhasesError &&
//               !paperDetailError &&
//               paperPhases.length > 0 && (
//                 <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">

//                   {failedStepIndexes.length > 0 && (
//                     <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-6 text-center">
//                       <p className="text-red-400 font-semibold">
//                         Bài báo của bạn đã bị từ chối ở giai đoạn:{" "}
//                         {steps[failedStepIndexes[0]]?.label || "Không xác định"}.
//                       </p>
//                       <p className="text-red-300 text-sm">
//                         Bạn không thể tiếp tục nộp các giai đoạn sau.
//                       </p>
//                     </div>
//                   )}

//                   {/* Render phase nếu currentStage <= maxStageAllowed */}
//                   {currentStage === 0 && currentStage <= maxStageAllowed && (
//                     <AbstractPhase
//                       paperId={paperId}
//                       abstract={paperDetail?.abstract || null}
//                       researchPhase={paperDetail?.researchPhase}
//                       researchConferenceInfo={paperDetail?.researchConferenceInfo}
//                       onSubmittedAbstract={loadPaperDetail}
//                     />
//                   )}
//                   {currentStage === 1 && currentStage <= maxStageAllowed && (
//                     <FullPaperPhase
//                       paperId={paperId}
//                       fullPaper={paperDetail?.fullPaper || null}
//                       researchPhase={paperDetail?.researchPhase}
//                       onSubmittedFullPaper={loadPaperDetail}
//                     />
//                   )}
//                   {currentStage === 2 && currentStage <= maxStageAllowed && (
//                     <RevisionPhase
//                       paperId={paperId}
//                       revisionPaper={paperDetail?.revisionPaper || null}
//                       researchPhase={paperDetail?.researchPhase}
//                       revisionDeadline={paperDetail?.revisionDeadline}
//                       onSubmittedRevision={loadPaperDetail}
//                     />
//                   )}
//                   {currentStage === 3 && currentStage <= maxStageAllowed && (
//                     <CameraReadyPhase
//                       paperId={paperId}
//                       cameraReady={paperDetail?.cameraReady || null}
//                       researchPhase={paperDetail?.researchPhase}
//                       onSubmittedCameraReady={loadPaperDetail}
//                     />
//                   )}
//                 </div>
//               )}
//           </div>
//         </main>
//       </div>

//       <TimelineDialog
//         isOpen={isTimelineOpen}
//         onClose={() => setIsTimelineOpen(false)}
//         phaseData={paperDetail?.researchPhase}
//         revisionDeadlines={paperDetail?.revisionDeadline}
//         variant="submitted"
//         theme="dark"
//       />
//     </div>
//   );
// };

// export default PaperTracking;
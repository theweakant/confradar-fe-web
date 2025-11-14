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
import { stages4Step } from "@/helper/paper";

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

      const currentPhaseIndex = stages4Step.findIndex(
        (obj) =>
          obj.label.toLowerCase() ===
          paperDetail.currentPhase!.phaseName?.toLowerCase(),
      );

      if (currentPhaseIndex !== -1) {
        setCurrentStage(currentPhaseIndex + 1);
        setMaxReachedStage(currentPhaseIndex + 1);
      }
    }
  }, [paperPhases, paperDetail]);

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
      {/* <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Theo dõi bài báo</h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý tiến độ và trạng thái bài báo của bạn</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Tiếp tục theo dõi →
          </button>
        </div>
      </header> */}

      <div className="flex">
        {/* Sidebar */}
        {/* <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <a href="#" className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg">
                <span className="mr-3">📊</span>
                Dashboard
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">📝</span>
                Bài báo của tôi
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">👥</span>
                Reviewers
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">📅</span>
                Lịch trình
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">💬</span>
                Phản hồi
              </a>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Báo cáo</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                  <span className="mr-3">📈</span>
                  Tiến độ submission
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                  <span className="mr-3">📋</span>
                  Kế hoạch hành động
                </a>
              </div>
            </div>
          </nav>
        </aside> */}

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

            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              paperPhases.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-10">
                  <h3 className="text-lg font-semibold mb-4">
                    Các giai đoạn bài báo
                  </h3>

                  <div className="px-6">
                    <Slider
                      min={1}
                      max={stages4Step.length}
                      step={1}
                      marks={stages4Step.reduce(
                        (acc, stage) => {
                          acc[stage.id] = (
                            <span className="text-xs text-gray-300">
                              {stage.label}
                            </span>
                          );
                          return acc;
                        },
                        {} as Record<number, React.ReactNode>,
                      )}
                      value={currentStage}
                      onBeforeChange={(value) => {
                        if (typeof value !== "number") return;

                        if (value > maxReachedStage) {
                          alert("Bạn không thể bỏ qua giai đoạn hiện tại.");
                          return;
                        }

                        setCurrentStage(value);
                      }}
                      // onChange={(value) => {
                      //   if (typeof value === 'number') {
                      //     // 🔹 Chỉ cho phép chọn giai đoạn hiện tại hoặc trước đó
                      //     if (value <= currentStage) {
                      //       setCurrentStage(value);
                      //     }
                      //   }
                      // }}
                      // onChange={(value) => {
                      //   if (typeof value === 'number') setCurrentStage(value);
                      // }}
                      trackStyle={[{ backgroundColor: "#2563eb", height: 8 }]}
                      handleStyle={{
                        borderColor: "#3b82f6",
                        height: 20,
                        width: 20,
                        marginTop: -9,
                        backgroundColor: "#60a5fa",
                      }}
                      railStyle={{ backgroundColor: "#374151", height: 8 }}
                    />
                  </div>

                  <div className="mt-4 text-sm text-gray-400 text-center">
                    Giai đoạn hiện tại:{" "}
                    <span className="text-blue-400 font-semibold">
                      {stages4Step.find((s) => s.id === currentStage)?.label}
                    </span>
                    {paperDetail?.currentPhase && (
                      <span className="text-gray-500 ml-2">
                        (ID: {paperDetail.currentPhase.paperPhaseId})
                      </span>
                    )}
                  </div>
                </div>
              )}

            {/* Paper Overview */}
            {!paperPhasesLoading &&
              !isLoadingPaperDetail &&
              !paperPhasesError &&
              !paperDetailError &&
              paperDetail && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mt-8">
                  <h2 className="text-xl font-bold mb-4 text-white">
                    Thông tin tổng quan bài báo
                  </h2>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      <span className="font-medium text-white">Paper ID:</span>{" "}
                      {paperDetail.paperId}
                    </p>
                    {paperDetail.title && (
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Tiêu đề:</span>{" "}
                        {paperDetail.title}
                      </p>
                    )}
                    {paperDetail.description && (
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Mô tả:</span>{" "}
                        {paperDetail.description}
                      </p>
                    )}
                    {paperDetail.currentPhase && (
                      <p className="text-gray-300">
                        <span className="font-medium text-white">
                          Giai đoạn hiện tại:
                        </span>{" "}
                        {paperDetail.currentPhase.phaseName || "Chưa xác định"}
                      </p>
                    )}
                    {paperDetail.rootAuthor && (
                      <p className="text-gray-300">
                        <span className="font-medium text-white">
                          Tác giả chính:
                        </span>{" "}
                        {paperDetail.rootAuthor.fullName}
                      </p>
                    )}
                    {paperDetail.coAuthors &&
                      paperDetail.coAuthors.length > 0 && (
                        <div className="text-gray-300">
                          <span className="font-medium text-white">
                            Đồng tác giả:
                          </span>
                          <ul className="ml-4 mt-1">
                            {paperDetail.coAuthors.map((author, index) => (
                              <li key={author.userId} className="text-sm">
                                • {author.fullName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {paperDetail.created && (
                      <p className="text-gray-300">
                        <span className="font-medium text-white">
                          Ngày tạo:
                        </span>{" "}
                        {new Date(paperDetail.created).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {!paperPhasesLoading &&
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
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaperTracking;
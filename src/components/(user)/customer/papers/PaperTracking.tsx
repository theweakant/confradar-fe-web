"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import AbstractPhase from "./AbstractPhase";
import FullPaperPhase from "./FullPaperPhase";
import RevisionPhase from "./RevisionPhase";
import CameraReadyPhase from "./CameraReadyPhase";
import { usePaperCustomer } from "@/redux/hooks/paper/usePaper";
import type { PaperPhase, PaperDetailResponse } from "@/types/paper.type";

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

      const currentPhaseIndex = stages.findIndex(
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

  const stages = [
    { id: 1, label: "Abstract" },
    { id: 2, label: "FullPaper" },
    { id: 3, label: "Revise" },
    { id: 4, label: "CameraReady" },
  ];

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
                      max={stages.length}
                      step={1}
                      marks={stages.reduce(
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
                      {stages.find((s) => s.id === currentStage)?.label}
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
                    />
                  )}
                  {currentStage === 2 && (
                    <FullPaperPhase
                      paperId={paperId}
                      fullPaper={paperDetail?.fullPaper || null}
                    />
                  )}
                  {currentStage === 3 && (
                    <RevisionPhase
                      paperId={paperId}
                      revisionPaper={paperDetail?.revisionPaper || null}
                    />
                  )}
                  {currentStage === 4 && (
                    <CameraReadyPhase
                      paperId={paperId}
                      cameraReady={paperDetail?.cameraReady || null}
                    />
                  )}

                  {currentStage > 4 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {stages.find((s) => s.id === currentStage)?.label}
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

//version chụp cho report 3
// 'use client';

// import React from 'react';

// interface PaperStep {
//   id: number;
//   step: string;
//   completed: boolean;
//   date: string;
// }

// interface PaperDetails {
//   title: string;
//   conference: string;
//   submittedDate: string;
//   reviewDeadline: string;
//   status: string;
// }

// interface ActionItem {
//   name: string;
//   progress: string;
//   status: 'completed' | 'in-progress' | 'pending';
// }

// const PaperTrackingScreen: React.FC = () => {
//   const paperStatus: PaperStep[] = [
//     { id: 1, step: 'Nộp bài báo', completed: true, date: '15/01/2025' },
//     { id: 2, step: 'Xác nhận tiếp nhận', completed: true, date: '17/01/2025' },
//     { id: 3, step: 'Phân công reviewer', completed: true, date: '20/01/2025' },
//     { id: 4, step: 'Đánh giá bài báo', completed: false, date: 'Đang tiến hành' },
//     { id: 5, step: 'Kết quả review', completed: false, date: 'Chờ xử lý' },
//     { id: 6, step: 'Camera-ready', completed: false, date: 'Chờ xử lý' },
//   ];

//   const paperDetails: PaperDetails = {
//     title: 'Nghiên cứu về Machine Learning trong xử lý ngôn ngữ tự nhiên',
//     conference: 'Hội thảo Khoa học Máy tính Việt Nam 2025',
//     submittedDate: '15/01/2025',
//     reviewDeadline: '28/02/2025',
//     status: 'Đang được đánh giá'
//   };

//   const actions: ActionItem[] = [
//     { name: 'Xem chi tiết bài báo', progress: '100%', status: 'completed' },
//     { name: 'Theo dõi phản hồi reviewer', progress: '60%', status: 'in-progress' },
//     { name: 'Cập nhật thông tin tác giả', progress: '100%', status: 'completed' },
//     { name: 'Chuẩn bị bản camera-ready', progress: '0%', status: 'pending' },
//     { name: 'Đăng ký trình bày', progress: '0%', status: 'pending' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold">Theo dõi bài báo</h1>
//             <p className="text-gray-600 text-sm mt-1">Quản lý tiến độ và trạng thái bài báo của bạn</p>
//           </div>
//           <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors">
//             Tiếp tục theo dõi →
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Chào buổi sáng, Nguyễn Văn A!</h2>
//           <p className="text-gray-600">
//             Theo dõi tiến độ bài báo của bạn. Sử dụng thanh tiến độ bên dưới để nắm rõ các đợt review.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Progress Section */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//               <div className="flex items-center mb-6">
//                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
//                   3/6
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold">Tiến độ bài báo</h3>
//                   <p className="text-gray-500">Giai đoạn trước và sau chuyển đổi</p>
//                 </div>
//               </div>

//               {/* Paper Details */}
//               <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
//                 <h4 className="font-semibold mb-2">{paperDetails.title}</h4>
//                 <p className="text-sm text-gray-500 mb-1">Hội thảo: {paperDetails.conference}</p>
//                 <p className="text-sm text-gray-500">Deadline review: {paperDetails.reviewDeadline}</p>
//                 <div className="mt-3">
//                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                     {paperDetails.status}
//                   </span>
//                 </div>
//               </div>

//               {/* Progress Steps */}
//               <div className="space-y-4">
//                 {paperStatus.map((step, index) => (
//                   <div key={step.id} className="flex items-center">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step.completed
//                         ? 'bg-blue-600 text-white'
//                         : index === 3
//                           ? 'bg-yellow-500 text-white'
//                           : 'bg-gray-300 text-gray-600'
//                       }`}>
//                       {step.completed ? '✓' : index + 1}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex justify-between items-center">
//                         <span className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
//                           {step.step}
//                         </span>
//                         <span className="text-sm text-gray-500">{step.date}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Progress Bar */}
//               <div className="mt-6">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
//                 </div>
//               </div>
//             </div>

//             {/* Recommended Support */}
//             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//               <h3 className="text-lg font-bold mb-4">Hỗ trợ được đề xuất</h3>
//               <div className="space-y-4">
//                 {[
//                   { title: 'Hướng dẫn định dạng bài báo', type: 'Tài liệu' },
//                   { title: 'Template bài báo khoa học', type: 'Mẫu' },
//                   { title: 'Hỗ trợ kỹ thuật', type: 'Liên hệ' },
//                 ].map((item, idx) => (
//                   <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
//                     <div>
//                       <h4 className="font-medium">{item.title}</h4>
//                       <p className="text-sm text-gray-500">{item.type}</p>
//                     </div>
//                     <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">Xem</button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Actions Panel */}
//           <div className="lg:col-span-1 space-y-6">
//             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//               <h3 className="text-lg font-bold mb-4">Hành động</h3>
//               <p className="text-sm text-gray-500 mb-6">Danh sách các hành động cần thực hiện</p>

//               <div className="space-y-4">
//                 {actions.map((action, index) => (
//                   <div key={index} className="space-y-1">
//                     <div className="flex items-center justify-between">
//                       <div className={`w-3 h-3 rounded-full mr-3 ${action.status === 'completed'
//                           ? 'bg-green-500'
//                           : action.status === 'in-progress'
//                             ? 'bg-yellow-500'
//                             : 'bg-gray-300'
//                         }`}></div>
//                       <span className="text-sm flex-1">{action.name}</span>
//                     </div>
//                     <div className="ml-6">
//                       <div className="flex justify-between text-xs text-gray-500 mb-1">
//                         <span>{action.status === 'completed' ? 'Hoàn thành' : action.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ thực hiện'}</span>
//                         <span>{action.progress}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-1">
//                         <div
//                           className={`h-1 rounded-full ${action.status === 'completed' ? 'bg-green-500' : action.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
//                             }`}
//                           style={{ width: action.progress }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
//                 Bỏ qua
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default PaperTrackingScreen;

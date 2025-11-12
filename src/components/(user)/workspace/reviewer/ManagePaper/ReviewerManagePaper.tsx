"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaperTable } from "@/components/(user)/workspace/reviewer/ManagePaper/PaperTable";

import { AssignedPaper, Paper } from "@/types/paper.type";
import { useListAssignedPapersQuery } from "@/redux/services/paper.service";

import CameraReadyList from "@/components/(user)/workspace/reviewer/CameraReadyList/index";
import { useConference } from "@/redux/hooks/conference/useConference";
import { ConferenceResponse } from "@/types/conference.type";
import { ConferenceHasAssignedPaperTable } from "./ConferenceHasAssignedPaperTable";

export default function ReviewerManagePaperPage() {
  const router = useRouter();

  const [selectedConference, setSelectedConference] = useState<ConferenceResponse | null>(null);
  const [showCameraReady, setShowCameraReady] = useState(false);

  const {
    lazyAssignedConferences,
    fetchAssignedConferences,
    assignedConferencesLoading,
    assignedConferencesError,
  } = useConference();

  const {
    data: assignedPapersData,
    isLoading: loadingPapers,
    error: papersError,
  } = useListAssignedPapersQuery(
    { confId: selectedConference?.conferenceId ?? "" },
    { skip: !selectedConference }
  );

  const assignedPapers = assignedPapersData?.data[0].assignedPapers || [];

  useEffect(() => {
    fetchAssignedConferences();
  }, [fetchAssignedConferences]);

  const handleViewConference = (conference: ConferenceResponse) => {
    setSelectedConference(conference);
  };

  const handleBackToConferences = () => {
    setSelectedConference(null);
  };

  const handleViewPaper = (paper: AssignedPaper) => {
    router.push(`/workspace/reviewer/manage-paper/${paper.paperId}`);
  };

  // Loading UI
  if (assignedConferencesLoading || loadingPapers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (assignedConferencesError || papersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  // Conference List View
  if (!selectedConference) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Bài báo - Reviewer
              </h1>
              <p className="text-gray-600 mt-2">
                Chọn hội nghị để xem các bài báo được giao
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tổng số hội nghị:</span>{" "}
              {lazyAssignedConferences?.length || 0}
            </p>
          </div>

          {/* Conference List */}
          {lazyAssignedConferences && lazyAssignedConferences.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ConferenceHasAssignedPaperTable
                conferences={lazyAssignedConferences}
                onView={handleViewConference}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Bạn chưa được phân công bài báo nào trong hội nghị nào.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Papers List View (when conference is selected)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={handleBackToConferences}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách hội nghị
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedConference.conferenceName}
            </h1>
            <p className="text-gray-600 mt-2">
              Danh sách các bài báo được giao cho bạn trong hội nghị này
            </p>
          </div>
        </div>

        {/* Conference Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Conference ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
                {selectedConference.conferenceId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày diễn ra</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {selectedConference.startDate &&
                  new Date(selectedConference.startDate).toLocaleDateString("vi-VN")}{" "}
                -{" "}
                {selectedConference.endDate &&
                  new Date(selectedConference.endDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số bài báo được giao</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {assignedPapers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Papers Statistics */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tổng số bài báo được giao:</span>{" "}
            {assignedPapers.length}
          </p>
        </div>

        {/* Papers List */}
        {assignedPapers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <PaperTable papers={assignedPapers} onView={handleViewPaper} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không có bài báo nào được giao trong hội nghị này.
            </p>
          </div>
        )}

        {/* Dialog Camera Ready */}
        <Dialog open={showCameraReady} onOpenChange={setShowCameraReady}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Duyệt Camera Ready</DialogTitle>
            </DialogHeader>
            <CameraReadyList />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gray-50 p-6">
  //     <div className="max-w-7xl mx-auto space-y-8">
  //       {/* Header */}
  //       <div className="flex items-center justify-between">
  //         <div>
  //           <h1 className="text-3xl font-bold text-gray-900">
  //             Quản lý Bài báo - Reviewer
  //           </h1>
  //           <p className="text-gray-600 mt-2">
  //             Danh sách các bài báo được giao cho bạn
  //           </p>
  //         </div>
  //       </div>

  //       {/* Thống kê số lượng bài báo */}
  //       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  //         <p className="text-sm text-blue-800">
  //           <span className="font-semibold">Tổng số bài báo được giao:</span>{" "}
  //           {assignedPapers.length}
  //         </p>
  //       </div>

  //       {/* Danh sách bài báo */}
  //       {assignedPapers.length > 0 ? (
  //         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
  //           <PaperTable papers={assignedPapers} onView={handleViewPaper} />
  //         </div>
  //       ) : (
  //         <div className="text-center py-12">
  //           <p className="text-gray-500 text-lg">
  //             Bạn chưa được giao bài báo nào.
  //           </p>
  //         </div>
  //       )}

  //       {/* Dialog Camera Ready */}
  //       <Dialog open={showCameraReady} onOpenChange={setShowCameraReady}>
  //         <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
  //           <DialogHeader>
  //             <DialogTitle>Duyệt Camera Ready</DialogTitle>
  //           </DialogHeader>
  //           <CameraReadyList />
  //         </DialogContent>
  //       </Dialog>
  //     </div>
  //   </div>
  // );
}

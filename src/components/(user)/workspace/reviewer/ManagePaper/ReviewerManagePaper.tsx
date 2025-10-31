"use client";

import { useState } from "react";
import { AlertCircle, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaperTable } from "@/components/(user)/workspace/reviewer/ManagePaper/PaperTable";

import { Paper } from "@/types/paper.type";
import { useListAssignedPapersQuery } from "@/redux/services/paper.service";

import CameraReadyList from "@/components/(user)/workspace/organizer/ManagePaper/CameraReadyList";

export default function ReviewerManagePaperPage() {
  const router = useRouter();

  const { data: assignedPapersData, isLoading: loadingPapers, error: papersError } = 
    useListAssignedPapersQuery();

  const assignedPapers = assignedPapersData?.data || [];

  const [showCameraReady, setShowCameraReady] = useState(false);
  
  const handleViewPaper = (paper: Paper) => {
    router.push(`/workspace/reviewer/manage-paper/${paper.paperId}`);
  };

  // Loading UI
  if (loadingPapers) {
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
  if (papersError) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài báo - Reviewer</h1>
            <p className="text-gray-600 mt-2">Danh sách các bài báo được giao cho bạn</p>
          </div>
          
          {/* Nút Duyệt Camera Ready */}
          <Button 
            onClick={() => setShowCameraReady(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Duyệt Camera Ready
          </Button>
        </div>

        {/* Thống kê số lượng bài báo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tổng số bài báo được giao:</span> {assignedPapers.length}
          </p>
        </div>

        {/* Danh sách bài báo */}
        {assignedPapers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <PaperTable papers={assignedPapers} onView={handleViewPaper} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Bạn chưa được giao bài báo nào.
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
}
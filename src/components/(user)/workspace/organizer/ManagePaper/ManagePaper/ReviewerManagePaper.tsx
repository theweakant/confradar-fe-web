"use client";

import { useState } from "react";
import { AlertCircle, ScanEye, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

import { PaperTable } from "@/components/(user)/workspace/organizer/ManagePaper/ManagePaper/PaperTable/index";
import { PaperDetail } from "@/components/(user)/workspace/organizer/ManagePaper/ManagePaper/PaperDetail/index";
import { Paper } from "@/types/paper.type";
import {  useListAllPapersQuery } from "@/redux/services/paper.service";
import { useGetReviewersListQuery } from "@/redux/services/user.service";


export default function ReviewerManagePage() {
  // API queries
  const { data: papersData, isLoading: papersLoading, error: papersError } = useListAllPapersQuery();
  const { data: reviewersData, isLoading: reviewersLoading, error: reviewersError } = useGetReviewersListQuery();

  const [viewPaper, setViewPaper] = useState<Paper | null>(null);
  const [assignPaper, setAssignPaper] = useState<Paper | null>(null);

  // Extract data from API responses
  const papers = papersData?.data || [];

  const handleView = (paper: Paper) => {
    setViewPaper(paper);
  };


  // Loading state
  if (papersLoading || reviewersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (papersError || reviewersError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài báo</h1>
              <p className="text-gray-600 mt-2">
                Quản lý bài báo và đánh giá trên ConfRadar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/workspace/organizer/manage-paper/assigned-papper-list">
                <Button className="flex items-center gap-2 whitespace-nowrap" variant="outline">
                  <ScanEye className="w-5 h-5" />
                  Xem danh sách bài báo đang chờ
                </Button>
              </Link>
              <Button
                className="flex items-center gap-2 whitespace-nowrap"
                onClick={() => {
                  if (papers.length > 0) {
                    setAssignPaper(papers[0]);
                  } else {
                    toast.info("Không có bài báo nào để giao reviewer");
                  }
                }}
              >
                <UserPlus className="w-5 h-5" />
                Duyệt Camera Ready
              </Button>
            </div>
          </div>
        </div>



        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <PaperTable
            papers={papers}
            onView={handleView}
          />
        </div>


        {/* Assign Reviewer Dialog */}
          <Dialog open={!!viewPaper} onOpenChange={() => setViewPaper(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết bài báo</DialogTitle>
              </DialogHeader>
              {viewPaper && (
                <PaperDetail
                  paper={viewPaper}
                  paperId={viewPaper.paperId}  
                  onClose={() => setViewPaper(null)}
                />
              )}
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
}
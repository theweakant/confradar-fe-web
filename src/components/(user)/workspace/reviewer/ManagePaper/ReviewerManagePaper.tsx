"use client";

import { useState, useEffect } from "react";
import { ScanEye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { PaperTable } from "@/components/(user)/workspace/reviewer/ManagePaper/PaperTable";
import { PaperDeadlineDetail } from "@/components/(user)/workspace/reviewer/ManagePaper/PaperDetail";

import { Paper } from "@/types/paper.type";
import { useLazyGetAllConferencesPaginationQuery } from "@/redux/services/conference.service";

export default function ReviewerManagePaperPage() {
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>("");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  
  const [triggerGetConferences, { data: conferencesData, isLoading: loadingConferences, error: conferencesError }] =
    useLazyGetAllConferencesPaginationQuery();

  
  const [triggerGetPapers, { data: papersData, isLoading: loadingPapers, error: papersError }] =
    useLazyGetAssignedPapersByConferenceQuery();

  // Lấy danh sách hội thảo khi load trang
  useEffect(() => {
    triggerGetConferences({ page: 1, pageSize: 50 });
  }, [triggerGetConferences]);

  const conferences = conferencesData?.data?.items || [];
  const papers = papersData?.data || [];

  // Khi chọn hội thảo
  const handleSelectConference = (conferenceId: string) => {
    setSelectedConferenceId(conferenceId);
    if (conferenceId) {
      triggerGetPapers(conferenceId);
    }
  };

  // Loading UI
  if (loadingConferences || loadingPapers) {
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
  if (conferencesError || papersError) {
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
            <p className="text-gray-600 mt-2">Chọn hội thảo để xem danh sách bài báo được giao</p>
          </div>
          <Link href="/workspace/local-reviewer/manage-paper/assigned-papper-list">
            <Button className="flex items-center gap-2 whitespace-nowrap">
              <ScanEye className="w-5 h-5" />
              Danh sách bài báo đang chờ đánh giá
            </Button>
          </Link>
        </div>

        {/* Dropdown chọn hội thảo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn hội thảo
          </label>
          <select
            value={selectedConferenceId}
            onChange={(e) => handleSelectConference(e.target.value)}
            className="w-full md:w-1/2 border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">-- Chọn hội thảo --</option>
            {conferences.map((conf: any) => (
              <option key={conf.conferenceId} value={conf.conferenceId}>
                {conf.conferenceName}
              </option>
            ))}
          </select>
        </div>

        {/* Danh sách bài báo */}
        {selectedConferenceId ? (
          papers.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <PaperTable papers={papers} onView={(p) => setSelectedPaper(p)} />
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Không có bài báo nào được giao trong hội thảo này.
            </p>
          )
        ) : (
          <p className="text-gray-500 italic">
            Vui lòng chọn hội thảo để xem danh sách bài báo.
          </p>
        )}
      </div>

      {/* Chi tiết bài báo */}
      <Dialog open={!!selectedPaper} onOpenChange={() => setSelectedPaper(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết bài báo</DialogTitle>
          </DialogHeader>
          {selectedPaper && (
            <PaperDeadlineDetail
              paper={selectedPaper}
              onClose={() => setSelectedPaper(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
 
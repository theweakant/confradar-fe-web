// components/pages/ConferenceDetailPage/Tab/ResearchTimelineTab.tsx
"use client";

import { Info, Clock, Calendar, Play } from "lucide-react";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface ResearchConferencePhase {
  researchConferencePhaseId: string;
  conferenceId: string;
  registrationStartDate: string; // ISO date
  registrationEndDate: string;
  fullPaperStartDate: string;
  fullPaperEndDate: string;
  reviewStartDate: string;
  reviewEndDate: string;
  reviseStartDate: string;
  reviseEndDate: string;
  cameraReadyStartDate: string;
  cameraReadyEndDate: string;
  isWaitlist: boolean;
  isActive: boolean;
  // Không cần định nghĩa revisionRoundDeadlines vì không dùng
}

interface ResearchTimelineTabProps {
  conferenceId: string;
}

export function ResearchTimelineTab({ conferenceId }: ResearchTimelineTabProps) {
  const { data, isLoading, error } = useGetResearchConferenceDetailInternalQuery(conferenceId);

  // Ép kiểu để TypeScript hiểu rõ cấu trúc (nếu bạn chưa có type trong redux)
  const researchPhase = data?.data?.researchPhase as ResearchConferencePhase | undefined;

  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">("active");

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRange = (start: string, end: string): string => {
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const phases = researchPhase
    ? [
        {
          title: "Đăng ký tham dự",
          period: formatRange(researchPhase.registrationStartDate, researchPhase.registrationEndDate),
        },
        {
          title: "Gửi full paper",
          period: formatRange(researchPhase.fullPaperStartDate, researchPhase.fullPaperEndDate),
        },
        {
          title: "Phản biện bài báo",
          period: formatRange(researchPhase.reviewStartDate, researchPhase.reviewEndDate),
        },
        {
          title: "Chỉnh sửa & gửi lại",
          period: formatRange(researchPhase.reviseStartDate, researchPhase.reviseEndDate),
        },
        {
          title: "Gửi bản camera-ready",
          period: formatRange(researchPhase.cameraReadyStartDate, researchPhase.cameraReadyEndDate),
        },
      ]
    : [];

  const handleActivate = () => {
    // TODO: Gọi API cập nhật trạng thái khi có
    console.log("Cập nhật trạng thái:", selectedStatus);
    toast.success(
      selectedStatus === "active"
        ? "Đã kích hoạt tiến trình nghiên cứu!"
        : "Đã tạm dừng tiến trình nghiên cứu!"
    );
    setIsActivateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
        <span className="text-gray-600">Đang tải tiến trình nghiên cứu...</span>
      </div>
    );
  }

  if (error || !researchPhase) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Không tải được tiến trình nghiên cứu
        </h3>
        <p className="text-gray-500">
          {error
            ? "Đã xảy ra lỗi khi kết nối máy chủ."
            : "Hội nghị này chưa thiết lập tiến trình nghiên cứu."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Nút Kích hoạt Phase */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Timeline Nghiên cứu</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsActivateModalOpen(true)}
          className="flex items-center gap-1.5 border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          Kích hoạt
        </Button>
      </div>

      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="mt-1 p-2 bg-blue-100 rounded-full">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{phase.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{phase.period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trạng thái hội nghị — LUÔN HIỂN THỊ CẢ HAI */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">Trạng thái hội nghị</h4>
        <div className="flex flex-wrap gap-3">
          {/* Trạng thái hoạt động */}
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              researchPhase.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {researchPhase.isActive ? "Đang hoạt động" : "Đã kết thúc"}
          </span>

          {/* Trạng thái danh sách chờ — LUÔN HIỂN THỊ */}
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              researchPhase.isWaitlist
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {researchPhase.isWaitlist ? "Có danh sách chờ" : "Không có danh sách chờ"}
          </span>
        </div>
      </div>

      {/* Modal Kích hoạt Phase (Mock) */}
      <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kích hoạt tiến trình nghiên cứu</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Chọn trạng thái bạn muốn áp dụng cho tiến trình nghiên cứu của hội nghị này:
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  checked={selectedStatus === "active"}
                  onChange={() => setSelectedStatus("active")}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Kích hoạt</div>
                  <div className="text-xs text-gray-500">Mở cho tác giả đăng ký và gửi bài</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  checked={selectedStatus === "inactive"}
                  onChange={() => setSelectedStatus("inactive")}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Tạm dừng</div>
                  <div className="text-xs text-gray-500">Khóa mọi hành động gửi bài mới</div>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={handleActivate} className="bg-blue-600 hover:bg-blue-700">
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
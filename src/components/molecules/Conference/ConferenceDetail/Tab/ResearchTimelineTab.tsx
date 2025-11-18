// components/pages/ConferenceDetailPage/Tab/ResearchTimelineTab.tsx
"use client";

import {
  Info,
  Clock,
  User,
  UserCheck,
  FileText,
  MessageCircle,
  Edit3,
  PackageCheck,
  Workflow
} from "lucide-react";
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
  registrationStartDate: string; 
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
}

interface ResearchTimelineTabProps {
  conferenceId: string;
}

export function ResearchTimelineTab({ conferenceId }: ResearchTimelineTabProps) {
  const { data, isLoading, error } = useGetResearchConferenceDetailInternalQuery(conferenceId);
  const researchPhases = data?.data?.researchPhase as ResearchConferencePhase[] || [];

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

  const handleActivate = () => {
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

  if (error || researchPhases.length === 0) {
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

  // Định nghĩa các mốc với icon riêng
  const getTimelineSteps = (phase: ResearchConferencePhase) => [
    {
      title: "Đăng ký tham dự",
      start: phase.registrationStartDate,
      end: phase.registrationEndDate,
      icon: UserCheck,
      color: "text-blue-600",
    },
    {
      title: "Gửi full paper",
      start: phase.fullPaperStartDate,
      end: phase.fullPaperEndDate,
      icon: FileText,
      color: "text-amber-600",
    },
    {
      title: "Phản biện bài báo",
      start: phase.reviewStartDate,
      end: phase.reviewEndDate,
      icon: MessageCircle,
      color: "text-emerald-600",
    },
    {
      title: "Chỉnh sửa & gửi lại",
      start: phase.reviseStartDate,
      end: phase.reviseEndDate,
      icon: Edit3,
      color: "text-violet-600",
    },
    {
      title: "Gửi bản camera-ready",
      start: phase.cameraReadyStartDate,
      end: phase.cameraReadyEndDate,
      icon: PackageCheck,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Render each Phase */}
      {researchPhases.map((phase, index) => (
        <div
          key={phase.researchConferencePhaseId}
          className="bg-white border border-gray-200 rounded-lg p-5 space-y-4"
        >
          {/* Phase Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <div className="w-8 h-8  rounded-full flex items-center justify-center">
              <Workflow className="w-4 h-4 text-blue-600" />
            </div>
              <h4 className="font-medium text-gray-900">
                Giai đoạn {index + 1}
              </h4>
            </div>

            {/* Status Badges — màu mới */}
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  phase.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {phase.isActive ? "Đang hoạt động" : "Dừng hoạt động"}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  phase.isWaitlist
                    ? "bg-violet-100 text-violet-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {phase.isWaitlist ? "Waitlist" : "Main"}
              </span>
            </div>
          </div>

          {/* Timeline Events with Icons */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {getTimelineSteps(phase).map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className={`mt-0.5 p-1 rounded-full ${item.color.replace('text', 'bg').replace('-600', '-100')}`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                      <span className="text-xs text-gray-500">
                        {formatRange(item.start, item.end)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal Kích hoạt Phase */}
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
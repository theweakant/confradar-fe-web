// components/pages/ConferenceDetailPage/Tab/PaperPhaseTab.tsx
import Link from "next/link";
import { Info, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

// === Mock Data: Tiến trình bài báo ===
interface PaperPhase {
  id: string;
  name: string;
  description: string;
  status: "completed" | "pending" | "overdue";
  deadline: string; // ISO date
  completedAt?: string;
}

const mockPhases: PaperPhase[] = [
  {
    id: "1",
    name: "Gửi abstract ban đầu",
    description: "Gửi tóm tắt bài báo để duyệt trước",
    status: "completed",
    deadline: "2025-10-15",
    completedAt: "2025-10-10",
  },
  {
    id: "2",
    name: "Gửi full paper",
    description: "Gửi bản đầy đủ sau khi abstract được chấp nhận",
    status: "completed",
    deadline: "2025-11-01",
    completedAt: "2025-10-28",
  },
  {
    id: "3",
    name: "Gửi bản camera-ready",
    description: "Gửi bản in cuối cùng sau khi chỉnh sửa theo phản biện",
    status: "pending",
    deadline: "2025-12-10",
  },
  {
    id: "4",
    name: "Đăng ký tham dự",
    description: "Tác giả cần đăng ký tham dự hội nghị",
    status: "pending",
    deadline: "2025-12-20",
  },
  {
    id: "5",
    name: "Trình bày tại hội nghị",
    description: "Phiên báo cáo chính thức",
    status: "pending",
    deadline: "2026-01-15",
  },
];

export function PaperPhaseTab() {
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStatus = (phase: PaperPhase) => {
    switch (phase.status) {
      case "completed":
        return (
          <div className="flex items-center gap-1.5 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Hoàn thành</span>
            <span className="text-sm text-gray-500">({formatDate(phase.completedAt!)})</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1.5 text-yellow-700">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Đang chờ</span>
            <span className="text-sm text-gray-500">Hạn: {formatDate(phase.deadline)}</span>
          </div>
        );
      case "overdue":
        return (
          <div className="flex items-center gap-1.5 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Quá hạn</span>
            <span className="text-sm text-gray-500">Hạn: {formatDate(phase.deadline)}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Nút xem abstract chờ duyệt */}
      <div className="flex justify-end">
        <Link href="/workspace/organizer/manage-paper/pending-abstract-list">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Xem abstract chờ duyệt
          </Button>
        </Link>
      </div>

      {/* Tiến trình bài báo */}
      <div className="space-y-4">
        {mockPhases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có thông tin tiến trình bài báo
            </h3>
            <p className="text-gray-500">Tiến trình sẽ được cập nhật sau</p>
          </div>
        ) : (
          mockPhases.map((phase) => (
            <div
              key={phase.id}
              className="p-5 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{phase.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                </div>
                {renderStatus(phase)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
"use client";

import {
  User as UserIcon,
  Mail,
  Shield,
  Activity,
  Calendar,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { UserProfileResponse } from "@/types/user.type";

interface ExternalReviewerDetailProps {
  reviewer: UserProfileResponse;
  onClose: () => void;
}

export function ExternalReviewerDetail({ reviewer, onClose }: ExternalReviewerDetailProps) {
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      customer: "Khách hàng",
      conferenceorganizer: "Người tổ chức hội nghị",
      collaborator: "Cộng tác viên",
      localreviewer: "Phản biện nội bộ",
      externalreviewer: "Phản biện bên ngoài",
      admin: "Quản trị viên"
    };
    return labels[role] || role;
  };

  const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      customer: "info",
      conferenceorganizer: "warning",
      collaborator: "success",
      localreviewer: "info",
      externalreviewer: "warning",
      admin: "danger"
    };
    return variants[role] || "info";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Tạm ngưng"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      active: "success",
      inactive: "danger"
    };
    return variants[status] || "info";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{reviewer.fullName}</h3>
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge
              status={getRoleLabel(reviewer.role)}
              variant={getRoleVariant(reviewer.role)}
            />
            <StatusBadge
              status={getStatusLabel(reviewer.status)}
              variant={getStatusVariant(reviewer.status)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Tên phản biện bên ngoài</p>
              <p className="text-gray-900">{reviewer.fullName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{reviewer.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Vai trò</p>
              <p className="text-gray-900">{getRoleLabel(reviewer.role)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Trạng thái</p>
              <p className="text-gray-900">{getStatusLabel(reviewer.status)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Số bài báo đã phản biện</p>
              <p className="text-gray-900 font-semibold">{reviewer.registeredConferences || 0} bài báo</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Ngày tham gia</p>
              <p className="text-gray-900">{formatDate(reviewer.joinedDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
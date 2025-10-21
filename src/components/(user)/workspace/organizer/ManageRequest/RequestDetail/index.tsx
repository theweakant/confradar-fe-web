"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Mail,
  FileText,
  Calendar,
  Tag,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { formatDate } from "@/helper/format";
import { Request, UpdateRequestStatusDto } from "@/types/request.type";

interface RequestDetailProps {
  request: Request;
  onUpdateStatus: (id: string, data: UpdateRequestStatusDto) => void;
  onClose: () => void;
}

export function RequestDetail({
  request,
  onUpdateStatus,
  onClose,
}: RequestDetailProps) {
  const [status, setStatus] = useState(request.status);
  const [reviewNote, setReviewNote] = useState(request.reviewNote || "");

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      refund: "Hoàn tiền",
      change_presenter: "Đổi diễn giả",
      change_session: "Đổi phiên",
    };
    return labels[type] || type;
  };

  const getTypeVariant = (
    type: string
  ): "success" | "danger" | "warning" | "info" => {
    const variants: Record<
      string,
      "success" | "danger" | "warning" | "info"
    > = {
      refund: "danger",
      change_presenter: "warning",
      change_session: "info",
    };
    return variants[type] || "info";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Chờ xử lý",
      approved: "Đã phê duyệt",
      rejected: "Đã từ chối",
      more_info: "Cần thông tin",
    };
    return labels[status] || status;
  };

  const getStatusVariant = (
    status: string
  ): "success" | "danger" | "warning" | "info" => {
    const variants: Record<
      string,
      "success" | "danger" | "warning" | "info"
    > = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
      more_info: "info",
    };
    return variants[status] || "info";
  };

  const handleUpdate = () => {
    onUpdateStatus(request.id, { status, reviewNote });
  };

  const statusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "approved", label: "Phê duyệt" },
    { value: "rejected", label: "Từ chối" },
    { value: "more_info", label: "Cần thêm thông tin" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {request.conferenceName}
          </h3>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={getTypeLabel(request.type)}
              variant={getTypeVariant(request.type)}
            />
            <StatusBadge
              status={getStatusLabel(request.status)}
              variant={getStatusVariant(request.status)}
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Người gửi</p>
            <p className="text-gray-900">{request.userName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-gray-900">{request.userEmail}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Ngày gửi</p>
            <p className="text-gray-900">
              {formatDate(request.createdAt.toISOString())}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Cập nhật lần cuối</p>
            <p className="text-gray-900">
              {formatDate(request.updatedAt.toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Request Content */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Lý do</p>
            <p className="text-gray-900">{request.reason}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Chi tiết</p>
            <p className="text-gray-900 leading-relaxed">{request.details}</p>
          </div>
        </div>

        {request.attachment && (
          <div className="flex items-start gap-3">
            <Paperclip className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Tài liệu đính kèm
              </p>
              <p className="text-blue-600 hover:underline cursor-pointer">
                {request.attachment}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Review Section */}
      {request.reviewedBy && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Ghi chú từ {request.reviewedBy}
              </p>
              <p className="text-gray-900">{request.reviewNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Section */}
      <div className="pt-4 border-t space-y-4">
        <h4 className="font-semibold text-gray-900">Cập nhật trạng thái</h4>
        
        <FormSelect
          label="Trạng thái"
          name="status"
          value={status}
          onChange={(value) => setStatus(value as "pending" | "approved" | "rejected" | "more_info")}
          options={statusOptions}
          required
        />

        <FormTextArea
          label="Ghi chú"
          name="reviewNote"
          value={reviewNote}
          onChange={setReviewNote}
          placeholder="Thêm ghi chú về quyết định của bạn..."
          rows={3}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Đóng
        </Button>
        <Button
          onClick={handleUpdate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Cập nhật trạng thái
        </Button>
      </div>
    </div>
  );
}
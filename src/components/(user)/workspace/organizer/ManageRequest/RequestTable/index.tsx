"use client";

import React from "react";
import { Eye, Trash2, Calendar, FileText, User } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ActionButton } from "@/components/atoms/ActionButton";
import { formatDate } from "@/helper/format";
import { Request } from "@/types/request.type";

interface RequestTableProps {
  requests: Request[];
  onView: (request: Request) => void;
  onDelete: (id: string) => void;
}

export function RequestTable({
  requests,
  onView,
  onDelete,
}: RequestTableProps) {
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

  const columns: Column<Request>[] = [
    {
      key: "userName",
      header: "Người gửi",
      render: (request) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 truncate">
              {request.userName}
            </p>
            <p className="text-sm text-gray-500 truncate">{request.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "conferenceName",
      header: "Hội nghị",
      render: (request) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">
            {request.conferenceName}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại yêu cầu",
      render: (request) => (
        <StatusBadge
          status={getTypeLabel(request.type)}
          variant={getTypeVariant(request.type)}
        />
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (request) => (
        <StatusBadge
          status={getStatusLabel(request.status)}
          variant={getStatusVariant(request.status)}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (request) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {formatDate(request.createdAt.toISOString())}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (request) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            onClick={() => onView(request)}
            icon={<Eye className="w-4 h-4" />}
            variant="success"
            tooltip="Xem chi tiết"
          />
          <ActionButton
            onClick={() => onDelete(request.id)}
            icon={<Trash2 className="w-4 h-4" />}
            variant="danger"
            tooltip="Xóa"
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      keyExtractor={(request) => request.id}
      emptyMessage="Không tìm thấy yêu cầu nào"
    />
  );
}
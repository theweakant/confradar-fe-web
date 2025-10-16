import React from "react";
import { 
  Pencil, 
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Eye,
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { formatCurrency } from "@/helper/format";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ActionButton } from "@/components/atoms/ActionButton";
import { Conference } from "@/types/conference.type";

interface ConferenceTableProps {
  conferences: Conference[];
  onView: (conference: Conference) => void;
  onEdit: (conference: Conference) => void;
  onDelete: (id: string) => void;
}

export function ConferenceTable({ 
  conferences, 
  onView, 
  onEdit, 
  onDelete 
}: ConferenceTableProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technology: "Công nghệ",
      research: "Nghiên cứu",
      business: "Kinh doanh",
      education: "Giáo dục"
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      upcoming: "info",
      ongoing: "success",
      completed: "warning",
      cancelled: "danger"
    };
    return variants[status] || "info";
  };

  const columns: Column<Conference>[] = [
    {
      key: "title",
      header: "Hội thảo",
      render: (conference) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{conference.title}</p>
          <p className="text-sm text-gray-500 truncate">{conference.organizerName}</p>
        </div>
      ),
    },
    {
      key: "time",
      header: "Thời gian",
      render: (conference) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <div>
            <p className="text-sm whitespace-nowrap">
              {new Date(conference.startDate).toLocaleDateString("vi-VN")}
            </p>
            <p className="text-xs text-gray-500">
              đến {new Date(conference.endDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Địa điểm",
      render: (conference) => (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{conference.location}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (conference) => (
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          {getCategoryLabel(conference.category)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (conference) => (
        <StatusBadge
          status={getStatusLabel(conference.status)}
          variant={getStatusVariant(conference.status)}
        />
      ),
    },
    {
      key: "attendees",
      header: "Số lượng",
      render: (conference) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {conference.currentAttendees}/{conference.maxAttendees}
          </span>
        </div>
      ),
    },
    {
      key: "fee",
      header: "Phí",
      render: (conference) => (
        <span className="text-sm font-medium text-gray-900">
          {conference.registrationFee === 0 ? "Miễn phí" : formatCurrency(conference.registrationFee)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (conference) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            onClick={() => onView(conference)}
            icon={<Eye className="w-4 h-4" />}
            variant="success"
            tooltip="Xem chi tiết"
          />
          <ActionButton
            onClick={() => onEdit(conference)}
            icon={<Pencil className="w-4 h-4" />}
            variant="primary"
            tooltip="Chỉnh sửa"
          />
          <ActionButton
            onClick={() => onDelete(conference.id)}
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
      data={conferences}
      keyExtractor={(conference) => conference.id}
      emptyMessage="Không tìm thấy hội thảo nào"
    />
  );
}
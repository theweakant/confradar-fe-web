import React from "react";
import { 
  Pencil, 
  Trash2, 
  Eye,
  Calendar,
  FileText,
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { formatDate } from "@/helper/format";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ActionButton } from "@/components/atoms/ActionButton";
import { User } from "@/types/user.type";

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserTable({ 
  users, 
  onView, 
  onEdit, 
  onDelete 
}: UserTableProps) {
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Quản trị viên",
      organizer: "Tổ chức",
      attendee: "Người tham dự"
    };
    return labels[role] || role;
  };

  const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      admin: "danger",
      organizer: "info",
      attendee: "success"
    };
    return variants[role] || "info";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Không hoạt động"
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

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "Tên người dùng",
      render: (user) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      render: (user) => (
        <StatusBadge
          status={getRoleLabel(user.role)}
          variant={getRoleVariant(user.role)}
        />
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (user) => (
        <StatusBadge
          status={getStatusLabel(user.status)}
          variant={getStatusVariant(user.status)}
        />
      ),
    },
    {
      key: "registeredConferences",
      header: "Số hội thảo",
      render: (user) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {user.registeredConferences}
          </span>
        </div>
      ),
    },
    {
      key: "joinedDate",
      header: "Ngày tham gia",
      render: (user) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(user.joinedDate)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            onClick={() => onView(user)}
            icon={<Eye className="w-4 h-4" />}
            variant="success"
            tooltip="Xem chi tiết"
          />
          <ActionButton
            onClick={() => onEdit(user)}
            icon={<Pencil className="w-4 h-4" />}
            variant="primary"
            tooltip="Chỉnh sửa"
          />
          <ActionButton
            onClick={() => onDelete(user.userId)}
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
      data={users}
      keyExtractor={(user) => user.userId}
      emptyMessage="Không tìm thấy người dùng nào"
    />
  );
}
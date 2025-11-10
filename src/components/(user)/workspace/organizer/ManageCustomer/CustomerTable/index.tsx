import React from "react";
import { 
  Eye,
  MoreVertical,
  Ban,
  CheckCircle
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { UserProfileResponse } from "@/types/user.type";

interface CustomerTableProps {
  customers: UserProfileResponse[];
  onView: (customer: UserProfileResponse) => void;
  onSuspend: (customerId: string) => void;
  onActivate: (customerId: string) => void;
}

export function CustomerTable({ 
  customers, 
  onView, 
  onSuspend, 
  onActivate 
}: CustomerTableProps) {
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

  const columns: Column<UserProfileResponse>[] = [
    {
      key: "fullName",
      header: "Tên khách hàng",
      render: (customer) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{customer.fullName}</p>
          <p className="text-sm text-gray-500 truncate">{customer.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      render: (customer) => (
        <StatusBadge
          status={getRoleLabel(customer.role)}
          variant={getRoleVariant(customer.role)}
        />
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (customer) => (
        <StatusBadge
          status={getStatusLabel(customer.status)}
          variant={getStatusVariant(customer.status)}
        />
      ),
    },
    {
      key: "registeredConferences",
      header: "Hội nghị đã đăng ký",
      render: (customer) => (
        <span className="text-gray-900 font-medium">
          {customer.registeredConferences || 0}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (customer) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onView(customer)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              {customer.status === "active" ? (
                <DropdownMenuItem
                  onClick={() => onSuspend(customer.userId)}
                  className="cursor-pointer text-orange-600 focus:text-orange-600"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Tạm ngưng
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onActivate(customer.userId)}
                  className="cursor-pointer text-green-600 focus:text-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Kích hoạt
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      keyExtractor={(customer) => customer.userId}
      emptyMessage="Không tìm thấy khách hàng nào"
    />
  );
}
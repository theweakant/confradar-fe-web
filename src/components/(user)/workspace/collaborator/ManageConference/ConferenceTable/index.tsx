import React from "react";
import { 
  Pencil, 
  Trash2, 
  Calendar,
  Users,
  Eye,
  MoreVertical,
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { Conference } from "@/types/conference.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const columns: Column<Conference>[] = [
    {
      key: "conferenceName",
      header: "Tên hội thảo",
      render: (conference) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{conference.conferenceName}</p>
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Ngày bắt đầu",
      render: (conference) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm whitespace-nowrap">
            {conference.startDate
              ? new Date(conference.startDate).toLocaleDateString("vi-VN")
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "totalSlot",
      header: "Tổng chỗ",
      render: (conference) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {conference.totalSlot}
          </span>
        </div>
      ),
    },
    {
      key: "ticketSaleStart",
      header: "Bắt đầu bán vé",
      render: (conference) => (
        <span className="text-sm text-gray-600">
          {conference.ticketSaleStart
            ? new Date(conference.ticketSaleStart).toLocaleDateString("vi-VN")
            : "N/A"}
        </span>
      ),
    },
    {
      key: "targetAudience",
      header: "Đối tượng",
      render: (conference) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          {conference.targetAudience}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (conference) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onView(conference)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2 text-green-600" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={conferences}
      keyExtractor={(conference) => conference.conferenceId}
      emptyMessage="Không tìm thấy hội thảo nào"
    />
  );
}
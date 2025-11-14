import React from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Users,
  Eye,
  MoreVertical,
} from "lucide-react";
import NextImage from "next/image";

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
  onEdit?: (conference: Conference) => void;
  onDelete?: (id: string) => void;
  statuses: { conferenceStatusId: string; conferenceStatusName: string }[];
}

export function ConferenceTable({
  conferences,
  onView,
  onEdit,
  onDelete,
  statuses,
}: ConferenceTableProps) {
  const getStatusClass = (statusName: string): string => {
    switch (statusName) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Preparing":
        return "bg-blue-100 text-blue-700";
      case "Ready":
        return "bg-teal-100 text-teal-700";
      case "Completed":
        return "bg-green-600 text-white font-semibold";
      case "OnHold":
        return "bg-orange-100 text-orange-700";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      case "Deleted":
        return "bg-red-600 text-white font-semibold";  
      default:
        return "text-gray-700";
    }
  };

  const columns: Column<Conference>[] = [
    {
      key: "bannerImageUrl",
      header: "Ảnh",
      render: (conference) => (
        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
          {conference.bannerImageUrl ? (
            <NextImage
              src={conference.bannerImageUrl}
              alt={conference.conferenceName || ""}
              width={64}
              height={48}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      key: "conferenceName",
      header: "Tên hội thảo",
      render: (conference) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">
            {conference.conferenceName}
          </p>
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Bắt đầu sự kiện",
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
      key: "totalSlot",
      header: "Tổng chỗ",
      render: (conference) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{conference.totalSlot}</span>
        </div>
      ),
    },
    {
      key: "conferenceStatusId",
      header: "Trạng thái",
      render: (conference) => {
        const status = statuses.find(
          (s) => s.conferenceStatusId === conference.conferenceStatusId,
        );
        const statusName = status?.conferenceStatusName || "Không xác định";

        const statusClass = getStatusClass(statusName);

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
          >
            {statusName}
          </span>
        );
      },
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
                <span>Tổng quan</span>
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

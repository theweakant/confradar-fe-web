"use client";

import React from "react";
import { Eye, MoreVertical } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { ConferenceResponse } from "@/types/conference.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConferenceHasAssignedPaperTableProps {
  conferences: ConferenceResponse[];
  onView?: (conference: ConferenceResponse) => void;
}

export function ConferenceHasAssignedPaperTable({
  conferences,
  onView,
}: ConferenceHasAssignedPaperTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const columns: Column<ConferenceResponse>[] = [
    {
      key: "conferenceName",
      header: "Tên hội nghị",
      render: (conference) => (
        <div className="font-medium text-sm text-gray-900">
          {conference.conferenceName || "N/A"}
        </div>
      ),
    },
    {
      key: "conferenceId",
      header: "Conference ID",
      render: (conference) => (
        <div className="font-mono text-sm text-gray-600">
          {conference.conferenceId}
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Ngày bắt đầu",
      render: (conference) => (
        <div className="text-sm text-gray-600">
          {formatDate(conference.startDate)}
        </div>
      ),
    },
    {
      key: "endDate",
      header: "Ngày kết thúc",
      render: (conference) => (
        <div className="text-sm text-gray-600">
          {formatDate(conference.endDate)}
        </div>
      ),
    },
    {
      key: "isResearchConference",
      header: "Loại",
      render: (conference) => (
        <div className="text-sm">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conference.isResearchConference
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
              }`}
          >
            {conference.isResearchConference ? "Nghiên cứu" : "Kỹ thuật"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      className: "text-right",
      render: (conference) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => onView?.(conference)}
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
      emptyMessage="Không tìm thấy hội nghị nào có bài báo được phân công"
    />
  );
}
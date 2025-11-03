"use client";

import React from "react";
import { 
  Eye, 
  Pencil, 
  Calendar, 
  MapPin, 
  MoreVertical 
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConferenceResponse } from "@/types/conference.type";

interface ConferenceTableProps {
  conferences: ConferenceResponse[];
  onView: (conference: ConferenceResponse) => void;
  onEdit: (conference: ConferenceResponse) => void;
}

export function ConferenceTable({ conferences, onView, onEdit }: ConferenceTableProps) {
  const columns: Column<ConferenceResponse>[] = [
    {
      key: "conferenceName",
      header: "Hội thảo",
      render: (conference) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{conference.conferenceName}</p>
          <p className="text-sm text-gray-500 truncate">
            {conference.isInternalHosted ? "Nội bộ" : "Bên ngoài"}
          </p>
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
              {conference.startDate
                ? new Date(conference.startDate).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
            <p className="text-xs text-gray-500">
              {conference.endDate
                ? `đến ${new Date(conference.endDate).toLocaleDateString("vi-VN")}`
                : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Địa điểm",
      render: (conference) => (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm">{conference.address}</span>
        </div>
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
                <span>Xem</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(conference)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2 text-blue-600" />
                <span>Chỉnh sửa</span>
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
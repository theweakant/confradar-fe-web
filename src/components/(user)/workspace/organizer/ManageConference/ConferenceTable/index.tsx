"use client";

import React from "react";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  MoreVertical 
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Conference } from "@/types/conference.type";

interface ConferenceTableProps {
  conferences: Conference[];
  onView: (conference: Conference) => void;
  onEdit: (conference: Conference) => void;
  onDelete: (id: string) => void;
}

export function ConferenceTable({ conferences, onView, onEdit, onDelete }: ConferenceTableProps) {
  const columns: Column<Conference>[] = [
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
      key: "capacity",
      header: "Sức chứa",
      render: (conference) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{conference.capacity}</span>
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
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(conference)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2 text-blue-600" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(conference.conferenceId)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Xóa</span>
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

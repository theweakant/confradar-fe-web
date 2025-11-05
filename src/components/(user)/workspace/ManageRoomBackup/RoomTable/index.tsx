"use client";

import React from "react";
import { Eye, Pencil, Trash2, Building, MoreVertical, Calendar } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { formatDate } from "@/helper/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Room } from "@/types/room.type";

interface RoomTableProps {
  rooms: Room[];
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}

export function RoomTable({
  rooms,
  onView,
  onEdit,
  onDelete,
}: RoomTableProps) {
  

  const columns: Column<Room>[] = [
    {
      key: "displayName",
      header: "Tên phòng",
      render: (room) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{room.displayName}</p>
          <p className="text-sm text-gray-500 truncate">Mã phòng: {room.number}</p>
        </div>
      ),
    },
    {
      key: "destinationId",
      header: "Mã điểm đến",
      render: (room) => (
        <div className="flex items-center gap-2 text-gray-700">
          <Building className="w-4 h-4 text-blue-600" />
          <span>{room.destinationId}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: () => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(new Date().toISOString())}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (room) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onView(room)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2 text-green-600" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(room)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2 text-blue-600" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(room.roomId)}
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
      data={rooms}
      keyExtractor={(room) => room.roomId}
      emptyMessage="Không tìm thấy phòng nào"
    />
  );
}

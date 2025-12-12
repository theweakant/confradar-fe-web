"use client";

import { Eye, Pencil, Trash2, Image as ImageIcon, MoreVertical } from "lucide-react";
import { DataTable, Column } from "@/components/molecules/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Publisher } from "@/types/publisher.type";
import Image from "next/image";

interface PublisherTableProps {
  publishers: Publisher[];
  onView: (publisher: Publisher) => void;
  onEdit: (publisher: Publisher) => void;
  onDelete: (id: string) => void;
}

export function PublisherTable({
  publishers,
  onView,
  onEdit,
  onDelete,
}: PublisherTableProps) {
  const columns: Column<Publisher>[] = [
    {
      key: "name",
      header: "Tên nhà xuất bản",
      render: (publisher) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{publisher.name}</p>
        </div>
      ),
    },
    {
      key: "paperFormat",
      header: "Định dạng bài báo",
      render: (publisher) => (
        <div className="max-w-xs">
          <p className="text-gray-700 truncate">{publisher.paperFormat || "—"}</p>
        </div>
      ),
    },
    {
      key: "logoUrl",
      header: "Logo",
      render: (publisher) => (
        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {publisher.logoUrl ? (
            <Image
              src={publisher.logoUrl}
              alt={publisher.name}
              width={40}
              height={40}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className = "w-full h-full flex items-center justify-center text-gray-400";
                fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M.5 2A1.5 1.5 0 0 1 2 .5h12A1.5 1.5 0 0 1 15.5 2v12a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 14V2zM1 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V2a.5.5 0 0 0-.5-.5H2a.5.5 0 0 0-.5.5zM3 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3z"/></svg>';
                target.parentNode?.appendChild(fallback);
              }}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (publisher) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(publisher)} className="cursor-pointer">
                <Eye className="w-4 h-4 mr-2 text-green-600" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(publisher)} className="cursor-pointer">
                <Pencil className="w-4 h-4 mr-2 text-blue-600" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(publisher.publisherId)}
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
      data={publishers}
      keyExtractor={(publisher) => publisher.publisherId}
      emptyMessage="Không tìm thấy nhà xuất bản nào"
    />
  );
}
"use client";

import React from "react";
import { Eye, Pencil, Trash2, FolderOpen, MoreVertical, Calendar, Power } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Category } from "@/types/category.type";

interface CategoryTableProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function CategoryTable({
  categories,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryTableProps) {
  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Tên danh mục",
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 truncate">{category.name}</p>
            <p className="text-sm text-gray-500 truncate">{category.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Trạng thái",
      render: (category) => (
        <StatusBadge
          status={category.isActive ? "Đang hoạt động" : "Không hoạt động"}
          variant={category.isActive ? "success" : "danger"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (category) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(category.createdAt.toISOString())}</span>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      render: (category) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(category.updatedAt.toISOString())}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (category) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onView(category)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2 text-green-600" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(category)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2 text-blue-600" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleStatus(category.id)}
                className="cursor-pointer"
              >
                <Power className="w-4 h-4 mr-2 text-orange-600" />
                <span>{category.isActive ? "Vô hiệu hóa" : "Kích hoạt"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category.id)}
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
      data={categories}
      keyExtractor={(category) => category.id}
      emptyMessage="Không tìm thấy danh mục nào"
    />
  );
}

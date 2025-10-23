"use client";

import React from "react";
import { Eye, Pencil, Trash2, FolderOpen, MoreVertical } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { StatusBadge } from "@/components/atoms/StatusBadge";
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
}

export function CategoryTable({
  categories,
  onView,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const columns: Column<Category>[] = [
    {
      key: "categoryId",
      header: "ID",
      render: (category) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 font-mono truncate">{category.categoryId}</p>
        </div>
      ),
    },

        {
      key: "conferenceCategoryName",
      header: "Tên danh mục",
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 truncate">
              {category.conferenceCategoryName}
            </p>
          </div>
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
                onClick={() => onDelete(category.categoryId)}
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
      keyExtractor={(category) => category.categoryId}
      emptyMessage="Không tìm thấy danh mục nào"
    />
  );
}
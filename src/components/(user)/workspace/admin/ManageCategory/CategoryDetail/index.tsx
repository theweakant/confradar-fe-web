"use client";

import {
  FolderOpen,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Category } from "@/types/category.type";

interface CategoryDetailProps {
  category: Category;
  onClose: () => void;
}

export function CategoryDetail({ category, onClose }: CategoryDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {category.conferenceCategoryName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="Danh mục" variant="info" />
          </div>
        </div>
      </div>

      {/* Grid Info */}
      <div className="grid grid-cols-1 gap-6">
        {/* Category Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Tên danh mục</p>
              <p className="text-gray-900 leading-relaxed">{category.conferenceCategoryName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">ID</p>
              <p className="text-gray-600 text-sm font-mono">{category.categoryId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
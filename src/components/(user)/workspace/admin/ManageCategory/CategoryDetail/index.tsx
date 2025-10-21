"use client";

import {
  FolderOpen,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
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
                {category.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="Danh mục" variant="info" />
            <StatusBadge
              status={category.isActive ? "Đang hoạt động" : "Không hoạt động"}
              variant={category.isActive ? "success" : "danger"}
            />
          </div>
        </div>
      </div>

      {/* Grid Info */}
      <div className="grid grid-cols-1 gap-6">
        {/* Description */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Mô tả</p>
              <p className="text-gray-900 leading-relaxed">{category.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {category.isActive ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">Trạng thái</p>
              <p className={`font-medium ${category.isActive ? "text-green-600" : "text-red-600"}`}>
                {category.isActive ? "Đang hoạt động" : "Không hoạt động"}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Ngày tạo</p>
              <p className="text-gray-900">
                {formatDate(category.createdAt.toISOString())}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Cập nhật lần cuối</p>
              <p className="text-gray-900">
                {formatDate(category.updatedAt.toISOString())}
              </p>
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
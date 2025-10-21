"use client";

import { useState } from "react";
import { Plus, FolderOpen, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { SearchFilter } from "@/components/molecules/SearchFilter";
import { Modal } from "@/components/molecules/Modal";
import { CategoryDetail } from "@/components/(user)/workspace/admin/ManageCategory/CategoryDetail/index";
import { CategoryForm } from "@/components/(user)/workspace/admin/ManageCategory/CategoryForm/index";
import { CategoryTable } from "@/components/(user)/workspace/admin/ManageCategory/CategoryTable/index";

import { mockCategories } from "@/data/mockCategory.data";
import { Category, CreateCategoryDto } from "@/types/category.type";

export default function ManageCategory() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && category.isActive) ||
      (filterStatus === "inactive" && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleView = (category: Category) => {
    setViewingCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleSave = (data: CreateCategoryDto) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, ...data, updatedAt: new Date() }
            : c
        )
      );
      toast.success("Cập nhật danh mục thành công!");
    } else {
      const newCategory: Category = {
        ...data,
        id: `cat-${Date.now()}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Thêm danh mục mới thành công!");
    }
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: string) => {
    setDeleteCategoryId(id);
  };

  const confirmDelete = () => {
    if (deleteCategoryId) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryId));
      toast.success("Xóa danh mục thành công!");
      setDeleteCategoryId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isActive: !c.isActive, updatedAt: new Date() }
          : c
      )
    );
    toast.success("Cập nhật trạng thái thành công!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Danh mục
            </h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Thêm danh mục mới
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý các danh mục hội nghị trong hệ thống
          </p>
        </div>

        {/* Search & Filter */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm danh mục..."
          filters={[
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              options: statusOptions,
            },
          ]}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng danh mục</p>
                <p className="text-3xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
              <FolderOpen className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600">
                  {categories.filter((c) => c.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Không hoạt động</p>
                <p className="text-3xl font-bold text-red-600">
                  {categories.filter((c) => !c.isActive).length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <CategoryTable
            categories={filteredCategories}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      >
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingCategory(null);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingCategory(null);
        }}
        title="Chi tiết danh mục"
      >
        {viewingCategory && (
          <CategoryDetail
            category={viewingCategory}
            onClose={() => {
              setIsDetailModalOpen(false);
              setViewingCategory(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={() => setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
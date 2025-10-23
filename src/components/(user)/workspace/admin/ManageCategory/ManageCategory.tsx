"use client";

import { useState } from "react";
import { Plus, FolderOpen} from "lucide-react";
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

import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/services/category.service";

import type { Category, CategoryFormData } from "@/types/category.type";

export default function ManageCategory() {
  const { data: categoriesResponse, isLoading: categoriesLoading, refetch: refetchCategories } = useGetAllCategoriesQuery();
  
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories: Category[] = categoriesResponse?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
  ];

  const filteredCategories = categories.filter((category: Category) => {
    const matchesSearch =
      category.conferenceCategoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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

  const handleSave = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        const result = await updateCategory({
          id: editingCategory.categoryId,
          data,
        }).unwrap();
        toast.success(result.message || "Cập nhật danh mục thành công!");
      } else {
        const result = await createCategory(data).unwrap();
        toast.success(result.message || "Thêm danh mục mới thành công!");
      }
      
      setIsFormModalOpen(false);
      setEditingCategory(null);
      refetchCategories();
    } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra, vui lòng thử lại!";
        toast.error(message);
      }
  };

  const handleDelete = (id: string) => {
    setDeleteCategoryId(id);
  };

  const confirmDelete = async () => {
    if (deleteCategoryId) {
      try {
        const result = await deleteCategory(deleteCategoryId).unwrap();
        toast.success(result.message || "Xóa danh mục thành công!");
        setDeleteCategoryId(null);
        refetchCategories();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra, vui lòng thử lại!";
        toast.error(message);
      }
    }
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
              disabled={isCreating || isUpdating}
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
                  {categoriesLoading ? "..." : categories.length}
                </p>
              </div>
              <FolderOpen className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {categoriesLoading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <CategoryTable
              categories={filteredCategories}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
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
          isLoading={isCreating || isUpdating}
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
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
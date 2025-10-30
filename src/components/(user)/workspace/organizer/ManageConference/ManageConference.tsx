"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Plus, Calendar, Microscope, Cpu } from "lucide-react";
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

import { Modal } from "@/components/molecules/Modal";
import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";

import { ConferenceTable } from "@/components/(user)/workspace/organizer/ManageConference/ConferenceTable/index";
import { ConferenceFormData, ConferenceResponse } from "@/types/conference.type";
// import {ConferenceDetail} from "./ConferenceDetail/index"

import { ConferenceStepForm } from "@/components/(user)/workspace/organizer/ManageConference/ConferenceForm/TechForm";
import { ResearchConferenceStepForm } from "./ConferenceForm/ResearchForm/index";

import {
  useGetAllConferencesPaginationQuery,
  useDeleteConferenceMutation
} from "@/redux/services/conference.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service"; 

type ConferenceType = boolean | null;

export default function ManageConference() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const { data: conferencesData, isLoading, isError } = useGetAllConferencesPaginationQuery({
    page,
    pageSize,
  });
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const [deleteConferenceMutation, { isLoading: isDeleting }] = useDeleteConferenceMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<ConferenceResponse | null>(null);
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(null);
  const [selectedConferenceType, setSelectedConferenceType] = useState<ConferenceType>(null);

  // Tạo categoryOptions từ API data
  const categoryOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả danh mục" };
    
    if (!categoriesData?.data) {
      return [allOption];
    }

    const apiCategories = categoriesData.data.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName,
    }));

    return [allOption, ...apiCategories];
  }, [categoriesData]);

  // Get conferences from API with pagination
  const conferences = conferencesData?.data?.items || [];
  const totalPages = conferencesData?.data?.totalPages || 1;
  const totalItems = conferencesData?.data?.totalItems || 0;

  const filteredConferences = conferences.filter((conf) => {
    const matchesSearch = conf.conferenceName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === "all" || conf.conferenceCategoryId === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    setEditingConference(null);
    setSelectedConferenceType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (conference: ConferenceResponse) => {
    setEditingConference(conference);
    setSelectedConferenceType(conference.isResearchConference ?? false);
    setIsModalOpen(true);
  };

  const handleSave = (_data: ConferenceFormData) => {
    setIsModalOpen(false);
    setEditingConference(null);
    setSelectedConferenceType(null);
  };

const handleView = (conference: ConferenceResponse) => {
  toast.info("Chức năng xem chi tiết đang được phát triển");
};

  const confirmDelete = async () => {
    if (deleteConferenceId) {
      try {
        await deleteConferenceMutation(deleteConferenceId).unwrap();
        toast.success("Xóa hội thảo thành công!");
        setDeleteConferenceId(null);
      } catch (error) {
        toast.error("Xóa hội thảo thất bại. Vui lòng thử lại!");
        console.error("Delete error:", error);
      }
    }
  };

  const handleSelectConferenceType = (type: ConferenceType) => {
    setSelectedConferenceType(type);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setEditingConference(null);
    setSelectedConferenceType(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading || isCategoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải dữ liệu hội thảo</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Hội thảo</h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap mt-6"
            >
              <Plus className="w-5 h-5" />
              Thêm hội thảo
            </Button>
          </div>
          <p className="text-gray-600 mt-2">Quản lý thông tin các hội thảo trên ConfRadar</p>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm..."
          filters={[
            {
              value: filterCategory,
              onValueChange: setFilterCategory,
              options: categoryOptions,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng hội thảo"
            value={totalItems}
            icon={<Calendar className="w-10 h-10" />}
            color="blue"
          />
        </div>

        <div className="flex justify-end mb-4">
          <Link href="/workspace/organizer/manage-conference/pending-conference">
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1.5"
            >
              Xem hội nghị đang chờ duyệt
            </Button>
          </Link>
        </div>

        <ConferenceTable
          conferences={filteredConferences}
          onEdit={handleEdit}
          onView={handleView}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      {/* Modal for Creating/Editing Conference */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseEditModal}
        title={
          editingConference
            ? "Chỉnh sửa hội thảo"
            : selectedConferenceType !== null
            ? "Thêm hội thảo/ hội nghị mới"
            : "Chọn loại hội thảo"
        }
        size="lg"
      >
        {!editingConference && selectedConferenceType === null ? (
          // Conference Type Selection Screen
          <div className="py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Chọn loại hội thảo bạn muốn tạo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleSelectConferenceType(false)}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-4 transition-colors group-hover:bg-blue-500">
                    <Cpu className="h-10 w-10 text-blue-600 transition-colors group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Tech Conference</h4>
                    <p className="text-sm text-gray-600">
                      Hội thảo về công nghệ, lập trình, AI, và các chủ đề kỹ thuật
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectConferenceType(true)}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-green-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-green-100 p-4 transition-colors group-hover:bg-green-500">
                    <Microscope className="h-10 w-10 text-green-600 transition-colors group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Research Conference</h4>
                    <p className="text-sm text-gray-600">
                      Hội thảo nghiên cứu khoa học, học thuật và đổi mới
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : selectedConferenceType === false ? (
          <ConferenceStepForm
            conference={editingConference}
            onSave={handleSave}
            onCancel={handleCloseEditModal}
          />
        ) : selectedConferenceType === true ? (
          // Research Conference Form
          <ResearchConferenceStepForm
            conference={editingConference}
            onSave={handleSave}
            onCancel={handleCloseEditModal}
          />
        ) : null}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConferenceId} onOpenChange={() => setDeleteConferenceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hội thảo này? Hành động này không thể hoàn tác và sẽ xóa
              tất cả các đăng ký liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
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
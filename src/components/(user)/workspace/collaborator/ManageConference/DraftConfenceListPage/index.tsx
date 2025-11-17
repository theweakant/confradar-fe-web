"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
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

import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";

import { ConferenceTable } from "@/components/molecules/Conference/ConferenceTable";
import { Conference } from "@/types/conference.type";

// Import your RTK Query hooks
import { useGetTechConferencesForCollaboratorAndOrganizerQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

export default function DraftConferenceListPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(
    null,
  );
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  // Get statuses first to find Pending status ID
  const { data: statusesData, isLoading: statusesLoading } =
    useGetAllConferenceStatusesQuery();
  const statuses = statusesData?.data || [];

  // Find Pending status ID
  useEffect(() => {
    if (statuses.length > 0) {
      const pendingStatus = statuses.find(
        (status) =>
          status.conferenceStatusName?.toLowerCase() === "pending" ||
          status.conferenceStatusName?.toLowerCase() === "draft",
      );
      if (pendingStatus) {
        setPendingStatusId(pendingStatus.conferenceStatusId);
      }
    }
  }, [statuses]);

  // RTK Query hooks - automatically filter by Pending status
  const { data, isLoading, isFetching, error, refetch } =
    useGetTechConferencesForCollaboratorAndOrganizerQuery(
      {
        page,
        pageSize,
        ...(filterCategory !== "all" && {
          conferenceCategoryId: filterCategory,
        }),
        ...(pendingStatusId && { conferenceStatusId: pendingStatusId }),
        ...(searchQuery && { searchKeyword: searchQuery }),
        ...(filterCity !== "all" && { cityId: filterCity }),
      },
      {
        skip: !pendingStatusId, 
      },
    );

  const { data: citiesData, isLoading: citiesLoading } = useGetAllCitiesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery();

  const conferences = (data?.data?.items || []).slice().sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const totalConferences = data?.data?.totalCount || 0;
  const totalPages = data?.data?.totalPages || 1;

  const cities = citiesData?.data || [];
  const categories = categoriesData?.data || [];

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    ...categories.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName || "N/A",
    })),
  ];

  const cityOptions = [
    { value: "all", label: "Tất cả thành phố" },
    ...cities.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    })),
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterCity, filterCategory]);

  const handleView = (conference: Conference) => {
    // Navigate to update page instead of view detail
    router.push(
      `/workspace/collaborator/manage-conference/view-detail/${conference.conferenceId}`,
    );
  };

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const confirmDelete = async () => {
    if (deleteConferenceId) {
      try {
        toast.success("Xóa bản nháp thành công!");
        setDeleteConferenceId(null);
        refetch();
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa bản nháp!");
        console.error("Delete error:", error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/workspace/collaborator/manage-conference">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bản nháp Hội thảo
                </h1>
              </div>
              <p className="text-gray-600 ml-14">
                Quản lý các bản nháp hội thảo đang chờ hoàn thiện
              </p>
            </div>
          </div>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm bản nháp theo tên, mô tả, địa chỉ..."
          filters={[
            {
              value: filterCategory,
              onValueChange: setFilterCategory,
              options: categoryOptions,
            },
            {
              value: filterCity,
              onValueChange: setFilterCity,
              options: cityOptions,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng bản nháp"
            value={isLoading || statusesLoading ? "..." : totalConferences}
            icon={<Calendar className="w-10 h-10" />}
            color="orange"
          />
        </div>

        {isLoading || isFetching || statusesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Đang tải bản nháp...</span>
          </div>
        ) : conferences.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có bản nháp nào
            </h3>
            <p className="text-gray-600 mb-6">
              Các bản nháp hội thảo của bạn sẽ xuất hiện ở đây
            </p>
            <Link href="/workspace/collaborator/manage-conference/create-tech-conference">
              <Button>Tạo hội thảo mới</Button>
            </Link>
          </div>
        ) : (
          <>
            <ConferenceTable
              conferences={conferences}
              onView={handleView}
              onEdit={(conference) => {
                router.push(
                  `/workspace/collaborator/manage-conference/update-tech-conference/${conference.conferenceId}`,
                );
              }}
              onDelete={handleDelete}
              statuses={statuses}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </Button>

                <span className="px-4 py-2 text-sm text-gray-700">
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
          </>
        )}
      </div>

      <AlertDialog
        open={!!deleteConferenceId}
        onOpenChange={() => setDeleteConferenceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bản nháp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bản nháp này? Hành động này không thể
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

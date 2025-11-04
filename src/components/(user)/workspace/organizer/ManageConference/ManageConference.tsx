"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Plus, Calendar, Microscope, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Modal } from "@/components/molecules/Modal";
import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";

import { ConferenceTable } from "@/components/(user)/workspace/organizer/ManageConference/ConferenceTable/index";
import { ConferenceResponse } from "@/types/conference.type";

import {
  useGetAllConferencesPaginationQuery,
} from "@/redux/services/conference.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";

type ConferenceType = boolean | null;

export default function ManageConference() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [isSelectTypeModalOpen, setIsSelectTypeModalOpen] = useState(false);

  // RTK Query với filters
  const { data: conferencesData, isLoading, isError, refetch } = useGetAllConferencesPaginationQuery({
    page,
    pageSize,
    ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
    ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
    ...(filterCity !== "all" && { cityId: filterCity }),
    ...(searchQuery && { searchKeyword: searchQuery }),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: citiesData, isLoading: citiesLoading } = useGetAllCitiesQuery();
  const { data: statusesData, isLoading: statusesLoading } = useGetAllConferenceStatusesQuery();

  // Reset page về 1 khi filter thay đổi (debounce 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterCategory, filterStatus, filterCity]);

  // Get data từ API responses
  const conferences = conferencesData?.data?.items || [];
  const totalPages = conferencesData?.data?.totalPages || 1;
  const totalItems = conferencesData?.data?.totalItems || 0;

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  // Tạo filter options
  const categoryOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả danh mục" };
    
    const apiCategories = categories.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName || "N/A",
    }));

    return [allOption, ...apiCategories];
  }, [categories]);

  const statusOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả trạng thái" };
    
    const apiStatuses = statuses.map((status) => ({
      value: status.conferenceStatusId,
      label: status.conferenceStatusName || "N/A",
    }));

    return [allOption, ...apiStatuses];
  }, [statuses]);

  const cityOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả thành phố" };
    
    const apiCities = cities.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    }));

    return [allOption, ...apiCities];
  }, [cities]);

  const handleCreate = () => {
    setIsSelectTypeModalOpen(true);
  };

  const handleView = (conference: ConferenceResponse) => {
    if (conference.conferenceId) {
      router.push(`/workspace/organizer/manage-conference/view-detail/${conference.conferenceId}`);
    } else {
      toast.error("Không tìm thấy ID hội thảo");
    }
  };

  const handleSelectConferenceType = (type: ConferenceType) => {
    if (type === false) {
      // Tech Conference
      router.push('/workspace/organizer/manage-conference/create-tech-conference');
    } else if (type === true) {
      // Research Conference
      router.push('/workspace/organizer/manage-conference/create-research-conference');
    }
    setIsSelectTypeModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading || categoriesLoading || citiesLoading || statusesLoading) {
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
          searchPlaceholder="Tìm kiếm theo tên, mô tả, địa chỉ..."
          filters={[
            {
              value: filterCategory,
              onValueChange: setFilterCategory,
              options: categoryOptions,
            },
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              options: statusOptions,
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
            title="Tổng hội thảo"
            value={isLoading ? "..." : totalItems}
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
          conferences={conferences}
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

      {/* Modal for Selecting Conference Type */}
      <Modal
        isOpen={isSelectTypeModalOpen}
        onClose={() => setIsSelectTypeModalOpen(false)}
        title="Chọn loại hội thảo"
        size="lg"
      >
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
      </Modal>

    </div>
  );
}
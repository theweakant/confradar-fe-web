"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Cpu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";
import { ConferenceTable } from "@/components/molecules/Conference/ConferenceTable";
import { ConferenceResponse } from "@/types/conference.type";

import { useGetTechnicalConferencesByCollaboratorNoDraftQuery } from "@/redux/services/conference.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useAuth } from "@/redux/hooks/useAuth";

export default function ExternalConference() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.userId || null;

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  // ✅ Gọi API mới cho collaborator
  const {
    data: techConferencesData,
    isLoading: techLoading,
    isError: techError,
    refetch: refetchTech,
  } = useGetTechnicalConferencesByCollaboratorNoDraftQuery({
    page,
    pageSize,
    ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
    ...(filterCity !== "all" && { cityId: filterCity }),
    ...(searchQuery && { searchKeyword: searchQuery }),
    // ⚠️ KHÔNG truyền collaboratorId/organizationName (theo yêu cầu)
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: citiesData, isLoading: citiesLoading } = useGetAllCitiesQuery();
  const { data: statusesData, isLoading: statusesLoading } =
    useGetAllConferenceStatusesQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterCategory, filterStatus, filterCity]);

  // Filter external conferences (NOT created by current user)
  const externalConferences = useMemo(() => {
    if (!currentUserId) return [];
    
    const rawConferences = techConferencesData?.data?.items || [];
    return rawConferences.filter((conf) => conf.createdBy !== currentUserId);
  }, [techConferencesData, currentUserId]);

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  // Apply category filter
  const displayConferences = useMemo(() => {
    let result = [...externalConferences];

    if (filterCategory !== "all") {
      result = result.filter(conf => conf.conferenceCategoryId === filterCategory);
    }

    return result;
  }, [externalConferences, filterCategory]);

  const totalPages = techConferencesData?.data?.totalPages || 1;

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

  const handleView = (conference: ConferenceResponse) => {
    if (conference.conferenceId) {
      router.push(
        `/workspace/organizer/manage-conference/view-detail/${conference.conferenceId}`,
      );
    } else {
      toast.error("Không tìm thấy ID hội thảo");
    }
  };

  const handleEdit = (conference: ConferenceResponse) => {
    // Check if user has permission to edit
    if (conference.createdBy === currentUserId) {
      if (conference.conferenceId) {
        router.push(
          `/workspace/organizer/manage-conference/update-tech-conference/${conference.conferenceId}`,
        );
      } else {
        toast.error("Không tìm thấy ID hội thảo");
      }
    } else {
      toast.error("Bạn không có quyền chỉnh sửa hội thảo này");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (techLoading || categoriesLoading || citiesLoading || statusesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (techError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải dữ liệu hội thảo đối tác</p>
          <Button onClick={() => refetchTech()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hội nghị của Đối tác
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý các hội thảo công nghệ do Đối Tác tổ chức
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm hội thảo đối tác theo tên, mô tả, địa chỉ..."
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng hội nghị đối tác"
            value={techLoading ? "..." : displayConferences.length}
            icon={<Cpu className="w-10 h-10" />}
            color="blue"
          />
          <StatCard
            title="Đối tác hoạt động"
            value={techLoading ? "..." : new Set(externalConferences.map(c => c.createdBy)).size}
            icon={<Users className="w-10 h-10" />}
            color="green"
          />
        </div>

        {/* Info Banner */}
        {displayConferences.length === 0 && !techLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Chưa có hội nghị đối tác
                </h3>
                <p className="text-sm text-blue-700">
                  Các hội nghị công nghệ do đối tác tạo sẽ hiển thị ở đây. Bạn có thể xem chi tiết và theo dõi các hội nghị này.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conference Table */}
        <ConferenceTable
          conferences={displayConferences}
          onView={handleView}
          onEdit={handleEdit}
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
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Microscope,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Modal } from "@/components/molecules/Modal";
import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";

import { ConferenceTable } from "@/components/molecules/Conference/ConferenceTable";
import { ConferenceResponse } from "@/types/conference.type";

import {
  useGetTechnicalConferencesByOrganizerQuery, 
  useGetResearchConferencesForOrganizerQuery,
} from "@/redux/services/conference.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useAuth } from "@/redux/hooks/useAuth";

type ConferenceType = boolean | null;
type TabType = "my" | "research";

export default function ManageConference() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.userId || null;

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [activeTab, setActiveTab] = useState<TabType>("my");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [isSelectTypeModalOpen, setIsSelectTypeModalOpen] = useState(false);

  const {
    data: techConferencesData,
    isLoading: techLoading,
    isError: techError,
    refetch: refetchTech,
  } = useGetTechnicalConferencesByOrganizerQuery(
    {
      page,
      pageSize,
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(filterCity !== "all" && { cityId: filterCity }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      // ⚠️ Không cần truyền conferenceCategoryId vì endpoint hiện tại KHÔNG hỗ trợ (theo Swagger bạn gửi)
    },
    {
      skip: activeTab !== "my",
    },
  );

  const {
    data: researchConferencesData,
    isLoading: researchLoading,
    isError: researchError,
    refetch: refetchResearch,
  } = useGetResearchConferencesForOrganizerQuery(
    {
      page,
      pageSize,
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(filterCity !== "all" && { cityId: filterCity }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }), // research endpoint hỗ trợ category
    },
    {
      skip: activeTab !== "research",
    },
  );

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
  }, [searchQuery, filterCategory, filterStatus, filterCity, activeTab]);

  // ✅ Không cần filter client-side nữa — API đã trả đúng conferences của organizer
  const myConferences = useMemo(() => {
    if (activeTab === "my") {
      return techConferencesData?.data?.items || [];
    }
    return [];
  }, [techConferencesData, activeTab]);

  const researchConferences = useMemo(() => {
    if (activeTab === "research") {
      return researchConferencesData?.data?.items || [];
    }
    return [];
  }, [researchConferencesData, activeTab]);

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  // ✅ Cập nhật logic display: chỉ research tab mới filter theo category (nếu API hỗ trợ)
  const displayConferences = useMemo(() => {
    let conferences = activeTab === "my" ? myConferences : researchConferences;

    // Chỉ filter category ở tab research (nếu endpoint hỗ trợ)
    if (activeTab === "research" && filterCategory !== "all") {
      conferences = conferences.filter(
        (conf) => conf.conferenceCategoryId === filterCategory
      );
    }

    return conferences;
  }, [myConferences, researchConferences, activeTab, filterCategory]);

  const isLoading = activeTab === "my" ? techLoading : researchLoading;
  const isError = activeTab === "my" ? techError : researchError;
  const refetch = activeTab === "my" ? refetchTech : refetchResearch;

  const totalPages = activeTab === "my" 
    ? techConferencesData?.data?.totalPages || 1
    : researchConferencesData?.data?.totalPages || 1;

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
      router.push(
        `/workspace/organizer/manage-conference/view-detail/${conference.conferenceId}`,
      );
    } else {
      toast.error("Không tìm thấy ID");
    }
  };

  const handleEdit = (conference: ConferenceResponse) => {
    if (conference.conferenceId) {
      const route = conference.isResearchConference
        ? `/workspace/organizer/manage-conference/update-research-conference/${conference.conferenceId}`
        : `/workspace/organizer/manage-conference/update-tech-conference/${conference.conferenceId}`;
      router.push(route);
    } else {
      toast.error("Không tìm thấy ID");
    }
  };

  const handleSelectConferenceType = (type: ConferenceType) => {
    if (type === false) {
      router.push(
        "/workspace/organizer/manage-conference/create-tech-conference",
      );
    } else if (type === true) {
      router.push(
        "/workspace/organizer/manage-conference/create-research-conference",
      );
    }
    setIsSelectTypeModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

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

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải dữ liệu</p>
          <Button onClick={() => refetch && refetch()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý hội thảo & hội nghị - ConfRadar
            </h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap mt-6"
            >
              <Plus className="w-5 h-5" />
              Thêm mới
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý các hội thảo và hội nghị do bạn tổ chức trên ConfRadar
          </p>
        </div>

        {/* Tabs: My | Research */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => handleTabChange("my")}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                activeTab === "my"
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Technical</span>
              </div>
              {activeTab === "my" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>

            <button
              onClick={() => handleTabChange("research")}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                activeTab === "research"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Microscope className="w-4 h-4" />
                <span>Research</span>
              </div>
              {activeTab === "research" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
              )}
            </button>
          </div>
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
      <div className="my-4 flex justify-end">
      </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={
              activeTab === "my"
                ? "Tổng Techical Conference"
                : "Tổng Research Conference"
            }
            value={isLoading ? "..." : displayConferences.length}
            icon={
              activeTab === "my" ? (
                <User className="w-10 h-10" />
              ) : (
                <Microscope className="w-10 h-10" />
              )
            }
            color={activeTab === "my" ? "purple" : "green"}
          />
        </div>

        <ConferenceTable
          conferences={displayConferences}
          onView={handleView}
          onEdit={handleEdit}
          statuses={statuses}
          showCreatorAndOrg={false}
        />

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

      <Modal
        isOpen={isSelectTypeModalOpen}
        onClose={() => setIsSelectTypeModalOpen(false)}
        title="Chọn loại"
        size="lg"
      >
        <div className="py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Chọn loại hội thảo/ hội nghị bạn muốn tạo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleSelectConferenceType(false)}
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-blue-100 p-4 transition-colors group-hover:bg-blue-500">
                  <User className="h-10 w-10 text-blue-600 transition-colors group-hover:text-white" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Tech Conference
                  </h4>
                  <p className="text-sm text-gray-600">
                    Hội thảo về công nghệ và các chủ đề kĩ thuật
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
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Research Conference
                  </h4>
                  <p className="text-sm text-gray-600">
                    Hội nghị nghiên cứu khoa học, học thuật và đổi mới
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
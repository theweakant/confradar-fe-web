"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, Cpu, Microscope, Loader2 } from "lucide-react";


import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";
import { ConferenceTable } from "@/components/molecules/Conference/ConferenceTable";
import { Conference } from "@/types/conference.type";

import {
  useGetTechConferencesForCollaboratorAndOrganizerQuery,
  useGetResearchConferencesForOrganizerQuery,
} from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

type TabType = "tech" | "research";

export default function ManageConference() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("tech");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(null);

  // Tech Conferences Query
  const {
    data: techData,
    isLoading: techLoading,
    isFetching: techFetching,
    error: techError,
    refetch: refetchTech,
  } = useGetTechConferencesForCollaboratorAndOrganizerQuery(
    {
      page,
      pageSize,
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    },
    { skip: activeTab !== "tech" }
  );

  // Research Conferences Query
  const {
    data: researchData,
    isLoading: researchLoading,
    isFetching: researchFetching,
    error: researchError,
    refetch: refetchResearch,
  } = useGetResearchConferencesForOrganizerQuery(
    {
      page,
      pageSize,
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    },
    { skip: activeTab !== "research" }
  );

  // Metadata
  const { data: citiesData, isLoading: citiesLoading } = useGetAllCitiesQuery();
  const { data: statusesData, isLoading: statusesLoading } = useGetAllConferenceStatusesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  // Determine current data
  const currentData = activeTab === "tech" ? techData : researchData;
  const isLoading = activeTab === "tech" ? techLoading : researchLoading;
  const isFetching = activeTab === "tech" ? techFetching : researchFetching;
  const error = activeTab === "tech" ? techError : researchError;
  const refetch = activeTab === "tech" ? refetchTech : refetchResearch;

  const conferences = useMemo(() => {
    const items = currentData?.data?.items || [];
    return [...items].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [currentData]);

  const totalConferences = currentData?.data?.totalCount || 0;
  const totalPages = currentData?.data?.totalPages || 1;

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  const categoryOptions = useMemo(() => [
    { value: "all", label: "Tất cả danh mục" },
    ...categories.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName || "N/A",
    })),
  ], [categories]);

  const statusOptions = useMemo(() => [
    { value: "all", label: "Tất cả trạng thái" },
    ...statuses.map((status) => ({
      value: status.conferenceStatusId,
      label: status.conferenceStatusName || "N/A",
    })),
  ], [statuses]);

  const cityOptions = useMemo(() => [
    { value: "all", label: "Tất cả thành phố" },
    ...cities.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    })),
  ], [cities]);

  // Auto reset to page 1 on filter/tab change
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus, filterCity, filterCategory, activeTab]);

  const handleView = (conference: Conference) => {
    const baseUrl = "/workspace/organizer/manage-conference/my-conference/detail";
    router.push(`${baseUrl}/${conference.conferenceId}`);
  };

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={refetch}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const isMetadataLoading = citiesLoading || statusesLoading || categoriesLoading;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Hội thảo</h1>

              <div className="flex items-center gap-3">
                {activeTab === "tech" ? (
                  <Link href="/workspace/organizer/manage-conference/create-tech-conference">
                    <Button className="flex items-center gap-2 whitespace-nowrap">
                      <Plus className="w-5 h-5" />
                      Thêm Tech Conference
                    </Button>
                  </Link>
                ) : (
                  <Link href="/workspace/organizer/manage-conference/create-research-conference">
                    <Button className="flex items-center gap-2 whitespace-nowrap">
                      <Plus className="w-5 h-5" />
                      Thêm Research Conference
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              Quản lý thông tin các hội thảo trên ConfRadar
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => handleTabChange("tech")}
                className={`pb-3 px-2 font-medium text-sm relative ${
                  activeTab === "tech"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>Tech Conferences</span>
                </div>
                {activeTab === "tech" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => handleTabChange("research")}
                className={`pb-3 px-2 font-medium text-sm relative ${
                  activeTab === "research"
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Microscope className="w-4 h-4" />
                  <span>Research Conferences</span>
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
              { value: filterCategory, onValueChange: setFilterCategory, options: categoryOptions },
              { value: filterStatus, onValueChange: setFilterStatus, options: statusOptions },
              { value: filterCity, onValueChange: setFilterCity, options: cityOptions },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard
              title={`Tổng ${activeTab === "tech" ? "Tech" : "Research"} Conference`}
              value={isMetadataLoading || isLoading ? "..." : totalConferences}
              icon={activeTab === "tech" ? <Cpu className="w-10 h-10" /> : <Microscope className="w-10 h-10" />}
              color={activeTab === "tech" ? "blue" : "green"}
            />
          </div>

          {(isLoading || isFetching || isMetadataLoading) ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <ConferenceTable
                conferences={conferences}
                onView={handleView}
                onEdit={(conference) => {
                  console.log("Edit conference:", conference);
                }}
                onDelete={handleDelete}
                statuses={statuses}
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
      </div>
    </>
  );
}
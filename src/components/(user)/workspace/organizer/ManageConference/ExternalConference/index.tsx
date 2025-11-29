"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Cpu, Users, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { StatCard } from "@/components/molecules/StatCard";
import { ConferenceTable } from "@/components/molecules/Conference/ConferenceTable";
import { ConferenceResponse } from "@/types/conference.type";

import { useGetTechnicalConferencesByCollaboratorNoDraftQuery } from "@/redux/services/conference.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import {
  useLazyGetCollaboratorAccountsQuery,
  useLazyListOrganizationsQuery,
} from "@/redux/services/user.service";
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
  const [filterCollaborator, setFilterCollaborator] = useState("all");
  const [filterOrganization, setFilterOrganization] = useState("all");

  // Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Temporary filter state for modal
  const [tempFilterCategory, setTempFilterCategory] = useState("all");
  const [tempFilterStatus, setTempFilterStatus] = useState("all");
  const [tempFilterCity, setTempFilterCity] = useState("all");
  const [tempFilterCollaborator, setTempFilterCollaborator] = useState("all");
  const [tempFilterOrganization, setTempFilterOrganization] = useState("all");

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
    ...(filterCollaborator !== "all" && { collaboratorId: filterCollaborator }),
    ...(filterOrganization !== "all" && { organizationName: filterOrganization }),
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: citiesData, isLoading: citiesLoading } = useGetAllCitiesQuery();
  const { data: statusesData, isLoading: statusesLoading } =
    useGetAllConferenceStatusesQuery();
  const [fetchOrganizations, { data: organizationData, isLoading: orgLoading }] = useLazyListOrganizationsQuery();
  const [fetchCollaborators, { data: collaboratorData, isLoading: collabLoading }] = useLazyGetCollaboratorAccountsQuery();


  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    filterCategory,
    filterStatus,
    filterCity,
    filterCollaborator,
    filterOrganization,
  ]);

  const externalConferences = useMemo(() => {
    if (!currentUserId) return [];
    const rawConferences = techConferencesData?.data?.items || [];
    return rawConferences.filter((conf) => conf.createdBy !== currentUserId);
  }, [techConferencesData, currentUserId]);

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  const displayConferences = useMemo(() => {
    let result = [...externalConferences];
    if (filterCategory !== "all") {
      result = result.filter(
        (conf) => conf.conferenceCategoryId === filterCategory,
      );
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

  const collaboratorOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả đối tác" };
    const apiCollabs = collaboratorData?.data?.map((collab) => ({
      value: collab.userId,
      label: collab.fullName || collab.email,
    })) || [];
    return [allOption, ...apiCollabs];
  }, [collaboratorData]);

  const organizationOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả tổ chức" };
    const apiOrgs = (organizationData?.data || []).map((org, index) => ({
      value: org.organizationName?.trim() || `org-${index}`,
      label: org.organizationName || "Tên tổ chức không xác định",
    }));
    return [allOption, ...apiOrgs];
  }, [organizationData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCategory !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterCity !== "all") count++;
    if (filterCollaborator !== "all") count++;
    if (filterOrganization !== "all") count++;
    return count;
  }, [filterCategory, filterStatus, filterCity, filterCollaborator, filterOrganization]);

  const handleOpenFilterModal = () => {
    if (!collaboratorData) {
      fetchCollaborators();
    }
    if (!organizationData) {
      fetchOrganizations();
    }

    // Đặt lại temp filter
    setTempFilterCategory(filterCategory);
    setTempFilterStatus(filterStatus);
    setTempFilterCity(filterCity);
    setTempFilterCollaborator(filterCollaborator);
    setTempFilterOrganization(filterOrganization);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setFilterCategory(tempFilterCategory);
    setFilterStatus(tempFilterStatus);
    setFilterCity(tempFilterCity);
    setFilterCollaborator(tempFilterCollaborator);
    setFilterOrganization(tempFilterOrganization);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilterCategory("all");
    setTempFilterStatus("all");
    setTempFilterCity("all");
    setTempFilterCollaborator("all");
    setTempFilterOrganization("all");
  };

  const handleClearAllFilters = () => {
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterCity("all");
    setFilterCollaborator("all");
    setFilterOrganization("all");
  };

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

  const isLoading =
    techLoading ||
    categoriesLoading ||
    citiesLoading ||
    statusesLoading ||
    orgLoading ||
    collabLoading;

  if (isLoading) {
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
          <Button onClick={() => refetchTech()}>Thử lại</Button>
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
                Hội thảo của Đối tác
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý các hội thảo công nghệ do Đối Tác tổ chức
              </p>
            </div>
          </div>
        </div>

        {/* Compact Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm hội thảo đối tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleOpenFilterModal}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-blue-600 text-white px-2 py-0.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearAllFilters}
                  title="Xóa tất cả bộ lọc"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {filterCollaborator !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Đối tác: {collaboratorOptions.find(o => o.value === filterCollaborator)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterCollaborator("all")}
                  />
                </Badge>
              )}
              {filterOrganization !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Tổ chức: {filterOrganization}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterOrganization("all")}
                  />
                </Badge>
              )}
              {filterCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Danh mục: {categoryOptions.find(o => o.value === filterCategory)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterCategory("all")}
                  />
                </Badge>
              )}
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Trạng thái: {statusOptions.find(o => o.value === filterStatus)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterStatus("all")}
                  />
                </Badge>
              )}
              {filterCity !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Thành phố: {cityOptions.find(o => o.value === filterCity)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterCity("all")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Filter Modal */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bộ lọc tìm kiếm</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Collaborator Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Đối tác
                </label>
                <Select
                  value={tempFilterCollaborator}
                  onValueChange={setTempFilterCollaborator}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đối tác" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaboratorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Organization Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tổ chức
                </label>
                <Select
                  value={tempFilterOrganization}
                  onValueChange={setTempFilterOrganization}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tổ chức" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Danh mục
                </label>
                <Select
                  value={tempFilterCategory}
                  onValueChange={setTempFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Trạng thái
                </label>
                <Select
                  value={tempFilterStatus}
                  onValueChange={setTempFilterStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Thành phố
                </label>
                <Select
                  value={tempFilterCity}
                  onValueChange={setTempFilterCity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleResetFilters}>
                Đặt lại
              </Button>
              <Button onClick={handleApplyFilters}>
                Áp dụng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng hội thảo đối tác"
            value={displayConferences.length}
            icon={<Cpu className="w-10 h-10" />}
            color="blue"
          />
          <StatCard
            title="Đối tác hoạt động"
            value={new Set(externalConferences.map((c) => c.createdBy)).size}
            icon={<Users className="w-10 h-10" />}
            color="green"
          />
        </div>

        {/* Info Banner */}
        {displayConferences.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Chưa có hội thảo đối tác
                </h3>
                <p className="text-sm text-blue-700">
                  Các hội thảo công nghệ do đối tác tạo sẽ hiển thị ở đây. Bạn có thể xem chi tiết và theo dõi các hội thảo này.
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
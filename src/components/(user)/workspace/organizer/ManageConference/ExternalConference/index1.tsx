"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu,
  Users,
  Filter,
  X,
  Search,
  Calendar,
  MapPin,
  Tag,
  Clock,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { StatCard } from "@/components/molecules/StatCard";
import { ConferenceTable } from "@/components/molecules/Conference/ConferenceTable";

import { ConferenceResponse } from "@/types/conference.type";
import { ApiError } from "@/types/api.type";

import { useAuth } from "@/redux/hooks/useAuth";
import {
  useGetTechnicalConferencesByCollaboratorNoDraftQuery,
  useLazyGetPendingConferencesQuery,
  useApproveConferenceMutation,
} from "@/redux/services/conference.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import {
  useLazyGetCollaboratorAccountsQuery,
  useLazyListOrganizationsQuery,
} from "@/redux/services/user.service";

export default function ExternalConference() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.userId || null;

  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");

  const [pageApproved, setPageApproved] = useState(1);
  const [pageSizeApproved] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCollaborator, setFilterCollaborator] = useState("all");
  const [filterOrganization, setFilterOrganization] = useState("all");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilterCategory, setTempFilterCategory] = useState("all");
  const [tempFilterStatus, setTempFilterStatus] = useState("all");
  const [tempFilterCity, setTempFilterCity] = useState("all");
  const [tempFilterCollaborator, setTempFilterCollaborator] = useState("all");
  const [tempFilterOrganization, setTempFilterOrganization] = useState("all");

  const {
     data: techConferencesData,
    isLoading: techLoading,
    isError: techError,
    refetch: refetchApproved,
  } = useGetTechnicalConferencesByCollaboratorNoDraftQuery(
    {
      page: pageApproved,
      pageSize: pageSizeApproved,
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(filterCity !== "all" && { cityId: filterCity }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCollaborator !== "all" && { collaboratorId: filterCollaborator }),
      ...(filterOrganization !== "all" && { organizationName: filterOrganization }),
    },
    { skip: activeTab !== "approved" }
  );

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const [fetchOrganizations, { data: organizationData }] = useLazyListOrganizationsQuery();
  const [fetchCollaborators, { data: collaboratorData }] = useLazyGetCollaboratorAccountsQuery();

  const externalConferences = useMemo(() => {
    if (!currentUserId) return [];
    return (techConferencesData?.data?.items || []).filter(
      (conf) => conf.createdBy !== currentUserId
    );
  }, [techConferencesData, currentUserId]);

  const displayConferences = useMemo(() => {
    let result = [...externalConferences];
    if (filterCategory !== "all") {
      result = result.filter((conf) => conf.conferenceCategoryId === filterCategory);
    }
    return result;
  }, [externalConferences, filterCategory]);

  const totalPagesApproved = techConferencesData?.data?.totalPages || 1;

  const categoryOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả danh mục" };
    const apiCategories = (categoriesData?.data || []).map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName || "N/A",
    }));
    return [allOption, ...apiCategories];
  }, [categoriesData]);

  const statusOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả trạng thái" };
    const apiStatuses = (statusesData?.data || []).map((status) => ({
      value: status.conferenceStatusId,
      label: status.conferenceStatusName || "N/A",
    }));
    return [allOption, ...apiStatuses];
  }, [statusesData]);

  const cityOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả thành phố" };
    const apiCities = (citiesData?.data || []).map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    }));
    return [allOption, ...apiCities];
  }, [citiesData]);

  const collaboratorOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả đối tác" };
    const apiCollabs = (collaboratorData?.data || []).map((collab) => ({
      value: collab.userId,
      label: collab.fullName || collab.email,
    }));
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

  const [pagePending, setPagePending] = useState(1);
  const [pageSizePending] = useState(10);

  const [getPendingConferences, { data: pendingData, isLoading: pendingLoading, isFetching: pendingFetching }] =
    useLazyGetPendingConferencesQuery();

  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [isApproveAction, setIsApproveAction] = useState<boolean>(true);
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approveConference, { isLoading: isSubmitting }] = useApproveConferenceMutation();

  const pendingConferences = pendingData?.data?.items || [];
  const totalPagesPending = pendingData?.data?.totalPages || 1;

  useEffect(() => {
    if (activeTab === "pending") {
      getPendingConferences({ page: pagePending, pageSize: pageSizePending });
    }
  }, [activeTab, pagePending, pageSizePending, getPendingConferences]);

  useEffect(() => {
    if (isFilterModalOpen && !collaboratorData) fetchCollaborators();
    if (isFilterModalOpen && !organizationData) fetchOrganizations();
  }, [isFilterModalOpen, collaboratorData, organizationData, fetchCollaborators, fetchOrganizations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageApproved(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterCategory, filterStatus, filterCity, filterCollaborator, filterOrganization]);

  const handleTabChange = (tab: "approved" | "pending") => {
    setActiveTab(tab);
    if (tab === "approved") {
      setPageApproved(1);
    } else {
      setPagePending(1);
    }
  };

  const handleOpenFilterModal = () => {
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
      router.push(`/workspace/organizer/manage-conference/view-detail/${conference.conferenceId}`);
    }
  };

  const handleEdit = (conference: ConferenceResponse) => {
    if (conference.createdBy === currentUserId && conference.conferenceId) {
      router.push(`/workspace/organizer/manage-conference/update-tech-conference/${conference.conferenceId}`);
    } else {
      toast.error("Bạn không có quyền chỉnh sửa hội thảo này");
    }
  };

  const handleConferenceClick = (conferenceId: string) => {
    router.push(`/workspace/organizer/manage-conference/view-pending-detail/${conferenceId}`);
  };

  const handleOpenDialog = (conferenceId: string, approve: boolean) => {
    setSelectedConference(conferenceId);
    setIsApproveAction(approve);
    setReason("");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedConference || !reason.trim()) {
      toast.error("Vui lòng nhập lý do!");
      return;
    }

    try {
      await approveConference({
        conferenceId: selectedConference,
        reason: reason.trim(),
        isApprove: isApproveAction,
      }).unwrap();

      toast.success(isApproveAction ? "Đã phê duyệt hội thảo thành công!" : "Đã từ chối hội thảo!");

      getPendingConferences({ page: pagePending, pageSize: pageSizePending });
      setDialogOpen(false);
      setSelectedConference(null);
      setReason("");
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err?.message || "Có lỗi xảy ra, hãy thử lại!");
    }
  };

  const isLoadingApproved =
    techLoading ||
    !categoriesData ||
    !citiesData ||
    !statusesData ||
    (isFilterModalOpen && (!collaboratorData || !organizationData));

  if (activeTab === "approved" && techError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải hội thảo đã duyệt</p>
          <Button onClick={() => refetchApproved()}>Thử lại</Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Hội thảo của Đối tác</h1>
              <p className="text-gray-600 mt-1">
                {activeTab === "approved"
                  ? "Những hội thảo đã được ConfRadar duyệt cho bên phía đối tác liên kết"
                  : "Những hội thảo đang chờ ConfRadar duyệt"}
              </p>
            </div>
            {activeTab === "pending" && (
              <Link href="/workspace/organizer/manage-conference" passHref>
                <Button variant="ghost" className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
            )}
          </div>

          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mt-4">
            <button
              onClick={() => handleTabChange("approved")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "approved"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Đã được duyệt
            </button>
            <button
              onClick={() => handleTabChange("pending")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "pending"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Đang chờ duyệt
            </button>
          </div>
        </div>

        {activeTab === "approved" ? (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleOpenFilterModal} className="relative">
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

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                  {filterCollaborator !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Đối tác: {collaboratorOptions.find(o => o.value === filterCollaborator)?.label}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterCollaborator("all")} />
                    </Badge>
                  )}
                  {filterOrganization !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Tổ chức: {filterOrganization}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterOrganization("all")} />
                    </Badge>
                  )}
                  {filterCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Danh mục: {categoryOptions.find(o => o.value === filterCategory)?.label}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterCategory("all")} />
                    </Badge>
                  )}
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Trạng thái: {statusOptions.find(o => o.value === filterStatus)?.label}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterStatus("all")} />
                    </Badge>
                  )}
                  {filterCity !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Thành phố: {cityOptions.find(o => o.value === filterCity)?.label}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterCity("all")} />
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
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Đối tác</label>
                    <Select value={tempFilterCollaborator} onValueChange={setTempFilterCollaborator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đối tác" />
                      </SelectTrigger>
                      <SelectContent>
                        {collaboratorOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tổ chức</label>
                    <Select value={tempFilterOrganization} onValueChange={setTempFilterOrganization}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tổ chức" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</label>
                    <Select value={tempFilterCategory} onValueChange={setTempFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái</label>
                    <Select value={tempFilterStatus} onValueChange={setTempFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Thành phố</label>
                    <Select value={tempFilterCity} onValueChange={setTempFilterCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {cityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
                  <Button onClick={handleApplyFilters}>Áp dụng</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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

            {isLoadingApproved ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : displayConferences.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Chưa có hội thảo đối tác</h3>
                    <p className="text-sm text-blue-700">
                      Các hội thảo công nghệ do đối tác tạo sẽ hiển thị ở đây.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ConferenceTable conferences={displayConferences} onView={handleView} onEdit={handleEdit} statuses={statusesData?.data || []} />
                {totalPagesApproved > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPageApproved((p) => Math.max(1, p - 1))}
                      disabled={pageApproved === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-gray-600">
                      Trang {pageApproved} / {totalPagesApproved}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPageApproved((p) => Math.min(totalPagesApproved, p + 1))}
                      disabled={pageApproved === totalPagesApproved}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {pendingLoading || pendingFetching ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải...</p>
              </div>
            ) : pendingConferences.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có hội thảo chờ duyệt</h3>
                <p className="text-gray-600">Hiện tại không có hội thảo nào đang chờ phê duyệt</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {pendingConferences.map((conference) => (
                    <div
                      key={conference.conferenceId}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleConferenceClick(conference.conferenceId)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {conference.conferenceName}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">{conference.description}</p>
                        </div>
                        {conference.bannerImageUrl && (
                          <img
                            src={conference.bannerImageUrl}
                            alt={conference.conferenceName || "banner"}
                            className="w-28 h-16 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Người tạo: {conference.createdBy ?? "N/A"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag className="w-4 h-4 mr-2" />
                          <span>Danh mục: {conference.conferenceCategoryId ?? "N/A"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{conference.address ?? "N/A"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {conference.startDate
                              ? new Date(conference.startDate).toLocaleDateString("vi-VN")
                              : "N/A"}{" "}
                            -{" "}
                            {conference.endDate
                              ? new Date(conference.endDate).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            Số người tham dự: {conference.totalSlot ?? "N/A"} người
                            {conference.availableSlot != null && (
                              <span className="ml-2 text-xs text-gray-500">(Còn: {conference.availableSlot})</span>
                            )}
                          </span>
                        </div>
                        {conference.createdAt && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              Nộp ngày: {new Date(conference.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Chờ phê duyệt
                        </span>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(conference.conferenceId, false);
                            }}
                            disabled={isSubmitting}
                          >
                            Từ chối
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(conference.conferenceId, true);
                            }}
                            disabled={isSubmitting}
                          >
                            Phê duyệt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPagesPending > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPagePending((p) => Math.max(1, p - 1))}
                      disabled={pagePending === 1 || pendingFetching}
                    >
                      Trang trước
                    </Button>
                    <span className="text-sm text-gray-600">
                      Trang {pagePending} / {totalPagesPending}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPagePending((p) => Math.min(totalPagesPending, p + 1))}
                      disabled={pagePending === totalPagesPending || pendingFetching}
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isApproveAction ? "Phê duyệt hội thảo" : "Từ chối hội thảo"}
              </DialogTitle>
              <DialogDescription>
                {isApproveAction
                  ? "Vui lòng nhập lý do phê duyệt hội thảo này."
                  : "Vui lòng nhập lý do từ chối hội thảo này."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">
                  Lý do {isApproveAction ? "phê duyệt" : "từ chối"}
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedConference(null);
                  setReason("");
                }}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !reason.trim()}
                className={isApproveAction ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
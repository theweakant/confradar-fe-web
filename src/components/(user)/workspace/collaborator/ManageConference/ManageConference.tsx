"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  Search,
  Eye,
  Loader2,
  Users,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import NextImage from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useAuth } from "@/redux/hooks/useAuth"; 
import { useGetTechnicalConferencesByCollaboratorNoDraftQuery } from "@/redux/services/conference.service";
import { useGetTechnicalConferencesByCollaboratorOnlyDraftQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

import type { Conference } from "@/types/conference.type";

export default function ConferenceManagementTabs() {
  const router = useRouter();
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState<"conferences" | "drafts">("conferences");

  // Shared states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  
  // Sort and date filters
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Conferences only
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Drafts only
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  // More filters popover state
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Load static data (always needed)
  const { data: citiesData } = useGetAllCitiesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  // Find draft status ID
  useEffect(() => {
    if (statuses.length > 0) {
      const draftStatus = statuses.find(
        (status) => status.conferenceStatusName?.toLowerCase() === "draft"
      );
      if (draftStatus) {
        setPendingStatusId(draftStatus.conferenceStatusId);
      }
    }
  }, [statuses]);

  // API calls
  const {
    data: conferencesData,
    isLoading: conferencesLoading,
    isFetching: conferencesFetching,
    error: conferencesError,
    refetch: refetchConferences,
  } = useGetTechnicalConferencesByCollaboratorNoDraftQuery(
    {
      page,
      pageSize,
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    },
    {
      skip: activeTab !== "conferences",
    }
  );

  const {
    data: draftsData,
    isLoading: draftsLoading,
    isFetching: draftsFetching,
    error: draftsError,
    refetch: refetchDrafts,
  } = useGetTechnicalConferencesByCollaboratorOnlyDraftQuery(
    {
      page,
      pageSize,
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(pendingStatusId && { conferenceStatusId: pendingStatusId }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    },
    {
      skip: activeTab !== "drafts" || !pendingStatusId,
    }
  );

  // Get current data based on active tab
  const currentData = activeTab === "conferences" ? conferencesData : draftsData;
  
  // Apply sorting and date filtering
  const conferences = (currentData?.data?.items || [])
    .slice()
    .filter((conf) => {
      // Date range filter
      if (dateFrom && conf.startDate) {
        const confDate = new Date(conf.startDate);
        const fromDate = new Date(dateFrom);
        if (confDate < fromDate) return false;
      }
      if (dateTo && conf.startDate) {
        const confDate = new Date(conf.startDate);
        const toDate = new Date(dateTo);
        if (confDate > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  const totalConferences = currentData?.data?.totalCount || 0;
  const totalPages = currentData?.data?.totalPages || 1;

  const isLoading = activeTab === "conferences" ? conferencesLoading : draftsLoading;
  const isFetching = activeTab === "conferences" ? conferencesFetching : draftsFetching;
  const error = activeTab === "conferences" ? conferencesError : draftsError;

  // Options for filters
  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    ...categories.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName || "N/A",
    })),
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...statuses.map((status) => ({
      value: status.conferenceStatusId,
      label: status.conferenceStatusName || "N/A",
    })),
  ];

  const cityOptions = [
    { value: "all", label: "Tất cả thành phố" },
    ...cities.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    })),
  ];

  // Reset page when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus, filterCity, filterCategory, dateFrom, dateTo, sortBy]);

  // Reset filters when switching tabs
  const handleTabChange = (tab: "conferences" | "drafts") => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
    setFilterCategory("all");
    setFilterCity("all");
    setSortBy("newest");
    setDateFrom("");
    setDateTo("");
    if (tab === "conferences") {
      setFilterStatus("all");
    }
  };

  // Clear all filters in More Filters
  const handleClearFilters = () => {
    setFilterCategory("all");
    setFilterCity("all");
    if (activeTab === "conferences") {
      setFilterStatus("all");
    }
    setMoreFiltersOpen(false);
  };

  // Handlers
  const handleView = (conference: Conference) => {
    router.push(
      `/workspace/collaborator/manage-conference/view-detail/${conference.conferenceId}`
    );
  };

  const handleEdit = (conference: Conference) => {
    if (activeTab === "drafts") {
      router.push(
        `/workspace/collaborator/manage-conference/update-tech-conference/${conference.conferenceId}`
      );
    } else {
      router.push(
        `/workspace/collaborator/manage-conference/view-detail/${conference.conferenceId}`
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const confirmDelete = async () => {
    if (deleteConferenceId) {
      try {
        // TODO: Implement delete API call
        // await deleteConference(deleteConferenceId).unwrap();
        toast.success("Xóa bản nháp thành công!");
        setDeleteConferenceId(null);
        refetchDrafts();
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa bản nháp!");
        console.error("Delete error:", error);
      }
    }
  };

  const getStatusClass = (statusName: string): string => {
    switch (statusName?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "preparing":
        return "bg-blue-100 text-blue-700";
      case "ready":
        return "bg-teal-100 text-teal-700";
      case "completed":
        return "bg-green-600 text-white font-semibold";
      case "onhold":
        return "bg-orange-100 text-orange-700";
      case "cancelled":
        return "bg-gray-200 text-gray-700";
      case "deleted":
        return "bg-red-600 text-white font-semibold";
      case "draft":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => activeTab === "conferences" ? refetchConferences() : refetchDrafts()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Chào, {user?.email || "Đối tác"}!
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin các hội thảo công nghệ của bạn trên ConfRadar
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabChange("conferences")}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all relative ${
                  activeTab === "conferences"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="px-3 py-1 rounded-full text-lg font-bold text-blue-700">
                  {conferencesData?.data?.totalCount || 0}
                </span>
                <span>Tổng hội thảo </span>
                {activeTab === "conferences" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>

              <button
                onClick={() => handleTabChange("drafts")}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all relative ${
                  activeTab === "drafts"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="px-3 py-1 rounded-full text-lg font-bold text-orange-700">
                  {draftsData?.data?.totalCount || 0}
                </span>
                <span>Bản nháp</span>
                {activeTab === "drafts" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                )}
              </button>
            </div>

            {/* New Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-3 items-end">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Sort By */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
                  <SelectTrigger className="w-[140px] h-10">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                  </SelectContent>
                </Select>
                {/* More Filters */}
                <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 h-10">
                      <SlidersHorizontal className="w-4 h-4" />
                      Lọc thêm
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Bộ lọc</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-xs"
                        >
                          Xóa tất cả
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Category Filter */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Danh mục
                          </label>
                          <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full h-10">
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

                        {/* Status Filter (only for conferences) */}
                        {activeTab === "conferences" && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Trạng thái
                            </label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                              <SelectTrigger className="w-full h-10">
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
                        )}

                        {/* City Filter */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Thành phố
                          </label>
                          <Select value={filterCity} onValueChange={setFilterCity}>
                            <SelectTrigger className="w-full h-10">
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

                        {/* Date Range Filter - Popover inside Popover */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Khoảng ngày
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-10"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateFrom || dateTo ? (
                                  `${dateFrom ? new Date(dateFrom).toLocaleDateString("vi-VN") : "Chưa chọn"} - ${dateTo ? new Date(dateTo).toLocaleDateString("vi-VN") : "Chưa chọn"}`
                                ) : (
                                  <span>Chọn khoảng ngày</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="start">
                              <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Từ:</span>
                                  <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Đến:</span>
                                  <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                                <div className="flex justify-end pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setDateFrom("");
                                      setDateTo("");
                                    }}
                                    className="mr-2"
                                  >
                                    Xóa
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => setMoreFiltersOpen(false)}
                                  >
                                    Áp dụng
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <Button
                        onClick={() => setMoreFiltersOpen(false)}
                        className="w-full"
                        size="sm"
                      >
                        Áp dụng
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {activeTab === "conferences" ? "Tổng hội thảo" : "Tổng bản nháp"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? "..." : totalConferences}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === "conferences"}`}>
                  {activeTab === "conferences" ? (
                    <Calendar className="w-6 h-6 text-blue-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-orange-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sắp diễn ra</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {conferences.filter((c) => c.startDate && new Date(c.startDate) > new Date()).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : conferences.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              {activeTab === "conferences" ? (
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              ) : (
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "conferences" ? "Không có hội thảo nào" : "Không có bản nháp nào"}
              </h3>
              <p className="text-gray-600">
                {activeTab === "conferences"
                  ? "Các hội thảo đã xuất bản sẽ xuất hiện ở đây"
                  : "Các bản nháp hội thảo của bạn sẽ xuất hiện ở đây"}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Ảnh
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tên hội thảo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Người tạo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Bắt đầu sự kiện
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tổng chỗ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {conferences.map((conference) => {
                        const status = statuses.find(
                          (s) => s.conferenceStatusId === conference.conferenceStatusId
                        );
                        const statusName = status?.conferenceStatusName || "Không xác định";

                        return (
                          <tr key={conference.conferenceId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                {conference.bannerImageUrl ? (
                                  <NextImage
                                    src={conference.bannerImageUrl}
                                    alt={conference.conferenceName || ""}
                                    width={64}
                                    height={48}
                                    className="object-cover w-full h-full"
                                    unoptimized
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900 max-w-xs truncate">
                                {conference.conferenceName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {categories.find((c) => c.conferenceCategoryId === conference.conferenceCategoryId)
                                  ?.conferenceCategoryName || "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{conference.userNameCreator || "—"}</p>
                              <p className="text-sm text-gray-500">{conference.organization || "—"}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm whitespace-nowrap">
                                  {conference.startDate
                                    ? new Date(conference.startDate).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {conference.totalSlot || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(statusName)}`}>
                                {statusName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleView(conference)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Chi tiết</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {Math.min((page - 1) * pageSize + 1, totalConferences)}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(page * pageSize, totalConferences)}
                      </span>{" "}
                      của{" "}
                      <span className="font-medium">{totalConferences}</span> kết quả
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                      >
                        Trước
                      </Button>
                      <span className="text-sm text-gray-600 min-w-[60px] text-center">
                        Trang {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                      >
                        Tiếp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
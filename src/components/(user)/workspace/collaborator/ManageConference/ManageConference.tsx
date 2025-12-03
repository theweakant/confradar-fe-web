"use client";

import { useState, useEffect, useMemo } from "react";
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
  Clock,
  Play,
  CheckCircle2,
  XCircle, // ← icon mới cho "rejected"
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

// ← Thêm "rejected" vào kiểu
type TabType = "pending" | "ongoing" | "completed" | "draft" | "rejected";

const STATUS_GROUP_SETS = {
  pending: new Set(["pending"]),
  ongoing: new Set(["preparing", "ready", "onhold"]),
  completed: new Set(["completed", "cancelled"]),
  rejected: new Set(["rejected"]), // ← nhóm trạng thái mới
} as const;

const getStatusGroup = (statusName: string): TabType | null => {
  const lower = statusName.toLowerCase();
  if (STATUS_GROUP_SETS.pending.has(lower)) return "pending";
  if (STATUS_GROUP_SETS.ongoing.has(lower)) return "ongoing";
  if (STATUS_GROUP_SETS.completed.has(lower)) return "completed";
  if (STATUS_GROUP_SETS.rejected.has(lower)) return "rejected"; // ← xử lý mới
  return null;
};

export default function ConferenceManagementTabs() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const { data: citiesData } = useGetAllCitiesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  const statusMap = useMemo(() => {
    const map = new Map<string, string>();
    statuses.forEach((s) => {
      map.set(s.conferenceStatusId, (s.conferenceStatusName || "").toLowerCase());
    });
    return map;
  }, [statuses]);

  const {
    data: nonDraftData,
    isLoading: nonDraftLoading,
    isFetching: nonDraftFetching,
    error: nonDraftError,
    refetch: refetchNonDraft,
  } = useGetTechnicalConferencesByCollaboratorNoDraftQuery(
    {
      page,
      pageSize,
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    },
    {
      skip: activeTab === "draft",
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
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    },
    {
      skip: activeTab !== "draft",
    }
  );

  const nonDraftItems = nonDraftData?.data?.items || [];
  const draftItems = draftsData?.data?.items || [];

  const filteredNonDraftItems = useMemo(() => {
    return nonDraftItems.filter((conf) => {
      if (!conf.conferenceStatusId) return false;
      const statusName = statusMap.get(conf.conferenceStatusId) || "";
      return getStatusGroup(statusName) === activeTab;
    });
  }, [nonDraftItems, activeTab, statusMap]);

  const finalConferences = useMemo(() => {
    const source = activeTab === "draft" ? draftItems : filteredNonDraftItems;
    return source
      .filter((conf) => {
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
  }, [activeTab, draftItems, filteredNonDraftItems, dateFrom, dateTo, sortBy]);

  const totalItems = activeTab === "draft"
    ? draftsData?.data?.totalCount || 0
    : filteredNonDraftItems.length;

  const isLoading = activeTab === "draft" ? draftsLoading : nonDraftLoading;
  const isFetching = activeTab === "draft" ? draftsFetching : nonDraftFetching;
  const error = activeTab === "draft" ? draftsError : nonDraftError;
  const refetch = activeTab === "draft" ? refetchDrafts : refetchNonDraft;

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
    const timer = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterCategory, filterCity, dateFrom, dateTo, sortBy]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterCategory("all");
    setFilterCity("all");
    setDateFrom("");
    setDateTo("");
    setMoreFiltersOpen(false);
  };

  const handleView = (conference: Conference) => {
    router.push(
      `/workspace/collaborator/manage-conference/view-detail/${conference.conferenceId}`
    );
  };

  const getStatusClass = (statusName: string): string => {
    const lower = statusName.toLowerCase();
    if (lower === "pending") return "bg-yellow-100 text-yellow-800";
    if (["preparing", "ready", "onhold"].includes(lower)) return "bg-blue-100 text-blue-700";
    if (lower === "completed") return "bg-green-600 text-white font-semibold";
    if (lower === "cancelled") return "bg-red-600 text-white font-semibold";
    if (lower === "draft") return "bg-orange-100 text-orange-700";
    if (lower === "rejected") return "bg-red-100 text-red-800"; // ← style mới
    return "bg-gray-100 text-gray-700";
  };

  const tabConfig: Record<TabType, { label: string; icon: React.ReactNode }> = {
    pending: { label: "Chờ duyệt", icon: <Clock className="w-5 h-5" /> },
    ongoing: { label: "Đang diễn ra", icon: <Play className="w-5 h-5" /> },
    completed: { label: "Đã kết thúc", icon: <CheckCircle2 className="w-5 h-5" /> },
    draft: { label: "Bản nháp", icon: <FileText className="w-5 h-5" /> },
    rejected: { label: "Bị từ chối", icon: <XCircle className="w-5 h-5" /> }, // ← tab mới
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chào, {user?.email || "Đối tác"}!
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin các hội thảo công nghệ của bạn trên ConfRadar
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {/* ← Thêm "rejected" vào danh sách tab */}
            {(["pending", "ongoing", "completed", "rejected", "draft"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const count = tab === "draft"
                ? draftsData?.data?.totalCount || 0
                : nonDraftItems.filter((conf) => {
                    if (!conf.conferenceStatusId) return false;
                    const statusName = statusMap.get(conf.conferenceStatusId) || "";
                    return getStatusGroup(statusName) === tab;
                  }).length;

              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center gap-3 px-6 py-4 font-medium transition-all relative ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="px-3 py-1 rounded-full text-lg font-bold text-blue-700">
                    {count}
                  </span>
                  <span>{tabConfig[tab].label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-4">
            <p className="text-gray-600 text-sm">
              {activeTab === "pending" && "Các hội thảo đang chờ Ban tổ chức duyệt."}
              {activeTab === "ongoing" && "Các hội thảo đang trong giai đoạn chuẩn bị hoặc diễn ra."}
              {activeTab === "completed" && "Các hội thảo đã hoàn thành hoặc bị huỷ."}
              {activeTab === "draft" && "Các bản nháp hội thảo chưa được gửi duyệt."}
              {activeTab === "rejected" && "Các hội thảo đã bị Ban tổ chức từ chối."} {/* ← mô tả mới */}
            </p>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hội thảo, tổ chức..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
                <SelectTrigger className="w-[140px] h-10">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                </SelectContent>
              </Select>

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

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Khoảng ngày bắt đầu
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
                                <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>
                                  Áp dụng
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <Button onClick={() => setMoreFiltersOpen(false)} className="w-full" size="sm">
                      Áp dụng
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{tabConfig[activeTab].label}</p>
                <p className="text-3xl font-bold text-gray-900">{isLoading ? "..." : totalItems}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
                {tabConfig[activeTab].icon}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Sắp diễn ra</p>
                <p className="text-3xl font-bold text-gray-900">
                  {finalConferences.filter((c) => c.startDate && new Date(c.startDate) > new Date()).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : finalConferences.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            {tabConfig[activeTab].icon}
            <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Không có hội thảo nào</h3>
            <p className="text-gray-600">
              {activeTab === "draft"
                ? "Các bản nháp hội thảo của bạn sẽ xuất hiện ở đây"
                : `Chưa có hội thảo nào trong mục ${tabConfig[activeTab].label.toLowerCase()}`}
            </p>
          </div>
        ) : (
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
                      Bắt đầu
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
                  {finalConferences.map((conference) => {
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(statusName)}`}
                          >
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

            {finalConferences.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {Math.min((page - 1) * pageSize + 1, totalItems)}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">{Math.min(page * pageSize, totalItems)}</span>{" "}
                  của <span className="font-medium">{totalItems}</span> kết quả
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
                    Trang {page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={page * pageSize >= totalItems}
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
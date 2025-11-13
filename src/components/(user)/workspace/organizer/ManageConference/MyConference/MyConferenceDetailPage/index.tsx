"use client";

import {
  Loader2,
  ArrowLeft,
  Info,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/helper/format";
import { useRouter, useParams } from "next/navigation";

import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateStatus";

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
  ConferenceTimelineResponse,
} from "@/types/conference.type";

type CommonConference =
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;

interface InformationTabProps {
  conference: CommonConference;
  conferenceType?: "technical" | "research" | null;
  getCategoryName: (id: string) => string;
  getStatusName: (statusId: string) => string;
  getCityName: (cityId: string) => string;
  currentStatusName: string;
}

export default function ConferenceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;
  const [activeTab, setActiveTab] = useState("information");
  const [conferenceType, setConferenceType] = useState<
    "technical" | "research" | null
  >(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  const {
    data: techData,
    isLoading: techLoading,
    error: techError,
  } = useGetTechnicalConferenceDetailInternalQuery(conferenceId);

  const {
    data: researchData,
    isLoading: researchLoading,
    error: researchError,
  } = useGetResearchConferenceDetailInternalQuery(conferenceId);

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

  useEffect(() => {
    if (researchData?.data && !researchError) {
      if (researchData.data.isResearchConference === true) {
        setConferenceType("research");
        return;
      }
    }

    if (techData?.data && !techError) {
      if (techData.data.isResearchConference === true) {
        setConferenceType("research");
        return;
      } else {
        setConferenceType("technical");
        return;
      }
    }
  }, [techData, researchData, techError, researchError]);

  const conference =
    conferenceType === "technical" ? techData?.data : researchData?.data;
  const isLoading =
    conferenceType === null ||
    (conferenceType === "technical" ? techLoading : researchLoading);
  const error = conferenceType === "technical" ? techError : researchError;

  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];
  const cities = citiesData?.data || [];

  const tabs = [
    { id: "information", label: "Thông tin cơ bản", icon: Info },
    { id: "customer-requests", label: "Yêu cầu của khách", icon: Users },
    { id: "ticket-holders", label: "Khách đã mua vé", icon: Calendar }
  ];

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(
      (c) => c.conferenceCategoryId === categoryId,
    );
    return category?.conferenceCategoryName || categoryId;
  };

  const getStatusName = (statusId: string) => {
    const status = statuses.find((s) => s.conferenceStatusId === statusId);
    return status?.conferenceStatusName || statusId;
  };

  const getCurrentStatusName = () => {
    if (!conference?.conferenceStatusId) return "";
    const status = statuses.find(
      (s) => s.conferenceStatusId === conference.conferenceStatusId,
    );
    return status?.conferenceStatusName || "";
  };

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.cityId === cityId);
    return city?.cityName || cityId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">
            Đang tải thông tin hội thảo...
          </span>
        </div>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không thể tải thông tin
            </h3>
            <p className="text-gray-600 mb-6">
              Hội thảo không tồn tại hoặc đã bị xóa
            </p>
            <Button
              onClick={() => router.back()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const updateRoute =
    conference.isResearchConference === true
      ? `/workspace/collaborator/manage-conference/update-research-conference/${conference.conferenceId}`
      : `/workspace/collaborator/manage-conference/update-tech-conference/${conference.conferenceId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với Banner */}
      <div className="relative bg-white shadow-sm">
        {conference.bannerImageUrl ? (
          <div className="relative h-80 w-full">
            <Image
              src={conference.bannerImageUrl}
              alt={conference.conferenceName ?? "N/A"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute top-4 right-4 flex gap-2">
              {(conference.conferenceStatusId === "Preparing" ||
                conference.conferenceStatusId === "Pending" ||
                getCurrentStatusName() === "Preparing" ||
                getCurrentStatusName() === "Pending") && (
                <Button
                  onClick={() => router.push(updateRoute)}
                  className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg border border-white/50"
                >
                  Chỉnh sửa
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(true)}
                className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg border border-white/50"
              >
                Cập nhật trạng thái
              </Button>

              <UpdateConferenceStatus
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
                conference={{
                  ...conference,
                  conferenceStatusId: conference.conferenceStatusId,
                }}
              />
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {conference.conferenceName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                      conferenceType === "technical"
                        ? "bg-blue-500/90 text-white"
                        : "bg-pink-500/90 text-white"
                    }`}
                  >
                    {conferenceType === "technical" ? "Technical" : "Research"}
                  </span>
                  {conference.isInternalHosted && (
                    <span className="px-3 py-1 bg-green-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                      Nội bộ
                    </span>
                  )}
                  {conference.isResearchConference && (
                    <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                      Nghiên cứu
                    </span>
                  )}
                  <span className="px-3 py-1 bg-orange-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    {getCategoryName(conference.conferenceCategoryId ?? "")}
                  </span>
                  <span className="px-3 py-1 bg-teal-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    {getStatusName(conference.conferenceStatusId ?? "")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {conference.conferenceName}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    conferenceType === "technical"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {conferenceType === "technical" ? "Technical" : "Research"}
                </span>
                {conference.isInternalHosted && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Nội bộ
                  </span>
                )}
                {conference.isResearchConference && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Nghiên cứu
                  </span>
                )}
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {getCategoryName(conference.conferenceCategoryId ?? "")}
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  {getStatusName(conference.conferenceStatusId ?? "")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === "information" && (
            <InformationTab
              conference={conference}
              conferenceType={conferenceType}
              getCategoryName={getCategoryName}
              getStatusName={getStatusName}
              getCityName={getCityName}
              currentStatusName={getCurrentStatusName()}
            />
          )}
          {activeTab === "customer-requests" && (
            <EmptyTab title="Yêu cầu của khách" />
          )}
          {activeTab === "ticket-holders" && (
            <EmptyTab title="Khách đã mua vé" />
          )}
        </div>
      </div>
    </div>
  );
}

// Empty Tab Component
function EmptyTab({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">Nội dung đang được phát triển</p>
      </div>
    </div>
  );
}

// Information Tab
function InformationTab({
  conference,
  conferenceType,
  getCategoryName,
  getStatusName,
  getCityName,
  currentStatusName,
}: InformationTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Thông tin cơ bản
          </h2>
          <p className="text-muted-foreground text-sm">
            Xem chi tiết về sự kiện hội nghị
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              conference.isInternalHosted
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
            }`}
          >
            <span>{conference.isInternalHosted ? "✓" : "✗"}</span>
            <span>Tổ chức nội bộ</span>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              conference.isResearchConference
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
            }`}
          >
            <span>{conference.isResearchConference ? "✓" : "✗"}</span>
            <span>Hội nghị nghiên cứu</span>
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Thông tin cơ bản{" "}
            <span className="text-muted-foreground text-sm">
              # {conference.conferenceId}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Tên hội nghị" value={conference.conferenceName} />
          <InfoField
            label="Danh mục"
            value={getCategoryName(conference.conferenceCategoryId ?? "")}
          />
          <InfoField
            label="Trạng thái"
            value={getStatusName(conference.conferenceStatusId ?? "")}
          />
          <InfoField
            label="Ngày tạo"
            value={formatDate(conference.createdAt)}
          />
        </div>
      </div>

      {/* Dates Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Lịch trình
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Ngày bắt đầu"
            value={formatDate(conference.startDate)}
          />
          <InfoField
            label="Ngày kết thúc"
            value={formatDate(conference.endDate)}
          />
          <InfoField
            label="Bắt đầu bán vé"
            value={formatDate(conference.ticketSaleStart)}
          />
          <InfoField
            label="Kết thúc bán vé"
            value={formatDate(conference.ticketSaleEnd)}
          />
        </div>
      </div>

      {/* Capacity & Location Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Địa điểm & Sức chứa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Địa chỉ" value={conference.address} />
          <InfoField
            label="Thành phố"
            value={getCityName(conference.cityId ?? "")}
          />
          <InfoField label="Tổng chỗ ngồi" value={conference.totalSlot} />
          <InfoField label="Chỗ còn lại" value={conference.availableSlot} />
        </div>
      </div>

      {/* Description Section */}
      {conference.description && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Mô tả</h3>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm">
            {conference.description}
          </p>
        </div>
      )}

      {conferenceType === "technical" &&
        conference.conferenceTimelines &&
        conference.conferenceTimelines.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Tiến độ
                </h3>
              </div>
            </div>

            {/* Status Flow Guide */}
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              {/* Status Progress Bar */}
              <div className="relative flex items-center justify-between mb-6">
                {/* Pending */}
                <div className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`w-full h-12 border-2 rounded-l-full flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Pending"
                        ? "bg-yellow-200 dark:bg-yellow-800/50 border-yellow-400 dark:border-yellow-600 shadow-lg"
                        : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Pending"
                          ? "text-yellow-800 dark:text-yellow-200"
                          : "text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      Pending
                    </span>
                  </div>
                  <div className="absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-t-2 border-b-2 border-r-2 transform skew-x-[-20deg] origin-top-left ${
                        currentStatusName === "Pending"
                          ? "bg-yellow-200 dark:bg-yellow-800/50 border-yellow-400 dark:border-yellow-600"
                          : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Preparing */}
                <div className="flex flex-col items-center flex-1 relative -ml-6">
                  <div
                    className={`w-full h-12 border-t-2 border-b-2 flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Preparing"
                        ? "bg-blue-200 dark:bg-blue-800/50 border-blue-400 dark:border-blue-600 shadow-lg"
                        : "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Preparing"
                          ? "text-blue-800 dark:text-blue-200"
                          : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      Preparing
                    </span>
                  </div>
                  <div className="absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-t-2 border-b-2 border-r-2 transform skew-x-[-20deg] origin-top-left ${
                        currentStatusName === "Preparing"
                          ? "bg-blue-200 dark:bg-blue-800/50 border-blue-400 dark:border-blue-600"
                          : "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Ready */}
                <div className="flex flex-col items-center flex-1 relative -ml-6">
                  <div
                    className={`w-full h-12 border-t-2 border-b-2 flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Ready"
                        ? "bg-purple-200 dark:bg-purple-800/50 border-purple-400 dark:border-purple-600 shadow-lg"
                        : "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Ready"
                          ? "text-purple-800 dark:text-purple-200"
                          : "text-purple-700 dark:text-purple-300"
                      }`}
                    >
                      Ready
                    </span>
                  </div>
                  <div className="absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-full border-t-2 border-b-2 border-r-2 transform skew-x-[-20deg] origin-top-left ${
                        currentStatusName === "Ready"
                          ? "bg-purple-200 dark:bg-purple-800/50 border-purple-400 dark:border-purple-600"
                          : "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Completed */}
                <div className="flex flex-col items-center flex-1 relative -ml-6">
                  <div
                    className={`w-full h-12 border-2 rounded-r-full flex items-center justify-center relative z-10 transition-all ${
                      currentStatusName === "Completed"
                        ? "bg-green-200 dark:bg-green-800/50 border-green-400 dark:border-green-600 shadow-lg"
                        : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        currentStatusName === "Completed"
                          ? "text-green-800 dark:text-green-200"
                          : "text-green-700 dark:text-green-300"
                      }`}
                    >
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional States */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
                    currentStatusName === "On Hold" ||
                    currentStatusName === "OnHold"
                      ? "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 shadow-lg"
                      : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  }`}
                >
                  <div
                    className={`w-8 h-8 border rounded flex items-center justify-center flex-shrink-0 ${
                      currentStatusName === "On Hold" ||
                      currentStatusName === "OnHold"
                        ? "bg-orange-200 dark:bg-orange-800/50 border-orange-400 dark:border-orange-600"
                        : "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        currentStatusName === "On Hold" ||
                        currentStatusName === "OnHold"
                          ? "text-orange-800 dark:text-orange-200"
                          : "text-orange-700 dark:text-orange-300"
                      }`}
                    >
                      OH
                    </span>
                  </div>
                  <div
                    className={`text-[10px] ${
                      currentStatusName === "On Hold" ||
                      currentStatusName === "OnHold"
                        ? "text-orange-800 dark:text-orange-200"
                        : "text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    <div className="font-semibold">On Hold</div>
                    <div className="text-[9px]">Ready ⇄ On Hold</div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
                    currentStatusName === "Canceled"
                      ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 shadow-lg"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div
                    className={`w-8 h-8 border rounded flex items-center justify-center flex-shrink-0 ${
                      currentStatusName === "Canceled"
                        ? "bg-red-200 dark:bg-red-800/50 border-red-400 dark:border-red-600"
                        : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        currentStatusName === "Canceled"
                          ? "text-red-800 dark:text-red-200"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      CX
                    </span>
                  </div>
                  <div
                    className={`text-[10px] ${
                      currentStatusName === "Canceled"
                        ? "text-red-800 dark:text-red-200"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    <div className="font-semibold">Canceled</div>
                    <div className="text-[9px]">Từ Preparing/OnHold</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline History */}
            <div className="space-y-3">
              {conference.conferenceTimelines.map(
                (timeline: ConferenceTimelineResponse, index: number) => {
                  const isLast =
                    index === (conference.conferenceTimelines?.length ?? 0) - 1;

                  return (
                    <div
                      key={timeline.conferenceTimelineId}
                      className="relative"
                    >
                      {!isLast && (
                        <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-border"></div>
                      )}

                      <div className="bg-background border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {(conference.conferenceTimelines?.length ?? 0) -
                                  index}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                                  {timeline.previousStatusName}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                                  {timeline.afterwardStatusName}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(timeline.changeDate)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {timeline.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
  className?: string;
}

// Reusable Info Field Component
function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={`${className}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}
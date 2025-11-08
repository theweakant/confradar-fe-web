"use client";

import {
  Calendar,
  Loader2,
  ShieldCheck,
  Handshake,
  DollarSign,
  ArrowLeft,
  Info,
  Image as ImageIcon,
  FileText,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/helper/format";
import { useRouter, useParams } from "next/navigation";

import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateConferenceStatus";

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
  RefundPolicyResponse,
  ConferenceMediaResponse,
  ConferencePolicyResponse,
  SponsorResponse,
  ConferencePriceResponse,
  ConferencePricePhaseResponse,
  RevisionRoundDeadlineResponse,
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
    // ... fallback logic
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
    { id: "price", label: "Giá vé", icon: DollarSign },
    { id: "refund-policy", label: "Hoàn trả & Chính sách", icon: ShieldCheck },
    { id: "session", label: "Session", icon: Calendar },
    ...(conference?.isResearchConference === true
      ? [
          {
            id: "research-materials",
            label: "Tài liệu nghiên cứu",
            icon: FileText,
          },
          { id: "research-info", label: "Research Info", icon: BookOpen },
        ]
      : []),
    { id: "sponsors-media", label: "Sponsors & Media", icon: ImageIcon },
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
          {activeTab === "price" && <PriceTab conference={conference} />}
          {activeTab === "refund-policy" && (
            <RefundPolicyTab conference={conference} />
          )}
          {activeTab === "session" && (
            <SessionTab
              conference={conference}
              conferenceType={conferenceType}
            />
          )}
          {activeTab === "research-materials" &&
            conferenceType === "research" && (
              <ResearchMaterialsTab conference={conference} />
            )}
          {activeTab === "research-info" && conferenceType === "research" && (
            <ResearchInfoTab
              conference={conference as ResearchConferenceDetailResponse}
            />
          )}
          {activeTab === "sponsors-media" && (
            <SponsorsMediaTab conference={conference} />
          )}
        </div>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Thông tin cơ bản{" "}
            <span className="text-muted-foreground text-sm">
              # {conference.conferenceId}
            </span>
          </h3>
        </div>

        {/* Thông tin cơ bản */}
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
          {/* Hàng 1: Địa chỉ - Thành phố */}
          <InfoField label="Địa chỉ" value={conference.address} />
          <InfoField
            label="Thành phố"
            value={getCityName(conference.cityId ?? "")}
          />

          {/* Hàng 2: Chỗ còn lại - Tổng chỗ */}
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

interface PriceTabProps {
  conference: CommonConference;
}
// // Price Tab Component
function PriceTab({ conference }: PriceTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Giá Vé</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin chi tiết về giá vé và các đợt bán vé
        </p>
      </div>

      {conference.conferencePrices && conference.conferencePrices.length > 0 ? (
        <div className="space-y-5">
          {conference.conferencePrices.map((price: ConferencePriceResponse) => (
            <div
              key={price.conferencePriceId}
              className="border border-border rounded-lg bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-6 mb-6 pb-6 border-b border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {price.ticketName}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      #{price.conferencePriceId}
                    </span>
                    {price.isAuthor && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold border border-yellow-200 dark:border-yellow-800">
                        AUTHOR
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {price.ticketDescription}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    Giá
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {" "}
                    {formatCurrency(price.ticketPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <InfoField label="Tổng Slot" value={price.totalSlot} />
                <InfoField label="Slot Còn Lại" value={price.availableSlot} />
                <InfoField
                  label="Dành cho Tác Giả"
                  value={price.isAuthor ? "Có" : "Không"}
                />
              </div>

              {price.pricePhases && price.pricePhases.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Các Đợt Bán Hàng
                  </h4>

                  {/* Grid 3 phase / row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {price.pricePhases.map(
                      (phase: ConferencePricePhaseResponse) => (
                        <div
                          key={phase.phaseName}
                          className="bg-background border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-xs md:text-sm flex flex-col justify-between"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {phase.phaseName}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                -{phase.applyPercent}%
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="border-t border-border pt-2 space-y-1 text-[11px] md:text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Thời Gian
                              </span>
                              <span className="font-medium">{`${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Áp dụng{" "}
                              </span>
                              <span className="font-medium">
                                {phase.applyPercent}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Tổng Slot
                              </span>
                              <span className="font-medium">
                                {phase.totalSlot}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Còn Lại
                              </span>
                              <span className="font-medium">
                                {phase.availableSlot}
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có thông tin giá vé</p>
        </div>
      )}
    </div>
  );
}

interface RefundPolicyTabProps {
  conference: CommonConference;
}
// Refund & Policy Tab Component
function RefundPolicyTab({ conference }: RefundPolicyTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Chính sách hoàn tiền & Quy định hội nghị
      </h2>

      {/* Refund Policies */}
      <div>
        <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Chính sách hoàn tiền
        </h3>

        {conference.refundPolicies && conference.refundPolicies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {conference.refundPolicies.map(
              (policy: RefundPolicyResponse, index: number) => (
                <div
                  key={index}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-sm transition text-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoField
                      label="Thứ tự hoàn tiền"
                      value={policy.refundOrder}
                    />
                    <InfoField
                      label="Tỷ lệ hoàn tiền"
                      value={`${policy.percentRefund ?? 0}%`}
                    />
                    <InfoField
                      label="Hạn hoàn tiền"
                      value={formatDate(policy.refundDeadline)}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Không có chính sách hoàn tiền
          </p>
        )}
      </div>

      {/* Conference Policies */}
      <div>
        <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Quy định hội nghị
        </h3>

        {conference.policies && conference.policies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {conference.policies.map((policy: ConferencePolicyResponse) => (
              <div
                key={policy.policyId}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {policy.policyName}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {policy.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Không có quy định hội nghị
          </p>
        )}
      </div>
    </div>
  );
}

interface SessionTabProps {
  conference: CommonConference;
  conferenceType?: "technical" | "research" | null;
}

// Session Tab Component
// Session Tab Component
function SessionTab({ conference, conferenceType }: SessionTabProps) {
  const sessions =
    conferenceType === "research"
      ? (conference as ResearchConferenceDetailResponse).researchSessions
      : (conference as TechnicalConferenceDetailResponse).sessions;
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  // Extract researchPhase to avoid repetitive type casting
  const researchPhase =
    conferenceType === "research"
      ? (conference as ResearchConferenceDetailResponse).researchPhase
      : null;

  return (
    <div className="space-y-4 p-4">
      {conferenceType === "research" && researchPhase && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Giai Đoạn Hội Nghị
          </h3>

          {/* Main Phase Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <InfoField
              label="Đăng ký"
              value={formatDate(researchPhase.registrationStartDate)}
            />
            <InfoField
              label="Nộp bài"
              value={formatDate(researchPhase.fullPaperStartDate)}
            />
            <InfoField
              label="Đánh giá"
              value={formatDate(researchPhase.reviewStartDate)}
            />
            <InfoField
              label="Chỉnh sửa"
              value={formatDate(researchPhase.reviseStartDate)}
            />
            <InfoField
              label="Camera Ready"
              value={formatDate(researchPhase.cameraReadyStartDate)}
            />
            <div className="flex gap-2 items-center">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  researchPhase.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {researchPhase.isActive
                  ? "✓ Đang diễn ra"
                  : "✗ Không hoạt động"}
              </span>
            </div>
          </div>

          {researchPhase.revisionRoundDeadlines &&
            researchPhase.revisionRoundDeadlines.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="revision-rounds"
                  className="border border-blue-200"
                >
                  <AccordionTrigger className="text-sm font-semibold text-gray-900 py-2 px-3 hover:bg-blue-100">
                    Các Vòng Chỉnh Sửa (
                    {researchPhase.revisionRoundDeadlines.length})
                  </AccordionTrigger>
                  <AccordionContent className="pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {researchPhase.revisionRoundDeadlines.map(
                        (deadline: RevisionRoundDeadlineResponse) => (
                          <div
                            key={deadline.revisionRoundDeadlineId}
                            className="bg-white border border-blue-100 rounded p-2"
                          >
                            <div className="text-xs font-bold text-blue-700 mb-1">
                              Vòng {deadline.roundNumber}
                            </div>
                            <div className="text-xs text-gray-700">
                              {deadline.endDate
                                ? formatDate(deadline.endDate)
                                : "Chưa xác định"}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Lịch Các Phiên Họp
        </h2>
        {sessions && sessions.length > 0 ? (
          sessions.map((session, index) => (
            <div
              key={session.conferenceSessionId || index}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
            >
              {/* Session Header - Clickable */}
              <button
                onClick={() =>
                  toggleSession(session.conferenceSessionId || index.toString())
                }
                className="w-full text-left p-3 hover:bg-gray-50 flex items-center justify-between group"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {session.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(session.date)} • {session.startTime} -{" "}
                    {session.endTime}
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSessions.has(session.conferenceSessionId || index.toString()) ? "rotate-180" : ""}`}
                />
              </button>

              {/* Session Details - Collapsed/Expanded */}
              {expandedSessions.has(
                session.conferenceSessionId || index.toString(),
              ) && (
                <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
                  {session.description && (
                    <div>
                      <p className="text-sm text-gray-700 italic">
                        {session.description}
                      </p>
                    </div>
                  )}

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <InfoField
                      label="ID Phiên"
                      value={session.conferenceSessionId}
                    />
                    <InfoField label="Phòng" value={session.roomId} />
                    <InfoField
                      label="ID Hội Nghị"
                      value={session.conferenceId}
                    />
                  </div>

                  {/* Room Info */}
                  {session.room && (
                    <div className="pt-2 border-t border-gray-300">
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">
                        Thông Tin Phòng
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2 rounded border border-gray-200">
                        <InfoField
                          label="Tên Phòng"
                          value={session.room.displayName}
                        />
                        <InfoField
                          label="Số Phòng"
                          value={session.room.number}
                        />
                      </div>
                    </div>
                  )}

                  {/* Session Media */}
                  {session.sessionMedia && session.sessionMedia.length > 0 && (
                    <div className="pt-2 border-t border-gray-300">
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">
                        Tài Liệu Phiên Họp
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {session.sessionMedia?.map((media, idx) => (
                          <div
                            key={idx}
                            className="relative h-24 rounded overflow-hidden border border-gray-300"
                          >
                            <Image
                              src={
                                media.conferenceSessionMediaUrl?.startsWith(
                                  "http",
                                )
                                  ? media.conferenceSessionMediaUrl
                                  : `https://minio-api.confradar.io.vn/${media.conferenceSessionMediaUrl}`
                              }
                              alt={`Tài liệu ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">
            Không có phiên họp nào
          </p>
        )}
      </div>
    </div>
  );
}

interface SponsorsMediaTabProps {
  conference: CommonConference;
}
// Sponsors & Media Tab Component
function SponsorsMediaTab({ conference }: SponsorsMediaTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sponsors & Media
      </h2>

      {/* Sponsors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-blue-600" />
          Sponsors
        </h3>
        {conference.sponsors && conference.sponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conference.sponsors.map(
              (sponsor: SponsorResponse, index: number) => (
                <div
                  key={sponsor.sponsorId || index}
                  className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {sponsor.imageUrl && (
                    <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={sponsor.imageUrl}
                        alt={sponsor.name ?? "N/A"}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  <h4 className="font-bold text-gray-900 text-center mb-2">
                    {sponsor.name}
                  </h4>
                  <InfoField label="Sponsor ID" value={sponsor.sponsorId} />
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No sponsors available
          </p>
        )}
      </div>

      {/* Conference Media */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          Conference Media
        </h3>
        {conference.conferenceMedia && conference.conferenceMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {conference.conferenceMedia.map(
              (media: ConferenceMediaResponse, index: number) => (
                <div key={media.mediaId || index} className="space-y-2">
                  <div className="relative h-48 rounded-lg overflow-hidden group">
                    <Image
                      src={
                        media.mediaUrl?.startsWith("http")
                          ? media.mediaUrl
                          : `https://minio-api.confradar.io.vn/${media.mediaUrl}`
                      }
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <InfoField label="Media ID" value={media.mediaId} />
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No media available</p>
        )}
      </div>
    </div>
  );
}

interface ResearchMaterialsTabProps {
  conference: CommonConference;
}

// Research Materials Tab Component
function ResearchMaterialsTab({ conference }: ResearchMaterialsTabProps) {
  const isResearchConference = (
    conf: CommonConference,
  ): conf is ResearchConferenceDetailResponse => {
    return "rankingCategoryId" in conf;
  };

  if (!isResearchConference(conference)) {
    return (
      <div className="space-y-8 p-6">
        <p className="text-gray-500 text-center py-8">
          Research materials are only available for research conferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Research Materials & Resources
      </h2>

      {/* Ranking Category */}
      <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Category ID" value={conference.rankingCategoryId} />
          <InfoField
            label="Category Name"
            value={conference.rankingCategoryName}
          />
        </div>
      </div>

      {/* Ranking Files */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Ranking Files
        </h3>
        {conference.rankingFileUrls && conference.rankingFileUrls.length > 0 ? (
          <div className="space-y-3">
            {conference.rankingFileUrls.map((file, index) => (
              <div
                key={file.rankingFileUrlId || index}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <InfoField label="File ID" value={file.rankingFileUrlId} />
                  <p className="text-sm text-gray-600 mt-2 break-all">
                    {file.fileUrl}
                  </p>
                </div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View File
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No ranking files available
          </p>
        )}
      </div>

      {/* Material Downloads */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Material Downloads
        </h3>
        {conference.materialDownloads &&
        conference.materialDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conference.materialDownloads.map((material, index) => (
              <div
                key={material.materialDownloadId || index}
                className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {material.fileName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {material.fileDescription}
                    </p>
                  </div>
                </div>
                <InfoField
                  label="Material ID"
                  value={material.materialDownloadId}
                  className="mb-3"
                />
                <a
                  href={`https://minio-api.confradar.io.vn/${material.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium w-full justify-center"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No materials available for download
          </p>
        )}
      </div>

      {/* Ranking Reference URLs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-600" />
          Ranking Reference URLs
        </h3>
        {conference.rankingReferenceUrls &&
        conference.rankingReferenceUrls.length > 0 ? (
          <div className="space-y-3">
            {conference.rankingReferenceUrls.map((reference, index) => (
              <div
                key={reference.referenceUrlId || index}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <InfoField
                    label="Reference ID"
                    value={reference.referenceUrlId}
                  />
                  <p className="text-sm text-blue-600 hover:text-blue-700 mt-2 break-all font-medium">
                    {reference.referenceUrl}
                  </p>
                </div>
                <a
                  href={reference.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  Visit
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No reference URLs available
          </p>
        )}
      </div>
    </div>
  );
}

interface ResearchInfoTabProps {
  conference: ResearchConferenceDetailResponse;
}
// Research Info Tab Component
function ResearchInfoTab({ conference }: ResearchInfoTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Research Conference Information
      </h2>

      {/* Main Research Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Research Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Name" value={conference.name} />
          <InfoField label="Paper Format" value={conference.paperFormat} />
          <InfoField
            label="Number of Papers to Accept"
            value={conference.numberPaperAccept}
          />
          <InfoField
            label="Revision Attempts Allowed"
            value={conference.revisionAttemptAllowed}
          />
          <InfoField
            label="Review Fee (VND)"
            value={`${(conference.reviewFee || 0).toLocaleString("vi-VN")}₫`}
          />
          <InfoField label="Rank Value" value={conference.rankValue} />
          <InfoField label="Rank Year" value={conference.rankYear} />
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                conference.allowListener
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {conference.allowListener ? "✓" : "✗"} Allow Listener
            </span>
          </div>
        </div>
      </div>

      {/* Ranking Description */}
      {conference.rankingDescription && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Ranking Description
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
            {conference.rankingDescription}
          </p>
        </div>
      )}

      {/* Research Phase Timeline */}
      {conference.researchPhase ? (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Research Phase Timeline
          </h3>
          <div className="space-y-4">
            {/* Registration Phase */}
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">
                  1
                </span>
                Registration Phase
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Start Date"
                  value={formatDate(
                    conference.researchPhase.registrationStartDate,
                  )}
                />
                <InfoField
                  label="End Date"
                  value={formatDate(
                    conference.researchPhase.registrationEndDate,
                  )}
                />
              </div>
            </div>

            {/* Full Paper Submission Phase */}
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold">
                  2
                </span>
                Full Paper Submission Phase
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Start Date"
                  value={formatDate(
                    conference.researchPhase.fullPaperStartDate,
                  )}
                />
                <InfoField
                  label="End Date"
                  value={formatDate(conference.researchPhase.fullPaperEndDate)}
                />
              </div>
            </div>

            {/* Review Phase */}
            <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-bold">
                  3
                </span>
                Review Phase
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Start Date"
                  value={formatDate(conference.researchPhase.reviewStartDate)}
                />
                <InfoField
                  label="End Date"
                  value={formatDate(conference.researchPhase.reviewEndDate)}
                />
              </div>
            </div>

            {/* Revision Phase */}
            <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs font-bold">
                  4
                </span>
                Revision Phase
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Start Date"
                  value={formatDate(conference.researchPhase.reviseStartDate)}
                />
                <InfoField
                  label="End Date"
                  value={formatDate(conference.researchPhase.reviseEndDate)}
                />
              </div>

              {/* Revision Round Deadlines */}
              {conference.researchPhase.revisionRoundDeadlines &&
                conference.researchPhase.revisionRoundDeadlines.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-xs font-semibold text-yellow-900 mb-2">
                      Revision Rounds:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {conference.researchPhase.revisionRoundDeadlines.map(
                        (deadline: RevisionRoundDeadlineResponse) => (
                          <div
                            key={deadline.revisionRoundDeadlineId}
                            className="bg-white border border-yellow-200 rounded p-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-yellow-900">
                                Round {deadline.roundNumber}
                              </span>
                              <span className="text-xs text-gray-600">
                                {deadline.endDate
                                  ? formatDate(deadline.endDate)
                                  : "Not set"}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Camera Ready Phase */}
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">
                  5
                </span>
                Camera Ready Phase
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Start Date"
                  value={formatDate(
                    conference.researchPhase.cameraReadyStartDate,
                  )}
                />
                <InfoField
                  label="End Date"
                  value={formatDate(
                    conference.researchPhase.cameraReadyEndDate,
                  )}
                />
              </div>
            </div>

            {/* Phase Status */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Phase Status</h4>
              <div className="flex gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    conference.researchPhase.isWaitlist
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {conference.researchPhase.isWaitlist ? "✓" : "✗"} Waitlist
                  Mode
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    conference.researchPhase.isActive
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {conference.researchPhase.isActive ? "✓" : "✗"} Active
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Research Phase Timeline
          </h3>
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No research phase data available
          </p>
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

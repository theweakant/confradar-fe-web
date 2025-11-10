// components/pages/ConferenceDetailPage/ConferenceDetailPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Queries
import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

// Components
import { BannerSection } from "./BannerSection";
import { TabNavigation } from "./TabNavigation";
import { BasicInfoTab } from "./Tab/BasicInfoTab";
import { RequestTab } from "./Tab/RequestTab";
import { RegisteredUserTab } from "./Tab/RegisteredUserTab";
import { PaperPhaseTab } from "./Tab/PaperPhaseTab";
import { ResearchTimelineTab } from "./Tab/ResearchTimelineTab";

// Types
import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";

export type CommonConference =
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;

export default function ConferenceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;

  const [activeTab, setActiveTab] = useState("information");
  const [conferenceType, setConferenceType] = useState<"technical" | "research" | null>(null);
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

  // Xác định loại hội nghị
  useEffect(() => {
    if (researchData?.data && !researchError && researchData.data.isResearchConference) {
      setConferenceType("research");
      return;
    }
    if (techData?.data && !techError && !techData.data.isResearchConference) {
      setConferenceType("technical");
      return;
    }
    // Fallback: nếu techData có isResearchConference=true → research
    if (techData?.data && !techError && techData.data.isResearchConference) {
      setConferenceType("research");
      return;
    }
  }, [techData, researchData, techError, researchError]);

  const conference = conferenceType === "technical" ? techData?.data : researchData?.data;
  const isLoading = conferenceType === null || (conferenceType === "technical" ? techLoading : researchLoading);
  const error = conferenceType === "technical" ? techError : researchError;

  // Helpers (an toàn vì không phụ thuộc vào conference)
  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];
  const cities = citiesData?.data || [];

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.conferenceCategoryId === categoryId)?.conferenceCategoryName || categoryId;

  const getStatusName = (statusId: string) =>
    statuses.find((s) => s.conferenceStatusId === statusId)?.conferenceStatusName || statusId;

  const getCityName = (cityId: string) =>
    cities.find((c) => c.cityId === cityId)?.cityName || cityId;

  const getCurrentStatusName = () =>
    statuses.find((s) => s.conferenceStatusId === conference?.conferenceStatusId)?.conferenceStatusName || "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Đang tải thông tin hội thảo...</span>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h3>
            <p className="text-gray-600 mb-6">Hội thảo không tồn tại hoặc đã bị xóa</p>
            <Button onClick={() => router.back()} className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

 
  const isEditingAllowed =
    conference.conferenceStatusId === "Preparing" ||
    conference.conferenceStatusId === "Pending" ||
    getCurrentStatusName() === "Preparing" ||
    getCurrentStatusName() === "Pending";

  const updateRoute =
    conference.isResearchConference === true
      ? `/workspace/collaborator/manage-conference/update-research-conference/${conference.conferenceId}`
      : `/workspace/collaborator/manage-conference/update-tech-conference/${conference.conferenceId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <BannerSection
        conference={conference}
        conferenceType={conferenceType}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isEditingAllowed={isEditingAllowed}
        updateRoute={updateRoute}
        statusDialogOpen={statusDialogOpen}
        setStatusDialogOpen={setStatusDialogOpen}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isResearch={conferenceType === "research"}
        />
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === "information" && (
            <BasicInfoTab
              conference={conference}
              conferenceType={conferenceType}
              getCategoryName={getCategoryName}
              getStatusName={getStatusName}
              getCityName={getCityName}
              currentStatusName={getCurrentStatusName()}
            />
          )}

          {activeTab === "customer-requests" && (
            <RequestTab conferenceType={conferenceType} />
          )}

          {activeTab === "ticket-holders" && <RegisteredUserTab conferenceId={conference.conferenceId!} />}

          {/* Tab bổ sung chỉ cho Research */}
          {conferenceType === "research" && activeTab === "paper-phase" && <PaperPhaseTab />}
          {activeTab === "research-timeline" && (
            <ResearchTimelineTab conferenceId={conference.conferenceId!} />
          )}
        </div>
      </div>
    </div>
  );
}
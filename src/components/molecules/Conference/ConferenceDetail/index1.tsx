"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Info,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/redux/hooks/useAuth";

// Queries
import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

// Status Modals
import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateStatus";
import { DeleteConferenceStatus } from "@/components/molecules/Status/DeleteStatus";
import { RequestConferenceApproval } from "@/components/molecules/Status/RequestStatus";

// Modular Components
import { BannerSection } from "./BannerSection";
import { TabNavigation } from "./TabNavigation";

// Tab Components (CŨ + MỚI)
import { BasicInfoTab } from "./Tab/BasicInfoTab";
import { PriceTab } from "./Tab/PriceTab";
import { RefundPolicyTab } from "./Tab/RefundPolicyTab";
import { SessionTab } from "./Tab/SessionTab";
import { SponsorsMediaTab } from "./Tab/SponsorsMediaTab";
import { ResearchMaterialsTab } from "./Tab/ResearchMaterialsTab";
import { ResearchInfoTab } from "./Tab/ResearchInfoTab";

// Các tab cũ — GIỮ NGUYÊN theo yêu cầu
import { RefundRequestTab } from "./Tab/RefundRequestTab";
import { OtherRequestTab } from "./Tab/OtherRequestTab";
import { RegisteredUserTab } from "./Tab/RegisteredUserTab";
import { PaperPhaseTab } from "./Tab/PaperPhaseTab";
import { ResearchTimelineTab } from "./Tab/ResearchTimelineTab";
import { PaperAssignmentTab } from "./Tab/PaperAssignmentTab";

// Types
import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";

export type CommonConference =
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;

export default function ConferenceDetailPage1() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;
  const { user } = useAuth();
  const userRoles = user?.role || [];
  const isOrganizer = userRoles.includes("Conference Organizer");
  const isCollaborator = userRoles.includes("Collaborator");

  const [activeTab, setActiveTab] = useState("information");
  const [conferenceType, setConferenceType] = useState<"technical" | "research" | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: techData,
    isLoading: techLoading,
    error: techError,
    refetch: techRefetch,
  } = useGetTechnicalConferenceDetailInternalQuery(conferenceId);

  const {
    data: researchData,
    isLoading: researchLoading,
    error: researchError,
    refetch: researchRefetch,
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
    if (techData?.data && !techError && techData.data.isResearchConference) {
      setConferenceType("research");
      return;
    }
  }, [techData, researchData, techError, researchError]);

  const conference = conferenceType === "technical" ? techData?.data : researchData?.data;
  const isLoading = conferenceType === null || (conferenceType === "technical" ? techLoading : researchLoading);
  const error = conferenceType === "technical" ? techError : researchError;

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

  // Role-based update route
  let updateRoute: string | null = null;
  if (conference.isResearchConference) {
    if (isOrganizer) {
      updateRoute = `/workspace/organizer/manage-conference/update-research-conference/${conference.conferenceId}`;
    }
  } else {
    if (isOrganizer) {
      updateRoute = `/workspace/organizer/manage-conference/update-tech-conference/${conference.conferenceId}`;
    } else if (isCollaborator) {
      updateRoute = `/workspace/collaborator/manage-conference/update-tech-conference/${conference.conferenceId}`;
    }
  }

  const handleRefetch = () => {
    if (conferenceType === "technical") techRefetch();
    else researchRefetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <BannerSection
        conference={conference}
        conferenceType={conferenceType}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isEditingAllowed={["Draft", "Preparing", "Pending"].includes(getStatusName(conference.conferenceStatusId ??""))}
        updateRoute={updateRoute}
        statusDialogOpen={statusDialogOpen}
        setStatusDialogOpen={setStatusDialogOpen}
        deleteDialogOpen={deleteDialogOpen}         
        setDeleteDialogOpen={setDeleteDialogOpen} 
        dropdownActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-black-900 backdrop-blur-sm shadow-lg border border-white/50"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {conference.conferenceStatusId &&
                ["Draft", "Preparing", "Pending"].includes(getStatusName(conference.conferenceStatusId)) &&
                updateRoute && (
                  <DropdownMenuItem
                    onClick={() => router.push(updateRoute)}
                    className="cursor-pointer flex items-center gap-2 text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa thông tin
                  </DropdownMenuItem>
                )}

              {conference.conferenceStatusId &&
                conference.conferenceId &&
                getStatusName(conference.conferenceStatusId) === "Draft" && (
                  <RequestConferenceApproval
                    conferenceId={conference.conferenceId}
                    onSuccess={handleRefetch}
                    asDropdownItem={true}
                  />
                )}

              {conference.conferenceStatusId &&
                !["Draft", "Pending", "Deleted"].includes(getStatusName(conference.conferenceStatusId)) && (
                  <DropdownMenuItem
                    onClick={() => setStatusDialogOpen(true)}
                    className="cursor-pointer flex items-center gap-2 text-purple-600 focus:text-purple-700 focus:bg-purple-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cập nhật trạng thái
                  </DropdownMenuItem>
                )}

              {conference.conferenceStatusId &&
                ["Draft", "Pending"].includes(getStatusName(conference.conferenceStatusId)) && (
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa hội thảo
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Dialogs */}
      <UpdateConferenceStatus
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        conference={{
          conferenceId: conference.conferenceId!,
          conferenceName: conference.conferenceName!,
          conferenceStatusId: conference.conferenceStatusId!,
        }}
        onSuccess={handleRefetch}
      />
      <DeleteConferenceStatus
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        conference={{
          conferenceId: conference.conferenceId!,
          conferenceName: conference.conferenceName!,
          conferenceStatusId: conference.conferenceStatusId!,
        }}
        onSuccess={handleRefetch}
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

          {/* === Tab mới === */}
          {activeTab === "price" && <PriceTab conference={conference} />}
          {activeTab === "refund-policy" && <RefundPolicyTab conference={conference} />}
          {activeTab === "session" && (
            <SessionTab conference={conference} conferenceType={conferenceType} />
          )}
          {activeTab === "sponsors-media" && <SponsorsMediaTab conference={conference} />}
          {conferenceType === "research" && activeTab === "research-materials" && (
            <ResearchMaterialsTab conference={conference} />
          )}
          {conferenceType === "research" && activeTab === "research-info" && (
            <ResearchInfoTab conference={conference as any} />
          )}

          {/* === Tab cũ — GIỮ NGUYÊN === */}
          {activeTab === "refund-requests" && (
            <RefundRequestTab conferenceId={conference.conferenceId!} conferenceType={conferenceType} />
          )}
          {conferenceType === "research" && activeTab === "other-requests" && (
            <OtherRequestTab conferenceId={conference.conferenceId!} />
          )}
          {activeTab === "ticket-holders" && (
            <RegisteredUserTab conferenceId={conference.conferenceId!} />
          )}
          {conferenceType === "research" && activeTab === "paper-phase" && <PaperPhaseTab />}
          {activeTab === "research-timeline" && (
            <ResearchTimelineTab conferenceId={conference.conferenceId!} />
          )}
          {conferenceType === "research" && activeTab === "paper-assignment" && (
  <PaperAssignmentTab conferenceId={conference.conferenceId!} />
)}
        </div>
      </div>
    </div>
  );
}
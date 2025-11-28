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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/redux/hooks/useAuth";

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useViewRegisteredUsersForConferenceQuery } from "@/redux/services/conference.service";

import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateStatus1/index";
import { DeleteConferenceStatus } from "@/components/molecules/Status/DeleteStatus";
import { RequestConferenceApproval } from "@/components/molecules/Status/RequestStatus";
import { HistoryTimelineStatus } from "@/components/molecules/Status/HistoryTimelineStatus";
import { RegisteredUsersModal } from "@/components/molecules/Conference/ConferenceDetail/RightSidebar/RegisterUserSection/RegisteredUsersModal";

import { HeaderSection } from "./HeaderSection";
import { RightSidebar } from "./RightSidebar";
import { LeftPanel } from "./LeftPanel";

import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";
import type { TabId } from "./constants/tab";
 
export type CommonConference =
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;

export default function ConferenceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;
  const { user } = useAuth();
  const userRoles = user?.role || [];
  const isOrganizer = userRoles.includes("Conference Organizer");
  const isCollaborator = userRoles.includes("Collaborator");

  const [primaryTab, setPrimaryTab] = useState<"detail" | "action">("detail");
  const [activeSubtab, setActiveSubtab] = useState<TabId>("price");
  const [conferenceType, setConferenceType] = useState<"technical" | "research" | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);

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

  const { data: attendeesData } = useViewRegisteredUsersForConferenceQuery(conferenceId);

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

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

  useEffect(() => {
    if (primaryTab === "detail") {
      setActiveSubtab("price");
    } else {
      setActiveSubtab("refund-requests");
    }
  }, [primaryTab]);

  const conference = conferenceType === "technical" ? techData?.data : researchData?.data;
  const isLoading = conferenceType === null || (conferenceType === "technical" ? techLoading : researchLoading);
  const error = conferenceType === "technical" ? techError : researchError;

  const conferenceTimelines = conference?.conferenceTimelines || [];
  const registeredUsersFull = Array.isArray(attendeesData?.data) ? attendeesData.data : [];

  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];
  const cities = citiesData?.data || [];

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.conferenceCategoryId === categoryId)?.conferenceCategoryName || categoryId;

  const getStatusName = (statusId: string) =>
    statuses.find((s) => s.conferenceStatusId === statusId)?.conferenceStatusName || statusId;

  const getCityName = (cityId: string) =>
    cities.find((c) => c.cityId === cityId)?.cityName || cityId;

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
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const safeConferenceData = {
    conferenceName: conference.conferenceName ?? "",
    conferenceStatusId: conference.conferenceStatusId ?? "",
    sponsors: conference.sponsors ?? [],
    conferenceMedia: conference.conferenceMedia ?? [],
    policies: conference.policies ?? [],
    sessions: conference.sessions ?? [],
    conferencePrices: conference.conferencePrices ?? [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSection
        conference={conference}
        onBack={() => router.back()}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        primaryTab={primaryTab}
        onPrimaryTabChange={setPrimaryTab}
        dropdownActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="border border-gray-200">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {conference.conferenceStatusId &&
                ["OnHold", "Draft", "Preparing", "Pending"].includes(getStatusName(conference.conferenceStatusId)) &&
                updateRoute && (
                  <DropdownMenuItem
                    onClick={() => router.push(updateRoute)}
                    className="cursor-pointer flex items-center gap-2 text-blue-600"
                  >
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa thông tin
                  </DropdownMenuItem>
                )}

              {/* ✅ Gửi yêu cầu duyệt — chỉ khi trạng thái là Draft */}
              {conference.conferenceStatusId &&
                conference.conferenceId &&
                conference.contract &&
                getStatusName(conference.conferenceStatusId) === "Draft" && (
                  <RequestConferenceApproval
                    conferenceId={conference.conferenceId}
                    contract={conference.contract}
                    conferenceData={safeConferenceData}
                    onSuccess={handleRefetch}
                    asDropdownItem={true}
                  />
                )}

              {conference.conferenceStatusId &&
                !["Draft", "Pending", "Deleted"].includes(getStatusName(conference.conferenceStatusId)) && (
                  <DropdownMenuItem
                    onClick={() => setStatusDialogOpen(true)}
                    className="cursor-pointer flex items-center gap-2 text-purple-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cập nhật trạng thái
                  </DropdownMenuItem>
                )}

              {conference.conferenceStatusId &&
                ["Draft", "Pending"].includes(getStatusName(conference.conferenceStatusId)) && (
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="cursor-pointer flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa hội thảo
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <UpdateConferenceStatus
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        conference={conference}
        conferenceType={conferenceType || "technical"}
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

      <HistoryTimelineStatus
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        timelines={conferenceTimelines}
      />

      <RegisteredUsersModal
        open={isAttendeesModalOpen}
        onClose={() => setIsAttendeesModalOpen(false)}
        users={registeredUsersFull}
        conferenceName={conference.conferenceName!}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <LeftPanel
              primaryTab={primaryTab}
              activeSubtab={activeSubtab}
              onSubtabChange={setActiveSubtab}
              conference={conference}
              conferenceType={conferenceType}
              isCollaborator={isCollaborator}
              userRoles={userRoles}
              getCategoryName={getCategoryName}
              getStatusName={getStatusName}
              getCityName={getCityName}
            />
          </div>

          <RightSidebar
            conference={conference}
            conferenceId={conference.conferenceId!}
            isCollaborator={isCollaborator}
            conferenceType={conferenceType}
            getCategoryName={getCategoryName}
            getStatusName={getStatusName}
            getCityName={getCityName}
            onOpenTimeline={() => setIsHistoryModalOpen(true)}
            onOpenFullAttendees={() => setIsAttendeesModalOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}
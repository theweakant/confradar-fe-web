"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Info,
  MoreVertical,
  Pencil,
  RotateCcw,
  Ban,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/redux/hooks/useAuth";

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useViewRegisteredUsersForConferenceQuery } from "@/redux/services/conference.service";
import { useUpdateOwnConferenceStatusMutation } from "@/redux/services/status.service";
import { usePublishResearchPaperMutation } from "@/redux/services/paper.service";

import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateStatus1/index";
import { DeleteConferenceStatus } from "@/components/molecules/Status/DeleteStatus";
import { RequestConferenceApproval } from "@/components/molecules/Status/RequestStatus";
import { HistoryTimelineStatus } from "@/components/molecules/Status/HistoryTimelineStatus";
import { RegisteredUsersModal } from "@/components/molecules/Conference/ConferenceDetail/RightSidebar/RegisterUserSection/RegisteredUsersModal";
import { DisableTechConferenceModal } from "@/components/molecules/Status/DisableTechConference";
import { EnableTechConferenceModal } from "@/components/molecules/Status/EnableTechConference";

import { HeaderSection } from "./HeaderSection";
import { RightSidebar } from "./RightSidebar";
import { LeftPanel } from "./LeftPanel";

import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";
import type { TabId } from "./constants/tab";
import type { ApiResponse } from "@/types/api.type";

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
  const [resumeEditingOpen, setResumeEditingOpen] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openEnableModal, setOpenEnableModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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

  const [updateStatus] = useUpdateOwnConferenceStatusMutation();
  const [publishPapers] = usePublishResearchPaperMutation();

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
          <span className="text-gray-600 font-medium">Đang tải thông tin...</span>
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
            <Button onClick={() => router.back()} className="w-full bg-blue-600 hover:bg-blue-700">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.userId === conference.createdBy;

  let updateRoute: string | null = null;
  if (conference.isResearchConference) {
    if (isOrganizer) {
      updateRoute = `/workspace/organizer/manage-conference/update-research-conference/${conference.conferenceId}`;
    }
  } else {
    if (isOrganizer) {
      updateRoute = `/workspace/organizer/manage-conference/update-tech-conference/${conference.conferenceId}`;
    } else if (isCollaborator && isOwner) {
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

  const isResearchAndCompleted = 
    conferenceType === "research" && 
    conference.conferenceStatusId && 
    getStatusName(conference.conferenceStatusId) === "Completed";


    const handlePublishPapers = async () => {
      if (!conference?.conferenceId || isPublishing) return; 

      setIsPublishing(true);
      try {
        await publishPapers({ conferenceId: conference.conferenceId }).unwrap();
        toast.success("Bài báo đã được xuất bản thành công!");
        handleRefetch();
      } catch (err) {
        toast.error("Không thể xuất bản bài báo. Vui lòng thử lại.");
      } finally {
        setIsPublishing(false); 
      }
    };

  const isTechConfOfCollaborator =
    conferenceType === "technical" &&
    isOrganizer &&
    conference.isInternalHosted === false;

  const disableButton = isTechConfOfCollaborator &&
    conference.conferenceStatusId === "7f2dcc1a-a107-4ed4-827e-eb994cbb648d" ? (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={() => setOpenDisableModal(true)}
    >
      <Ban className="w-4 h-4" />
      Vô hiệu hóa
    </Button>
  ) : null;

  const enableButton = isTechConfOfCollaborator &&
    conference.conferenceStatusId &&
    getStatusName(conference.conferenceStatusId) === "Disabled" ? (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
      onClick={() => setOpenEnableModal(true)}
    >
      <RotateCcw className="w-4 h-4" />
      Khôi phục
    </Button>
  ) : null;

  // const extraActions = (
  //   <>
  //     {disableButton}
  //     {enableButton}
  //   </>
  // );

  const extraActions = (
  <>
    {isResearchAndCompleted && (
      <Button
        variant="outline"
        size="sm"
        disabled={isPublishing} 
        className="gap-1.5 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
        onClick={handlePublishPapers}
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang xuất bản...
          </>
        ) : (
          <>
            <ArrowUp className="w-4 h-4" />
            Xuất bản 
          </>
        )}
      </Button>
    )}

    {isTechConfOfCollaborator &&
      conference.conferenceStatusId === "7f2dcc1a-a107-4ed4-827e-eb994cbb648d" && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => setOpenDisableModal(true)}
        >
          <Ban className="w-4 h-4" />
          Vô hiệu hóa
        </Button>
      )}

    {isTechConfOfCollaborator &&
      conference.conferenceStatusId &&
      getStatusName(conference.conferenceStatusId) === "Disabled" && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={() => setOpenEnableModal(true)}
        >
          <RotateCcw className="w-4 h-4" />
          Khôi phục
        </Button>
      )}
  </>
);

  const actions = isOwner ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="border border-gray-200">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {conference.conferenceStatusId &&
          (["OnHold", "Draft", "Preparing"].includes(getStatusName(conference.conferenceStatusId)) ||
          (isOrganizer && getStatusName(conference.conferenceStatusId) === "Ready")) &&
          updateRoute && (
            <DropdownMenuItem
              onClick={() => router.push(updateRoute)}
              className="cursor-pointer flex items-center gap-2 text-blue-600"
            >
              <Pencil className="w-4 h-4" />
              Chỉnh sửa thông tin
            </DropdownMenuItem>
          )}

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
          !["Draft", "Deleted", "Rejected", "Cancelled"].includes(getStatusName(conference.conferenceStatusId)) && (
            <DropdownMenuItem
              onClick={() => setStatusDialogOpen(true)}
              className="cursor-pointer flex items-center gap-2 text-purple-600"
            >
              <RotateCcw className="w-4 h-4" />
              Cập nhật trạng thái
            </DropdownMenuItem>
          )}

        {conferenceType === "technical" &&
          isCollaborator &&
          conference.conferenceStatusId &&
          getStatusName(conference.conferenceStatusId) === "Rejected" && (
            <DropdownMenuItem
              onClick={() => setResumeEditingOpen(true)}
              className="cursor-pointer flex items-center gap-2 text-blue-600"
            >
              <Pencil className="w-4 h-4" />
              Tiếp tục chỉnh sửa
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSection
        conference={conference}
        onBack={() => router.back()}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        primaryTab={primaryTab}
        onPrimaryTabChange={setPrimaryTab}
        extraActions={extraActions}
        actions={actions}
      />

      <UpdateConferenceStatus
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        conference={conference}
        conferenceType={conferenceType || "technical"}
        contract={conference.contract ?? null}
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

      <DisableTechConferenceModal
        open={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        conferenceId={conference.conferenceId!}
        conferenceName={conference.conferenceName!}
        conferenceStatusId={conference.conferenceStatusId!}
        onSuccess={handleRefetch}
      />

      <EnableTechConferenceModal
        open={openEnableModal}
        onClose={() => setOpenEnableModal(false)}
        conferenceId={conference.conferenceId!}
        conferenceName={conference.conferenceName!}
        conferenceStatusId={conference.conferenceStatusId!}
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

      <Dialog open={resumeEditingOpen} onOpenChange={setResumeEditingOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Info className="w-5 h-5" />
              Tiếp tục chỉnh sửa
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Hội thảo của bạn đã bị từ chối, chuyển sang trạng thái tiếp tục chỉnh sửa để gửi lại cho ConfRadar!
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResumeEditingOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!conference?.conferenceId) return;
                const draftStatus = statuses.find((s) => s.conferenceStatusName === "Draft");
                if (!draftStatus) {
                  toast.error("Không tìm thấy trạng thái Draft");
                  return;
                }
                try {
                  const res: ApiResponse = await updateStatus({
                    confid: conference.conferenceId,
                    newStatus: draftStatus.conferenceStatusId,
                    reason: "Chỉnh sửa sau khi bị từ chối",
                  }).unwrap();
                  if (res.success) {
                    toast.success("Đã chuyển về trạng thái chỉnh sửa!");
                    handleRefetch();
                    setResumeEditingOpen(false);
                  } else {
                    toast.error(res.message || "Thất bại");
                  }
                } catch (err) {
                  toast.error("Có lỗi xảy ra");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              currentUserId={user?.userId}
            />
          </div>

          <RightSidebar
            conference={conference}
            conferenceId={conference.conferenceId!}
            isCollaborator={isCollaborator}
            conferenceType={conferenceType}
            isOwnConference={isOwner}
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
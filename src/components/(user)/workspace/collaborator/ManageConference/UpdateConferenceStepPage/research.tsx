"use client";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllRankingCategoriesQuery } from "@/redux/services/category.service";

// Shared Components
import {
  StepIndicator,
  NavigationButtons,
  StepContainer,
  LoadingOverlay,
  PageHeader,
  PhaseModal,
} from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/components/index";

// Shared Forms
import { PolicyForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/PolicyForm";
import { MediaForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/MediaForm";
import { SponsorForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/SponsorForm";

// Research-Specific Forms
import { ResearchBasicInfoForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchBasicInfoForm";
import { ResearchDetailForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchDetailForm";
import { ResearchPhaseForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchPhaseForm";
import { ResearchPriceForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchPriceForm";
import { MaterialsForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/MaterialsForm";
import { ResearchSessionForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchSessionForm";

// Hooks — ✅ Đã import useResearchConferenceData
import {
  useStepNavigation,
  useResearchFormSubmit,
  useValidation,
  useResearchForm,
  useModalState,
  useDeleteTracking,
  useResearchConferenceData, // ✅ Đúng hook cho research
} from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/hooks/index";

// Validations
import {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateBasicForm,
  validateResearchTimeline,
} from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/validations";

// Constants
import { RESEARCH_STEP_LABELS, RESEARCH_MAX_STEP } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/constants";

// Redux
import { useAppDispatch } from "@/redux/hooks/hooks";
import { setMaxStep } from "@/redux/slices/conferenceStep.slice";

export default function UpdateResearchConferenceStepPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const conferenceId = params.id as string;

  if (!conferenceId) {
    throw new Error("Conference ID is required");
  }

  // API Queries
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();
  const { data: rankingData, isLoading: isRankingLoading } = useGetAllRankingCategoriesQuery();

  // DELETE TRACKING
  const {
    trackDeletedTicket,
    trackDeletedSession,
    trackDeletedPolicy,
    trackDeletedMaterial,
    trackDeletedRankingFile,
    trackDeletedRankingReference,
    trackDeletedMedia,
    trackDeletedSponsor,
    resetDeleteTracking,
  } = useDeleteTracking();

  // Custom Hooks
  const {
    currentStep,
    completedSteps,
    handleNext,
    handlePrevious,
    handleGoToStep,
    handleSetMode,
    handleReset,
    isStepCompleted,
  } = useStepNavigation();

  const {
    isSubmitting,
    submitBasicInfo,
    submitResearchDetail,
    submitResearchPhase,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMaterials,
    submitMedia,
    submitSponsors,
  } = useResearchFormSubmit();

  const { validationErrors, validate, clearError } = useValidation();

  const {
    basicForm,
    setBasicForm,
    researchDetail,
    setResearchDetail,
    researchPhases,
    setResearchPhases,
    tickets,
    setTickets,
    sessions,
    setSessions,
    policies,
    setPolicies,
    refundPolicies,
    setRefundPolicies,
    researchMaterials,
    setResearchMaterials,
    rankingFiles,
    setRankingFiles,
    rankingReferences,
    setRankingReferences,
    mediaList,
    setMediaList,
    sponsors,
    setSponsors,
    resetAllForms,
  } = useResearchForm();

  const { isPhaseModalOpen, openPhaseModal, closePhaseModal } = useModalState();

  // ✅ LOAD RESEARCH CONFERENCE DATA — ĐÃ SỬA TÊN HOOK
  const { isLoading: isConferenceLoading, isError: isConferenceError } = useResearchConferenceData({
    conferenceId,
    onLoad: ({
      basicForm,
      researchDetail,
      researchPhases,
      tickets,
      sessions,
      policies,
      researchMaterials,
      rankingFiles,
      rankingReferences,
      mediaList,
      sponsors,
    }) => {
      setBasicForm(basicForm);
      setResearchDetail(researchDetail);
      setResearchPhases(researchPhases);
      setTickets(tickets);
      setSessions(sessions);
      setPolicies(policies);
      setRefundPolicies(refundPolicies);
      setResearchMaterials(researchMaterials);
      setRankingFiles(rankingFiles);
      setRankingReferences(rankingReferences);
      setMediaList(mediaList);
      setSponsors(sponsors);
    },
    onError: (error) => {
      console.error("Failed to load research conference:", error);
      toast.error("Không thể tải dữ liệu hội thảo!");
    },
  });

  // Initialize
  useEffect(() => {
    dispatch(setMaxStep(RESEARCH_MAX_STEP));
    handleSetMode("edit");
    handleGoToStep(1);

    return () => {
      handleReset();
      resetAllForms();
      resetDeleteTracking();
    };
  }, [dispatch]);

  // Prepare options
  const categoryOptions = useMemo(
    () =>
      categoriesData?.data?.map((category) => ({
        value: category.conferenceCategoryId,
        label: category.conferenceCategoryName,
      })) || [],
    [categoriesData]
  );

  const roomOptions = useMemo(
    () =>
      roomsData?.data?.map((room) => ({
        value: room.roomId,
        label: `${room.number} - ${room.displayName}`,
      })) || [],
    [roomsData]
  );

  const cityOptions = useMemo(
    () =>
      citiesData?.data?.map((city) => ({
        value: city.cityId,
        label: city.cityName || "N/A",
      })) || [],
    [citiesData]
  );

  const rankingOptions = useMemo(
    () =>
      rankingData?.data?.map((ranking) => ({
        value: ranking.rankId,
        label: ranking.rankName || "N/A",
      })) || [],
    [rankingData]
  );

  const handleFieldBlur = (field: string) => {
    switch (field) {
      case "conferenceName":
        validate(field, () => validateConferenceName(basicForm.conferenceName));
        break;
      case "dateRange":
        if (basicForm.dateRange != null) {
          validate(field, () => validateDateRange(basicForm.dateRange!));
        } else {
          clearError(field);
        }
        break;
      case "totalSlot":
        validate(field, () => validateTotalSlot(basicForm.totalSlot));
        break;
      case "ticketSaleStart":
        validate(field, () =>
          validateTicketSaleStart(basicForm.ticketSaleStart, basicForm.startDate)
        );
        break;
      case "ticketSaleDuration":
        if (
          basicForm.ticketSaleDuration != null &&
          basicForm.ticketSaleStart &&
          basicForm.startDate
        ) {
          validate(field, () =>
            validateTicketSaleDuration(
              basicForm.ticketSaleDuration!,
              basicForm.ticketSaleStart!,
              basicForm.startDate!
            )
          );
        } else {
          clearError(field);
        }
        break;
    }
  };

  // === SUBMIT HANDLERS — TRẢ VỀ { success: boolean } ===
  const handleBasicSubmit = async () => {
    const validationResult = validateBasicForm(basicForm);
    if (!validationResult.isValid) return { success: false };
    const result = await submitBasicInfo(basicForm);
    if (result.success) handleNext();
    return result;
  };

  const handleResearchDetailSubmit = async () => {
    const result = await submitResearchDetail(researchDetail);
    if (result.success) handleNext();
    return result;
  };

  const handleTimelineSubmit = async () => {
    const mainPhase = researchPhases[0];
    if (!mainPhase) {
      toast.error("Main timeline là bắt buộc!");
      return { success: false };
    }

    const mainValidation = validateResearchTimeline(mainPhase, basicForm.ticketSaleStart);
    if (!mainValidation.isValid) {
      toast.error(`Lỗi ở Main Timeline: ${mainValidation.error}`);
      return { success: false };
    }
    if (mainValidation.warning) {
      toast.warning(`Cảnh báo ở Main Timeline: ${mainValidation.warning}`);
    }

    const waitlistPhase = researchPhases[1];
    if (waitlistPhase) {
      const hasWaitlistData =
        waitlistPhase.registrationStartDate ||
        waitlistPhase.fullPaperStartDate ||
        waitlistPhase.reviewStartDate ||
        waitlistPhase.reviseStartDate ||
        waitlistPhase.cameraReadyStartDate;

      if (hasWaitlistData) {
        const waitlistValidation = validateResearchTimeline(waitlistPhase, basicForm.ticketSaleStart);
        if (!waitlistValidation.isValid) {
          toast.error(`Lỗi ở Waitlist Timeline: ${waitlistValidation.error}`);
          return { success: false };
        }
        if (waitlistValidation.warning) {
          toast.warning(`Cảnh báo ở Waitlist Timeline: ${waitlistValidation.warning}`);
        }

        if (mainPhase.cameraReadyEndDate && waitlistPhase.registrationStartDate) {
          const mainEnd = new Date(mainPhase.cameraReadyEndDate);
          const waitlistStart = new Date(waitlistPhase.registrationStartDate);
          if (waitlistStart <= mainEnd) {
            toast.error("Waitlist timeline phải bắt đầu sau khi Main timeline kết thúc!");
            return { success: false };
          }
        }
      }
    }

    const result = await submitResearchPhase(researchPhases);
    if (result.success) handleNext();
    return result;
  };

  const handlePriceSubmit = async () => {
    const result = await submitPrice(tickets);
    if (result.success) handleNext();
    return result;
  };

  const handleSessionsSubmit = async () => {
    const result = await submitSessions(sessions, basicForm.startDate, basicForm.endDate);
    if (result.success) handleNext();
    return result;
  };

  const handlePoliciesSubmit = async () => {
    const result = await submitPolicies(policies, refundPolicies);
    if (result.success) handleNext();
    return result;
  };

  const handleMaterialsSubmit = async () => {
    const result = await submitMaterials(researchMaterials, rankingFiles, rankingReferences);
    if (result.success) handleNext();
    return result;
  };

  const handleMediaSubmit = async () => {
    const result = await submitMedia(mediaList);
    if (result.success) handleNext();
    return result;
  };

  const handleSponsorsSubmit = async () => {
    const result = await submitSponsors(sponsors);
    if (result.success) handleNext();
    return result;
  };

  const isLoading = isConferenceLoading || isCategoriesLoading || isRoomsLoading || isCitiesLoading || isRankingLoading;

  if (isLoading) {
    return <LoadingOverlay message="Đang tải dữ liệu hội thảo..." />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title="Chỉnh sửa hội thảo nghiên cứu"
        description="Cập nhật thông tin hội thảo nghiên cứu"
      />

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        maxStep={RESEARCH_MAX_STEP}
        stepLabels={RESEARCH_STEP_LABELS}
        onStepClick={handleGoToStep}
      />

      {isSubmitting && <LoadingOverlay message="Đang xử lý... Vui lòng đợi" />}

      {/* STEP 1: Basic Info */}
      {currentStep === 1 && (
        <StepContainer stepNumber={1} title="Thông tin cơ bản" isCompleted={isStepCompleted(1)}>
          <ResearchBasicInfoForm
            value={basicForm}
            onChange={setBasicForm}
            validationErrors={validationErrors}
            onFieldBlur={handleFieldBlur}
            categoryOptions={categoryOptions}
            cityOptions={cityOptions}
            isCategoriesLoading={isCategoriesLoading}
            isCitiesLoading={isCitiesLoading}
          />
          <NavigationButtons
            currentStep={1}
            isSubmitting={isSubmitting}
            showPrevious={false}
            onPrevious={handlePrevious}
            onSubmit={handleBasicSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 2: Research Detail */}
      {currentStep === 2 && (
        <StepContainer stepNumber={2} title="Chi tiết nghiên cứu" isCompleted={isStepCompleted(2)}>
          <ResearchDetailForm
            formData={researchDetail}
            onChange={setResearchDetail}
            rankingOptions={rankingOptions}
            isRankingLoading={isRankingLoading}
            validationErrors={validationErrors}
          />
          <NavigationButtons
            currentStep={2}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onSubmit={handleResearchDetailSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 3: Timeline/Research Phase */}
      {currentStep === 3 && (
        <StepContainer stepNumber={3} title="Timeline & Giai đoạn" isCompleted={isStepCompleted(3)}>
          <ResearchPhaseForm
            phases={researchPhases}
            onPhasesChange={setResearchPhases}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            eventStartDate={basicForm.startDate}
            eventEndDate={basicForm.endDate}
            revisionAttemptAllowed={researchDetail.revisionAttemptAllowed}
          />
          <NavigationButtons
            currentStep={3}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onSubmit={handleTimelineSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 4: Price */}
      {currentStep === 4 && (
        <StepContainer stepNumber={4} title="Giá vé" isCompleted={isStepCompleted(4)}>
          <ResearchPriceForm
            tickets={tickets}
            onTicketsChange={setTickets}
            onRemoveTicket={trackDeletedTicket}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            researchPhases={researchPhases}
            maxTotalSlot={basicForm.totalSlot}
            allowListener={researchDetail.allowListener}
          />
          <NavigationButtons
            currentStep={4}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onSubmit={handlePriceSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 5: Sessions */}
      {currentStep === 5 && (
        <StepContainer stepNumber={5} title="Phiên họp (Tùy chọn)" isCompleted={isStepCompleted(5)}>
          <ResearchSessionForm
            sessions={sessions}
            onSessionsChange={setSessions}
            onRemoveSession={trackDeletedSession}
            eventStartDate={basicForm.startDate}
            eventEndDate={basicForm.endDate}
            roomOptions={roomOptions}
            roomsData={roomsData}
            isRoomsLoading={isRoomsLoading}
          />
          <NavigationButtons
            currentStep={5}
            isSubmitting={isSubmitting}
            showSkip={sessions.length === 0}
            canSkip={sessions.length === 0}
            onPrevious={handlePrevious}
            onSubmit={handleSessionsSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 6: Policies */}
      {currentStep === 6 && (
        <StepContainer stepNumber={6} title="Chính sách (Tùy chọn)" isCompleted={isStepCompleted(6)}>
          <PolicyForm
            policies={policies}
            onPoliciesChange={setPolicies}
            onRemovePolicy={trackDeletedPolicy}
            eventStartDate={basicForm.startDate}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
          />
          <NavigationButtons
            currentStep={6}
            isSubmitting={isSubmitting}
            showSkip={policies.length === 0}
            canSkip={policies.length === 0}
            onPrevious={handlePrevious}
            onSubmit={handlePoliciesSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 7: Materials */}
      {currentStep === 7 && (
        <StepContainer stepNumber={7} title="Tài liệu & Xếp hạng (Tùy chọn)" isCompleted={isStepCompleted(7)}>
          <MaterialsForm
            materials={researchMaterials}
            rankingFiles={rankingFiles}
            rankingReferences={rankingReferences}
            onMaterialsChange={setResearchMaterials}
            onRankingFilesChange={setRankingFiles}
            onRankingReferencesChange={setRankingReferences}
            onRemoveMaterial={trackDeletedMaterial}
            onRemoveRankingFile={trackDeletedRankingFile}
            onRemoveRankingReference={trackDeletedRankingReference}
          />
          <NavigationButtons
            currentStep={7}
            isSubmitting={isSubmitting}
            showSkip={researchMaterials.length === 0 && rankingFiles.length === 0 && rankingReferences.length === 0}
            canSkip={researchMaterials.length === 0}
            onPrevious={handlePrevious}
            onSubmit={handleMaterialsSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 8: Media */}
      {currentStep === 8 && (
        <StepContainer stepNumber={8} title="Media (Tùy chọn)" isCompleted={isStepCompleted(8)}>
          <MediaForm
            mediaList={mediaList}
            onMediaListChange={setMediaList}
            onRemoveMedia={trackDeletedMedia}
          />
          <NavigationButtons
            currentStep={8}
            isSubmitting={isSubmitting}
            showSkip={mediaList.length === 0}
            canSkip={mediaList.length === 0}
            onPrevious={handlePrevious}
            onSubmit={handleMediaSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 9: Sponsors */}
      {currentStep === 9 && (
        <StepContainer stepNumber={9} title="Nhà tài trợ (Tùy chọn)" isCompleted={isStepCompleted(9)}>
          <SponsorForm
            sponsors={sponsors}
            onSponsorsChange={setSponsors}
            onRemoveSponsor={trackDeletedSponsor}
          />
          <NavigationButtons
            currentStep={9}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onSubmit={handleSponsorsSubmit}
          />
        </StepContainer>
      )}
    </div>
  );
}
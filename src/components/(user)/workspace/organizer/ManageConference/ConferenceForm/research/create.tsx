"use client";
import { toast } from "sonner";
import { useEffect } from "react";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllRankingCategoriesQuery } from "@/redux/services/category.service";

// Shared Components
import {
  StepIndicator,
  CreateNavigationButtons as NavigationButtons, 
  StepContainer,
  LoadingOverlay,
  PageHeader,
  PhaseModal,
} from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/components/index";

// Shared Forms
import { PolicyForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/PolicyForm"
import { MediaForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/MediaForm";
import { SponsorForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/SponsorForm";

// Research-Specific Forms
import { ResearchBasicInfoForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchBasicInfoForm";
import { ResearchDetailForm } from "../../../../collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchDetailForm";
import { ResearchPhaseForm } from "../../../../collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchPhaseForm";
import { ResearchPriceForm } from "../../../../collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchPriceForm";
import { MaterialsForm } from "../../../../collaborator/ManageConference/CreateConferenceStepPage/forms/research/MaterialsForm";
import { SessionForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/SessionForm"; 
import { ResearchSessionForm } from "@/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/forms/research/ResearchSessionForm";

// Hooks
import {
  useStepNavigation,
  useResearchFormSubmit,
  useValidation,
  useResearchForm,
  useModalState,
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

export default function CreateResearchConferenceStepPage() {
  const dispatch = useAppDispatch();

  // API Queries
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();
  const { data: rankingData, isLoading: isRankingLoading } = useGetAllRankingCategoriesQuery();

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

  // Initialize
  useEffect(() => {
    dispatch(setMaxStep(RESEARCH_MAX_STEP)); 
    handleSetMode("create");
    handleGoToStep(1);

    return () => {
      handleReset();
      resetAllForms();
    };
  }, [dispatch]);

  // Prepare options
  const categoryOptions =
    categoriesData?.data?.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName,
    })) || [];

  const roomOptions =
    roomsData?.data?.map((room) => ({
      value: room.roomId,
      label: `${room.number} - ${room.displayName} - ${room.destinationId}`,
    })) || [];

  const cityOptions =
    citiesData?.data?.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    })) || [];

  const rankingOptions =
    rankingData?.data?.map((ranking) => ({
      value: ranking.rankId,
      label: ranking.rankName || "N/A",
    })) || [];

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

  // Submit handlers — ✅ KHÔNG TRẢ VỀ { success: boolean }
  const handleBasicSubmit = () => {
    const validationResult = validateBasicForm(basicForm);
    if (!validationResult.isValid) return;
    submitBasicInfo(basicForm).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handleResearchDetailSubmit = () => {
    submitResearchDetail(researchDetail).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handleTimelineSubmit = () => {
    const mainPhase = researchPhases[0];
    if (!mainPhase) {
      toast.error("Main timeline là bắt buộc!");
      return;
    }

    const mainValidation = validateResearchTimeline(mainPhase, basicForm.ticketSaleStart);
    if (!mainValidation.isValid) {
      toast.error(`Lỗi ở Main Timeline: ${mainValidation.error}`);
      return;
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
          return;
        }
        if (waitlistValidation.warning) {
          toast.warning(`Cảnh báo ở Waitlist Timeline: ${waitlistValidation.warning}`);
        }

        if (mainPhase.cameraReadyEndDate && waitlistPhase.registrationStartDate) {
          const mainEnd = new Date(mainPhase.cameraReadyEndDate);
          const waitlistStart = new Date(waitlistPhase.registrationStartDate);
          
          if (waitlistStart <= mainEnd) {
            toast.error("Waitlist timeline phải bắt đầu sau khi Main timeline kết thúc!");
            return;
          }
        }
      }
    }

    submitResearchPhase(researchPhases).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handlePriceSubmit = () => {
    submitPrice(tickets).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handleSessionsSubmit = () => {
    submitSessions(sessions, basicForm.startDate, basicForm.endDate).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handlePoliciesSubmit = () => {
    submitPolicies(policies, refundPolicies).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handleMaterialsSubmit = () => {
    submitMaterials(researchMaterials, rankingFiles, rankingReferences).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handleMediaSubmit = () => {
    submitMedia(mediaList).then((result) => {
      if (result.success) handleNext();
    });
  };

  const handleSponsorsSubmit = () => {
    submitSponsors(sponsors).then((result) => {
      if (result.success) handleNext();
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title="Tạo hội thảo nghiên cứu mới"
        description="Điền đầy đủ thông tin để tạo hội thảo nghiên cứu"
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
            isStepCompleted={isStepCompleted(1)}
            isSubmitting={isSubmitting}
            showPrevious={false}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
            isStepCompleted={isStepCompleted(2)}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
            isStepCompleted={isStepCompleted(3)}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            researchPhases={researchPhases}
            maxTotalSlot={basicForm.totalSlot}
            allowListener={researchDetail.allowListener} 
          />

          <PhaseModal
            isOpen={isPhaseModalOpen}
            onClose={closePhaseModal}
            onAdd={(phase) => {
              /* Handle add phase logic */
            }}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            ticketPrice={0}
            maxSlot={basicForm.totalSlot}
            usedSlots={0}
            existingPhases={[]}
          />

          <NavigationButtons
            currentStep={4}
            isStepCompleted={isStepCompleted(4)}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
            eventStartDate={basicForm.startDate}
            eventEndDate={basicForm.endDate}
            roomOptions={roomOptions}
            roomsData={roomsData}
            isRoomsLoading={isRoomsLoading}
          />          

          <NavigationButtons
            currentStep={5}
            isStepCompleted={isStepCompleted(5)}
            isSubmitting={isSubmitting}
            showSkip={sessions.length === 0}
            canSkip={sessions.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
            eventStartDate={basicForm.startDate}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
          />

          <NavigationButtons
            currentStep={6}
            isStepCompleted={isStepCompleted(6)}
            isSubmitting={isSubmitting}
            showSkip={policies.length === 0 && refundPolicies.length === 0}
            canSkip={policies.length === 0 && refundPolicies.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
          />

          <NavigationButtons
            currentStep={7}
            isStepCompleted={isStepCompleted(7)}
            isSubmitting={isSubmitting}
            showSkip={researchMaterials.length === 0 && rankingFiles.length === 0 && rankingReferences.length === 0}
            canSkip={researchMaterials.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleMaterialsSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 8: Media */}
      {currentStep === 8 && (
        <StepContainer stepNumber={8} title="Media (Tùy chọn)" isCompleted={isStepCompleted(8)}>
          <MediaForm mediaList={mediaList} onMediaListChange={setMediaList} />

          <NavigationButtons
            currentStep={8}
            isStepCompleted={isStepCompleted(8)}
            isSubmitting={isSubmitting}
            showSkip={mediaList.length === 0}
            canSkip={mediaList.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleMediaSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 9: Sponsors (Final) */}
      {currentStep === 9 && (
        <StepContainer stepNumber={9} title="Nhà tài trợ (Tùy chọn)" isCompleted={isStepCompleted(9)}>
          <SponsorForm sponsors={sponsors} onSponsorsChange={setSponsors} />

          <NavigationButtons
            currentStep={9}
            isStepCompleted={isStepCompleted(9)}
            isSubmitting={isSubmitting}
            showNext={false}
            submitButtonText={
              isSubmitting
                ? "Đang hoàn tất..."
                : isStepCompleted(9)
                  ? "Đã hoàn thành"
                  : sponsors.length > 0
                    ? "Hoàn tất"
                    : "Hoàn tất (Bỏ qua)"
            }
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSponsorsSubmit}
          />
        </StepContainer>
      )}
    </div>
  );
}
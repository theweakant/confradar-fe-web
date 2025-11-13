"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";

// Shared Components
import {
  StepIndicator,
  StepContainer,
  LoadingOverlay,
  PageHeader,
} from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/components/index";

// Flexible Navigation Buttons (MỚI)
import { FlexibleNavigationButtons } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/components/FlexibleNavigationButtons";

// Shared Forms
import { PolicyForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/forms/PolicyForm";
import { MediaForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/forms/MediaForm";
import { SponsorForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/forms/SponsorForm";
import { BasicInfoForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/forms/BasicInfoForm";
import { PriceForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/forms/PriceForm";
import { SessionForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/forms/SessionForm";

import {
  useStepNavigation,
  useFormSubmit,
  useValidation,
  useConferenceForm,
  useDeleteTracking,
  useTechConferenceData,
} from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/hooks/index";

// Validations
import {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateBasicForm,
} from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/validations";

// Constants
import { TECH_STEP_LABELS, TECH_MAX_STEP } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceStep/constants";

// Redux
import { useAppDispatch } from "@/redux/hooks/hooks";
import { setMaxStep } from "@/redux/slices/conferenceStep.slice";

export default function UpdateTechConferenceStepPage() {
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

  // DELETE TRACKING
  const {
    trackDeletedTicket,
    trackDeletedSession,
    trackDeletedPolicy,
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
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMedia,
    submitSponsors,
    submitAll, 
  } = useFormSubmit();

  const { validationErrors, validate, clearError } = useValidation();

  const {
    basicForm,
    setBasicForm,
    tickets,
    setTickets,
    sessions,
    setSessions,
    policies,
    setPolicies,
    refundPolicies,
    setRefundPolicies,
    mediaList,
    setMediaList,
    sponsors,
    setSponsors,
    resetAllForms,
  } = useConferenceForm();

  const { isLoading: isConferenceLoading, isError: isConferenceError } = useTechConferenceData({
    conferenceId,
    onLoad: ({
      basicForm,
      tickets,
      sessions,
      policies,
      refundPolicies,
      mediaList,
      sponsors,
    }) => {
      setBasicForm(basicForm);
      setTickets(tickets);
      setSessions(sessions);
      setPolicies(policies);
      setRefundPolicies(refundPolicies);
      setMediaList(mediaList);
      setSponsors(sponsors);
    },
    onError: (error) => {
      console.error("Failed to load tech conference:", error);
      toast.error("Không thể tải dữ liệu hội thảo!");
    },
  });

  // Initialize
  useEffect(() => {
    dispatch(setMaxStep(TECH_MAX_STEP));
    handleSetMode("edit");
    handleGoToStep(1);

    return () => {
      handleReset();
      resetAllForms();
      resetDeleteTracking();
    };
  }, [dispatch]);

  // === PREPARE OPTIONS ===
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

  // === FIELD VALIDATION ON BLUR ===
  const handleFieldBlur = useCallback((field: string) => {
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
  }, [basicForm, validate, clearError]);

  const handlePreviousStep = () => handlePrevious();
  const handleNextStep = () => handleNext();

  const   handleUpdateCurrentStep = async () => {
  switch (currentStep) {
    case 1:
      const basicValidation = validateBasicForm(basicForm);
      if (!basicValidation.isValid) {
        toast.error(`Thông tin cơ bản: ${basicValidation.message}`);
        return { success: false };
      }
      return await submitBasicInfo(basicForm);

    case 2:
      if (tickets.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 loại vé!");
        return { success: false };
      }
      return await submitPrice(tickets);

    case 3:
      if (sessions.length > 0) {
        if (!basicForm.startDate || !basicForm.endDate) {
          toast.error("Thiếu ngày bắt đầu/kết thúc hội thảo!");
          return { success: false };
        }
        const hasStart = sessions.some(s => s.date === basicForm.startDate);
        const hasEnd = sessions.some(s => s.date === basicForm.endDate);
        if (!hasStart || !hasEnd) {
          toast.error("Phải có phiên họp vào ngày bắt đầu và kết thúc!");
          return { success: false };
        }
      }
      return await submitSessions(sessions, basicForm.startDate!, basicForm.endDate!);

    case 4:
      return await submitPolicies(policies);
    case 5:
      return await submitMedia(mediaList);
    case 6:
      return await submitSponsors(sponsors);
    default:
      toast.error(`Bước không hợp lệ: ${currentStep}`);
      return { success: false };
  }
  };

  // === UPDATE ALL STEPS (ONLY FOR STEP 6) ===
  const handleUpdateAll = async (): Promise<{ success: boolean; errors?: string[] }> => {
    const result = await submitAll({
      basicForm,
      tickets,
      sessions,
      policies,
      mediaList,
      sponsors,
    });

    if (!result) {
      return { success: false, errors: ["Không nhận được phản hồi từ server"] };
    }

    return result;
  };

  const isLoading = isConferenceLoading || isCategoriesLoading || isRoomsLoading || isCitiesLoading;

  if (isLoading) {
    return <LoadingOverlay message="Đang tải dữ liệu hội thảo..." />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title="Chỉnh sửa hội thảo công nghệ"
        description="Cập nhật thông tin hội thảo công nghệ"
      />

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        maxStep={TECH_MAX_STEP}
        stepLabels={TECH_STEP_LABELS}
        onStepClick={handleGoToStep}
      />

      {isSubmitting && <LoadingOverlay message="Đang xử lý... Vui lòng đợi" />}

      {/* STEP 1: Basic Info */}
      {currentStep === 1 && (
        <StepContainer stepNumber={1} title="Thông tin cơ bản" isCompleted={isStepCompleted(1)}>
          <BasicInfoForm
            value={basicForm}
            onChange={setBasicForm}
            validationErrors={validationErrors}
            onFieldBlur={handleFieldBlur}
            categoryOptions={categoryOptions}
            cityOptions={cityOptions}
            isCategoriesLoading={isCategoriesLoading}
            isCitiesLoading={isCitiesLoading}
          />
          <FlexibleNavigationButtons
            currentStep={1}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            onNext={handleNextStep}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 2: Price */}
      {currentStep === 2 && (
        <StepContainer stepNumber={2} title="Giá vé" isCompleted={isStepCompleted(2)}>
          <PriceForm
            tickets={tickets}
            onTicketsChange={setTickets}
            onRemoveTicket={trackDeletedTicket}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            maxTotalSlot={basicForm.totalSlot}
          />
          <FlexibleNavigationButtons
            currentStep={2}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 3: Sessions */}
      {currentStep === 3 && (
        <StepContainer stepNumber={3} title="Phiên họp (Tùy chọn)" isCompleted={isStepCompleted(3)}>
          <SessionForm
            sessions={sessions}
            onSessionsChange={setSessions}
            onRemoveSession={trackDeletedSession}
            eventStartDate={basicForm.startDate}
            eventEndDate={basicForm.endDate}
            roomOptions={roomOptions}
            roomsData={roomsData}
            isRoomsLoading={isRoomsLoading}
          />
          <FlexibleNavigationButtons
            currentStep={3}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            isOptionalStep={true}
            isSkippable={sessions.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 4: Policies */}
      {currentStep === 4 && (
        <StepContainer stepNumber={4} title="Chính sách (Tùy chọn)" isCompleted={isStepCompleted(4)}>
          <PolicyForm
            policies={policies}
            onPoliciesChange={setPolicies}
            onRemovePolicy={trackDeletedPolicy}
            eventStartDate={basicForm.startDate}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
          />
          <FlexibleNavigationButtons
            currentStep={4}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            isOptionalStep={true}
            isSkippable={policies.length === 0 && refundPolicies.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 5: Media */}
      {currentStep === 5 && (
        <StepContainer stepNumber={5} title="Media (Tùy chọn)" isCompleted={isStepCompleted(5)}>
          <MediaForm
            mediaList={mediaList}
            onMediaListChange={setMediaList}
            onRemoveMedia={trackDeletedMedia}
          />
          <FlexibleNavigationButtons
            currentStep={5}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            isOptionalStep={true}
            isSkippable={mediaList.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 6: Sponsors */}
      {currentStep === 6 && (
        <StepContainer stepNumber={6} title="Nhà tài trợ (Tùy chọn)" isCompleted={isStepCompleted(6)}>
          <SponsorForm
            sponsors={sponsors}
            onSponsorsChange={setSponsors}
            onRemoveSponsor={trackDeletedSponsor}
          />
          <FlexibleNavigationButtons
            currentStep={6}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            isLastStep={true}
            onPrevious={handlePreviousStep}
            onUpdate={handleUpdateCurrentStep}
            onUpdateAll={handleUpdateAll}
          />
        </StepContainer>
      )}
    </div>
  );
}
// components/(user)/workspace/organizer/ManageConference/ConferenceForm/tech/TechConferenceStepForm.tsx
"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setMaxStep, setMode } from "@/redux/slices/conferenceStep.slice";

// API Queries
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";

// Shared Components
import {
  StepIndicator,
  StepContainer,
  LoadingOverlay,
  PageHeader,
} from "@/components/molecules/Conference/ConferenceStep/components/index";

import { FlexibleNavigationButtons } from "@/components/molecules/Conference/ConferenceStep/components/FlexibleNavigationButtons";

// Shared Forms
import { PolicyForm } from "@/components/molecules/Conference/ConferenceStep/forms/PolicyForm";
import { MediaForm } from "@/components/molecules/Conference/ConferenceStep/forms/MediaForm";
import { SponsorForm } from "@/components/molecules/Conference/ConferenceStep/forms/SponsorForm";
import { BasicInfoForm } from "@/components/molecules/Conference/ConferenceStep/forms/BasicInfoForm";
import { PriceForm } from "@/components/molecules/Conference/ConferenceStep/forms/PriceForm";
import { SessionForm } from "@/components/molecules/Conference/ConferenceStep/forms/SessionForm";

// Hooks
import {
  useStepNavigation,
  useFormSubmit,
  useValidation,
  useConferenceForm,
  useDeleteTracking,
  useTechConferenceData,
} from "@/components/molecules/Conference/ConferenceStep/hooks/index";

// Validations
import {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateBasicForm,
} from "@/components/molecules/Conference/ConferenceStep/validations";

// Constants
import { TECH_STEP_LABELS, TECH_MAX_STEP } from "@/components/molecules/Conference/ConferenceStep/constants";


const useMockDeleteTracking = () => {
  return useMemo(
    () => ({
      trackDeletedTicket: () => {},
      trackDeletedSession: () => {},
      trackDeletedPolicy: () => {},
      trackDeletedMedia: () => {},
      trackDeletedSponsor: () => {},
      resetDeleteTracking: () => {},
    }),
    []
  );
};


interface TechConferenceStepFormProps {
  mode: "create" | "edit";
  conferenceId?: string;
}


export default function TechConferenceStepForm({
  mode,
  conferenceId,
}: TechConferenceStepFormProps) {
  const dispatch = useAppDispatch();

  const userRole = useAppSelector((state) => state.auth.user?.role);
  const isInternalHosted = Boolean(userRole?.includes("Conference Organizer"));
  // === DELETE TRACKING ===
  const realDeleteTracking = useDeleteTracking();
  const mockDeleteTracking = useMockDeleteTracking();
  const deleteTracking = mode === "edit" ? realDeleteTracking : mockDeleteTracking;

  // === API QUERIES ===
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();

  // === HOOKS ===
  const {
    currentStep,
    activeStep,
    completedSteps,
    handleNext,
    handlePrevious,
    handleGoToStep,
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

  // === LOAD EXISTING DATA (EDIT ONLY) ===
  const { isLoading: isConferenceLoading } = useTechConferenceData({
    conferenceId: mode === "edit" ? conferenceId! : "",
    onLoad:
      mode === "edit"
        ? ({
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
          }
        : () => {},
    onError:
      mode === "edit"
        ? (error) => {
            console.error("Failed to load tech conference:", error);
            toast.error("Không thể tải dữ liệu hội thảo!");
          }
        : () => {},
  });

    useEffect(() => {
    if (mode === "create") {
      setBasicForm((prev) => ({ ...prev, isInternalHosted }));
    }
  }, [mode, isInternalHosted, setBasicForm]);

    useEffect(() => {
      dispatch(setMode(mode));
      dispatch(setMaxStep(TECH_MAX_STEP));
    }, [dispatch, mode]);

    
    useEffect(() => {
      return () => {
        handleReset();
        resetAllForms();
        if (mode === "edit") deleteTracking.resetDeleteTracking();
      };
    }, []); 

    const hasInitializedStep = useRef(false);

    useEffect(() => {
      if (hasInitializedStep.current) return;

      if (mode === "create") {
        handleGoToStep(1);
        hasInitializedStep.current = true;
      } else if (mode === "edit" && !isConferenceLoading) {
        handleGoToStep(1);
        hasInitializedStep.current = true;
      }
    }, [mode, isConferenceLoading, handleGoToStep]);


  // === OPTIONS ===
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

  // === VALIDATION ON BLUR ===
  const handleFieldBlur = useCallback(
    (field: string) => {
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
    },
    [basicForm, validate, clearError]
  );

  // ========================================
  // NAVIGATION
  // ========================================
  const handlePreviousStep = () => handlePrevious();
  const handleNextStep = () => handleNext();

  // ========================================
  // CREATE MODE: SUBMIT & NEXT
  // ========================================
  const handleBasicSubmit = async () => {
    const basicValidation = validateBasicForm(basicForm);
    if (!basicValidation.isValid) {
      toast.error(`Thông tin cơ bản: ${basicValidation.error || "Dữ liệu không hợp lệ"}`);
      return;
    }
    const result = await submitBasicInfo(basicForm);
    if (result.success) handleNext();
  };

  const handlePriceSubmit = async () => {
    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return;
    }
    const result = await submitPrice(tickets);
    if (result.success) handleNext();
  };

  const handleSessionsSubmit = async () => {
    if (sessions.length > 0) {
      if (!basicForm.startDate || !basicForm.endDate) {
        toast.error("Thiếu ngày bắt đầu/kết thúc hội thảo!");
        return;
      }
      const hasStart = sessions.some((s) => s.date === basicForm.startDate);
      const hasEnd = sessions.some((s) => s.date === basicForm.endDate);
      if (!hasStart || !hasEnd) {
        toast.error("Phải có phiên họp vào ngày bắt đầu và kết thúc!");
        return;
      }
    }
    const result = await submitSessions(sessions, basicForm.startDate!, basicForm.endDate!);
    if (result.success) handleNext();
  };

  const handlePoliciesSubmit = async () => {
    const result = await submitPolicies(policies);
    if (result.success) handleNext();
  };

  const handleMediaSubmit = async () => {
    const result = await submitMedia(mediaList);
    if (result.success) handleNext();
  };

  const handleSponsorsSubmit = async () => {
    await submitSponsors(sponsors);
    // Bước cuối → không cần handleNext()
  };

  // ========================================
  // UPDATE MODE: UPDATE CURRENT STEP
  // ========================================
  const handleUpdateCurrentStep = async () => {
    switch (currentStep) {
      case 1: {
        const basicValidation = validateBasicForm(basicForm);
        if (!basicValidation.isValid) {
          toast.error(`Thông tin cơ bản: ${basicValidation.error || "Dữ liệu không hợp lệ"}`);
          return { success: false };
        }
        return await submitBasicInfo(basicForm);
      }
      case 2: {
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại vé!");
          return { success: false };
        }
        return await submitPrice(tickets);
      }
      case 3: {
        if (sessions.length > 0) {
          if (!basicForm.startDate || !basicForm.endDate) {
            toast.error("Thiếu ngày bắt đầu/kết thúc hội thảo!");
            return { success: false };
          }
          const hasStart = sessions.some((s) => s.date === basicForm.startDate);
          const hasEnd = sessions.some((s) => s.date === basicForm.endDate);
          if (!hasStart || !hasEnd) {
            toast.error("Phải có phiên họp vào ngày bắt đầu và kết thúc!");
            return { success: false };
          }
        }
        return await submitSessions(sessions, basicForm.startDate!, basicForm.endDate!);
      }
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

  // ========================================
  // UPDATE ALL (edit mode only, step 6)
  // ========================================
  const handleUpdateAll = async () => {
    if (mode !== "edit") return { success: false };

    const result = await submitAll({
      basicForm,
      tickets,
      sessions,
      policies,
      mediaList,
      sponsors,
    });

    if (result?.success) {
      toast.success("Cập nhật toàn bộ hội thảo thành công!");
    } else {
      const errorMsg = result?.errors?.join("; ") || "Lưu toàn bộ thất bại";
      toast.error(errorMsg);
    }

    return result || { success: false };
  };

  // ========================================
  // LOADING
  // ========================================
  const isLoading =
    mode === "edit" &&
    (isConferenceLoading || isCategoriesLoading || isRoomsLoading || isCitiesLoading);

  if (isLoading) {
    return <LoadingOverlay message="Đang tải dữ liệu hội thảo..." />;
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title={mode === "create" ? "Tạo hội thảo công nghệ mới" : "Chỉnh sửa hội thảo công nghệ"}
        description={
          mode === "create"
            ? "Điền đầy đủ thông tin để tạo hội thảo công nghệ"
            : "Cập nhật thông tin hội thảo công nghệ"
        }
      />

      <StepIndicator
        currentStep={currentStep}
        activeStep={activeStep}
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
            isInternalHosted={basicForm.isInternalHosted}
          />
          <FlexibleNavigationButtons
            currentStep={1}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            mode={mode}
            onNext={mode === "edit" ? handleNextStep : undefined}
            onSubmit={mode === "create" ? handleBasicSubmit : undefined}
            onUpdate={mode === "edit" ? handleUpdateCurrentStep : undefined}
          />
        </StepContainer>
      )}

      {/* STEP 2: Price */}
      {currentStep === 2 && (
        <StepContainer stepNumber={2} title="Giá vé" isCompleted={isStepCompleted(2)}>
          <PriceForm
            tickets={tickets}
            onTicketsChange={setTickets}
            onRemoveTicket={deleteTracking.trackDeletedTicket}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            maxTotalSlot={basicForm.totalSlot}
          />
          <FlexibleNavigationButtons
            currentStep={2}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            mode={mode}
            onPrevious={handlePreviousStep}
            onNext={mode === "edit" ? handleNextStep : undefined}
            onSubmit={mode === "create" ? handlePriceSubmit : undefined}
            onUpdate={mode === "edit" ? handleUpdateCurrentStep : undefined}
          />
        </StepContainer>
      )}

      {/* STEP 3: Sessions */}
      {currentStep === 3 && (
        <StepContainer stepNumber={3} title="Phiên họp (Tùy chọn)" isCompleted={isStepCompleted(3)}>
          <SessionForm
            sessions={sessions}
            onSessionsChange={setSessions}
            onRemoveSession={deleteTracking.trackDeletedSession}
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
            mode={mode}
            isOptionalStep={true}
            isSkippable={sessions.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={mode === "create" ? handleSessionsSubmit : undefined}
            onUpdate={mode === "edit" ? handleUpdateCurrentStep : undefined}
          />
        </StepContainer>
      )}

      {/* STEP 4: Policies */}
      {currentStep === 4 && (
        <StepContainer stepNumber={4} title="Chính sách (Tùy chọn)" isCompleted={isStepCompleted(4)}>
          <PolicyForm
            policies={policies}
            onPoliciesChange={setPolicies}
            onRemovePolicy={deleteTracking.trackDeletedPolicy}
            eventStartDate={basicForm.startDate}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
          />
          <FlexibleNavigationButtons
            currentStep={4}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            mode={mode}
            isOptionalStep={true}
            isSkippable={policies.length === 0 && refundPolicies.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={mode === "create" ? handlePoliciesSubmit : undefined}
            onUpdate={mode === "edit" ? handleUpdateCurrentStep : undefined}
          />
        </StepContainer>
      )}

      {/* STEP 5: Media */}
      {currentStep === 5 && (
        <StepContainer stepNumber={5} title="Media (Tùy chọn)" isCompleted={isStepCompleted(5)}>
          <MediaForm
            mediaList={mediaList}
            onMediaListChange={setMediaList}
            onRemoveMedia={deleteTracking.trackDeletedMedia}
          />
          <FlexibleNavigationButtons
            currentStep={5}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            mode={mode}
            isOptionalStep={true}
            isSkippable={mediaList.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={mode === "create" ? handleMediaSubmit : undefined}
            onUpdate={mode === "edit" ? handleUpdateCurrentStep : undefined}
          />
        </StepContainer>
      )}

      {/* STEP 6: Sponsors */}
      {currentStep === 6 && (
        <StepContainer stepNumber={6} title="Nhà tài trợ (Tùy chọn)" isCompleted={isStepCompleted(6)}>
          <SponsorForm
            sponsors={sponsors}
            onSponsorsChange={setSponsors}
            onRemoveSponsor={deleteTracking.trackDeletedSponsor}
          />
          <FlexibleNavigationButtons
            currentStep={6}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting}
            mode={mode}
            isLastStep={true}
            isOptionalStep={true}
            isSkippable={sponsors.length === 0}
            onPrevious={handlePreviousStep}
            onSubmit={mode === "create" ? handleSponsorsSubmit : undefined}
            onUpdate={mode === "edit" ? handleUpdateCurrentStep : undefined}
            onUpdateAll={mode === "edit" ? handleUpdateAll : undefined}
          />
        </StepContainer>
      )}
    </div>
  );
}
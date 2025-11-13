"use client";
import { useEffect } from "react";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";

// Components
import {
  StepIndicator,
  CreateNavigationButtons as NavigationButtons,
  StepContainer,
  LoadingOverlay,
  PageHeader,
} from "../../ConferenceStep/components";

// Forms
import { BasicInfoForm } from "../../ConferenceStep/forms/BasicInfoForm";
import { PriceForm } from "../../ConferenceStep/forms/PriceForm";
import { SessionForm } from "../../ConferenceStep/forms/SessionForm";
import { PolicyForm } from "../../ConferenceStep/forms/PolicyForm";
import { MediaForm } from "../../ConferenceStep/forms/MediaForm";
import { SponsorForm } from "../../ConferenceStep/forms/SponsorForm";

// Hooks
import {
  useStepNavigation,
  useFormSubmit,
  useValidation,
  useConferenceForm,
} from "../../ConferenceStep/hooks";

// Validations
import {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateBasicForm,
} from "../../ConferenceStep/validations";

import { TECH_STEP_LABELS, TECH_MAX_STEP } from "../../ConferenceStep/constants";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { setMaxStep } from "@/redux/slices/conferenceStep.slice";

export default function CreateConferenceStepPage() {
  const dispatch = useAppDispatch();

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } =
    useGetAllCitiesQuery();

  // Custom Hooks
  const {
    currentStep,
    completedSteps,
    handleNext,
    handlePrevious,
    handleGoToStep,
    handleMarkCompleted,
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

  // Initialize
  useEffect(() => {
    dispatch(setMaxStep(TECH_MAX_STEP)); 
    handleSetMode("create");
    handleGoToStep(1);

    return () => {
      handleReset();
      resetAllForms();
    };
  }, [dispatch]);

  // Prepare options for selects
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

  // Validation handlers
  const handleFieldBlur = (field: string) => {
    switch (field) {
      case "conferenceName":
        validate(field, () => validateConferenceName(basicForm.conferenceName));
        break;
      case "dateRange":
        if (basicForm.dateRange != null) {
          validate(field, () => validateDateRange(basicForm.dateRange!));
        } else {
          clearError("dateRange");
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
          clearError("ticketSaleDuration");
        }
        break;
    }
  };

  // Submit handlers — ✅ KHÔNG CẦN return { success: boolean }
  const handleBasicSubmit = () => {
    const validationResult = validateBasicForm(basicForm);
    if (!validationResult.isValid) {
      return;
    }
    submitBasicInfo(basicForm).then((result) => {
      if (result.success) {
        handleMarkCompleted(1);
      }
    });
  };

  const handlePriceSubmit = () => {
    submitPrice(tickets).then((result) => {
      if (result.success) {
        handleMarkCompleted(2);
      }
    });
  };

  const handleSessionsSubmit = () => {
    submitSessions(sessions, basicForm.startDate, basicForm.endDate).then((result) => {
      if (result.success) {
        handleMarkCompleted(3);
      }
    });
  };

  const handlePoliciesSubmit = () => {
    submitPolicies(policies).then((result) => {
      if (result.success) {
        handleMarkCompleted(4);
      }
    });
  };

  const handleMediaSubmit = () => {
    submitMedia(mediaList).then((result) => {
      if (result.success) {
        handleMarkCompleted(5);
      }
    });
  };

  const handleSponsorsSubmit = () => {
    submitSponsors(sponsors).then((result) => {
      if (result.success) {
        handleMarkCompleted(6);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title="Tạo hội thảo mới"
        description="Điền đầy đủ thông tin để tạo hội thảo"
      />

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        maxStep={TECH_MAX_STEP} 
        stepLabels={TECH_STEP_LABELS} 
        onStepClick={handleGoToStep}
      />

      {isSubmitting && <LoadingOverlay />}

      {/* STEP 1: Basic Info */}
      {currentStep === 1 && (
        <StepContainer
          stepNumber={1}
          title="Thông tin cơ bản"
          isCompleted={isStepCompleted(1)}
        >
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

      {/* STEP 2: Price */}
      {currentStep === 2 && (
        <StepContainer
          stepNumber={2}
          title="Giá vé"
          isCompleted={isStepCompleted(2)}
        >
          <PriceForm
            tickets={tickets}
            onTicketsChange={setTickets}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            maxTotalSlot={basicForm.totalSlot}
          />

          <NavigationButtons
            currentStep={2}
            isStepCompleted={isStepCompleted(2)}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handlePriceSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 3: Sessions */}
      {currentStep === 3 && (
        <StepContainer
          stepNumber={3}
          title="Phiên họp (Tùy chọn)"
          isCompleted={isStepCompleted(3)}
        >
          <SessionForm
            sessions={sessions}
            onSessionsChange={setSessions}
            eventStartDate={basicForm.startDate}
            eventEndDate={basicForm.endDate}
            roomOptions={roomOptions}
            roomsData={roomsData}
            isRoomsLoading={isRoomsLoading}
          />

          <NavigationButtons
            currentStep={3}
            isStepCompleted={isStepCompleted(3)}
            isSubmitting={isSubmitting}
            showSkip={sessions.length === 0}
            canSkip={sessions.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSessionsSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 4: Policies */}
      {currentStep === 4 && (
        <StepContainer
          stepNumber={4}
          title="Chính sách (Tùy chọn)"
          isCompleted={isStepCompleted(4)}
        >
          <PolicyForm
            policies={policies}
            onPoliciesChange={setPolicies}
            eventStartDate={basicForm.startDate}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
          />

          <NavigationButtons
            currentStep={4}
            isStepCompleted={isStepCompleted(4)}
            isSubmitting={isSubmitting}
            showSkip={policies.length === 0 && refundPolicies.length === 0}
            canSkip={policies.length === 0 && refundPolicies.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handlePoliciesSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 5: Media */}
      {currentStep === 5 && (
        <StepContainer
          stepNumber={5}
          title="Media (Tùy chọn)"
          isCompleted={isStepCompleted(5)}
        >
          <MediaForm mediaList={mediaList} onMediaListChange={setMediaList} />

          <NavigationButtons
            currentStep={5}
            isStepCompleted={isStepCompleted(5)}
            isSubmitting={isSubmitting}
            showSkip={mediaList.length === 0}
            canSkip={mediaList.length === 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleMediaSubmit}
          />
        </StepContainer>
      )}

      {/* STEP 6: Sponsors */}
      {currentStep === 6 && (
        <StepContainer
          stepNumber={6}
          title="Nhà tài trợ (Tùy chọn)"
          isCompleted={isStepCompleted(6)}
        >
          <SponsorForm sponsors={sponsors} onSponsorsChange={setSponsors} />

          <NavigationButtons
            currentStep={6}
            isStepCompleted={isStepCompleted(6)}
            isSubmitting={isSubmitting}
            showNext={false}
            submitButtonText={
              isSubmitting
                ? "Đang hoàn tất..."
                : isStepCompleted(6)
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
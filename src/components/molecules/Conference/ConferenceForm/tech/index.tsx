"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useCallback, useRef, useState } from "react";
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
import RoomCalendar from "@/components/molecules/Calendar/RoomCalendar/RoomCalendar";
import SessionCalendar from "@/components/molecules/Calendar/SessionCalendar/SessionCalendar";

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
import {
  TECH_STEP_LABELS,
  TECH_MAX_STEP,
} from "@/components/molecules/Conference/ConferenceStep/constants";
import { RequestConferenceApproval } from "@/components/molecules/Status/RequestStatus";
import { Session, ResearchSession } from "@/types/conference.type";

const useMockDeleteTracking = () => {
  return useMemo(
    () => ({
      trackDeletedTicket: () => {},
      trackDeletedPhase: () => {},
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
  const isCollaborator = Boolean(userRole?.includes("Collaborator"));
  const isInternalHosted = Boolean(userRole?.includes("Conference Organizer"));
  const reduxConferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);
  const actualConferenceId = mode === "create" ? reduxConferenceId : conferenceId;

  const realDeleteTracking = useDeleteTracking();
  const mockDeleteTracking = useMockDeleteTracking();
  const deleteTracking =
    mode === "edit" ? realDeleteTracking : mockDeleteTracking;

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } =
    useGetAllCitiesQuery();

  const {
    currentStep,
    activeStep,
    completedSteps,
    stepsWithData,
    dirtySteps,
    handleNext,
    handlePrevious,
    handleGoToStep,
    handleReset,
    handleMarkHasData,
    handleMarkDirty,
    handleClearDirty,
    isStepCompleted,
    mode: stepMode,
  } = useStepNavigation();

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

  interface InitialFormData {
    basicForm: typeof basicForm;
    tickets: typeof tickets;
    sessions: typeof sessions;
    policies: typeof policies;
    refundPolicies: typeof refundPolicies;
    mediaList: typeof mediaList;
    sponsors: typeof sponsors;
  }

  const initialDataRef = useRef<InitialFormData | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const {
    isLoading: isConferenceLoading,
    isFetching,
    refetch,
  } = useTechConferenceData({
    conferenceId: mode === "edit" ? conferenceId! : "",
    onLoad:
      mode === "edit"
        ? ({
            basicForm: loadedBasicForm,
            tickets: loadedTickets,
            sessions: loadedSessions,
            policies: loadedPolicies,
            refundPolicies: loadedRefundPolicies,
            mediaList: loadedMediaList,
            sponsors: loadedSponsors,
          }) => {
            setBasicForm(loadedBasicForm);
            setTickets(loadedTickets);
            setSessions(loadedSessions);
            setPolicies(loadedPolicies);
            setRefundPolicies(loadedRefundPolicies);
            setMediaList(loadedMediaList);
            setSponsors(loadedSponsors);

            initialDataRef.current = {
              basicForm: loadedBasicForm,
              tickets: loadedTickets,
              sessions: loadedSessions,
              policies: loadedPolicies,
              refundPolicies: loadedRefundPolicies,
              mediaList: loadedMediaList,
              sponsors: loadedSponsors,
            };

            if (loadedBasicForm && Object.keys(loadedBasicForm).length > 0) {
              handleMarkHasData(1);
            }
            if (loadedTickets && loadedTickets.length > 0) {
              handleMarkHasData(2);
            }
            if (loadedSessions && loadedSessions.length > 0) {
              handleMarkHasData(3);
            }
            if (loadedPolicies && loadedPolicies.length > 0) {
              handleMarkHasData(4);
            }
            if (loadedMediaList && loadedMediaList.length > 0) {
              handleMarkHasData(5);
            }
            if (loadedSponsors && loadedSponsors.length > 0) {
              handleMarkHasData(6);
            }

            setHasLoadedData(true);
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
    if (!hasLoadedData || mode !== "edit" || !initialDataRef.current) return;

    const current = initialDataRef.current;

    const checkIfDirty = (step: number, currentData: unknown, initialData: unknown) => {
      const isDifferent = JSON.stringify(currentData) !== JSON.stringify(initialData);
      if (isDifferent) {
        handleMarkDirty(step);
      }
    };

    checkIfDirty(1, basicForm, current.basicForm);
    checkIfDirty(2, tickets, current.tickets);
    checkIfDirty(3, sessions, current.sessions);
    checkIfDirty(4, policies, current.policies);
    checkIfDirty(5, mediaList, current.mediaList);
    checkIfDirty(6, sponsors, current.sponsors);
  }, [
    basicForm,
    tickets,
    sessions,
    policies,
    mediaList,
    sponsors,
    hasLoadedData,
    mode,
    handleMarkDirty,
  ]);

  const {
    isSubmitting,
    submitBasicInfo,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMedia,
    submitSponsors,
    submitAll,
  } = useFormSubmit({
    onRefetchNeeded: async () => {
      if (mode === "edit" && refetch) {
        await refetch();
        setHasLoadedData(false);
      }
    },
    deletedTicketIds: realDeleteTracking.deletedTicketIds,
    deletedSessionIds: realDeleteTracking.deletedSessionIds,
    deletedPolicyIds: realDeleteTracking.deletedPolicyIds,
    deletedMediaIds: realDeleteTracking.deletedMediaIds,
    deletedSponsorIds: realDeleteTracking.deletedSponsorIds,
  });

  const { validationErrors, validate, clearError } = useValidation();

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

  const categoryOptions = useMemo(
    () =>
      categoriesData?.data?.map((category) => ({
        value: category.conferenceCategoryId,
        label: category.conferenceCategoryName,
      })) || [],
    [categoriesData]
  );

  const cityOptions = useMemo(
    () =>
      citiesData?.data?.map((city) => ({
        value: city.cityId,
        label: city.cityName || "N/A",
      })) || [],
    [citiesData]
  );

  const handleFieldBlur = useCallback(
    (field: string) => {
      switch (field) {
        case "conferenceName":
          validate(field, () =>
            validateConferenceName(basicForm.conferenceName)
          );
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
            validateTicketSaleStart(
              basicForm.ticketSaleStart,
              basicForm.startDate
            )
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

  const handlePreviousStep = () => handlePrevious();
  const handleNextStep = () => handleNext();

  const handleBasicSubmit = async () => {
    const basicValidation = validateBasicForm(basicForm);
    if (!basicValidation.isValid) {
      toast.error(
        `Thông tin cơ bản: ${basicValidation.error || "Dữ liệu không hợp lệ"}`
      );
      return;
    }
    const result = await submitBasicInfo(basicForm, true);
    if (result.success) {
      handleMarkHasData(1);
    }
  };

  const handlePriceSubmit = async () => {
    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return;
    }
    const result = await submitPrice(tickets);
    if (result.success) {
      handleMarkHasData(2);
      handleNext();
    }
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
    const result = await submitSessions(
      sessions,
      basicForm.startDate!,
      basicForm.endDate!,
      { deletedSessionIds: realDeleteTracking.deletedSessionIds } 
    );
    if (result.success) {
      if (sessions.length > 0) handleMarkHasData(3);
      handleNext();
    }
  };

  const handlePoliciesSubmit = async () => {
    const result = await submitPolicies(policies);
    if (result.success) {
      if (policies.length > 0) handleMarkHasData(4);
      handleNext();
    }
  };

  const handleMediaSubmit = async () => {
    const result = await submitMedia(mediaList);
    if (result.success) {
      if (mediaList.length > 0) handleMarkHasData(5);
      handleNext();
    }
  };

  const handleSponsorsSubmit = async () => {
    const result = await submitSponsors(sponsors);
    if (result.success && sponsors.length > 0) {
      handleMarkHasData(6);
    }
  };

const handleSessionCreatedFromCalendar = (session: Session | ResearchSession) => {
  if (!('speaker' in session)) {
    console.error("Unexpected ResearchSession in Tech mode", session);
    toast.error("Phiên họp không hợp lệ cho hội thảo công nghệ.");
    return;
  }

  setSessions((prev) => [...prev, session as Session]);
  handleMarkHasData(3);
  handleMarkDirty(3);
  toast.success(`Đã thêm session "${session.title}" thành công!`);
};

const handleSessionUpdatedFromCalendar = (updatedSession: Session | ResearchSession, index: number) => {
  if (!('speaker' in updatedSession)) {
    console.error("Unexpected ResearchSession in Tech update", updatedSession);
    toast.error("Phiên họp không hợp lệ để cập nhật.");
    return;
  }  
  setSessions((prev) => {
    const newSessions = [...prev];
    newSessions[index] = updatedSession as Session;
    return newSessions;
  });
  
  handleMarkDirty(3);
  toast.success(`Đã cập nhật session "${updatedSession.title}" thành công!`);
};

const handleSessionDeletedFromCalendar = (index: number) => {
 
  const deletedSession = sessions[index];
  
  if (deletedSession?.sessionId && mode === "edit") {
    realDeleteTracking.trackDeletedSession(deletedSession.sessionId);
  }
  
  setSessions((prev) => prev.filter((_, i) => i !== index));
  handleMarkDirty(3);
  toast.success("Đã xóa session thành công!");
};
  const handleUpdateCurrentStep = useCallback(async () => {
    let result;
    switch (currentStep) {
      case 1: {
        const basicValidation = validateBasicForm(basicForm);
        if (!basicValidation.isValid) {
          toast.error(
            `Thông tin cơ bản: ${basicValidation.error || "Dữ liệu không hợp lệ"}`
          );
          return { success: false };
        }
        result = await submitBasicInfo(basicForm);
        break;
      }
      case 2: {
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại vé!");
          return { success: false };
        }
        result = await submitPrice(tickets);
        break;
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
        result = await submitSessions(
          sessions,
          basicForm.startDate!,
          basicForm.endDate!,
          { deletedSessionIds: realDeleteTracking.deletedSessionIds }
        );
        break;
      }
      case 4:
        result = await submitPolicies(policies);
        break;
      case 5:
        result = await submitMedia(mediaList);
        break;
      case 6:
        result = await submitSponsors(sponsors);
        break;
      default:
        toast.error(`Bước không hợp lệ: ${currentStep}`);
        return { success: false };
    }

    if (result?.success) {
      handleClearDirty(currentStep);

      if (initialDataRef.current) {
        switch (currentStep) {
          case 1:
            initialDataRef.current.basicForm = { ...basicForm };
            break;
          case 2:
            initialDataRef.current.tickets = [...tickets];
            break;
          case 3:
            initialDataRef.current.sessions = [...sessions];
            break;
          case 4:
            initialDataRef.current.policies = [...policies];
            break;
          case 5:
            initialDataRef.current.mediaList = [...mediaList];
            break;
          case 6:
            initialDataRef.current.sponsors = [...sponsors];
            break;
        }
      }
    }

    return result || { success: false };
  }, [
    currentStep,
    basicForm,
    tickets,
    sessions,
    policies,
    mediaList,
    sponsors,
    submitBasicInfo,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMedia,
    submitSponsors,
    handleClearDirty,
  ]);

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
      realDeleteTracking.resetDeleteTracking();

      for (let i = 1; i <= TECH_MAX_STEP; i++) {
        handleClearDirty(i);
      }
      initialDataRef.current = {
        basicForm: { ...basicForm },
        tickets: [...tickets],
        sessions: [...sessions],
        policies: [...policies],
        refundPolicies: [...refundPolicies],
        mediaList: [...mediaList],
        sponsors: [...sponsors],
      };
    } else {
      const errorMsg = result?.errors?.join("; ") || "Lưu toàn bộ thất bại";
      toast.error(errorMsg);
    }

    return result || { success: false };
  };

  const handleApprovalSuccess = useCallback(() => {
    if (refetch) {
      refetch();
    }
    toast.success("Đã gửi yêu cầu duyệt thành công!");
  }, [refetch]);

  const isLoading =
    mode === "edit" &&
    (isConferenceLoading ||
      isCategoriesLoading ||
      isRoomsLoading ||
      isCitiesLoading);

  if (isLoading) {
    return <LoadingOverlay message="Đang tải dữ liệu hội thảo..." />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={
            mode === "create"
              ? "Tạo hội thảo công nghệ mới"
              : "Chỉnh sửa hội thảo công nghệ"
          }
          description={
            mode === "create"
              ? "Điền đầy đủ thông tin để tạo hội thảo công nghệ"
              : "Cập nhật thông tin hội thảo công nghệ"
          }
        />

        {mode === "edit" && conferenceId && isCollaborator && (
          <RequestConferenceApproval
            conferenceId={conferenceId}
            onSuccess={handleApprovalSuccess}
          />
        )}
      </div>

      <StepIndicator
        currentStep={currentStep}
        activeStep={activeStep}
        completedSteps={completedSteps}
        stepsWithData={stepsWithData}
        dirtySteps={dirtySteps}
        maxStep={TECH_MAX_STEP}
        stepLabels={TECH_STEP_LABELS}
        mode={stepMode}
        onStepClick={handleGoToStep}
      />

      {(isSubmitting || isFetching) && (
        <LoadingOverlay
          message={
            isFetching
              ? "Đang tải dữ liệu mới nhất..."
              : "Đang xử lý... Vui lòng đợi"
          }
        />
      )}

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
            isInternalHosted={basicForm.isInternalHosted}
          />
          <FlexibleNavigationButtons
            currentStep={1}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            onNext={handleNextStep}
            onSubmit={handleBasicSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 2 && (
        <StepContainer
          stepNumber={2}
          title="Giá vé"
          isCompleted={isStepCompleted(2)}
        >
          <PriceForm
            tickets={tickets}
            onTicketsChange={setTickets}
            onRemoveTicket={deleteTracking.trackDeletedTicket}
            onRemovePhase={deleteTracking.trackDeletedPhase}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            maxTotalSlot={basicForm.totalSlot}
          />
          <FlexibleNavigationButtons
            currentStep={2}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handlePriceSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 3 && (
        <StepContainer
          stepNumber={3}
          title="Phiên họp (Tùy chọn)"
          isCompleted={isStepCompleted(3)}
        >
          {(!basicForm.startDate || !basicForm.endDate) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Thiếu thông tin ngày tổ chức</h4>
                  <p className="text-sm text-red-800">Vui lòng quay lại <strong>Bước 1</strong> để điền ngày bắt đầu và kết thúc hội thảo.</p>
                  <button onClick={() => handleGoToStep(1)} className="mt-2 text-sm text-red-700 underline hover:text-red-900">
                    Quay về Bước 1 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {(basicForm.startDate || basicForm.endDate) && (
            <div className="text-xs text-gray-500 space-y-1 mb-4">
              <p>
                <strong>Khoảng thời gian:</strong>{" "}
                {basicForm.startDate && <span className="font-mono">{new Date(basicForm.startDate).toLocaleDateString("vi-VN")}</span>}
                {basicForm.startDate && basicForm.endDate && " → "}
                {basicForm.endDate && <span className="font-mono">{new Date(basicForm.endDate).toLocaleDateString("vi-VN")}</span>}
              </p>
              {sessions.length > 0 && (
                <p>• Đã lên lịch <strong>{sessions.length}</strong> phiên họp</p>
              )}
              <p>• Quản lý phiên họp trong chi tiết phòng trên lịch</p>
            </div>
          )}

          {!actualConferenceId && mode === "create" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 mb-1">Chưa có Conference ID</h4>
                  <p className="text-sm text-yellow-800">Vui lòng hoàn thành <strong>Bước 1</strong> và <strong>Bước 2</strong> để có Conference ID.</p>
                  <button onClick={() => handleGoToStep(1)} className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                    Quay về Bước 1
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
            {isCollaborator ? (
              <SessionCalendar 
                conferenceId={actualConferenceId || undefined}
                startDate={basicForm.startDate}
                acceptedPapers={[]}
                isCollaboratorMode={true}
                conferenceStartDate={basicForm.startDate}
                conferenceEndDate={basicForm.endDate}
                existingSessions={sessions}
                onSessionCreated={handleSessionCreatedFromCalendar}
                onSessionUpdated={handleSessionUpdatedFromCalendar}
                onSessionDeleted={handleSessionDeletedFromCalendar}
              />
            ) : (
              <RoomCalendar 
                conferenceId={actualConferenceId || undefined}
                conferenceType="Tech"
                onSessionCreated={handleSessionCreatedFromCalendar}
                onSessionUpdated={handleSessionUpdatedFromCalendar}
                onSessionDeleted={handleSessionDeletedFromCalendar}
                startDate={basicForm.startDate}
                endDate={basicForm.endDate}
                existingSessions={sessions}
              />
            )}
          </div>

          <FlexibleNavigationButtons
            currentStep={3}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={sessions.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleSessionsSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 4 && (
        <StepContainer
          stepNumber={4}
          title="Chính sách (Tùy chọn)"
          isCompleted={isStepCompleted(4)}
        >
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
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={policies.length === 0 && refundPolicies.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handlePoliciesSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 5 && (
        <StepContainer
          stepNumber={5}
          title="Media (Tùy chọn)"
          isCompleted={isStepCompleted(5)}
        >
          <MediaForm
            mediaList={mediaList}
            onMediaListChange={setMediaList}
            onRemoveMedia={deleteTracking.trackDeletedMedia}
          />
          <FlexibleNavigationButtons
            currentStep={5}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={mediaList.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleMediaSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 6 && (
        <StepContainer
          stepNumber={6}
          title="Nhà tài trợ (Tùy chọn)"
          isCompleted={isStepCompleted(6)}
        >
          <SponsorForm
            sponsors={sponsors}
            onSponsorsChange={setSponsors}
            onRemoveSponsor={deleteTracking.trackDeletedSponsor}
          />
          <FlexibleNavigationButtons
            currentStep={6}
            maxStep={TECH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            isLastStep={true}
            isSkippable={sponsors.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleSponsorsSubmit}
            onUpdate={handleUpdateCurrentStep}
            onUpdateAll={mode === "edit" ? handleUpdateAll : undefined}
          />
        </StepContainer>
      )}

    </div>
  );
}
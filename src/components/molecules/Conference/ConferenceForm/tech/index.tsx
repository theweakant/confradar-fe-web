"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setMaxStep, setMode, setVisibleSteps } from "@/redux/slices/conferenceStep.slice";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import {
  StepIndicator,
  StepContainer,
  LoadingOverlay,
  PageHeader,
} from "@/components/molecules/Conference/ConferenceStep/components/index";
import { FlexibleNavigationButtons } from "@/components/molecules/Conference/ConferenceStep/components/FlexibleNavigationButtons";
import { PolicyForm } from "@/components/molecules/Conference/ConferenceStep/forms/PolicyForm";
import { MediaForm } from "@/components/molecules/Conference/ConferenceStep/forms/MediaForm";
import { SponsorForm } from "@/components/molecules/Conference/ConferenceStep/forms/SponsorForm";
import { BasicInfoForm } from "@/components/molecules/Conference/ConferenceStep/forms/BasicInfoForm";
import { PriceForm } from "@/components/molecules/Conference/ConferenceStep/forms/PriceForm";
import RoomCalendar from "@/components/molecules/Calendar/RoomCalendar/RoomCalendar";
import SessionProposalCalendar from "@/components/molecules/Calendar/SessionCalendar/SessionProposalCalendar";
import {
  useStepNavigation,
  useFormSubmit,
  useValidation,
  useConferenceForm,
  useDeleteTracking,
  useTechConferenceData,
} from "@/components/molecules/Conference/ConferenceStep/hooks/index";
import {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateBasicForm,
} from "@/components/molecules/Conference/ConferenceStep/validations";
import {
  TECH_STEP_LABELS,
  TECH_MAX_STEP,
} from "@/components/molecules/Conference/ConferenceStep/constants";
import { RequestConferenceApproval } from "@/components/molecules/Status/RequestStatus";
import { Session, ResearchSession, ConferenceBasicForm, Ticket, Policy, RefundPolicy, Media, Sponsor } from "@/types/conference.type";
import { toast } from "sonner";
import { CollaboratorContract } from "@/types/contract.type";

interface LoadDataParams {
  basicForm: ConferenceBasicForm;
  tickets: Ticket[];
  sessions: Session[];
  policies: Policy[];
  refundPolicies: RefundPolicy[];
  mediaList: Media[];
  sponsors: Sponsor[];
  contract?: CollaboratorContract | null;
}

interface InitialDataRef {
  basicForm: ConferenceBasicForm;
  tickets: Ticket[];
  sessions: Session[];
  policies: Policy[];
  refundPolicies: RefundPolicy[];
  mediaList: Media[];
  sponsors: Sponsor[];
}

const getVisibleStepIndex = (actualStep: number, visibleSteps: number[]): number => {
  const index = visibleSteps.indexOf(actualStep);
  return index === -1 ? 0 : index + 1;
};

const getActualStepNumber = (visibleStepIndex: number, visibleSteps: number[]): number => {
  return visibleSteps[visibleStepIndex - 1] || 0;
};

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
      deletedTicketIds: [] as string[],
      deletedSessionIds: [] as string[],
      deletedPolicyIds: [] as string[],
      deletedMediaIds: [] as string[],
      deletedSponsorIds: [] as string[],
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
  if (mode === "edit" && !conferenceId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Lỗi: Thiếu conferenceId khi chỉnh sửa.</p>
        </div>
      </div>
    );
  }
  return <TechConferenceStepFormContent mode={mode} conferenceId={conferenceId} />;
}

function TechConferenceStepFormContent({
  mode,
  conferenceId,
}: TechConferenceStepFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const isCollaborator = Boolean(userRole?.includes("Collaborator"));
  const isInternalHosted = Boolean(userRole?.includes("Conference Organizer"));
  const reduxConferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);
  const actualConferenceId = mode === "create" ? reduxConferenceId : conferenceId;
  const realDeleteTracking = useDeleteTracking();
  const mockDeleteTracking = useMockDeleteTracking();
  const deleteTracking = mode === "edit" ? realDeleteTracking : mockDeleteTracking;

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();

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
    handleMarkCompleted,
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

  const { validationErrors, validate, clearError } = useValidation();

  const initialDataRef = useRef<InitialDataRef | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [contract, setContract] = useState<CollaboratorContract | null>(null);

  const onLoadCallback = useCallback(
    ({
      basicForm: loadedBasicForm,
      tickets: loadedTickets,
      sessions: loadedSessions,
      policies: loadedPolicies,
      refundPolicies: loadedRefundPolicies,
      mediaList: loadedMediaList,
      sponsors: loadedSponsors,
      contract: loadedContract,
    }: LoadDataParams) => {
      if (loadedContract) {
        setContract(loadedContract);
      }
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
    },
    [
      setBasicForm,
      setTickets,
      setSessions,
      setPolicies,
      setRefundPolicies,
      setMediaList,
      setSponsors,
      handleMarkHasData,
    ]
  );

  const onErrorCallback = useCallback((error: unknown) => {
    toast.error("Không thể tải dữ liệu hội thảo!");
  }, []);

  const {
    isLoading: isConferenceLoading,
    isFetching,
    refetch,
  } = useTechConferenceData({
    conferenceId: mode === "edit" ? conferenceId! : "",
    onLoad: onLoadCallback,
    onError: onErrorCallback,
  });

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

  const getVisibleSteps = useCallback(() => {
    if (!isCollaborator) {
      return Array.from({ length: TECH_MAX_STEP }, (_, i) => i + 1);
    }
    if (!contract) {
      return Array.from({ length: TECH_MAX_STEP }, (_, i) => i + 1);
    }
    const steps = [1];
    if (contract.isPriceStep) steps.push(2);
    if (contract.isSessionStep) steps.push(3);
    if (contract.isPolicyStep) steps.push(4);
    if (contract.isMediaStep) steps.push(5);
    if (contract.isSponsorStep) steps.push(6);
    return steps;
  }, [isCollaborator, contract]);

  const visibleSteps = useMemo(() => getVisibleSteps(), [getVisibleSteps]);

  const requiredSteps = useMemo(() => {
    if (!isCollaborator || !contract) {
      return [1, 2];
    }
    const steps = [1];
    if (contract.isTicketSelling) {
      if (contract.isPriceStep) steps.push(2);
      if (contract.isSessionStep) steps.push(3);
    }
    return steps;
  }, [isCollaborator, contract]);

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

  const handlePreviousStep = useCallback(() => {
    const currentIndex = visibleSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      handleGoToStep(visibleSteps[currentIndex - 1]);
    }
  }, [currentStep, visibleSteps, handleGoToStep]);


  const isCurrentStepLast = useMemo(() => {
    const currentIndex = visibleSteps.indexOf(currentStep);
    return currentIndex === visibleSteps.length - 1;
  }, [currentStep, visibleSteps]);

  const handleComplete = useCallback(() => {
    if (mode !== "edit") return;
    
    const targetPath = isCollaborator 
      ? "/workspace/collaborator/manage-conference"
      : "/workspace/organizer/manage-conference";
    
    toast.success("Trở về trang quản lí!");
    router.push(targetPath);
  }, [mode, isCollaborator, router]);

  const handleBasicSubmit = useCallback(async () => {
    const basicValidation = validateBasicForm(basicForm);
    if (!basicValidation.isValid) {
      toast.error(`Thông tin cơ bản: ${basicValidation.error || "Dữ liệu không hợp lệ"}`);
      return;
    }

    isSubmittingRef.current = true;
    const result = await submitBasicInfo(basicForm, false);

    if (result.success) {
      handleMarkHasData(1);
      handleMarkCompleted(1);
      handleClearDirty(1);
      if (initialDataRef.current) {
        initialDataRef.current.basicForm = { ...basicForm };
      }
      lastSubmitTimeRef.current = Date.now();

      if (mode === "create" && !isCurrentStepLast) {
        console.log('🟢 CREATE mode - Calling handleNext');
        handleNext();
      }
    }

    isSubmittingRef.current = false;
  }, [
    basicForm,
    submitBasicInfo,
    handleMarkHasData,
    handleMarkCompleted,
    handleClearDirty,
    mode,
    isCurrentStepLast,
    handleNext,
  ]);

  const handlePriceSubmit = useCallback(async () => {
    if (tickets.length === 0 && requiredSteps.includes(2)) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return;
    }

    if (tickets.length > 0) {
      isSubmittingRef.current = true;
      const result = await submitPrice(tickets);
      if (result.success) {
        handleMarkHasData(2);
        handleMarkCompleted(2);
        handleClearDirty(2);
        if (initialDataRef.current) {
          initialDataRef.current.tickets = [...tickets];
        }
        lastSubmitTimeRef.current = Date.now();

        if (mode === "create" && !isCurrentStepLast) {
          console.log('🟢 CREATE mode - Calling handleNext from Price');
          handleNext();
        }
      }
      isSubmittingRef.current = false;
    } else {
      handleMarkCompleted(2);
      handleClearDirty(2);
      if (mode === "create" && !isCurrentStepLast) {
        console.log('🟢 CREATE mode - Skipping empty price step');
        handleNext();
      }
    }
  }, [
    tickets,
    requiredSteps,
    submitPrice,
    handleMarkHasData,
    handleMarkCompleted,
    handleClearDirty,
    mode,
    isCurrentStepLast,
    handleNext,
  ]);

  const handleSessionsSubmit = useCallback(async () => {
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
    } else if (requiredSteps.includes(3)) {
      toast.error("Vui lòng thêm ít nhất 1 phiên họp!");
      return;
    }

    isSubmittingRef.current = true;
    const result = await submitSessions(
      sessions,
      basicForm.startDate!,
      basicForm.endDate!,
      { deletedSessionIds: realDeleteTracking.deletedSessionIds }
    );
    if (result.success) {
      if (sessions.length > 0) handleMarkHasData(3);
      handleMarkCompleted(3);
      handleClearDirty(3);
      if (initialDataRef.current) {
        initialDataRef.current.sessions = [...sessions];
      }
      lastSubmitTimeRef.current = Date.now();
    }
    isSubmittingRef.current = false;
  }, [
    sessions,
    basicForm.startDate,
    basicForm.endDate,
    requiredSteps,
    submitSessions,
    realDeleteTracking.deletedSessionIds,
    handleMarkHasData,
    handleMarkCompleted,
    handleClearDirty,
  ]);

  const handlePoliciesSubmit = useCallback(async () => {
    if (policies.length > 0) {
      isSubmittingRef.current = true;
      const result = await submitPolicies(policies);
      if (result.success) {
        handleMarkHasData(4);
        handleMarkCompleted(4);
        handleClearDirty(4);
        if (initialDataRef.current) {
          initialDataRef.current.policies = [...policies];
        }
        lastSubmitTimeRef.current = Date.now();
      }
      isSubmittingRef.current = false;
    } else {
      handleMarkCompleted(4);
      handleClearDirty(4);
    }
  }, [policies, submitPolicies, handleMarkHasData, handleMarkCompleted, handleClearDirty]);

  const handleMediaSubmit = useCallback(async () => {
    if (mediaList.length > 0) {
      isSubmittingRef.current = true;
      const result = await submitMedia(mediaList);
      if (result.success) {
        handleMarkHasData(5);
        handleMarkCompleted(5);
        handleClearDirty(5);
        if (initialDataRef.current) {
          initialDataRef.current.mediaList = [...mediaList];
        }
        lastSubmitTimeRef.current = Date.now();
      }
      isSubmittingRef.current = false;
    } else {
      handleMarkCompleted(5);
      handleClearDirty(5);
    }
  }, [mediaList, submitMedia, handleMarkHasData, handleMarkCompleted, handleClearDirty]);

  const handleSponsorsSubmit = useCallback(async () => {
    if (sponsors.length > 0) {
      isSubmittingRef.current = true;
      const result = await submitSponsors(sponsors);
      if (result.success) {
        handleMarkHasData(6);
        handleMarkCompleted(6);
        handleClearDirty(6);
        if (initialDataRef.current) {
          initialDataRef.current.sponsors = [...sponsors];
        }
        lastSubmitTimeRef.current = Date.now();
      }
      isSubmittingRef.current = false;
    } else {
      handleMarkCompleted(6);
      handleClearDirty(6);
    }
  }, [sponsors, submitSponsors, handleMarkHasData, handleMarkCompleted, handleClearDirty]);

  const handleSessionCreatedFromCalendar = useCallback(
    (session: Session | ResearchSession) => {
      // if (!('speaker' in session)) {
      //   toast.error("Phiên họp không hợp lệ cho hội thảo công nghệ.");
      //   return;
      // }
      setSessions((prev) => [...prev, session as Session]);
      handleMarkHasData(3);
      handleMarkDirty(3);
      toast.success(`Đã thêm session "${session.title}" thành công!`);
    },
    [setSessions, handleMarkHasData, handleMarkDirty]
  );

  const handleSessionUpdatedFromCalendar = useCallback(
    (updatedSession: Session | ResearchSession, index: number) => {
      // if (!('speaker' in updatedSession)) {
      //   toast.error("Phiên họp không hợp lệ để cập nhật.");
      //   return;
      // }
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[index] = updatedSession as Session;
        return newSessions;
      });
      handleMarkDirty(3);
      toast.success(`Đã cập nhật session "${updatedSession.title}" thành công!`);
    },
    [setSessions, handleMarkDirty]
  );

  const handleSessionDeletedFromCalendar = useCallback(
    (index: number) => {
      const deletedSession = sessions[index];
      if (deletedSession?.sessionId && mode === "edit") {
        realDeleteTracking.trackDeletedSession(deletedSession.sessionId);
      }
      setSessions((prev) => prev.filter((_, i) => i !== index));
      handleMarkDirty(3);
      toast.success("Đã xóa session thành công!");
    },
    [sessions, mode, realDeleteTracking, setSessions, handleMarkDirty]
  );

  const handleUpdateCurrentStep = useCallback(async () => {
    if (!visibleSteps.includes(currentStep)) {
      return { success: false, error: "Step not visible" };
    }
    isSubmittingRef.current = true;
    let result;
    switch (currentStep) {
      case 1: {
        const basicValidation = validateBasicForm(basicForm);
        if (!basicValidation.isValid) {
          toast.error(`Thông tin cơ bản: ${basicValidation.error || "Dữ liệu không hợp lệ"}`);
          isSubmittingRef.current = false;
          return { success: false };
        }
        result = await submitBasicInfo(basicForm);
        break;
      }
      case 2: {
        if (tickets.length === 0) {
          if (requiredSteps.includes(2)) {
            toast.error("Vui lòng thêm ít nhất 1 loại vé!");
            isSubmittingRef.current = false;
            return { success: false };
          } else {
            const currentIndex = visibleSteps.indexOf(2);
            if (currentIndex < visibleSteps.length - 1) {
              handleGoToStep(visibleSteps[currentIndex + 1]);
            }
            isSubmittingRef.current = false;
            return { success: true };
          }
        }
        result = await submitPrice(tickets);
        break;
      }
      case 3: {
        if (sessions.length > 0) {
          if (!basicForm.startDate || !basicForm.endDate) {
            toast.error("Thiếu ngày bắt đầu/kết thúc hội thảo!");
            isSubmittingRef.current = false;
            return { success: false };
          }
          const hasStart = sessions.some((s) => s.date === basicForm.startDate);
          const hasEnd = sessions.some((s) => s.date === basicForm.endDate);
          if (!hasStart || !hasEnd) {
            toast.error("Phải có phiên họp vào ngày bắt đầu và kết thúc!");
            isSubmittingRef.current = false;
            return { success: false };
          }
        } else if (requiredSteps.includes(3)) {
          toast.error("Vui lòng thêm ít nhất 1 phiên họp!");
          isSubmittingRef.current = false;
          return { success: false };
        }
        result = await submitSessions(
          sessions,
          basicForm.startDate!,
          basicForm.endDate!,
          { deletedSessionIds: realDeleteTracking.deletedSessionIds }
        );
        break;
      }
      case 4: {
        if (policies.length === 0 && !requiredSteps.includes(4)) {
          const currentIndex = visibleSteps.indexOf(4);
          if (currentIndex < visibleSteps.length - 1) {
            handleGoToStep(visibleSteps[currentIndex + 1]);
          }
          isSubmittingRef.current = false;
          return { success: true };
        }
        result = await submitPolicies(policies);
        break;
      }
      case 5: {
        if (mediaList.length === 0 && !requiredSteps.includes(5)) {
          const currentIndex = visibleSteps.indexOf(5);
          if (currentIndex < visibleSteps.length - 1) {
            handleGoToStep(visibleSteps[currentIndex + 1]);
          }
          isSubmittingRef.current = false;
          return { success: true };
        }
        result = await submitMedia(mediaList);
        break;
      }
      case 6: {
        if (sponsors.length === 0 && !requiredSteps.includes(6)) {
          isSubmittingRef.current = false;
          return { success: true };
        }
        result = await submitSponsors(sponsors);
        break;
      }
      default:
        toast.error(`Bước không hợp lệ: ${currentStep}`);
        isSubmittingRef.current = false;
        return { success: false };
    }

    if (result?.success) {
      handleClearDirty(currentStep);
      lastSubmitTimeRef.current = Date.now();
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
    isSubmittingRef.current = false;
    return result || { success: false };
  }, [
    currentStep,
    visibleSteps,
    requiredSteps,
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
    handleGoToStep,
    realDeleteTracking.deletedSessionIds,
  ]);

  const filteredStepLabels = useMemo(() => {
    return visibleSteps.map((step) => {
      if (step < 1 || step > TECH_STEP_LABELS.length) {
        return `Bước ${step}`;
      }
      return TECH_STEP_LABELS[step - 1];
    });
  }, [visibleSteps]);

  const isSubmittingRef = useRef(false);
  const lastSubmitTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!hasLoadedData || mode !== "edit" || !initialDataRef.current) {
      return;
    }
    const timeSinceSubmit = Date.now() - lastSubmitTimeRef.current;
    if (isSubmittingRef.current || isSubmitting || timeSinceSubmit < 500) {
      return;
    }
    const timeoutId = setTimeout(() => {
      const current = initialDataRef.current!;
      const basicFormChanged = JSON.stringify(basicForm) !== JSON.stringify(current.basicForm);
      const ticketsChanged = JSON.stringify(tickets) !== JSON.stringify(current.tickets);
      const sessionsChanged = JSON.stringify(sessions) !== JSON.stringify(current.sessions);
      const policiesChanged = JSON.stringify(policies) !== JSON.stringify(current.policies);
      const mediaChanged = JSON.stringify(mediaList) !== JSON.stringify(current.mediaList);
      const sponsorsChanged = JSON.stringify(sponsors) !== JSON.stringify(current.sponsors);

      if (basicFormChanged) handleMarkDirty(1);
      if (ticketsChanged) handleMarkDirty(2);
      if (sessionsChanged) handleMarkDirty(3);
      if (policiesChanged) handleMarkDirty(4);
      if (mediaChanged) handleMarkDirty(5);
      if (sponsorsChanged) handleMarkDirty(6);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [basicForm, tickets, sessions, policies, mediaList, sponsors, hasLoadedData, mode, isSubmitting, handleMarkDirty]);

  useEffect(() => {
    if (mode === "create") {
      setBasicForm((prev) => {
        if (prev.isInternalHosted !== isInternalHosted) {
          return { ...prev, isInternalHosted };
        }
        return prev;
      });
    }
  }, [mode, isInternalHosted, setBasicForm]);

  useEffect(() => {
    dispatch(setMode(mode));
    dispatch(setMaxStep(visibleSteps.length));
    dispatch(setVisibleSteps(visibleSteps));
  }, [dispatch, mode, visibleSteps]);

  useEffect(() => {
    return () => {
      handleReset();
      resetAllForms();
      if (mode === "edit") deleteTracking.resetDeleteTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasInitializedStep = useRef(false);
  useEffect(() => {
    if (hasInitializedStep.current) return;
    const firstStep = visibleSteps[0];
    if (firstStep != null) {
      if (mode === "create") {
        handleGoToStep(firstStep);
        hasInitializedStep.current = true;
      } else if (mode === "edit" && !isConferenceLoading) {
        handleGoToStep(firstStep);
        hasInitializedStep.current = true;
      }
    }
  }, [mode, isConferenceLoading, handleGoToStep, visibleSteps]);

  const isLoading = mode === "edit" && (isConferenceLoading || isCategoriesLoading || isCitiesLoading);
  const isLoadingContract = mode === "edit" && isCollaborator && !contract && isConferenceLoading;

  if (isLoading) {
    return <LoadingOverlay message="Đang tải dữ liệu hội thảo..." />;
  }
  if (isLoadingContract) {
    return <LoadingOverlay message="Đang tải thông tin hợp đồng..." />;
  }

  const currentVisibleIndex = getVisibleStepIndex(currentStep, visibleSteps);
  const activeVisibleIndex = getVisibleStepIndex(activeStep, visibleSteps);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={mode === "create" ? "Tạo hội thảo công nghệ mới" : "Chỉnh sửa hội thảo công nghệ"}
          description={mode === "create" ? "Điền đầy đủ thông tin để tạo hội thảo công nghệ" : "Cập nhật thông tin hội thảo công nghệ"}
        />
        {/* {mode === "edit" && conferenceId && isCollaborator && contract && (
          <RequestConferenceApproval
            conferenceId={conferenceId}
            contract={contract}
            conferenceData={{
              conferenceName: basicForm.conferenceName || "Hội thảo chưa đặt tên",
              conferenceStatusId: basicForm.conferenceStatusId || "",
              sponsors: sponsors,
              conferenceMedia: mediaList,
              policies: policies,
              sessions: sessions,
              conferencePrices: tickets,
            }}
            onSuccess={handleApprovalSuccess}
          />
        )} */}
      </div>

      <StepIndicator
        currentStep={currentVisibleIndex}
        activeStep={activeVisibleIndex}
        completedSteps={completedSteps
          .filter((step) => visibleSteps.includes(step))
          .map(step => getVisibleStepIndex(step, visibleSteps))}
        stepsWithData={stepsWithData
          .filter((step) => visibleSteps.includes(step))
          .map(step => getVisibleStepIndex(step, visibleSteps))}
        dirtySteps={dirtySteps
          .filter((step) => visibleSteps.includes(step))
          .map(step => getVisibleStepIndex(step, visibleSteps))}
        maxStep={visibleSteps.length}
        stepLabels={filteredStepLabels}
        mode={stepMode}
        onStepClick={(stepIndex) => {
          const actualStep = getActualStepNumber(stepIndex, visibleSteps);
          if (actualStep) handleGoToStep(actualStep);
        }}
      />

      {(isSubmitting || isFetching) && (
        <LoadingOverlay
          message={isFetching ? "Đang tải dữ liệu mới nhất..." : "Đang xử lý... Vui lòng đợi"}
        />
      )}

      {currentStep === 1 && visibleSteps.includes(1) && (
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
            currentStep={currentVisibleIndex}
            maxStep={visibleSteps.length}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isLastStep={isCurrentStepLast}
            isStepCompleted={isStepCompleted}
            onNext={handleNext}
            onSubmit={handleBasicSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 2 && visibleSteps.includes(2) && (
        <StepContainer stepNumber={2} title="Giá vé" isCompleted={isStepCompleted(2)}>
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
            currentStep={currentVisibleIndex}
            maxStep={visibleSteps.length}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isLastStep={isCurrentStepLast}
            isStepCompleted={isStepCompleted}
            isOptionalStep={!requiredSteps.includes(2)}
            isSkippable={tickets.length === 0 && !requiredSteps.includes(2)}
            onPrevious={handlePreviousStep}
            onNext={handleNext}
            onSubmit={handlePriceSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 3 && visibleSteps.includes(3) && (
        <StepContainer stepNumber={3} title="Phiên họp" isCompleted={isStepCompleted(3)}>
          {(!basicForm.startDate || !basicForm.endDate) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Thiếu thông tin ngày tổ chức</h4>
                  <p className="text-sm text-red-800">
                    Vui lòng quay lại <strong>Bước 1</strong> để điền ngày bắt đầu và kết thúc hội thảo.
                  </p>
                  <button
                    onClick={() => handleGoToStep(1)}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                  >
                    Quay về Bước 1 →
                  </button>
                </div>
              </div>
            </div>
          )}
          {basicForm.startDate && basicForm.endDate && (
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
              {isCollaborator ? (
                <SessionProposalCalendar
                  conferenceId={actualConferenceId || undefined}
                  conferenceStartDate={basicForm.startDate}
                  conferenceEndDate={basicForm.endDate}
                  existingSessions={sessions}
                  onSessionCreated={handleSessionCreatedFromCalendar}
                  onSessionUpdated={handleSessionUpdatedFromCalendar}
                  onSessionDeleted={handleSessionDeletedFromCalendar}
                  startDate={basicForm.startDate}
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
          )}
          <FlexibleNavigationButtons
            currentStep={currentVisibleIndex}
            maxStep={visibleSteps.length}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isLastStep={isCurrentStepLast}
            isStepCompleted={isStepCompleted}
            isOptionalStep={!requiredSteps.includes(3)}
            isSkippable={sessions.length === 0 && !requiredSteps.includes(3)}
            onPrevious={handlePreviousStep}
            onNext={handleNext}
            onSubmit={handleSessionsSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 4 && visibleSteps.includes(4) && (
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
            currentStep={currentVisibleIndex}
            maxStep={visibleSteps.length}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isLastStep={isCurrentStepLast}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={policies.length === 0 && refundPolicies.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNext}
            onSubmit={handlePoliciesSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 5 && visibleSteps.includes(5) && (
        <StepContainer stepNumber={5} title="Media (Tùy chọn)" isCompleted={isStepCompleted(5)}>
          <MediaForm
            mediaList={mediaList}
            onMediaListChange={setMediaList}
            onRemoveMedia={deleteTracking.trackDeletedMedia}
          />
          <FlexibleNavigationButtons
            currentStep={currentVisibleIndex}
            maxStep={visibleSteps.length}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isLastStep={isCurrentStepLast}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={mediaList.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNext}
            onSubmit={handleMediaSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {currentStep === 6 && visibleSteps.includes(6) && (
        <StepContainer stepNumber={6} title="Nhà tài trợ (Tùy chọn)" isCompleted={isStepCompleted(6)}>
          <SponsorForm
            sponsors={sponsors}
            onSponsorsChange={setSponsors}
            onRemoveSponsor={deleteTracking.trackDeletedSponsor}
          />
          <FlexibleNavigationButtons
            currentStep={currentVisibleIndex}
            maxStep={visibleSteps.length}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isLastStep={isCurrentStepLast}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={sponsors.length === 0}
            onPrevious={handlePreviousStep}
            onNext={handleNext}
            onSubmit={handleSponsorsSubmit}
            onUpdate={handleUpdateCurrentStep}
            onComplete={mode === "edit" ? handleComplete : undefined}
            
          />
        </StepContainer>
      )}
    </div>
  );
}
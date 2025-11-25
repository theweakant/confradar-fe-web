"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setMaxStep, setMode } from "@/redux/slices/conferenceStep.slice";

// API Queries
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllRankingCategoriesQuery } from "@/redux/services/category.service";

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

// Research-Specific Forms
import { ResearchBasicInfoForm } from "@/components/molecules/Conference/ConferenceStep/forms/research/ResearchBasicInfoForm";
import { ResearchDetailForm } from "@/components/molecules/Conference/ConferenceStep/forms/research/ResearchDetailForm";
import { ResearchPhaseForm } from "@/components/molecules/Conference/ConferenceStep/forms/research/ResearchPhaseForm";
import { ResearchPriceForm } from "@/components/molecules/Conference/ConferenceStep/forms/research/ResearchPriceForm";
import { MaterialsForm } from "@/components/molecules/Conference/ConferenceStep/forms/research/MaterialsForm";

import {
  useStepNavigation,
  useResearchFormSubmit,  
  useValidation,
  useResearchForm,
  useDeleteTracking,
  useResearchConferenceData,
} from "@/components/molecules/Conference/ConferenceStep/hooks/index";

import {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateBasicForm,
  validateResearchTimeline,
} from "@/components/molecules/Conference/ConferenceStep/validations";

import {
  RESEARCH_STEP_LABELS,
  RESEARCH_MAX_STEP,
} from "@/components/molecules/Conference/ConferenceStep/constants";

import RoomCalendar from "@/components/molecules/Calendar/RoomCalendar/RoomCalendar";
import { ResearchSession } from "@/types/conference.type";

// DELETE TRACKING FOR CREATE MODE
const useMockDeleteTracking = () => {
  return useMemo(
    () => ({
      trackDeletedTicket: () => {},
      trackDeletedPhase: () => {},
      trackDeletedSession: () => {},
      trackDeletedPolicy: () => {},
      trackDeletedRefundPolicy: () => {},
      trackDeletedMaterial: () => {},
      trackDeletedRankingFile: () => {},
      trackDeletedRankingReference: () => {},
      trackDeletedMedia: () => {},
      trackDeletedSponsor: () => {},
      trackDeletedRevisionDeadline: () => {},
      resetDeleteTracking: () => {},
    }),
    []
  );
};

interface ResearchConferenceStepFormProps {
  mode: "create" | "edit";
  conferenceId?: string;
}

export default function ResearchConferenceStepForm({
  mode,
  conferenceId,
}: ResearchConferenceStepFormProps) {
  const dispatch = useAppDispatch();

  // ✅ LẤY CONFERENCE ID TỪ REDUX (GIỐNG TECH)
  const reduxConferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);
  const actualConferenceId = mode === "create" ? reduxConferenceId : conferenceId;

  // === DELETE TRACKING (REAL OR MOCK) ===
  const realDeleteTracking = useDeleteTracking();
  const mockDeleteTracking = useMockDeleteTracking();
  const deleteTracking =
    mode === "edit" ? realDeleteTracking : mockDeleteTracking;

  // === API QUERIES ===
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } =
    useGetAllCitiesQuery();
  const { data: rankingData, isLoading: isRankingLoading } =
    useGetAllRankingCategoriesQuery();

  // === HOOKS ===
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

  interface InitialFormData {
    basicForm: typeof basicForm;
    researchDetail: typeof researchDetail;
    researchPhases: typeof researchPhases;
    tickets: typeof tickets;
    sessions: typeof sessions;
    policies: typeof policies;
    refundPolicies: typeof refundPolicies;
    researchMaterials: typeof researchMaterials;
    rankingFiles: typeof rankingFiles;
    rankingReferences: typeof rankingReferences;
    mediaList: typeof mediaList;
    sponsors: typeof sponsors;
  }

  const initialDataRef = useRef<InitialFormData | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // === LOAD EXISTING DATA ===
  const {
    isLoading: isConferenceLoading,
    isFetching,
    refetch,
  } = useResearchConferenceData({
    conferenceId: mode === "edit" ? conferenceId! : "",
    onLoad:
      mode === "edit"
        ? ({
            basicForm: loadedBasicForm,
            researchDetail: loadedResearchDetail,
            researchPhases: loadedResearchPhases,
            tickets: loadedTickets,
            sessions: loadedSessions,
            policies: loadedPolicies,
            refundPolicies: loadedRefundPolicies,
            researchMaterials: loadedResearchMaterials,
            rankingFiles: loadedRankingFiles,
            rankingReferences: loadedRankingReferences,
            mediaList: loadedMediaList,
            sponsors: loadedSponsors,
          }) => {
            setBasicForm(loadedBasicForm);
            setResearchDetail(loadedResearchDetail);
            setResearchPhases(loadedResearchPhases);
            setTickets(loadedTickets);
            setSessions(loadedSessions);
            setPolicies(loadedPolicies);
            setRefundPolicies(loadedRefundPolicies);
            setResearchMaterials(loadedResearchMaterials);
            setRankingFiles(loadedRankingFiles);
            setRankingReferences(loadedRankingReferences);
            setMediaList(loadedMediaList);
            setSponsors(loadedSponsors);

            initialDataRef.current = {
              basicForm: loadedBasicForm,
              researchDetail: loadedResearchDetail,
              researchPhases: loadedResearchPhases,
              tickets: loadedTickets,
              sessions: loadedSessions,
              policies: loadedPolicies,
              refundPolicies: loadedRefundPolicies,
              researchMaterials: loadedResearchMaterials,
              rankingFiles: loadedRankingFiles,
              rankingReferences: loadedRankingReferences,
              mediaList: loadedMediaList,
              sponsors: loadedSponsors,
            };

            if (loadedBasicForm && Object.keys(loadedBasicForm).length > 0) {
              handleMarkHasData(1);
            }
            if (
              loadedResearchDetail &&
              Object.keys(loadedResearchDetail).length > 0
            ) {
              handleMarkHasData(2);
            }
            if (loadedResearchPhases && loadedResearchPhases.length > 0) {
              handleMarkHasData(3);
            }
            if (loadedTickets && loadedTickets.length > 0) {
              handleMarkHasData(4);
            }
            if (loadedSessions && loadedSessions.length > 0) {
              handleMarkHasData(5);
            }
            if (loadedPolicies && loadedPolicies.length > 0) {
              handleMarkHasData(6);
            }
            if (
              (loadedResearchMaterials && loadedResearchMaterials.length > 0) ||
              (loadedRankingFiles && loadedRankingFiles.length > 0) ||
              (loadedRankingReferences && loadedRankingReferences.length > 0)
            ) {
              handleMarkHasData(7);
            }
            if (loadedMediaList && loadedMediaList.length > 0) {
              handleMarkHasData(8);
            }
            if (loadedSponsors && loadedSponsors.length > 0) {
              handleMarkHasData(9);
            }

            setHasLoadedData(true);
          }
        : () => {},
    onError:
      mode === "edit"
        ? (error) => {
            console.error("Failed to load research conference:", error);
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
    checkIfDirty(2, researchDetail, current.researchDetail);
    checkIfDirty(3, researchPhases, current.researchPhases);
    checkIfDirty(4, tickets, current.tickets);
    checkIfDirty(5, sessions, current.sessions);
    checkIfDirty(6, policies, current.policies);
    checkIfDirty(7, researchMaterials, current.researchMaterials);
    checkIfDirty(8, mediaList, current.mediaList);
    checkIfDirty(9, sponsors, current.sponsors);
  }, [
    basicForm,
    researchDetail,
    researchPhases,
    tickets,
    sessions,
    policies,
    researchMaterials,
    mediaList,
    sponsors,
    hasLoadedData,
    mode,
    handleMarkDirty,
  ]);

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
    submitAll,
  } = useResearchFormSubmit({
    onRefetchNeeded: async () => {
      if (mode === "edit" && refetch) {
        await refetch();
        setHasLoadedData(false);
      }
    },
    deletedTicketIds: realDeleteTracking.deletedTicketIds,
    deletedPhaseIds: realDeleteTracking.deletedPhaseIds,
    deletedSessionIds: realDeleteTracking.deletedSessionIds,
    deletedPolicyIds: realDeleteTracking.deletedPolicyIds,
    deletedRefundPolicyIds: realDeleteTracking.deletedRefundPolicyIds,
    deletedMaterialIds: realDeleteTracking.deletedMaterialIds,
    deletedRankingFileIds: realDeleteTracking.deletedRankingFileIds,
    deletedRankingReferenceIds: realDeleteTracking.deletedRankingReferenceIds,
    deletedMediaIds: realDeleteTracking.deletedMediaIds,
    deletedSponsorIds: realDeleteTracking.deletedSponsorIds,
    deletedRevisionDeadlineIds: realDeleteTracking.deletedRevisionDeadlineIds,
  });

  const { validationErrors, validate, clearError } = useValidation();

  // INIT MODE & MAX STEP
  useEffect(() => {
    dispatch(setMode(mode));
    dispatch(setMaxStep(RESEARCH_MAX_STEP));
  }, [dispatch, mode]);

  // CLEANUP KHI UNMOUNT
  useEffect(() => {
    return () => {
      handleReset();
      resetAllForms();
      if (mode === "edit") deleteTracking.resetDeleteTracking();
    };
  }, []);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (mode === "create") {
      handleGoToStep(1);
      hasInitializedRef.current = true;
    } else if (mode === "edit" && !isConferenceLoading) {
      handleGoToStep(1);
      hasInitializedRef.current = true;
    }
  }, [mode, isConferenceLoading, handleGoToStep]);

  // OPTIONS
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

  const rankingOptions = useMemo(
    () =>
      rankingData?.data?.map((ranking) => ({
        value: ranking.rankId,
        label: ranking.rankName || "N/A",
      })) || [],
    [rankingData]
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

  // CREATE MODE: SUBMIT & NEXT HANDLERS
  const handleBasicSubmit = async () => {
    const basicValidation = validateBasicForm(basicForm);
    if (!basicValidation.isValid) {
      const errorMsg = basicValidation.error || "Dữ liệu không hợp lệ";
      toast.error(`Thông tin cơ bản: ${errorMsg}`);
      return;
    }
    const result = await submitBasicInfo(basicForm, true);
    if (result.success) {
      handleMarkHasData(1);
    }
  };

  const handleResearchDetailSubmit = async () => {
    const result = await submitResearchDetail(researchDetail);
    if (result.success) {
      handleMarkHasData(2);
      handleNext();
    }
  };

  const handleTimelineSubmit = async () => {
    const mainPhase = researchPhases[0];
    if (!mainPhase) {
      toast.error("Main timeline là bắt buộc!");
      return;
    }
    const waitlistPhase = researchPhases[1];
    if (!waitlistPhase || !waitlistPhase.isWaitlist) {
      toast.error("Bạn phải tạo Waitlist timeline trước khi tiếp tục!");
      return;
    }
    if (!waitlistPhase.registrationStartDate) {
      toast.error(
        "Waitlist timeline chưa được điền — vui lòng điền đầy đủ timeline"
      );
      return;
    }

    const mainValidation = validateResearchTimeline(
      mainPhase,
      basicForm.ticketSaleStart
    );
    if (!mainValidation.isValid) {
      toast.error(`Lỗi ở Main Timeline: ${mainValidation.error}`);
      return;
    }
    if (mainValidation.warning) {
      toast.warning(`Cảnh báo ở Main Timeline: ${mainValidation.warning}`);
    }

    const waitlistValidation = validateResearchTimeline(
      waitlistPhase,
      basicForm.ticketSaleStart
    );
    if (!waitlistValidation.isValid) {
      toast.error(`Lỗi ở Waitlist Timeline: ${waitlistValidation.error}`);
      return;
    }
    if (waitlistValidation.warning) {
      toast.warning(
        `Cảnh báo ở Waitlist Timeline: ${waitlistValidation.warning}`
      );
    }

    if (mainPhase.cameraReadyEndDate && waitlistPhase.registrationStartDate) {
      const mainEnd = new Date(mainPhase.cameraReadyEndDate);
      const waitlistStart = new Date(waitlistPhase.registrationStartDate);
      if (waitlistStart <= mainEnd) {
        toast.error(
          "Waitlist timeline phải bắt đầu sau khi Main timeline kết thúc!"
        );
        return;
      }
    }

    const result = await submitResearchPhase(researchPhases);
    if (result.success) {
      handleMarkHasData(3);
      handleNext();
    }
  };

  const handlePriceSubmit = async () => {
    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return;
    }
    const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);
    if (!hasAuthorTicket) {
      toast.error(
        "Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!"
      );
      return;
    }
    const result = await submitPrice(tickets);
    if (result.success) {
      handleMarkHasData(4);
      handleNext();
    }
  };

  const handleSessionsSubmit = async () => {
    const result = await submitSessions(sessions);
    if (result.success) {
      if (sessions.length > 0) handleMarkHasData(5);
      handleNext();
    }
  };

  // ✅ SESSION CALLBACKS - GIỐNG TECH
  const handleSessionCreatedFromCalendar = (session: ResearchSession) => {
    setSessions((prev) => [...prev, session]);
    handleMarkHasData(5);
    handleMarkDirty(5);
    toast.success(`Đã thêm session "${session.title}" thành công!`);
  };

  const handleSessionUpdatedFromCalendar = (updatedSession: ResearchSession, index: number) => {
    if (!updatedSession.sessionId) {
      toast.error("Session không có ID để cập nhật!");
      return;
    }

    console.log("📝 Updating session at index:", index, "with data:", updatedSession);

    setSessions((prev) => {
      const newSessions = [...prev];
      newSessions[index] = updatedSession;
      return newSessions;
    });

    handleMarkDirty(5);
    toast.success(`Đã cập nhật session "${updatedSession.title}" thành công!`);
  };

  const handleSessionDeletedFromCalendar = (index: number) => {
    const deletedSession = sessions[index];
    
    if (deletedSession?.sessionId && mode === "edit") {
      realDeleteTracking.trackDeletedSession(deletedSession.sessionId);
    }
    
    setSessions((prev) => prev.filter((_, i) => i !== index));
    handleMarkDirty(5);
    toast.success("Đã xóa session thành công!");
  };

  const handlePoliciesSubmit = async () => {
    const result = await submitPolicies(policies, refundPolicies);
    if (result.success) {
      if (policies.length > 0 || refundPolicies.length > 0) handleMarkHasData(6);
      handleNext();
    }
  };

  const handleMaterialsSubmit = async () => {
    const result = await submitMaterials(
      researchMaterials,
      rankingFiles,
      rankingReferences
    );
    if (result.success) {
      if (
        researchMaterials.length > 0 ||
        rankingFiles.length > 0 ||
        rankingReferences.length > 0
      ) {
        handleMarkHasData(7);
      }
      handleNext();
    }
  };

  const handleMediaSubmit = async () => {
    const result = await submitMedia(mediaList);
    if (result.success) {
      if (mediaList.length > 0) handleMarkHasData(8);
      handleNext();
    }
  };

  const handleSponsorsSubmit = async () => {
    const result = await submitSponsors(sponsors);
    if (result.success && sponsors.length > 0) {
      handleMarkHasData(9);
    }
  };

  // ========================================
  // UPDATE MODE: UPDATE CURRENT STEP
  // ========================================
  const handleUpdateCurrentStep = useCallback(async () => {
    let result;
    switch (currentStep) {
      case 1: {
        const basicValidation = validateBasicForm(basicForm);
        if (!basicValidation.isValid) {
          const errorMsg = basicValidation.error || "Dữ liệu không hợp lệ";
          toast.error(`Thông tin cơ bản: ${errorMsg}`);
          return { success: false };
        }
        result = await submitBasicInfo(basicForm);
        break;
      }
      case 2: {
        result = await submitResearchDetail(researchDetail);
        break;
      }
      case 3: {
        const mainPhase = researchPhases[0];
        if (!mainPhase) {
          toast.error("Main timeline là bắt buộc!");
          return { success: false };
        }
        const mainValidation = validateResearchTimeline(
          mainPhase,
          basicForm.ticketSaleStart
        );
        if (!mainValidation.isValid) {
          const errorMsg = mainValidation.error || "Lỗi timeline";
          toast.error(`Lỗi ở Main Timeline: ${errorMsg}`);
          return { success: false };
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
            const waitlistValidation = validateResearchTimeline(
              waitlistPhase,
              basicForm.ticketSaleStart
            );
            if (!waitlistValidation.isValid) {
              const errorMsg = waitlistValidation.error || "Lỗi timeline";
              toast.error(`Lỗi ở Waitlist Timeline: ${errorMsg}`);
              return { success: false };
            }
            if (
              mainPhase.cameraReadyEndDate &&
              waitlistPhase.registrationStartDate
            ) {
              const mainEnd = new Date(mainPhase.cameraReadyEndDate);
              const waitlistStart = new Date(
                waitlistPhase.registrationStartDate
              );
              if (waitlistStart <= mainEnd) {
                toast.error(
                  "Waitlist timeline phải bắt đầu sau khi Main timeline kết thúc!"
                );
                return { success: false };
              }
            }
          }
        }
        result = await submitResearchPhase(researchPhases);
        break;
      }
      case 4: {
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại vé!");
          return { success: false };
        }
        const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);
        if (!hasAuthorTicket) {
          toast.error(
            "Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!"
          );
          return { success: false };
        }
        result = await submitPrice(tickets);
        break;
      }
      case 5: {
        result = await submitSessions(sessions);
        break;
      }
      case 6: {
        result = await submitPolicies(policies, refundPolicies);
        break;
      }
      case 7: {
        result = await submitMaterials(
          researchMaterials,
          rankingFiles,
          rankingReferences
        );
        break;
      }
      case 8: {
        result = await submitMedia(mediaList);
        break;
      }
      case 9: {
        result = await submitSponsors(sponsors);
        break;
      }
      default: {
        toast.error(`Bước không hợp lệ: ${currentStep}`);
        return { success: false };
      }
    }

    if (result?.success) {
      handleClearDirty(currentStep);
      if (initialDataRef.current) {
        switch (currentStep) {
          case 1:
            initialDataRef.current.basicForm = { ...basicForm };
            break;
          case 2:
            initialDataRef.current.researchDetail = { ...researchDetail };
            break;
          case 3:
            initialDataRef.current.researchPhases = [...researchPhases];
            break;
          case 4:
            initialDataRef.current.tickets = [...tickets];
            break;
          case 5:
            initialDataRef.current.sessions = [...sessions];
            break;
          case 6:
            initialDataRef.current.policies = [...policies];
            break;
          case 7:
            initialDataRef.current.researchMaterials = [...researchMaterials];
            break;
          case 8:
            initialDataRef.current.mediaList = [...mediaList];
            break;
          case 9:
            initialDataRef.current.sponsors = [...sponsors];
            break;
        }
      }
    }

    return result || { success: false };
  }, [
    currentStep,
    basicForm,
    researchDetail,
    researchPhases,
    tickets,
    sessions,
    policies,
    refundPolicies,
    researchMaterials,
    rankingFiles,
    rankingReferences,
    mediaList,
    sponsors,
    submitBasicInfo,
    submitResearchDetail,
    submitResearchPhase,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMaterials,
    submitMedia,
    submitSponsors,
    handleClearDirty,
  ]);

  const handleUpdateAll = async () => {
    if (mode !== "edit") return { success: false };

    const result = await submitAll({
      basicForm,
      researchDetail,
      researchPhases,
      tickets,
      sessions,
      policies,
      refundPolicies,
      researchMaterials,
      rankingFiles,
      rankingReferences,
      mediaList,
      sponsors,
    });

    if (result?.success) {
      toast.success("Cập nhật toàn bộ hội thảo thành công!");
      realDeleteTracking.resetDeleteTracking();

      for (let i = 1; i <= RESEARCH_MAX_STEP; i++) {
        handleClearDirty(i);
      }

      initialDataRef.current = {
        basicForm: { ...basicForm },
        researchDetail: { ...researchDetail },
        researchPhases: [...researchPhases],
        tickets: [...tickets],
        sessions: [...sessions],
        policies: [...policies],
        refundPolicies: [...refundPolicies],
        researchMaterials: [...researchMaterials],
        rankingFiles: [...rankingFiles],
        rankingReferences: [...rankingReferences],
        mediaList: [...mediaList],
        sponsors: [...sponsors],
      };
    } else {
      const errorMsg = result?.errors?.join("; ") || "Lưu toàn bộ thất bại";
      toast.error(errorMsg);
    }

    return result || { success: false };
  };

  const isLoading =
    mode === "edit" &&
    (isConferenceLoading ||
      isCategoriesLoading ||
      isRoomsLoading ||
      isCitiesLoading ||
      isRankingLoading);

  if (isLoading) {
    return <LoadingOverlay message="Đang tải dữ liệu hội thảo..." />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title={
          mode === "create"
            ? "Tạo hội nghị nghiên cứu mới"
            : "Chỉnh sửa hội nghị nghiên cứu"
        }
        description={
          mode === "create"
            ? "Điền đầy đủ thông tin để tạo hội thảo nghiên cứu"
            : "Cập nhật thông tin hội thảo nghiên cứu"
        }
      />

      <StepIndicator
        currentStep={currentStep}
        activeStep={activeStep}
        completedSteps={completedSteps}
        stepsWithData={stepsWithData}
        dirtySteps={dirtySteps}
        maxStep={RESEARCH_MAX_STEP}
        stepLabels={RESEARCH_STEP_LABELS}
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

      {/* STEP 1 */}
      {currentStep === 1 && (
        <StepContainer
          stepNumber={1}
          title="Thông tin cơ bản"
          isCompleted={isStepCompleted(1)}
        >
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
          <FlexibleNavigationButtons
            currentStep={1}
            maxStep={RESEARCH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            onNext={handleNextStep}
            onSubmit={handleBasicSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <StepContainer
          stepNumber={2}
          title="Thông tin chi tiết về hội nghị nghiên cứu"
          isCompleted={isStepCompleted(2)}
        >
          <ResearchDetailForm
            formData={researchDetail}
            onChange={setResearchDetail}
            rankingOptions={rankingOptions}
            isRankingLoading={isRankingLoading}
            validationErrors={validationErrors}
            totalSlot={basicForm.totalSlot}
          />
          <FlexibleNavigationButtons
            currentStep={2}
            maxStep={RESEARCH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleResearchDetailSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 3 */}
      {currentStep === 3 && (
        <StepContainer
          stepNumber={3}
          title="Timeline & Giai đoạn"
          isCompleted={isStepCompleted(3)}
        >
          <ResearchPhaseForm
            phases={researchPhases}
            onPhasesChange={setResearchPhases}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            eventStartDate={basicForm.startDate}
            eventEndDate={basicForm.endDate}
            revisionAttemptAllowed={researchDetail.revisionAttemptAllowed}
          />
          <FlexibleNavigationButtons
            currentStep={3}
            maxStep={RESEARCH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleTimelineSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>  
      )}

      {/* STEP 4 */}
      {currentStep === 4 && (
        <StepContainer
          stepNumber={4}
          title="Chi phí tham dự"
          isCompleted={isStepCompleted(4)}
        >
          <ResearchPriceForm
            tickets={tickets}
            onTicketsChange={setTickets}
            onRemoveTicket={deleteTracking.trackDeletedTicket}
            onRemovePhase={deleteTracking.trackDeletedPhase}
            onRemoveRefundPolicy={deleteTracking.trackDeletedRefundPolicy}
            ticketSaleStart={basicForm.ticketSaleStart}
            ticketSaleEnd={basicForm.ticketSaleEnd}
            researchPhases={researchPhases}
            maxTotalSlot={basicForm.totalSlot}
            allowListener={researchDetail.allowListener}
            numberPaperAccept={researchDetail.numberPaperAccept ?? 0}
            reviewFee={researchDetail.reviewFee ?? 0}
          />
          <FlexibleNavigationButtons
            currentStep={4}
            maxStep={RESEARCH_MAX_STEP}
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

      {/* STEP 5: SESSIONS  */}
      {currentStep === 5 && (
        <StepContainer
          stepNumber={5}
          title="Phiên họp (Tùy chọn)"
          isCompleted={isStepCompleted(5)}
        >
          {/* ⚠️ Cảnh báo nếu thiếu ngày */}
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

          {/* ⚠️ Cảnh báo nếu chưa có Conference ID (CREATE MODE) */}
          {!actualConferenceId && mode === "create" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 mb-1">Chưa có Conference ID</h4>
                  <p className="text-sm text-yellow-800">
                    Vui lòng hoàn thành <strong>Bước 1-4</strong> để hệ thống tạo Conference ID. 
                    Sau đó bạn mới có thể tạo phiên họp.
                  </p>
                  <button
                    onClick={() => handleGoToStep(1)}
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Quay về Bước 1
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hướng dẫn & tóm tắt */}
          {(basicForm.startDate || basicForm.endDate) && (
            <div className="text-xs text-gray-500 space-y-1 mb-4">
              <p>
                <strong>Khoảng thời gian:</strong>{" "}
                {basicForm.startDate && (
                  <span className="font-mono">
                    {new Date(basicForm.startDate).toLocaleDateString("vi-VN")}
                  </span>
                )}
                {basicForm.startDate && basicForm.endDate && " → "}
                {basicForm.endDate && (
                  <span className="font-mono">
                    {new Date(basicForm.endDate).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </p>
              {sessions.length > 0 && (
                <p>• Đã lên lịch <strong>{sessions.length}</strong> phiên họp</p>
              )}
              <p>• Quản lý phiên họp trong chi tiết phòng trên lịch</p>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
            <RoomCalendar
              conferenceId={actualConferenceId || undefined} 
              conferenceType="Research"
              onSessionCreated={handleSessionCreatedFromCalendar}
              onSessionUpdated={handleSessionUpdatedFromCalendar}
              onSessionDeleted={handleSessionDeletedFromCalendar}
              startDate={basicForm.startDate}
              endDate={basicForm.endDate}
              existingSessions={sessions}
            />
          </div>

          <FlexibleNavigationButtons
            currentStep={5}
            maxStep={RESEARCH_MAX_STEP}
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

      {/* STEP 6 */}
      {currentStep === 6 && (
        <StepContainer
          stepNumber={6}
          title="Chính sách (Tùy chọn)"
          isCompleted={isStepCompleted(6)}
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
            currentStep={6}
            maxStep={RESEARCH_MAX_STEP}
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

      {/* STEP 7 */}
      {currentStep === 7 && (
        <StepContainer
          stepNumber={7}
          title="Tài liệu & Xếp hạng (Tùy chọn)"
          isCompleted={isStepCompleted(7)}
        >
          <MaterialsForm
            materials={researchMaterials}
            rankingFiles={rankingFiles}
            rankingReferences={rankingReferences}
            onMaterialsChange={setResearchMaterials}
            onRankingFilesChange={setRankingFiles}
            onRankingReferencesChange={setRankingReferences}
            onRemoveMaterial={deleteTracking.trackDeletedMaterial}
            onRemoveRankingFile={deleteTracking.trackDeletedRankingFile}
            onRemoveRankingReference={deleteTracking.trackDeletedRankingReference}
          />
          <FlexibleNavigationButtons
            currentStep={7}
            maxStep={RESEARCH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            isOptionalStep={true}
            isSkippable={
              researchMaterials.length === 0 &&
              rankingFiles.length === 0 &&
              rankingReferences.length === 0
            }
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleMaterialsSubmit}
            onUpdate={handleUpdateCurrentStep}
          />
        </StepContainer>
      )}

      {/* STEP 8 */}
      {currentStep === 8 && (
        <StepContainer
          stepNumber={8}
          title="Media (Tùy chọn)"
          isCompleted={isStepCompleted(8)}
        >
          <MediaForm
            mediaList={mediaList}
            onMediaListChange={setMediaList}
            onRemoveMedia={deleteTracking.trackDeletedMedia}
          />
          <FlexibleNavigationButtons
            currentStep={8}
            maxStep={RESEARCH_MAX_STEP}
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

      {/* STEP 9 */}
      {currentStep === 9 && (
        <StepContainer
          stepNumber={9}
          title="Nhà tài trợ (Tùy chọn)"
          isCompleted={isStepCompleted(9)}
        >
          <SponsorForm
            sponsors={sponsors}
            onSponsorsChange={setSponsors}
            onRemoveSponsor={deleteTracking.trackDeletedSponsor}
          />
          <FlexibleNavigationButtons
            currentStep={9}
            maxStep={RESEARCH_MAX_STEP}
            isSubmitting={isSubmitting || isFetching}
            mode={mode}
            isStepCompleted={isStepCompleted}
            isLastStep={true}
            isOptionalStep={true}
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
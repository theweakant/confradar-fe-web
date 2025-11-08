"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  useCreateBasicResearchConferenceMutation,
  useCreateResearchDetailMutation,
  useCreateResearchPhaseMutation,
  useCreateConferencePriceMutation,
  useCreateResearchSessionsMutation,
  useCreateConferencePoliciesMutation,
  useCreateRefundPoliciesMutation,
  useCreateResearchMaterialMutation,
  useCreateResearchRankingFileMutation,
  useCreateResearchRankingReferenceMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
} from "@/redux/services/conferenceStep.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllRankingCategoriesQuery } from "@/redux/services/category.service";

import type { ApiError } from "@/types/api.type";

import {
  setConferenceId,
  setConferenceBasicData,
  resetWizard,
  markStepCompleted,
  nextStep,
  prevStep,
  setMode,
  goToStep,
} from "@/redux/slices/conferenceStep.slice";

import type {
  ConferenceBasicForm,
  ResearchDetail,
  ResearchPhase,
  RevisionRoundDeadline,
  Session,
  Policy,
  RefundPolicy,
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
  Media,
  Sponsor,
  RoomInfoResponse,
  Ticket,
  Phase,
  ConferencePriceData,
} from "@/types/conference.type";
import { toast } from "sonner";
import { formatDate, formatCurrency, formatTimeDate } from "@/helper/format";

import { DatePickerInput } from "@/components/atoms/DatePickerInput";

export default function CreateResearchConferenceStepPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { conferenceId: reduxConferenceId } = useAppSelector(
    (state) => state.conferenceStep,
  );

  const conferenceId = reduxConferenceId;
  const currentStep = useAppSelector(
    (state) => state.conferenceStep.currentStep,
  );
  const completedSteps = useAppSelector(
    (state) => state.conferenceStep.completedSteps,
  );
  const mode = useAppSelector((state) => state.conferenceStep.mode);
  // API Mutations
  const [createBasicResearch] = useCreateBasicResearchConferenceMutation();
  const [createResearchDetail] = useCreateResearchDetailMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createResearchPhase] = useCreateResearchPhaseMutation();
  const [createSessions] = useCreateResearchSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createRefundPolicies] = useCreateRefundPoliciesMutation();
  const [createResearchMaterial] = useCreateResearchMaterialMutation();
  const [createResearchRankingFile] = useCreateResearchRankingFileMutation();
  const [createResearchRankingReference] =
    useCreateResearchRankingReferenceMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  // Query hooks
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } =
    useGetAllCitiesQuery();
  const { data: rankingData, isLoading: isRankingLoading } =
    useGetAllRankingCategoriesQuery();

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

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [resetSponsorUpload, setResetSponsorUpload] = useState(false);

  useEffect(() => {
    dispatch(setMode("create"));
    dispatch(goToStep(1));

    return () => {
      dispatch(resetWizard());
    };
  }, [dispatch]);

  // Step 1: Basic Info
  const [basicForm, setBasicForm] = useState<ConferenceBasicForm>({
    conferenceName: "",
    description: "",
    startDate: "",
    endDate: "",
    dateRange: 1,
    totalSlot: 0,
    address: "",
    bannerImageFile: null,
    isInternalHosted: true,
    isResearchConference: true,
    conferenceCategoryId: "",
    cityId: "",
    ticketSaleStart: "",
    ticketSaleEnd: "",
    ticketSaleDuration: 0,
    createdby: "",
  });

  // Step 2: Research Detail
  const [researchDetail, setResearchDetail] = useState<ResearchDetail>({
    name: "",
    paperFormat: "",
    numberPaperAccept: 0,
    revisionAttemptAllowed: 0,
    rankingDescription: "",
    allowListener: false,
    rankValue: "",
    rankYear: 0,
    reviewFee: 0,
    rankingCategoryId: "",
  });

  // Step 3: Price
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState<Omit<Ticket, "ticketId">>({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    isAuthor: false,
    totalSlot: 0,
    phases: [],
  });
  const [newPhase, setNewPhase] = useState<{
    phaseName: string;
    percentValue: number;
    percentType: "increase" | "decrease";
    startDate: string;
    durationInDays: number;
    totalslot: number;
  }>({
    phaseName: "",
    percentValue: 0,
    percentType: "increase",
    startDate: "",
    durationInDays: 1,
    totalslot: 0,
  });

  const [researchPhases, setResearchPhases] = useState<ResearchPhase[]>([
    {
      // Main phase
      registrationStartDate: "",
      registrationEndDate: "",
      registrationDuration: 1,
      fullPaperStartDate: "",
      fullPaperEndDate: "",
      fullPaperDuration: 1,
      reviewStartDate: "",
      reviewEndDate: "",
      reviewDuration: 1,
      reviseStartDate: "",
      reviseEndDate: "",
      reviseDuration: 1,
      cameraReadyStartDate: "",
      cameraReadyEndDate: "",
      cameraReadyDuration: 1,
      isWaitlist: false,
      isActive: true,
      revisionRoundDeadlines: [],
    },
    {
      registrationStartDate: "",
      registrationEndDate: "",
      registrationDuration: 1,
      fullPaperStartDate: "",
      fullPaperEndDate: "",
      fullPaperDuration: 1,
      reviewStartDate: "",
      reviewEndDate: "",
      reviewDuration: 1,
      reviseStartDate: "",
      reviseEndDate: "",
      reviseDuration: 1,
      cameraReadyStartDate: "",
      cameraReadyEndDate: "",
      cameraReadyDuration: 1,
      isWaitlist: true,
      isActive: false,
      revisionRoundDeadlines: [],
    },
  ]);

  const [revisionRoundDeadlines, setRevisionRoundDeadlines] = useState<
    RevisionRoundDeadline[]
  >([]);
  const [newRevisionRound, setNewRevisionRound] = useState<{
    roundNumber: number;
    startDate: string; // <-- thêm
    durationInDays: number; // <-- thêm
  }>({
    roundNumber: 1,
    startDate: "",
    durationInDays: 3,
  });

  // Step 5: Sessions (Copy from Conference)
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSession, setNewSession] = useState<Session>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    date: "",
    timeRange: 1,
    roomId: "",
    speaker: [],
    sessionMedias: [],
  });

  // Step 6: Policies (Copy from Conference)
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicy, setNewPolicy] = useState<Policy>({
    policyName: "",
    description: "",
  });

  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
  const [newRefundPolicy, setNewRefundPolicy] = useState<
    Omit<RefundPolicy, "refundPolicyId">
  >({
    percentRefund: 0,
    refundDeadline: "",
    refundOrder: 1,
  });

  // Step 7: Materials & Rankings
  const [researchMaterials, setResearchMaterials] = useState<
    ResearchMaterial[]
  >([]);
  const [newMaterial, setNewMaterial] = useState<ResearchMaterial>({
    fileName: "",
    fileDescription: "",
    file: null,
  });

  const [rankingFiles, setRankingFiles] = useState<ResearchRankingFile[]>([]);
  const [newRankingFile, setNewRankingFile] = useState<ResearchRankingFile>({
    fileUrl: "",
    file: null,
  });

  const [rankingReferences, setRankingReferences] = useState<
    ResearchRankingReference[]
  >([]);
  const [newRankingReference, setNewRankingReference] =
    useState<ResearchRankingReference>({
      referenceUrl: "",
    });

  // Step 8: Media (Copy from Conference)
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [newMedia, setNewMedia] = useState<Media>({ mediaFile: null });

  // Step 9: Sponsors (Copy from Conference)
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    imageFile: null,
  });

  //HEPLER
  const updatePhaseEndDate = (
    index: number,
    startDateKey: keyof ResearchPhase,
    durationKey: keyof ResearchPhase,
    endDateKey: keyof ResearchPhase,
  ) => {
    setResearchPhases((prev) => {
      const phase = prev[index];
      if (
        !phase ||
        !phase[startDateKey] ||
        !phase[durationKey] ||
        (phase[durationKey] as number) <= 0
      ) {
        return prev;
      }

      const start = new Date(phase[startDateKey] as string);
      const end = new Date(start);
      end.setDate(start.getDate() + (phase[durationKey] as number) - 1);
      const newEndDate = end.toISOString().split("T")[0];

      const updated = [...prev];
      updated[index] = { ...updated[index], [endDateKey]: newEndDate };
      return updated;
    });
  };

  // ============================================
  // AUTO-CALCULATE DATES
  // ============================================
  useEffect(() => {
    if (basicForm.startDate && basicForm.dateRange && basicForm.dateRange > 0) {
      const start = new Date(basicForm.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + basicForm.dateRange - 1);
      const endDate = end.toISOString().split("T")[0];
      setBasicForm((prev) => ({ ...prev, endDate }));
    }
  }, [basicForm.startDate, basicForm.dateRange]);

  useEffect(() => {
    if (
      basicForm.ticketSaleStart &&
      basicForm.ticketSaleDuration &&
      basicForm.ticketSaleDuration > 0
    ) {
      const start = new Date(basicForm.ticketSaleStart);
      const end = new Date(start);
      end.setDate(start.getDate() + basicForm.ticketSaleDuration - 1);
      const ticketSaleEnd = end.toISOString().split("T")[0];
      setBasicForm((prev) => ({ ...prev, ticketSaleEnd }));
    }
  }, [basicForm.ticketSaleStart, basicForm.ticketSaleDuration]);

  // === MAIN PHASE (isWaitlist: false) ===
  const mainPhaseIndex = researchPhases.findIndex((p) => !p.isWaitlist);
  const mainPhase = researchPhases[mainPhaseIndex];

  useEffect(() => {
    if (mainPhaseIndex !== -1) {
      updatePhaseEndDate(
        mainPhaseIndex,
        "registrationStartDate",
        "registrationDuration",
        "registrationEndDate",
      );
    }
  }, [mainPhase?.registrationStartDate, mainPhase?.registrationDuration]);

  useEffect(() => {
    if (mainPhaseIndex !== -1) {
      updatePhaseEndDate(
        mainPhaseIndex,
        "fullPaperStartDate",
        "fullPaperDuration",
        "fullPaperEndDate",
      );
    }
  }, [mainPhase?.fullPaperStartDate, mainPhase?.fullPaperDuration]);

  useEffect(() => {
    if (mainPhaseIndex !== -1) {
      updatePhaseEndDate(
        mainPhaseIndex,
        "reviewStartDate",
        "reviewDuration",
        "reviewEndDate",
      );
    }
  }, [mainPhase?.reviewStartDate, mainPhase?.reviewDuration]);

  useEffect(() => {
    if (mainPhaseIndex !== -1) {
      updatePhaseEndDate(
        mainPhaseIndex,
        "reviseStartDate",
        "reviseDuration",
        "reviseEndDate",
      );
    }
  }, [mainPhase?.reviseStartDate, mainPhase?.reviseDuration]);

  useEffect(() => {
    if (mainPhaseIndex !== -1) {
      updatePhaseEndDate(
        mainPhaseIndex,
        "cameraReadyStartDate",
        "cameraReadyDuration",
        "cameraReadyEndDate",
      );
    }
  }, [mainPhase?.cameraReadyStartDate, mainPhase?.cameraReadyDuration]);

  // === WAITLIST PHASE (isWaitlist: true) ===
  const waitlistPhaseIndex = researchPhases.findIndex((p) => p.isWaitlist);
  const waitlistPhase = researchPhases[waitlistPhaseIndex];

  useEffect(() => {
    if (waitlistPhaseIndex !== -1) {
      updatePhaseEndDate(
        waitlistPhaseIndex,
        "registrationStartDate",
        "registrationDuration",
        "registrationEndDate",
      );
    }
  }, [
    waitlistPhase?.registrationStartDate,
    waitlistPhase?.registrationDuration,
  ]);

  useEffect(() => {
    if (waitlistPhaseIndex !== -1) {
      updatePhaseEndDate(
        waitlistPhaseIndex,
        "fullPaperStartDate",
        "fullPaperDuration",
        "fullPaperEndDate",
      );
    }
  }, [waitlistPhase?.fullPaperStartDate, waitlistPhase?.fullPaperDuration]);

  useEffect(() => {
    if (waitlistPhaseIndex !== -1) {
      updatePhaseEndDate(
        waitlistPhaseIndex,
        "reviewStartDate",
        "reviewDuration",
        "reviewEndDate",
      );
    }
  }, [waitlistPhase?.reviewStartDate, waitlistPhase?.reviewDuration]);

  useEffect(() => {
    if (waitlistPhaseIndex !== -1) {
      updatePhaseEndDate(
        waitlistPhaseIndex,
        "reviseStartDate",
        "reviseDuration",
        "reviseEndDate",
      );
    }
  }, [waitlistPhase?.reviseStartDate, waitlistPhase?.reviseDuration]);

  useEffect(() => {
    if (waitlistPhaseIndex !== -1) {
      updatePhaseEndDate(
        waitlistPhaseIndex,
        "cameraReadyStartDate",
        "cameraReadyDuration",
        "cameraReadyEndDate",
      );
    }
  }, [waitlistPhase?.cameraReadyStartDate, waitlistPhase?.cameraReadyDuration]);

  useEffect(() => {
    if (
      newSession.startTime &&
      newSession.timeRange &&
      newSession.timeRange > 0
    ) {
      const start = new Date(newSession.startTime);
      const end = new Date(start);
      end.setHours(start.getHours() + Math.floor(newSession.timeRange));
      end.setMinutes(start.getMinutes() + (newSession.timeRange % 1) * 60);
      setNewSession((prev) => ({
        ...prev,
        endTime: end.toISOString().slice(0, 16),
      }));
    }
  }, [newSession.startTime, newSession.timeRange]);

  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate || duration <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end.toISOString().split("T")[0];
  };
  // VALIDATION
  const validateBasicForm = (): boolean => {
    const saleStart = new Date(basicForm.ticketSaleStart);
    const saleEnd = new Date(basicForm.ticketSaleEnd);
    const eventStart = new Date(basicForm.startDate);

    if (saleStart >= eventStart || saleEnd >= eventStart) {
      toast.error("Hãy chọn ngày bán vé trước ngày bắt đầu sự kiện");
      return false;
    }
    if (!basicForm.conferenceName.trim()) {
      toast.error("Vui lòng nhập tên hội thảo!");
      return false;
    }
    if (!basicForm.startDate || !basicForm.endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
      return false;
    }
    if (!basicForm.conferenceCategoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return false;
    }
    return true;
  };

  const validateResearchTimeline = (): boolean => {
    const mainPhase = researchPhases.find((p) => !p.isWaitlist);

    if (!mainPhase) {
      toast.error("Thiếu timeline chính (main phase) cho hội thảo!");
      return false;
    }

    const {
      registrationStartDate,
      registrationEndDate,
      fullPaperStartDate,
      fullPaperEndDate,
      reviewStartDate,
      reviewEndDate,
      reviseStartDate,
      reviseEndDate,
      cameraReadyStartDate,
      cameraReadyEndDate,
    } = mainPhase;

    const { ticketSaleStart } = basicForm;

    // Check all required dates are filled
    if (
      !registrationStartDate ||
      !registrationEndDate ||
      !fullPaperStartDate ||
      !fullPaperEndDate ||
      !reviewStartDate ||
      !reviewEndDate ||
      !reviseStartDate ||
      !reviseEndDate ||
      !cameraReadyStartDate ||
      !cameraReadyEndDate ||
      !ticketSaleStart
    ) {
      toast.error("Vui lòng điền đầy đủ tất cả các ngày trong Timeline chính!");
      return false;
    }

    // Convert to Date objects
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);
    const paperStart = new Date(fullPaperStartDate);
    const paperEnd = new Date(fullPaperEndDate);
    const revStart = new Date(reviewStartDate);
    const revEnd = new Date(reviewEndDate);
    const reviseStart = new Date(reviseStartDate);
    const reviseEnd = new Date(reviseEndDate);
    const camStart = new Date(cameraReadyStartDate);
    const camEnd = new Date(cameraReadyEndDate);
    const saleStart = new Date(ticketSaleStart);

    // Validate timeline order
    if (regStart >= regEnd) {
      toast.error("Registration: Ngày bắt đầu phải trước ngày kết thúc!");
      return false;
    }

    if (regEnd >= paperStart) {
      toast.error("FullPaper phải bắt đầu sau khi Registration kết thúc!");
      return false;
    }

    if (paperStart >= paperEnd) {
      toast.error("FullPaper: Ngày bắt đầu phải trước ngày kết thúc!");
      return false;
    }

    if (paperEnd >= revStart) {
      toast.error("Review phải bắt đầu sau khi FullPaper kết thúc!");
      return false;
    }

    if (revStart >= revEnd) {
      toast.error("Review: Ngày bắt đầu phải trước ngày kết thúc!");
      return false;
    }

    if (revEnd >= reviseStart) {
      toast.error("Revise phải bắt đầu sau khi Review kết thúc!");
      return false;
    }

    if (reviseStart >= reviseEnd) {
      toast.error("Revise: Ngày bắt đầu phải trước ngày kết thúc!");
      return false;
    }

    if (reviseEnd >= camStart) {
      toast.error("CameraReady phải bắt đầu sau khi Revise kết thúc!");
      return false;
    }

    if (camStart >= camEnd) {
      toast.error("CameraReady: Ngày bắt đầu phải trước ngày kết thúc!");
      return false;
    }

    if (camEnd >= saleStart) {
      toast.error(
        `Timeline research phải kết thúc trước khi bán vé! CameraReady phải kết thúc trước ${saleStart.toLocaleDateString("vi-VN")}`,
      );
      return false;
    }

    return true;
  };

  const validateRankValue = (categoryId: string, value: string): boolean => {
    if (!value.trim()) {
      toast.error("Vui lòng nhập giá trị xếp hạng!");
      return false;
    }

    const category = rankingData?.data?.find((r) => r.rankId === categoryId);
    if (!category) return true;

    const categoryName = category.rankName?.toLowerCase() || "";
    const upperValue = value.toUpperCase();

    // Validation theo từng loại ranking
    if (categoryName.includes("core")) {
      const validCoreValues = ["Q1", "Q2", "Q3", "Q4"];
      if (!validCoreValues.includes(upperValue)) {
        toast.error("Giá trị xếp hạng cho 'Core' phải là Q1, Q2, Q3, hoặc Q4.");
        return false;
      }
    } else if (
      categoryName.includes("scopus") ||
      categoryName.includes("scimago")
    ) {
      const validScopusValues = ["Q1", "Q2", "Q3", "Q4"];
      if (!validScopusValues.includes(upperValue)) {
        toast.error(
          "Giá trị xếp hạng cho 'Scopus/Scimago' phải là Q1, Q2, Q3, hoặc Q4.",
        );
        return false;
      }
    } else if (
      categoryName.includes("isi") ||
      categoryName.includes("web of science")
    ) {
      const validISIValues = ["Q1", "Q2", "Q3", "Q4"];
      if (!validISIValues.includes(upperValue)) {
        toast.error(
          "Giá trị xếp hạng cho 'ISI/Web of Science' phải là Q1, Q2, Q3, hoặc Q4.",
        );
        return false;
      }
    }

    return true;
  };

  // BASIC INFO SUBMIT
  const handleBasicSubmit = async () => {
    if (!validateBasicForm()) return;

    try {
      setIsSubmitting(true);
      const result = await createBasicResearch(basicForm).unwrap();
      const confId = result.data.conferenceId;

      dispatch(setConferenceId(confId));
      dispatch(setConferenceBasicData(result.data));
      dispatch(markStepCompleted(1));
      dispatch(nextStep());

      toast.success("Tạo thông tin cơ bản thành công!");
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create basic info:", error);
      toast.error(apiError?.data?.Message || "Tạo thông tin cơ bản thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return;
    }
    if (!validateResearchTimeline()) {
      return;
    }

    const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);
    if (!hasAuthorTicket) {
      toast.error(
        "Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createResearchDetail({
        conferenceId,
        data: {
          name: researchDetail.name,
          paperFormat: researchDetail.paperFormat,
          numberPaperAccept: researchDetail.numberPaperAccept,
          revisionAttemptAllowed: researchDetail.revisionAttemptAllowed,
          rankingDescription: researchDetail.rankingDescription,
          allowListener: researchDetail.allowListener,
          rankValue: researchDetail.rankValue,
          rankYear: researchDetail.rankYear,
          reviewFee: researchDetail.reviewFee,
          rankingCategoryId: researchDetail.rankingCategoryId,
        },
      }).unwrap();

      // ============================================
      // ✅ BƯỚC 2: TẠO RESEARCH PHASES
      // ============================================
      await createResearchPhase({
        conferenceId,
        data: researchPhases.map((phase) => ({
          ...phase,
          revisionRoundDeadlines: phase.revisionRoundDeadlines,
        })),
      }).unwrap();

      // ============================================
      // BƯỚC 3: SAU ĐÓ MỚI XỬ LÝ PRICE
      // ============================================
      if (tickets.length > 0) {
        const priceData: ConferencePriceData = {
          typeOfTicket: tickets.map((ticket) => ({
            ticketPrice: parseFloat(ticket.ticketPrice.toFixed(2)),
            ticketName: ticket.ticketName,
            ticketDescription: ticket.ticketDescription,
            isAuthor: ticket.isAuthor ?? false,
            totalSlot: ticket.totalSlot,
            phases: (ticket.phases || []).map((phase) => ({
              phaseName: phase.phaseName,
              applyPercent: parseFloat(phase.applyPercent.toFixed(2)),
              startDate: phase.startDate,
              endDate: phase.endDate,
              totalslot: phase.totalslot,
            })),
          })),
        };

        await createPrice({ conferenceId, data: priceData }).unwrap();
      }

      // ============================================
      // BƯỚC 4: CÁC API CÒN LẠI (SONG SONG)
      // ============================================
      const sessionPromise =
        sessions.length > 0
          ? (() => {
              const formattedSessions = sessions.map((s) => ({
                title: s.title,
                description: s.description,
                date: s.date,
                startTime: s.startTime,
                endTime: s.endTime,
                roomId: s.roomId,
                speaker: (s.speaker || []).map((sp) => ({
                  name: sp.name,
                  description: sp.description,
                  image: sp.image instanceof File ? sp.image : undefined,
                  imageUrl: typeof sp.image === "string" ? sp.image : undefined,
                })),
                sessionMedias: (s.sessionMedias || []).map((media) => ({
                  mediaFile:
                    media.mediaFile instanceof File
                      ? media.mediaFile
                      : undefined,
                  mediaUrl:
                    typeof media.mediaFile === "string"
                      ? media.mediaFile
                      : undefined,
                })),
              }));

              return createSessions({
                conferenceId,
                data: { sessions: formattedSessions },
              }).unwrap();
            })()
          : Promise.resolve();

      const policiesPromise =
        policies.length > 0
          ? createPolicies({ conferenceId, data: { policies } }).unwrap()
          : Promise.resolve();
      const refundPromise =
        refundPolicies.length > 0
          ? createRefundPolicies({
              conferenceId,
              data: { refundPolicies },
            }).unwrap()
          : Promise.resolve();

      const materialPromises = researchMaterials.map((material) =>
        createResearchMaterial({
          conferenceId,
          fileName: material.fileName,
          fileDescription: material.fileDescription,
          file: material.file || undefined,
        }).unwrap(),
      );

      const rankingFilePromises = rankingFiles
        .filter((f) => f.fileUrl)
        .map((file) =>
          createResearchRankingFile({
            conferenceId,
            fileUrl: file.fileUrl!,
            file: file.file || undefined,
          }).unwrap(),
        );

      const rankingRefPromises = rankingReferences.map((ref) =>
        createResearchRankingReference({
          conferenceId,
          referenceUrl: ref.referenceUrl,
        }).unwrap(),
      );

      const mediaPromise =
        mediaList.length > 0
          ? createMedia({ conferenceId, data: { media: mediaList } }).unwrap()
          : Promise.resolve();
      const sponsorPromise =
        sponsors.length > 0
          ? createSponsors({ conferenceId, data: { sponsors } }).unwrap()
          : Promise.resolve();

      await Promise.all([
        sessionPromise,
        policiesPromise,
        refundPromise,
        ...materialPromises,
        ...rankingFilePromises,
        ...rankingRefPromises,
        mediaPromise,
        sponsorPromise,
      ]);

      toast.success("Tạo hội thảo nghiên cứu thành công!");
      dispatch(resetWizard());
      router.push(`/workspace/collaborator/manage-conference`);
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create research conference:", error);
      toast.error(apiError?.data?.Message || "Tạo hội thảo thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // ADD HANDLERS (Research-specific)
  // ============================================
  // Step 2: Research Detail
  const handleResearchDetailSubmit = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return;
    }

    // Validation logic...

    try {
      setIsSubmitting(true);
      await createResearchDetail({
        conferenceId,
        data: researchDetail,
      }).unwrap();

      dispatch(markStepCompleted(2));
      dispatch(nextStep());
      toast.success("Lưu chi tiết nghiên cứu thành công!");
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed:", error);
      toast.error(apiError?.data?.Message || "Lưu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Timeline
  const handleTimelineSubmit = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return;
    }

    if (!validateResearchTimeline()) return;

    try {
      setIsSubmitting(true);
      await createResearchPhase({
        conferenceId,
        data: researchPhases,
      }).unwrap();

      dispatch(markStepCompleted(3));
      dispatch(nextStep());
      toast.success("Lưu timeline thành công!");
    } catch (error) {
      const apiError = error as { data?: ApiError };
      toast.error(apiError?.data?.Message || "Lưu timeline thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Price (tương tự handlePriceSubmit trong tech conference)
  // Step 5: Sessions
  // Step 6: Policies
  // Step 7: Materials
  // Step 8: Media
  // Step 9: Sponsors (final submit)

  const handleAddRevisionRound = () => {
    const { roundNumber, startDate, durationInDays } = newRevisionRound;

    if (!startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu vòng chỉnh sửa!");
      return;
    }

    if (durationInDays <= 0) {
      toast.error("Số ngày phải lớn hơn 0!");
      return;
    }

    const endDate = calculateEndDate(startDate, durationInDays);

    // Kiểm tra trùng lặp với các vòng khác (tùy chọn)
    const isOverlapping = revisionRoundDeadlines.some((round) => {
      const existingStart = new Date(round.startSubmissionDate);
      const existingEnd = new Date(round.endSubmissionDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (isOverlapping) {
      toast.error("Vòng chỉnh sửa này bị trùng thời gian với vòng khác!");
      return;
    }

    const newRound: RevisionRoundDeadline = {
      roundNumber,
      startSubmissionDate: startDate,
      endSubmissionDate: endDate,
    };

    setRevisionRoundDeadlines([...revisionRoundDeadlines, newRound]);

    setNewRevisionRound({
      roundNumber: revisionRoundDeadlines.length + 2,
      startDate: "",
      durationInDays: 3,
    });

    toast.success("Đã thêm vòng chỉnh sửa!");
  };

  const handleAddMaterial = () => {
    if (!newMaterial.fileName.trim()) {
      toast.error("Vui lòng nhập tên file!");
      return;
    }
    if (!newMaterial.file) {
      toast.error("Vui lòng chọn file!");
      return;
    }

    setResearchMaterials([...researchMaterials, newMaterial]);
    setNewMaterial({ fileName: "", fileDescription: "", file: null });
    toast.success("Đã thêm tài liệu!");
  };

  const handleAddRankingFile = () => {
    if (!newRankingFile.fileUrl && !newRankingFile.file) {
      toast.error("Vui lòng nhập URL hoặc chọn file!");
      return;
    }

    setRankingFiles([...rankingFiles, newRankingFile]);
    setNewRankingFile({ fileUrl: "", file: null });
    toast.success("Đã thêm file xếp hạng!");
  };

  const handleAddRankingReference = () => {
    if (!newRankingReference.referenceUrl.trim()) {
      toast.error("Vui lòng nhập URL tham khảo!");
      return;
    }

    setRankingReferences([...rankingReferences, newRankingReference]);
    setNewRankingReference({ referenceUrl: "" });
    toast.success("Đã thêm URL tham khảo!");
  };

  const handleAddPhaseToNewTicket = () => {
    const {
      phaseName,
      percentValue,
      percentType,
      startDate,
      durationInDays,
      totalslot,
    } = newPhase;

    if (!phaseName.trim()) {
      toast.error("Vui lòng nhập tên giai đoạn!");
      return;
    }

    if (!startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu!");
      return;
    }

    if (totalslot <= 0) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }

    const phaseStart = new Date(startDate);
    const phaseEnd = new Date(phaseStart);
    phaseEnd.setDate(phaseStart.getDate() + durationInDays - 1);

    // Lấy main phase (không phải waitlist)
    const mainPhase = researchPhases.find((p) => !p.isWaitlist);

    // VALIDATION CHO VÉ TÁC GIẢ (isAuthor = true)
    if (newTicket.isAuthor) {
      if (
        !mainPhase?.registrationStartDate ||
        !mainPhase?.registrationEndDate
      ) {
        toast.error(
          "Vui lòng điền thông tin Timeline (Bước 4 - Registration) trước khi thêm giai đoạn giá cho vé tác giả!",
        );
        return;
      }

      const regStart = new Date(mainPhase.registrationStartDate);
      const regEnd = new Date(mainPhase.registrationEndDate);

      // Phase phải BẮT ĐẦU trong khoảng Registration
      if (phaseStart < regStart || phaseStart > regEnd) {
        toast.error(
          `Vé tác giả: Giai đoạn giá phải bắt đầu trong thời gian đăng ký (${regStart.toLocaleDateString("vi-VN")} - ${regEnd.toLocaleDateString("vi-VN")})!`,
        );
        return;
      }

      // Phase phải KẾT THÚC trước hoặc đúng ngày Registration kết thúc
      if (phaseEnd > regEnd) {
        toast.error(
          `Vé tác giả: Giai đoạn giá phải kết thúc trước ${regEnd.toLocaleDateString("vi-VN")}!`,
        );
        return;
      }
    }
    // VALIDATION CHO VÉ NGƯỜI NGHE (isAuthor = false)
    else {
      if (!basicForm.ticketSaleStart || !basicForm.ticketSaleEnd) {
        toast.error("Không tìm thấy thông tin thời gian bán vé (TicketSale)!");
        return;
      }

      const saleStart = new Date(basicForm.ticketSaleStart);
      const saleEnd = new Date(basicForm.ticketSaleEnd);

      // Phase phải BẮT ĐẦU trong khoảng TicketSale
      if (phaseStart < saleStart || phaseStart > saleEnd) {
        toast.error(
          `Vé người nghe: Giai đoạn giá phải bắt đầu trong thời gian bán vé (${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")})!`,
        );
        return;
      }

      // Phase phải KẾT THÚC trước hoặc đúng ngày TicketSale kết thúc
      if (phaseEnd > saleEnd) {
        toast.error(
          `Vé người nghe: Giai đoạn giá phải kết thúc trước ${saleEnd.toLocaleDateString("vi-VN")}!`,
        );
        return;
      }
    }

    // Check tổng số lượng vé các phases
    const currentPhasesTotal = newTicket.phases.reduce(
      (sum, p) => sum + p.totalslot,
      0,
    );
    if (currentPhasesTotal + totalslot > newTicket.totalSlot) {
      toast.error(
        `Tổng số lượng vé các giai đoạn (${currentPhasesTotal + totalslot}) vượt quá tổng số chỗ ngồi (${newTicket.totalSlot})!`,
      );
      return;
    }

    // Check overlap
    const hasOverlap = newTicket.phases.some((p) => {
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);
      return phaseStart <= pEnd && phaseEnd >= pStart;
    });

    if (hasOverlap) {
      toast.error("Giai đoạn này bị trùng thời gian với giai đoạn khác!");
      return;
    }

    const endDate = phaseEnd.toISOString().split("T")[0];

    const applyPercent =
      percentType === "increase" ? 100 + percentValue : 100 - percentValue;

    const phase: Phase = {
      phaseName,
      applyPercent,
      startDate,
      endDate,
      totalslot,
    };

    setNewTicket((prev) => ({
      ...prev,
      phases: [...prev.phases, phase],
    }));

    setNewPhase({
      phaseName: "",
      percentValue: 0,
      percentType: "increase",
      startDate: "",
      durationInDays: 1,
      totalslot: 0,
    });

    setIsPhaseModalOpen(false);
    toast.success("Đã thêm giai đoạn!");
  };

  const handleRemovePhaseFromTicket = (phaseIndex: number) => {
    setNewTicket((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, idx) => idx !== phaseIndex),
    }));
    toast.success("Đã xóa giai đoạn!");
  };

  const handleAddTicket = () => {
    if (!newTicket.ticketName.trim()) {
      toast.error("Vui lòng nhập tên vé!");
      return;
    }

    if (newTicket.ticketPrice <= 0) {
      toast.error("Giá vé phải lớn hơn 0!");
      return;
    }

    if (newTicket.totalSlot <= 0) {
      toast.error("Số lượng vé phải lớn hơn 0!");
      return;
    }

    // Lấy main phase (không phải waitlist)
    const mainPhase = researchPhases.find((p) => !p.isWaitlist);

    // VALIDATION CHO VÉ TÁC GIẢ
    if (newTicket.isAuthor) {
      if (
        !mainPhase?.registrationStartDate ||
        !mainPhase?.registrationEndDate
      ) {
        toast.error(
          "Vui lòng điền thông tin Timeline (Bước 4 - Registration) trước khi thêm vé tác giả!",
        );
        return;
      }

      const regStart = new Date(mainPhase.registrationStartDate);
      const regEnd = new Date(mainPhase.registrationEndDate);

      // Nếu có phases, check từng phase
      if (newTicket.phases.length > 0) {
        for (const phase of newTicket.phases) {
          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);

          if (phaseStart < regStart || phaseEnd > regEnd) {
            toast.error(
              `Vé tác giả phải bán trong thời gian đăng ký (${regStart.toLocaleDateString("vi-VN")} - ${regEnd.toLocaleDateString("vi-VN")}). Giai đoạn "${phase.phaseName}" không hợp lệ!`,
            );
            return;
          }
        }
      } else {
        toast.error("Vé tác giả phải có ít nhất 1 giai đoạn giá!");
        return;
      }
    }
    // VALIDATION CHO VÉ NGƯỜI NGHE
    else {
      if (!basicForm.ticketSaleStart || !basicForm.ticketSaleEnd) {
        toast.error("Không tìm thấy thông tin thời gian bán vé!");
        return;
      }

      const saleStart = new Date(basicForm.ticketSaleStart);
      const saleEnd = new Date(basicForm.ticketSaleEnd);

      // Nếu có phases, check từng phase
      if (newTicket.phases.length > 0) {
        for (const phase of newTicket.phases) {
          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);

          if (phaseStart < saleStart || phaseEnd > saleEnd) {
            toast.error(
              `Vé người nghe phải bán trong thời gian bán vé (${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")}). Giai đoạn "${phase.phaseName}" không hợp lệ!`,
            );
            return;
          }
        }
      } else {
        toast.error("Vé người nghe phải có ít nhất 1 giai đoạn giá!");
        return;
      }
    }

    // Check tổng số lượng phases = totalSlot
    if (newTicket.phases.length > 0) {
      const totalPhaseSlots = newTicket.phases.reduce(
        (sum, p) => sum + p.totalslot,
        0,
      );
      if (totalPhaseSlots !== newTicket.totalSlot) {
        toast.error(
          `Tổng số lượng vé các giai đoạn (${totalPhaseSlots}) phải bằng tổng số chỗ ngồi vé (${newTicket.totalSlot})!`,
        );
        return;
      }
    }

    // Thêm vé vào danh sách
    setTickets([...tickets, { ...newTicket }]);

    // Reset form
    setNewTicket({
      ticketPrice: 0,
      ticketName: "",
      ticketDescription: "",
      isAuthor: false,
      totalSlot: 0,
      phases: [],
    });

    toast.success("Đã thêm vé!");
  };

  const handleAddSession = () => {
    if (!newSession.date || !newSession.startTime || !newSession.endTime) {
      toast.error("Vui lòng nhập đầy đủ ngày và thời gian!");
      return;
    }

    if (!basicForm.startDate || !basicForm.endDate) {
      toast.error("Không tìm thấy thông tin thời gian sự kiện!");
      return;
    }

    const confStart = new Date(basicForm.startDate);
    const confEnd = new Date(basicForm.endDate);
    const sessionDate = new Date(newSession.date);

    if (sessionDate < confStart || sessionDate > confEnd) {
      toast.error(
        `Ngày phiên họp phải trong khoảng ${confStart.toLocaleDateString("vi-VN")} - ${confEnd.toLocaleDateString("vi-VN")}!`,
      );
      return;
    }

    if (newSession.startTime && newSession.endTime) {
      const start = new Date(newSession.startTime);
      const end = new Date(newSession.endTime);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

      if (durationMinutes < 30) {
        toast.error("Thời lượng phiên họp phải ít nhất 30 phút!");
        return;
      }

      if (durationMinutes < 0) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
      }
    }

    let formattedStartTime = newSession.startTime;
    let formattedEndTime = newSession.endTime;

    if (newSession.startTime.includes("T")) {
      const startDate = new Date(newSession.startTime);
      formattedStartTime = startDate.toTimeString().slice(0, 8);
    } else if (newSession.startTime.length === 5) {
      formattedStartTime = `${newSession.startTime}:00`;
    }

    if (newSession.endTime.includes("T")) {
      const endDate = new Date(newSession.endTime);
      formattedEndTime = endDate.toTimeString().slice(0, 8);
    } else if (newSession.endTime.length === 5) {
      formattedEndTime = `${newSession.endTime}:00`;
    }

    const sessionToAdd = {
      ...newSession,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };

    setSessions([...sessions, sessionToAdd]);
    setNewSession({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      timeRange: 1,
      roomId: "",
      speaker: [],
      sessionMedias: [],
    });

    toast.success("Đã thêm session!");
  };

  const handleAddPolicy = () => {
    if (!newPolicy.policyName) return;
    setPolicies([...policies, newPolicy]);
    setNewPolicy({ policyName: "", description: "" });
  };

  const handleAddRefundPolicy = () => {
    if (
      newRefundPolicy.percentRefund <= 0 ||
      newRefundPolicy.percentRefund > 100
    ) {
      toast.error("Phần trăm hoàn tiền phải từ 1-100%!");
      return;
    }

    if (!newRefundPolicy.refundDeadline) {
      toast.error("Vui lòng chọn hạn hoàn tiền!");
      return;
    }

    if (!basicForm.ticketSaleStart || !basicForm.ticketSaleEnd) {
      toast.error("Không tìm thấy thông tin thời gian bán vé!");
      return;
    }

    const deadline = new Date(newRefundPolicy.refundDeadline);
    const saleStart = new Date(basicForm.ticketSaleStart);
    const saleEnd = new Date(basicForm.ticketSaleEnd);

    if (deadline <= saleStart) {
      toast.error(
        `❌ Hạn hoàn tiền (${formatDate(newRefundPolicy.refundDeadline)}) phải SAU ngày bắt đầu bán vé (${formatDate(basicForm.ticketSaleStart)})!`,
      );
      return;
    }

    if (deadline >= saleEnd) {
      toast.error(
        `Hạn hoàn tiền (${formatDate(newRefundPolicy.refundDeadline)}) phải TRƯỚC ngày đóng bán vé (${formatDate(basicForm.ticketSaleEnd)})!`,
      );
      return;
    }

    const duplicateDeadline = refundPolicies.find(
      (p) =>
        formatDate(p.refundDeadline) ===
        formatDate(newRefundPolicy.refundDeadline),
    );
    if (duplicateDeadline) {
      toast.error("Hạn hoàn tiền này đã tồn tại trong chính sách khác!");
      return;
    }

    // Check thứ tự đã tồn tại
    const existingOrder = refundPolicies.find(
      (p) => p.refundOrder === newRefundPolicy.refundOrder,
    );
    if (existingOrder) {
      toast.error("Thứ tự này đã tồn tại!");
      return;
    }

    setRefundPolicies([...refundPolicies, newRefundPolicy]);
    setNewRefundPolicy({
      percentRefund: 0,
      refundDeadline: "",
      refundOrder: refundPolicies.length + 1,
    });
    toast.success("Đã thêm chính sách hoàn tiền!");
  };
  const handleAddMedia = () => {
    if (!newMedia.mediaFile) return;
    setMediaList([...mediaList, newMedia]);
    setNewMedia({ mediaFile: null });
  };

  const handleAddSponsor = () => {
    if (!newSponsor.name || !newSponsor.imageFile) {
      toast.error("Vui lòng nhập tên và chọn logo!");
      return;
    }
    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", imageFile: null });
    toast.success("Đã thêm nhà tài trợ!");
  };

  const calculatePhaseEndDate = (
    startDate: string,
    durationInDays: number,
  ): string => {
    if (!startDate || durationInDays <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationInDays - 1);
    return end.toISOString().split("T")[0];
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tạo hội thảo nghiên cứu mới
        </h1>
        <p className="text-gray-600 mt-1">
          Điền đầy đủ thông tin để tạo hội thảo nghiên cứu
        </p>
      </div>
      <div className="flex items-center justify-between mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step;
          const isAccessible = isCompleted || step <= currentStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isAccessible && dispatch(goToStep(step))}
                disabled={!isAccessible}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                  ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-200" : ""}
                  ${isCompleted && !isCurrent ? "bg-green-600 text-white" : ""}
                  ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-500" : ""}
                  ${isAccessible ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}
                `}
              >
                {isCompleted ? "✓" : step}
              </button>
              {step < 9 && (
                <div
                  className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs">
        <span
          className={
            currentStep === 1 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Thông tin
        </span>
        <span
          className={
            currentStep === 2 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Chi tiết
        </span>
        <span
          className={
            currentStep === 3 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Timeline
        </span>
        <span
          className={
            currentStep === 4 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Giá vé
        </span>
        <span
          className={
            currentStep === 5 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Phiên họp
        </span>
        <span
          className={
            currentStep === 6 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Chính sách
        </span>
        <span
          className={
            currentStep === 7 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Tài liệu
        </span>
        <span
          className={
            currentStep === 8 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Media
        </span>
        <span
          className={
            currentStep === 9 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Tài trợ
        </span>
      </div>
      {isSubmitting && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            <p className="text-sm text-yellow-800 font-medium">
              Đang xử lý... Vui lòng đợi
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: BASIC INFO */}
      {currentStep === 1 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">1. Thông tin cơ bản</h3>
          </div>

          <div className="space-y-4">
            <FormInput
              label="Tên hội thảo nghiên cứu"
              name="conferenceName"
              value={basicForm.conferenceName}
              onChange={(val) =>
                setBasicForm({ ...basicForm, conferenceName: val })
              }
              required
            />
            <FormTextArea
              label="Mô tả"
              value={basicForm.description ?? ""}
              onChange={(val) =>
                setBasicForm({ ...basicForm, description: val })
              }
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <DatePickerInput
                  label="Ngày bắt đầu"
                  value={basicForm.startDate}
                  onChange={(val) =>
                    setBasicForm({ ...basicForm, startDate: val })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Số ngày diễn ra *
                </label>
                <input
                  type="number"
                  value={basicForm.dateRange}
                  onChange={(e) =>
                    setBasicForm({
                      ...basicForm,
                      dateRange: Number(e.target.value),
                    })
                  }
                  required
                  placeholder="VD: 3 ngày"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày kết thúc
                </label>
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                  {basicForm.endDate ? (
                    <span className="text-gray-900">
                      {formatDate(basicForm.endDate)}
                    </span>
                  ) : (
                    <span className="text-gray-400">--/--/----</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DatePickerInput
                label="Ngày bắt đầu bán vé"
                value={basicForm.ticketSaleStart}
                onChange={(val) =>
                  setBasicForm({ ...basicForm, ticketSaleStart: val })
                }
                maxDate={basicForm.startDate}
                required
              />
              <FormInput
                label="Số ngày bán vé"
                type="number"
                min="1"
                value={basicForm.ticketSaleDuration}
                onChange={(val) =>
                  setBasicForm({
                    ...basicForm,
                    ticketSaleDuration: Number(val),
                  })
                }
                required
                placeholder="VD: 30 ngày"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày kết thúc bán vé
                </label>
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                  {basicForm.ticketSaleEnd ? (
                    <span className="text-gray-900">
                      {formatDate(basicForm.ticketSaleEnd)}
                    </span>
                  ) : (
                    <span className="text-gray-400">--/--/----</span>
                  )}
                </div>
              </div>
            </div>
          <div>

              </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Sức chứa"
                name="totalSlot"
                type="number"
                value={basicForm.totalSlot}
                onChange={(val) =>
                  setBasicForm({ ...basicForm, totalSlot: Number(val) })
                }
              />
              <FormSelect
                label="Danh mục"
                name="categoryId"
                value={basicForm.conferenceCategoryId}
                onChange={(val) =>
                  setBasicForm({ ...basicForm, conferenceCategoryId: val })
                }
                options={categoryOptions}
                required
                disabled={isCategoriesLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Địa chỉ"
                name="address"
                value={basicForm.address}
                onChange={(val) => setBasicForm({ ...basicForm, address: val })}
              />
              <FormSelect
                label="Thành phố"
                name="cityId"
                value={basicForm.cityId}
                onChange={(val) => setBasicForm({ ...basicForm, cityId: val })}
                options={cityOptions}
                required
                disabled={isCitiesLoading}
              />
            </div>

            <ImageUpload
              label="Banner Image (1 ảnh)"
              subtext="Dưới 4MB, định dạng PNG hoặc JPG"
              maxSizeMB={4}
              height="h-48"
              onChange={(file) =>
                setBasicForm({
                  ...basicForm,
                  bannerImageFile: file as File | null,
                })
              }
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleBasicSubmit}
                disabled={isSubmitting || completedSteps.includes(1)}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : completedSteps.includes(1)
                    ? "Đã lưu"
                    : "Lưu và tiếp tục"}
              </Button>

              {completedSteps.includes(1) && (
                <Button
                  onClick={() => dispatch(nextStep())}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  Tiếp tục →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: RESEARCH DETAIL */}
      {currentStep === 2 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">2. Chi tiết nghiên cứu</h3>

          <div className="space-y-4">
            <FormInput
              label="Tên nghiên cứu"
              name="name"
              value={researchDetail.name}
              onChange={(val) =>
                setResearchDetail({ ...researchDetail, name: val })
              }
              required
              placeholder="VD: International Conference on AI Research"
            />

            <div className="grid grid-cols-3 gap-4">
              <FormSelect
                label="Định dạng bài báo"
                name="paperFormat"
                value={researchDetail.paperFormat}
                onChange={(val) =>
                  setResearchDetail({ ...researchDetail, paperFormat: val })
                }
                options={[
                  { value: "acm", label: "ACM" },
                  { value: "apa", label: "APA" },
                  { value: "chicago", label: "Chicago" },
                  { value: "elsevier", label: "Elsevier" },
                  { value: "ieee", label: "IEEE" },
                  { value: "lncs", label: "LNCS" },
                  { value: "mla", label: "MLA" },
                  { value: "springer", label: "Springer" },
                ]}
                required
              />
              <FormInput
                label="Số bài báo chấp nhận"
                name="numberPaperAccept"
                type="number"
                value={researchDetail.numberPaperAccept}
                onChange={(val) =>
                  setResearchDetail({
                    ...researchDetail,
                    numberPaperAccept: Number(val),
                  })
                }
                placeholder="VD: 50"
              />
              <FormInput
                label="Số lần chỉnh sửa cho phép"
                name="revisionAttemptAllowed"
                type="number"
                value={researchDetail.revisionAttemptAllowed}
                onChange={(val) =>
                  setResearchDetail({
                    ...researchDetail,
                    revisionAttemptAllowed: Number(val),
                  })
                }
                placeholder="VD: 2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormSelect
                label="Loại xếp hạng"
                name="rankingCategoryId"
                value={researchDetail.rankingCategoryId}
                onChange={(val) => {
                  const selectedRank = rankingData?.data?.find(
                    (r) => r.rankId === val,
                  );
                  setResearchDetail({
                    ...researchDetail,
                    rankingCategoryId: val,
                    rankValue: "",
                  });
                }}
                options={rankingOptions}
                required
                disabled={isRankingLoading}
              />
              {/*lấy chỗ này*/}
              {/* <FormSelect
                        label="Giá trị xếp hạng"
                        name="rankValue"
                        value={researchDetail.rankValue}
                        onChange={(val) => setResearchDetail({ ...researchDetail, rankValue: val })}
                        options={(() => {
                          const category = rankingData?.data?.find(
                            (r) => r.rankId === researchDetail.rankingCategoryId
                          );
                          const categoryName = category?.rankName?.toLowerCase() || "";

                          if (
                            categoryName.includes("core") ||
                            categoryName.includes("scopus") ||
                            categoryName.includes("scimago") ||
                            categoryName.includes("isi") ||
                            categoryName.includes("web of science")
                          ) {
                            return [
                              { value: "Q1", label: "Q1" },
                              { value: "Q2", label: "Q2" },
                              { value: "Q3", label: "Q3" },
                              { value: "Q4", label: "Q4" },
                            ];
                          }

                          
                          return [
                            { value: "A*", label: "A*" },
                            { value: "A", label: "A" },
                            { value: "B", label: "B" },
                            { value: "C", label: "C" },
                          ];
                        })()}
                        required={!!researchDetail.rankingCategoryId}
                        disabled={!researchDetail.rankingCategoryId}
                      /> */}

              {/*9h36*/}
              {/* {researchDetail.rankingCategoryId && (() => {
                        const category = rankingData?.data?.find(
                          (r) => r.rankId === researchDetail.rankingCategoryId
                        );
                        const categoryName = (category?.rankName || "").toLowerCase();

                        if (categoryName.includes("citescore")) {
                          return (
                            <FormInput
                              label="Giá trị xếp hạng (CiteScore)"
                              name="rankValue"
                              type="number"
                              step="0.01"
                              min="0"
                              value={researchDetail.rankValue}
                              onChange={(val) => setResearchDetail({ ...researchDetail, rankValue: val })}
                              placeholder="VD: 1.25"
                              required
                            />
                          );
                        } else {
                          return (
                            <FormSelect
                              label="Giá trị xếp hạng"
                              name="rankValue"
                              value={researchDetail.rankValue}
                              onChange={(val) => setResearchDetail({ ...researchDetail, rankValue: val })}
                              options={(() => {
                                if (
                                  categoryName.includes("core") ||
                                  categoryName.includes("scopus") ||
                                  categoryName.includes("scimago") ||
                                  categoryName.includes("isi") ||
                                  categoryName.includes("web of science")
                                ) {
                                  return [
                                    { value: "Q1", label: "Q1" },
                                    { value: "Q2", label: "Q2" },
                                    { value: "Q3", label: "Q3" },
                                    { value: "Q4", label: "Q4" },
                                  ];
                                }
                                return [
                                  { value: "A*", label: "A*" },
                                  { value: "A", label: "A" },
                                  { value: "B", label: "B" },
                                  { value: "C", label: "C" },
                                ];
                              })()}
                              required
                              disabled={!researchDetail.rankingCategoryId}
                            />
                          );
                        }
                      })()} */}

              {researchDetail.rankingCategoryId && (
                <FormInput
                  label="Giá trị xếp hạng"
                  name="rankValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={researchDetail.rankValue}
                  onChange={(val) =>
                    setResearchDetail({ ...researchDetail, rankValue: val })
                  }
                  placeholder="Nhập giá trị xếp hạng, ví dụ: 1.25"
                  required
                />
              )}
              <FormInput
                label="Năm xếp hạng"
                name="rankYear"
                type="number"
                value={researchDetail.rankYear}
                onChange={(val) =>
                  setResearchDetail({
                    ...researchDetail,
                    rankYear: Number(val),
                  })
                }
                placeholder="VD: 2024"
              />
            </div>

            <FormTextArea
              label="Mô tả xếp hạng"
              name="rankingDescription"
              value={researchDetail.rankingDescription}
              onChange={(val) =>
                setResearchDetail({
                  ...researchDetail,
                  rankingDescription: val,
                })
              }
              rows={3}
              placeholder="Mô tả chi tiết về xếp hạng của hội thảo..."
            />
            {researchDetail.rankingCategoryId && (
              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                <strong>Lưu ý:</strong> Chọn loại xếp hạng trước để hiển thị các
                giá trị phù hợp (Q1-Q4 cho Core/Scopus, A*-C cho các loại khác)
              </div>
            )}
            <FormInput
              label="Phí đánh giá bài báo (VND)"
              name="reviewFee"
              type="number"
              value={researchDetail.reviewFee}
              onChange={(val) =>
                setResearchDetail({ ...researchDetail, reviewFee: Number(val) })
              }
              placeholder="VD: 500000"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowListener"
                checked={researchDetail.allowListener}
                onChange={(e) =>
                  setResearchDetail({
                    ...researchDetail,
                    allowListener: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <label htmlFor="allowListener" className="text-sm font-medium">
                Cho phép người nghe tham dự (không nộp bài)
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => dispatch(prevStep())}
                variant="outline"
                className="flex-1"
              >
                ← Quay lại
              </Button>

              <Button
                onClick={handleResearchDetailSubmit}
                disabled={isSubmitting || completedSteps.includes(2)}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : completedSteps.includes(2)
                    ? "Đã lưu"
                    : "Lưu và tiếp tục"}
              </Button>

              {completedSteps.includes(2) && (
                <Button
                  onClick={() => dispatch(nextStep())}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  Tiếp tục →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RESEARCH PHASE/TIMELINE */}
      {currentStep === 3 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            3. Timeline & Giai đoạn
          </h3>
          {basicForm.startDate && basicForm.endDate && (
            <span className="text-sm text-green-600">
              Ngày tổ chức ({formatDate(basicForm.startDate)} →{" "}
              {formatDate(basicForm.endDate)}) | Ngày bán vé (
              {formatDate(basicForm.ticketSaleStart)} →{" "}
              {formatDate(basicForm.ticketSaleEnd)})
            </span>
          )}
          <div className="space-y-6">
            {/* Tab switching */}
            <div>
              <h4 className="font-medium mb-3">⚙️ Chọn timeline</h4>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={researchPhases[0].isActive ? "default" : "outline"}
                  onClick={() => {
                    const updated = [...researchPhases];
                    updated[0] = { ...updated[0], isActive: true };
                    updated[1] = { ...updated[1], isActive: false };
                    setResearchPhases(updated);
                  }}
                >
                  Timeline chính
                </Button>
                <Button
                  variant={researchPhases[1].isActive ? "default" : "outline"}
                  onClick={() => {
                    const updated = [...researchPhases];
                    updated[0] = { ...updated[0], isActive: false };
                    updated[1] = { ...updated[1], isActive: true };
                    setResearchPhases(updated);
                  }}
                >
                  Waitlist Timeline
                </Button>
              </div>

              {/* Nút tạo waitlist */}

              {!researchPhases[1].isActive && (
                <div className="mt-2 flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Copy giống main
                      const main = researchPhases[0];
                      const copiedWaitlist: ResearchPhase = {
                        ...main,
                        isWaitlist: true,
                        isActive: true,
                      };
                      setResearchPhases([main, copiedWaitlist]);
                    }}
                  >
                    Tạo waitlist timeline tương tự
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Tạo mới trống
                      const emptyWaitlist: ResearchPhase = {
                        registrationStartDate: "",
                        registrationEndDate: "",
                        registrationDuration: 1,
                        fullPaperStartDate: "",
                        fullPaperEndDate: "",
                        fullPaperDuration: 1,
                        reviewStartDate: "",
                        reviewEndDate: "",
                        reviewDuration: 1,
                        reviseStartDate: "",
                        reviseEndDate: "",
                        reviseDuration: 1,
                        cameraReadyStartDate: "",
                        cameraReadyEndDate: "",
                        cameraReadyDuration: 1,
                        isWaitlist: true,
                        isActive: true,
                        revisionRoundDeadlines: [],
                      };
                      setResearchPhases([researchPhases[0], emptyWaitlist]);
                    }}
                  >
                    Tạo waitlist timeline mới
                  </Button>
                </div>
              )}
            </div>

            {/* === RENDER ACTIVE PHASE === */}
            {(() => {
              const activePhase =
                researchPhases.find((p) => p.isActive) || researchPhases[0];

              const updateActivePhase = (updates: Partial<ResearchPhase>) => {
                setResearchPhases((prev) =>
                  prev.map((p) => (p.isActive ? { ...p, ...updates } : p)),
                );
              };

              const updateDeadline = (
                newDeadlines: RevisionRoundDeadline[],
              ) => {
                setResearchPhases((prev) =>
                  prev.map((p) =>
                    p.isActive
                      ? { ...p, revisionRoundDeadlines: newDeadlines }
                      : p,
                  ),
                );
              };

              return (
                <>
                  {/* Registration Phase */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      📝 Đăng ký tham dự
                      {activePhase.registrationStartDate &&
                        activePhase.registrationEndDate && (
                          <span className="text-sm text-blue-600">
                            ({formatDate(activePhase.registrationStartDate)} →{" "}
                            {formatDate(activePhase.registrationEndDate)})
                          </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormInput
                        label="Ngày bắt đầu"
                        type="date"
                        name="registrationStartDate"
                        value={activePhase.registrationStartDate}
                        onChange={(val) =>
                          updateActivePhase({ registrationStartDate: val })
                        }
                        max={
                          basicForm.ticketSaleStart
                            ? new Date(
                                new Date(basicForm.ticketSaleStart).getTime() -
                                  86400000,
                              )
                                .toISOString()
                                .split("T")[0]
                            : undefined
                        }
                        required
                      />
                      <FormInput
                        label="Số ngày"
                        type="number"
                        min="1"
                        value={activePhase.registrationDuration}
                        onChange={(val) =>
                          updateActivePhase({
                            registrationDuration: Number(val),
                          })
                        }
                        placeholder="VD: 30 ngày"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày kết thúc
                        </label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                          {activePhase.registrationEndDate ? (
                            <span className="text-gray-900">
                              {formatDate(activePhase.registrationEndDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400">--/--/----</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Paper Phase */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      📄 Nộp bài full paper
                      {activePhase.fullPaperStartDate &&
                        activePhase.fullPaperEndDate && (
                          <span className="text-sm text-green-600">
                            ({formatDate(activePhase.fullPaperStartDate)} →{" "}
                            {formatDate(activePhase.fullPaperEndDate)})
                          </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormInput
                        label="Ngày bắt đầu"
                        type="date"
                        name="fullPaperStartDate"
                        value={activePhase.fullPaperStartDate}
                        onChange={(val) =>
                          updateActivePhase({ fullPaperStartDate: val })
                        }
                        min={activePhase.registrationEndDate || undefined}
                        required
                      />
                      <FormInput
                        label="Số ngày"
                        type="number"
                        min="1"
                        value={activePhase.fullPaperDuration}
                        onChange={(val) =>
                          updateActivePhase({ fullPaperDuration: Number(val) })
                        }
                        placeholder="VD: 60 ngày"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày kết thúc
                        </label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                          {activePhase.fullPaperEndDate ? (
                            <span className="text-gray-900">
                              {formatDate(activePhase.fullPaperEndDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400">--/--/----</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Phase */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      🔍 Phản biện
                      {activePhase.reviewStartDate &&
                        activePhase.reviewEndDate && (
                          <span className="text-sm text-purple-600">
                            ({formatDate(activePhase.reviewStartDate)} →{" "}
                            {formatDate(activePhase.reviewEndDate)})
                          </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormInput
                        label="Ngày bắt đầu"
                        type="date"
                        name="reviewStartDate"
                        value={activePhase.reviewStartDate}
                        onChange={(val) =>
                          updateActivePhase({ reviewStartDate: val })
                        }
                        min={activePhase.fullPaperEndDate || undefined}
                      />
                      <FormInput
                        label="Số ngày"
                        type="number"
                        min="1"
                        value={activePhase.reviewDuration}
                        onChange={(val) =>
                          updateActivePhase({ reviewDuration: Number(val) })
                        }
                        placeholder="VD: 30 ngày"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày kết thúc
                        </label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                          {activePhase.reviewEndDate ? (
                            <span className="text-gray-900">
                              {formatDate(activePhase.reviewEndDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400">--/--/----</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revision Phase with Round Deadlines */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      ✏️ Chỉnh sửa
                      {activePhase.reviseStartDate &&
                        activePhase.reviseEndDate && (
                          <span className="text-sm text-orange-600">
                            ({formatDate(activePhase.reviseStartDate)} →{" "}
                            {formatDate(activePhase.reviseEndDate)})
                          </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <FormInput
                        label="Ngày bắt đầu"
                        type="date"
                        name="reviseStartDate"
                        value={activePhase.reviseStartDate}
                        onChange={(val) =>
                          updateActivePhase({ reviseStartDate: val })
                        }
                        min={activePhase.reviewEndDate || undefined}
                      />
                      <FormInput
                        label="Số ngày"
                        type="number"
                        min="1"
                        value={activePhase.reviseDuration}
                        onChange={(val) =>
                          updateActivePhase({ reviseDuration: Number(val) })
                        }
                        placeholder="VD: 15 ngày"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày kết thúc
                        </label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                          {activePhase.reviseEndDate ? (
                            <span className="text-gray-900">
                              {formatDate(activePhase.reviseEndDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400">--/--/----</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Revision Round Deadlines */}
                    <div className="pl-4 border-l-2 border-orange-200">
                      <h5 className="font-medium mb-2">
                        Deadline từng vòng chỉnh sửa (
                        {activePhase.revisionRoundDeadlines.length})
                      </h5>

                      {activePhase.revisionRoundDeadlines.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {activePhase.revisionRoundDeadlines.map(
                            (round, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-gray-50 rounded border border-gray-200"
                              >
                                <div className="text-sm font-medium">
                                  Vòng {round.roundNumber}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {formatDate(round.endSubmissionDate)}
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    updateDeadline(
                                      activePhase.revisionRoundDeadlines.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    )
                                  }
                                  className="w-full mt-2"
                                >
                                  Xóa
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2">
                        <FormInput
                          label="Vòng thứ"
                          type="number"
                          min="1"
                          value={newRevisionRound.roundNumber}
                          onChange={(val) =>
                            setNewRevisionRound({
                              ...newRevisionRound,
                              roundNumber: Number(val),
                            })
                          }
                        />
                        <FormInput
                          label="Ngày bắt đầu"
                          type="date"
                          value={newRevisionRound.startDate}
                          onChange={(val) =>
                            setNewRevisionRound({
                              ...newRevisionRound,
                              startDate: val,
                            })
                          }
                          min={activePhase.reviseStartDate || undefined}
                          max={activePhase.reviseEndDate || undefined}
                        />
                        <FormInput
                          label="Số ngày"
                          type="number"
                          min="1"
                          value={newRevisionRound.durationInDays}
                          onChange={(val) =>
                            setNewRevisionRound({
                              ...newRevisionRound,
                              durationInDays: Number(val),
                            })
                          }
                        />
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ngày kết thúc
                          </label>
                          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                            {newRevisionRound.startDate &&
                            newRevisionRound.durationInDays > 0 ? (
                              <span className="text-gray-900">
                                {formatDate(
                                  calculateEndDate(
                                    newRevisionRound.startDate,
                                    newRevisionRound.durationInDays,
                                  ),
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-400">--/--/----</span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const { roundNumber, startDate, durationInDays } =
                              newRevisionRound;
                            if (!startDate || durationInDays <= 0) return;
                            const endDate = calculateEndDate(
                              startDate,
                              durationInDays,
                            );
                            const newRound: RevisionRoundDeadline = {
                              roundNumber,
                              startSubmissionDate: startDate,
                              endSubmissionDate: endDate,
                            };
                            updateDeadline([
                              ...activePhase.revisionRoundDeadlines,
                              newRound,
                            ]);
                            setNewRevisionRound({
                              roundNumber:
                                activePhase.revisionRoundDeadlines.length + 2,
                              startDate: "",
                              durationInDays: 3,
                            });
                            toast.success("Đã thêm vòng chỉnh sửa!");
                          }}
                          className="mt-6"
                        >
                          Thêm vòng
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Camera Ready Phase */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      📸 Camera Ready
                      {activePhase.cameraReadyStartDate &&
                        activePhase.cameraReadyEndDate && (
                          <span className="text-sm text-red-600">
                            ({formatDate(activePhase.cameraReadyStartDate)} →{" "}
                            {formatDate(activePhase.cameraReadyEndDate)})
                          </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormInput
                        label="Ngày bắt đầu"
                        type="date"
                        name="cameraReadyStartDate"
                        value={activePhase.cameraReadyStartDate}
                        onChange={(val) =>
                          updateActivePhase({ cameraReadyStartDate: val })
                        }
                        min={activePhase.reviseEndDate || undefined}
                        max={
                          basicForm.ticketSaleStart
                            ? new Date(
                                new Date(basicForm.ticketSaleStart).getTime() -
                                  86400000,
                              )
                                .toISOString()
                                .split("T")[0]
                            : undefined
                        }
                      />

                      <FormInput
                        label="Số ngày"
                        type="number"
                        min="1"
                        value={activePhase.cameraReadyDuration}
                        onChange={(val) =>
                          updateActivePhase({
                            cameraReadyDuration: Number(val),
                          })
                        }
                        placeholder="VD: 7 ngày"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày kết thúc
                        </label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                          {activePhase.cameraReadyEndDate ? (
                            <span className="text-gray-900">
                              {formatDate(activePhase.cameraReadyEndDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400">--/--/----</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => dispatch(prevStep())}
                variant="outline"
                className="flex-1"
              >
                ← Quay lại
              </Button>

              <Button
                onClick={handleResearchDetailSubmit}
                disabled={isSubmitting || completedSteps.includes(2)}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : completedSteps.includes(2)
                    ? "Đã lưu"
                    : "Lưu và tiếp tục"}
              </Button>

              {completedSteps.includes(3) && (
                <Button
                  onClick={() => dispatch(nextStep())}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  Tiếp tục →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP: PRICE */}
      {currentStep === 4 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">4. Giá vé</h3>

          <div className="border p-4 rounded mb-4">
            <h4 className="font-medium mb-3 text-blue-600">
              Danh sách vé ({tickets.length})
            </h4>

            {tickets.map((t, idx) => (
              <div
                key={t.ticketId || idx}
                className="border rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3 border-b pb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-gray-800">
                        {t.ticketName}
                      </h3>
                      {t.isAuthor && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                          Vé tác giả
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(t.phases?.[0]?.startDate)} -{" "}
                      {formatDate(t.phases?.[t.phases.length - 1]?.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(t.ticketPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Số lượng: {t.totalSlot}
                    </div>
                  </div>
                </div>

                {/* Phases */}
                {t.phases && t.phases.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-600 mb-1.5">
                      Giai đoạn giá ({t.phases.length}):
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {t.phases.map((p, pi) => {
                        const isIncrease = p.applyPercent > 100;
                        const percentDisplay = isIncrease
                          ? `+${p.applyPercent - 100}%`
                          : `-${100 - p.applyPercent}%`;

                        return (
                          <div
                            key={pi}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div
                              className="text-xs font-semibold text-gray-800 mb-1 truncate"
                              title={p.phaseName}
                            >
                              {p.phaseName}
                            </div>
                            <div className="text-[10px] text-gray-500 mb-1 leading-tight">
                              {formatDate(p.startDate)} -{" "}
                              {formatDate(p.endDate)}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                Tổng: {p.totalslot}
                              </span>
                              <span
                                className={`font-bold ${
                                  isIncrease ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {percentDisplay}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    setTickets(tickets.filter((_, i) => i !== idx))
                  }
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5 mt-3"
                >
                  Xóa vé
                </Button>
              </div>
            ))}
          </div>

          <div className="border p-4 rounded">
            <h4 className="font-medium mb-3">Thêm vé mới</h4>
            {(() => {
              const mainPhase = researchPhases.find((p) => !p.isWaitlist);
              if (
                mainPhase?.registrationStartDate &&
                mainPhase?.registrationEndDate
              ) {
                return (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm text-amber-800">
                      <strong>Thời gian đăng ký:</strong>{" "}
                      {formatDate(mainPhase.registrationStartDate)} –{" "}
                      {formatDate(mainPhase.registrationEndDate)}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      * Vé tác giả phải bán trong khoảng thời gian này
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            <FormInput
              label="Tên vé"
              value={newTicket.ticketName}
              onChange={(val) =>
                setNewTicket({ ...newTicket, ticketName: val })
              }
              placeholder="Vé cơ bản, tiêu chuẩn, nâng cao ..."
            />
            <FormTextArea
              label="Mô tả"
              value={newTicket.ticketDescription}
              onChange={(val) =>
                setNewTicket({ ...newTicket, ticketDescription: val })
              }
              rows={2}
            />

            {/* CHECKBOX isAuthor */}
            <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="isAuthor"
                checked={newTicket.isAuthor}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, isAuthor: e.target.checked })
                }
                className="w-4 h-4 text-blue-600"
              />
              <label
                htmlFor="isAuthor"
                className="text-sm font-medium text-blue-900"
              >
                Đây là vé dành cho tác giả (bắt buộc ít nhất 1 loại)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <FormInput
                label="Giá vé gốc (VND)"
                type="number"
                value={newTicket.ticketPrice}
                onChange={(val) =>
                  setNewTicket({ ...newTicket, ticketPrice: Number(val) })
                }
                placeholder="500000"
              />
              <FormInput
                label="Tổng số lượng"
                type="number"
                value={newTicket.totalSlot}
                onChange={(val) =>
                  setNewTicket({ ...newTicket, totalSlot: Number(val) })
                }
                placeholder="100"
              />
            </div>

            <div className="mt-4 border-t pt-3">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                Giai đoạn giá ({newTicket.phases.length})
                {basicForm.ticketSaleStart && basicForm.ticketSaleEnd && (
                  <span className="text-sm text-blue-600">
                    {formatDate(basicForm.ticketSaleStart)} →{" "}
                    {formatDate(basicForm.ticketSaleEnd)}
                  </span>
                )}
              </h5>

              {newTicket.phases.length > 0 ? (
                <div className="mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    {newTicket.phases.map((p, idx) => {
                      const isIncrease = p.applyPercent > 100;
                      const percentDisplay = isIncrease
                        ? `+${p.applyPercent - 100}%`
                        : `-${100 - p.applyPercent}%`;
                      const adjustedPrice =
                        newTicket.ticketPrice * (p.applyPercent / 100);

                      return (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 relative"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemovePhaseFromTicket(idx)}
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-xs font-bold"
                            title="Xóa giai đoạn"
                          >
                            ✕
                          </button>

                          <div
                            className="text-xs font-semibold text-gray-800 mb-1 truncate"
                            title={p.phaseName}
                          >
                            {p.phaseName}
                          </div>
                          <div className="text-[10px] text-gray-500 mb-1 leading-tight">
                            {formatDate(p.startDate)} - {formatDate(p.endDate)}
                          </div>
                          <div className="text-[10px] text-gray-600 mb-1">
                            Giá: {formatCurrency(adjustedPrice)}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              SL: {p.totalslot}
                            </span>
                            <span
                              className={`font-bold ${
                                isIncrease ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {percentDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Chưa có giai đoạn nào được thêm.
                </p>
              )}

              <Button
                size="sm"
                onClick={() => setIsPhaseModalOpen(true)}
                className="w-full mt-2"
                variant="outline"
              >
                Thêm giai đoạn giá
              </Button>

              {/* Modal thêm giai đoạn */}
              {isPhaseModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Thêm giai đoạn giá
                      </h3>
                      <button
                        onClick={() => setIsPhaseModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <FormInput
                        label="Tên giai đoạn"
                        value={newPhase.phaseName}
                        onChange={(val) =>
                          setNewPhase({ ...newPhase, phaseName: val })
                        }
                        placeholder="VD: Early Bird, Standard, Late..."
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Điều chỉnh giá
                        </label>
                        <div className="flex items-end gap-3">
                          <div className="w-24">
                            <FormInput
                              label=""
                              type="number"
                              min="0"
                              max="100"
                              value={newPhase.percentValue}
                              onChange={(val) =>
                                setNewPhase({
                                  ...newPhase,
                                  percentValue: Number(val),
                                })
                              }
                              placeholder=""
                            />
                          </div>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="percentType"
                                value="increase"
                                checked={newPhase.percentType === "increase"}
                                onChange={() =>
                                  setNewPhase({
                                    ...newPhase,
                                    percentType: "increase",
                                  })
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-red-600 font-medium">
                                Tăng
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="percentType"
                                value="decrease"
                                checked={newPhase.percentType === "decrease"}
                                onChange={() =>
                                  setNewPhase({
                                    ...newPhase,
                                    percentType: "decrease",
                                  })
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-green-600 font-medium">
                                Giảm
                              </span>
                            </label>
                          </div>
                          {newTicket.ticketPrice > 0 &&
                            newPhase.percentValue > 0 && (
                              <div className="text-sm bg-gray-50 p-2 rounded">
                                <strong
                                  className={
                                    newPhase.percentType === "increase"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }
                                >
                                  {(
                                    newTicket.ticketPrice *
                                    (newPhase.percentType === "increase"
                                      ? (100 + newPhase.percentValue) / 100
                                      : (100 - newPhase.percentValue) / 100)
                                  ).toLocaleString()}{" "}
                                  VND
                                </strong>{" "}
                                (
                                {newPhase.percentType === "increase"
                                  ? "+"
                                  : "-"}
                                {newPhase.percentValue}%)
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <FormInput
                            label="Ngày bắt đầu"
                            type="date"
                            value={newPhase.startDate}
                            onChange={(val) =>
                              setNewPhase({ ...newPhase, startDate: val })
                            }
                            min={
                              newTicket.isAuthor
                                ? researchPhases.find((p) => !p.isWaitlist)
                                    ?.registrationStartDate
                                : basicForm.ticketSaleStart
                            }
                            max={
                              newTicket.isAuthor
                                ? researchPhases.find((p) => !p.isWaitlist)
                                    ?.registrationEndDate
                                : basicForm.ticketSaleEnd
                            }
                          />
                        </div>

                        <FormInput
                          label="Số ngày"
                          type="number"
                          min="1"
                          value={newPhase.durationInDays}
                          onChange={(val) =>
                            setNewPhase({
                              ...newPhase,
                              durationInDays: Number(val),
                            })
                          }
                        />

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ngày kết thúc
                          </label>
                          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                            {newPhase.startDate &&
                            newPhase.durationInDays > 0 ? (
                              <span className="text-gray-900">
                                {formatDate(
                                  calculatePhaseEndDate(
                                    newPhase.startDate,
                                    newPhase.durationInDays,
                                  ),
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-400">--/--/----</span>
                            )}
                          </div>
                        </div>

                        <FormInput
                          label="Số lượng vé"
                          type="number"
                          value={newPhase.totalslot}
                          onChange={(val) =>
                            setNewPhase({ ...newPhase, totalslot: Number(val) })
                          }
                          placeholder={`Tối đa: ${newTicket.totalSlot - newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0)}`}
                        />
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => setIsPhaseModalOpen(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleAddPhaseToNewTicket}
                          className="flex-1"
                        >
                          Thêm giai đoạn
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button className="mt-4 w-full" onClick={handleAddTicket}>
              Thêm vé
            </Button>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => dispatch(prevStep())}
              variant="outline"
              className="flex-1"
            >
              ← Quay lại
            </Button>

            <Button
              onClick={handleResearchDetailSubmit}
              disabled={isSubmitting || completedSteps.includes(2)}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting
                ? "Đang lưu..."
                : completedSteps.includes(2)
                  ? "Đã lưu"
                  : "Lưu và tiếp tục"}
            </Button>

            {completedSteps.includes(4) && (
              <Button
                onClick={() => dispatch(nextStep())}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                Tiếp tục →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: SESSIONS */}
      {currentStep === 5 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            5. Phiên họp (Tùy chọn)
          </h3>

          {/* Danh sách sessions hiện có */}
          <div className="space-y-2 mb-4">
            {sessions.length === 0 ? (
              <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
                Chưa có phiên họp nào. Bạn có thể bỏ qua hoặc thêm phiên họp mới
                bên dưới.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessions.map((s, idx) => {
                  const room = roomsData?.data.find(
                    (r: RoomInfoResponse) => r.roomId === s.roomId,
                  );

                  return (
                    <div
                      key={idx}
                      className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">
                          {s.title}
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          {formatTimeDate(s.startTime)} -{" "}
                          {formatTimeDate(s.endTime)}
                        </div>

                        {room && (
                          <div className="text-xs text-gray-500 mt-1">
                            Phòng:{" "}
                            <span className="font-medium">{room.number}</span> -{" "}
                            {room.displayName}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewSession(s);
                            setSessions(sessions.filter((_, i) => i !== idx));
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setSessions(sessions.filter((_, i) => i !== idx))
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form thêm phiên họp mới */}
          <div className="border p-4 rounded space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              Thêm phiên họp mới
              {basicForm.startDate && basicForm.endDate && (
                <span className="text-sm text-green-600">
                  ({formatDate(basicForm.startDate)} →{" "}
                  {formatDate(basicForm.endDate)})
                </span>
              )}
            </h4>

            <FormInput
              label="Tiêu đề"
              value={newSession.title}
              onChange={(val) => setNewSession({ ...newSession, title: val })}
              required
            />

            <FormTextArea
              label="Mô tả"
              value={newSession.description || ""}
              onChange={(val) =>
                setNewSession({ ...newSession, description: val })
              }
              rows={2}
            />

            <div className="grid grid-cols-3 gap-3">
              {/* Ngày */}
              <div>
                <FormInput
                  label="Ngày"
                  type="date"
                  value={newSession.date}
                  onChange={(val) =>
                    setNewSession({ ...newSession, date: val })
                  }
                  min={basicForm.startDate || undefined}
                  max={basicForm.endDate || undefined}
                  required
                />
              </div>

              {/* Thời gian bắt đầu */}
              <FormInput
                label="Thời gian bắt đầu"
                type="time"
                value={
                  newSession.startTime
                    ? newSession.startTime.split("T")[1]?.slice(0, 5)
                    : ""
                }
                onChange={(val) => {
                  if (newSession.date) {
                    const datetime = `${newSession.date}T${val}:00`;
                    setNewSession({ ...newSession, startTime: datetime });
                  } else {
                    toast.error("Vui lòng chọn ngày trước!");
                  }
                }}
                required
                disabled={!newSession.date}
              />

              {/* Thời lượng */}
              <FormInput
                label="Thời lượng (giờ)"
                type="number"
                min="0.5"
                step="0.5"
                value={newSession.timeRange}
                onChange={(val) =>
                  setNewSession({ ...newSession, timeRange: Number(val) })
                }
                placeholder="VD: 2 giờ"
                required
              />
            </div>

            {/* Preview thời gian */}
            {newSession.startTime && newSession.endTime && (
              <div className="bg-blue-50 p-3 rounded space-y-1">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Bắt đầu:</span>{" "}
                  {formatTimeDate(newSession.startTime)}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Kết thúc:</span>{" "}
                  {formatTimeDate(newSession.endTime)}
                </div>
              </div>
            )}

            <FormSelect
              label="Phòng"
              value={newSession.roomId}
              onChange={(val) => setNewSession({ ...newSession, roomId: val })}
              options={roomOptions}
              required
              disabled={isRoomsLoading}
            />

            <Button onClick={handleAddSession} className="w-full mt-4">
              Thêm phiên họp
            </Button>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => dispatch(prevStep())}
              variant="outline"
              className="flex-1"
            >
              ← Quay lại
            </Button>

            <Button
              onClick={handleResearchDetailSubmit}
              disabled={isSubmitting || completedSteps.includes(2)}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting
                ? "Đang lưu..."
                : completedSteps.includes(5)
                  ? "Đã lưu"
                  : "Lưu và tiếp tục"}
            </Button>

            {completedSteps.includes(5) && (
              <Button
                onClick={() => dispatch(nextStep())}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                Tiếp tục →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: POLICIES - TODO: Copy from Conference */}

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">5. Chính sách (Tùy chọn)</h3>

        {/* Phần A: Chính sách chung */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">
            A. Chính sách chung (Tùy chọn)
          </h4>

          <div className="space-y-2 mb-4">
            {policies.length === 0 ? (
              <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center">
                Chưa có chính sách nào. Bạn có thể bỏ qua hoặc thêm chính sách
                mới bên dưới.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {policies.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-gray-300 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {p.policyName}
                      </div>
                      {p.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {p.description}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewPolicy(p);
                          setPolicies(policies.filter((_, i) => i !== idx));
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setPolicies(policies.filter((_, i) => i !== idx))
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border p-4 rounded space-y-3">
            <h5 className="font-medium">Thêm chính sách chung</h5>
            <FormInput
              label="Tên chính sách"
              value={newPolicy.policyName}
              onChange={(val) =>
                setNewPolicy({ ...newPolicy, policyName: val })
              }
            />
            <FormTextArea
              label="Mô tả"
              value={newPolicy.description || ""}
              onChange={(val) =>
                setNewPolicy({ ...newPolicy, description: val })
              }
              rows={3}
            />
            <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
          </div>
        </div>

        {/* Phần 4.2: Chính sách hoàn tiền */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            B. Chính sách hoàn tiền (Tùy chọn)
            {basicForm.startDate && (
              <span className="text-sm text-blue-600">
                (Trước ngày {formatDate(basicForm.startDate)})
              </span>
            )}
          </h4>

          <div className="space-y-2 mb-4">
            {refundPolicies.length === 0 ? (
              <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center">
                Chưa có chính sách hoàn tiền nào. Bạn có thể bỏ qua hoặc thêm
                mới bên dưới.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                {refundPolicies
                  .sort((a, b) => a.refundOrder - b.refundOrder)
                  .map((rp, idx) => (
                    <div
                      key={idx}
                      className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-black px-2 py-0.5 rounded text-xs font-semibold">
                            #{rp.refundOrder}
                          </span>
                          <span className="text-blue-700 font-semibold">
                            Hoàn trả {rp.percentRefund}%
                          </span>
                        </div>

                        <div className="text-sm text-gray-700">
                          Trước ngày:{" "}
                          <strong>{formatDate(rp.refundDeadline)}</strong>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewRefundPolicy(rp);
                            setRefundPolicies(
                              refundPolicies.filter((_, i) => i !== idx),
                            );
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setRefundPolicies(
                              refundPolicies.filter((_, i) => i !== idx),
                            );
                            toast.success("Đã xóa chính sách hoàn tiền!");
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="border p-4 rounded space-y-3 bg-gray-50">
            <h5 className="font-medium">Thêm chính sách hoàn tiền mới</h5>

            {basicForm.ticketSaleStart && basicForm.ticketSaleEnd && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <strong className="text-blue-900">
                    Khoảng thời gian hợp lệ:
                  </strong>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-white px-2 py-1 rounded">
                      {formatDate(basicForm.ticketSaleStart)}
                    </span>
                    <span className="text-blue-600">→</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">
                      {formatDate(basicForm.ticketSaleEnd)}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-2 flex items-start gap-1">
                    <span>
                      Hạn hoàn tiền phải nằm <strong>TRONG</strong> khoảng thời
                      gian này (không bằng đầu/cuối)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <FormInput
                label="Thứ tự"
                type="number"
                min="1"
                value={newRefundPolicy.refundOrder}
                onChange={(val) =>
                  setNewRefundPolicy({
                    ...newRefundPolicy,
                    refundOrder: Number(val),
                  })
                }
                placeholder="1, 2, 3..."
              />

              <FormInput
                label="% Hoàn tiền"
                type="number"
                min="1"
                max="100"
                value={newRefundPolicy.percentRefund}
                onChange={(val) =>
                  setNewRefundPolicy({
                    ...newRefundPolicy,
                    percentRefund: Number(val),
                  })
                }
                placeholder="VD: 80"
              />

              <div>
                <FormInput
                  label="Hạn hoàn tiền"
                  type="date"
                  value={newRefundPolicy.refundDeadline}
                  onChange={(val) =>
                    setNewRefundPolicy({
                      ...newRefundPolicy,
                      refundDeadline: val,
                    })
                  }
                  min={
                    basicForm.ticketSaleStart
                      ? new Date(
                          new Date(basicForm.ticketSaleStart).getTime() +
                            86400000,
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  max={
                    basicForm.ticketSaleEnd
                      ? new Date(
                          new Date(basicForm.ticketSaleEnd).getTime() -
                            86400000,
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                />
                {newRefundPolicy.refundDeadline &&
                  basicForm.ticketSaleStart &&
                  basicForm.ticketSaleEnd && (
                    <div className="mt-1 text-xs">
                      {new Date(newRefundPolicy.refundDeadline) <=
                      new Date(basicForm.ticketSaleStart) ? (
                        <span className="text-red-600 flex items-center gap-1">
                          Quá sớm! Phải sau{" "}
                          {formatDate(basicForm.ticketSaleStart)}
                        </span>
                      ) : new Date(newRefundPolicy.refundDeadline) >=
                        new Date(basicForm.ticketSaleEnd) ? (
                        <span className="text-red-600 flex items-center gap-1">
                          Quá muộn! Phải trước{" "}
                          {formatDate(basicForm.ticketSaleEnd)}
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          Hợp lệ
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </div>

            <div className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <span></span> Ví dụ thực tế:
              </div>
              <div className="space-y-1 ml-6">
                <div>
                  • <strong>Thứ tự 1:</strong> Hoàn 80% nếu hủy trước 20/12/2025
                </div>
                <div>
                  • <strong>Thứ tự 2:</strong> Hoàn 50% nếu hủy trước 22/12/2025
                </div>
                <div>
                  • <strong>Thứ tự 3:</strong> Hoàn 20% nếu hủy trước 23/12/2025
                </div>
              </div>
              <div className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded">
                Deadline càng gần ngày đóng bán vé → % hoàn tiền càng thấp
              </div>
            </div>

            <Button onClick={handleAddRefundPolicy} className="w-full">
              Thêm chính sách hoàn tiền
            </Button>
          </div>
        </div>
      </div>

      {/* STEP 7: MATERIALS & RANKINGS */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          6. Tài liệu & Xếp hạng (Tùy chọn)
        </h3>

        {/* Research Materials */}
        <div className="border p-4 rounded mb-4">
          <h4 className="font-medium mb-3">
            📚 Tài liệu nghiên cứu ({researchMaterials.length})
          </h4>

          {researchMaterials.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {researchMaterials.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div
                    className="font-medium text-sm truncate"
                    title={m.fileName}
                  >
                    {m.fileName}
                  </div>
                  {m.fileDescription && (
                    <div className="text-xs text-gray-600 mt-1">
                      {m.fileDescription}
                    </div>
                  )}
                  {m.file && (
                    <div className="text-xs text-blue-600 mt-1">
                      📎{" "}
                      {m.file instanceof File ? m.file.name : "File attached"}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setResearchMaterials(
                        researchMaterials.filter((_, i) => i !== idx),
                      )
                    }
                    className="w-full mt-2"
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t pt-3">
            <h5 className="font-medium">Thêm tài liệu</h5>
            <FormInput
              label="Tên file"
              name="fileName"
              value={newMaterial.fileName}
              onChange={(val) =>
                setNewMaterial({ ...newMaterial, fileName: val })
              }
              required
              placeholder="VD: Template bài báo, Hướng dẫn..."
            />
            <FormTextArea
              label="Mô tả"
              name="fileDescription"
              value={newMaterial.fileDescription || ""}
              onChange={(val) =>
                setNewMaterial({ ...newMaterial, fileDescription: val })
              }
              rows={2}
              placeholder="Mô tả ngắn gọn về file..."
            />
            <div>
              <label className="block text-sm font-medium mb-2">File *</label>
              <input
                type="file"
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <Button onClick={handleAddMaterial}>Thêm tài liệu</Button>
          </div>
        </div>

        {/* Ranking Files */}
        <div className="border p-4 rounded mb-4">
          <h4 className="font-medium mb-3">
            🏆 File xếp hạng ({rankingFiles.length})
          </h4>

          {rankingFiles.length > 0 && (
            <div className="space-y-2 mb-4">
              {rankingFiles.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded flex justify-between items-center"
                >
                  <div className="text-sm break-all">
                    {rf.fileUrl ||
                      (rf.file instanceof File
                        ? rf.file.name
                        : "File uploaded")}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setRankingFiles(rankingFiles.filter((_, i) => i !== idx))
                    }
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t pt-3">
            <h5 className="font-medium">Thêm file xếp hạng</h5>
            <FormInput
              label="URL file (tùy chọn)"
              value={newRankingFile.fileUrl || ""}
              onChange={(val) =>
                setNewRankingFile({ ...newRankingFile, fileUrl: val })
              }
              placeholder="https://..."
            />
            <div>
              <label className="block text-sm font-medium mb-2">
                Hoặc upload file
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setNewRankingFile({
                    ...newRankingFile,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <Button onClick={handleAddRankingFile}>Thêm file</Button>
          </div>
        </div>

        {/* Ranking References */}
        <div className="border p-4 rounded">
          <h4 className="font-medium mb-3">
            🔗 Tham khảo xếp hạng ({rankingReferences.length})
          </h4>

          {rankingReferences.length > 0 && (
            <div className="space-y-2 mb-4">
              {rankingReferences.map((rr, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded flex justify-between items-center"
                >
                  <a
                    href={rr.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {rr.referenceUrl}
                  </a>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setRankingReferences(
                        rankingReferences.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t pt-3">
            <h5 className="font-medium">Thêm URL tham khảo</h5>
            <FormInput
              label="URL"
              value={newRankingReference.referenceUrl}
              onChange={(val) => setNewRankingReference({ referenceUrl: val })}
              placeholder="https://ranking-website.com/..."
              required
            />
            <Button onClick={handleAddRankingReference}>Thêm URL</Button>
          </div>
        </div>
      </div>

      {/* STEP 8: MEDIA */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">7. Media (Tùy chọn)</h3>

        {mediaList.length === 0 ? (
          <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center mb-8">
            Chưa có media nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {mediaList.map((m, idx) => (
              <div
                key={idx}
                className="relative bg-white border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
              >
                {m.mediaFile && (
                  <>
                    {m.mediaFile instanceof File ? (
                      <img
                        src={URL.createObjectURL(m.mediaFile)}
                        alt="Media Preview"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    ) : typeof m.mediaFile === "string" &&
                      (m.mediaFile as string).length > 0 ? (
                      <img
                        src={m.mediaFile}
                        alt="Media"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    ) : null}
                  </>
                )}

                <div className="text-sm text-gray-700 truncate w-full">
                  {m.mediaFile instanceof File
                    ? m.mediaFile.name
                    : typeof m.mediaFile === "string"
                      ? "Ảnh/Video hiện tại"
                      : "No file"}
                </div>

                <button
                  onClick={() =>
                    setMediaList(mediaList.filter((_, i) => i !== idx))
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border border-gray-200 p-4 rounded-xl space-y-4">
          <h4 className="font-medium text-gray-800">Thêm media</h4>
          <ImageUpload
            label="Upload media (ảnh hoặc video)"
            subtext="(4MB max)"
            isList={false}
            onChange={(file) =>
              setNewMedia({ ...newMedia, mediaFile: file as File | null })
            }
          />
          <Button onClick={handleAddMedia}>Thêm media</Button>
        </div>
      </div>

      {/* STEP 9: SPONSORS - TODO: Copy from Conference */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          8. Nhà tài trợ (Tùy chọn)
        </h3>

        {/* Hiển thị danh sách nhà tài trợ */}
        {sponsors.length === 0 ? (
          <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
            Chưa có nhà tài trợ nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {sponsors.map((s, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
              >
                {s.imageFile instanceof File ? (
                  <img
                    src={URL.createObjectURL(s.imageFile)}
                    alt="Sponsor Preview"
                    className="h-20 w-20 object-cover rounded-full border border-gray-300 mb-2"
                  />
                ) : typeof s.imageFile === "string" && s.imageFile ? (
                  <img
                    src={s.imageFile}
                    alt={s.name}
                    className="h-20 w-20 object-cover rounded-full border border-gray-300 mb-2"
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-full text-gray-400">
                    No Image
                  </div>
                )}

                <div className="font-medium text-gray-800">{s.name}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {s.imageFile instanceof File
                    ? s.imageFile.name
                    : typeof s.imageFile === "string"
                      ? "Logo hiện tại"
                      : ""}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewSponsor(s);
                      setSponsors(sponsors.filter((_, i) => i !== idx));
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setSponsors(sponsors.filter((_, i) => i !== idx))
                    }
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form thêm mới */}
        <div className="border p-4 rounded space-y-4">
          <h4 className="font-medium">Thêm nhà tài trợ</h4>
          <FormInput
            label="Tên nhà tài trợ"
            value={newSponsor.name}
            onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
          />
          <ImageUpload
            isList={false}
            height="h-32"
            onChange={(file) =>
              setNewSponsor({ ...newSponsor, imageFile: file as File | null })
            }
            resetTrigger={resetSponsorUpload}
          />

          <Button
            onClick={() => {
              handleAddSponsor();
              setResetSponsorUpload(true);
              setTimeout(() => setResetSponsorUpload(false), 200);
            }}
          >
            Thêm nhà tài trợ
          </Button>
        </div>
      </div>

      {/* FINAL SUBMIT BUTTON */}
      <div className="bg-white border rounded-lg p-6">
        <Button
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white hover:bg-green-700 h-12 text-lg font-semibold"
        >
          {isSubmitting ? "Đang tạo hội thảo nghiên cứu..." : "Hoàn tất"}
        </Button>
      </div>
    </div>
  );
}

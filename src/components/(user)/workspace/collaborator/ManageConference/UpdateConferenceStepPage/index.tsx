"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import {
  useCreateConferencePriceMutation,
  useCreateConferenceSessionsMutation,
  useCreateConferencePoliciesMutation,
  useCreateRefundPoliciesMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useUpdateBasicConferenceMutation,
  useUpdateConferencePriceMutation,
  useUpdateConferencePricePhaseMutation,
  useUpdateConferenceSessionMutation,
  useUpdateSessionSpeakerMutation,
  useUpdateConferencePolicyMutation,
  useUpdateConferenceRefundPolicyMutation,
  useUpdateConferenceMediaMutation,
  useUpdateConferenceSponsorMutation,

  useDeleteConferencePriceMutation,
  useDeleteConferenceSessionMutation,
  useDeleteConferencePolicyMutation,
  useDeleteConferenceMediaMutation,
  useDeleteConferenceSponsorMutation,
} from "@/redux/services/conferenceStep.service";

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  setMode,
  loadExistingConference,
  goToStep,
  markStepCompleted,
  resetWizard,
  setConferenceId,
  setConferenceBasicData,
} from "@/redux/slices/conferenceStep.slice";
import type { ApiError } from "@/types/api.type";

import type {
  ConferenceBasicForm,
  Phase,
  Ticket,
  Session,
  Speaker,
  Policy,
  RefundPolicy,
  Media,
  Sponsor,
  RoomInfoResponse,
} from "@/types/conference.type";
import { toast } from "sonner";

import { formatDate, formatCurrency, formatTimeDate } from "@/helper/format";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { ImageUpload } from "@/components/atoms/ImageUpload";

const TARGET_OPTIONS = [
  { value: "Học sinh", label: "Học sinh" },
  { value: "Sinh viên", label: "Sinh viên" },
  { value: "Chuyên gia", label: "Chuyên gia" },
  { value: "Nhà đầu tư", label: "Nhà đầu tư" },
  { value: "Khác", label: "Khác" },
];

export default function UpdateConferenceStepPage() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(
    (state) => state.conferenceStep.currentStep,
  );
  const completedSteps = useAppSelector(
    (state) => state.conferenceStep.completedSteps,
  );
  const mode = useAppSelector((state) => state.conferenceStep.mode);
  const { data: conferenceDetail, isLoading: isLoadingDetail } =
    useGetTechnicalConferenceDetailInternalQuery(conferenceId, {
      skip: !conferenceId,
    });
  const [resetSponsorUpload, setResetSponsorUpload] = useState(false);

  const [createPrice] = useCreateConferencePriceMutation();
  const [createSessions] = useCreateConferenceSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createRefundPolicies] = useCreateRefundPoliciesMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  const [updateBasic] = useUpdateBasicConferenceMutation();
  const [updatePrice] = useUpdateConferencePriceMutation();
  const [updatePricePhase] = useUpdateConferencePricePhaseMutation();
  const [updateSession] = useUpdateConferenceSessionMutation();
  const [updateSessionSpeaker] = useUpdateSessionSpeakerMutation();
  const [updatePolicy] = useUpdateConferencePolicyMutation();
  const [updateRefundPolicy] = useUpdateConferenceRefundPolicyMutation();
  const [updateMedia] = useUpdateConferenceMediaMutation();
  const [updateSponsor] = useUpdateConferenceSponsorMutation();

  const [deletePrice] = useDeleteConferencePriceMutation();
  const [deleteSession] = useDeleteConferenceSessionMutation();
  const [deletePolicy] = useDeleteConferencePolicyMutation();
  const [deleteMedia] = useDeleteConferenceMediaMutation();
  const [deleteSponsor] = useDeleteConferenceSponsorMutation();

  const [deletedTicketIds, setDeletedTicketIds] = useState<string[]>([]);
  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);
  const [deletedPolicyIds, setDeletedPolicyIds] = useState<string[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [deletedSponsorIds, setDeletedSponsorIds] = useState<string[]>([]);

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } =
    useGetAllCitiesQuery();

  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(
    null,
  );
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(
    null,
  );
  const [existingMediaUrls, setExistingMediaUrls] = useState<
    { mediaId: string; url: string }[]
  >([]);
  const [existingSponsorUrls, setExistingSponsorUrls] = useState<
    {
      sponsorId: string;
      name: string;
      imageUrl: string;
    }[]
  >([]);
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

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basicFormCompleted, setBasicFormCompleted] = useState(false);

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
    isInternalHosted: false,
    isResearchConference: false,
    conferenceCategoryId: "",
    cityId: "",
    ticketSaleStart: "",
    ticketSaleEnd: "",
    ticketSaleDuration: 0,
    createdby: "",
    targetAudienceTechnicalConference: "",
  });

  useEffect(() => {
    if (conferenceDetail?.data) {
      const conf = conferenceDetail.data;

      // Step 1: Basic Info
      setBasicForm({
        conferenceName: conf.conferenceName || "",
        description: conf.description || "",
        startDate: conf.startDate?.split("T")[0] || "",
        endDate: conf.endDate?.split("T")[0] || "",
        dateRange: calculateDateRange(conf.startDate || "", conf.endDate || ""),
        totalSlot: conf.totalSlot || 0,
        address: conf.address || "",
        bannerImageFile: null,
        isInternalHosted: conf.isInternalHosted || false,
        isResearchConference: conf.isResearchConference || false,
        conferenceCategoryId: conf.conferenceCategoryId || "",
        cityId: conf.cityId || "",
        ticketSaleStart: conf.ticketSaleStart?.split("T")[0] || "",
        ticketSaleEnd: conf.ticketSaleEnd?.split("T")[0] || "",
        ticketSaleDuration: calculateDateRange(
          conf.ticketSaleStart || "",
          conf.ticketSaleEnd || "",
        ),
        createdby: "",
        targetAudienceTechnicalConference: conf.targetAudience || "",
      });
      setBasicFormCompleted(true);
      dispatch(setMode("edit"));
      dispatch(setConferenceId(conferenceId));
      dispatch(setConferenceBasicData(conferenceDetail.data));
      dispatch(
        loadExistingConference({
          id: conferenceId,
          maxStep: 6,
          basicData: conferenceDetail.data,
        }),
      );

      // Step 2: Tickets & Phases
      if (conf.conferencePrices) {
        setTickets(
          conf.conferencePrices.map((t) => ({
            ticketId: t.conferencePriceId || "",
            priceId: t.conferencePriceId || "",
            ticketPrice: t.ticketPrice || 0,
            ticketName: t.ticketName || "",
            ticketDescription: t.ticketDescription || "",
            isAuthor: t.isAuthor || false,
            totalSlot: t.totalSlot || 0,
            phases: (t.pricePhases || []).map((p) => ({
              phaseId: p.pricePhaseId || "",
              phaseName: p.phaseName || "",
              applyPercent: p.applyPercent || 100,
              startDate: p.startDate?.split("T")[0] || "",
              endDate: p.endDate?.split("T")[0] || "",
              totalslot: p.totalSlot || 0,
            })),
          })),
        );
      }

      // Step 3: Sessions
      if (conf.sessions) {
        setSessions(
          conf.sessions.map((s) => ({
            sessionId: s.conferenceSessionId || "",
            title: s.title || "",
            description: s.description || "",
            date: s.sessionDate?.split("T")[0] || "",
            startTime: s.startTime || "",
            endTime: s.endTime || "",
            timeRange: calculateTimeRange(s.startTime || "", s.endTime || ""),
            roomId: s.roomId || "",
            speaker: (s.speakers || []).map((sp) => ({
              speakerId: sp.speakerId || "",
              name: sp.name || "",
              description: sp.description || "",
              image: sp.image || "",
            })),
            sessionMedias: (s.sessionMedia || []).map((m) => ({
              mediaId: m.conferenceSessionMediaId || "",
              mediaFile: m.conferenceSessionMediaUrl || "",
            })),
          })),
        );
      }

      // Step 4: Policies
      if (conf.policies) {
        setPolicies(
          conf.policies.map((p) => ({
            policyId: p.policyId || "",
            policyName: p.policyName || "",
            description: p.description || "",
          })),
        );
      }

      // Step 4.2: Refund Policies
      if (conf.refundPolicies) {
        setRefundPolicies(
          conf.refundPolicies.map((rp) => ({
            refundPolicyId: rp.refundPolicyId || "",
            percentRefund: rp.percentRefund || 0,
            refundDeadline: rp.refundDeadline?.split("T")[0] || "",
            refundOrder: rp.refundOrder || 1,
          })),
        );
      }

      // Step 5: Media
      if (conf.conferenceMedia) {
        setExistingMediaUrls(
          conf.conferenceMedia.map((m) => ({
            mediaId: m.mediaId || "",
            url: m.mediaUrl || "",
          })),
        );
      }

      // Step 6: Sponsors
      if (conf.sponsors) {
        setExistingSponsorUrls(
          conf.sponsors.map((s) => ({
            sponsorId: s.sponsorId || "",
            name: s.name || "",
            imageUrl: s.imageUrl || "",
          })),
        );
      }
    }
  }, [conferenceDetail]);

  const calculateDateRange = (start: string, end: string) => {
    if (!start || !end) return 1;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateTimeRange = (start: string, end: string) => {
    if (!start || !end) return 1;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return diff / (1000 * 60 * 60);
  };

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

  // Step 2: Price
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

  // Step 3: Sessions
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
  const [newSpeaker, setNewSpeaker] = useState<
    Omit<Speaker, "image"> & { image: File | null }
  >({
    name: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    if (
      newSession.startTime &&
      newSession.timeRange &&
      newSession.timeRange > 0
    ) {
      const start = new Date(newSession.startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + Number(newSession.timeRange));

      const formattedEnd = end
        .toLocaleString("sv-SE")
        .replace(" ", "T")
        .slice(0, 16);

      setNewSession((prev) => ({ ...prev, endTime: formattedEnd }));
    }
  }, [newSession.startTime, newSession.timeRange]);

  // Step 4: Policies
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

  // Step 5: Media
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [newMedia, setNewMedia] = useState<Media>({ mediaFile: null });

  // Step 6: Sponsors
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    imageFile: null,
  });

  const handleFinalSubmit = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return;
    }

    setIsSubmitting(true);
    let hasError = false;

    // =============== BASIC ===============
    try {
      await updateBasic({ conferenceId, data: basicForm }).unwrap();
    } catch (error) {
      hasError = true;
      const apiError = error as { data?: ApiError };
      toast.error(apiError?.data?.message || "Cập nhật thông tin cơ bản thất bại");
    }

    // =============== TICKETS (Update) ===============
    if (tickets.some(t => t.priceId)) {
      const updatePromises = tickets
        .filter(t => t.priceId)
        .map(t =>
          updatePrice({
            priceId: t.priceId!,
            data: {
              ticketPrice: parseFloat(t.ticketPrice.toFixed(2)),
              ticketName: t.ticketName,
              ticketDescription: t.ticketDescription,
              totalSlot: t.totalSlot,
            },
          }).unwrap()
        );

      try {
        await Promise.all(updatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật vé thất bại");
      }
    }

    // =============== PHASES (Update) ===============
    const phaseUpdatePromises: Promise<unknown>[] = [];
    tickets
      .filter(t => t.priceId)
      .forEach(t => {
        (t.phases || [])
          .filter(p => p.pricePhaseId)
          .forEach(p => {
            phaseUpdatePromises.push(
              updatePricePhase({
                pricePhaseId: p.pricePhaseId!,
                data: {
                  phaseName: p.phaseName,
                  applyPercent: p.applyPercent,
                  startDate: p.startDate,
                  endDate: p.endDate,
                  totalSlot: p.totalslot,
                },
              }).unwrap()
            );
          });
      });

    if (phaseUpdatePromises.length > 0) {
      try {
        await Promise.all(phaseUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật giai đoạn giá thất bại");
      }
    }

    // =============== SESSIONS (Validation) ===============
    const eventStartDate = basicForm.startDate;
    const eventEndDate = basicForm.endDate;
    if (eventStartDate && eventEndDate) {
      const hasSessionOnStartDay = sessions.some(s => s.date === eventStartDate);
      const hasSessionOnEndDay = sessions.some(s => s.date === eventEndDate);
      if (!hasSessionOnStartDay || !hasSessionOnEndDay) {
        toast.error("Phải có ít nhất 1 phiên họp vào ngày bắt đầu và 1 vào ngày kết thúc hội thảo!");
        setIsSubmitting(false);
        return;
      }
    }

    // =============== SESSIONS (Update) ===============
    if (sessions.some(s => s.sessionId)) {
      const sessionUpdatePromises = sessions
        .filter(s => s.sessionId)
        .map(s =>
          updateSession({
            sessionId: s.sessionId!,
            data: {
              title: s.title,
              description: s.description,
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              roomId: s.roomId,
            },
          }).unwrap()
        );

      try {
        await Promise.all(sessionUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật phiên họp thất bại");
      }
    }

    // =============== SPEAKERS (Update) ===============
    const speakerUpdatePromises: Promise<unknown>[] = [];
    sessions
      .filter(s => s.sessionId)
      .forEach(s => {
        (s.speaker || [])
          .filter(sp => sp.speakerId)
          .forEach(sp => {
            speakerUpdatePromises.push(
              updateSessionSpeaker({
                sessionId: s.sessionId!,
                data: {
                  name: sp.name,
                  description: sp.description,
                  image: sp.image instanceof File ? sp.image : undefined,
                },
              }).unwrap()
            );
          });
      });

    if (speakerUpdatePromises.length > 0) {
      try {
        await Promise.all(speakerUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật diễn giả thất bại");
      }
    }

    // =============== POLICIES (Update) ===============
    if (policies.some(p => p.policyId)) {
      const policyUpdatePromises = policies
        .filter(p => p.policyId)
        .map(p =>
          updatePolicy({
            policyId: p.policyId!,
            data: { policyName: p.policyName, description: p.description },
          }).unwrap()
        );

      try {
        await Promise.all(policyUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật chính sách thất bại");
      }
    }

    // =============== REFUND POLICIES (Update) ===============
    if (refundPolicies.some(rp => rp.refundPolicyId)) {
      const refundUpdatePromises = refundPolicies
        .filter(rp => rp.refundPolicyId)
        .map(rp =>
          updateRefundPolicy({
            refundPolicyId: rp.refundPolicyId!,
            data: {
              percentRefund: rp.percentRefund,
              refundDeadline: rp.refundDeadline,
              refundOrder: rp.refundOrder,
            },
          }).unwrap()
        );

      try {
        await Promise.all(refundUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật chính sách hoàn tiền thất bại");
      }
    }

    // =============== MEDIA (Update) ===============
    if (mediaList.some(m => m.mediaId && m.mediaFile instanceof File)) {
      const mediaUpdatePromises = mediaList
        .filter(m => m.mediaId && m.mediaFile instanceof File)
        .map(m =>
          updateMedia({
            mediaId: m.mediaId!,
            mediaFile: m.mediaFile as File,
          }).unwrap()
        );

      try {
        await Promise.all(mediaUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật media thất bại");
      }
    }

    // =============== SPONSORS (Update) ===============
    if (sponsors.some(s => s.sponsorId && s.imageFile instanceof File)) {
      const sponsorUpdatePromises = sponsors
        .filter(s => s.sponsorId && s.imageFile instanceof File)
        .map(s =>
          updateSponsor({
            sponsorId: s.sponsorId!,
            name: s.name,
            imageFile: s.imageFile as File,
          }).unwrap()
        );

      try {
        await Promise.all(sponsorUpdatePromises);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Cập nhật nhà tài trợ thất bại");
      }
    }

    // =============== CREATE NEW ITEMS ===============
    // Giá vé mới
    const newTickets = tickets.filter(t => !t.priceId);
    if (newTickets.length > 0) {
      try {
        const res = await createPrice({
          conferenceId,
          data: {
            typeOfTicket: newTickets.map(t => ({
              ticketPrice: parseFloat(t.ticketPrice.toFixed(2)),
              ticketName: t.ticketName,
              ticketDescription: t.ticketDescription,
              isAuthor: t.isAuthor ?? false,
              totalSlot: t.totalSlot,
              phases: (t.phases || []).map(p => ({
                phaseName: p.phaseName,
                applyPercent: p.applyPercent,
                startDate: p.startDate,
                endDate: p.endDate,
                totalslot: p.totalslot,
              })),
            })),
          },
        }).unwrap();
        // TODO: Nếu backend trả về ID, nên cập nhật local state để tránh duplicate
        // setTickets([...]);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Tạo vé mới thất bại");
      }
    }

    // Phiên họp mới
    const newSessions = sessions.filter(s => !s.sessionId);
    if (newSessions.length > 0) {
      try {
        await createSessions({
          conferenceId,
          data: {
            sessions: newSessions.map(s => ({
              title: s.title,
              description: s.description,
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              roomId: s.roomId,
              speaker: s.speaker.map(sp => ({
                name: sp.name,
                description: sp.description,
                image: sp.image instanceof File ? sp.image : undefined,
                imageUrl: typeof sp.image === "string" ? sp.image : undefined,
              })),
              sessionMedias: (s.sessionMedias || []).map(m => ({
                mediaFile: m.mediaFile instanceof File ? m.mediaFile : undefined,
                mediaUrl: typeof m.mediaFile === "string" ? m.mediaFile : undefined,
              })),
            })),
          },
        }).unwrap();
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Tạo phiên họp mới thất bại");
      }
    }

    // Chính sách mới
    const newPolicies = policies.filter(p => !p.policyId);
    if (newPolicies.length > 0) {
      try {
        await createPolicies({ conferenceId, data: { policies: newPolicies } }).unwrap();
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Tạo chính sách mới thất bại");
      }
    }

    // Chính sách hoàn tiền mới
    const newRefundPolicies = refundPolicies.filter(rp => !rp.refundPolicyId);
    if (newRefundPolicies.length > 0) {
      try {
        await createRefundPolicies({
          conferenceId,
          data: { refundPolicies: newRefundPolicies },
        }).unwrap();
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Tạo chính sách hoàn tiền mới thất bại");
      }
    }

    // Media mới
    const newMediaItems = mediaList.filter(m => !m.mediaId);
    if (newMediaItems.length > 0) {
      try {
        await createMedia({ conferenceId, data: { media: newMediaItems } }).unwrap();
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Tải lên media mới thất bại");
      }
    }

    // Nhà tài trợ mới
    const newSponsors = sponsors.filter(s => !s.sponsorId);
    if (newSponsors.length > 0) {
      try {
        await createSponsors({ conferenceId, data: { sponsors: newSponsors } }).unwrap();
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Thêm nhà tài trợ mới thất bại");
      }
    }

    const deletePromises: Promise<unknown>[] = [];

    // Delete tickets
    for (const id of deletedTicketIds) {
      deletePromises.push(deletePrice(id).unwrap());
    }

    // Delete sessions
    for (const id of deletedSessionIds) {
      deletePromises.push(deleteSession(id).unwrap());
    }

    // Delete policies
    for (const id of deletedPolicyIds) {
      deletePromises.push(deletePolicy(id).unwrap());
    }

    // Delete media
    for (const id of deletedMediaIds) {
      deletePromises.push(deleteMedia(id).unwrap());
    }

    // Delete sponsors
    for (const id of deletedSponsorIds) {
      deletePromises.push(deleteSponsor(id).unwrap());
    }

    if (deletePromises.length > 0) {
      try {
        await Promise.all(deletePromises);
        // Reset deleted lists
        setDeletedTicketIds([]);
        setDeletedSessionIds([]);
        setDeletedPolicyIds([]);
        setDeletedMediaIds([]);
        setDeletedSponsorIds([]);
      } catch (error) {
        hasError = true;
        const apiError = error as { data?: ApiError };
        toast.error(apiError?.data?.message || "Xóa dữ liệu thất bại");
      }
    }

    setIsSubmitting(false);
    if (!hasError) {
      toast.success("Cập nhật hội thảo thành công!");
      router.push(`/workspace/collaborator/manage-conference`);
    } else {
      toast.warning("Một số phần chưa lưu được. Vui lòng kiểm tra lại.");
    }
  };

  const handleEditTicket = (ticket: Ticket, index: number) => {
    setNewTicket({
      ticketPrice: ticket.ticketPrice,
      ticketName: ticket.ticketName,
      ticketDescription: ticket.ticketDescription,
      isAuthor: ticket.isAuthor ?? false,
      totalSlot: ticket.totalSlot,
      phases: ticket.phases || [],
    });
    setEditingTicketIndex(index);

    setTimeout(() => {
      document
        .getElementById("ticket-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAddOrUpdateTicket = () => {
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

    if (newTicket.phases.length > 0) {
      const totalPhaseSlots = newTicket.phases.reduce(
        (sum, p) => sum + p.totalslot,
        0,
      );
      if (totalPhaseSlots !== newTicket.totalSlot) {
        toast.error(
          `Tổng slot các giai đoạn (${totalPhaseSlots}) phải bằng tổng slot vé (${newTicket.totalSlot})!`,
        );
        return;
      }
    }

    if (editingTicketIndex !== null) {
      // Update existing ticket
      const updatedTickets = [...tickets];
      updatedTickets[editingTicketIndex] = {
        ...tickets[editingTicketIndex],
        ...newTicket,
      };
      setTickets(updatedTickets);
      toast.success("Đã cập nhật vé!");
    } else {
      // Add new ticket
      setTickets([...tickets, { ...newTicket, isAuthor: false }]);
      toast.success("Đã thêm vé!");
    }

    // Reset form
    setNewTicket({
      ticketPrice: 0,
      ticketName: "",
      ticketDescription: "",
      isAuthor: false,
      totalSlot: 0,
      phases: [],
    });
    setEditingTicketIndex(null);
  };

  // Hàm hủy edit
  const handleCancelEdit = () => {
    setNewTicket({
      ticketPrice: 0,
      ticketName: "",
      ticketDescription: "",
      isAuthor: false,
      totalSlot: 0,
      phases: [],
    });
    setEditingTicketIndex(null);
    toast.info("Đã hủy chỉnh sửa");
  };

  //--

  // Hàm edit phase
  const handleEditPhase = (phase: Phase, index: number) => {
    const isIncrease = phase.applyPercent > 100;
    const percentValue = isIncrease
      ? phase.applyPercent - 100
      : 100 - phase.applyPercent;

    // Tính số ngày từ startDate và endDate
    const start = new Date(phase.startDate);
    const end = new Date(phase.endDate);
    const durationInDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setNewPhase({
      phaseName: phase.phaseName,
      percentValue: percentValue,
      percentType: isIncrease ? "increase" : "decrease",
      startDate: phase.startDate,
      durationInDays: durationInDays,
      totalslot: phase.totalslot,
    });

    setEditingPhaseIndex(index);
    toast.info("Đang chỉnh sửa giai đoạn");
  };

  // Hàm hủy edit phase
  const handleCancelPhaseEdit = () => {
    setNewPhase({
      phaseName: "",
      percentValue: 0,
      percentType: "increase",
      startDate: "",
      durationInDays: 1,
      totalslot: 0,
    });
    setEditingPhaseIndex(null);
    toast.info("Đã hủy chỉnh sửa giai đoạn");
  };

  const handleAddOrUpdatePhase = () => {
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

    if (!basicForm.ticketSaleStart || !basicForm.ticketSaleEnd) {
      toast.error("Không tìm thấy thông tin thời gian bán vé!");
      return;
    }

    const saleStart = new Date(basicForm.ticketSaleStart);
    const saleEnd = new Date(basicForm.ticketSaleEnd);
    const phaseStart = new Date(startDate);

    // Tính endDate của phase
    const phaseEnd = new Date(phaseStart);
    phaseEnd.setDate(phaseStart.getDate() + durationInDays - 1);

    if (phaseStart < saleStart || phaseStart > saleEnd) {
      toast.error(
        `Ngày bắt đầu giai đoạn phải trong khoảng ${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")}!`,
      );
      return;
    }

    if (phaseEnd > saleEnd) {
      toast.error(
        `Ngày kết thúc giai đoạn (${phaseEnd.toLocaleDateString("vi-VN")}) vượt quá thời gian bán vé!`,
      );
      return;
    }

    // Check tổng slot (nếu không đang edit hoặc đang edit nhưng slot thay đổi)
    const currentPhasesTotal = newTicket.phases
      .filter((_, idx) => idx !== editingPhaseIndex)
      .reduce((sum, p) => sum + p.totalslot, 0);

    if (currentPhasesTotal + totalslot > newTicket.totalSlot) {
      toast.error(
        `Tổng slot các giai đoạn (${currentPhasesTotal + totalslot}) vượt quá tổng slot vé (${newTicket.totalSlot})!`,
      );
      return;
    }

    const hasOverlap = newTicket.phases
      .filter((_, idx) => idx !== editingPhaseIndex)
      .some((p) => {
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

    if (editingPhaseIndex !== null) {
      // UPDATE existing phase
      const updatedPhases = [...newTicket.phases];
      updatedPhases[editingPhaseIndex] = {
        ...updatedPhases[editingPhaseIndex],
        ...phase,
      };
      setNewTicket((prev) => ({
        ...prev,
        phases: updatedPhases,
      }));
      toast.success("Đã cập nhật giai đoạn!");
    } else {
      // ADD new phase
      setNewTicket((prev) => ({
        ...prev,
        phases: [...prev.phases, phase],
      }));
      toast.success("Đã thêm giai đoạn!");
    }

    // Reset form
    setNewPhase({
      phaseName: "",
      percentValue: 0,
      percentType: "increase",
      startDate: "",
      durationInDays: 1,
      totalslot: 0,
    });
    setEditingPhaseIndex(null);
  };

  // Cập nhật hàm handleRemovePhaseFromTicket
  const handleRemovePhaseFromTicket = (phaseIndex: number) => {
    if (editingPhaseIndex === phaseIndex) {
      handleCancelPhaseEdit();
    }
    setNewTicket((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, idx) => idx !== phaseIndex),
    }));
    toast.success("Đã xóa giai đoạn!");
  };

  const handleAddSession = () => {
    if (!newSession.title || newSession.speaker.length === 0) {
      toast.error("Vui lòng nhập tiêu đề và ít nhất 1 diễn giả!");
      return;
    }

    if (!newSession.date || !newSession.startTime || !newSession.endTime) {
      toast.error("Vui lòng nhập đầy đủ ngày và thời gian!");
      return;
    }

    if (!basicForm.startDate || !basicForm.endDate) {
      toast.error("Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc hội thảo!");
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

    setSessions([...sessions, newSession]);
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

    if (!basicForm.startDate) {
      toast.error("Không tìm thấy thông tin thời gian sự kiện!");
      return;
    }

    const deadline = new Date(newRefundPolicy.refundDeadline);
    const eventStart = new Date(basicForm.startDate);

    if (deadline >= eventStart) {
      toast.error("Hạn hoàn tiền phải trước ngày bắt đầu sự kiện!");
      return;
    }

    // Check trùng thứ tự
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
    if (!newSponsor.name || !newSponsor.imageFile) return;
    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", imageFile: null });
  };

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
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cập nhật hội thảo</h1>
        <p className="text-gray-600 mt-1">Chỉnh sửa thông tin hội thảo</p>
        {mode === "edit" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {[1, 2, 3, 4, 5, 6].map((step) => {
                const isCompleted = completedSteps.includes(step);
                const isCurrent = currentStep === step;
                const isAccessible =
                  mode === "edit" ? true : isCompleted || step <= currentStep;
                return (
                  <div
                    key={step}
                    className="flex items-center flex-1 last:flex-none"
                  >
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
                    {step < 6 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${currentStep === 1 ? "font-semibold text-blue-600" : "text-gray-500"}`}
                style={{ width: "40px", textAlign: "center" }}
              >
                Thông tin
              </span>
              <span
                className={`text-sm ${currentStep === 2 ? "font-semibold text-blue-600" : "text-gray-500"}`}
                style={{ width: "40px", textAlign: "center" }}
              >
                Giá vé
              </span>
              <span
                className={`text-sm ${currentStep === 3 ? "font-semibold text-blue-600" : "text-gray-500"}`}
                style={{ width: "40px", textAlign: "center" }}
              >
                Phiên họp
              </span>
              <span
                className={`text-sm ${currentStep === 4 ? "font-semibold text-blue-600" : "text-gray-500"}`}
                style={{ width: "40px", textAlign: "center" }}
              >
                Chính sách
              </span>
              <span
                className={`text-sm ${currentStep === 5 ? "font-semibold text-blue-600" : "text-gray-500"}`}
                style={{ width: "40px", textAlign: "center" }}
              >
                Media
              </span>
              <span
                className={`text-sm ${currentStep === 6 ? "font-semibold text-blue-600" : "text-gray-500"}`}
                style={{ width: "40px", textAlign: "center" }}
              >
                Tài trợ
              </span>
            </div>
          </div>
        )}
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

      {/* STEP 1: BASIC INFO - Always visible */}

      {currentStep === 1 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">1. Thông tin cơ bản</h3>
            {completedSteps.includes(1) && (
              <span className="text-sm text-green-600 font-medium">
                Đã hoàn thành
              </span>
            )}
          </div>

          <div className="space-y-4">
            <FormInput
              label="Tên hội thảo"
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

            <p className="text-xs text-gray-500 mt-1">
              Thời gian bán vé phải trước ngày bắt đầu sự kiện
            </p>

            {/* Sức chứa + Danh mục */}
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
                disabled={isCategoriesLoading || basicFormCompleted}
              />
            </div>

            {/* Địa chỉ + Thành phố */}
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
                disabled={isCitiesLoading || basicFormCompleted}
              />
            </div>

            {/* Đối tượng mục tiêu - 1/2 width */}
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Đối tượng mục tiêu"
                value={basicForm.targetAudienceTechnicalConference}
                onChange={(val) =>
                  setBasicForm({
                    ...basicForm,
                    targetAudienceTechnicalConference: val,
                  })
                }
                options={TARGET_OPTIONS}
                disabled={basicFormCompleted}
              />
              {basicForm.targetAudienceTechnicalConference === "Khác" && (
                <FormInput
                  label="Nhập đối tượng khác"
                  value={basicForm.customTarget || "Khác"}
                  onChange={(val) =>
                    setBasicForm({ ...basicForm, customTarget: val })
                  }
                  disabled={basicFormCompleted}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Banner Image
              </label>

              {/* Hiển thị ảnh hiện tại hoặc preview */}
              {(basicForm.bannerImageFile ||
                conferenceDetail?.data?.bannerImageUrl) && (
                  <div className="relative inline-block mt-2">
                    <img
                      src={
                        basicForm.bannerImageFile
                          ? URL.createObjectURL(basicForm.bannerImageFile)
                          : conferenceDetail?.data?.bannerImageUrl
                      }
                      alt="Preview"
                      className="h-32 object-cover rounded border"
                    />
                    {!basicFormCompleted && (
                      <button
                        type="button"
                        onClick={() =>
                          setBasicForm({ ...basicForm, bannerImageFile: null })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

              {!basicFormCompleted && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBasicForm({
                      ...basicForm,
                      bannerImageFile: e.target.files?.[0] || null,
                    })
                  }
                />
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    if (!validateBasicForm()) return;
                    dispatch(markStepCompleted(1));
                    dispatch(goToStep(2));
                  }}
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
                    onClick={() => dispatch(goToStep(2))}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    Tiếp tục →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PRICE */}

      {basicFormCompleted && (
        <>
          {currentStep === 2 && basicFormCompleted && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">2. Giá vé</h3>

              {/* Danh sách vé hiện có */}
              <div className="border p-4 rounded mb-4">
                <h4 className="font-medium mb-3 text-blue-600">
                  Danh sách vé ({tickets.length})
                </h4>

                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có vé nào. Hãy thêm vé mới bên dưới.</p>
                  </div>
                ) : (
                  tickets.map((t, idx) => {
                    const isEditing = editingTicketIndex === idx;

                    return (
                      <div
                        key={t.ticketId || idx}
                        className={`border rounded-lg p-3 mb-3 bg-white shadow-sm hover:shadow-md transition-all ${isEditing ? "ring-2 ring-blue-500 bg-blue-50" : ""
                          }`}
                      >
                        {/* Header - Compact */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base text-gray-800">
                                {t.ticketName}
                              </h3>
                              {isEditing && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                  Đang chỉnh sửa
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(t.phases?.[0]?.startDate)} -{" "}
                              {formatDate(
                                t.phases?.[t.phases.length - 1]?.endDate,
                              )}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(t.ticketPrice)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Số lượng: {t.totalSlot}
                            </div>
                          </div>
                        </div>

                        {/* Phases - 5 columns grid */}
                        {t.phases && t.phases.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-gray-600 mb-1.5">
                              Giai đoạn ({t.phases.length}):
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
                                        className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"}`}
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

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTicket(t, idx)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-300"
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (!confirm("Bạn có chắc muốn xóa vé này? Hành động này không thể hoàn tác.")) return;
                              if (t.priceId) {
                                setDeletedTicketIds(prev => [...prev, t.priceId!]);
                              }
                              setTickets(tickets.filter((_, i) => i !== idx));
                              if (editingTicketIndex === idx) handleCancelEdit();
                              toast.info("Đã xóa vé (sẽ áp dụng khi lưu)");
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                          >
                            Xóa vé
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Form thêm/chỉnh sửa vé */}
              <div id="ticket-form" className="border p-4 rounded">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    {editingTicketIndex !== null
                      ? "Chỉnh sửa vé"
                      : "Thêm vé mới"}
                  </h4>
                  {editingTicketIndex !== null && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ✕ Hủy
                    </Button>
                  )}
                </div>

                <FormInput
                  label="Tên vé"
                  value={newTicket.ticketName}
                  onChange={(val) =>
                    setNewTicket({ ...newTicket, ticketName: val })
                  }
                  placeholder="VD: Vé thường, VIP, Early Bird..."
                />

                <FormTextArea
                  label="Mô tả"
                  value={newTicket.ticketDescription}
                  onChange={(val) =>
                    setNewTicket({ ...newTicket, ticketDescription: val })
                  }
                  rows={2}
                />

                <div className="grid grid-cols-2 gap-3 mt-2">
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

                {/* Giai đoạn giá */}
                <div className="mt-4 border-t pt-3">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    Giai đoạn giá cho vé này ({newTicket.phases.length})
                    {basicForm.ticketSaleStart && basicForm.ticketSaleEnd && (
                      <span className="text-sm text-blue-600">
                        (
                        {new Date(basicForm.ticketSaleStart).toLocaleDateString(
                          "vi-VN",
                        )}{" "}
                        →{" "}
                        {new Date(basicForm.ticketSaleEnd).toLocaleDateString(
                          "vi-VN",
                        )}
                        )
                      </span>
                    )}
                  </h5>

                  {/* Danh sách giai đoạn đã thêm */}
                  {newTicket.phases.map((p, idx) => {
                    const adjustedPrice =
                      newTicket.ticketPrice * (p.applyPercent / 100);
                    const isIncrease = p.applyPercent > 100;
                    const percentDisplay = isIncrease
                      ? `+${p.applyPercent - 100}%`
                      : `-${100 - p.applyPercent}%`;
                    const isEditingPhase = editingPhaseIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`text-sm p-2 rounded flex justify-between items-center mb-2 transition-all ${isEditingPhase
                            ? "bg-blue-100 ring-2 ring-blue-400"
                            : "bg-blue-50"
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.phaseName}</span>
                            {isEditingPhase && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                Đang chỉnh sửa
                              </span>
                            )}
                            <span
                              className={
                                isIncrease ? "text-red-600" : "text-green-600"
                              }
                            >
                              {percentDisplay}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Giá: {adjustedPrice.toLocaleString()} VND | Slot:{" "}
                            {p.totalslot} |{p.startDate} → {p.endDate}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPhase(p, idx)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePhaseFromTicket(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Form thêm/chỉnh sửa giai đoạn mới */}
                  <div className="mt-3 p-3 bg-gray-50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {editingPhaseIndex !== null
                          ? "Chỉnh sửa giai đoạn:"
                          : "Thêm giai đoạn mới:"}
                      </p>
                      {editingPhaseIndex !== null && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelPhaseEdit}
                          className="text-gray-600 hover:text-gray-800 text-xs"
                        >
                          ✕ Hủy
                        </Button>
                      )}
                    </div>

                    <FormInput
                      label="Tên giai đoạn"
                      value={newPhase.phaseName}
                      onChange={(val) =>
                        setNewPhase({ ...newPhase, phaseName: val })
                      }
                      placeholder="VD: Early Bird, Standard, Late..."
                    />

                    {/* Điều chỉnh giá */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Điều chỉnh giá
                      </label>

                      <div className="flex items-end gap-3">
                        {/* Input phần trăm */}
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
                            placeholder="0"
                          />
                        </div>

                        {/* Radio tăng/giảm */}
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

                        {/* Preview giá */}
                        {newTicket.ticketPrice > 0 &&
                          newPhase.percentValue > 0 && (
                            <div className="text-sm bg-white p-2 rounded border">
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
                              ({newPhase.percentType === "increase" ? "+" : "-"}
                              {newPhase.percentValue}%)
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Ngày bắt đầu, số ngày, số lượng */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <DatePickerInput
                          label="Ngày bắt đầu"
                          value={newPhase.startDate}
                          onChange={(val) =>
                            setNewPhase({ ...newPhase, startDate: val })
                          }
                          minDate={basicForm.ticketSaleStart}
                          maxDate={basicForm.ticketSaleEnd}
                          required
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
                          {newPhase.startDate && newPhase.durationInDays > 0 ? (
                            <span className="text-gray-900">
                              {new Date(
                                calculatePhaseEndDate(
                                  newPhase.startDate,
                                  newPhase.durationInDays,
                                ),
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          ) : (
                            <span className="text-gray-400">--/--/----</span>
                          )}
                        </div>
                      </div>
                      <FormInput
                        label={`Số lượng (Tổng: ${newTicket.totalSlot})`}
                        type="number"
                        min="1"
                        max={
                          newTicket.totalSlot -
                          newTicket.phases.reduce(
                            (sum, p) => sum + p.totalslot,
                            0,
                          )
                        }
                        value={newPhase.totalslot}
                        onChange={(val) =>
                          setNewPhase({ ...newPhase, totalslot: Number(val) })
                        }
                        placeholder={`Tối đa: ${newTicket.totalSlot - newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0)}`}
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={handleAddOrUpdatePhase}
                      className="w-full"
                    >
                      {editingPhaseIndex !== null
                        ? "💾 Cập nhật giai đoạn"
                        : "+ Thêm giai đoạn"}
                    </Button>
                  </div>
                </div>

                {/* Button thêm/cập nhật vé */}
                <Button
                  className="mt-4 w-full"
                  onClick={handleAddOrUpdateTicket}
                >
                  {editingTicketIndex !== null
                    ? "💾 Cập nhật vé"
                    : "✓ Thêm vé vào danh sách"}
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => dispatch(goToStep(1))} variant="outline">
                  ← Quay lại
                </Button>
                <Button
                  onClick={() => {
                    dispatch(markStepCompleted(2));
                    dispatch(goToStep(3));
                  }}
                  className="flex-1 bg-blue-600 text-white"
                >
                  Lưu và tiếp tục
                </Button>
                {completedSteps.includes(2) && (
                  <Button
                    onClick={() => dispatch(goToStep(3))}
                    className="flex-1 bg-green-600 text-white"
                  >
                    Tiếp tục →
                  </Button>
                )}
              </div>
            </div>
          )}
          {/* STEP 3: SESSIONS */}

          {currentStep === 3 && basicFormCompleted && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                3. Phiên họp (Tùy chọn)
              </h3>

              <div className="space-y-2 mb-4">
                {sessions.length === 0 ? (
                  <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
                    Chưa có phiên họp nào. Bạn có thể bỏ qua hoặc thêm phiên họp
                    mới bên dưới.
                  </div>
                ) : (
                  sessions.map((s, idx) => {
                    const room = roomsData?.data.find(
                      (r: RoomInfoResponse) => r.roomId === s.roomId,
                    );

                    return (
                      <div key={idx} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{s.title}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              📅 {s.date} | ⏰ {s.startTime} - {s.endTime}
                            </div>
                            {room && (
                              <div className="text-xs text-gray-500 mt-1">
                                🏢 Phòng: {room.number} - {room.displayName}
                              </div>
                            )}

                            {s.speaker.length > 0 && (
                              <div className="mt-2">
                                <div className="text-sm font-medium text-gray-700">
                                  Diễn giả:
                                </div>
                                <div className="space-y-1 mt-1">
                                  {s.speaker.map((spk, spkIdx) => (
                                    <div
                                      key={spkIdx}
                                      className="text-sm text-gray-600 ml-2"
                                    >
                                      • {spk.name}{" "}
                                      {spk.description &&
                                        `- ${spk.description}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setNewSession(s);
                                setSessions(
                                  sessions.filter((_, i) => i !== idx),
                                );
                              }}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (!confirm("Bạn có chắc muốn xóa phiên họp này?")) return;
                                const session = sessions[idx];
                                if (session.sessionId) {
                                  setDeletedSessionIds(prev => [...prev, session.sessionId!]);
                                }
                                setSessions(sessions.filter((_, i) => i !== idx));
                                toast.info("Đã xóa phiên họp (sẽ áp dụng khi lưu)");
                              }}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border p-4 rounded space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  Thêm phiên họp mới
                  {basicForm.startDate && basicForm.endDate && (
                    <span className="text-sm text-green-600">
                      (
                      {new Date(basicForm.startDate).toLocaleDateString(
                        "vi-VN",
                      )}{" "}
                      →{" "}
                      {new Date(basicForm.endDate).toLocaleDateString("vi-VN")})
                    </span>
                  )}
                </h4>
                <FormInput
                  label="Tiêu đề"
                  value={newSession.title}
                  onChange={(val) =>
                    setNewSession({ ...newSession, title: val })
                  }
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
                <DatePickerInput
                  label="Ngày"
                  value={newSession.date}
                  onChange={(val) =>
                    setNewSession({ ...newSession, date: val })
                  }
                  minDate={basicForm.startDate}
                  maxDate={basicForm.endDate}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Thời gian bắt đầu"
                    type="time"
                    value={newSession.startTime}
                    onChange={(val) => {
                      if (newSession.date) {
                        const datetime = `${newSession.date}T${val}`;
                        setNewSession({ ...newSession, startTime: datetime });
                      } else {
                        toast.error("Vui lòng chọn ngày trước!");
                      }
                    }}
                    required
                    disabled={!newSession.date}
                  />
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

                {newSession.endTime && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    ⏰ Kết thúc lúc:{" "}
                    <strong>{newSession.endTime.replace("T", " ")}</strong>
                  </div>
                )}

                <FormSelect
                  label="Phòng"
                  value={newSession.roomId}
                  onChange={(val) =>
                    setNewSession({ ...newSession, roomId: val })
                  }
                  options={roomOptions}
                  required
                  disabled={isRoomsLoading}
                />

                <div className="border-t pt-3">
                  <h5 className="font-medium mb-2">Diễn giả</h5>

                  {newSession.speaker.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {newSession.speaker.map((spk, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-blue-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {spk.image && (
                              <img
                                src={spk.image}
                                alt={spk.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {spk.name}
                              </div>
                              {spk.description && (
                                <div className="text-xs text-gray-600">
                                  {spk.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setNewSession({
                                ...newSession,
                                speaker: newSession.speaker.filter(
                                  (_, i) => i !== idx,
                                ),
                              });
                              toast.success("Đã xóa diễn giả!");
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 border p-3 rounded bg-gray-50">
                    <FormInput
                      label="Tên diễn giả"
                      value={newSpeaker.name}
                      onChange={(val) =>
                        setNewSpeaker({ ...newSpeaker, name: val })
                      }
                      placeholder="VD: Nguyễn Văn A"
                    />

                    <FormTextArea
                      label="Mô tả"
                      value={newSpeaker.description}
                      onChange={(val) =>
                        setNewSpeaker({ ...newSpeaker, description: val })
                      }
                      rows={2}
                      placeholder="Chức vụ, kinh nghiệm..."
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ảnh diễn giả <span className="text-red-500">*</span>
                      </label>

                      {/* Preview ảnh */}
                      {newSpeaker.image && (
                        <div className="mb-2">
                          <img
                            src={URL.createObjectURL(newSpeaker.image)}
                            alt="Preview"
                            className="h-20 w-20 rounded-full object-cover border"
                          />
                        </div>
                      )}

                      <ImageUpload
                        label="Ảnh diễn giả"
                        subtext="Dưới 4MB, định dạng PNG hoặc JPG"
                        maxSizeMB={4}
                        height="h-32"
                        onChange={(file) =>
                          setNewSpeaker({
                            ...newSpeaker,
                            image: file as File | null,
                          })
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newSpeaker.name.trim()) {
                          toast.error("Vui lòng nhập tên diễn giả!");
                          return;
                        }

                        if (!newSpeaker.image) {
                          toast.error("Vui lòng chọn ảnh diễn giả!");
                          return;
                        }

                        setNewSession({
                          ...newSession,
                          speaker: [
                            ...(newSession.speaker || []),
                            newSpeaker as Speaker,
                          ],
                        });

                        // Reset form
                        setNewSpeaker({
                          name: "",
                          description: "",
                          image: null,
                        });
                        toast.success("Đã thêm diễn giả!");
                      }}
                      className="w-full mt-2"
                    >
                      + Thêm diễn giả
                    </Button>
                  </div>
                </div>

                <Button onClick={handleAddSession} className="w-full mt-4">
                  Thêm phiên họp vào danh sách
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => dispatch(goToStep(2))} variant="outline">
                  ← Quay lại
                </Button>
                <Button
                  onClick={() => {
                    const eventStartDate = basicForm.startDate;
                    const eventEndDate = basicForm.endDate;
                    if (eventStartDate && eventEndDate) {
                      const hasSessionOnStartDay = sessions.some(
                        (s) => s.date === eventStartDate,
                      );
                      const hasSessionOnEndDay = sessions.some(
                        (s) => s.date === eventEndDate,
                      );
                      if (!hasSessionOnStartDay || !hasSessionOnEndDay) {
                        toast.error(
                          "Phải có ít nhất 1 phiên họp vào ngày bắt đầu và 1 vào ngày kết thúc hội thảo!",
                        );
                        return;
                      }
                    }
                    dispatch(markStepCompleted(3));
                    dispatch(goToStep(4));
                  }}
                  className="flex-1 bg-blue-600 text-white"
                >
                  {sessions.length > 0 ? "Lưu và tiếp tục" : "Bỏ qua"}
                </Button>
                {completedSteps.includes(3) && (
                  <Button
                    onClick={() => dispatch(goToStep(4))}
                    className="flex-1 bg-green-600 text-white"
                  >
                    Tiếp tục →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: POLICIES */}
          {currentStep === 4 && basicFormCompleted && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                4. Chính sách (Tùy chọn)
              </h3>

              {/* Phần 4.1: Chính sách chung */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">
                  4.1. Chính sách chung (Tùy chọn)
                </h4>

                <div className="space-y-2 mb-4">
                  {policies.length === 0 ? (
                    <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
                      Chưa có chính sách nào. Bạn có thể bỏ qua hoặc thêm chính
                      sách mới bên dưới.
                    </div>
                  ) : (
                    policies.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{p.policyName}</div>
                          <div className="text-sm text-gray-600">
                            {p.description}
                          </div>
                        </div>
                        <div className="flex gap-2">
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
                            onClick={async () => {
                              if (!confirm("Bạn có chắc muốn xóa chính sách này?")) return;
                              const policy = policies[idx];
                              if (policy.policyId) {
                                setDeletedPolicyIds(prev => [...prev, policy.policyId!]);
                              }
                              setPolicies(policies.filter((_, i) => i !== idx));
                              toast.info("Đã xóa chính sách (sẽ áp dụng khi lưu)");
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))
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

              <div className="flex gap-3 mt-6">
                <Button onClick={() => dispatch(goToStep(3))} variant="outline">
                  ← Quay lại
                </Button>
                <Button
                  onClick={() => {
                    dispatch(markStepCompleted(4));
                    dispatch(goToStep(5));
                  }}
                  className="flex-1 bg-blue-600 text-white"
                >
                  {policies.length > 0 || refundPolicies.length > 0
                    ? "Lưu và tiếp tục"
                    : "Bỏ qua"}
                </Button>
                {completedSteps.includes(4) && (
                  <Button
                    onClick={() => dispatch(goToStep(5))}
                    className="flex-1 bg-green-600 text-white"
                  >
                    Tiếp tục →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: MEDIA */}
          {currentStep === 5 && basicFormCompleted && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                5. Media (Tùy chọn)
              </h3>

              <div className="space-y-2 mb-4">
                {mediaList.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      {m.mediaFile instanceof File ? (
                        <img
                          src={URL.createObjectURL(m.mediaFile)}
                          alt="Media Preview"
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : typeof m.mediaFile === "string" && m.mediaFile ? (
                        <img
                          src={m.mediaFile}
                          alt="Media"
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : null}

                      <div>
                        <div className="text-sm">
                          {m.mediaFile instanceof File
                            ? m.mediaFile.name
                            : typeof m.mediaFile === "string"
                              ? "Ảnh hiện tại"
                              : "No file"}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!m.mediaId) {
                          toast.error("Không tìm thấy media này trên hệ thống");
                          return;
                        }
                        if (!confirm("Bạn có chắc muốn xóa media này?")) return;
                        if (m.mediaId) {
                          setDeletedMediaIds(prev => [...prev, m.mediaId!]);
                          // Xóa khỏi existingMediaUrls nếu cần
                          setExistingMediaUrls(existingMediaUrls.filter((_, i) => i !== idx));
                        }
                        toast.info("Đã xóa media (sẽ áp dụng khi lưu)");
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border p-4 rounded space-y-3">
                <h4 className="font-medium">Thêm media</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Media File
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setNewMedia({
                        ...newMedia,
                        mediaFile: e.target.files?.[0] || null,
                      })
                    }
                    accept="image/*,video/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button onClick={handleAddMedia}>Thêm media</Button>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => dispatch(goToStep(4))} variant="outline">
                  ← Quay lại
                </Button>
                <Button
                  onClick={() => {
                    dispatch(markStepCompleted(5));
                    dispatch(goToStep(6));
                  }}
                  className="flex-1 bg-blue-600 text-white"
                >
                  {mediaList.length > 0 ? "Lưu và tiếp tục" : "Bỏ qua"}
                </Button>
                {completedSteps.includes(5) && (
                  <Button
                    onClick={() => dispatch(goToStep(6))}
                    className="flex-1 bg-green-600 text-white"
                  >
                    Tiếp tục →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: SPONSORS */}
          {currentStep === 6 && basicFormCompleted && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                6. Nhà tài trợ (Tùy chọn)
              </h3>

              <div className="space-y-2 mb-4">
                {existingSponsorUrls.map((s, idx) => (
                  <div
                    key={s.sponsorId}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      {s.imageUrl && (
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-gray-600">
                          Logo hiện tại
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm("Bạn có chắc muốn xóa nhà tài trợ này?")) return;
                        if (s.sponsorId) {
                          setDeletedSponsorIds(prev => [...prev, s.sponsorId!]);
                        }
                        setExistingSponsorUrls(existingSponsorUrls.filter((_, i) => i !== idx));
                        toast.info("Đã xóa nhà tài trợ (sẽ áp dụng khi lưu)");
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}

                {sponsors.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      {s.imageFile instanceof File ? (
                        <img
                          src={URL.createObjectURL(s.imageFile)}
                          alt="Sponsor Preview"
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : typeof s.imageFile === "string" && s.imageFile ? (
                        <img
                          src={s.imageFile}
                          alt={s.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : null}

                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-gray-600">
                          {s.imageFile instanceof File
                            ? s.imageFile.name
                            : typeof s.imageFile === "string"
                              ? "Logo hiện tại"
                              : "No image"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
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

              <div className="border p-4 rounded space-y-3">
                <h4 className="font-medium">Thêm nhà tài trợ</h4>
                <FormInput
                  label="Tên"
                  value={newSponsor.name}
                  onChange={(val) =>
                    setNewSponsor({ ...newSponsor, name: val })
                  }
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Logo Nhà tài trợ
                  </label>
                  <ImageUpload
                    isList={false}
                    height="h-32"
                    onChange={(file) =>
                      setNewSponsor({
                        ...newSponsor,
                        imageFile: file as File | null,
                      })
                    }
                    resetTrigger={resetSponsorUpload}
                  />
                </div>
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
              <div className="flex gap-3 mt-6">
                <Button onClick={() => dispatch(goToStep(5))} variant="outline">
                  ← Quay lại
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  className="flex-1 bg-green-600 text-white"
                >
                  Hoàn tất
                </Button>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="bg-white border rounded-lg p-6">
            <Button onClick={handleFinalSubmit}>
              {isSubmitting
                ? "Đang cập nhật..."
                : conferenceId
                  ? "💾 Lưu thay đổi"
                  : "🎉 Hoàn thành & Tạo hội thảo"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

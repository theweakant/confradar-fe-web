
"use client"
import { useRouter, useParams  } from "next/navigation";
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
  useUpdateConferenceSessionMutation,
  useUpdateConferencePolicyMutation,
  useUpdateConferenceRefundPolicyMutation,
  useUpdateConferenceMediaMutation,
  useUpdateConferenceSponsorMutation,
} from "@/redux/services/conferenceStep.service";

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";

import type { ApiError } from "@/types/api.type";


import type {
  ConferenceBasicForm,
  ConferencePriceData,
  Phase,
  Ticket,
  Session,
  Speaker,
  Policy,
  RefundPolicy, 
  ConferenceRefundPolicyData, 
  Media,
  Sponsor,
  RoomInfoResponse,
  ConferenceSessionData
} from "@/types/conference.type";
import { toast } from "sonner";


import {formatDate,formatCurrency} from "@/helper/format"

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

  const { data: conferenceDetail, isLoading: isLoadingDetail } = 
    useGetTechnicalConferenceDetailInternalQuery(conferenceId, {
      skip: !conferenceId 
    });


  const [createPrice] = useCreateConferencePriceMutation();
  const [createSessions] = useCreateConferenceSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createRefundPolicies] = useCreateRefundPoliciesMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();    

  const [updateBasic] = useUpdateBasicConferenceMutation();
  const [updatePrice] = useUpdateConferencePriceMutation();
  const [updateSession] = useUpdateConferenceSessionMutation(); 
  const [updatePolicy] = useUpdateConferencePolicyMutation();  
  const [updateRefundPolicy] = useUpdateConferenceRefundPolicyMutation();  
  const [updateMedia] = useUpdateConferenceMediaMutation();
  const [updateSponsor] = useUpdateConferenceSponsorMutation();  

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();

const [existingMediaUrls, setExistingMediaUrls] = useState<{mediaId: string, url: string}[]>([]);
const [existingSponsorUrls, setExistingSponsorUrls] = useState<{
  sponsorId: string;
  name: string;
  imageUrl: string;
}[]>([]);

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
      startDate: conf.startDate?.split('T')[0] || "",
      endDate: conf.endDate?.split('T')[0] || "",
      dateRange: calculateDateRange(conf.startDate ||"", conf.endDate||""),
      totalSlot: conf.totalSlot || 0,
      address: conf.address || "",
      bannerImageFile: null, 
      isInternalHosted: conf.isInternalHosted || false,
      isResearchConference: conf.isResearchConference || false,
      conferenceCategoryId: conf.conferenceCategoryId || "",
      cityId: conf.cityId || "",
      ticketSaleStart: conf.ticketSaleStart?.split('T')[0] || "",
      ticketSaleEnd: conf.ticketSaleEnd?.split('T')[0] || "",
      ticketSaleDuration: calculateDateRange(conf.ticketSaleStart||"", conf.ticketSaleEnd||""),
      createdby: "", 
      targetAudienceTechnicalConference: conf.targetAudience || "",
    });
    setBasicFormCompleted(true);

    // Step 2: Tickets & Phases
    if (conf.conferencePrices) {
      setTickets(conf.conferencePrices.map(t => ({
        ticketId: t.conferencePriceId || "",
        priceId: t.conferencePriceId || "",
        ticketPrice: t.ticketPrice || 0,
        ticketName: t.ticketName || "",
        ticketDescription: t.ticketDescription || "",
        isAuthor: t.isAuthor || false,
        totalSlot: t.totalSlot || 0,
        phases: (t.pricePhases || []).map(p => ({
          phaseId: p.pricePhaseId || "",
          phaseName: p.phaseName || "",
          applyPercent: p.applyPercent || 100,
          startDate: p.startDate?.split('T')[0] || "",
          endDate: p.endDate?.split('T')[0] || "",
          totalslot: p.totalSlot || 0
        }))
      })));
    }

    // Step 3: Sessions
    if (conf.sessions) {
      setSessions(conf.sessions.map(s => ({
        sessionId: s.conferenceSessionId || "",
        title: s.title || "",
        description: s.description || "",
        date: s.sessionDate?.split('T')[0] || "",
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        timeRange: calculateTimeRange(s.startTime ||"", s.endTime||""),
        roomId: s.roomId || "",
        speaker: (s.speakers || []).map(sp => ({
          speakerId: sp.speakerId || "",
          name: sp.name || "",
          description: sp.description || "",
          image: sp.image || ""
        })),
        sessionMedias: (s.sessionMedia || []).map(m => ({
          mediaId: m.conferenceSessionMediaId || "",
          mediaFile: m.conferenceSessionMediaUrl || ""
        }))
      })));
    }

    // Step 4: Policies
    if (conf.policies) {
      setPolicies(conf.policies.map(p => ({
        policyId: p.policyId || "",
        policyName: p.policyName || "",
        description: p.description || ""
      })));
    }

    // Step 4.2: Refund Policies
    if (conf.refundPolicies) {
      setRefundPolicies(conf.refundPolicies.map(rp => ({
        refundPolicyId: rp.refundPolicyId || "",
        percentRefund: rp.percentRefund || 0,
        refundDeadline: rp.refundDeadline?.split('T')[0] || "",
        refundOrder: rp.refundOrder || 1
      })));
    }

    // Step 5: Media
    if (conf.conferenceMedia) {
      setExistingMediaUrls(conf.conferenceMedia.map(m => ({
        mediaId: m.mediaId || "",
        url: m.mediaUrl || ""
      })));
    }

    // Step 6: Sponsors
    if (conf.sponsors) {
      setExistingSponsorUrls(conf.sponsors.map(s => ({
        sponsorId: s.sponsorId || "",
        name: s.name || "",
        imageUrl: s.imageUrl || ""
      })));
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
    setBasicForm(prev => ({ ...prev, endDate }));
  }
}, [basicForm.startDate, basicForm.dateRange]);

useEffect(() => {
  if (basicForm.ticketSaleStart && basicForm.ticketSaleDuration && basicForm.ticketSaleDuration > 0) {
    const start = new Date(basicForm.ticketSaleStart);
    const end = new Date(start);
    end.setDate(start.getDate() + basicForm.ticketSaleDuration - 1);
    const ticketSaleEnd = end.toISOString().split("T")[0];
    setBasicForm(prev => ({ ...prev, ticketSaleEnd }));
  }
}, [basicForm.ticketSaleStart, basicForm.ticketSaleDuration]);

  // Step 2: Price
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState<Omit<Ticket, 'ticketId'>>({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    isAuthor: false,
    totalSlot: 0,
    phases: []
  });
  const [newPhase, setNewPhase] = useState<{
    phaseName: string;
    percentValue: number;
    percentType: 'increase' | 'decrease';
    startDate: string;
    durationInDays: number;
    totalslot: number;
  }>({
    phaseName: "",
    percentValue: 0,
    percentType: 'increase',
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
  const [newSpeaker, setNewSpeaker] = useState<Omit<Speaker, 'image'> & { image: File | null }>({
    name: "",
    description: "",
    image: null, 
  });

useEffect(() => {
  if (newSession.startTime && newSession.timeRange && newSession.timeRange > 0) {
    const start = new Date(newSession.startTime);
    const end = new Date(start);
    end.setHours(end.getHours() + Number(newSession.timeRange));

    const formattedEnd = end.toLocaleString("sv-SE").replace(" ", "T").slice(0, 16);

    setNewSession(prev => ({ ...prev, endTime: formattedEnd }));
  }
}, [newSession.startTime, newSession.timeRange]);


  // Step 4: Policies
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicy, setNewPolicy] = useState<Policy>({
    policyName: "",
    description: "",
  });

  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
  const [newRefundPolicy, setNewRefundPolicy] = useState<Omit<RefundPolicy, 'refundPolicyId'>>({
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


  // Validate Step 1
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

const handleFinalSubmit = async () => {
  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return;
  }
  try {
    setIsSubmitting(true);
    //BASIC
    const basicUpdatePromise = updateBasic({ conferenceId, data: basicForm }).unwrap();

    //Price
    const ticketUpdatePromises = tickets
      .filter(ticket => ticket.priceId)
      .map(ticket => updatePrice({
        priceId: ticket.priceId!,
        data: {
          ticketPrice: parseFloat(ticket.ticketPrice.toFixed(2)),
          ticketName: ticket.ticketName,
          ticketDescription: ticket.ticketDescription,
          totalSlot: ticket.totalSlot,
        }
      }).unwrap());

    const newTickets = tickets.filter(t => !t.priceId);
    const ticketCreatePromise = newTickets.length > 0
      ? createPrice({
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
                totalslot: p.totalslot
              }))
            }))
          }
        }).unwrap()
      : Promise.resolve();

    // Step 3: Sessions
    const sessionUpdatePromises = sessions
      .filter(s => s.sessionId)
      .map(s => updateSession({
        sessionId: s.sessionId!,
        data: {
          title: s.title,
          description: s.description,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          roomId: s.roomId,
        }
      }).unwrap());

    const newSessions = sessions.filter(s => !s.sessionId);
    const sessionCreatePromise = newSessions.length > 0
      ? createSessions({
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
                imageUrl: typeof sp.image === 'string' ? sp.image : undefined,
              })),
              sessionMedias: (s.sessionMedias || []).map(m => ({
                mediaFile: m.mediaFile instanceof File ? m.mediaFile : undefined,
                mediaUrl: typeof m.mediaFile === 'string' ? m.mediaFile : undefined,
              }))
            }))
          }
        }).unwrap()
      : Promise.resolve();

    // Step 4: Policies
    const policyUpdatePromises = policies
      .filter(p => p.policyId)
      .map(p => updatePolicy({
        policyId: p.policyId!,
        data: { policyName: p.policyName, description: p.description }
      }).unwrap());

    const newPolicies = policies.filter(p => !p.policyId);
    const policyCreatePromise = newPolicies.length > 0
      ? createPolicies({ conferenceId, data: { policies: newPolicies } }).unwrap()
      : Promise.resolve();

    // Step 4.2: Refund Policies
    const refundPolicyUpdatePromises = refundPolicies
      .filter(rp => rp.refundPolicyId)
      .map(rp => updateRefundPolicy({
        refundPolicyId: rp.refundPolicyId!,
        data: {
          percentRefund: rp.percentRefund,
          refundDeadline: rp.refundDeadline,
          refundOrder: rp.refundOrder,
        }
      }).unwrap());

    const newRefundPolicies = refundPolicies.filter(rp => !rp.refundPolicyId);
    const refundPolicyCreatePromise = newRefundPolicies.length > 0
      ? createRefundPolicies({ conferenceId, data: { refundPolicies: newRefundPolicies } }).unwrap()
      : Promise.resolve();

    // Step 5: Media
    const mediaUpdatePromises = mediaList
      .filter(m => m.mediaId && m.mediaFile instanceof File)
      .map(m => updateMedia({
        mediaId: m.mediaId!,
        mediaFile: m.mediaFile as File,
      }).unwrap());

    const newMediaItems = mediaList.filter(m => !m.mediaId);
    const mediaCreatePromise = newMediaItems.length > 0
      ? createMedia({ conferenceId, data: { media: newMediaItems } }).unwrap()
      : Promise.resolve();

    // Step 6: Sponsors
    const sponsorUpdatePromises = sponsors
      .filter(s => s.sponsorId && s.imageFile instanceof File)
      .map(s => updateSponsor({
        sponsorId: s.sponsorId!,
        name: s.name,
        imageFile: s.imageFile as File,
      }).unwrap());

    const newSponsors = sponsors.filter(s => !s.sponsorId);
    const sponsorCreatePromise = newSponsors.length > 0
      ? createSponsors({ conferenceId, data: { sponsors: newSponsors } }).unwrap()
      : Promise.resolve();

    
    await Promise.all([
      basicUpdatePromise,
      ...ticketUpdatePromises,
      ...sessionUpdatePromises,
      ...policyUpdatePromises,
      ...refundPolicyUpdatePromises,
      ...mediaUpdatePromises,
      ...sponsorUpdatePromises,
      ticketCreatePromise,
      sessionCreatePromise,
      policyCreatePromise,
      refundPolicyCreatePromise,
      mediaCreatePromise,
      sponsorCreatePromise,
    ]);

    toast.success("Cập nhật hội thảo thành công!");
    router.push(`/workspace/collaborator/manage-conference`);
  } catch (error) {
    const apiError = error as { data?: ApiError };
    console.error("Failed to update conference:", error);
    toast.error(apiError?.data?.Message || "Cập nhật hội thảo thất bại!");
  } finally {
    setIsSubmitting(false);
  }
};


const handleAddPhaseToNewTicket = () => {
  const { phaseName, percentValue, percentType, startDate, durationInDays, totalslot } = newPhase;
  
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

  if (!conferenceDetail?.data?.ticketSaleStart || !conferenceDetail?.data?.ticketSaleEnd) {
    toast.error("Không tìm thấy thông tin thời gian bán vé!");
    return;
  }

  const saleStart = new Date(conferenceDetail.data.ticketSaleStart);
  const saleEnd = new Date(conferenceDetail.data.ticketSaleEnd);
  const phaseStart = new Date(startDate);
  
  // Tính endDate của phase
  const phaseEnd = new Date(phaseStart);
  phaseEnd.setDate(phaseStart.getDate() + durationInDays - 1);

  if (phaseStart < saleStart || phaseStart > saleEnd) {
    toast.error(
      `Ngày bắt đầu giai đoạn phải trong khoảng ${saleStart.toLocaleDateString('vi-VN')} - ${saleEnd.toLocaleDateString('vi-VN')}!`
    );
    return;
  }

  if (phaseEnd > saleEnd) {
    toast.error(
      `Ngày kết thúc giai đoạn (${phaseEnd.toLocaleDateString('vi-VN')}) vượt quá thời gian bán vé!`
    );
    return;
  }

  const currentPhasesTotal = newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0);
  if (currentPhasesTotal + totalslot > newTicket.totalSlot) {
    toast.error(
      `Tổng slot các giai đoạn (${currentPhasesTotal + totalslot}) vượt quá tổng slot vé (${newTicket.totalSlot})!`
    );
    return;
  }

  // Check overlap
  const hasOverlap = newTicket.phases.some(p => {
    const pStart = new Date(p.startDate);
    const pEnd = new Date(p.endDate);
    return (phaseStart <= pEnd && phaseEnd >= pStart);
  });

  if (hasOverlap) {
    toast.error("Giai đoạn này bị trùng thời gian với giai đoạn khác!");
    return;
  }

  const endDate = phaseEnd.toISOString().split("T")[0];
  
  const applyPercent = percentType === 'increase' 
    ? 100 + percentValue  
    : 100 - percentValue;
    
  const phase: Phase = {
    phaseName,
    applyPercent,
    startDate,
    endDate,
    totalslot,
  };

  setNewTicket(prev => ({
    ...prev,
    phases: [...prev.phases, phase],
  }));

  setNewPhase({
    phaseName: "",
    percentValue: 0,
    percentType: 'increase',
    startDate: "",
    durationInDays: 1,
    totalslot: 0,
  });
  
  toast.success("Đã thêm giai đoạn!");
};

  const handleRemovePhaseFromTicket = (phaseIndex: number) => {
    setNewTicket(prev => ({
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

    if (newTicket.phases.length > 0) {
      const totalPhaseSlots = newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0);
      if (totalPhaseSlots !== newTicket.totalSlot) {
        toast.error(
          `Tổng slot các giai đoạn (${totalPhaseSlots}) phải bằng tổng slot vé (${newTicket.totalSlot})!`
        );
        return;
      }
    }

    setTickets([...tickets, { ...newTicket, isAuthor: false }]);
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
  if (!newSession.title || newSession.speaker.length === 0) {
    toast.error("Vui lòng nhập tiêu đề và ít nhất 1 diễn giả!");
    return;
  }
  
  if (!newSession.date || !newSession.startTime || !newSession.endTime) {
    toast.error("Vui lòng nhập đầy đủ ngày và thời gian!");
    return;
  }

  if (!conferenceDetail?.data?.startDate || !conferenceDetail?.data?.endDate) {
    toast.error("Không tìm thấy thông tin thời gian sự kiện!");
    return;
  }

  const confStart = new Date(conferenceDetail.data.startDate);
  const confEnd = new Date(conferenceDetail.data.endDate);
  const sessionDate = new Date(newSession.date);

  if (sessionDate < confStart || sessionDate > confEnd) {
    toast.error(
      `Ngày phiên họp phải trong khoảng ${confStart.toLocaleDateString('vi-VN')} - ${confEnd.toLocaleDateString('vi-VN')}!`
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
  if (newRefundPolicy.percentRefund <= 0 || newRefundPolicy.percentRefund > 100) {
    toast.error("Phần trăm hoàn tiền phải từ 1-100%!");
    return;
  }
  
  if (!newRefundPolicy.refundDeadline) {
    toast.error("Vui lòng chọn hạn hoàn tiền!");
    return;
  }

  if (!conferenceDetail?.data?.startDate) {
    toast.error("Không tìm thấy thông tin thời gian sự kiện!");
    return;
  }

  const deadline = new Date(newRefundPolicy.refundDeadline);
  const eventStart = new Date(conferenceDetail.data.startDate);

  if (deadline >= eventStart) {
    toast.error("Hạn hoàn tiền phải trước ngày bắt đầu sự kiện!");
    return;
  }

  // Check trùng thứ tự
  const existingOrder = refundPolicies.find(
    p => p.refundOrder === newRefundPolicy.refundOrder
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


  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cập nhật hội thảo</h1>
        <p className="text-gray-600 mt-1">Chỉnh sửa thông tin hội thảo</p>
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
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">1. Thông tin cơ bản</h3>

        </div>

        <div className="space-y-4">
          <FormInput
            label="Tên hội thảo"
            name="conferenceName"
            value={basicForm.conferenceName}
            onChange={(val) => setBasicForm({ ...basicForm, conferenceName: val })}
            required
           
          />
          <FormTextArea
            label="Mô tả"
            value={basicForm.description ?? ""}
            onChange={(val) => setBasicForm({ ...basicForm, description: val })}
            rows={3}
           
          />

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-medium mb-2">
      Ngày bắt đầu *
    </label>
    <input
      type="date"
      value={basicForm.startDate}
      onChange={(e) => setBasicForm({ ...basicForm, startDate: e.target.value })}
      required
      className="w-full px-3 py-2 border rounded-lg"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Số ngày diễn ra *
    </label>
    <input
      type="number"
      value={basicForm.dateRange}
      onChange={(e) => setBasicForm({ ...basicForm, dateRange: Number(e.target.value) })}
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
          {new Date(basicForm.endDate).toLocaleDateString("vi-VN")}
        </span>
      ) : (
        <span className="text-gray-400">--/--/----</span>
      )}
    </div>
  </div>
</div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Ngày bắt đầu bán vé"
            type="date"
            value={basicForm.ticketSaleStart}
            onChange={(val) => setBasicForm({ ...basicForm, ticketSaleStart: val })}
            required
          />
          
          <FormInput
            label="Số ngày bán vé"
            type="number"
            min="1"
            value={basicForm.ticketSaleDuration}
            onChange={(val) => setBasicForm({ ...basicForm, ticketSaleDuration: Number(val) })}
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
                  {new Date(basicForm.ticketSaleEnd).toLocaleDateString("vi-VN")}
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
    onChange={(val) => setBasicForm({ ...basicForm, totalSlot: Number(val) })}
   
  />
  <FormSelect
    label="Danh mục"
    name="categoryId"
    value={basicForm.conferenceCategoryId}
    onChange={(val) => setBasicForm({ ...basicForm, conferenceCategoryId: val })}
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
    onChange={(val) => setBasicForm({ ...basicForm, targetAudienceTechnicalConference: val })}
    options={TARGET_OPTIONS}
   
  />
  {basicForm.targetAudienceTechnicalConference === "Khác" && (
    <FormInput
      label="Nhập đối tượng khác"
      value={basicForm.customTarget || ""}
      onChange={(val) => setBasicForm({ ...basicForm, customTarget: val })}
     
    />
  )}
</div>

<div>
  <label className="block text-sm font-medium mb-2">Banner Image</label>
  
  {/* Hiển thị ảnh hiện tại hoặc preview */}
  {(basicForm.bannerImageFile || conferenceDetail?.data?.bannerImageUrl) && (
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
          onClick={() => setBasicForm({ ...basicForm, bannerImageFile: null })}
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
</div>

        </div>
      </div>

      {basicFormCompleted && (
        <>

          {/* STEP 2: PRICE */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">2. Giá vé</h3>
            
<div className="border p-4 rounded mb-4">
  <h4 className="font-medium mb-3 text-blue-600">
    Danh sách vé ({tickets.length})
  </h4>

{tickets.map((t, idx) => (
  <div key={t.ticketId || idx} className="border rounded-lg p-3 mb-3 bg-white shadow-sm hover:shadow-md transition-shadow">
    {/* Header - Compact */}
    <div className="flex items-center justify-between mb-2 pb-2 border-b">
      <div className="flex-1">
        <h3 className="font-semibold text-base text-gray-800">{t.ticketName}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatDate(t.phases?.[0]?.startDate)} - {formatDate(t.phases?.[t.phases.length - 1]?.endDate)}
        </p>
      </div>
      <div className="text-right ml-4">
      <div className="text-lg font-bold text-blue-600">
        {formatCurrency(t.ticketPrice)}
      </div>        
      <div className="text-xs text-gray-500">Số lượng: {t.totalSlot}</div>
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
                <div className="text-xs font-semibold text-gray-800 mb-1 truncate" title={p.phaseName}>
                  {p.phaseName}
                </div>
                <div className="text-[10px] text-gray-500 mb-1 leading-tight">
                  {formatDate(p.startDate)} - {formatDate(p.endDate)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Tổng: {p.totalslot}</span>
                  <span className={`font-bold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
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
      onClick={() => setTickets(tickets.filter((_, i) => i !== idx))}
      className="w-full bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5 mt-2"
    >
      Xóa vé
    </Button>
  </div>
))}
</div>


            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">Thêm vé mới</h4>
              <FormInput
                label="Tên vé"
                value={newTicket.ticketName}
                onChange={(val) => setNewTicket({ ...newTicket, ticketName: val })}
                placeholder="VD: Vé thường, VIP, Early Bird..."
              />
              <FormTextArea
                label="Mô tả"
                value={newTicket.ticketDescription}
                onChange={(val) => setNewTicket({ ...newTicket, ticketDescription: val })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <FormInput
                  label="Giá vé gốc (VND)"
                  type="number"
                  value={newTicket.ticketPrice}
                  onChange={(val) => setNewTicket({ ...newTicket, ticketPrice: Number(val) })}
                  placeholder="500000"
                />
                <FormInput
                  label="Tổng số lượng"
                  type="number"
                  value={newTicket.totalSlot}
                  onChange={(val) => setNewTicket({ ...newTicket, totalSlot: Number(val) })}
                  placeholder="100"
                />
              </div>

              <div className="mt-4 border-t pt-3">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  Giai đoạn giá cho vé này ({newTicket.phases.length})
                  {conferenceDetail?.data?.ticketSaleStart && conferenceDetail?.data?.ticketSaleEnd && (
                    <span className="text-sm text-blue-600">
                      ({new Date(conferenceDetail.data.ticketSaleStart).toLocaleDateString('vi-VN')} → {new Date(conferenceDetail.data.ticketSaleEnd).toLocaleDateString('vi-VN')})
                    </span>
                  )}
                </h5>
                
                {newTicket.phases.map((p, idx) => {
                  const adjustedPrice = newTicket.ticketPrice * (p.applyPercent / 100);
                  const isIncrease = p.applyPercent > 100;
                  const percentDisplay = isIncrease 
                    ? `+${p.applyPercent - 100}%` 
                    : `-${100 - p.applyPercent}%`;
                  
                  return (
                    <div 
                      key={idx} 
                      className="text-sm bg-blue-50 p-2 rounded flex justify-between items-center mb-2"
                    >
                      <div>
                        <span className="font-medium">{p.phaseName}</span> — 
                        <span className={isIncrease ? 'text-red-600' : 'text-green-600'}>
                          {percentDisplay}
                        </span>
                        <br />
                        <span className="text-xs text-gray-600">
                          Giá: {adjustedPrice.toLocaleString()} VND | 
                          Slot: {p.totalslot} | 
                          {p.startDate} → {p.endDate}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePhaseFromTicket(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </Button>
                    </div>
                  );
                })}

                <div className="mt-3 p-3 bg-gray-50 rounded space-y-2">
                  <p className="text-sm font-medium text-gray-700">Thêm giai đoạn mới:</p>
                  
                  <FormInput
                    label="Tên giai đoạn"
                    value={newPhase.phaseName}
                    onChange={(val) => setNewPhase({ ...newPhase, phaseName: val })}
                    placeholder="VD: Early Bird, Standard, Late..."
                  />
                  
<div className="space-y-2">
  <label className="block text-sm font-medium">Điều chỉnh giá</label>

  <div className="flex items-end gap-3">
 {/* Input phần trăm */}
    <div className="w-24">
      <FormInput
        label=""
        type="number"
        min="0"
        max="100"
        value={newPhase.percentValue}
        onChange={(val) => setNewPhase({ ...newPhase, percentValue: Number(val) })}
        placeholder=""
      />
    </div>
    <div className="flex gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="percentType"
          value="increase"
          checked={newPhase.percentType === 'increase'}
          onChange={() => setNewPhase({ ...newPhase, percentType: 'increase' })}
          className="w-4 h-4"
        />
        <span className="text-sm text-red-600 font-medium">Tăng</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="percentType"
          value="decrease"
          checked={newPhase.percentType === 'decrease'}
          onChange={() => setNewPhase({ ...newPhase, percentType: 'decrease' })}
          className="w-4 h-4"
        />
        <span className="text-sm text-green-600 font-medium">Giảm</span>
      </label>
    </div>    
      {newTicket.ticketPrice > 0 && newPhase.percentValue > 0 && (
    <div className="text-sm bg-gray-50 p-2 rounded">
 
      <strong
        className={
          newPhase.percentType === 'increase' ? 'text-red-600' : 'text-green-600'
        }
      >
        {(
          newTicket.ticketPrice *
          (newPhase.percentType === 'increase'
            ? (100 + newPhase.percentValue) / 100
            : (100 - newPhase.percentValue) / 100)
        ).toLocaleString()}{' '}
        VND
      </strong>
      {' '}({newPhase.percentType === 'increase' ? '+' : '-'}
      {newPhase.percentValue}%)
    </div>
  )}
  </div>


</div>

                  
<div className="grid grid-cols-3 gap-3">
  <div>
    <FormInput
      label="Ngày bắt đầu "
      type="date"
      value={newPhase.startDate}
      onChange={(val) => setNewPhase({ ...newPhase, startDate: val })}
    />
    <p className="text-xs text-gray-500 mt-1"></p>
  </div>

  <FormInput
    label="Số ngày"
    type="number"
    min="1"
    value={newPhase.durationInDays}
    onChange={(val) => setNewPhase({ ...newPhase, durationInDays: Number(val) })}
  />

  <FormInput
    label="Số lượng vé"
    type="number"
    value={newPhase.totalslot}
    onChange={(val) => setNewPhase({ ...newPhase, totalslot: Number(val) })}
    placeholder={`Tối đa: ${newTicket.totalSlot - newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0)}`}
  />
</div>

                  
                  <Button 
                    size="sm" 
                    onClick={handleAddPhaseToNewTicket}
                    className="w-full"
                  >
                    + Thêm giai đoạn
                  </Button>
                </div>
              </div>

              <Button className="mt-4 w-full" onClick={handleAddTicket}>
                ✓ Thêm vé vào danh sách
              </Button>
            </div>
          </div>

          {/* STEP 3: SESSIONS */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">3. Phiên họp (Tùy chọn)</h3>
            
            <div className="space-y-2 mb-4">
              {sessions.length === 0 ? (
                <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
                  Chưa có phiên họp nào. Bạn có thể bỏ qua hoặc thêm phiên họp mới bên dưới.
                </div>
              ) : (
                sessions.map((s, idx) => {
                  const room = roomsData?.data.find(
                    (r: RoomInfoResponse) => r.roomId === s.roomId
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
                              <div className="text-sm font-medium text-gray-700">Diễn giả:</div>
                              <div className="space-y-1 mt-1">
                                {s.speaker.map((spk, spkIdx) => (
                                  <div key={spkIdx} className="text-sm text-gray-600 ml-2">
                                    • {spk.name} {spk.description && `- ${spk.description}`}
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
                              setSessions(sessions.filter((_, i) => i !== idx));
                            }}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSessions(sessions.filter((_, i) => i !== idx))}
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
              {conferenceDetail?.data?.startDate && conferenceDetail?.data?.endDate && (
                <span className="text-sm text-green-600">
                  ({new Date(conferenceDetail.data.startDate).toLocaleDateString('vi-VN')} → {new Date(conferenceDetail.data.endDate).toLocaleDateString('vi-VN')})
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
                onChange={(val) => setNewSession({ ...newSession, description: val })}
                rows={2}
              />
              <FormInput
                label="Ngày"
                type="date"
                value={newSession.date}
                onChange={(val) => setNewSession({ ...newSession, date: val })}
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
                  onChange={(val) => setNewSession({ ...newSession, timeRange: Number(val) })}
                  placeholder="VD: 2 giờ"
                  required
                />
              </div>
                    {newSession.startTime && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  ⏰ Thời gian bắt đầu: <strong>{newSession.startTime.replace("T", " ")}</strong>
                </div>
              )}

              {newSession.endTime && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  ⏰ Kết thúc lúc: <strong>{newSession.endTime.replace("T", " ")}</strong>
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

              <div className="border-t pt-3">
                <h5 className="font-medium mb-2">Diễn giả</h5>
                
                {newSession.speaker.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {newSession.speaker.map((spk, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-blue-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          {spk.image && (
                            <img 
                              src={spk.image} 
                              alt={spk.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm">{spk.name}</div>
                            {spk.description && (
                              <div className="text-xs text-gray-600">{spk.description}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNewSession({
                              ...newSession,
                              speaker: newSession.speaker.filter((_, i) => i !== idx)
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
                    onChange={(val) => setNewSpeaker({ ...newSpeaker, name: val })}
                    placeholder="VD: Nguyễn Văn A"
                  />
                  
                  <FormTextArea
                    label="Mô tả"
                    value={newSpeaker.description}
                    onChange={(val) => setNewSpeaker({ ...newSpeaker, description: val })}
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
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewSpeaker({ ...newSpeaker, image: file });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                      speaker: [...(newSession.speaker || []), newSpeaker as Speaker] 
                    });
                    
                    // Reset form
                    setNewSpeaker({ name: "", description: "", image: null });
                    toast.success("Đã thêm diễn giả!");
                  }}
                  className="w-full mt-2"
                >
                  + Thêm diễn giả
                </Button>
                </div>
              </div>

              <Button 
                onClick={handleAddSession}
                className="w-full mt-4"
              >
                ✓ Thêm phiên họp vào danh sách
              </Button>
            </div>
          </div>

          {/* STEP 4: POLICIES */}
<div className="bg-white border rounded-lg p-6 mb-6">
  <h3 className="text-lg font-semibold mb-4">4. Chính sách (Tùy chọn)</h3>
  
  {/* Phần 4.1: Chính sách chung */}
  <div className="mb-6">
    <h4 className="font-medium text-gray-700 mb-3">4.1. Chính sách chung (Tùy chọn)</h4>
    
    <div className="space-y-2 mb-4">
      {policies.length === 0 ? (
        <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
          Chưa có chính sách nào. Bạn có thể bỏ qua hoặc thêm chính sách mới bên dưới.
        </div>
      ) : (
        policies.map((p, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{p.policyName}</div>
              <div className="text-sm text-gray-600">{p.description}</div>
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
                onClick={() => setPolicies(policies.filter((_, i) => i !== idx))}
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
        onChange={(val) => setNewPolicy({ ...newPolicy, policyName: val })}
      />
      <FormTextArea
        label="Mô tả"
        value={newPolicy.description || ""}
        onChange={(val) => setNewPolicy({ ...newPolicy, description: val })}
        rows={3}
      />
      <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
    </div>
  </div>

  {/* Phần 4.2: Chính sách hoàn tiền */}
  <div className="border-t pt-6">
    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
      4.2. Chính sách hoàn tiền (Tùy chọn)
      {conferenceDetail?.data?.startDate && (
        <span className="text-sm text-blue-600">
          (Trước ngày {new Date(conferenceDetail.data.startDate).toLocaleDateString('vi-VN')})
        </span>
      )}
    </h4>
    
    <div className="space-y-2 mb-4">
      {refundPolicies.length === 0 ? (
        <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
          Chưa có chính sách hoàn tiền nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
        </div>
      ) : (
        <div className="space-y-2">
          {refundPolicies
            .sort((a, b) => a.refundOrder - b.refundOrder)
            .map((rp, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                      #{rp.refundOrder}
                    </span>
                    <span className="font-semibold text-blue-700">
                      {rp.percentRefund}% hoàn tiền
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    📅 Trước ngày: <strong>{new Date(rp.refundDeadline).toLocaleDateString('vi-VN')}</strong>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewRefundPolicy(rp);
                      setRefundPolicies(refundPolicies.filter((_, i) => i !== idx));
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setRefundPolicies(refundPolicies.filter((_, i) => i !== idx));
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
      
      <div className="grid grid-cols-3 gap-3">
        <FormInput
          label="Thứ tự"
          type="number"
          min="1"
          value={newRefundPolicy.refundOrder}
          onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, refundOrder: Number(val) })}
          placeholder="1, 2, 3..."
        />
        
        <FormInput
          label="% hoàn tiền"
          type="number"
          min="1"
          max="100"
          value={newRefundPolicy.percentRefund}
          onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, percentRefund: Number(val) })}
          placeholder="VD: 80"
        />
        
        <FormInput
          label="Hạn hoàn tiền"
          type="date"
          value={newRefundPolicy.refundDeadline}
          onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, refundDeadline: val })}
        />
      </div>

      <div className="text-xs text-gray-600 bg-white p-2 rounded">
        💡 <strong>Ví dụ:</strong> Hoàn 80% nếu hủy trước 7 ngày, 50% nếu hủy trước 3 ngày, 0% nếu hủy trong 24h.
      </div>

      <Button onClick={handleAddRefundPolicy} className="w-full">
        + Thêm chính sách hoàn tiền
      </Button>
    </div>
  </div>
</div>

          {/* STEP 5: MEDIA */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">5. Media (Tùy chọn)</h3>
            
            <div className="space-y-2 mb-4">
              {mediaList.map((m, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
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
                    onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
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
          </div>

          {/* STEP 6: SPONSORS */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">6. Nhà tài trợ (Tùy chọn)</h3>
            
            <div className="space-y-2 mb-4">

{existingSponsorUrls.map((s, idx) => (
  <div key={s.sponsorId} className="p-3 bg-gray-50 rounded flex justify-between items-center">
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
        <div className="text-sm text-gray-600">Logo hiện tại</div>
      </div>
    </div>
    <Button
      size="sm"
      variant="destructive"
      onClick={() => {
        setExistingSponsorUrls(existingSponsorUrls.filter((_, i) => i !== idx));
        toast.success("Đã xóa nhà tài trợ!");
      }}
    >
      Xóa
    </Button>
  </div>
))}


              {sponsors.map((s, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
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
                      onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))}
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
                onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo Nhà tài trợ
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewSponsor({
                      ...newSponsor,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleAddSponsor}>Thêm nhà tài trợ</Button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="bg-white border rounded-lg p-6">
            <Button onClick={handleFinalSubmit} >
              {isSubmitting 
                ? "Đang cập nhật..." 
                : conferenceId 
                  ? "💾 Lưu thay đổi" 
                  : "🎉 Hoàn thành & Tạo hội thảo"
              }
            </Button>

          </div>
        </>
      )}
    </div>
  );
}

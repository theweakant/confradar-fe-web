
"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  useCreateBasicConferenceMutation,
  useCreateConferencePriceMutation,
  useCreateConferenceSessionsMutation,
  useCreateConferencePoliciesMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
} from "@/redux/services/conferenceStep.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";

import type { ApiError } from "@/types/api.type";

import {
  setConferenceId,
  setConferenceBasicData,
  resetWizard,
} from "@/redux/slices/conferenceStep.slice";
import type {
  ConferenceBasicForm,
  ConferencePriceData,
  Phase,
  Ticket,
  Session,
  Speaker,
  Policy,
  Media,
  Sponsor,
  RoomInfoResponse,
  ConferenceSessionData
} from "@/types/conference.type";
import { toast } from "sonner";


import {formatDate} from "@/helper/format"

const TARGET_OPTIONS = [
  { value: "Học sinh", label: "Học sinh" },
  { value: "Sinh viên", label: "Sinh viên" },
  { value: "Chuyên gia", label: "Chuyên gia" },
  { value: "Nhà đầu tư", label: "Nhà đầu tư" },
  { value: "Khác", label: "Khác" },
];

export default function CreateConferenceStepPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { conferenceId: reduxConferenceId, conferenceBasicData } = useAppSelector(
    (state) => state.conferenceStep
  );

  const conferenceId = reduxConferenceId;

  const [createBasic] = useCreateBasicConferenceMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createSessions] = useCreateConferenceSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();

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

  // Handle Step 1 Submit
  const handleBasicSubmit = async () => {
    if (!validateBasicForm()) return;

    try {
      setIsSubmitting(true);
      const result = await createBasic(basicForm).unwrap();
      const confId = result.data.conferenceId;

      dispatch(setConferenceId(confId));
      dispatch(setConferenceBasicData(result.data));
      setBasicFormCompleted(true);
      
      toast.success("Tạo thông tin cơ bản thành công! Vui lòng điền các thông tin còn lại.");
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create basic info:", error);
      toast.error(apiError?.data?.Message || "Tạo thông tin cơ bản thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Final Submit (All Steps)
  const handleFinalSubmit = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return;
    }

    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 2: Price
      const priceData: ConferencePriceData = {
        typeOfTicket: tickets.map(ticket => ({
          ticketPrice: parseFloat(ticket.ticketPrice.toFixed(2)),
          ticketName: ticket.ticketName,
          ticketDescription: ticket.ticketDescription,
          isAuthor: ticket.isAuthor ?? false,
          totalSlot: ticket.totalSlot,
          phases: (ticket.phases || []).map(phase => ({
            phaseName: phase.phaseName,
            applyPercent: parseFloat(phase.applyPercent.toFixed(2)),
            startDate: phase.startDate,
            endDate: phase.endDate,
            totalslot: phase.totalslot
          }))
        }))
      };

      // Step 3: Sessions
const formattedSessions = sessions.map((s) => {
  const startDateTime = new Date(s.startTime);
  const endDateTime = new Date(s.endTime);
  
  const startTime = startDateTime.toTimeString().slice(0, 8); 
  const endTime = endDateTime.toTimeString().slice(0, 8);    
  
  // Validate duration (ít nhất 30 phút)
  const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
  if (durationMinutes < 30) {
    console.warn(`Session "${s.title}" duration is ${durationMinutes} minutes (< 30 min)`);
  }
  
  return {
    title: s.title,
    description: s.description,
    date: s.date,
    startTime: startTime,
    endTime: endTime,
    roomId: s.roomId,
    speaker: s.speaker.map(sp => ({
      name: sp.name,
      description: sp.description,
      image: sp.image instanceof File ? sp.image : undefined,
      imageUrl: typeof sp.image === 'string' ? sp.image : undefined,
    })),
    sessionMedias: (s.sessionMedias || []).map(media => ({
      mediaFile: media.mediaFile instanceof File ? media.mediaFile : undefined,
      mediaUrl: typeof media.mediaFile === 'string' ? media.mediaFile : undefined,
    })),
  };
});
      const sessionData: ConferenceSessionData = { sessions: formattedSessions };

      // Execute all API calls
      await Promise.all([
        createPrice({ conferenceId, data: priceData }).unwrap(),
        sessions.length > 0 ? createSessions({ conferenceId, data: sessionData }).unwrap() : Promise.resolve(),
        policies.length > 0 ? createPolicies({ conferenceId, data: { policies } }).unwrap() : Promise.resolve(),
        mediaList.length > 0 ? createMedia({ conferenceId, data: { media: mediaList } }).unwrap() : Promise.resolve(),
        sponsors.length > 0 ? createSponsors({ conferenceId, data: { sponsors } }).unwrap() : Promise.resolve(),
      ]);

      toast.success("Tạo hội thảo thành công!");
      dispatch(resetWizard());
      router.push(`/workspace/collaborator/manage-conference`);
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create conference:", error);
      toast.error(apiError?.data?.Message || "Tạo hội thảo thất bại!");
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

  if (!conferenceBasicData?.ticketSaleStart || !conferenceBasicData?.ticketSaleEnd) {
    toast.error("Không tìm thấy thông tin thời gian bán vé!");
    return;
  }

  const saleStart = new Date(conferenceBasicData.ticketSaleStart);
  const saleEnd = new Date(conferenceBasicData.ticketSaleEnd);
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

  if (!conferenceBasicData?.startDate || !conferenceBasicData?.endDate) {
    toast.error("Không tìm thấy thông tin thời gian sự kiện!");
    return;
  }

  const confStart = new Date(conferenceBasicData.startDate);
  const confEnd = new Date(conferenceBasicData.endDate);
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
        <h1 className="text-2xl font-bold text-gray-900">Tạo hội thảo mới</h1>
        <p className="text-gray-600 mt-1">Điền đầy đủ thông tin để tạo hội thảo</p>
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
          {basicFormCompleted && (
            <span className="text-sm text-green-600 font-medium">✓ Đã hoàn thành</span>
          )}
        </div>

        <div className="space-y-4">
          <FormInput
            label="Tên hội thảo"
            name="conferenceName"
            value={basicForm.conferenceName}
            onChange={(val) => setBasicForm({ ...basicForm, conferenceName: val })}
            required
            disabled={basicFormCompleted}
          />
          <FormTextArea
            label="Mô tả"
            value={basicForm.description ?? ""}
            onChange={(val) => setBasicForm({ ...basicForm, description: val })}
            rows={3}
            disabled={basicFormCompleted}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={basicForm.startDate}
              onChange={(val) => setBasicForm({ ...basicForm, startDate: val })}
              required
              disabled={basicFormCompleted}
            />
            <FormInput
              label="Số ngày diễn ra"
              name="dateRange"
              type="number"
              min="1"
              value={basicForm.dateRange}
              onChange={(val) => setBasicForm({ ...basicForm, dateRange: Number(val) })}
              required
              placeholder="VD: 3 ngày"
              disabled={basicFormCompleted}
            />
          </div>

          {basicForm.endDate && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              📅 Ngày kết thúc: <strong>{new Date(basicForm.endDate).toLocaleDateString('vi-VN')}</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày bắt đầu bán vé"
              type="date"
              value={basicForm.ticketSaleStart}
              onChange={(val) => setBasicForm({ ...basicForm, ticketSaleStart: val })}
              required
              disabled={basicFormCompleted}
            />
            <FormInput
              label="Số ngày bán vé"
              type="number"
              min="1"
              value={basicForm.ticketSaleDuration}
              onChange={(val) => setBasicForm({ ...basicForm, ticketSaleDuration: Number(val) })}
              required
              placeholder="VD: 30 ngày"
              disabled={basicFormCompleted}
            />
          </div>

          {basicForm.ticketSaleEnd && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              📅 Ngày kết thúc bán vé: <strong>{new Date(basicForm.ticketSaleEnd).toLocaleDateString('vi-VN')}</strong>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-1">
            💡 Thời gian bán vé phải trước ngày bắt đầu sự kiện
          </p>

{/* Sức chứa + Danh mục */}
<div className="grid grid-cols-2 gap-4">
  <FormInput
    label="Sức chứa"
    name="totalSlot"
    type="number"
    value={basicForm.totalSlot}
    onChange={(val) => setBasicForm({ ...basicForm, totalSlot: Number(val) })}
    disabled={basicFormCompleted}
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
    disabled={basicFormCompleted}
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
    disabled={basicFormCompleted}
  />
  {basicForm.targetAudienceTechnicalConference === "Khác" && (
    <FormInput
      label="Nhập đối tượng khác"
      value={basicForm.customTarget || ""}
      onChange={(val) => setBasicForm({ ...basicForm, customTarget: val })}
      disabled={basicFormCompleted}
    />
  )}
</div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Image (1 ảnh)</label>
            {basicForm.bannerImageFile && (
              <div className="relative inline-block mt-2">
                <img
                  src={URL.createObjectURL(basicForm.bannerImageFile)}
                  alt="Preview"
                  className="h-32 object-cover rounded border"
                />
                {!basicFormCompleted && (
                  <button
                    type="button"
                    onClick={() => setBasicForm({ ...basicForm, bannerImageFile: null })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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

          {!basicFormCompleted && (
            <Button
              onClick={handleBasicSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Đang lưu..." : "Tạo thông tin cơ bản để tiếp tục"}
            </Button>
          )}
        </div>
      </div>

      {/* REMAINING STEPS - Only show after Step 1 is completed */}
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
    <div key={t.ticketId || idx} className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="font-semibold text-lg text-blue-700">
            {formatDate(t.phases?.[0]?.startDate)} - {formatDate(t.phases?.[t.phases.length - 1]?.endDate)}
          </div>
          <div className="text-sm text-gray-500">{t.ticketName}</div>
        </div>
      </div>

      {/* Price and Details */}
      <div className="flex items-center justify-between border-t pt-3">
        <div>
          <div className="font-semibold text-sm text-gray-800">{t.ticketName}</div>
          <div className="text-xs text-gray-500">Slot: {t.totalSlot}</div>
        </div>
        <div className="text-right text-blue-600 font-semibold">
          {t.ticketPrice.toLocaleString()} VND
        </div>
      </div>

      {/* Phases */}
      {t.phases && t.phases.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium text-gray-600 mb-2">
            Giai đoạn giá ({t.phases.length}):
          </div>

          {t.phases.map((p, pi) => {
            const isIncrease = p.applyPercent > 100;
            const percentDisplay = isIncrease 
              ? `+${p.applyPercent - 100}%` 
              : `-${100 - p.applyPercent}%`;

            return (
              <div key={pi} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded mb-1">
                <div>
                  <div className="text-sm font-medium text-gray-700">{p.phaseName}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(p.startDate)} - {formatDate(p.endDate)}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <span className="text-gray-500 mr-2">Slot: {p.totalslot}</span>
                  <span className={`font-semibold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                    {percentDisplay}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setTickets(tickets.filter((_, i) => i !== idx))}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold"
        >
          Xóa vé
        </Button>
      </div>
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
                  {conferenceBasicData?.ticketSaleStart && conferenceBasicData?.ticketSaleEnd && (
                    <span className="text-sm text-blue-600">
                      ({new Date(conferenceBasicData.ticketSaleStart).toLocaleDateString('vi-VN')} → {new Date(conferenceBasicData.ticketSaleEnd).toLocaleDateString('vi-VN')})
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
              {conferenceBasicData?.startDate && conferenceBasicData?.endDate && (
                <span className="text-sm text-green-600">
                  ({new Date(conferenceBasicData.startDate).toLocaleDateString('vi-VN')} → {new Date(conferenceBasicData.endDate).toLocaleDateString('vi-VN')})
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
              <h4 className="font-medium">Thêm chính sách</h4>
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
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || tickets.length === 0}
              className="w-full bg-green-600 text-white hover:bg-green-700 h-12 text-lg font-semibold"
            >
              {isSubmitting ? "Đang tạo hội thảo..." : "🎉 Hoàn thành & Tạo hội thảo"}
            </Button>
            {tickets.length === 0 && (
              <p className="text-sm text-red-600 text-center mt-2">
                * Vui lòng thêm ít nhất 1 loại vé để hoàn thành
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
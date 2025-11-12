
// "use client";
// import { useRouter } from "next/navigation";

// import { X } from "lucide-react";
// import { useState, useEffect } from "react";
// import { DatePickerInput } from "@/components/atoms/DatePickerInput";
// import { Button } from "@/components/ui/button";
// import { FormInput } from "@/components/molecules/FormInput";
// import { FormSelect } from "@/components/molecules/FormSelect";
// import { FormTextArea } from "@/components/molecules/FormTextArea";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
// import {
//   useCreateBasicConferenceMutation,
//   useCreateConferencePriceMutation,
//   useCreateConferenceSessionsMutation,
//   useCreateConferencePoliciesMutation,
//   useCreateRefundPoliciesMutation,
//   useCreateConferenceMediaMutation,
//   useCreateConferenceSponsorsMutation,
// } from "@/redux/services/conferenceStep.service";

// import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
// import { useGetAllRoomsQuery } from "@/redux/services/room.service";
// import { useGetAllCitiesQuery } from "@/redux/services/city.service";

// import type { ApiError } from "@/types/api.type";

// import {
//   setConferenceId,
//   setConferenceBasicData,
//   resetWizard,
//   markStepCompleted,
//   nextStep,
//   prevStep,
//   setMode,
//   goToStep,
// } from "@/redux/slices/conferenceStep.slice";
// import type {
//   ConferenceBasicForm,
//   ConferencePriceData,
//   Phase,
//   Ticket,
//   Session,
//   Speaker,
//   Policy,
//   RefundPolicy,
//   Media,
//   Sponsor,
//   RoomInfoResponse,
//   ConferenceSessionData,
// } from "@/types/conference.type";
// import { toast } from "sonner";

// import { ImageUpload } from "@/components/atoms/ImageUpload";
// import {
//   formatDate,
//   formatCurrency,
//   formatTimeDate,
//   parseDate,
//   formatDateToAPI,
// } from "@/helper/format";

// const TARGET_OPTIONS = [
//   { value: "Học sinh", label: "Học sinh" },
//   { value: "Sinh viên", label: "Sinh viên" },
//   { value: "Chuyên gia", label: "Chuyên gia" },
//   { value: "Nhà đầu tư", label: "Nhà đầu tư" },
//   { value: "Khác", label: "Khác" },
// ];

// export default function CreateConferenceStepPage() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { conferenceId: reduxConferenceId } = useAppSelector(
//     (state) => state.conferenceStep,
//   );

//   const conferenceId = reduxConferenceId;

//   const [createBasic] = useCreateBasicConferenceMutation();
//   const [createPrice] = useCreateConferencePriceMutation();
//   const [createSessions] = useCreateConferenceSessionsMutation();
//   const [createPolicies] = useCreateConferencePoliciesMutation();
//   const [createRefundPolicies] = useCreateRefundPoliciesMutation();
//   const [createMedia] = useCreateConferenceMediaMutation();
//   const [createSponsors] = useCreateConferenceSponsorsMutation();

//   const { data: categoriesData, isLoading: isCategoriesLoading } =
//     useGetAllCategoriesQuery();
//   const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
//   const { data: citiesData, isLoading: isCitiesLoading } =
//     useGetAllCitiesQuery();

//   const categoryOptions =
//     categoriesData?.data?.map((category) => ({
//       value: category.conferenceCategoryId,
//       label: category.conferenceCategoryName,
//     })) || [];

//   const roomOptions =
//     roomsData?.data?.map((room) => ({
//       value: room.roomId,
//       label: `${room.number} - ${room.displayName} - ${room.destinationId}`,
//     })) || [];

//   const cityOptions =
//     citiesData?.data?.map((city) => ({
//       value: city.cityId,
//       label: city.cityName || "N/A",
//     })) || [];

//   const currentStep = useAppSelector(
//     (state) => state.conferenceStep.currentStep,
//   );
//   const completedSteps = useAppSelector(
//     (state) => state.conferenceStep.completedSteps,
//   );
//   const mode = useAppSelector((state) => state.conferenceStep.mode);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
//   const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

//   //realtime error
//   const [validationErrors, setValidationErrors] = useState<{
//     conferenceName?: string;
//     startDate?: string;
//     dateRange?: string;
//     totalSlot?: string;
//     ticketSaleStart?: string;
//     ticketSaleDuration?: string;
//     address?: string;
//     cityId?: string;
//     conferenceCategoryId?: string;
//     ticketName?: string;
//     ticketPrice?: string;
//     ticketTotalSlot?: string;
//     phaseName?: string;
//     phaseStartDate?: string;
//     phaseDuration?: string;
//     phaseSlot?: string;
//     sessionTitle?: string;
//     sessionDate?: string;
//     sessionTimeRange?: string;
//     refundPercent?: string;
//     refundDeadline?: string;
//     refundOrder?: string;
//   }>({});

//   // Validation warnings state
//   const [validationWarnings, setValidationWarnings] = useState<{
//     ticketPrice?: string;
//     ticketSaleStart?: string;
//   }>({});

//   const clearError = (field: keyof typeof validationErrors) => {
//     setValidationErrors(prev => {
//       const newErrors = { ...prev };
//       delete newErrors[field];
//       return newErrors;
//     });
//   };

//   const setError = (field: keyof typeof validationErrors, message: string) => {
//     setValidationErrors(prev => ({ ...prev, [field]: message }));
//   };

//   const clearWarning = (field: keyof typeof validationWarnings) => {
//     setValidationWarnings(prev => {
//       const newWarnings = { ...prev };
//       delete newWarnings[field];
//       return newWarnings;
//     });
//   };

//   const setWarning = (field: keyof typeof validationWarnings, message: string) => {
//     setValidationWarnings(prev => ({ ...prev, [field]: message }));
//   };

//   // Step 1: Basic Info
//   const [basicForm, setBasicForm] = useState<ConferenceBasicForm>({
//     conferenceName: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     dateRange: 1,
//     totalSlot: 0,
//     address: "",
//     bannerImageFile: null,
//     isInternalHosted: false,
//     isResearchConference: false,
//     conferenceCategoryId: "",
//     cityId: "",
//     ticketSaleStart: "",
//     ticketSaleEnd: "",
//     ticketSaleDuration: 0,
//     createdby: "",
//     targetAudienceTechnicalConference: "",
//   });



//   useEffect(() => {
//     dispatch(setMode("create"));
//     dispatch(goToStep(1));

//     return () => {
//       dispatch(resetWizard());
//     };
//   }, [dispatch]);

//   //realtime validation
//   // Validation Functions
//   const validateConferenceName = (value: string) => {
//     if (!value.trim()) {
//       setError('conferenceName', 'Tên hội thảo không được để trống');
//       return false;
//     }
//     if (value.trim().length < 10) {
//       setError('conferenceName', 'Tên hội thảo phải có ít nhất 10 ký tự');
//       return false;
//     }
//     if (value.trim().length > 200) {
//       setError('conferenceName', 'Tên hội thảo không được vượt quá 200 ký tự');
//       return false;
//     }
//     clearError('conferenceName');
//     return true;
//   };

//   const validateDateRange = (value: number) => {
//     if (value < 1) {
//       setError('dateRange', 'Số ngày phải lớn hơn 0');
//       return false;
//     }
//     if (value > 365) {
//       setError('dateRange', 'Số ngày không được vượt quá 365');
//       return false;
//     }
//     clearError('dateRange');
//     return true;
//   };

//   const validateTotalSlot = (value: number) => {
//     if (value < 1) {
//       setError('totalSlot', 'Sức chứa phải lớn hơn 0');
//       return false;
//     }
//     if (value > 100000) {
//       setError('totalSlot', 'Sức chứa không được vượt quá 100,000');
//       return false;
//     }
//     clearError('totalSlot');
//     return true;
//   };

//   const validateTicketSaleStart = (saleStart: string, eventStart: string) => {
//     if (!saleStart) {
//       setError('ticketSaleStart', 'Vui lòng chọn ngày bắt đầu bán vé');
//       return false;
//     }
//     if (!eventStart) {
//       clearError('ticketSaleStart');
//       clearWarning('ticketSaleStart');
//       return true;
//     }

//     const saleDate = new Date(saleStart);
//     const eventDate = new Date(eventStart);

//     if (saleDate >= eventDate) {
//       setError('ticketSaleStart', 'Ngày bán vé phải trước ngày sự kiện');
//       clearWarning('ticketSaleStart');
//       return false;
//     }

//     const daysDiff = Math.floor((eventDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
//     if (daysDiff < 7) {
//       clearError('ticketSaleStart');
//       setWarning('ticketSaleStart', 'Khuyến nghị: Nên bán vé trước ít nhất 7 ngày');
//       return true;
//     }

//     clearError('ticketSaleStart');
//     clearWarning('ticketSaleStart');
//     return true;
//   };

//   const validateTicketSaleDuration = (duration: number, saleStart: string, eventStart: string) => {
//     if (duration < 1) {
//       setError('ticketSaleDuration', 'Thời gian bán vé phải ít nhất 1 ngày');
//       return false;
//     }

//     if (saleStart && eventStart) {
//       const saleStartDate = new Date(saleStart);
//       const saleEndDate = new Date(saleStartDate);
//       saleEndDate.setDate(saleEndDate.getDate() + duration - 1);
//       const eventStartDate = new Date(eventStart);

//       if (saleEndDate >= eventStartDate) {
//         setError('ticketSaleDuration', 'Ngày kết thúc bán vé phải trước ngày sự kiện');
//         return false;
//       }
//     }

//     clearError('ticketSaleDuration');
//     return true;
//   };

//   const validateTicketName = (value: string, existingTickets: Ticket[] = []) => {
//     if (!value.trim()) {
//       setError('ticketName', 'Tên vé không được để trống');
//       return false;
//     }
//     if (value.trim().length < 3) {
//       setError('ticketName', 'Tên vé phải có ít nhất 3 ký tự');
//       return false;
//     }

//     const isDuplicate = existingTickets.some(t =>
//       t.ticketName.toLowerCase() === value.trim().toLowerCase()
//     );
//     if (isDuplicate) {
//       setError('ticketName', 'Tên vé đã tồn tại');
//       return false;
//     }

//     clearError('ticketName');
//     return true;
//   };

//   const validateTicketPrice = (value: number) => {
//     if (value <= 0) {
//       setError('ticketPrice', 'Giá vé phải lớn hơn 0');
//       clearWarning('ticketPrice');
//       return false;
//     }
//     if (value > 100000000) {
//       setError('ticketPrice', 'Giá vé không hợp lệ (tối đa 100 triệu)');
//       clearWarning('ticketPrice');
//       return false;
//     }

//     clearError('ticketPrice');

//     if (value < 10000) {
//       setWarning('ticketPrice', 'Giá vé thấp hơn mức khuyến nghị (10,000 VND)');
//       return true;
//     }

//     clearWarning('ticketPrice');
//     return true;
//   };

//   const validateTicketTotalSlot = (value: number, conferenceMaxSlot: number) => {
//     if (value <= 0) {
//       setError('ticketTotalSlot', 'Số lượng vé phải lớn hơn 0');
//       return false;
//     }
//     if (value > conferenceMaxSlot) {
//       setError('ticketTotalSlot', `Số lượng vượt quá sức chứa (${conferenceMaxSlot})`);
//       return false;
//     }
//     clearError('ticketTotalSlot');
//     return true;
//   };

//   const validatePhaseName = (value: string, existingPhases: Phase[] = []) => {
//     if (!value.trim()) {
//       setError('phaseName', 'Tên giai đoạn không được để trống');
//       return false;
//     }

//     const isDuplicate = existingPhases.some(p =>
//       p.phaseName.toLowerCase() === value.trim().toLowerCase()
//     );
//     if (isDuplicate) {
//       setError('phaseName', 'Tên giai đoạn đã tồn tại');
//       return false;
//     }

//     clearError('phaseName');
//     return true;
//   };

//   const validatePhaseStartDate = (
//     startDate: string,
//     saleStart: string,
//     saleEnd: string
//   ) => {
//     if (!startDate) {
//       setError('phaseStartDate', 'Vui lòng chọn ngày bắt đầu');
//       return false;
//     }

//     const phaseStart = new Date(startDate);
//     const ticketSaleStart = new Date(saleStart);
//     const ticketSaleEnd = new Date(saleEnd);

//     if (phaseStart < ticketSaleStart || phaseStart > ticketSaleEnd) {
//       setError('phaseStartDate',
//         `Phải trong khoảng ${ticketSaleStart.toLocaleDateString('vi-VN')} - ${ticketSaleEnd.toLocaleDateString('vi-VN')}`
//       );
//       return false;
//     }

//     clearError('phaseStartDate');
//     return true;
//   };

//   const validatePhaseDuration = (duration: number, startDate: string, saleEnd: string) => {
//     if (duration < 1) {
//       setError('phaseDuration', 'Thời gian phải ít nhất 1 ngày');
//       return false;
//     }

//     if (startDate && saleEnd) {
//       const start = new Date(startDate);
//       const end = new Date(start);
//       end.setDate(start.getDate() + duration - 1);
//       const maxEnd = new Date(saleEnd);

//       if (end > maxEnd) {
//         setError('phaseDuration', 'Giai đoạn vượt quá thời gian bán vé');
//         return false;
//       }
//     }

//     clearError('phaseDuration');
//     return true;
//   };

//   const validatePhaseSlot = (slot: number, ticketTotal: number, usedSlots: number) => {
//     if (slot <= 0) {
//       setError('phaseSlot', 'Số lượng phải lớn hơn 0');
//       return false;
//     }

//     const remaining = ticketTotal - usedSlots;
//     if (slot > remaining) {
//       setError('phaseSlot', `Chỉ còn ${remaining} slot khả dụng`);
//       return false;
//     }

//     clearError('phaseSlot');
//     return true;
//   };

//   const validateSessionTitle = (value: string) => {
//     if (!value.trim()) {
//       setError('sessionTitle', 'Tiêu đề không được để trống');
//       return false;
//     }
//     if (value.trim().length < 5) {
//       setError('sessionTitle', 'Tiêu đề phải có ít nhất 5 ký tự');
//       return false;
//     }
//     clearError('sessionTitle');
//     return true;
//   };

//   const validateSessionDate = (date: string, eventStart: string, eventEnd: string) => {
//     if (!date) {
//       setError('sessionDate', 'Vui lòng chọn ngày');
//       return false;
//     }

//     const sessionDate = new Date(date);
//     const confStart = new Date(eventStart);
//     const confEnd = new Date(eventEnd);

//     sessionDate.setHours(0, 0, 0, 0);
//     confStart.setHours(0, 0, 0, 0);
//     confEnd.setHours(0, 0, 0, 0);

//     if (sessionDate < confStart || sessionDate > confEnd) {
//       setError('sessionDate',
//         `Phải trong khoảng ${confStart.toLocaleDateString('vi-VN')} - ${confEnd.toLocaleDateString('vi-VN')}`
//       );
//       return false;
//     }

//     clearError('sessionDate');
//     return true;
//   };

//   const validateSessionTimeRange = (range: number) => {
//     if (range < 0.5) {
//       setError('sessionTimeRange', 'Thời lượng phải ít nhất 0.5 giờ');
//       return false;
//     }
//     if (range > 12) {
//       setError('sessionTimeRange', 'Thời lượng không quá 12 giờ');
//       return false;
//     }
//     clearError('sessionTimeRange');
//     return true;
//   };

//   const validateRefundPercent = (percent: number) => {
//     if (percent <= 0 || percent > 100) {
//       setError('refundPercent', 'Phần trăm phải từ 1-100%');
//       return false;
//     }
//     clearError('refundPercent');
//     return true;
//   };

//   const validateRefundDeadline = (deadline: string, eventStart: string) => {
//     if (!deadline) {
//       setError('refundDeadline', 'Vui lòng chọn hạn hoàn tiền');
//       return false;
//     }

//     const refundDate = new Date(deadline);
//     const eventDate = new Date(eventStart);

//     if (refundDate >= eventDate) {
//       setError('refundDeadline', 'Hạn phải trước ngày sự kiện');
//       return false;
//     }

//     clearError('refundDeadline');
//     return true;
//   };

//   const validateRefundOrder = (order: number, existingPolicies: RefundPolicy[]) => {
//     if (order < 1) {
//       setError('refundOrder', 'Thứ tự phải lớn hơn 0');
//       return false;
//     }

//     const isDuplicate = existingPolicies.some(p => p.refundOrder === order);
//     if (isDuplicate) {
//       setError('refundOrder', 'Thứ tự đã tồn tại');
//       return false;
//     }

//     clearError('refundOrder');
//     return true;
//   };

//   useEffect(() => {
//     if (basicForm.startDate && basicForm.dateRange && basicForm.dateRange > 0) {
//       const start = new Date(basicForm.startDate);
//       const end = new Date(start);
//       end.setDate(start.getDate() + basicForm.dateRange - 1);
//       const endDate = end.toISOString().split("T")[0];
//       setBasicForm((prev) => ({ ...prev, endDate }));
//     }
//   }, [basicForm.startDate, basicForm.dateRange]);

//   useEffect(() => {
//     if (
//       basicForm.ticketSaleStart &&
//       basicForm.ticketSaleDuration &&
//       basicForm.ticketSaleDuration > 0
//     ) {
//       const start = new Date(basicForm.ticketSaleStart);
//       const end = new Date(start);
//       end.setDate(start.getDate() + basicForm.ticketSaleDuration - 1);
//       const ticketSaleEnd = end.toISOString().split("T")[0];
//       setBasicForm((prev) => ({ ...prev, ticketSaleEnd }));
//     }
//   }, [basicForm.ticketSaleStart, basicForm.ticketSaleDuration]);

//   // Step 2: Price
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [newTicket, setNewTicket] = useState<Omit<Ticket, "ticketId">>({
//     ticketPrice: 0,
//     ticketName: "",
//     ticketDescription: "",
//     isAuthor: false,
//     totalSlot: 0,
//     phases: [],
//   });
//   const [newPhase, setNewPhase] = useState<{
//     phaseName: string;
//     percentValue: number;
//     percentType: "increase" | "decrease";
//     startDate: string;
//     durationInDays: number;
//     totalslot: number;
//   }>({
//     phaseName: "",
//     percentValue: 0,
//     percentType: "increase",
//     startDate: basicForm.ticketSaleStart,
//     durationInDays: 1,
//     totalslot: 0,
//   });
//   const [editingPhase, setEditingPhase] = useState<{
//     ticketIndex: number;
//     phaseIndex: number;
//     data: Phase;
//   } | null>(null);
//   const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
//   const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(
//     null,
//   );

//   // Step 3: Sessions
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [newSession, setNewSession] = useState<Session>({
//     title: "",
//     description: "",
//     startTime: "",
//     endTime: "",
//     date: "",
//     timeRange: 1,
//     roomId: "",
//     speaker: [],
//     sessionMedias: [],
//   });
//   const [newSpeaker, setNewSpeaker] = useState<
//     Omit<Speaker, "image"> & { image: File | null }
//   >({
//     name: "",
//     description: "",
//     image: null,
//   });

//   useEffect(() => {
//     if (
//       newSession.startTime &&
//       newSession.timeRange &&
//       newSession.timeRange > 0
//     ) {
//       const start = new Date(newSession.startTime);
//       const end = new Date(start);
//       end.setHours(end.getHours() + Number(newSession.timeRange));

//       const formattedEnd = end
//         .toLocaleString("sv-SE")
//         .replace(" ", "T")
//         .slice(0, 16);

//       setNewSession((prev) => ({ ...prev, endTime: formattedEnd }));
//     }
//   }, [newSession.startTime, newSession.timeRange]);

//   // Step 4: Policies
//   const [policies, setPolicies] = useState<Policy[]>([]);
//   const [newPolicy, setNewPolicy] = useState<Policy>({
//     policyName: "",
//     description: "",
//   });

//   const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
//   const [newRefundPolicy, setNewRefundPolicy] = useState<
//     Omit<RefundPolicy, "refundPolicyId">
//   >({
//     percentRefund: 0,
//     refundDeadline: "",
//     refundOrder: 1,
//   });

//   // Step 5: Media
//   const [mediaList, setMediaList] = useState<Media[]>([]);
//   const [newMedia, setNewMedia] = useState<Media>({ mediaFile: null });

//   // Step 6: Sponsors
//   const [sponsors, setSponsors] = useState<Sponsor[]>([]);
//   const [newSponsor, setNewSponsor] = useState<Sponsor>({
//     name: "",
//     imageFile: null,
//   });
//   const [resetSponsorUpload, setResetSponsorUpload] = useState(false);

//   // Validate Step 1
//   const validateBasicForm = (): boolean => {
//     const saleStart = new Date(basicForm.ticketSaleStart);
//     const saleEnd = new Date(basicForm.ticketSaleEnd);
//     const eventStart = new Date(basicForm.startDate);

//     if (saleStart >= eventStart || saleEnd >= eventStart) {
//       toast.error("Hãy chọn ngày bán vé trước ngày bắt đầu sự kiện");
//       return false;
//     }
//     if (!basicForm.conferenceName.trim()) {
//       toast.error("Vui lòng nhập tên hội thảo!");
//       return false;
//     }
//     if (!basicForm.startDate || !basicForm.endDate) {
//       toast.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
//       return false;
//     }
//     if (!basicForm.conferenceCategoryId) {
//       toast.error("Vui lòng chọn danh mục!");
//       return false;
//     }
//     return true;
//   };

//   // Handle Step 1 Submit
//   const handleBasicSubmit = async () => {
//     if (!validateBasicForm()) return;

//     try {
//       setIsSubmitting(true);
//       const result = await createBasic(basicForm).unwrap();
//       const confId = result.data.conferenceId;

//       dispatch(setConferenceId(confId));
//       dispatch(setConferenceBasicData(result.data));
//       dispatch(markStepCompleted(1));
//       dispatch(nextStep());

//       toast.success("Tạo thông tin cơ bản thành công!");
//     } catch (error) {
//       const apiError = error as { data?: ApiError };
//       console.error("Failed to create basic info:", error);
//       toast.error(apiError?.data?.message || "Tạo thông tin cơ bản thất bại!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Thêm handler cho step 2 (Price)
//   const handlePriceSubmit = async () => {
//     if (!conferenceId) {
//       toast.error("Không tìm thấy conference ID!");
//       return;
//     }

//     if (tickets.length === 0) {
//       toast.error("Vui lòng thêm ít nhất 1 loại vé!");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       const priceData: ConferencePriceData = {
//         typeOfTicket: tickets.map((ticket) => ({
//           ticketPrice: parseFloat(ticket.ticketPrice.toFixed(2)),
//           ticketName: ticket.ticketName,
//           ticketDescription: ticket.ticketDescription,
//           isAuthor: ticket.isAuthor ?? false,
//           totalSlot: ticket.totalSlot,
//           phases: (ticket.phases || []).map((phase) => ({
//             phaseName: phase.phaseName,
//             applyPercent: parseFloat(phase.applyPercent.toFixed(2)),
//             startDate: phase.startDate,
//             endDate: phase.endDate,
//             totalslot: phase.totalslot,
//           })),
//         })),
//       };

//       await createPrice({ conferenceId, data: priceData }).unwrap();

//       dispatch(markStepCompleted(2));
//       dispatch(nextStep());
//       toast.success("Lưu thông tin giá vé thành công!");
//     } catch (error) {
//       const apiError = error as { data?: ApiError };
//       console.error("Failed to create price:", error);
//       toast.error(apiError?.data?.message || "Lưu giá vé thất bại!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSessionsSubmit = async () => {
//     if (!conferenceId) {
//       toast.error("Không tìm thấy conference ID!");
//       return;
//     }

//     if (sessions.length === 0) {
//       dispatch(markStepCompleted(3));
//       dispatch(nextStep());
//       toast.info("Đã bỏ qua phần phiên họp");
//       return;
//     }

//     const eventStartDate = basicForm.startDate;
//     const eventEndDate = basicForm.endDate;

//     if (!eventStartDate || !eventEndDate) {
//       toast.error("Thiếu thông tin ngày bắt đầu/kết thúc sự kiện!");
//       return;
//     }

//     const hasSessionOnStartDay = sessions.some(
//       (s) => s.date === eventStartDate,
//     );
//     const hasSessionOnEndDay = sessions.some((s) => s.date === eventEndDate);

//     if (!hasSessionOnStartDay || !hasSessionOnEndDay) {
//       toast.error(
//         "Phải có ít nhất 1 phiên họp vào ngày bắt đầu và 1 phiên họp vào ngày kết thúc hội thảo!",
//       );
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       const formattedSessions = sessions.map((s) => {
//         const startDateTime = new Date(s.startTime);
//         const endDateTime = new Date(s.endTime);
//         const startTime = startDateTime.toTimeString().slice(0, 8);
//         const endTime = endDateTime.toTimeString().slice(0, 8);

//         return {
//           title: s.title,
//           description: s.description,
//           date: s.date,
//           startTime: startTime,
//           endTime: endTime,
//           roomId: s.roomId,
//           speaker: s.speaker.map((sp) => ({
//             name: sp.name,
//             description: sp.description,
//             image: sp.image instanceof File ? sp.image : undefined,
//             imageUrl: typeof sp.image === "string" ? sp.image : undefined,
//           })),
//           sessionMedias: (s.sessionMedias || []).map((media) => ({
//             mediaFile:
//               media.mediaFile instanceof File ? media.mediaFile : undefined,
//             mediaUrl:
//               typeof media.mediaFile === "string" ? media.mediaFile : undefined,
//           })),
//         };
//       });

//       const sessionData: ConferenceSessionData = {
//         sessions: formattedSessions,
//       };
//       await createSessions({ conferenceId, data: sessionData }).unwrap();

//       dispatch(markStepCompleted(3));
//       dispatch(nextStep());
//       toast.success("Lưu phiên họp thành công!");
//     } catch (error) {
//       const apiError = error as { data?: ApiError };
//       console.error("Failed to create sessions:", error);
//       toast.error(apiError?.data?.message || "Lưu phiên họp thất bại!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handlePoliciesSubmit = async () => {
//     if (!conferenceId) {
//       toast.error("Không tìm thấy conference ID!");
//       return;
//     }

//     // Policies là optional
//     if (policies.length === 0 && refundPolicies.length === 0) {
//       dispatch(markStepCompleted(4));
//       dispatch(nextStep());
//       toast.info("Đã bỏ qua phần chính sách");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       await Promise.all([
//         policies.length > 0
//           ? createPolicies({ conferenceId, data: { policies } }).unwrap()
//           : Promise.resolve(),
//         refundPolicies.length > 0
//           ? createRefundPolicies({
//             conferenceId,
//             data: { refundPolicies },
//           }).unwrap()
//           : Promise.resolve(),
//       ]);

//       dispatch(markStepCompleted(4));
//       dispatch(nextStep());
//       toast.success("Lưu chính sách thành công!");
//     } catch (error) {
//       const apiError = error as { data?: ApiError };
//       console.error("Failed to create policies:", error);
//       toast.error(apiError?.data?.message || "Lưu chính sách thất bại!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleMediaSubmit = async () => {
//     if (!conferenceId) {
//       toast.error("Không tìm thấy conference ID!");
//       return;
//     }

//     // Media là optional
//     if (mediaList.length === 0) {
//       dispatch(markStepCompleted(5));
//       dispatch(nextStep());
//       toast.info("Đã bỏ qua phần media");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       await createMedia({ conferenceId, data: { media: mediaList } }).unwrap();

//       dispatch(markStepCompleted(5));
//       dispatch(nextStep());
//       toast.success("Lưu media thành công!");
//     } catch (error) {
//       const apiError = error as { data?: ApiError };
//       console.error("Failed to create media:", error);
//       toast.error(apiError?.data?.message || "Lưu media thất bại!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleFinalSubmit = async () => {
//     if (!conferenceId) {
//       toast.error("Không tìm thấy conference ID!");
//       return;
//     }

//     if (sponsors.length === 0) {
//       dispatch(markStepCompleted(6));
//       toast.success("Tạo hội thảo thành công!");
//       dispatch(resetWizard());
//       router.push(`/workspace/collaborator/manage-conference`);
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       await createSponsors({ conferenceId, data: { sponsors } }).unwrap();

//       dispatch(markStepCompleted(6));
//       toast.success("Tạo hội thảo thành công!");
//       dispatch(resetWizard());
//       router.push(`/workspace/collaborator/manage-conference`);
//     } catch (error) {
//       const apiError = error as { data?: ApiError };
//       console.error("Failed to create sponsors:", error);
//       toast.error(apiError?.data?.message || "Lưu nhà tài trợ thất bại!");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handlePrevStep = () => {
//     dispatch(prevStep());
//   };

//   const handleNextStepPreview = () => {
//     dispatch(nextStep());
//   };

//   const handleGoToStep = (step: number) => {
//     dispatch(goToStep(step));
//   };

//   const handleAddPhaseToNewTicket = () => {
//     const {
//       phaseName,
//       percentValue,
//       percentType,
//       startDate,
//       durationInDays,
//       totalslot,
//     } = newPhase;
//     if (!phaseName.trim()) {
//       toast.error("Vui lòng nhập tên giai đoạn!");
//       return;
//     }
//     if (!startDate) {
//       toast.error("Vui lòng chọn ngày bắt đầu!");
//       return;
//     }
//     if (totalslot <= 0) {
//       toast.error("Số lượng phải lớn hơn 0!");
//       return;
//     }
//     if (!basicForm.ticketSaleStart || !basicForm.ticketSaleEnd) {
//       toast.error("Không tìm thấy thông tin thời gian bán vé!");
//       return;
//     }

//     const saleStart = new Date(basicForm.ticketSaleStart);
//     const saleEnd = new Date(basicForm.ticketSaleEnd);
//     const phaseStart = new Date(startDate);
//     const phaseEnd = new Date(phaseStart);
//     phaseEnd.setDate(phaseStart.getDate() + durationInDays - 1);

//     if (phaseStart < saleStart || phaseStart > saleEnd) {
//       toast.error(
//         `Ngày bắt đầu giai đoạn phải trong khoảng ${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")}!`,
//       );
//       return;
//     }
//     if (phaseEnd > saleEnd) {
//       toast.error(
//         `Ngày kết thúc giai đoạn (${phaseEnd.toLocaleDateString("vi-VN")}) vượt quá thời gian bán vé!`,
//       );
//       return;
//     }

//     // Nếu đang chỉnh sửa
//     if (editingPhase) {
//       const updatedTickets = [...tickets];
//       const { ticketIndex, phaseIndex } = editingPhase;

//       // Kiểm tra trùng thời gian (ngoại trừ chính phase đang chỉnh sửa)
//       const hasOverlap = updatedTickets[ticketIndex].phases.some(
//         (p, idx) =>
//           idx !== phaseIndex &&
//           phaseStart <= new Date(p.endDate) &&
//           phaseEnd >= new Date(p.startDate),
//       );
//       if (hasOverlap) {
//         toast.error("Giai đoạn này bị trùng thời gian với giai đoạn khác!");
//         return;
//       }

//       const applyPercent =
//         percentType === "increase" ? 100 + percentValue : 100 - percentValue;

//       updatedTickets[ticketIndex].phases[phaseIndex] = {
//         ...updatedTickets[ticketIndex].phases[phaseIndex],
//         phaseName,
//         applyPercent,
//         startDate,
//         endDate: phaseEnd.toISOString().split("T")[0],
//         totalslot,
//       };

//       setTickets(updatedTickets);
//       toast.success("Cập nhật giai đoạn thành công!");
//     } else {
//       // Thêm mới
//       const currentPhasesTotal = newTicket.phases.reduce(
//         (sum, p) => sum + p.totalslot,
//         0,
//       );
//       if (currentPhasesTotal + totalslot > newTicket.totalSlot) {
//         toast.error(
//           `Tổng slot các giai đoạn (${currentPhasesTotal + totalslot}) vượt quá tổng slot vé (${newTicket.totalSlot})!`,
//         );
//         return;
//       }

//       const hasOverlap = newTicket.phases.some((p) => {
//         const pStart = new Date(p.startDate);
//         const pEnd = new Date(p.endDate);
//         return phaseStart <= pEnd && phaseEnd >= pStart;
//       });
//       if (hasOverlap) {
//         toast.error("Giai đoạn này bị trùng thời gian với giai đoạn khác!");
//         return;
//       }

//       const applyPercent =
//         percentType === "increase" ? 100 + percentValue : 100 - percentValue;
//       const phase: Phase = {
//         phaseName,
//         applyPercent,
//         startDate,
//         endDate: phaseEnd.toISOString().split("T")[0],
//         totalslot,
//       };

//       setNewTicket((prev) => ({
//         ...prev,
//         phases: [...prev.phases, phase],
//       }));
//       toast.success("Đã thêm giai đoạn!");
//     }

//     setNewPhase({
//       phaseName: "",
//       percentValue: 0,
//       percentType: "increase",
//       startDate: "",
//       durationInDays: 1,
//       totalslot: 0,
//     });
//     setEditingPhase(null);
//     setIsPhaseModalOpen(false);
//   };

//   const handleRemovePhaseFromTicket = (phaseIndex: number) => {
//     setNewTicket((prev) => ({
//       ...prev,
//       phases: prev.phases.filter((_, idx) => idx !== phaseIndex),
//     }));
//     toast.success("Đã xóa giai đoạn!");
//   };
//   const handleEditPhase = (ticketIndex: number, phaseIndex: number) => {
//     const phase = tickets[ticketIndex].phases[phaseIndex];
//     if (!phase) return;

//     const percentValue =
//       phase.applyPercent > 100
//         ? phase.applyPercent - 100
//         : 100 - phase.applyPercent;
//     const percentType = phase.applyPercent > 100 ? "increase" : "decrease";

//     const start = new Date(phase.startDate);
//     const end = new Date(phase.endDate);
//     const durationInDays =
//       Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

//     setNewPhase({
//       phaseName: phase.phaseName,
//       percentValue,
//       percentType,
//       startDate: phase.startDate,
//       durationInDays,
//       totalslot: phase.totalslot,
//     });

//     setEditingPhase({ ticketIndex, phaseIndex, data: phase });
//     setIsPhaseModalOpen(true);
//   };

//   const handleAddTicket = () => {
//     if (!newTicket.ticketName.trim()) {
//       toast.error("Vui lòng nhập tên vé!");
//       return;
//     }
//     if (newTicket.ticketPrice <= 0) {
//       toast.error("Giá vé phải lớn hơn 0!");
//       return;
//     }
//     if (newTicket.totalSlot <= 0) {
//       toast.error("Số lượng vé phải lớn hơn 0!");
//       return;
//     }
//     if (newTicket.phases.length > 0) {
//       const totalPhaseSlots = newTicket.phases.reduce(
//         (sum, p) => sum + p.totalslot,
//         0,
//       );
//       if (totalPhaseSlots !== newTicket.totalSlot) {
//         toast.error(
//           `Tổng slot các giai đoạn (${totalPhaseSlots}) phải bằng tổng slot vé (${newTicket.totalSlot})!`,
//         );
//         return;
//       }
//     }

//     if (editingTicketIndex !== null) {
//       const updatedTickets = [...tickets];
//       updatedTickets[editingTicketIndex] = {
//         ...newTicket,
//         ticketId: updatedTickets[editingTicketIndex]?.ticketId,
//         isAuthor: false,
//       };
//       setTickets(updatedTickets);
//       toast.success("Cập nhật vé thành công!");
//     } else {
//       setTickets([...tickets, { ...newTicket, isAuthor: false }]);
//       toast.success("Đã thêm vé!");
//     }

//     // Reset form
//     setNewTicket({
//       ticketPrice: 0,
//       ticketName: "",
//       ticketDescription: "",
//       isAuthor: false,
//       totalSlot: 0,
//       phases: [],
//     });
//     setEditingTicket(null);
//     setEditingTicketIndex(null);
//   };
//   const handleEditTicket = (ticket: Ticket, index: number) => {
//     setNewTicket({
//       ticketPrice: ticket.ticketPrice,
//       ticketName: ticket.ticketName,
//       ticketDescription: ticket.ticketDescription || "",
//       isAuthor: ticket.isAuthor ?? false,
//       totalSlot: ticket.totalSlot,
//       phases: ticket.phases || [],
//     });
//     setEditingTicket(ticket);
//     setEditingTicketIndex(index);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };
//   const handleAddSession = () => {
//     if (!newSession.title || newSession.speaker.length === 0) {
//       toast.error("Vui lòng nhập tiêu đề và ít nhất 1 diễn giả!");
//       return;
//     }

//     if (!newSession.date || !newSession.startTime || !newSession.endTime) {
//       toast.error("Vui lòng nhập đầy đủ ngày và thời gian!");
//       return;
//     }

//     if (!basicForm.startDate || !basicForm.endDate) {
//       toast.error("Không tìm thấy thông tin thời gian sự kiện!");
//       return;
//     }

//     const confStart = new Date(basicForm.startDate);
//     const confEnd = new Date(basicForm.endDate);
//     const sessionDate = new Date(newSession.date);

//     if (sessionDate < confStart || sessionDate > confEnd) {
//       toast.error(
//         `Ngày phiên họp phải trong khoảng ${confStart.toLocaleDateString("vi-VN")} - ${confEnd.toLocaleDateString("vi-VN")}!`,
//       );
//       return;
//     }

//     if (newSession.startTime && newSession.endTime) {
//       const start = new Date(newSession.startTime);
//       const end = new Date(newSession.endTime);
//       const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

//       if (durationMinutes < 30) {
//         toast.error("Thời lượng phiên họp phải ít nhất 30 phút!");
//         return;
//       }

//       if (durationMinutes < 0) {
//         toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
//         return;
//       }
//     }

//     setSessions([...sessions, newSession]);
//     setNewSession({
//       title: "",
//       description: "",
//       date: "",
//       startTime: "",
//       endTime: "",
//       timeRange: 1,
//       roomId: "",
//       speaker: [],
//       sessionMedias: [],
//     });

//     toast.success("Đã thêm session!");
//   };

//   const handleAddPolicy = () => {
//     if (!newPolicy.policyName) return;
//     setPolicies([...policies, newPolicy]);
//     setNewPolicy({ policyName: "", description: "" });
//   };

//   const handleAddRefundPolicy = () => {
//     if (
//       newRefundPolicy.percentRefund <= 0 ||
//       newRefundPolicy.percentRefund > 100
//     ) {
//       toast.error("Phần trăm hoàn tiền phải từ 1-100%!");
//       return;
//     }

//     if (!newRefundPolicy.refundDeadline) {
//       toast.error("Vui lòng chọn hạn hoàn tiền!");
//       return;
//     }

//     if (!basicForm.startDate) {
//       toast.error("Không tìm thấy thông tin thời gian sự kiện!");
//       return;
//     }

//     const deadline = new Date(newRefundPolicy.refundDeadline);
//     const eventStart = new Date(basicForm.startDate);

//     if (deadline >= eventStart) {
//       toast.error("Hạn hoàn tiền phải trước ngày bắt đầu sự kiện!");
//       return;
//     }

//     // Check trùng thứ tự
//     const existingOrder = refundPolicies.find(
//       (p) => p.refundOrder === newRefundPolicy.refundOrder,
//     );
//     if (existingOrder) {
//       toast.error("Thứ tự này đã tồn tại!");
//       return;
//     }

//     setRefundPolicies([...refundPolicies, newRefundPolicy]);
//     setNewRefundPolicy({
//       percentRefund: 0,
//       refundDeadline: "",
//       refundOrder: refundPolicies.length + 1,
//     });
//     toast.success("Đã thêm chính sách hoàn tiền!");
//   };

//   const handleAddMedia = () => {
//     if (!newMedia.mediaFile) return;
//     setMediaList([...mediaList, newMedia]);
//     setNewMedia({ mediaFile: null });
//   };

//   const handleAddSponsor = () => {
//     if (!newSponsor.name || !newSponsor.imageFile) {
//       toast.error("Vui lòng nhập tên và chọn logo!");
//       return;
//     }
//     setSponsors([...sponsors, newSponsor]);
//     setNewSponsor({ name: "", imageFile: null });
//     toast.success("Đã thêm nhà tài trợ!");
//   };

//   const calculatePhaseEndDate = (
//     startDate: string,
//     durationInDays: number,
//   ): string => {
//     if (!startDate || durationInDays <= 0) return "";
//     const start = new Date(startDate);
//     const end = new Date(start);
//     end.setDate(start.getDate() + durationInDays - 1);
//     return end.toISOString().split("T")[0];
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Tạo hội thảo mới</h1>
//         <p className="text-gray-600 mt-1">
//           Điền đầy đủ thông tin để tạo hội thảo
//         </p>
//       </div>
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-3">
//           {[1, 2, 3, 4, 5, 6].map((step) => {
//             const isCompleted = completedSteps.includes(step);
//             const isCurrent = currentStep === step;
//             const isAccessible = isCompleted || step <= currentStep;

//             return (
//               <div
//                 key={step}
//                 className="flex items-center flex-1 last:flex-none"
//               >
//                 <button
//                   onClick={() => isAccessible && handleGoToStep(step)}
//                   disabled={!isAccessible}
//                   className={`
//               w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
//               ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-200" : ""}
//               ${isCompleted && !isCurrent ? "bg-green-600 text-white" : ""}
//               ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-500" : ""}
//               ${isAccessible ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}
//             `}
//                 >
//                   {isCompleted ? "✓" : step}
//                 </button>
//                 {step < 6 && (
//                   <div
//                     className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Step Labels */}
//         <div className="flex justify-between">
//           <span
//             className={`text-sm ${currentStep === 1 ? "font-semibold text-blue-600" : "text-gray-500"}`}
//             style={{ width: "40px", textAlign: "center" }}
//           >
//             Thông tin
//           </span>
//           <span
//             className={`text-sm ${currentStep === 2 ? "font-semibold text-blue-600" : "text-gray-500"}`}
//             style={{ width: "40px", textAlign: "center" }}
//           >
//             Giá vé
//           </span>
//           <span
//             className={`text-sm ${currentStep === 3 ? "font-semibold text-blue-600" : "text-gray-500"}`}
//             style={{ width: "40px", textAlign: "center" }}
//           >
//             Phiên họp
//           </span>
//           <span
//             className={`text-sm ${currentStep === 4 ? "font-semibold text-blue-600" : "text-gray-500"}`}
//             style={{ width: "40px", textAlign: "center" }}
//           >
//             Chính sách
//           </span>
//           <span
//             className={`text-sm ${currentStep === 5 ? "font-semibold text-blue-600" : "text-gray-500"}`}
//             style={{ width: "40px", textAlign: "center" }}
//           >
//             Media
//           </span>
//           <span
//             className={`text-sm ${currentStep === 6 ? "font-semibold text-blue-600" : "text-gray-500"}`}
//             style={{ width: "40px", textAlign: "center" }}
//           >
//             Tài trợ
//           </span>
//         </div>
//       </div>
//       {isSubmitting && (
//         <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <div className="flex items-center gap-2">
//             <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
//             <p className="text-sm text-yellow-800 font-medium">
//               Đang xử lý... Vui lòng đợi
//             </p>
//           </div>
//         </div>
//       )}

//       {/* STEP 1: BASIC INFO*/}
//       {currentStep === 1 && (
//         <div className="bg-white border rounded-lg p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold">1. Thông tin cơ bản</h3>
//             {completedSteps.includes(1) && (
//               <span className="text-sm text-green-600 font-medium">
//                 ✓ Đã hoàn thành
//               </span>
//             )}
//           </div>

//           <div className="space-y-4">
//             <FormInput
//               label="Tên hội thảo"
//               name="conferenceName"
//               value={basicForm.conferenceName}
//               onChange={(val) =>
//                 setBasicForm({ ...basicForm, conferenceName: val })
//               }
//               onBlur={() => validateConferenceName(basicForm.conferenceName)}
//               error={validationErrors.conferenceName}
//               success={!validationErrors.conferenceName && basicForm.conferenceName.length >= 10}
//               required
//             />
//             <FormTextArea
//               label="Mô tả"
//               value={basicForm.description ?? ""}
//               onChange={(val) =>
//                 setBasicForm({ ...basicForm, description: val })
//               }
//               rows={3}
//               required
//             />

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <DatePickerInput
//                   label="Ngày bắt đầu"
//                   value={basicForm.startDate}
//                   onChange={(val) =>
//                     setBasicForm({ ...basicForm, startDate: val })
//                   }
//                   required
//                 />
//               </div>

//               <FormInput
//                 label="Số ngày diễn ra"
//                 type="number"
//                 value={basicForm.dateRange}
//                 onChange={(val) => {
//                   const numVal = Number(val);
//                   setBasicForm({ ...basicForm, dateRange: numVal });
//                   validateDateRange(numVal);
//                 }}
//                 error={validationErrors.dateRange}
//                 success={!validationErrors.dateRange}
//                 min="1"
//                 max="365"
//                 required
//                 placeholder="VD: 3 ngày"
//               />

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Ngày kết thúc
//                 </label>
//                 <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
//                   {basicForm.endDate ? (
//                     <span className="text-gray-900">
//                       {new Date(basicForm.endDate).toLocaleDateString("vi-VN")}
//                     </span>
//                   ) : (
//                     <span className="text-gray-400">--/--/----</span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <DatePickerInput
//                 label="Ngày bắt đầu bán vé"
//                 sublabel={`Trước ngày bắt đầu sự kiện ${formatDate(basicForm.startDate)}`}
//                 value={basicForm.ticketSaleStart}
//                 onChange={(val) =>
//                   setBasicForm({ ...basicForm, ticketSaleStart: val })
//                 }
//                 maxDate={basicForm.endDate}
//                 required
//               />

//               <FormInput
//                 label="Số ngày bán vé"
//                 type="number"
//                 min="1"
//                 value={basicForm.ticketSaleDuration}
//                 onChange={(val) =>
//                   setBasicForm({
//                     ...basicForm,
//                     ticketSaleDuration: Number(val),
//                   })
//                 }
//                 required
//                 placeholder="VD: 30 ngày"
//               />

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Ngày kết thúc bán vé
//                 </label>
//                 <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
//                   {basicForm.ticketSaleEnd ? (
//                     <span className="text-gray-900">
//                       {new Date(basicForm.ticketSaleEnd).toLocaleDateString(
//                         "vi-VN",
//                       )}
//                     </span>
//                   ) : (
//                     <span className="text-gray-400">--/--/----</span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Sức chứa + Danh mục */}
//             <div className="grid grid-cols-2 gap-4">
//               <FormInput
//                 label="Sức chứa"
//                 name="totalSlot"
//                 type="number"
//                 value={basicForm.totalSlot}
//                 onChange={(val) =>
//                   setBasicForm({ ...basicForm, totalSlot: Number(val) })
//                 }
//               />
//               <FormSelect
//                 label="Danh mục"
//                 name="categoryId"
//                 value={basicForm.conferenceCategoryId}
//                 onChange={(val) =>
//                   setBasicForm({ ...basicForm, conferenceCategoryId: val })
//                 }
//                 options={categoryOptions}
//                 required
//                 disabled={isCategoriesLoading}
//               />
//             </div>

//             {/* Địa chỉ + Thành phố */}
//             <div className="grid grid-cols-2 gap-4">
//               <FormInput
//                 label="Địa chỉ"
//                 name="address"
//                 value={basicForm.address}
//                 onChange={(val) => setBasicForm({ ...basicForm, address: val })}
//               />
//               <FormSelect
//                 label="Thành phố"
//                 name="cityId"
//                 value={basicForm.cityId}
//                 onChange={(val) => setBasicForm({ ...basicForm, cityId: val })}
//                 options={cityOptions}
//                 required
//                 disabled={isCitiesLoading}
//               />
//             </div>

//             {/* Đối tượng mục tiêu - 1/2 width */}
//             <div className="grid grid-cols-2 gap-4">
//               <FormSelect
//                 label="Đối tượng mục tiêu"
//                 value={basicForm.targetAudienceTechnicalConference}
//                 onChange={(val) =>
//                   setBasicForm({
//                     ...basicForm,
//                     targetAudienceTechnicalConference: val,
//                   })
//                 }
//                 options={TARGET_OPTIONS}
//               />
//               {basicForm.targetAudienceTechnicalConference === "Khác" && (
//                 <FormInput
//                   label="Nhập đối tượng khác"
//                   value={basicForm.customTarget || ""}
//                   onChange={(val) =>
//                     setBasicForm({ ...basicForm, customTarget: val })
//                   }
//                 />
//               )}
//             </div>

//             <ImageUpload
//               label="Banner Image (1 ảnh)"
//               subtext="Dưới 4MB, định dạng PNG hoặc JPG"
//               maxSizeMB={4}
//               height="h-48"
//               onChange={(file) =>
//                 setBasicForm({
//                   ...basicForm,
//                   bannerImageFile: file as File | null,
//                 })
//               }
//             />

//             <div className="flex gap-3 mt-6">
//               <Button
//                 onClick={handleBasicSubmit}
//                 disabled={isSubmitting || completedSteps.includes(1)}
//                 className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 {isSubmitting
//                   ? "Đang lưu..."
//                   : completedSteps.includes(1)
//                     ? "Đã lưu"
//                     : "Lưu và tiếp tục"}
//               </Button>

//               {completedSteps.includes(1) && (
//                 <Button
//                   onClick={handleNextStepPreview}
//                   className="flex-1 bg-green-600 text-white hover:bg-green-700"
//                 >
//                   Tiếp tục →
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* STEP 2: PRICE */}
//       {currentStep === 2 && (
//         <div className="bg-white border rounded-lg p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">2. Giá vé</h3>

//           <div className="border p-4 rounded mb-4">
//             <h4 className="font-medium mb-3 text-blue-600">
//               Danh sách vé ({tickets.length})
//             </h4>

//             {tickets.map((t, idx) => (
//               <div
//                 key={t.ticketId || idx}
//                 className="border rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-all duration-200"
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-start mb-3 border-b pb-2">
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-base text-gray-800">
//                       {t.ticketName}
//                     </h3>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {formatDate(t.phases?.[0]?.startDate)} -{" "}
//                       {formatDate(t.phases?.[t.phases.length - 1]?.endDate)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-lg font-bold text-blue-600">
//                       {formatCurrency(t.ticketPrice)}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       Số lượng: {t.totalSlot}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Phases */}
//                 {t.phases && t.phases.length > 0 && (
//                   <div className="mt-2">
//                     <div className="text-xs font-medium text-gray-600 mb-1.5">
//                       Giai đoạn giá ({t.phases.length}):
//                     </div>

//                     <div className="grid grid-cols-5 gap-2">
//                       {t.phases.map((p, pi) => {
//                         const isIncrease = p.applyPercent > 100;
//                         const percentDisplay = isIncrease
//                           ? `+${p.applyPercent - 100}%`
//                           : `-${100 - p.applyPercent}%`;
//                         const adjustedPrice =
//                           t.ticketPrice * (p.applyPercent / 100);

//                         return (
//                           <div
//                             key={pi}
//                             className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 hover:border-blue-300 transition-colors"
//                             onClick={() =>
//                               handleEditPhase(tickets.indexOf(t), pi)
//                             } // ← Thêm dòng này
//                           >
//                             <div
//                               className="text-xs font-semibold text-gray-800 mb-1 truncate"
//                               title={p.phaseName}
//                             >
//                               {p.phaseName}
//                             </div>
//                             <div className="text-[10px] text-gray-500 mb-1 leading-tight">
//                               {formatDate(p.startDate)} -{" "}
//                               {formatDate(p.endDate)}
//                             </div>
//                             <div className="text-[10px] text-gray-600 mb-1 font-medium">
//                               Giá: {formatCurrency(adjustedPrice)}
//                             </div>
//                             <div className="flex items-center justify-between text-xs">
//                               <span className="text-gray-600">
//                                 Tổng: {p.totalslot}
//                               </span>
//                               <span
//                                 className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"
//                                   }`}
//                               >
//                                 {percentDisplay}
//                               </span>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}

//                 {/* Action Button */}
//                 <div className="flex gap-2 mt-3">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleEditTicket(t, idx)}
//                     className="flex-1"
//                   >
//                     Sửa vé
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="destructive"
//                     onClick={() =>
//                       setTickets(tickets.filter((_, i) => i !== idx))
//                     }
//                     className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5"
//                   >
//                     Xóa vé
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="border p-4 rounded">
//             <h4 className="font-medium mb-3">Thêm vé mới</h4>
//             <FormInput
//               label="Tên vé"
//               value={newTicket.ticketName}
//               onChange={(val) =>
//                 setNewTicket({ ...newTicket, ticketName: val })
//               }
//               placeholder="Vé cơ bản, tiêu chuẩn, nâng cao ..."
//             />
//             <FormTextArea
//               label="Mô tả"
//               value={newTicket.ticketDescription}
//               onChange={(val) =>
//                 setNewTicket({ ...newTicket, ticketDescription: val })
//               }
//               rows={2}
//             />
//             <div className="grid grid-cols-2 gap-3 mt-2">
//               <FormInput
//                 label="Giá vé gốc (VND)"
//                 type="number"
//                 value={newTicket.ticketPrice}
//                 onChange={(val) =>
//                   setNewTicket({ ...newTicket, ticketPrice: Number(val) })
//                 }
//                 placeholder="500000"
//               />
//               <FormInput
//                 label={`Tổng số lượng vé (Sức chứa: ${basicForm.totalSlot})`}
//                 type="number"
//                 value={newTicket.totalSlot}
//                 onChange={(val) =>
//                   setNewTicket({ ...newTicket, totalSlot: Number(val) })
//                 }
//                 placeholder="100"
//               />
//             </div>

//             <div className="mt-4 border-t pt-3">
//               <h5 className="font-medium mb-2 flex items-center gap-2">
//                 Giai đoạn giá ({newTicket.phases.length})
//                 {basicForm.ticketSaleStart && basicForm.ticketSaleEnd && (
//                   <span className="text-sm text-blue-600">
//                     (
//                     {new Date(basicForm.ticketSaleStart).toLocaleDateString(
//                       "vi-VN",
//                     )}{" "}
//                     →{" "}
//                     {new Date(basicForm.ticketSaleEnd).toLocaleDateString(
//                       "vi-VN",
//                     )}
//                     )
//                   </span>
//                 )}
//               </h5>

//               {newTicket.phases.length > 0 ? (
//                 <div className="mt-2">
//                   <div className="grid grid-cols-3 gap-2">
//                     {newTicket.phases.map((p, idx) => {
//                       const isIncrease = p.applyPercent > 100;
//                       const percentDisplay = isIncrease
//                         ? `+${p.applyPercent - 100}%`
//                         : `-${100 - p.applyPercent}%`;
//                       const adjustedPrice =
//                         newTicket.ticketPrice * (p.applyPercent / 100);

//                       return (
//                         <div
//                           key={idx}
//                           className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 relative"
//                         >
//                           <button
//                             type="button"
//                             onClick={() => handleRemovePhaseFromTicket(idx)}
//                             className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-xs font-bold"
//                             title="Xóa giai đoạn"
//                           >
//                             ✕
//                           </button>

//                           <div
//                             className="text-xs font-semibold text-gray-800 mb-1 truncate"
//                             title={p.phaseName}
//                           >
//                             {p.phaseName}
//                           </div>
//                           <div className="text-[10px] text-gray-500 mb-1 leading-tight">
//                             {formatDate(p.startDate)} - {formatDate(p.endDate)}
//                           </div>
//                           <div className="text-[10px] text-gray-600 mb-1">
//                             Giá: {formatCurrency(adjustedPrice)}
//                           </div>
//                           <div className="flex items-center justify-between text-xs">
//                             <span className="text-gray-600">
//                               SL: {p.totalslot}
//                             </span>
//                             <span
//                               className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"
//                                 }`}
//                             >
//                               {percentDisplay}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500 italic">
//                   Chưa có giai đoạn nào được thêm.
//                 </p>
//               )}

//               <Button
//                 size="sm"
//                 onClick={() => setIsPhaseModalOpen(true)}
//                 className="w-full mt-2"
//                 variant="outline"
//               >
//                 Thêm giai đoạn giá
//               </Button>
//               {isPhaseModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                   <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-2">
//                         <h3 className="text-lg font-semibold">
//                           Thêm giai đoạn giá
//                         </h3>
//                         {basicForm.ticketSaleStart &&
//                           basicForm.ticketSaleEnd && (
//                             <span className="text-sm text-blue-600">
//                               (
//                               {new Date(
//                                 basicForm.ticketSaleStart,
//                               ).toLocaleDateString("vi-VN")}{" "}
//                               →{" "}
//                               {new Date(
//                                 basicForm.ticketSaleEnd,
//                               ).toLocaleDateString("vi-VN")}
//                               )
//                             </span>
//                           )}
//                       </div>
//                       <button
//                         onClick={() => setIsPhaseModalOpen(false)}
//                         className="text-gray-400 hover:text-gray-600 text-lg leading-none"
//                       >
//                         ✕
//                       </button>
//                     </div>

//                     <div className="space-y-4">
//                       <FormInput
//                         label="Tên giai đoạn"
//                         value={newPhase.phaseName}
//                         onChange={(val) =>
//                           setNewPhase({ ...newPhase, phaseName: val })
//                         }
//                         placeholder="Early Bird, Standard, Late..."
//                       />

//                       <div className="space-y-2">
//                         <label className="block text-sm font-medium">
//                           Điều chỉnh giá
//                         </label>
//                         <div className="flex items-end gap-3">
//                           <div className="w-24">
//                             <FormInput
//                               label=""
//                               type="number"
//                               min="0"
//                               max="100"
//                               value={newPhase.percentValue}
//                               onChange={(val) =>
//                                 setNewPhase({
//                                   ...newPhase,
//                                   percentValue: Number(val),
//                                 })
//                               }
//                               placeholder=""
//                             />
//                           </div>
//                           <div className="flex gap-3">
//                             <label className="flex items-center gap-2 cursor-pointer">
//                               <input
//                                 type="radio"
//                                 name="percentType"
//                                 value="increase"
//                                 checked={newPhase.percentType === "increase"}
//                                 onChange={() =>
//                                   setNewPhase({
//                                     ...newPhase,
//                                     percentType: "increase",
//                                   })
//                                 }
//                                 className="w-4 h-4"
//                               />
//                               <span className="text-sm text-red-600 font-medium">
//                                 Tăng
//                               </span>
//                             </label>
//                             <label className="flex items-center gap-2 cursor-pointer">
//                               <input
//                                 type="radio"
//                                 name="percentType"
//                                 value="decrease"
//                                 checked={newPhase.percentType === "decrease"}
//                                 onChange={() =>
//                                   setNewPhase({
//                                     ...newPhase,
//                                     percentType: "decrease",
//                                   })
//                                 }
//                                 className="w-4 h-4"
//                               />
//                               <span className="text-sm text-green-600 font-medium">
//                                 Giảm
//                               </span>
//                             </label>
//                           </div>
//                           {newTicket.ticketPrice > 0 &&
//                             newPhase.percentValue > 0 && (
//                               <div className="text-sm bg-gray-50 p-2 rounded">
//                                 <strong
//                                   className={
//                                     newPhase.percentType === "increase"
//                                       ? "text-red-600"
//                                       : "text-green-600"
//                                   }
//                                 >
//                                   {(
//                                     newTicket.ticketPrice *
//                                     (newPhase.percentType === "increase"
//                                       ? (100 + newPhase.percentValue) / 100
//                                       : (100 - newPhase.percentValue) / 100)
//                                   ).toLocaleString()}{" "}
//                                   VND
//                                 </strong>{" "}
//                                 (
//                                 {newPhase.percentType === "increase"
//                                   ? "+"
//                                   : "-"}
//                                 {newPhase.percentValue}%)
//                               </div>
//                             )}
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-4 gap-3">
//                         <div>
//                           <DatePickerInput
//                             label="Ngày bắt đầu"
//                             value={newPhase.startDate}
//                             onChange={(val) =>
//                               setNewPhase({ ...newPhase, startDate: val })
//                             }
//                             minDate={basicForm.ticketSaleStart}
//                             maxDate={basicForm.ticketSaleEnd}
//                             required
//                           />
//                         </div>

//                         <FormInput
//                           label="Số ngày"
//                           type="number"
//                           min="1"
//                           value={newPhase.durationInDays}
//                           max={basicForm.ticketSaleEnd}
//                           onChange={(val) =>
//                             setNewPhase({
//                               ...newPhase,
//                               durationInDays: Number(val),
//                             })
//                           }
//                         />

//                         <div>
//                           <label className="block text-sm font-medium mb-2">
//                             Ngày kết thúc
//                           </label>
//                           <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
//                             {newPhase.startDate &&
//                               newPhase.durationInDays > 0 ? (
//                               <span className="text-gray-900">
//                                 {new Date(
//                                   calculatePhaseEndDate(
//                                     newPhase.startDate,
//                                     newPhase.durationInDays,
//                                   ),
//                                 ).toLocaleDateString("vi-VN")}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">--/--/----</span>
//                             )}
//                           </div>
//                         </div>
//                         <FormInput
//                           label={`Số lượng (Tổng: ${newTicket.totalSlot})`}
//                           type="number"
//                           min="1"
//                           max={
//                             newTicket.totalSlot -
//                             newTicket.phases.reduce(
//                               (sum, p) => sum + p.totalslot,
//                               0,
//                             )
//                           }
//                           value={newPhase.totalslot}
//                           onChange={(val) =>
//                             setNewPhase({ ...newPhase, totalslot: Number(val) })
//                           }
//                           placeholder={`Tối đa: ${newTicket.totalSlot - newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0)}`}
//                         />
//                       </div>

//                       <div className="flex gap-3 mt-6">
//                         <Button
//                           onClick={() => setIsPhaseModalOpen(false)}
//                           variant="outline"
//                           className="flex-1"
//                         >
//                           Hủy
//                         </Button>
//                         <Button
//                           onClick={handleAddPhaseToNewTicket}
//                           className="flex-1"
//                         >
//                           Thêm giai đoạn
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Button className="mt-4 w-full" onClick={handleAddTicket}>
//               Thêm vé
//             </Button>
//           </div>

//           <div className="flex gap-3 mt-6">
//             <Button
//               onClick={handlePrevStep}
//               variant="outline"
//               className="flex-1"
//             >
//               ← Quay lại
//             </Button>

//             <Button
//               onClick={handlePriceSubmit}
//               disabled={
//                 isSubmitting ||
//                 completedSteps.includes(2) ||
//                 tickets.length === 0
//               }
//               className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//             >
//               {isSubmitting
//                 ? "Đang lưu..."
//                 : completedSteps.includes(2)
//                   ? "Đã lưu"
//                   : "Lưu và tiếp tục"}
//             </Button>

//             {completedSteps.includes(2) && (
//               <Button
//                 onClick={handleNextStepPreview}
//                 className="flex-1 bg-green-600 text-white hover:bg-green-700"
//               >
//                 Tiếp tục →
//               </Button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* STEP 3: SESSIONS */}

//       {currentStep === 3 && (
//         <div className="bg-white border rounded-lg p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">
//             3. Phiên họp (Tùy chọn)
//           </h3>

//           <div className="space-y-2 mb-4">
//             {sessions.length === 0 ? (
//               <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
//                 Chưa có phiên họp nào. Bạn có thể bỏ qua hoặc thêm phiên họp mới
//                 bên dưới.
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//                 {sessions.map((s, idx) => {
//                   const room = roomsData?.data.find(
//                     (r: RoomInfoResponse) => r.roomId === s.roomId,
//                   );

//                   return (
//                     <div
//                       key={idx}
//                       className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between"
//                     >
//                       <div>
//                         <div className="font-semibold text-gray-900">
//                           {s.title}
//                         </div>

//                         <div className="text-sm text-gray-600 mt-1">
//                           {formatTimeDate(s.startTime)} -{" "}
//                           {formatTimeDate(s.endTime)}
//                         </div>

//                         {room && (
//                           <div className="text-xs text-gray-500 mt-1">
//                             Phòng:{" "}
//                             <span className="font-medium">{room.number}</span> -{" "}
//                             {room.displayName}
//                           </div>
//                         )}

//                         {s.speaker.length > 0 && (
//                           <div className="mt-3">
//                             <div className="text-sm font-medium text-gray-800 mb-1">
//                               Diễn giả:
//                             </div>
//                             <ul className="space-y-1 text-sm text-gray-600">
//                               {s.speaker.map((spk, spkIdx) => (
//                                 <li key={spkIdx} className="ml-2">
//                                   <span className="font-medium">
//                                     {spk.name}
//                                   </span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         )}
//                       </div>

//                       {/* Action buttons */}
//                       <div className="flex justify-end gap-2 mt-4">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => {
//                             setNewSession(s);
//                             setSessions(sessions.filter((_, i) => i !== idx));
//                           }}
//                         >
//                           Sửa
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() =>
//                             setSessions(sessions.filter((_, i) => i !== idx))
//                           }
//                         >
//                           Xóa
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <div className="border p-4 rounded space-y-3">
//             <h4 className="font-medium flex items-center gap-2">
//               Thêm phiên họp mới
//               {basicForm.startDate && basicForm.endDate && (
//                 <span className="text-sm text-green-600">
//                   ({formatDate(basicForm.startDate)} →{" "}
//                   {formatDate(basicForm.endDate)})
//                 </span>
//               )}
//             </h4>
//             <FormInput
//               label="Tiêu đề"
//               value={newSession.title}
//               onChange={(val) => setNewSession({ ...newSession, title: val })}
//               required
//             />

//             <FormTextArea
//               label="Mô tả"
//               value={newSession.description || ""}
//               onChange={(val) =>
//                 setNewSession({ ...newSession, description: val })
//               }
//               rows={2}
//             />

//             <div className="grid grid-cols-3 gap-3">
//               <DatePickerInput
//                 label="Ngày bắt đầu session"
//                 value={newSession.date}
//                 onChange={(val) => setNewSession({ ...newSession, date: val })}
//                 minDate={basicForm.startDate}
//                 maxDate={basicForm.endDate}
//                 required
//               />

//               <FormInput
//                 label="Thời gian bắt đầu"
//                 type="time"
//                 value={newSession.startTime}
//                 onChange={(val) => {
//                   if (newSession.date) {
//                     const datetime = `${newSession.date}T${val}`;
//                     setNewSession({ ...newSession, startTime: datetime });
//                   } else {
//                     toast.error("Vui lòng chọn ngày trước!");
//                   }
//                 }}
//                 required
//                 disabled={!newSession.date}
//               />

//               <FormInput
//                 label="Thời lượng (giờ)"
//                 type="number"
//                 min="0.5"
//                 step="0.5"
//                 value={newSession.timeRange}
//                 onChange={(val) =>
//                   setNewSession({ ...newSession, timeRange: Number(val) })
//                 }
//                 placeholder="VD: 2 giờ"
//                 required
//               />
//             </div>

//             {/* Preview time */}
//             {newSession.startTime && newSession.endTime && (
//               <div className="bg-blue-50 p-3 rounded space-y-1">
//                 <div className="text-sm text-gray-700">
//                   <span className="font-medium">Bắt đầu:</span>{" "}
//                   {formatTimeDate(newSession.startTime)}
//                 </div>
//                 <div className="text-sm text-gray-700">
//                   <span className="font-medium">Kết thúc:</span>{" "}
//                   {formatTimeDate(newSession.endTime)}
//                 </div>
//               </div>
//             )}

//             <FormSelect
//               label="Phòng"
//               value={newSession.roomId}
//               onChange={(val) => setNewSession({ ...newSession, roomId: val })}
//               options={roomOptions}
//               required
//               disabled={isRoomsLoading}
//             />

//             <div className="border-t pt-3">
//               <h5 className="font-medium mb-2">
//                 Diễn giả ({newSession.speaker.length})
//               </h5>

//               {newSession.speaker.length > 0 && (
//                 <div className="space-y-2 mb-3">
//                   {newSession.speaker.length > 0 && (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
//                       {newSession.speaker.map((spk, idx) => (
//                         <div
//                           key={idx}
//                           className="relative bg-transparent border-black-900 rounded-xl p-4 flex flex-col items-center text-center shadow-sm"
//                         >
//                           {spk.image && (
//                             <img
//                               src={
//                                 spk.image instanceof File
//                                   ? URL.createObjectURL(spk.image)
//                                   : spk.image
//                               }
//                               alt={spk.name}
//                               className="w-16 h-16 rounded-full object-cover mb-2 border border-blue-200"
//                             />
//                           )}
//                           <div className="font-medium text-sm text-gray-900">
//                             {spk.name}
//                           </div>
//                           {spk.description && (
//                             <div className="text-xs text-gray-600 mt-1">
//                               {spk.description}
//                             </div>
//                           )}

//                           {/* Nút xoá */}
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setNewSession({
//                                 ...newSession,
//                                 speaker: newSession.speaker.filter(
//                                   (_, i) => i !== idx,
//                                 ),
//                               });
//                               toast.success("Đã xóa diễn giả!");
//                             }}
//                             className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs "
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               <Button
//                 size="sm"
//                 onClick={() => setIsSpeakerModalOpen(true)}
//                 className="w-full"
//                 variant="outline"
//               >
//                 Thêm diễn giả
//               </Button>
//             </div>

//             <Button onClick={handleAddSession} className="w-full mt-4">
//               Thêm phiên họp
//             </Button>
//           </div>

//           <div className="flex gap-3 mt-6">
//             <Button
//               onClick={handlePrevStep}
//               variant="outline"
//               className="flex-1"
//             >
//               ← Quay lại
//             </Button>

//             <Button
//               onClick={handleSessionsSubmit}
//               disabled={isSubmitting || completedSteps.includes(3)}
//               className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//             >
//               {isSubmitting
//                 ? "Đang lưu..."
//                 : completedSteps.includes(3)
//                   ? "Đã lưu"
//                   : sessions.length > 0
//                     ? "Lưu và tiếp tục"
//                     : "Bỏ qua"}
//             </Button>

//             {completedSteps.includes(3) && (
//               <Button
//                 onClick={handleNextStepPreview}
//                 className="flex-1 bg-green-600 text-white hover:bg-green-700"
//               >
//                 Tiếp tục →
//               </Button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Modal thêm diễn giả */}
//       {isSpeakerModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Thêm diễn giả</h3>
//               <button
//                 onClick={() => setIsSpeakerModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="space-y-4">
//               <FormInput
//                 label="Tên diễn giả"
//                 value={newSpeaker.name}
//                 onChange={(val) => setNewSpeaker({ ...newSpeaker, name: val })}
//                 placeholder="VD: Nguyễn Văn A"
//               />

//               <FormTextArea
//                 label="Mô tả"
//                 value={newSpeaker.description}
//                 onChange={(val) =>
//                   setNewSpeaker({ ...newSpeaker, description: val })
//                 }
//                 rows={2}
//                 placeholder="Chức vụ, kinh nghiệm..."
//               />

//               <ImageUpload
//                 label="Ảnh diễn giả"
//                 subtext="Dưới 4MB, định dạng PNG hoặc JPG"
//                 maxSizeMB={4}
//                 height="h-32"
//                 onChange={(file) =>
//                   setNewSpeaker({ ...newSpeaker, image: file as File | null })
//                 }
//               />

//               <div className="flex gap-3 mt-6">
//                 <Button
//                   onClick={() => setIsSpeakerModalOpen(false)}
//                   variant="outline"
//                   className="flex-1"
//                 >
//                   Hủy
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     if (!newSpeaker.name.trim()) {
//                       toast.error("Vui lòng nhập tên diễn giả!");
//                       return;
//                     }

//                     if (!newSpeaker.image) {
//                       toast.error("Vui lòng chọn ảnh diễn giả!");
//                       return;
//                     }

//                     setNewSession({
//                       ...newSession,
//                       speaker: [
//                         ...(newSession.speaker || []),
//                         newSpeaker as Speaker,
//                       ],
//                     });

//                     // Reset form
//                     setNewSpeaker({ name: "", description: "", image: null });
//                     setIsSpeakerModalOpen(false);
//                     toast.success("Đã thêm diễn giả!");
//                   }}
//                   className="flex-1"
//                 >
//                   Thêm
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* STEP 4: POLICIES */}

//       {currentStep === 4 && (
//         <div className="bg-white border rounded-lg p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">
//             4. Chính sách (Tùy chọn)
//           </h3>

//           {/* Phần 4.1: Chính sách chung */}
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-700 mb-3">
//               A. Chính sách chung (Tùy chọn)
//             </h4>

//             <div className="space-y-2 mb-4">
//               {policies.length === 0 ? (
//                 <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center">
//                   Chưa có chính sách nào. Bạn có thể bỏ qua hoặc thêm chính sách
//                   mới bên dưới.
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
//                   {policies.map((p, idx) => (
//                     <div
//                       key={idx}
//                       className="relative bg-white border border-gray-300 rounded-xl p-4 flex flex-col justify-between"
//                     >
//                       <div>
//                         <div className="font-semibold text-gray-900">
//                           {p.policyName}
//                         </div>
//                         {p.description && (
//                           <div className="text-sm text-gray-600 mt-1">
//                             {p.description}
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex justify-end gap-2 mt-4">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => {
//                             setNewPolicy(p);
//                             setPolicies(policies.filter((_, i) => i !== idx));
//                           }}
//                         >
//                           Sửa
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() =>
//                             setPolicies(policies.filter((_, i) => i !== idx))
//                           }
//                         >
//                           Xóa
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="border p-4 rounded space-y-3">
//               <h5 className="font-medium">Thêm chính sách chung</h5>
//               <FormInput
//                 label="Tên chính sách"
//                 value={newPolicy.policyName}
//                 onChange={(val) =>
//                   setNewPolicy({ ...newPolicy, policyName: val })
//                 }
//               />
//               <FormTextArea
//                 label="Mô tả"
//                 value={newPolicy.description || ""}
//                 onChange={(val) =>
//                   setNewPolicy({ ...newPolicy, description: val })
//                 }
//                 rows={3}
//               />
//               <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
//             </div>
//           </div>

//           {/* Phần 4.2: Chính sách hoàn tiền */}
//           <div className="border-t pt-6">
//             <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//               B. Chính sách hoàn tiền (Tùy chọn)
//               {basicForm.startDate && (
//                 <span className="text-sm text-blue-600">
//                   (Trước ngày{" "}
//                   {new Date(basicForm.startDate).toLocaleDateString("vi-VN")})
//                   (Trong thời gian bán vé{" "}
//                   {new Date(basicForm.ticketSaleStart).toLocaleDateString(
//                     "vi-VN",
//                   )}
//                   -{" "}
//                   {new Date(basicForm.ticketSaleEnd).toLocaleDateString(
//                     "vi-VN",
//                   )}
//                   )
//                 </span>
//               )}
//             </h4>

//             <div className="space-y-2 mb-4">
//               {refundPolicies.length === 0 ? (
//                 <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center">
//                   Chưa có chính sách hoàn tiền nào. Bạn có thể bỏ qua hoặc thêm
//                   mới bên dưới.
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
//                   {refundPolicies
//                     .sort((a, b) => a.refundOrder - b.refundOrder)
//                     .map((rp, idx) => (
//                       <div
//                         key={idx}
//                         className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
//                       >
//                         <div>
//                           <div className="flex items-center gap-2 mb-2">
//                             <span className="text-black px-2 py-0.5 rounded text-xs font-semibold">
//                               #{rp.refundOrder}
//                             </span>
//                             <span className="text-blue-700 font-semibold">
//                               Hoàn trả {rp.percentRefund}%
//                             </span>
//                           </div>

//                           <div className="text-sm text-gray-700">
//                             Trước ngày:{" "}
//                             <strong>{formatDate(rp.refundDeadline)}</strong>
//                           </div>
//                         </div>

//                         <div className="flex justify-end gap-2 mt-4">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => {
//                               setNewRefundPolicy(rp);
//                               setRefundPolicies(
//                                 refundPolicies.filter((_, i) => i !== idx),
//                               );
//                             }}
//                           >
//                             Sửa
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => {
//                               setRefundPolicies(
//                                 refundPolicies.filter((_, i) => i !== idx),
//                               );
//                               toast.success("Đã xóa chính sách hoàn tiền!");
//                             }}
//                           >
//                             Xóa
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               )}
//             </div>

//             <div className="border p-4 rounded space-y-3 bg-gray-50">
//               <h5 className="font-medium">Thêm chính sách hoàn tiền mới</h5>

//               <div className="grid grid-cols-3 gap-3">
//                 <FormInput
//                   label="Thứ tự"
//                   type="number"
//                   min="1"
//                   value={newRefundPolicy.refundOrder}
//                   onChange={(val) =>
//                     setNewRefundPolicy({
//                       ...newRefundPolicy,
//                       refundOrder: Number(val),
//                     })
//                   }
//                   placeholder="1, 2, 3..."
//                 />

//                 <FormInput
//                   label="% Hoàn tiền"
//                   type="number"
//                   min="1"
//                   max="100"
//                   value={newRefundPolicy.percentRefund}
//                   onChange={(val) =>
//                     setNewRefundPolicy({
//                       ...newRefundPolicy,
//                       percentRefund: Number(val),
//                     })
//                   }
//                   placeholder="VD: 80"
//                 />

//                 <FormInput
//                   label="Hạn hoàn tiền"
//                   type="date"
//                   min={basicForm.ticketSaleStart || undefined}
//                   max={basicForm.ticketSaleEnd || undefined}
//                   value={newRefundPolicy.refundDeadline}
//                   onChange={(val) =>
//                     setNewRefundPolicy({
//                       ...newRefundPolicy,
//                       refundDeadline: val,
//                     })
//                   }
//                 />
//               </div>

//               <div className="text-xs text-gray-600 bg-white p-2 rounded">
//                 <strong>Ví dụ:</strong> Hoàn 80% nếu hủy trước 7 ngày, 50% nếu
//                 hủy trước 3 ngày, 0% nếu hủy trong 24h.
//               </div>

//               <Button onClick={handleAddRefundPolicy} className="w-full">
//                 + Thêm chính sách hoàn tiền
//               </Button>
//             </div>
//           </div>
//           {/* Navigation Buttons */}
//           <div className="flex gap-3 mt-6">
//             <Button
//               onClick={handlePrevStep}
//               variant="outline"
//               className="flex-1"
//             >
//               ← Quay lại
//             </Button>

//             <Button
//               onClick={handlePoliciesSubmit}
//               disabled={isSubmitting || completedSteps.includes(4)}
//               className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//             >
//               {isSubmitting
//                 ? "Đang lưu..."
//                 : completedSteps.includes(4)
//                   ? "Đã lưu"
//                   : policies.length > 0 || refundPolicies.length > 0
//                     ? "Lưu và tiếp tục"
//                     : "Bỏ qua"}
//             </Button>

//             {completedSteps.includes(4) && (
//               <Button
//                 onClick={handleNextStepPreview}
//                 className="flex-1 bg-green-600 text-white hover:bg-green-700"
//               >
//                 Tiếp tục →
//               </Button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* STEP 5: MEDIA */}

//       {currentStep === 5 && (
//         <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">5. Media (Tùy chọn)</h3>

//           {mediaList.length === 0 ? (
//             <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center mb-8">
//               Chưa có media nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
//               {mediaList.map((m, idx) => (
//                 <div
//                   key={idx}
//                   className="relative bg-white border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
//                 >
//                   {m.mediaFile && (
//                     <>
//                       {m.mediaFile instanceof File ? (
//                         <img
//                           src={URL.createObjectURL(m.mediaFile)}
//                           alt="Media Preview"
//                           className="w-full h-40 object-cover rounded-lg mb-2"
//                         />
//                       ) : typeof m.mediaFile === "string" &&
//                         (m.mediaFile as string).length > 0 ? (
//                         <img
//                           src={m.mediaFile}
//                           alt="Media"
//                           className="w-full h-40 object-cover rounded-lg mb-2"
//                         />
//                       ) : null}
//                     </>
//                   )}

//                   <div className="text-sm text-gray-700 truncate w-full">
//                     {m.mediaFile instanceof File
//                       ? m.mediaFile.name
//                       : typeof m.mediaFile === "string"
//                         ? "Ảnh/Video hiện tại"
//                         : "No file"}
//                   </div>

//                   <button
//                     onClick={() =>
//                       setMediaList(mediaList.filter((_, i) => i !== idx))
//                     }
//                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="border border-gray-200 p-4 rounded-xl space-y-4">
//             <h4 className="font-medium text-gray-800">Thêm media</h4>
//             <ImageUpload
//               label="Upload media (ảnh hoặc video)"
//               subtext="(4MB max)"
//               isList={false}
//               onChange={(file) =>
//                 setNewMedia({ ...newMedia, mediaFile: file as File | null })
//               }
//             />
//             <Button onClick={handleAddMedia}>Thêm media</Button>
//           </div>
//           {/* Navigation Buttons */}
//           <div className="flex gap-3 mt-6">
//             <Button
//               onClick={handlePrevStep}
//               variant="outline"
//               className="flex-1"
//             >
//               ← Quay lại
//             </Button>

//             <Button
//               onClick={handleMediaSubmit}
//               disabled={isSubmitting || completedSteps.includes(5)}
//               className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//             >
//               {isSubmitting
//                 ? "Đang lưu..."
//                 : completedSteps.includes(5)
//                   ? "Đã lưu"
//                   : mediaList.length > 0
//                     ? "Lưu và tiếp tục"
//                     : "Bỏ qua"}
//             </Button>

//             {completedSteps.includes(5) && (
//               <Button
//                 onClick={handleNextStepPreview}
//                 className="flex-1 bg-green-600 text-white hover:bg-green-700"
//               >
//                 Tiếp tục →
//               </Button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* STEP 6: SPONSORS */}

//       {currentStep === 6 && (
//         <div className="bg-white border rounded-lg p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">
//             6. Nhà tài trợ (Tùy chọn)
//           </h3>

//           {/* Hiển thị danh sách nhà tài trợ */}
//           {sponsors.length === 0 ? (
//             <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
//               Chưa có nhà tài trợ nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
//             </div>
//           ) : (
//             <div className="grid grid-cols-3 gap-4 mb-4">
//               {sponsors.map((s, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
//                 >
//                   {s.imageFile instanceof File ? (
//                     <img
//                       src={URL.createObjectURL(s.imageFile)}
//                       alt="Sponsor Preview"
//                       className="h-20 w-20 object-cover rounded-full border border-gray-300 mb-2"
//                     />
//                   ) : typeof s.imageFile === "string" && s.imageFile ? (
//                     <img
//                       src={s.imageFile}
//                       alt={s.name}
//                       className="h-20 w-20 object-cover rounded-full border border-gray-300 mb-2"
//                     />
//                   ) : (
//                     <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-full text-gray-400">
//                       No Image
//                     </div>
//                   )}

//                   <div className="font-medium text-gray-800">{s.name}</div>
//                   <div className="text-xs text-gray-500 mb-2">
//                     {s.imageFile instanceof File
//                       ? s.imageFile.name
//                       : typeof s.imageFile === "string"
//                         ? "Logo hiện tại"
//                         : ""}
//                   </div>

//                   <div className="flex gap-2 mt-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setNewSponsor(s);
//                         setSponsors(sponsors.filter((_, i) => i !== idx));
//                       }}
//                     >
//                       Sửa
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() =>
//                         setSponsors(sponsors.filter((_, i) => i !== idx))
//                       }
//                     >
//                       Xóa
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Form thêm mới */}
//           <div className="border p-4 rounded space-y-4">
//             <h4 className="font-medium">Thêm nhà tài trợ</h4>
//             <FormInput
//               label="Tên nhà tài trợ"
//               value={newSponsor.name}
//               onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
//             />
//             <ImageUpload
//               isList={false}
//               height="h-32"
//               onChange={(file) =>
//                 setNewSponsor({ ...newSponsor, imageFile: file as File | null })
//               }
//               resetTrigger={resetSponsorUpload}
//             />

//             <Button
//               onClick={() => {
//                 handleAddSponsor();
//                 setResetSponsorUpload(true);
//                 setTimeout(() => setResetSponsorUpload(false), 200);
//               }}
//             >
//               Thêm nhà tài trợ
//             </Button>
//           </div>
//           {/* Navigation Buttons */}
//           <div className="flex gap-3 mt-6">
//             <Button
//               onClick={handlePrevStep}
//               variant="outline"
//               className="flex-1"
//             >
//               ← Quay lại
//             </Button>

//             <Button
//               onClick={handleFinalSubmit}
//               disabled={isSubmitting || completedSteps.includes(6)}
//               className="flex-1 bg-green-600 text-white hover:bg-green-700"
//             >
//               {isSubmitting
//                 ? "Đang hoàn tất..."
//                 : completedSteps.includes(6)
//                   ? "Đã hoàn thành"
//                   : sponsors.length > 0
//                     ? "Hoàn tất"
//                     : "Hoàn tất (Bỏ qua)"}
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

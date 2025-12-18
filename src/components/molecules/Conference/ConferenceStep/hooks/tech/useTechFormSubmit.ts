// src/hooks/useFormSubmit.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  setConferenceId,
  setConferenceBasicData,
  markStepCompleted,
  nextStep,
  resetWizard,
} from "@/redux/slices/conferenceStep.slice";
import {
  // Create
  useCreateBasicConferenceMutation,
  useCreateConferencePriceMutation,
  useCreatePhaseForPriceMutation,
  useCreateConferenceSessionsMutation,
  useCreateConferencePoliciesMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,

  // Update
  useUpdateBasicConferenceMutation,
  useUpdateConferencePriceMutation,
  useUpdateConferencePricePhaseMutation,
  useUpdateConferenceSessionMutation,
  useUpdateSessionSpeakerMutation,
  useUpdateConferencePolicyMutation,
  useUpdateConferenceMediaMutation,
  useUpdateConferenceSponsorMutation,

  // Delete
  useDeleteConferencePriceMutation,
  useDeleteConferencePricePhaseMutation,
  useDeleteConferenceSessionMutation,
  useDeleteConferencePolicyMutation,
  useDeleteConferenceMediaMutation,
  useDeleteConferenceSponsorMutation,

  //DELETE
  useDeleteRefundPolicyMutation
} from "@/redux/services/conferenceStep.service";
import type { ApiError } from "@/types/api.type";
import type {
  ConferenceBasicForm,
  ConferencePriceData,
  ConferenceSessionData,
  Ticket,
  Session,
  Policy,
  Media,
  Sponsor,
} from "@/types/conference.type";

import { useDeleteTracking } from "../useDeleteTracking";
import { validateBasicForm } from "../../validations";

const hasSessionChanged = (
  current: Session,
  initial: Session
): boolean => {
  return (
    current.title !== initial.title ||
    current.description !== initial.description ||
    current.date !== initial.date ||
    current.startTime !== initial.startTime ||
    current.endTime !== initial.endTime ||
    current.roomId !== initial.roomId ||
    JSON.stringify(current.speaker) !== JSON.stringify(initial.speaker) ||
    JSON.stringify(current.sessionMedias) !== JSON.stringify(initial.sessionMedias)
  );
};

const hasOnlyRoomIdChanged = (
  current: Session,
  initial: Session
): boolean => {
  return (
    current.roomId !== initial.roomId &&
    current.title === initial.title &&
    current.description === initial.description &&
    current.date === initial.date &&
    current.startTime === initial.startTime &&
    current.endTime === initial.endTime &&
    JSON.stringify(current.speaker) === JSON.stringify(initial.speaker) &&
    JSON.stringify(current.sessionMedias) === JSON.stringify(initial.sessionMedias)
  );
};

interface UseFormSubmitProps {
  onRefetchNeeded?: () => Promise<void>;
  deletedTicketIds?: string[];
  deletedSessionIds?: string[];
  deletedPolicyIds?: string[];
  deletedMediaIds?: string[];
  deletedSponsorIds?: string[];
  deletedPhaseIds?: string[]; 
  deletedRefundPolicyIds?: string[]; 
  initialSessions?: Session[];

}

export function useFormSubmit(props?: UseFormSubmitProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const conferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);
  const mode = useAppSelector((state) => state.conferenceStep.mode);
  const roles = useAppSelector((state) => state.auth.user?.role);

  // RTK Query Mutations
  const [createBasic] = useCreateBasicConferenceMutation();
  const [updateBasic] = useUpdateBasicConferenceMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createPhaseForPrice] = useCreatePhaseForPriceMutation();
  const [updatePrice] = useUpdateConferencePriceMutation();
  const [deletePrice] = useDeleteConferencePriceMutation();
  const [deletePhase] = useDeleteConferencePricePhaseMutation();
  const [updatePhase] = useUpdateConferencePricePhaseMutation(); 
  const [createSessions] = useCreateConferenceSessionsMutation();
  const [updateSession] = useUpdateConferenceSessionMutation();
  const [deleteSession] = useDeleteConferenceSessionMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [updatePolicy] = useUpdateConferencePolicyMutation();
  const [deletePolicy] = useDeleteConferencePolicyMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [updateMedia] = useUpdateConferenceMediaMutation();
  const [deleteMedia] = useDeleteConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();
  const [updateSponsor] = useUpdateConferenceSponsorMutation();
  const [deleteSponsor] = useDeleteConferenceSponsorMutation();
  const [deleteRefundPolicy] = useDeleteRefundPolicyMutation();

  const {
  deletedTicketIds = [],
  deletedSessionIds = [],
  deletedPolicyIds = [],
  deletedMediaIds = [],
  deletedSponsorIds = [],
  deletedPhaseIds = [],
  deletedRefundPolicyIds = [], 

} = props || {};

  // ✅ Helper: Trigger refetch sau update
  const triggerRefetch = async () => {
    if (mode === "edit" && props?.onRefetchNeeded) {
      try {
        await props.onRefetchNeeded();
      } catch (error) {
        console.error("Refetch failed:", error);
      }
    }
  };

const submitBasicInfo = async (formData: ConferenceBasicForm, autoNext: boolean = true) => {
  try {
    setIsSubmitting(true);
    let result;

    const isCollaborator = roles?.some((role) => role.includes("Collaborator"));

    if ((mode === "edit" && conferenceId) || (isCollaborator && conferenceId)) {
      result = await updateBasic({ conferenceId, data: formData }).unwrap();
      toast.success("Cập nhật thông tin cơ bản thành công!");
      await triggerRefetch();
    } else {
      result = await createBasic(formData).unwrap();
      const confId = result.data.conferenceId;
      dispatch(setConferenceId(confId));
      dispatch(setConferenceBasicData(result.data));
      toast.success("Tạo thông tin cơ bản thành công!");
    }

    dispatch(markStepCompleted(1));

    // if (autoNext && mode === "create" && !isCollaborator) {
    //   dispatch(nextStep());
    // }

    return { success: true, data: result.data };
  } catch (error) {
    const apiError = error as { data?: ApiError };
    console.error("Basic submit failed:", error);
    toast.error(apiError?.data?.message || "Cập nhật thông tin cơ bản thất bại!");
    return { success: false, error };
  } finally {
    setIsSubmitting(false);
  }
};

// === STEP 2: PRICE (TICKETS) ===
const submitPrice = async (tickets: Ticket[]) => {
  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return { success: false };
  }

  try {
    setIsSubmitting(true);
    let createdTickets: Ticket[] = [];

    if (mode === "edit") {
      // BƯỚC 0: Xóa refund policies bị đánh dấu xóa
      if (deletedRefundPolicyIds.length > 0) {
        const refundDeleteResults = await Promise.allSettled(
          deletedRefundPolicyIds.map((id: string) => deleteRefundPolicy(id).unwrap())
        );
        const failedCount = refundDeleteResults.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected'
        ).length;

        if (failedCount > 0) {
          toast.warning(`Xóa ${failedCount}/${deletedRefundPolicyIds.length} chính sách hoàn tiền thất bại`);
        }
      }

      // BƯỚC 1: Xóa phases bị xóa
      if (deletedPhaseIds.length > 0) {
        const deleteResults = await Promise.allSettled(
          deletedPhaseIds.map((id: string) => deletePhase(id).unwrap())
        );
        const failedCount = deleteResults.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected'
        ).length;

        if (failedCount > 0) {
          toast.warning(`Xóa ${failedCount}/${deletedPhaseIds.length} phase thất bại`);
        }
      }

      // BƯỚC 2: Xóa tickets bị xóa
      if (deletedTicketIds.length > 0) {
        await Promise.all(deletedTicketIds.map((id) => deletePrice(id).unwrap()));
      }

      // BƯỚC 3: Cập nhật thông tin cơ bản của tickets hiện có
      const existingTickets = tickets.filter((t) => t.priceId);
      if (existingTickets.length > 0) {
        await Promise.all(
          existingTickets.map((ticket) =>
            updatePrice({
              priceId: ticket.priceId!,
              data: {
                ticketPrice: parseFloat(ticket.ticketPrice.toFixed(2)),
                ticketName: ticket.ticketName,
                ticketDescription: ticket.ticketDescription,
                totalSlot: ticket.totalSlot,
              },
            }).unwrap()
          )
        );
      }

      // BƯỚC 4: Cập nhật phases hiện có & thêm phases mới vào ticket đã tồn tại
      for (const ticket of existingTickets) {
        if (!ticket.phases || ticket.phases.length === 0) continue;

        // Cập nhật phases có sẵn
        const existingPhases = ticket.phases.filter((p) => p.pricePhaseId);
        if (existingPhases.length > 0) {
          const updateResults = await Promise.allSettled(
            existingPhases.map((phase) =>
              updatePhase({
                pricePhaseId: phase.pricePhaseId!,
                data: {
                  phaseName: phase.phaseName,
                  applyPercent: parseFloat(phase.applyPercent.toFixed(2)),
                  startDate: phase.startDate,
                  endDate: phase.endDate,
                  totalSlot: phase.totalslot,
                  forWaitlist: phase.forWaitlist ?? false,
                },
              }).unwrap()
            )
          );

          const failedUpdates = updateResults.filter(r => r.status === 'rejected');
          if (failedUpdates.length > 0) {
            toast.error(`Cập nhật ${failedUpdates.length}/${existingPhases.length} phase thất bại`);
            return { success: false };
          }
        }

        // Thêm phases mới vào ticket đã tồn tại
        const newPhasesInExistingTicket = ticket.phases.filter((p) => !p.pricePhaseId);
        if (newPhasesInExistingTicket.length > 0) {
          try {
            await createPhaseForPrice({
              conferencePriceId: ticket.priceId!,
              data: {
                pricePhases: newPhasesInExistingTicket.map((phase) => ({
                  phaseName: phase.phaseName,
                  applyPercent: parseFloat(phase.applyPercent.toFixed(2)),
                  startDate: phase.startDate,
                  endDate: phase.endDate,
                  totalslot: phase.totalslot, 
                  forWaitlist: phase.forWaitlist ?? false,
                  refundInPhase: phase.refundInPhase?.map((rp) => ({
                    percentRefund: rp.percentRefund,
                    refundDeadline: rp.refundDeadline,
                  })) || [],
                })),
              },
            }).unwrap();
          } catch (error) {
            toast.error(`Không thể thêm phase mới cho vé "${ticket.ticketName}"`);
            return { success: false };
          }
        }
      }

      // BƯỚC 5: Tạo tickets mới (nếu có)
      const newTickets = tickets.filter((t) => !t.priceId);
      if (newTickets.length > 0) {
        const priceData: ConferencePriceData = {
          typeOfTicket: newTickets.map((ticket) => ({
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
              forWaitlist: phase.forWaitlist ?? false,
              refundInPhase: (phase.refundInPhase || []).map((rp) => ({
                percentRefund: rp.percentRefund,
                refundDeadline: rp.refundDeadline,
              })),
            })),
          })),
        };

        const result = await createPrice({ conferenceId, data: priceData }).unwrap();
        createdTickets = (result.data.conferencePriceWithPhasesResponses || []).map((p) => ({
          ticketId: p.conferencePriceId,
          priceId: p.conferencePriceId,
          ticketPrice: p.ticketPrice ?? 0,
          ticketName: p.ticketName ?? "",
          ticketDescription: p.ticketDescription ?? "",
          isAuthor: p.isAuthor ?? false,
          totalSlot: p.totalSlot ?? 0,
          phases: (p.pricePhases || []).map((ph) => ({
            pricePhaseId: ph.pricePhaseId,
            phaseName: ph.phaseName ?? "",
            startDate: ph.startDate ?? "",
            endDate: ph.endDate ?? "",
            applyPercent: ph.applyPercent ?? 0,
            totalslot: ph.totalSlot ?? 0,
            forWaitlist: ph.forWaitlist ?? false,
            refundInPhase: (ph.refundPolicies || []).map((rp) => ({
              refundPolicyId: rp.refundPolicyId ?? "",
              percentRefund: rp.percentRefund ?? 0,
              refundDeadline: rp.refundDeadline ?? "",
              refundOrder: rp.refundOrder ?? 0,
            })),
          })),
        }));
      }

      // BƯỚC 6: Refetch dữ liệu mới nhất
      await triggerRefetch();
    } else {
      // MODE CREATE
      if (tickets.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 loại vé!");
        return { success: false };
      }

      const ticketWithoutPhases = tickets.some(ticket => !ticket.phases || ticket.phases.length === 0);
      if (ticketWithoutPhases) {
        toast.error("Mỗi loại vé phải có ít nhất 1 giai đoạn giá!");
        return { success: false };
      }

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
            forWaitlist: phase.forWaitlist ?? false,
            refundInPhase: (phase.refundInPhase || []).map((rp) => ({
              percentRefund: rp.percentRefund,
              refundDeadline: rp.refundDeadline,
            })),
          })),
        })),
      };

      const result = await createPrice({ conferenceId, data: priceData }).unwrap();
      createdTickets = (result.data.conferencePriceWithPhasesResponses || []).map((p) => ({
        ticketId: p.conferencePriceId,
        priceId: p.conferencePriceId,
        ticketPrice: p.ticketPrice ?? 0,
        ticketName: p.ticketName ?? "",
        ticketDescription: p.ticketDescription ?? "",
        isAuthor: p.isAuthor ?? false,
        totalSlot: p.totalSlot ?? 0,
        phases: (p.pricePhases || []).map((ph) => ({
          pricePhaseId: ph.pricePhaseId,
          phaseName: ph.phaseName ?? "",
          startDate: ph.startDate ?? "",
          endDate: ph.endDate ?? "",
          applyPercent: ph.applyPercent ?? 0,
          totalslot: ph.totalSlot ?? 0,
          forWaitlist: ph.forWaitlist ?? false,
          refundInPhase: (ph.refundPolicies || []).map((rp) => ({
            refundPolicyId: rp.refundPolicyId ?? "",
            percentRefund: rp.percentRefund ?? 0,
            refundDeadline: rp.refundDeadline ?? "",
            refundOrder: rp.refundOrder ?? 0,
          })),
        })),
      }));
    }

    dispatch(markStepCompleted(2));
    toast.success("Lưu thông tin giá vé thành công!");

    const allTickets = mode === "edit"
      ? [...tickets.filter((t) => t.priceId), ...createdTickets]
      : createdTickets;

    return { success: true, data: allTickets };
  } catch (error) {
    const apiError = error as { data?: ApiError };
    toast.error(apiError?.data?.message || "Lưu giá vé thất bại!");
    return { success: false, error };
  } finally {
    setIsSubmitting(false);
  }
};

const submitSessions = async (
  sessions: Session[],
  eventStartDate: string,
  eventEndDate: string,
  options?: { 
    deletedSessionIds?: string[];
    initialSessions?: Session[];
  }
) => {
  const currentDeletedIds = options?.deletedSessionIds || deletedSessionIds;
  const initialSessions = options?.initialSessions || [];
  
  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return { success: false };
  }

  if (sessions.length === 0) {
    dispatch(markStepCompleted(3));
    toast.info("Đã lưu trạng thái không có session");
    return { success: true, skipped: true };
  }

  const isSubmittingAll = sessions.length > 1;
  
  if (isSubmittingAll) {
    const hasSessionOnStartDay = sessions.some((s) => s.date === eventStartDate);
    const hasSessionOnEndDay = sessions.some((s) => s.date === eventEndDate);
    
    if (!hasSessionOnStartDay || !hasSessionOnEndDay) {
      toast.error("Phải có ít nhất 1 session vào ngày bắt đầu và 1 session vào ngày kết thúc hội thảo!");
      return { success: false };
    }
  }

  try {
    setIsSubmitting(true);

    // 🔍 DEBUG: Log sessions TRƯỚC khi xử lý
    console.log("📊 submitSessions - Input sessions:", sessions);

    const extractTimeOnly = (timeInput: string): string => {
      console.log("🔍 extractTimeOnly input:", timeInput);
      
      // Nếu đã là format "HH:mm:ss", giữ nguyên
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeInput)) {
        console.log("✅ Already in HH:mm:ss format:", timeInput);
        return timeInput;
      }

      // Nếu là format "HH:mm", thêm seconds
      if (/^\d{2}:\d{2}$/.test(timeInput)) {
        const result = `${timeInput}:00`;
        console.log("✅ Converted HH:mm to HH:mm:ss:", result);
        return result;
      }

      // Nếu có chứa 'T' (ISO string), extract time
      if (timeInput.includes('T')) {
        const d = new Date(timeInput);
        if (isNaN(d.getTime())) {
          console.error("❌ Invalid ISO date:", timeInput);
          return "00:00:00";
        }
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        const result = `${hours}:${minutes}:${seconds}`;
        console.log("✅ Extracted from ISO:", result);
        return result;
      }

      // Fallback: try to parse as Date
      const d = new Date(timeInput);
      if (!isNaN(d.getTime())) {
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        const result = `${hours}:${minutes}:${seconds}`;
        console.log("✅ Parsed as Date:", result);
        return result;
      }

      console.error("❌ Could not parse time, returning default:", timeInput);
      return "00:00:00";
    };

    const formatSession = (s: Session) => {
      console.log("📊 formatSession - Input session:", {
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        date: s.date
      });

      const formattedStartTime = extractTimeOnly(s.startTime);
      const formattedEndTime = extractTimeOnly(s.endTime);

      const formatted = {
        title: s.title,
        description: s.description,
        date: s.date,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        roomId: s.roomId,
        speaker: s.speaker.map((sp) => ({
          name: sp.name,
          description: sp.description,
          image: sp.image instanceof File ? sp.image : undefined,
          imageUrl: typeof sp.image === "string" ? sp.image : undefined,
        })),
        sessionMedias: (s.sessionMedias || []).map((media) => ({
          mediaFile: media.mediaFile instanceof File ? media.mediaFile : undefined,
          mediaUrl: typeof media.mediaFile === "string" ? media.mediaFile : undefined,
        })),
      };

      console.log("📤 formatSession - Output:", {
        title: formatted.title,
        startTime: formatted.startTime,
        endTime: formatted.endTime,
        date: formatted.date
      });

      return formatted;
    };

    if (mode === "edit") {
      // Xóa các session đã đánh dấu xóa
      if (currentDeletedIds.length > 0) {
        console.log("🗑️ Deleting sessions:", currentDeletedIds);
        await Promise.all(
          currentDeletedIds.map((id) => deleteSession(id).unwrap())
        );
      }

      // Tìm các session đã thay đổi
      const changedSessions = sessions.filter((currentSession) => {
        if (!currentSession.sessionId) return false; 

        const initialSession = initialSessions.find(
          (s) => s.sessionId === currentSession.sessionId
        );

        if (!initialSession) return true; 

        return hasSessionChanged(currentSession, initialSession);
      });

      console.log("📝 Changed sessions:", changedSessions.length);

      // Update các session đã thay đổi
      if (changedSessions.length > 0) {
        await Promise.all(
          changedSessions.map((session) => {
            if (!session.sessionId) {
              throw new Error(`Session "${session.title}" không có ID`);
            }

            const updateData = {
              title: session.title,
              description: session.description,
              startTime: extractTimeOnly(session.startTime),
              endTime: extractTimeOnly(session.endTime),
              date: session.date,
              roomId: session.roomId,
            };

            console.log("🔄 Updating session:", session.sessionId, updateData);

            return updateSession({
              sessionId: session.sessionId,
              data: updateData,
            }).unwrap();
          })
        );
      }

      // Tạo các session mới
      const newSessions = sessions.filter((s) => !s.sessionId);
      console.log("➕ New sessions:", newSessions.length);

      if (newSessions.length > 0) {
        const formattedNewSessions = newSessions.map(formatSession);
        console.log("📤 Sending new sessions to API:", formattedNewSessions);

        await createSessions({
          conferenceId,
          data: { sessions: formattedNewSessions },
        }).unwrap();
      }

      await triggerRefetch();

      if (changedSessions.length > 0 || newSessions.length > 0 || currentDeletedIds.length > 0) {
        const messages: string[] = [];
        if (changedSessions.length > 0) messages.push(`${changedSessions.length} session đã cập nhật`);
        if (newSessions.length > 0) messages.push(`${newSessions.length} session mới`);
        if (currentDeletedIds.length > 0) messages.push(`${currentDeletedIds.length} session đã xóa`);
        
        toast.success(`Lưu thành công! (${messages.join(", ")})`);
      } else {
        toast.info("Không có thay đổi nào cần lưu");
      }

    } else {
      // Mode: create
      const formattedSessions = sessions.map(formatSession);
      console.log("📤 CREATE MODE - Sending sessions to API:", formattedSessions);

      await createSessions({ 
        conferenceId, 
        data: { sessions: formattedSessions } 
      }).unwrap();
      
      if (isSubmittingAll) {
        toast.success("Lưu session thành công!");
      }
    }

    if (isSubmittingAll) {
      dispatch(markStepCompleted(3));
    }
    
    return { success: true };
    
  } catch (error) {
    const apiError = error as { data?: ApiError };
    console.error("❌ Sessions submit failed:", error);
    toast.error(apiError?.data?.message || "Lưu session thất bại!");
    return { success: false, error };
  } finally {
    setIsSubmitting(false);
  }
};

  
  
  const submitPolicies = async (policies: Policy[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      if (mode === "edit") {
        if (deletedPolicyIds.length > 0) {
          await Promise.all(deletedPolicyIds.map((id) => deletePolicy(id).unwrap()));
        }

        const existing = policies.filter((p) => p.policyId);
        if (existing.length > 0) {
          await Promise.all(
            existing.map((policy) =>
              updatePolicy({
                policyId: policy.policyId!,
                data: {
                  policyName: policy.policyName,
                  description: policy.description,
                },
              }).unwrap()
            )
          );
        }

        const newPolicies = policies.filter((p) => !p.policyId);
        if (newPolicies.length > 0) {
          await createPolicies({
            conferenceId,
            data: { policies: newPolicies },
          }).unwrap();
        }

        await triggerRefetch();
      } else {
        if (policies.length === 0) {
          dispatch(markStepCompleted(4));
          toast.info("Đã lưu trạng thái không có chính sách");
          return { success: true, skipped: true };
        }
        await createPolicies({ conferenceId, data: { policies } }).unwrap();
      }

      dispatch(markStepCompleted(4));
      toast.success("Lưu chính sách thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Policies submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu chính sách thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitMedia = async (mediaList: Media[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      if (mode === "edit") {
        if (deletedMediaIds.length > 0) {
          await Promise.all(deletedMediaIds.map((id) => deleteMedia(id).unwrap()));
        }

        const existing = mediaList.filter((m) => m.mediaId);
        if (existing.length > 0) {
          await Promise.all(
            existing.map((media) =>
              updateMedia({
                mediaId: media.mediaId!,
                mediaFile: media.mediaFile instanceof File ? media.mediaFile : undefined,
                mediaUrl: typeof media.mediaFile === "string" ? media.mediaFile : media.mediaUrl,
              }).unwrap()
            )
          );
        }

        const newMedia = mediaList.filter((m) => !m.mediaId);
        if (newMedia.length > 0) {
          await createMedia({
            conferenceId,
            data: { media: newMedia },
          }).unwrap();
        }

        await triggerRefetch();
      } else {
        if (mediaList.length === 0) {
          dispatch(markStepCompleted(5));
          toast.info("Đã lưu trạng thái không có media");
          return { success: true, skipped: true };
        }
        await createMedia({ conferenceId, data: { media: mediaList } }).unwrap();
      }

      dispatch(markStepCompleted(5));
      toast.success("Lưu media thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Media submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu media thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSponsors = async (sponsors: Sponsor[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      if (mode === "edit") {
        if (deletedSponsorIds.length > 0) {
          await Promise.all(deletedSponsorIds.map((id) => deleteSponsor(id).unwrap()));
        }

        const existing = sponsors.filter((s) => s.sponsorId);
        if (existing.length > 0) {
          await Promise.all(
            existing.map((sponsor) =>
              updateSponsor({
                sponsorId: sponsor.sponsorId!,
                name: sponsor.name,
                imageFile: sponsor.imageFile instanceof File ? sponsor.imageFile : undefined,
                imageUrl: typeof sponsor.imageFile === "string" ? sponsor.imageFile : sponsor.imageUrl,
              }).unwrap()
            )
          );
        }

        const newSponsors = sponsors.filter((s) => !s.sponsorId);
        if (newSponsors.length > 0) {
          await createSponsors({
            conferenceId,
            data: { sponsors: newSponsors },
          }).unwrap();
        }

        await triggerRefetch();
        
        dispatch(markStepCompleted(6));
        toast.success("Cập nhật thông tin nhà tài trợ thành công!");
        return { success: true };
      } else {
        if (sponsors.length === 0) {
          dispatch(markStepCompleted(6));
          toast.success("Tạo hội thảo thành công!");
          dispatch(resetWizard());
          if (roles?.includes("Collaborator")) {
            router.push(`/workspace/collaborator/manage-conference`);
          } else if (roles?.includes("Conference Organizer")) {
            router.push(`/workspace/organizer/manage-conference`);
          } else {
            router.push(`/workspace`);
          }
          return { success: true, skipped: true };
        }

        await createSponsors({ conferenceId, data: { sponsors } }).unwrap();
        dispatch(markStepCompleted(6));
        toast.success("Tạo hội thảo thành công!");
        dispatch(resetWizard());
        if (roles?.includes("Collaborator")) {
          router.push(`/workspace/collaborator/manage-conference`);
        } else if (roles?.includes("Conference Organizer")) {
          router.push(`/workspace/organizer/manage-conference`);
        } else {
          router.push(`/workspace`);
        }
        return { success: true };
      }
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Sponsors submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu nhà tài trợ thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAllSteps = (stepsData: {
    basicForm: ConferenceBasicForm;
    tickets: Ticket[];
    sessions: Session[];
    policies: Policy[];
    mediaList: Media[];
    sponsors: Sponsor[];
    eventStartDate: string | undefined;
    eventEndDate: string | undefined;
  }) => {
    const errors: string[] = [];

    const basicValidation = validateBasicForm(stepsData.basicForm);
    if (!basicValidation.isValid) {
      errors.push(`Bước 1 - Thông tin cơ bản: ${basicValidation.message}`);
    }

    if (stepsData.tickets.length === 0) {
      errors.push(`Bước 2 - Giá vé: Vui lòng thêm ít nhất 1 loại vé!`);
    }

    if (stepsData.sessions.length > 0) {
      if (!stepsData.eventStartDate || !stepsData.eventEndDate) {
        errors.push(`Bước 3 - Session: Thiếu ngày bắt đầu/kết thúc hội thảo!`);
      } else {
        const hasStart = stepsData.sessions.some((s) => s.date === stepsData.eventStartDate);
        const hasEnd = stepsData.sessions.some((s) => s.date === stepsData.eventEndDate);
        if (!hasStart || !hasEnd) {
          errors.push(`Bước 3 - Session: Phải có session vào ngày bắt đầu và kết thúc!`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const submitAll = async (stepsData: {
    basicForm: ConferenceBasicForm;
    tickets: Ticket[];
    sessions: Session[];
    policies: Policy[];
    mediaList: Media[];
    sponsors: Sponsor[];
  }) => {
    try {
      setIsSubmitting(true);

      const validation = validateAllSteps({
        ...stepsData,
        eventStartDate: stepsData.basicForm.startDate,
        eventEndDate: stepsData.basicForm.endDate,
      });

      if (!validation.isValid) {
        validation.errors.forEach((err) => toast.error(err));
        return { success: false, errors: validation.errors };
      }

      const results = [];

      const basicResult = await submitBasicInfo(stepsData.basicForm);
      if (!basicResult.success) return { success: false };
      results.push(basicResult);

      const priceResult = await submitPrice(stepsData.tickets);
      if (!priceResult.success) return { success: false };
      results.push(priceResult);

      if (stepsData.sessions.length > 0) {
        const sessionResult = await submitSessions(
          stepsData.sessions,
          stepsData.basicForm.startDate!,
          stepsData.basicForm.endDate!,
          { deletedSessionIds: deletedSessionIds }
        );
        if (!sessionResult.success) return { success: false };
        results.push(sessionResult);
      }

      if (stepsData.policies.length > 0) {
        const policyResult = await submitPolicies(stepsData.policies);
        if (!policyResult.success) return { success: false };
        results.push(policyResult);
      }

      if (stepsData.mediaList.length > 0) {
        const mediaResult = await submitMedia(stepsData.mediaList);
        if (!mediaResult.success) return { success: false };
        results.push(mediaResult);
      }

      const sponsorResult = await submitSponsors(stepsData.sponsors);
      if (!sponsorResult.success) return { success: false };
      results.push(sponsorResult);

      if (mode === "edit") {
        toast.success("Cập nhật hội thảo thành công!");
        dispatch(resetWizard());
        router.push(`/workspace/collaborator/manage-conference`);
      }

      return { success: true };
    } catch (error) {
      console.error("Submit all failed:", error);
      toast.error("Cập nhật toàn bộ thất bại!");
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBasicInfo,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMedia,
    submitSponsors,
    submitAll,
    validateAllSteps,
  };
}
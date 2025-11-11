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
  useCreateBasicConferenceMutation,
  useCreateConferencePriceMutation,
  useCreateConferenceSessionsMutation, 
  useCreateConferencePoliciesMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
} from "@/redux/services/conferenceStep.service";
import type { ApiError } from "@/types/api.type";
import type {
  ConferenceBasicForm,
  ConferencePriceData,
  ConferenceSessionData,
  Ticket,
  Session,
  Policy,
  RefundPolicy,
  Media,
  Sponsor,
} from "@/types/conference.type";

export function useFormSubmit() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const conferenceId = useAppSelector(
    (state) => state.conferenceStep.conferenceId
  );

  // RTK Query mutations
  const [createBasic] = useCreateBasicConferenceMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createSessions] = useCreateConferenceSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  // Step 1: Basic Info
  const submitBasicInfo = async (formData: ConferenceBasicForm) => {
    try {
      setIsSubmitting(true);
      const result = await createBasic(formData).unwrap();
      const confId = result.data.conferenceId;

      dispatch(setConferenceId(confId));
      dispatch(setConferenceBasicData(result.data));
      dispatch(markStepCompleted(1));
      dispatch(nextStep());

      toast.success("Tạo thông tin cơ bản thành công!");
      return { success: true, data: result.data };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create basic info:", error);
      toast.error(apiError?.data?.message || "Tạo thông tin cơ bản thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Price
  const submitPrice = async (tickets: Ticket[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);

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
            refundInPhase: (phase.refundInPhase || []).map((rp) => ({
              percentRefund: rp.percentRefund,
              refundDeadline: rp.refundDeadline,
          })),
          })),
        })),
      };

      await createPrice({ conferenceId, data: priceData }).unwrap();

      dispatch(markStepCompleted(2));
      dispatch(nextStep());
      toast.success("Lưu thông tin giá vé thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create price:", error);
      toast.error(apiError?.data?.message || "Lưu giá vé thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Sessions
  const submitSessions = async (
    sessions: Session[],
    eventStartDate: string,
    eventEndDate: string
  ) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (sessions.length === 0) {
      dispatch(markStepCompleted(3));
      dispatch(nextStep());
      toast.info("Đã bỏ qua phần phiên họp");
      return { success: true, skipped: true };
    }

    const hasSessionOnStartDay = sessions.some((s) => s.date === eventStartDate);
    const hasSessionOnEndDay = sessions.some((s) => s.date === eventEndDate);

    if (!hasSessionOnStartDay || !hasSessionOnEndDay) {
      toast.error(
        "Phải có ít nhất 1 phiên họp vào ngày bắt đầu và 1 phiên họp vào ngày kết thúc hội thảo!"
      );
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      const formattedSessions = sessions.map((s) => {
        const startDateTime = new Date(s.startTime);
        const endDateTime = new Date(s.endTime);
        const startTime = startDateTime.toTimeString().slice(0, 8);
        const endTime = endDateTime.toTimeString().slice(0, 8);

        return {
          title: s.title,
          description: s.description,
          date: s.date,
          startTime: startTime,
          endTime: endTime,
          roomId: s.roomId,
          speaker: s.speaker.map((sp) => ({
            name: sp.name,
            description: sp.description,
            image: sp.image instanceof File ? sp.image : undefined,
            imageUrl: typeof sp.image === "string" ? sp.image : undefined,
          })),
          sessionMedias: (s.sessionMedias || []).map((media) => ({
            mediaFile:
              media.mediaFile instanceof File ? media.mediaFile : undefined,
            mediaUrl:
              typeof media.mediaFile === "string" ? media.mediaFile : undefined,
          })),
        };
      });

      const sessionData: ConferenceSessionData = {
        sessions: formattedSessions,
      };

      await createSessions({ conferenceId, data: sessionData }).unwrap();

      dispatch(markStepCompleted(3));
      dispatch(nextStep());
      toast.success("Lưu phiên họp thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create sessions:", error);
      toast.error(apiError?.data?.message || "Lưu phiên họp thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Policies
const submitPolicies = async (policies: Policy[]) => {
  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return { success: false };
  }

  if (policies.length === 0) {
    dispatch(markStepCompleted(4));
    dispatch(nextStep());
    toast.info("Đã bỏ qua phần chính sách");
    return { success: true, skipped: true };
  }

  try {
    setIsSubmitting(true);

    await createPolicies({ conferenceId, data: { policies } }).unwrap();

    dispatch(markStepCompleted(4));
    dispatch(nextStep());
    toast.success("Lưu chính sách thành công!");
    return { success: true };
  } catch (error) {
    const apiError = error as { data?: ApiError };
    console.error("Failed to create policies:", error);
    toast.error(apiError?.data?.message || "Lưu chính sách thất bại!");
    return { success: false, error };
  } finally {
    setIsSubmitting(false);
  }
};

  // Step 5: Media
  const submitMedia = async (mediaList: Media[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (mediaList.length === 0) {
      dispatch(markStepCompleted(5));
      dispatch(nextStep());
      toast.info("Đã bỏ qua phần media");
      return { success: true, skipped: true };
    }

    try {
      setIsSubmitting(true);

      await createMedia({ conferenceId, data: { media: mediaList } }).unwrap();

      dispatch(markStepCompleted(5));
      dispatch(nextStep());
      toast.success("Lưu media thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create media:", error);
      toast.error(apiError?.data?.message || "Lưu media thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 6: Sponsors (Final)
  const submitSponsors = async (sponsors: Sponsor[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (sponsors.length === 0) {
      dispatch(markStepCompleted(6));
      toast.success("Tạo hội thảo thành công!");
      dispatch(resetWizard());
      router.push(`/workspace/collaborator/manage-conference`);
      return { success: true, skipped: true };
    }

    try {
      setIsSubmitting(true);

      await createSponsors({ conferenceId, data: { sponsors } }).unwrap();

      dispatch(markStepCompleted(6));
      toast.success("Tạo hội thảo thành công!");
      dispatch(resetWizard());
      router.push(`/workspace/collaborator/manage-conference`);
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create sponsors:", error);
      toast.error(apiError?.data?.message || "Lưu nhà tài trợ thất bại!");
      return { success: false, error };
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
  };
}
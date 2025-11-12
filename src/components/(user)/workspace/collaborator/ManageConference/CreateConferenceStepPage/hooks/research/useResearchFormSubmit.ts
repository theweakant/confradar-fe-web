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
import type { ApiError } from "@/types/api.type";
import type {
  ConferenceBasicForm,
  ResearchDetail,
  ResearchPhase,
  Ticket,
  Session,
  ResearchSession,
  Policy,
  RefundPolicy,
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
  Media,
  Sponsor,
  ConferencePriceData,
} from "@/types/conference.type";

export function useResearchFormSubmit() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const conferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);

  // RTK Query mutations
  const [createBasicResearch] = useCreateBasicResearchConferenceMutation();
  const [createResearchDetail] = useCreateResearchDetailMutation();
  const [createResearchPhase] = useCreateResearchPhaseMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createSessions] = useCreateResearchSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createRefundPolicies] = useCreateRefundPoliciesMutation();
  const [createResearchMaterial] = useCreateResearchMaterialMutation();
  const [createResearchRankingFile] = useCreateResearchRankingFileMutation();
  const [createResearchRankingReference] = useCreateResearchRankingReferenceMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  // Step 1: Basic Info
  const submitBasicInfo = async (formData: ConferenceBasicForm) => {
    try {
      setIsSubmitting(true);
      const result = await createBasicResearch(formData).unwrap();
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

  // Step 2: Research Detail
  const submitResearchDetail = async (detail: ResearchDetail) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      await createResearchDetail({ conferenceId, data: detail }).unwrap();

      dispatch(markStepCompleted(2));
      dispatch(nextStep());
      toast.success("Lưu chi tiết nghiên cứu thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create research detail:", error);
      toast.error(apiError?.data?.message || "Lưu chi tiết nghiên cứu thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Research Phase (Timeline)
  const submitResearchPhase = async (phases: ResearchPhase[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);
      await createResearchPhase({
        conferenceId,
        data: phases.map((phase) => ({
          ...phase,
          revisionRoundDeadlines: phase.revisionRoundDeadlines || [],
        })),
      }).unwrap();

      dispatch(markStepCompleted(3));
      dispatch(nextStep());
      toast.success("Lưu timeline thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create research phase:", error);
      toast.error(apiError?.data?.message || "Lưu timeline thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Price
  const submitPrice = async (tickets: Ticket[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return { success: false };
    }

    // Check for at least one author ticket
    const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);
    if (!hasAuthorTicket) {
      toast.error("Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!");
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

      dispatch(markStepCompleted(4));
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

  // Step 5: Sessions
// Step 5: Sessions
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
    dispatch(markStepCompleted(5));
    dispatch(nextStep());
    toast.info("Đã bỏ qua phần phiên họp");
    return { success: true, skipped: true };
  }

  try {
    setIsSubmitting(true);

    await createSessions({
      conferenceId,
      data: { sessions }, 
    }).unwrap();

    dispatch(markStepCompleted(5));
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
  // Step 6: Policies
  const submitPolicies = async (policies: Policy[], refundPolicies: RefundPolicy[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (policies.length === 0 && refundPolicies.length === 0) {
      dispatch(markStepCompleted(6));
      dispatch(nextStep());
      toast.info("Đã bỏ qua phần chính sách");
      return { success: true, skipped: true };
    }

    try {
      setIsSubmitting(true);

      await Promise.all([
        policies.length > 0
          ? createPolicies({ conferenceId, data: { policies } }).unwrap()
          : Promise.resolve(),
        refundPolicies.length > 0
          ? createRefundPolicies({ conferenceId, data: { refundPolicies } }).unwrap()
          : Promise.resolve(),
      ]);

      dispatch(markStepCompleted(6));
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

  // Step 7: Materials & Rankings
  const submitMaterials = async (
    materials: ResearchMaterial[],
    rankingFiles: ResearchRankingFile[],
    rankingReferences: ResearchRankingReference[]
  ) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (materials.length === 0 && rankingFiles.length === 0 && rankingReferences.length === 0) {
      dispatch(markStepCompleted(7));
      dispatch(nextStep());
      toast.info("Đã bỏ qua phần tài liệu");
      return { success: true, skipped: true };
    }

    try {
      setIsSubmitting(true);

      const materialPromises = materials.map((material) =>
        createResearchMaterial({
          conferenceId,
          fileName: material.fileName,
          fileDescription: material.fileDescription,
          file: material.file || undefined,
        }).unwrap()
      );

      const rankingFilePromises = rankingFiles
        .filter((f) => f.fileUrl || f.file)
        .map((file) =>
          createResearchRankingFile({
            conferenceId,
            fileUrl: file.fileUrl || "",
            file: file.file || undefined,
          }).unwrap()
        );

      const rankingRefPromises = rankingReferences.map((ref) =>
        createResearchRankingReference({
          conferenceId,
          referenceUrl: ref.referenceUrl,
        }).unwrap()
      );

      await Promise.all([...materialPromises, ...rankingFilePromises, ...rankingRefPromises]);

      dispatch(markStepCompleted(7));
      dispatch(nextStep());
      toast.success("Lưu tài liệu thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Failed to create materials:", error);
      toast.error(apiError?.data?.message || "Lưu tài liệu thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 8: Media
  const submitMedia = async (mediaList: Media[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (mediaList.length === 0) {
      dispatch(markStepCompleted(8));
      dispatch(nextStep());
      toast.info("Đã bỏ qua phần media");
      return { success: true, skipped: true };
    }

    try {
      setIsSubmitting(true);
      await createMedia({ conferenceId, data: { media: mediaList } }).unwrap();

      dispatch(markStepCompleted(8));
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

  // Step 9: Sponsors (Final)
  const submitSponsors = async (sponsors: Sponsor[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    if (sponsors.length === 0) {
      dispatch(markStepCompleted(9));
      toast.success("Tạo hội thảo nghiên cứu thành công!");
      dispatch(resetWizard());
      router.push(`/workspace/organizer/manage-conference`);
      return { success: true, skipped: true };
    }

    try {
      setIsSubmitting(true);
      await createSponsors({ conferenceId, data: { sponsors } }).unwrap();

      dispatch(markStepCompleted(9));
      toast.success("Tạo hội thảo nghiên cứu thành công!");
      dispatch(resetWizard());
      router.push(`/workspace/organizer/manage-conference`);
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
    submitResearchDetail,
    submitResearchPhase,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMaterials,
    submitMedia,
    submitSponsors,
  };
}
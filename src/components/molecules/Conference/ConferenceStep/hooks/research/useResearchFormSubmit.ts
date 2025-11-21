import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  setConferenceId,
  setConferenceBasicData,
  markStepCompleted,
  resetWizard,
  nextStep
} from "@/redux/slices/conferenceStep.slice";
import {
  // CREATE
  useCreateBasicResearchConferenceMutation,
  useCreateResearchDetailMutation,
  useCreateResearchPhaseMutation,
  useCreateConferencePriceMutation,
  useCreatePhaseForPriceMutation, // ← Thêm
  useCreateResearchSessionsMutation,
  useCreateConferencePoliciesMutation,
  useCreateRefundPoliciesMutation,
  useCreateResearchMaterialMutation,
  useCreateResearchRankingFileMutation,
  useCreateResearchRankingReferenceMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useCreateRevisionRoundDeadlineMutation,
  // UPDATE
  useUpdateResearchBasicMutation,
  useUpdateResearchDetailMutation,
  useUpdateResearchPhaseMutation,
  useUpdateRevisionRoundDeadlineMutation,
  useUpdateConferencePriceMutation,
  useUpdateConferencePricePhaseMutation, 
  useUpdateResearchSessionMutation,
  useUpdateConferencePolicyMutation,
  useUpdateConferenceRefundPolicyMutation,
  useUpdateResearchMaterialMutation,
  useUpdateResearchRankingFileMutation,
  useUpdateResearchRankingReferenceMutation,
  useUpdateConferenceMediaMutation,
  useUpdateConferenceSponsorMutation,
  // DELETE
  useDeleteConferencePriceMutation,
  useDeleteConferencePricePhaseMutation,
  useDeleteConferenceSessionMutation,
  useDeleteConferencePolicyMutation,
  useDeleteRefundPolicyMutation,
  useDeleteResearchMaterialMutation,
  useDeleteResearchRankingFileMutation,
  useDeleteResearchRankingReferenceMutation,
  useDeleteConferenceMediaMutation,
  useDeleteConferenceSponsorMutation,
  useDeleteRevisionRoundDeadlineMutation,
} from "@/redux/services/conferenceStep.service";
import type { ApiError } from "@/types/api.type";
import type {
  ConferenceBasicForm,
  ResearchDetail,
  ResearchPhase,
  Ticket,
  Session,
  Policy,
  RefundPolicy,
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
  Media,
  Sponsor,
  ConferencePriceData,
  RevisionRoundDeadline,
} from "@/types/conference.type";
import { validateBasicForm, validateResearchTimeline } from "../../validations";

interface UseResearchFormSubmitProps {
  onRefetchNeeded?: () => Promise<void>;
  deletedTicketIds?: string[];
  deletedPhaseIds?: string[]; // ← Thêm
  deletedSessionIds?: string[];
  deletedPolicyIds?: string[];
  deletedRefundPolicyIds?: string[];
  deletedMaterialIds?: string[];
  deletedRankingFileIds?: string[];
  deletedRankingReferenceIds?: string[];
  deletedMediaIds?: string[];
  deletedSponsorIds?: string[];
  deletedRevisionDeadlineIds?: string[];
}

export function useResearchFormSubmit(props?: UseResearchFormSubmitProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const conferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);
  const mode = useAppSelector((state) => state.conferenceStep.mode);

  // === CREATE MUTATIONS ===
  const [createBasicResearch] = useCreateBasicResearchConferenceMutation();
  const [createResearchDetail] = useCreateResearchDetailMutation();
  const [createResearchPhase] = useCreateResearchPhaseMutation();
  const [createRevisionDeadline] = useCreateRevisionRoundDeadlineMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createPhaseForPrice] = useCreatePhaseForPriceMutation();
  const [createSessions] = useCreateResearchSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createRefundPolicies] = useCreateRefundPoliciesMutation();
  const [createResearchMaterial] = useCreateResearchMaterialMutation();
  const [createResearchRankingFile] = useCreateResearchRankingFileMutation();
  const [createResearchRankingReference] = useCreateResearchRankingReferenceMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  // === UPDATE MUTATIONS ===
  const [updateBasicResearch] = useUpdateResearchBasicMutation();
  const [updateResearchDetail] = useUpdateResearchDetailMutation();
  const [updateResearchPhase] = useUpdateResearchPhaseMutation();
  const [updateRevisionDeadline] = useUpdateRevisionRoundDeadlineMutation();
  const [updatePrice] = useUpdateConferencePriceMutation();
  const [updatePricePhase] = useUpdateConferencePricePhaseMutation();
  const [updateSession] = useUpdateResearchSessionMutation();
  const [updatePolicy] = useUpdateConferencePolicyMutation();
  const [updateRefundPolicy] = useUpdateConferenceRefundPolicyMutation();
  const [updateMaterial] = useUpdateResearchMaterialMutation();
  const [updateRankingFile] = useUpdateResearchRankingFileMutation();
  const [updateRankingReference] = useUpdateResearchRankingReferenceMutation();
  const [updateMedia] = useUpdateConferenceMediaMutation();
  const [updateSponsor] = useUpdateConferenceSponsorMutation();

  // === DELETE MUTATIONS ===
  const [deletePrice] = useDeleteConferencePriceMutation();
  const [deletePricePhase] = useDeleteConferencePricePhaseMutation(); // ← Thêm
  const [deleteSession] = useDeleteConferenceSessionMutation();
  const [deletePolicy] = useDeleteConferencePolicyMutation();
  const [deleteRefundPolicy] = useDeleteRefundPolicyMutation();
  const [deleteMaterial] = useDeleteResearchMaterialMutation();
  const [deleteRankingFile] = useDeleteResearchRankingFileMutation();
  const [deleteRankingReference] = useDeleteResearchRankingReferenceMutation();
  const [deleteMedia] = useDeleteConferenceMediaMutation();
  const [deleteSponsor] = useDeleteConferenceSponsorMutation();
  const [deleteRevisionDeadline] = useDeleteRevisionRoundDeadlineMutation();

  const {
    deletedTicketIds = [],
    deletedPhaseIds = [], // ← Thêm
    deletedSessionIds = [],
    deletedPolicyIds = [],
    deletedRefundPolicyIds = [],
    deletedMaterialIds = [],
    deletedRankingFileIds = [],
    deletedRankingReferenceIds = [],
    deletedMediaIds = [],
    deletedSponsorIds = [],
    deletedRevisionDeadlineIds = [],
  } = props || {};

  const triggerRefetch = async () => {
    if (mode === "edit" && props?.onRefetchNeeded) {
      try {
        await props.onRefetchNeeded();
      } catch (error) {
        console.error("Refetch failed:", error);
      }
    }
  };

  const formatTicketData = (tickets: Ticket[]): ConferencePriceData => ({
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
  });

  // === STEP 4: PRICE ===
  const submitPrice = async (tickets: Ticket[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);
    if (mode !== "edit" && !hasAuthorTicket) {
      toast.error("Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      if (mode === "edit") {
        // BƯỚC 0: Xóa refund policies bị đánh dấu
        if (deletedRefundPolicyIds.length > 0) {
          await Promise.allSettled(
            deletedRefundPolicyIds.map((id) => deleteRefundPolicy(id).unwrap())
          );
        }

        // BƯỚC 1: Xóa phases bị đánh dấu
        if (deletedPhaseIds.length > 0) {
          await Promise.allSettled(
            deletedPhaseIds.map((id) => deletePricePhase(id).unwrap())
          );
        }

        // BƯỚC 2: Xóa tickets bị đánh dấu
        if (deletedTicketIds.length > 0) {
          await Promise.all(deletedTicketIds.map((id) => deletePrice(id).unwrap()));
        }

        // BƯỚC 3: Cập nhật ticket hiện có
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

        // BƯỚC 4: Xử lý phases của ticket hiện có
        for (const ticket of existingTickets) {
          if (!ticket.phases || ticket.phases.length === 0) continue;

          // Cập nhật phase hiện có
          const existingPhases = ticket.phases.filter((p) => p.pricePhaseId);
          if (existingPhases.length > 0) {
            await Promise.all(
              existingPhases.map((phase) =>
                updatePricePhase({
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
          }

          // Tạo phase mới cho ticket đã tồn tại
          const newPhases = ticket.phases.filter((p) => !p.pricePhaseId);
          if (newPhases.length > 0) {
            await createPhaseForPrice({
              conferencePriceId: ticket.priceId!,
              data: {
                pricePhases: newPhases.map((phase) => ({
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
          }
        }

        // BƯỚC 5: Tạo ticket mới
        const newTickets = tickets.filter((t) => !t.priceId);
        if (newTickets.length > 0) {
          await createPrice({ conferenceId, data: formatTicketData(newTickets) }).unwrap();
        }

        await triggerRefetch();
      } else {
        // MODE CREATE
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại vé!");
          return { success: false };
        }

        await createPrice({ conferenceId, data: formatTicketData(tickets) }).unwrap();
      }

      dispatch(markStepCompleted(4));
      toast.success("Lưu giá vé thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Price submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu giá vé thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Các hàm submit khác (unchanged) ===
  const submitBasicInfo = async (formData: ConferenceBasicForm, autoNext: boolean = true) => {
    if (!formData) return { success: false };
    try {
      setIsSubmitting(true);
      let result;
      if (mode === "edit" && conferenceId) {
        result = await updateBasicResearch({ conferenceId, data: formData }).unwrap();
        toast.success("Cập nhật thông tin cơ bản thành công!");
        await triggerRefetch();
      } else {
        result = await createBasicResearch(formData).unwrap();
        const confId = result.data.conferenceId;
        dispatch(setConferenceId(confId));
        dispatch(setConferenceBasicData(result.data));
        toast.success("Tạo thông tin cơ bản thành công!");
      }
      dispatch(markStepCompleted(1));
      if (autoNext && mode === "create") {
        dispatch(nextStep());
      }
      return { success: true, data: result.data };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Basic submit failed:", error);
      toast.error(apiError?.data?.message || "Thao tác thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResearchDetail = async (detail: ResearchDetail) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }
    try {
      setIsSubmitting(true);
      let result;
      if (mode === "edit") {
        result = await updateResearchDetail({ conferenceId, data: detail }).unwrap();
        toast.success("Cập nhật chi tiết nghiên cứu thành công!");
        await triggerRefetch();
      } else {
        result = await createResearchDetail({ conferenceId, data: detail }).unwrap();
        toast.success("Lưu chi tiết nghiên cứu thành công!");
      }
      dispatch(markStepCompleted(2));
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Research detail submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu chi tiết nghiên cứu thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

const submitResearchPhase = async (phases: ResearchPhase[]) => {
  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return { success: false };
  }

  console.log("=== SUBMIT RESEARCH PHASE ===");
  console.log("Mode:", mode);
  console.log("Total phases received:", phases.length);
  console.log("Phases data:", phases);

  try {
    setIsSubmitting(true);

    if (mode === "edit") {
      if (deletedRevisionDeadlineIds?.length) {
        await Promise.all(
          deletedRevisionDeadlineIds.map((id) => deleteRevisionDeadline(id).unwrap())
        );
      }

      console.log("=== EDIT MODE: Processing phases ===");

      // Loop qua TẤT CẢ phases
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        console.log(`\n--- Processing phase ${i} (${phase.isWaitlist ? 'Waitlist' : 'Main'}) ---`);
        console.log("isWaitlist:", phase.isWaitlist);
        console.log("researchPhaseId:", phase.researchPhaseId);
        console.log("registrationStartDate:", phase.registrationStartDate);
        console.log("fullPaperStartDate:", phase.fullPaperStartDate);
        console.log("reviewStartDate:", phase.reviewStartDate);
        console.log("reviseStartDate:", phase.reviseStartDate);
        console.log("cameraReadyStartDate:", phase.cameraReadyStartDate);

        // Kiểm tra phase có dữ liệu không
        const hasData = !!(
          phase.registrationStartDate ||
          phase.fullPaperStartDate ||
          phase.reviewStartDate ||
          phase.reviseStartDate ||
          phase.cameraReadyStartDate
        );

        console.log("hasData:", hasData);

        // Nếu phase không có dữ liệu, bỏ qua (empty waitlist chưa được tạo)
        if (!hasData) {
          console.log("→ SKIPPED: No data");
          continue;
        }

        // Tính isActive: Main (isWaitlist = false) → isActive = true, Waitlist → false
        const isActiveValue = !phase.isWaitlist;

        if (!phase.researchPhaseId) {
          // CREATE new phase (Main hoặc Waitlist)
          console.log("→ ACTION: CREATE new phase");

          const newPhasePayload: ResearchPhase = {
            ...phase,
            isActive: isActiveValue,
          };

          console.log("Payload to create:", {
            isWaitlist: newPhasePayload.isWaitlist,
            isActive: newPhasePayload.isActive,
            registrationStartDate: newPhasePayload.registrationStartDate,
          });

          console.log("📤 Sending CREATE request...");

          // ✅ Xử lý toàn bộ logic tạo phase và deadlines trong try/catch
          try {
            const newPhaseRes = await createResearchPhase({
              conferenceId,
              data: [newPhasePayload],
            }).unwrap();

            console.log("✅ Create response:", newPhaseRes);

            const createdPhase = Array.isArray(newPhaseRes.data) ? newPhaseRes.data[0] : null;
            const newPhaseId = createdPhase?.researchPhaseId;

            // Tạo revision deadlines nếu có
            if (newPhaseId && phase.revisionRoundDeadlines?.length) {
              console.log("Creating revision deadlines for new phase...");
              await Promise.all(
                phase.revisionRoundDeadlines.map((deadline) =>
                  createRevisionDeadline({
                    researchConferencePhaseId: newPhaseId,
                    data: {
                      startSubmissionDate: deadline.startSubmissionDate,
                      endSubmissionDate: deadline.endSubmissionDate,
                    },
                  }).unwrap()
                )
              );
            }
          } catch (createError) {
            console.error("❌ CREATE FAILED for phase", i, ":", createError);
            // Tiếp tục xử lý phase tiếp theo
            continue;
          }
        } else {
          // UPDATE existing phase
          console.log("→ ACTION: UPDATE existing phase");

          await updateResearchPhase({
            researchPhaseId: phase.researchPhaseId!,
            data: {
              registrationStartDate: phase.registrationStartDate,
              registrationEndDate: phase.registrationEndDate,
              fullPaperStartDate: phase.fullPaperStartDate,
              fullPaperEndDate: phase.fullPaperEndDate,
              reviewStartDate: phase.reviewStartDate,
              reviewEndDate: phase.reviewEndDate,
              reviseStartDate: phase.reviseStartDate,
              reviseEndDate: phase.reviseEndDate,
              cameraReadyStartDate: phase.cameraReadyStartDate,
              cameraReadyEndDate: phase.cameraReadyEndDate,
              isWaitlist: phase.isWaitlist,
              isActive: isActiveValue,
            },
          }).unwrap();

          // Xử lý revision deadlines
          const existingDeadlines = phase.revisionRoundDeadlines.filter(d => d.revisionRoundDeadlineId);
          const newDeadlines = phase.revisionRoundDeadlines.filter(d => !d.revisionRoundDeadlineId);

          if (existingDeadlines.length > 0) {
            await Promise.all(
              existingDeadlines.map(deadline =>
                updateRevisionDeadline({
                  deadlineId: deadline.revisionRoundDeadlineId!,
                  startSubmissionDate: deadline.startSubmissionDate,
                  endSubmissionDate: deadline.endSubmissionDate,
                }).unwrap()
              )
            );
          }

          if (newDeadlines.length > 0) {
            await Promise.all(
              newDeadlines.map(deadline =>
                createRevisionDeadline({
                  researchConferencePhaseId: phase.researchPhaseId!,
                  data: {
                    startSubmissionDate: deadline.startSubmissionDate,
                    endSubmissionDate: deadline.endSubmissionDate,
                  },
                }).unwrap()
              )
            );
          }
        }
      }

      console.log("=== EDIT MODE: All phases processed ===");
      toast.success("Cập nhật timeline và các đợt nộp bản sửa thành công!");
      await triggerRefetch();
    } else {
      // CREATE MODE
      console.log("=== CREATE MODE ===");

      // Lọc bỏ empty phases
      const validPhases = phases.filter(phase => {
        const hasData = !!(
          phase.registrationStartDate ||
          phase.fullPaperStartDate ||
          phase.reviewStartDate ||
          phase.reviseStartDate ||
          phase.cameraReadyStartDate
        );
        console.log(`Phase ${phase.isWaitlist ? 'Waitlist' : 'Main'} hasData:`, hasData);
        return hasData;
      });

      console.log("Valid phases count:", validPhases.length);
      console.log("Valid phases:", validPhases);

      if (validPhases.length === 0) {
        toast.error("Vui lòng điền ít nhất 1 timeline!");
        return { success: false };
      }

      // Set isActive dựa trên isWaitlist
      const phasesPayload: ResearchPhase[] = validPhases.map(phase => ({
        ...phase,
        isActive: !phase.isWaitlist,
      }));

      console.log("Payload to create:", phasesPayload);

      const createdResponse = await createResearchPhase({
        conferenceId,
        data: phasesPayload,
      }).unwrap();

      console.log("Create response:", createdResponse);

      const createdPhases = Array.isArray(createdResponse.data) ? createdResponse.data : [];
      const deadlinePromises: Promise<unknown>[] = [];

      validPhases.forEach((phase, index) => {
        const createdPhase = createdPhases[index];
        if (createdPhase?.researchPhaseId && phase.revisionRoundDeadlines?.length) {
          phase.revisionRoundDeadlines.forEach(deadline => {
            deadlinePromises.push(
              createRevisionDeadline({
                researchConferencePhaseId: createdPhase.researchPhaseId!,
                data: {
                  startSubmissionDate: deadline.startSubmissionDate,
                  endSubmissionDate: deadline.endSubmissionDate,
                },
              }).unwrap()
            );
          });
        }
      });

      if (deadlinePromises.length > 0) {
        await Promise.all(deadlinePromises);
        toast.success("Lưu timeline và các đợt nộp bản sửa thành công!");
      } else {
        toast.success("Lưu timeline thành công!");
      }
    }

    dispatch(markStepCompleted(3));
    return { success: true };
  } catch (error) {
    const apiError = error as { data?: ApiError };
    console.error("Research phase submit failed:", error);
    toast.error(apiError?.data?.message || "Lưu timeline thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.");
    return { success: false, error };
  } finally {
    setIsSubmitting(false);
  }
};

const submitSessions = async (
  sessions: Session[],
  options?: { deletedSessionIds?: string[] }
) => {
  const currentDeletedIds = options?.deletedSessionIds || deletedSessionIds;

  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return { success: false };
  }

  try {
    setIsSubmitting(true);
    if (mode === "edit") {
      if (currentDeletedIds.length > 0) {
        await Promise.all(currentDeletedIds.map((id) => deleteSession(id).unwrap()));
      }
      const existing = sessions.filter((s) => s.sessionId);
      if (existing.length > 0) {
        await Promise.all(
          existing.map((session) =>
            updateSession({
              sessionId: session.sessionId!,
              data: {
                title: session.title,
                description: session.description,
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
                roomId: session.roomId,
              },
            }).unwrap()
          )
        );
      }
      const newSessions = sessions.filter((s) => !s.sessionId);
      if (newSessions.length > 0) {
        await createSessions({ conferenceId, data: { sessions: newSessions } }).unwrap();
      }
      await triggerRefetch();
    } else {
      if (sessions.length === 0) {
        dispatch(markStepCompleted(5));
        toast.info("Đã bỏ qua phần phiên họp");
        return { success: true, skipped: true };
      }
      await createSessions({ conferenceId, data: { sessions } }).unwrap();
    }
    dispatch(markStepCompleted(5));
    toast.success("Lưu phiên họp thành công!");
    return { success: true };
  } catch (error) {
    const apiError = error as { data?: ApiError };
    console.error("Sessions submit failed:", error);
    toast.error(apiError?.data?.message || "Lưu phiên họp thất bại!");
    return { success: false, error };
  } finally {
    setIsSubmitting(false);
  }
};

  const submitPolicies = async (policies: Policy[], refundPolicies: RefundPolicy[]) => {
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
        if (deletedRefundPolicyIds.length > 0) {
          await Promise.all(deletedRefundPolicyIds.map((id) => deleteRefundPolicy(id).unwrap()));
        }
        const existingPolicies = policies.filter((p) => p.policyId);
        const newPolicies = policies.filter((p) => !p.policyId);
        if (existingPolicies.length > 0) {
          await Promise.all(
            existingPolicies.map((policy) =>
              updatePolicy({
                policyId: policy.policyId!,
                data: { policyName: policy.policyName, description: policy.description },
              }).unwrap()
            )
          );
        }
        if (newPolicies.length > 0) {
          await createPolicies({ conferenceId, data: { policies: newPolicies } }).unwrap();
        }
        const existingRefunds = refundPolicies.filter((r) => r.refundPolicyId);
        const newRefunds = refundPolicies.filter((r) => !r.refundPolicyId);
        if (existingRefunds.length > 0) {
          await Promise.all(
            existingRefunds.map((refund) =>
              updateRefundPolicy({
                refundPolicyId: refund.refundPolicyId!,
                data: {
                  percentRefund: refund.percentRefund,
                  refundDeadline: refund.refundDeadline,
                  refundOrder: refund.refundOrder,
                },
              }).unwrap()
            )
          );
        }
        if (newRefunds.length > 0) {
          await createRefundPolicies({ conferenceId, data: { refundPolicies: newRefunds } }).unwrap();
        }
        await triggerRefetch();
      } else {
        if (policies.length === 0 && refundPolicies.length === 0) {
          dispatch(markStepCompleted(6));
          toast.info("Đã bỏ qua phần chính sách");
          return { success: true, skipped: true };
        }
        await Promise.all([
          policies.length > 0
            ? createPolicies({ conferenceId, data: { policies } }).unwrap()
            : Promise.resolve(),
          refundPolicies.length > 0
            ? createRefundPolicies({ conferenceId, data: { refundPolicies } }).unwrap()
            : Promise.resolve(),
        ]);
      }
      dispatch(markStepCompleted(6));
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

  const submitMaterials = async (
    materials: ResearchMaterial[],
    rankingFiles: ResearchRankingFile[],
    rankingReferences: ResearchRankingReference[]
  ) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }
    try {
      setIsSubmitting(true);
      if (mode === "edit") {
        if (deletedMaterialIds.length > 0) {
          await Promise.all(deletedMaterialIds.map((id) => deleteMaterial(id).unwrap()));
        }
        if (deletedRankingFileIds.length > 0) {
          await Promise.all(deletedRankingFileIds.map((id) => deleteRankingFile(id).unwrap()));
        }
        if (deletedRankingReferenceIds.length > 0) {
          await Promise.all(deletedRankingReferenceIds.map((id) => deleteRankingReference(id).unwrap()));
        }
        const existingMaterials = materials.filter((m) => m.materialId);
        if (existingMaterials.length > 0) {
          await Promise.all(
            existingMaterials.map((mat) =>
              updateMaterial({
                materialId: mat.materialId!,
                fileDescription: mat.fileDescription,
                file: mat.file instanceof File ? mat.file : undefined,
              }).unwrap()
            )
          );
        }
        const newMaterials = materials.filter((m) => !m.materialId);
        if (newMaterials.length > 0) {
          await Promise.all(
            newMaterials.map((mat) =>
              createResearchMaterial({
                conferenceId,
                fileName: mat.fileName,
                fileDescription: mat.fileDescription,
                file: mat.file instanceof File ? mat.file : undefined,
              }).unwrap()
            )
          );
        }
        const existingRankingFiles = rankingFiles.filter((f) => f.rankingFileId);
        if (existingRankingFiles.length > 0) {
          await Promise.all(
            existingRankingFiles.map((file) =>
              updateRankingFile({
                rankingFileId: file.rankingFileId!,
                fileUrl: file.fileUrl,
                file: file.file instanceof File ? file.file : undefined,
              }).unwrap()
            )
          );
        }
        const newRankingFiles = rankingFiles.filter((f) => !f.rankingFileId);
        if (newRankingFiles.length > 0) {
          await Promise.all(
            newRankingFiles.map((file) =>
              createResearchRankingFile({
                conferenceId,
                fileUrl: file.fileUrl ?? "",
                file: file.file instanceof File ? file.file : undefined,
              }).unwrap()
            )
          );
        }
        const existingRefs = rankingReferences.filter((r) => r.rankingReferenceId);
        if (existingRefs.length > 0) {
          await Promise.all(
            existingRefs.map((ref) =>
              updateRankingReference({
                referenceId: ref.rankingReferenceId!,
                referenceUrl: ref.referenceUrl,
              }).unwrap()
            )
          );
        }
        const newRefs = rankingReferences.filter((r) => !r.rankingReferenceId);
        if (newRefs.length > 0) {
          await Promise.all(
            newRefs.map((ref) =>
              createResearchRankingReference({
                conferenceId,
                referenceUrl: ref.referenceUrl,
              }).unwrap()
            )
          );
        }
        await triggerRefetch();
      } else {
        if (materials.length === 0 && rankingFiles.length === 0 && rankingReferences.length === 0) {
          dispatch(markStepCompleted(7));
          toast.info("Đã bỏ qua phần tài liệu");
          return { success: true, skipped: true };
        }
        await Promise.all([
          ...materials.map((mat) =>
            createResearchMaterial({
              conferenceId,
              fileName: mat.fileName,
              fileDescription: mat.fileDescription,
              file: mat.file instanceof File ? mat.file : undefined,
            }).unwrap()
          ),
          ...rankingFiles.map((file) =>
            createResearchRankingFile({
              conferenceId,
              fileUrl: file.fileUrl ?? "",
              file: file.file instanceof File ? file.file : undefined,
            }).unwrap()
          ),
          ...rankingReferences.map((ref) =>
            createResearchRankingReference({
              conferenceId,
              referenceUrl: ref.referenceUrl,
            }).unwrap()
          ),
        ]);
      }
      dispatch(markStepCompleted(7));
      toast.success("Lưu tài liệu thành công!");
      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Materials submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu tài liệu thất bại!");
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
          await createMedia({ conferenceId, data: { media: newMedia } }).unwrap();
        }
        await triggerRefetch();
      } else {
        if (mediaList.length === 0) {
          dispatch(markStepCompleted(8));
          toast.info("Đã bỏ qua phần media");
          return { success: true, skipped: true };
        }
        await createMedia({ conferenceId, data: { media: mediaList } }).unwrap();
      }
      dispatch(markStepCompleted(8));
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
          await createSponsors({ conferenceId, data: { sponsors: newSponsors } }).unwrap();
        }
        await triggerRefetch();
        dispatch(markStepCompleted(9));
        toast.success("Cập nhật nhà tài trợ thành công!");
        return { success: true };
      } else {
        if (sponsors.length === 0) {
          dispatch(markStepCompleted(9));
          toast.success("Tạo hội thảo thành công!");
          dispatch(resetWizard());
          router.push(`/workspace/organizer/manage-conference`);
          return { success: true, skipped: true };
        }
        await createSponsors({ conferenceId, data: { sponsors } }).unwrap();
        dispatch(markStepCompleted(9));
        toast.success("Tạo hội thảo thành công!");
        dispatch(resetWizard());
        router.push(`/workspace/organizer/manage-conference`);
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
    researchDetail: ResearchDetail;
    researchPhases: ResearchPhase[];
    tickets: Ticket[];
    sessions: Session[];
    policies: Policy[];
    refundPolicies: RefundPolicy[];
    researchMaterials: ResearchMaterial[];
    rankingFiles: ResearchRankingFile[];
    rankingReferences: ResearchRankingReference[];
    mediaList: Media[];
    sponsors: Sponsor[];
  }) => {
    const errors: string[] = [];
    const basicValidation = validateBasicForm(stepsData.basicForm);
    if (!basicValidation.isValid) {
      errors.push(`Bước 1 - Thông tin cơ bản: ${basicValidation.error}`);
    }
    if (!stepsData.researchDetail.rankingCategoryId) {
      errors.push(`Bước 2 - Chi tiết nghiên cứu: Vui lòng chọn loại xếp hạng!`);
    }
    const mainPhase = stepsData.researchPhases[0];
    if (!mainPhase) {
      errors.push(`Bước 3 - Timeline: Main timeline là bắt buộc!`);
    } else {
      const mainValidation = validateResearchTimeline(mainPhase, stepsData.basicForm.ticketSaleStart);
      if (!mainValidation.isValid) {
        errors.push(`Bước 3 - Main Timeline: ${mainValidation.error}`);
      }
    }
    const waitlistPhase = stepsData.researchPhases[1];
    if (waitlistPhase) {
      const hasWaitlistData =
        waitlistPhase.registrationStartDate ||
        waitlistPhase.fullPaperStartDate ||
        waitlistPhase.reviewStartDate ||
        waitlistPhase.reviseStartDate ||
        waitlistPhase.cameraReadyStartDate;
      if (hasWaitlistData) {
        const waitlistValidation = validateResearchTimeline(waitlistPhase, stepsData.basicForm.ticketSaleStart);
        if (!waitlistValidation.isValid) {
          errors.push(`Bước 3 - Waitlist Timeline: ${waitlistValidation.error}`);
        }
        if (mainPhase && mainPhase.cameraReadyEndDate && waitlistPhase.registrationStartDate) {
          const mainEnd = new Date(mainPhase.cameraReadyEndDate);
          const waitlistStart = new Date(waitlistPhase.registrationStartDate);
          if (waitlistStart <= mainEnd) {
            errors.push(`Bước 3 - Waitlist timeline phải bắt đầu sau khi Main timeline kết thúc!`);
          }
        }
      }
    }
    if (stepsData.tickets.length === 0) {
      errors.push(`Bước 4 - Giá vé: Vui lòng thêm ít nhất 1 loại vé!`);
    } else {
      const hasAuthorTicket = stepsData.tickets.some((t) => t.isAuthor === true);
      if (!hasAuthorTicket) {
        errors.push(`Bước 4 - Giá vé: Hội nghị nghiên cứu cần có ít nhất một loại vé dành cho tác giả!`);
      }
    }
    return { isValid: errors.length === 0, errors };
  };

  const submitAll = async (stepsData: {
    basicForm: ConferenceBasicForm;
    researchDetail: ResearchDetail;
    researchPhases: ResearchPhase[];
    tickets: Ticket[];
    sessions: Session[];
    policies: Policy[];
    refundPolicies: RefundPolicy[];
    researchMaterials: ResearchMaterial[];
    rankingFiles: ResearchRankingFile[];
    rankingReferences: ResearchRankingReference[];
    mediaList: Media[];
    sponsors: Sponsor[];
  }) => {
    try {
      setIsSubmitting(true);
      const validation = validateAllSteps(stepsData);
      if (!validation.isValid) {
        validation.errors.forEach((err) => toast.error(err));
        return { success: false, errors: validation.errors };
      }
      await submitBasicInfo(stepsData.basicForm);
      await submitResearchDetail(stepsData.researchDetail);
      await submitResearchPhase(stepsData.researchPhases);
      await submitPrice(stepsData.tickets);
      if (stepsData.sessions.length > 0) {
        await submitSessions(stepsData.sessions, { deletedSessionIds: deletedSessionIds });
      }
      if (stepsData.policies.length > 0 || stepsData.refundPolicies.length > 0) {
        await submitPolicies(stepsData.policies, stepsData.refundPolicies);
      }
      if (stepsData.researchMaterials.length > 0 || stepsData.rankingFiles.length > 0 || stepsData.rankingReferences.length > 0) {
        await submitMaterials(stepsData.researchMaterials, stepsData.rankingFiles, stepsData.rankingReferences);
      }
      if (stepsData.mediaList.length > 0) await submitMedia(stepsData.mediaList);
      await submitSponsors(stepsData.sponsors);
      if (mode === "edit") {
        toast.success("Cập nhật hội thảo nghiên cứu thành công!");
        dispatch(resetWizard());
        router.push(`/workspace/organizer/manage-conference`);
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
    submitResearchDetail,
    submitResearchPhase,
    submitPrice,
    submitSessions,
    submitPolicies,
    submitMaterials,
    submitMedia,
    submitSponsors,
    submitAll,
    validateAllSteps,
  };
}
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
    ResearchSession,
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
  import { validateBasicForm, validateAllResearchPhases } from "../../validations";

 const hasSessionChanged = (
   current: ResearchSession,
   initial: ResearchSession
 ): boolean => {
   return (
     current.title !== initial.title ||
     current.description !== initial.description ||
     current.date !== initial.date ||
     current.startTime !== initial.startTime ||
     current.endTime !== initial.endTime ||
     current.roomId !== initial.roomId
   );
 };

 const hasOnlyRoomIdChanged = (
  current: ResearchSession,
  initial: ResearchSession
): boolean => {
  return (
    current.roomId !== initial.roomId &&
    current.title === initial.title &&
    current.description === initial.description &&
    current.date === initial.date &&
    current.startTime === initial.startTime &&
    current.endTime === initial.endTime
  );
};

  interface UseResearchFormSubmitProps {
    onRefetchNeeded?: () => Promise<void>;
    stepsWithData?: Set<number>;
    deletedTicketIds?: string[];
    deletedPhaseIds?: string[];
    deletedSessionIds?: string[];
    deletedPolicyIds?: string[];
    deletedRefundPolicyIds?: string[];
    deletedMaterialIds?: string[];
    deletedRankingFileIds?: string[];
    deletedRankingReferenceIds?: string[];
    deletedMediaIds?: string[];
    deletedSponsorIds?: string[];
    deletedRevisionDeadlineIds?: string[];
    initialSessions?: ResearchSession[];

  }

  export function useResearchFormSubmit(props?: UseResearchFormSubmitProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const conferenceId = useAppSelector((state) => state.conferenceStep.conferenceId);
    const mode = useAppSelector((state) => state.conferenceStep.mode);

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

    const [updateBasicResearch] = useUpdateResearchBasicMutation();
    const [updateResearchDetail] = useUpdateResearchDetailMutation();
    const [updateResearchPhase] = useUpdateResearchPhaseMutation();
    const [updateRevisionDeadline] = useUpdateRevisionRoundDeadlineMutation();
    const [updatePrice] = useUpdateConferencePriceMutation();
    const [updateSession] = useUpdateResearchSessionMutation();
    const [updatePolicy] = useUpdateConferencePolicyMutation();
    const [updateRefundPolicy] = useUpdateConferenceRefundPolicyMutation();
    const [updateMaterial] = useUpdateResearchMaterialMutation();
    const [updateRankingFile] = useUpdateResearchRankingFileMutation();
    const [updateRankingReference] = useUpdateResearchRankingReferenceMutation();
    const [updateMedia] = useUpdateConferenceMediaMutation();
    const [updateSponsor] = useUpdateConferenceSponsorMutation();

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
      stepsWithData = new Set(), 
      deletedTicketIds = [],
      deletedPhaseIds = [], 
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
        isPublish: ticket.isPublish ?? false,
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

  const submitPrice = async (tickets: Ticket[]) => {
    if (!conferenceId) {
      toast.error("Không tìm thấy conference ID!");
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      if (mode === "edit") {
        if (deletedTicketIds.length > 0) {
          await Promise.all(
            deletedTicketIds.map((id) => deletePrice(id).unwrap())
          );
        }

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
                  isPublish: ticket.isPublish ?? false,
                  totalSlot: ticket.totalSlot,
                },
              }).unwrap()
            )
          );
        }


        const newTickets = tickets.filter((t) => !t.priceId);
        if (newTickets.length > 0) {
          await createPrice({
            conferenceId,
            data: formatTicketData(newTickets),
          }).unwrap();
        }

        await triggerRefetch();
        toast.success("Cập nhật giá thành công!");

      } else {
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại chi phí!");
          return { success: false };
        }

        const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);
        if (!hasAuthorTicket) {
          toast.error("Hội nghị nghiên cứu cần có ít nhất một loại chi phí dành cho tác giả!");
          return { success: false };
        }

        await createPrice({
          conferenceId,
          data: formatTicketData(tickets),
        }).unwrap();

        toast.success("Lưu giá thành công!");
      }

      dispatch(markStepCompleted(4));
      return { success: true };

    } catch (error) {
      const apiError = error as { data?: ApiError };
      console.error("Price submit failed:", error);
      toast.error(apiError?.data?.message || "Lưu giá thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      const hasExistingDetail = stepsWithData.has(2);
      
      
      if (hasExistingDetail) {
        result = await updateResearchDetail({ 
          conferenceId, 
          data: detail 
        }).unwrap();
        toast.success("Cập nhật chi tiết nghiên cứu thành công!");
        await triggerRefetch();
      } else {
        result = await createResearchDetail({ 
          conferenceId, 
          data: detail 
        }).unwrap();
        toast.success("Lưu chi tiết nghiên cứu thành công!");
        
        if (mode === "edit") {
          await triggerRefetch();
        }
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

    try {
      setIsSubmitting(true);

      const requiredFields: (keyof ResearchPhase)[] = [
        "registrationStartDate",
        "registrationEndDate",
        "abstractDecideStatusStart",
        "abstractDecideStatusEnd",
        "fullPaperStartDate",
        "fullPaperEndDate",
        "reviewStartDate",
        "reviewEndDate",
        "fullPaperDecideStatusStart",
        "fullPaperDecideStatusEnd",
        "reviseStartDate",
        "reviseEndDate",
        "revisionPaperDecideStatusStart",
        "revisionPaperDecideStatusEnd",
        "cameraReadyStartDate",
        "cameraReadyEndDate",
        "authorPaymentStart",
        "authorPaymentEnd",
      ];

      const validPhases = phases.filter((phase) =>
        requiredFields.every((field) => !!phase[field])
      );

      if (validPhases.length === 0) {
        toast.error("Không có giai đoạn hợp lệ để gửi!");
        return { success: false };
      }

      const phasesToCreate = validPhases.filter((p) => !p.researchPhaseId);
      const phasesToUpdate = validPhases.filter((p) => p.researchPhaseId);

      if (phasesToCreate.length > 0) {
        await createResearchPhase({
          conferenceId,
          data: phasesToCreate,
        }).unwrap();
      }

      if (phasesToUpdate.length > 0) {
        await Promise.all(
          phasesToUpdate.map(async (phase) => {
            if (!phase.researchPhaseId) return;
            await updateResearchPhase({
              researchPhaseId: phase.researchPhaseId!,
              data: phase, 
            }).unwrap();
          })
        );
      }

      await triggerRefetch();
      toast.success("Lưu timeline thành công!");
      dispatch(markStepCompleted(3));

      return { success: true };
    } catch (error) {
      const apiError = error as { data?: ApiError };
      toast.error(apiError?.data?.message || "Lưu timeline thất bại!");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

const submitSessions = async (
  sessions: ResearchSession[],
  options?: { 
    deletedSessionIds?: string[];
    initialSessions?: ResearchSession[];
    conferenceStatusName?: string;
  }
) => {
  const currentDeletedIds = options?.deletedSessionIds || deletedSessionIds;
  const initialSessions = options?.initialSessions || [];
  const conferenceStatusName = options?.conferenceStatusName || "";

  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return { success: false };
  }

  try {
    setIsSubmitting(true);
    
    // ✅ GỬI TRỰC TIẾP ISO STRINGS - KHÔNG normalize ở đây nữa
    console.log("📤 Sending ISO strings to API:", sessions.map(s => ({
      title: s.title,
      startTime: s.startTime,  // ISO: "2026-11-05T01:00:00.000Z"
      endTime: s.endTime,      // ISO: "2026-11-05T03:00:00.000Z"
      date: s.date,
    })));
    
    if (mode === "edit") {
      const isReadyStatus = conferenceStatusName === "Ready";

      // 1. Xóa sessions (KHÔNG cho phép khi Ready)
      if (!isReadyStatus && currentDeletedIds.length > 0) {
        await Promise.all(
          currentDeletedIds.map((id) => deleteSession(id).unwrap())
        );
      } else if (isReadyStatus && currentDeletedIds.length > 0) {
        toast.error("Không thể xóa session khi hội nghị ở trạng thái Ready!");
        return { success: false };
      }

      // 2. Tìm sessions đã thay đổi
      let changedSessions: ResearchSession[] = [];
      
      if (isReadyStatus) {
        // ✅ Khi Ready: CHỈ cho phép sessions có roomId thay đổi
        changedSessions = sessions.filter((currentSession) => {
          if (!currentSession.sessionId) return false;

          const initialSession = initialSessions.find(
            (s) => s.sessionId === currentSession.sessionId
          );

          if (!initialSession) return false;

          return hasOnlyRoomIdChanged(currentSession, initialSession);
        });

        // Kiểm tra có session nào thay đổi field khác không
        const invalidChanges = sessions.filter((currentSession) => {
          if (!currentSession.sessionId) return false;

          const initialSession = initialSessions.find(
            (s) => s.sessionId === currentSession.sessionId
          );

          if (!initialSession) return false;

          return hasSessionChanged(currentSession, initialSession) && 
                !hasOnlyRoomIdChanged(currentSession, initialSession);
        });

        if (invalidChanges.length > 0) {
          toast.error("Ở trạng thái Ready, chỉ được phép gán phòng cho session!");
          return { success: false };
        }

      } else {
        // ✅ Khi KHÔNG phải Ready: Cho phép thay đổi bất kỳ field nào
        changedSessions = sessions.filter((currentSession) => {
          if (!currentSession.sessionId) return false;

          const initialSession = initialSessions.find(
            (s) => s.sessionId === currentSession.sessionId
          );

          if (!initialSession) return true;

          return hasSessionChanged(currentSession, initialSession);
        });
      }

      // 3. Cập nhật sessions đã thay đổi
      if (changedSessions.length > 0) {
        await Promise.all(
          changedSessions.map((session) => {
            if (!session.sessionId) {
              throw new Error(`Session "${session.title}" không có ID`);
            }

            // ✅ Khi Ready: CHỈ gửi roomId
            if (isReadyStatus) {
              return updateSession({
                sessionId: session.sessionId,
                data: {
                  roomId: session.roomId,
                },
              }).unwrap();
            }

            // ✅ Gửi ISO strings - RTK Query sẽ convert sang "HH:mm:ss"
            return updateSession({
              sessionId: session.sessionId,
              data: {
                title: session.title,
                description: session.description,
                date: session.date,
                startTime: session.startTime,  // ✅ ISO string
                endTime: session.endTime,      // ✅ ISO string
                roomId: session.roomId,
              },
            }).unwrap();
          })
        );
      }

      // 4. Tạo sessions mới (KHÔNG cho phép khi Ready)
      const newSessions = sessions.filter((s) => !s.sessionId);
      if (isReadyStatus && newSessions.length > 0) {
        toast.error("Không thể tạo session mới khi hội nghị ở trạng thái Ready!");
        return { success: false };
      }

      if (!isReadyStatus && newSessions.length > 0) {
        await createSessions({ 
          conferenceId, 
          data: { sessions: newSessions }  // ✅ ISO strings
        }).unwrap();
      }

      await triggerRefetch();

      if (changedSessions.length > 0 || newSessions.length > 0 || currentDeletedIds.length > 0) {
        toast.success(isReadyStatus ? "Cập nhật phòng thành công!" : "Cập nhật phiên họp thành công!");
      } else {
        toast.info("Không có thay đổi nào cần lưu");
      }

    } else {
      // Mode "create"
      if (sessions.length === 0) {
        dispatch(markStepCompleted(5));
        toast.info("Đã bỏ qua phần phiên họp");
        return { success: true, skipped: true };
      }
      
      await createSessions({ 
        conferenceId, 
        data: { sessions }  // ✅ ISO strings
      }).unwrap();
      
      toast.success("Tạo phiên họp thành công!");
    }

    dispatch(markStepCompleted(5));
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
            await Promise.all(
              deletedMaterialIds.map((id) => deleteMaterial(id).unwrap())
            );
          }

          if (deletedRankingFileIds.length > 0) {
            await Promise.all(
              deletedRankingFileIds.map((id) => deleteRankingFile(id).unwrap())
            );
          }

          if (deletedRankingReferenceIds.length > 0) {
            await Promise.all(
              deletedRankingReferenceIds.map((id) =>
                deleteRankingReference(id).unwrap()
              )
            );
          }

          const existingMaterials = materials.filter((m) => m.materialId);
          if (existingMaterials.length > 0) {
            const materialsWithNewFile = existingMaterials.filter(
              (mat): mat is ResearchMaterial & { file: File } => mat.file instanceof File
            );

            if (materialsWithNewFile.length > 0) {
              await Promise.all(
                materialsWithNewFile.map((mat) =>
                  updateMaterial({
                    materialId: mat.materialId!,
                    fileDescription: mat.fileDescription,
                    file: mat.file,
                  }).unwrap()
                )
              );
            }
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
            const filesWithNewFile = existingRankingFiles.filter(
              (file): file is ResearchRankingFile & { file: File } => file.file instanceof File
            );

            if (filesWithNewFile.length > 0) {
              await Promise.all(
                filesWithNewFile.map((file) =>
                  updateRankingFile({
                    rankingFileId: file.rankingFileId!,
                    fileUrl: file.fileUrl,
                    file: file.file,
                  }).unwrap()
                )
              );
            }
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
          toast.success("Cập nhật tài liệu thành công!");

        } else {
          if (
            materials.length === 0 &&
            rankingFiles.length === 0 &&
            rankingReferences.length === 0
          ) {
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

          toast.success("Lưu tài liệu thành công!");
        }

        dispatch(markStepCompleted(7));
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
            toast.success("Tạo hội nghị thành công!");
            dispatch(resetWizard());
            router.push(`/workspace/organizer/manage-conference`);
            return { success: true, skipped: true };
          }
          await createSponsors({ conferenceId, data: { sponsors } }).unwrap();
          dispatch(markStepCompleted(9));
          toast.success("Tạo hội nghị thành công!");
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
    sessions: ResearchSession[];
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

    const timelineValidation = validateAllResearchPhases(
      stepsData.researchPhases,
      stepsData.basicForm.startDate 
    );
    if (!timelineValidation.isValid) {
      errors.push(`Bước 3 - Timeline: ${timelineValidation.error}`);
    }

    if (stepsData.tickets.length === 0) {
      errors.push(`Bước 4 - Chi phí: Vui lòng thêm ít nhất 1 loại chi phí!`);
    } else {
      const hasAuthorTicket = stepsData.tickets.some((t) => t.isAuthor === true);
      if (!hasAuthorTicket) {
        errors.push(`Bước 4 - Chi phí: Hội nghị nghiên cứu cần có ít nhất một loại chi phí dành cho tác giả!`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

    const submitAll = async (stepsData: {
      basicForm: ConferenceBasicForm;
      researchDetail: ResearchDetail;
      researchPhases: ResearchPhase[];
      tickets: Ticket[];
      sessions: ResearchSession[];
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
          await submitSessions(stepsData.sessions, { 
            deletedSessionIds: deletedSessionIds,
            initialSessions: props?.initialSessions || []
          });
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
          toast.success("Cập nhật hội nghị nghiên cứu thành công!");
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
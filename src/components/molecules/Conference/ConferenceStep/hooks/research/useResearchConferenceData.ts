// src/hooks/useResearchConferenceData.ts
import { useEffect, useCallback, useRef } from "react";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { loadExistingConference } from "@/redux/slices/conferenceStep.slice";
import type {
  ConferenceBasicForm,
  Ticket,
  Session,
  Policy,
  RefundPolicy,
  Media,
  Sponsor,
  ResearchDetail,
  ResearchPhase,
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
  RefundPolicyResponse,
} from "@/types/conference.type";

interface UseResearchConferenceDataProps {
  conferenceId: string;
  onLoad?: (data: {
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
  }) => void;
  onError?: (error: unknown) => void;
}

export function useResearchConferenceData({
  conferenceId,
  onLoad,
  onError,
}: UseResearchConferenceDataProps) {
  const dispatch = useAppDispatch();
  const hasDispatchedRef = useRef(false);

  const {
    data: conferenceDetailResponse,
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useGetResearchConferenceDetailInternalQuery(conferenceId, {
    skip: !conferenceId,
    refetchOnMountOrArgChange: true,
  });

  const stableOnLoad = useCallback(onLoad || (() => { }), [onLoad]);
  const stableOnError = useCallback(onError || (() => { }), [onError]);
  
  useEffect(() => {
    hasDispatchedRef.current = false;
  }, [conferenceId]);

  useEffect(() => {
    if (isError) {
      stableOnError(error);
      return;
    }

    if (conferenceDetailResponse?.data && !hasDispatchedRef.current) {
      const data = conferenceDetailResponse.data;

      // === Map Basic Form ===
      const basicForm: ConferenceBasicForm = {
        conferenceId: data.conferenceId ?? "",
        conferenceName: data.conferenceName ?? "",
        description: data.description ?? "",
        startDate: data.startDate ?? "",
        endDate: data.endDate ?? "",
        totalSlot: data.totalSlot ?? 0,
        address: data.address ?? "",
        bannerImageFile: null,
        isInternalHosted: data.isInternalHosted ?? false,
        isResearchConference: true,
        conferenceCategoryId: data.conferenceCategoryId ?? "",
        cityId: data.cityId ?? "",
        ticketSaleStart: data.ticketSaleStart ?? "",
        ticketSaleEnd: data.ticketSaleEnd ?? "",
      };

      // === Map Research Detail ===
      const researchDetail: ResearchDetail = {
        researchDetailId: "detail",
        paperFormat: data.paperFormat ?? "",
        numberPaperAccept: data.numberPaperAccept ?? 0,
        revisionAttemptAllowed: data.revisionAttemptAllowed ?? 1,
        rankingDescription: data.rankingDescription ?? "",
        allowListener: data.allowListener ?? false,
        rankValue: data.rankValue ?? "",
        rankYear: data.rankYear ?? new Date().getFullYear(),
        reviewFee: data.reviewFee ?? 0,
        rankingCategoryId: data.rankingCategoryId ?? "",
      };

      // === Map Research Phases ===
      const researchPhases: ResearchPhase[] = [];
      
      // Helper function to calculate duration
      const calcDuration = (start: string, end: string): number => {
        if (!start || !end) return 1;
        const diffTime = new Date(end).getTime() - new Date(start).getTime();
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      };
      
      if (data.researchPhase && Array.isArray(data.researchPhase)) {
        // Tách main phase và waitlist phase từ array
        const mainPhaseData = data.researchPhase.find((p) => p.isWaitlist === false);
        const waitlistPhaseData = data.researchPhase.find((p) => p.isWaitlist === true);

        // Map Main Phase (phải có)
        if (mainPhaseData) {
          researchPhases.push({
            researchPhaseId: mainPhaseData.researchConferencePhaseId ?? "main",
            registrationStartDate: mainPhaseData.registrationStartDate ?? "",
            registrationEndDate: mainPhaseData.registrationEndDate ?? "",
            registrationDuration: calcDuration(
              mainPhaseData.registrationStartDate ?? "",
              mainPhaseData.registrationEndDate ?? ""
            ),
            fullPaperStartDate: mainPhaseData.fullPaperStartDate ?? "",
            fullPaperEndDate: mainPhaseData.fullPaperEndDate ?? "",
            fullPaperDuration: calcDuration(
              mainPhaseData.fullPaperStartDate ?? "",
              mainPhaseData.fullPaperEndDate ?? ""
            ),
            reviewStartDate: mainPhaseData.reviewStartDate ?? "",
            reviewEndDate: mainPhaseData.reviewEndDate ?? "",
            reviewDuration: calcDuration(
              mainPhaseData.reviewStartDate ?? "",
              mainPhaseData.reviewEndDate ?? ""
            ),
            reviseStartDate: mainPhaseData.reviseStartDate ?? "",
            reviseEndDate: mainPhaseData.reviseEndDate ?? "",
            reviseDuration: calcDuration(
              mainPhaseData.reviseStartDate ?? "",
              mainPhaseData.reviseEndDate ?? ""
            ),
            cameraReadyStartDate: mainPhaseData.cameraReadyStartDate ?? "",
            cameraReadyEndDate: mainPhaseData.cameraReadyEndDate ?? "",
            cameraReadyDuration: calcDuration(
              mainPhaseData.cameraReadyStartDate ?? "",
              mainPhaseData.cameraReadyEndDate ?? ""
            ),

            // === Decision phases (ĐÃ XÓA revisionPaperReviewStart/End/Duration) ===
            abstractDecideStatusStart: mainPhaseData.abstractDecideStatusStart ?? "",
            abstractDecideStatusEnd: mainPhaseData.abstractDecideStatusEnd ?? "",
            abstractDecideStatusDuration: calcDuration(
              mainPhaseData.abstractDecideStatusStart ?? "",
              mainPhaseData.abstractDecideStatusEnd ?? ""
            ),
            fullPaperDecideStatusStart: mainPhaseData.fullPaperDecideStatusStart ?? "",
            fullPaperDecideStatusEnd: mainPhaseData.fullPaperDecideStatusEnd ?? "",
            fullPaperDecideStatusDuration: calcDuration(
              mainPhaseData.fullPaperDecideStatusStart ?? "",
              mainPhaseData.fullPaperDecideStatusEnd ?? ""
            ),
            revisionPaperDecideStatusStart: mainPhaseData.revisionPaperDecideStatusStart ?? "",
            revisionPaperDecideStatusEnd: mainPhaseData.revisionPaperDecideStatusEnd ?? "",
            revisionPaperDecideStatusDuration: calcDuration(
              mainPhaseData.revisionPaperDecideStatusStart ?? "",
              mainPhaseData.revisionPaperDecideStatusEnd ?? ""
            ),
            cameraReadyDecideStatusStart: mainPhaseData.cameraReadyDecideStatusStart ?? "",
            cameraReadyDecideStatusEnd: mainPhaseData.cameraReadyDecideStatusEnd ?? "",
            cameraReadyDecideStatusDuration: calcDuration(
              mainPhaseData.cameraReadyDecideStatusStart ?? "",
              mainPhaseData.cameraReadyDecideStatusEnd ?? ""
            ),

            isWaitlist: false,
            isActive: mainPhaseData.isActive ?? true,
            revisionRoundDeadlines: (mainPhaseData.revisionRoundDeadlines || []).map((rd) => ({
              revisionRoundDeadlineId: rd.revisionRoundDeadlineId ?? "",
              startSubmissionDate: rd.startSubmissionDate ?? "",
              endSubmissionDate: rd.endSubmissionDate ?? "",
              roundNumber: rd.roundNumber ?? 1,
            })),
          });
        }

        // Map Waitlist Phase (optional)
        if (waitlistPhaseData) {
          researchPhases.push({
            researchPhaseId: waitlistPhaseData.researchConferencePhaseId ?? "waitlist",
            registrationStartDate: waitlistPhaseData.registrationStartDate ?? "",
            registrationEndDate: waitlistPhaseData.registrationEndDate ?? "",
            registrationDuration: calcDuration(
              waitlistPhaseData.registrationStartDate ?? "",
              waitlistPhaseData.registrationEndDate ?? ""
            ),
            fullPaperStartDate: waitlistPhaseData.fullPaperStartDate ?? "",
            fullPaperEndDate: waitlistPhaseData.fullPaperEndDate ?? "",
            fullPaperDuration: calcDuration(
              waitlistPhaseData.fullPaperStartDate ?? "",
              waitlistPhaseData.fullPaperEndDate ?? ""
            ),
            reviewStartDate: waitlistPhaseData.reviewStartDate ?? "",
            reviewEndDate: waitlistPhaseData.reviewEndDate ?? "",
            reviewDuration: calcDuration(
              waitlistPhaseData.reviewStartDate ?? "",
              waitlistPhaseData.reviewEndDate ?? ""
            ),
            reviseStartDate: waitlistPhaseData.reviseStartDate ?? "",
            reviseEndDate: waitlistPhaseData.reviseEndDate ?? "",
            reviseDuration: calcDuration(
              waitlistPhaseData.reviseStartDate ?? "",
              waitlistPhaseData.reviseEndDate ?? ""
            ),
            cameraReadyStartDate: waitlistPhaseData.cameraReadyStartDate ?? "",
            cameraReadyEndDate: waitlistPhaseData.cameraReadyEndDate ?? "",
            cameraReadyDuration: calcDuration(
              waitlistPhaseData.cameraReadyStartDate ?? "",
              waitlistPhaseData.cameraReadyEndDate ?? ""
            ),

            // === Decision phases (ĐÃ XÓA revisionPaperReviewStart/End/Duration) ===
            abstractDecideStatusStart: waitlistPhaseData.abstractDecideStatusStart ?? "",
            abstractDecideStatusEnd: waitlistPhaseData.abstractDecideStatusEnd ?? "",
            abstractDecideStatusDuration: calcDuration(
              waitlistPhaseData.abstractDecideStatusStart ?? "",
              waitlistPhaseData.abstractDecideStatusEnd ?? ""
            ),
            fullPaperDecideStatusStart: waitlistPhaseData.fullPaperDecideStatusStart ?? "",
            fullPaperDecideStatusEnd: waitlistPhaseData.fullPaperDecideStatusEnd ?? "",
            fullPaperDecideStatusDuration: calcDuration(
              waitlistPhaseData.fullPaperDecideStatusStart ?? "",
              waitlistPhaseData.fullPaperDecideStatusEnd ?? ""
            ),
            revisionPaperDecideStatusStart: waitlistPhaseData.revisionPaperDecideStatusStart ?? "",
            revisionPaperDecideStatusEnd: waitlistPhaseData.revisionPaperDecideStatusEnd ?? "",
            revisionPaperDecideStatusDuration: calcDuration(
              waitlistPhaseData.revisionPaperDecideStatusStart ?? "",
              waitlistPhaseData.revisionPaperDecideStatusEnd ?? ""
            ),
            cameraReadyDecideStatusStart: waitlistPhaseData.cameraReadyDecideStatusStart ?? "",
            cameraReadyDecideStatusEnd: waitlistPhaseData.cameraReadyDecideStatusEnd ?? "",
            cameraReadyDecideStatusDuration: calcDuration(
              waitlistPhaseData.cameraReadyDecideStatusStart ?? "",
              waitlistPhaseData.cameraReadyDecideStatusEnd ?? ""
            ),

            isWaitlist: true,
            isActive: waitlistPhaseData.isActive ?? false,
            revisionRoundDeadlines: (waitlistPhaseData.revisionRoundDeadlines || []).map((rd) => ({
              revisionRoundDeadlineId: rd.revisionRoundDeadlineId ?? "",
              startSubmissionDate: rd.startSubmissionDate ?? "",
              endSubmissionDate: rd.endSubmissionDate ?? "",
              roundNumber: rd.roundNumber ?? 1,
              researchConferencePhaseId: rd.researchConferencePhaseId ?? "",
            })),
          });
        }
      }
     
      // === Map Tickets ===
      const tickets: Ticket[] = (data.conferencePrices || []).map((p) => ({
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
          refundInPhase: (ph.refundPolicies || []).map((rp: RefundPolicyResponse) => ({
            ...rp,
            refundPolicyId: rp.refundPolicyId ?? "",
            refundOrder: rp.refundOrder ?? 0,
            percentRefund: rp.percentRefund ?? 0,
            refundDeadline: rp.refundDeadline ?? "",
          })),
        })),
      }));

      // === Map Sessions ===
      const sessions: Session[] = (data.researchSessions || []).map((s) => ({
        sessionId: s.conferenceSessionId,
        title: s.title ?? "",
        description: s.description ?? "",
        startTime: s.startTime ?? "",
        endTime: s.endTime ?? "",
        date: s.date ?? "",
        roomId: s.roomId ?? "",
        speaker: [],
        sessionMedias: (s.sessionMedia || []).map((m) => ({
          sessionMediaId: m.conferenceSessionMediaId,
          mediaFile: m.conferenceSessionMediaUrl ?? null,
          mediaUrl: m.conferenceSessionMediaUrl ?? "",
        })),
      }));

      // === Map Policies ===
      const policies: Policy[] = (data.policies || []).map((p) => ({
        policyId: p.policyId,
        policyName: p.policyName ?? "",
        description: p.description ?? "",
      }));

      // === Map Refund Policies ===
      const refundPolicies: RefundPolicy[] = (data.refundPolicies || []).map((rp: RefundPolicyResponse) => ({
        refundPolicyId: rp.refundPolicyId ?? "",
        percentRefund: rp.percentRefund ?? 0,
        refundDeadline: rp.refundDeadline ?? "",
        refundOrder: rp.refundOrder ?? 0,
      }));

      // === Map Research Materials ===
      const researchMaterials: ResearchMaterial[] = (data.materialDownloads || []).map((m) => ({
        materialId: m.materialDownloadId,
        fileName: m.fileName ?? "Tài liệu",
        fileDescription: m.fileDescription ?? "",
        fileUrl: m.fileUrl ?? "",
        file: m.fileUrl ?? null,
      }));

      const rankingFiles: ResearchRankingFile[] = (data.rankingFileUrls || []).map((f) => ({
        rankingFileId: f.rankingFileUrlId,
        fileUrl: f.fileUrl,
        file: f.fileUrl ?? null,
      }));

      const rankingReferences: ResearchRankingReference[] = (data.rankingReferenceUrls || []).map((r) => ({
        rankingReferenceId: r.referenceUrlId,
        referenceUrl: r.referenceUrl ?? "",
      }));

      const mediaList: Media[] = (data.conferenceMedia || []).map((m) => ({
        mediaId: m.mediaId,
        mediaFile: m.mediaUrl ?? null,
        mediaUrl: m.mediaUrl ?? "",
      }));

      const sponsors: Sponsor[] = (data.sponsors || []).map((s) => ({
        sponsorId: s.sponsorId,
        name: s.name ?? "",
        imageFile: s.imageUrl ?? null,
        imageUrl: s.imageUrl ?? "",
      }));

      dispatch(
        loadExistingConference({
          id: conferenceId,
          maxStep: 9,
          basicData: basicForm,
        })
      );
      hasDispatchedRef.current = true;

      stableOnLoad({
        basicForm,
        researchDetail,
        researchPhases,
        tickets,
        sessions,
        policies,
        refundPolicies,
        researchMaterials,
        rankingFiles,
        rankingReferences,
        mediaList,
        sponsors,
      });
    }
  }, [
    conferenceDetailResponse,
    conferenceId,
    isError,
    error,
    stableOnLoad,
    stableOnError,
    dispatch,
  ]);

  return { isLoading, isError, isFetching, refetch };
}
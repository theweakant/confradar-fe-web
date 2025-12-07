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

  // Helper: Tính duration từ startDate → endDate (số ngày thực tế + 1)
  const calcDuration = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const diffTime = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

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
        researchDetailId: data.researchDetailId ?? undefined,
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

      // ✅ MAP N PHASES TRỰC TIẾP — KHÔNG CÒN MAIN/WAITLIST
      const researchPhases: ResearchPhase[] = (
        data.researchPhase && Array.isArray(data.researchPhase)
          ? data.researchPhase
          : []
      ).map((phaseData) => ({
        researchPhaseId: phaseData.researchConferencePhaseId ?? "",
        registrationStartDate: phaseData.registrationStartDate ?? "",
        registrationEndDate: phaseData.registrationEndDate ?? "",
        registrationDuration: calcDuration(
          phaseData.registrationStartDate ?? "",
          phaseData.registrationEndDate ?? ""
        ),
        fullPaperStartDate: phaseData.fullPaperStartDate ?? "",
        fullPaperEndDate: phaseData.fullPaperEndDate ?? "",
        fullPaperDuration: calcDuration(
          phaseData.fullPaperStartDate ?? "",
          phaseData.fullPaperEndDate ?? ""
        ),
        reviewStartDate: phaseData.reviewStartDate ?? "",
        reviewEndDate: phaseData.reviewEndDate ?? "",
        reviewDuration: calcDuration(
          phaseData.reviewStartDate ?? "",
          phaseData.reviewEndDate ?? ""
        ),
        reviseStartDate: phaseData.reviseStartDate ?? "",
        reviseEndDate: phaseData.reviseEndDate ?? "",
        reviseDuration: calcDuration(
          phaseData.reviseStartDate ?? "",
          phaseData.reviseEndDate ?? ""
        ),
        cameraReadyStartDate: phaseData.cameraReadyStartDate ?? "",
        cameraReadyEndDate: phaseData.cameraReadyEndDate ?? "",
        cameraReadyDuration: calcDuration(
          phaseData.cameraReadyStartDate ?? "",
          phaseData.cameraReadyEndDate ?? ""
        ),
        abstractDecideStatusStart: phaseData.abstractDecideStatusStart ?? "",
        abstractDecideStatusEnd: phaseData.abstractDecideStatusEnd ?? "",
        abstractDecideStatusDuration: calcDuration(
          phaseData.abstractDecideStatusStart ?? "",
          phaseData.abstractDecideStatusEnd ?? ""
        ),
        fullPaperDecideStatusStart: phaseData.fullPaperDecideStatusStart ?? "",
        fullPaperDecideStatusEnd: phaseData.fullPaperDecideStatusEnd ?? "",
        fullPaperDecideStatusDuration: calcDuration(
          phaseData.fullPaperDecideStatusStart ?? "",
          phaseData.fullPaperDecideStatusEnd ?? ""
        ),
        revisionPaperDecideStatusStart: phaseData.revisionPaperDecideStatusStart ?? "",
        revisionPaperDecideStatusEnd: phaseData.revisionPaperDecideStatusEnd ?? "",
        revisionPaperDecideStatusDuration: calcDuration(
          phaseData.revisionPaperDecideStatusStart ?? "",
          phaseData.revisionPaperDecideStatusEnd ?? ""
        ),
        cameraReadyDecideStatusStart: phaseData.cameraReadyDecideStatusStart ?? "",
        cameraReadyDecideStatusEnd: phaseData.cameraReadyDecideStatusEnd ?? "",
        cameraReadyDecideStatusDuration: calcDuration(
          phaseData.cameraReadyDecideStatusStart ?? "",
          phaseData.cameraReadyDecideStatusEnd ?? ""
        ),
        authorPaymentStart: phaseData.authorPaymentStart ?? "",
        authorPaymentEnd: phaseData.authorPaymentEnd ?? "",
        authorPaymentDuration: calcDuration(
          phaseData.authorPaymentStart ?? "",
          phaseData.authorPaymentEnd ?? ""
        ),
        revisionRoundDeadlines: (phaseData.revisionRoundDeadlines || []).map((rd) => ({
          revisionRoundDeadlineId: rd.revisionRoundDeadlineId ?? "",
          startSubmissionDate: rd.startSubmissionDate ?? "",
          endSubmissionDate: rd.endSubmissionDate ?? "",
          roundNumber: rd.roundNumber ?? 1,
          researchConferencePhaseId: rd.researchConferencePhaseId ?? "",
        })),
        // ❌ KHÔNG CÒN isWaitlist, isActive
      }));

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

      const refundPolicies: RefundPolicy[] = (data.refundPolicies || []).map((rp: RefundPolicyResponse) => ({
        refundPolicyId: rp.refundPolicyId ?? "",
        percentRefund: rp.percentRefund ?? 0,
        refundDeadline: rp.refundDeadline ?? "",
        refundOrder: rp.refundOrder ?? 0,
      }));

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
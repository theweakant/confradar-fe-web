// src/hooks/useResearchConferenceData.ts
import { useEffect } from "react";
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
  const { data: conferenceDetailResponse, isLoading, isError, error } = 
    useGetResearchConferenceDetailInternalQuery(conferenceId);

  useEffect(() => {
    if (isError) {
      onError?.(error);
      return;
    }

    if (conferenceDetailResponse?.data) {
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
        name: data.name ?? "",
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
      if (data.researchPhase) {
        // Main phase
        researchPhases.push({
          researchPhaseId: data.researchPhase.researchConferencePhaseId ?? "main",
          registrationStartDate: data.researchPhase.registrationStartDate ?? "",
          registrationEndDate: data.researchPhase.registrationEndDate ?? "",
          fullPaperStartDate: data.researchPhase.fullPaperStartDate ?? "",
          fullPaperEndDate: data.researchPhase.fullPaperEndDate ?? "",
          reviewStartDate: data.researchPhase.reviewStartDate ?? "",
          reviewEndDate: data.researchPhase.reviewEndDate ?? "",
          reviseStartDate: data.researchPhase.reviseStartDate ?? "",
          reviseEndDate: data.researchPhase.reviseEndDate ?? "",
          cameraReadyStartDate: data.researchPhase.cameraReadyStartDate ?? "",
          cameraReadyEndDate: data.researchPhase.cameraReadyEndDate ?? "",
          isWaitlist: false,
          isActive: data.researchPhase.isActive ?? false,
          revisionRoundDeadlines: (data.researchPhase.revisionRoundDeadlines || []).map((rd) => ({
            revisionRoundDeadlineId: rd.revisionRoundDeadlineId ?? "",
            startSubmissionDate: rd.startDate ?? "",
            endSubmissionDate: rd.endDate ?? "",
            roundNumber: rd.roundNumber ?? 1,
          })),
        });

        // Waitlist phase (nếu có)
        if (data.researchPhase.waitlistPhase) {
          researchPhases.push({
            researchPhaseId: data.researchPhase.waitlistPhase.researchConferencePhaseId ?? "waitlist",
            registrationStartDate: data.researchPhase.waitlistPhase.registrationStartDate ?? "",
            registrationEndDate: data.researchPhase.waitlistPhase.registrationEndDate ?? "",
            fullPaperStartDate: data.researchPhase.waitlistPhase.fullPaperStartDate ?? "",
            fullPaperEndDate: data.researchPhase.waitlistPhase.fullPaperEndDate ?? "",
            reviewStartDate: data.researchPhase.waitlistPhase.reviewStartDate ?? "",
            reviewEndDate: data.researchPhase.waitlistPhase.reviewEndDate ?? "",
            reviseStartDate: data.researchPhase.waitlistPhase.reviseStartDate ?? "",
            reviseEndDate: data.researchPhase.waitlistPhase.reviseEndDate ?? "",
            cameraReadyStartDate: data.researchPhase.waitlistPhase.cameraReadyStartDate ?? "",
            cameraReadyEndDate: data.researchPhase.waitlistPhase.cameraReadyEndDate ?? "",
            isWaitlist: true,
            isActive: data.researchPhase.waitlistPhase.isActive ?? false,
            revisionRoundDeadlines: (data.researchPhase.waitlistPhase.revisionRoundDeadlines || []).map((rd) => ({
              revisionRoundDeadlineId: rd.revisionRoundDeadlineId ?? "",
              startSubmissionDate: rd.startDate ?? "",
              endSubmissionDate: rd.endDate ?? "",
              roundNumber: rd.roundNumber ?? 1,
            })),
          });
        }
      }

      // === Map Tickets (Giá vé) ===
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
          refundInPhase: [], 
        })),
      }));

      // === Map Research Sessions ===
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
      }))

      // === Map Policies ===
      const policies: Policy[] = (data.policies || []).map((p) => ({
        policyId: p.policyId,
        policyName: p.policyName ?? "",
        description: p.description ?? "",
      }));

      // === Map Research Materials ===
      const researchMaterials: ResearchMaterial[] = (data.materialDownloads || []).map((m) => ({
        materialId: m.materialDownloadId,    
        fileName: m.fileName ?? "Tài liệu",
        fileDescription: m.fileDescription ?? "",
        fileUrl: m.fileUrl ?? "",
        file: null, // hoặc File | null nếu cần upload sau
      }));

      // === Map Ranking Files ===
      const rankingFiles: ResearchRankingFile[] = (data.rankingFileUrls || []).map((f) => ({
        rankingFileId: f.rankingFileUrlId,
        fileUrl: f.fileUrl,
        file: null,
      }));

      // === Map Ranking References ===
      const rankingReferences: ResearchRankingReference[] = (data.rankingReferenceUrls || []).map((r) => ({
        rankingReferenceId: r.referenceUrlId, 
        referenceUrl: r.referenceUrl ?? "",
      }));

      // === Map Media ===
      const mediaList: Media[] = (data.conferenceMedia || []).map((m) => ({
        mediaId: m.mediaId,
        mediaFile: m.mediaUrl ?? null,   
        mediaUrl: m.mediaUrl ?? "",
      }));

      // === Map Sponsors ===
      const sponsors: Sponsor[] = (data.sponsors || []).map((s) => ({
        sponsorId: s.sponsorId,
        name: s.name ?? "",
        imageFile: s.imageUrl ?? null,   
        imageUrl: s.imageUrl ?? "",
      }));

      // Gửi vào Redux
      dispatch(
        loadExistingConference({
          id: conferenceId,
          maxStep: 9, // RESEARCH_MAX_STEP
          basicData: basicForm,
        })
      );

      // Callback cho component
      onLoad?.({
        basicForm,
        researchDetail,
        researchPhases,
        tickets,
        sessions,
        policies,
        researchMaterials,
        rankingFiles,
        rankingReferences,
        mediaList,
        sponsors,
      });
    }
  }, [conferenceDetailResponse, conferenceId, dispatch, isError, error, onLoad, onError]);

  return { isLoading, isError };
}
import { useEffect, useCallback, useRef } from "react";
import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { goToStep, loadExistingConference, markStepCompleted } from "@/redux/slices/conferenceStep.slice";
import type { ConferenceBasicForm, Ticket, Session, Policy, RefundPolicy, Media, Sponsor, ConferencePriceResponse, ConferencePricePhaseResponse, ConferencePolicyResponse, RefundPolicyResponse } from "@/types/conference.type";
import type { CollaboratorContract } from "@/types/contract.type";

interface UseConferenceDataProps {
  conferenceId: string;
  onLoad?: (data: {
    basicForm: ConferenceBasicForm;
    tickets: Ticket[];
    sessions: Session[];
    policies: Policy[];
    refundPolicies: RefundPolicy[];
    mediaList: Media[];
    sponsors: Sponsor[];
    contract: CollaboratorContract | null;
  }) => void;
  onError?: (error: unknown) => void;
}

export function useTechConferenceData({
  conferenceId,
  onLoad,
  onError,
}: UseConferenceDataProps) {
  const dispatch = useAppDispatch();
  const { 
    data: conferenceDetail, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useGetTechnicalConferenceDetailInternalQuery(conferenceId, {
    skip: !conferenceId,
    refetchOnMountOrArgChange: true, 
  });

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isError) {
      onError?.(error);
      return;
    }

    if (conferenceDetail?.data) {
      const data = conferenceDetail.data;

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
        isResearchConference: data.isResearchConference ?? false,
        conferenceCategoryId: data.conferenceCategoryId ?? "",
        cityId: data.cityId ?? "",
        ticketSaleStart: data.ticketSaleStart ?? "",
        ticketSaleEnd: data.ticketSaleEnd ?? "",
        targetAudienceTechnicalConference: data.targetAudience ?? "",
        conferenceStatusId: data.conferenceStatusId ?? ""
      };

      // === Map Tickets ===
      const tickets: Ticket[] = (data.conferencePrices || []).map((p: ConferencePriceResponse) => ({
        ticketId: p.conferencePriceId,
        priceId: p.conferencePriceId,
        ticketPrice: p.ticketPrice ?? 0,
        ticketName: p.ticketName ?? "",
        ticketDescription: p.ticketDescription ?? "",
        isAuthor: p.isAuthor ?? false,
        totalSlot: p.totalSlot ?? 0,
        phases: (p.pricePhases || []).map((ph: ConferencePricePhaseResponse) => ({
          ...ph,
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
      const sessions: Session[] = (data.sessions || []).map((s) => ({
        sessionId: s.conferenceSessionId,
        title: s.title ?? "",
        description: s.description ?? "",
        startTime: s.startTime ?? "",
        endTime: s.endTime ?? "",
        date: s.date ?? s.sessionDate ?? "",
        roomId: s.roomId ?? "",
        speaker: (s.speakers || []).map((sp) => ({
          speakerId: sp.speakerId,
          name: sp.name ?? "",
          description: sp.description ?? "",
          image: sp.image,
          imageUrl: sp.image ?? "",
        })),
        sessionMedias: (s.sessionMedia || []).map((m) => ({
          sessionMediaId: m.conferenceSessionMediaId,
          mediaFile: m.conferenceSessionMediaUrl,
          mediaUrl: m.conferenceSessionMediaUrl ?? "",
        })),
      }));

      const policies: Policy[] = (data.policies || []).map((p: ConferencePolicyResponse) => ({
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

      const contract = conferenceDetail.data.contract || null;

      //  XÁC ĐỊNH CÁC STEP ĐÃ HOÀN TẤT
      const completedSteps: number[] = [];

      if (data.conferenceId) completedSteps.push(1);
      if (tickets.length > 0) completedSteps.push(2);
      
      if (sessions.length > 0) {
        completedSteps.push(3);
      } else if (policies.length > 0 || refundPolicies.length > 0) {
        completedSteps.push(3);
      }

      if (policies.length > 0 || refundPolicies.length > 0) {
        completedSteps.push(4);
      } else if (mediaList.length > 0) {
        completedSteps.push(4);
      }

      if (mediaList.length > 0) {
        completedSteps.push(5);
      } else if (sponsors.length > 0) {
        completedSteps.push(5);
      }

      if (sponsors.length > 0) completedSteps.push(6);

      // Chỉ dispatch loadExistingConference lần đầu tiên
      if (!hasInitializedRef.current) {
        dispatch(
          loadExistingConference({
            id: conferenceId,
            maxStep: 6,
            basicData: basicForm,
          })
        );

        completedSteps.forEach((step) => {
          dispatch(markStepCompleted(step));
        });

        if (completedSteps.length > 0) {
          const maxCompletedStep = Math.max(...completedSteps);
          dispatch(goToStep(maxCompletedStep));
        }

        hasInitializedRef.current = true;
      }

      // ✅ FIX: Gọi trực tiếp với optional chaining thay vì qua stableOnLoad
      onLoad?.({
        basicForm,
        tickets,
        sessions,
        policies,
        refundPolicies,
        mediaList,
        sponsors,
        contract,
      });
    }
  }, [
    conferenceDetail, 
    conferenceId, 
    isError, 
    error, 
    dispatch, 
    onLoad,  
    onError  
  ]);

  useEffect(() => {
    hasInitializedRef.current = false;
  }, [conferenceId]);

  return { 
    isLoading, 
    isError, 
    isFetching, 
    refetch 
  };
}
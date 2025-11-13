// src/hooks/useTechConferenceData.ts
import { useEffect, useCallback } from "react";
import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { goToStep, loadExistingConference, markStepCompleted } from "@/redux/slices/conferenceStep.slice";
import type { ConferenceBasicForm, Ticket, Session, Policy, RefundPolicy, Media, Sponsor, ConferencePriceResponse, ConferencePricePhaseResponse, ConferencePolicyResponse, RefundPolicyResponse, RefundInPhase } from "@/types/conference.type";

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
  }) => void;
  onError?: (error: unknown) => void;
}

export function useTechConferenceData({
  conferenceId,
  onLoad,
  onError,
}: UseConferenceDataProps) {
  const dispatch = useAppDispatch();
  const { data: conferenceDetail, isLoading, isError, error, refetch } = useGetTechnicalConferenceDetailInternalQuery(conferenceId);

  // Wrap callbacks với useCallback để tránh thay đổi reference
  const stableOnLoad = useCallback(onLoad || (() => { }), []);
  const stableOnError = useCallback(onError || (() => { }), []);

  useEffect(() => {
    if (isError) {
      stableOnError(error);
      return;
    }

    if (conferenceDetail?.data) {
      const data = conferenceDetail.data;

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
        isResearchConference: data.isResearchConference ?? false,
        conferenceCategoryId: data.conferenceCategoryId ?? "",
        cityId: data.cityId ?? "",
        ticketSaleStart: data.ticketSaleStart ?? "",
        ticketSaleEnd: data.ticketSaleEnd ?? "",
        targetAudienceTechnicalConference: data.targetAudience ?? "",
        contractURL: null,
        commission: data.commission ?? "",
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

      // ✅ XÁC ĐỊNH CÁC STEP ĐÃ HOÀN TẤT
      const completedSteps: number[] = [];

      // Step 1: Thông tin cơ bản (luôn hoàn tất nếu có conferenceId)
      if (data.conferenceId) {
        completedSteps.push(1);
      }

      // Step 2: Giá vé (hoàn tất nếu có ít nhất 1 ticket)
      if (tickets.length > 0) {
        completedSteps.push(2);
      }

      // Step 3: Phiên họp (hoàn tất nếu có sessions HOẶC người dùng đã skip)
      // Để xử lý skip, bạn có thể kiểm tra: nếu step 4 đã hoàn tất mà step 3 chưa có data
      // thì coi như đã skip step 3
      if (sessions.length > 0) {
        completedSteps.push(3);
      } else if (policies.length > 0 || refundPolicies.length > 0) {
        // Nếu đã có policy nhưng không có session => đã skip step 3
        completedSteps.push(3);
      }

      // Step 4: Chính sách (hoàn tất nếu có policies hoặc refundPolicies)
      if (policies.length > 0 || refundPolicies.length > 0) {
        completedSteps.push(4);
      } else if (mediaList.length > 0) {
        // Nếu đã có media nhưng không có policy => đã skip step 4
        completedSteps.push(4);
      }

      // Step 5: Media (hoàn tất nếu có mediaList)
      if (mediaList.length > 0) {
        completedSteps.push(5);
      } else if (sponsors.length > 0) {
        // Nếu đã có sponsor nhưng không có media => đã skip step 5
        completedSteps.push(5);
      }

      // Step 6: Sponsors (hoàn tất nếu có sponsors)
      if (sponsors.length > 0) {
        completedSteps.push(6);
      }

      // Gửi vào Redux
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


      // Callback cho component
      stableOnLoad({
        basicForm,
        tickets,
        sessions,
        policies,
        refundPolicies,
        mediaList,
        sponsors,
      });
    }
  }, [conferenceDetail, conferenceId, isError, error, dispatch, stableOnLoad, stableOnError]);

  return { isLoading, isError, refetch };
}
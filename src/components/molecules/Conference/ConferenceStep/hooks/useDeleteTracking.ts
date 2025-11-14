// src/hooks/useDeleteTracking.ts
import { useState } from "react";

export function useDeleteTracking() {
  // =============== TECH CONFERENCE ===============
  const [deletedTicketIds, setDeletedTicketIds] = useState<string[]>([]);
  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);
  const [deletedPolicyIds, setDeletedPolicyIds] = useState<string[]>([]);
  const [deletedRefundPolicyIds, setDeletedRefundPolicyIds] = useState<string[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [deletedSponsorIds, setDeletedSponsorIds] = useState<string[]>([]);

  // =============== RESEARCH CONFERENCE ===============
  const [deletedMaterialIds, setDeletedMaterialIds] = useState<string[]>([]);
  const [deletedRankingFileIds, setDeletedRankingFileIds] = useState<string[]>([]);
  const [deletedRankingReferenceIds, setDeletedRankingReferenceIds] = useState<string[]>([]);
  const [deletedResearchSessionIds, setDeletedResearchSessionIds] = useState<string[]>([]);
  const [deletedRevisionDeadlineIds, setDeletedRevisionDeadlineIds] = useState<string[]>([]);

  // --- Tech Trackers ---
  const trackDeletedTicket = (id: string) => {
    if (id && !deletedTicketIds.includes(id)) {
      setDeletedTicketIds(prev => [...prev, id]);
    }
  };

  const trackDeletedSession = (id: string) => {
    if (id && !deletedSessionIds.includes(id)) {
      setDeletedSessionIds(prev => [...prev, id]);
    }
  };

  const trackDeletedPolicy = (id: string) => {
    if (id && !deletedPolicyIds.includes(id)) {
      setDeletedPolicyIds(prev => [...prev, id]);
    }
  };

  const trackDeletedRefundPolicy = (id: string) => {
    if (id && !deletedRefundPolicyIds.includes(id)) {
      setDeletedRefundPolicyIds((prev) => [...prev, id]);
    }
  };

  const trackDeletedMedia = (id: string) => {
    if (id && !deletedMediaIds.includes(id)) {
      setDeletedMediaIds(prev => [...prev, id]);
    }
  };

  const trackDeletedSponsor = (id: string) => {
    if (id && !deletedSponsorIds.includes(id)) {
      setDeletedSponsorIds(prev => [...prev, id]);
    }
  };

  // --- Research Trackers ---
  const trackDeletedMaterial = (id: string) => {
    if (id && !deletedMaterialIds.includes(id)) {
      setDeletedMaterialIds(prev => [...prev, id]);
    }
  };

  const trackDeletedRankingFile = (id: string) => {
    if (id && !deletedRankingFileIds.includes(id)) {
      setDeletedRankingFileIds(prev => [...prev, id]);
    }
  };

  const trackDeletedRankingReference = (id: string) => {
    if (id && !deletedRankingReferenceIds.includes(id)) {
      setDeletedRankingReferenceIds(prev => [...prev, id]);
    }
  };

  const trackDeletedResearchSession = (id: string) => {
    if (id && !deletedResearchSessionIds.includes(id)) {
      setDeletedResearchSessionIds(prev => [...prev, id]);
    }
  };

  const trackDeletedRevisionDeadline = (id: string) => {
    if (id && !deletedRevisionDeadlineIds.includes(id)) {
      setDeletedRevisionDeadlineIds(prev => [...prev, id]);
    }
  };

  // --- Reset all tracking (useful when switching conferences or canceling) ---
  const resetDeleteTracking = () => {
    setDeletedTicketIds([]);
    setDeletedSessionIds([]);
    setDeletedPolicyIds([]);
    setDeletedRefundPolicyIds([]);
    setDeletedMediaIds([]);
    setDeletedSponsorIds([]);
    setDeletedMaterialIds([]);
    setDeletedRankingFileIds([]);
    setDeletedRankingReferenceIds([]);
    setDeletedResearchSessionIds([]);
    setDeletedRevisionDeadlineIds([]);
  };

  return {
    // Tech IDs
    deletedTicketIds,
    deletedSessionIds,
    deletedPolicyIds,
    deletedRefundPolicyIds, 
    deletedMediaIds,
    deletedSponsorIds,

    // Research IDs
    deletedMaterialIds,
    deletedRankingFileIds,
    deletedRankingReferenceIds,
    deletedResearchSessionIds,
    deletedRevisionDeadlineIds,

    // Track functions
    trackDeletedTicket,
    trackDeletedSession,
    trackDeletedPolicy,
    trackDeletedRefundPolicy,
    trackDeletedMedia,
    trackDeletedSponsor,
    trackDeletedMaterial,
    trackDeletedRankingFile,
    trackDeletedRankingReference,
    trackDeletedResearchSession,
    trackDeletedRevisionDeadline,

    // Utility
    resetDeleteTracking,
  };
}
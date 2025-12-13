import { useState, useEffect } from "react";
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
  RevisionRoundDeadline,
} from "@/types/conference.type";

const INITIAL_BASIC_FORM: ConferenceBasicForm = {
  conferenceName: "",
  description: "",
  startDate: "",
  endDate: "",
  dateRange: 1,
  totalSlot: 0,
  address: "",
  bannerImageFile: null,
  isInternalHosted: true,
  isResearchConference: true,
  conferenceCategoryId: "",
  cityId: "",
  ticketSaleStart: "",
  ticketSaleEnd: "",
  ticketSaleDuration: 0,
  createdby: "",
};

const INITIAL_RESEARCH_DETAIL: ResearchDetail = {
  paperFormat: "",
  numberPaperAccept: 0,
  revisionAttemptAllowed: 0,
  rankingDescription: "",
  allowListener: false,
  rankValue: "",
  rankYear: new Date().getFullYear(),
  submitPaperFee: 0,
  rankingCategoryId: "",
};

// ✅ Tạo phase trống mới (không còn isWaitlist/isActive)
const getEmptyPhase = (): ResearchPhase => ({
  registrationStartDate: "",
  registrationEndDate: "",
  registrationDuration: 1,

  fullPaperStartDate: "",
  fullPaperEndDate: "",
  fullPaperDuration: 1,

  reviewStartDate: "",
  reviewEndDate: "",
  reviewDuration: 1,

  reviseStartDate: "",
  reviseEndDate: "",
  reviseDuration: 1,

  cameraReadyStartDate: "",
  cameraReadyEndDate: "",
  cameraReadyDuration: 1,

  abstractDecideStatusStart: "",
  abstractDecideStatusEnd: "",
  abstractDecideStatusDuration: 1,

  fullPaperDecideStatusStart: "",
  fullPaperDecideStatusEnd: "",
  fullPaperDecideStatusDuration: 1,

  revisionPaperDecideStatusStart: "",
  revisionPaperDecideStatusEnd: "",
  revisionPaperDecideStatusDuration: 1,

  cameraReadyDecideStatusStart: "",
  cameraReadyDecideStatusEnd: "",
  cameraReadyDecideStatusDuration: 1,

  authorPaymentStart: "",
  authorPaymentEnd: "",
  authorPaymentDuration: 1,

  revisionRoundDeadlines: [],
});

// ✅ Bắt đầu với 1 phase duy nhất (không còn 2 phases)
const INITIAL_RESEARCH_PHASES: ResearchPhase[] = [getEmptyPhase()];

export function useResearchForm() {
  // Step 1: Basic Info
  const [basicForm, setBasicForm] = useState<ConferenceBasicForm>(INITIAL_BASIC_FORM);

  // Step 2: Research Detail
  const [researchDetail, setResearchDetail] = useState<ResearchDetail>(INITIAL_RESEARCH_DETAIL);

  // Step 3: Research Phases (N phases)
  const [researchPhases, setResearchPhases] = useState<ResearchPhase[]>(INITIAL_RESEARCH_PHASES);

  // Step 4: Price
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Step 5: Sessions
  const [sessions, setSessions] = useState<ResearchSession[]>([]);

  // Step 6: Policies
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);

  // Step 7: Materials & Rankings
  const [researchMaterials, setResearchMaterials] = useState<ResearchMaterial[]>([]);
  const [rankingFiles, setRankingFiles] = useState<ResearchRankingFile[]>([]);
  const [rankingReferences, setRankingReferences] = useState<ResearchRankingReference[]>([]);

  // Step 8: Media
  const [mediaList, setMediaList] = useState<Media[]>([]);

  // Step 9: Sponsors
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Auto-calculate end date based on start date and date range
  useEffect(() => {
    if (basicForm.startDate && basicForm.dateRange && basicForm.dateRange > 0) {
      const start = new Date(basicForm.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + basicForm.dateRange - 1);
      const endDate = end.toISOString().split("T")[0];
      setBasicForm((prev) => ({ ...prev, endDate }));
    }
  }, [basicForm.startDate, basicForm.dateRange]);

  // Auto-calculate ticket sale end date
  useEffect(() => {
    if (
      basicForm.ticketSaleStart &&
      basicForm.ticketSaleDuration &&
      basicForm.ticketSaleDuration > 0
    ) {
      const start = new Date(basicForm.ticketSaleStart);
      const end = new Date(start);
      end.setDate(start.getDate() + basicForm.ticketSaleDuration - 1);
      const ticketSaleEnd = end.toISOString().split("T")[0];
      setBasicForm((prev) => ({ ...prev, ticketSaleEnd }));
    }
  }, [basicForm.ticketSaleStart, basicForm.ticketSaleDuration]);


  const resetAllForms = () => {
    setBasicForm(INITIAL_BASIC_FORM);
    setResearchDetail(INITIAL_RESEARCH_DETAIL);
    setResearchPhases(INITIAL_RESEARCH_PHASES);
    setTickets([]);
    setSessions([]);
    setPolicies([]);
    setRefundPolicies([]);
    setResearchMaterials([]);
    setRankingFiles([]);
    setRankingReferences([]);
    setMediaList([]);
    setSponsors([]);
  };

  return {
    basicForm,
    setBasicForm,
    researchDetail,
    setResearchDetail,
    researchPhases,
    setResearchPhases,
    tickets,
    setTickets,
    sessions,
    setSessions,
    policies,
    setPolicies,
    refundPolicies,
    setRefundPolicies,
    researchMaterials,
    setResearchMaterials,
    rankingFiles,
    setRankingFiles,
    rankingReferences,
    setRankingReferences,
    mediaList,
    setMediaList,
    sponsors,
    setSponsors,
    resetAllForms,
  };
}
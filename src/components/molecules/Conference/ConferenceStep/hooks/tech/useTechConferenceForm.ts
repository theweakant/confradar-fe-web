import { useState, useEffect } from "react";
import type {
  ConferenceBasicForm,
  Ticket,
  Session,
  Policy,
  RefundPolicy,
  Media,
  Sponsor,
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
  isInternalHosted: false,
  isResearchConference: false,
  conferenceCategoryId: "",
  cityId: "",
  ticketSaleStart: "",
  ticketSaleEnd: "",
  ticketSaleDuration: 0,
  createdby: "",
  targetAudienceTechnicalConference: "",
  // ❌ ĐÃ XÓA: contractURL và commission — không còn cần thiết
};

export function useConferenceForm() {
  // Step 1: Basic Info
  const [basicForm, setBasicForm] = useState<ConferenceBasicForm>(INITIAL_BASIC_FORM);

  // Step 2: Price
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Step 3: Sessions
  const [sessions, setSessions] = useState<Session[]>([]);

  // Step 4: Policies
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);

  // Step 5: Media
  const [mediaList, setMediaList] = useState<Media[]>([]);

  // Step 6: Sponsors
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
    setTickets([]);
    setSessions([]);
    setPolicies([]);
    setRefundPolicies([]);
    setMediaList([]);
    setSponsors([]);
  };

  return {
    // Basic form
    basicForm,
    setBasicForm,

    // Tickets
    tickets,
    setTickets,

    // Sessions
    sessions,
    setSessions,

    // Policies
    policies,
    setPolicies,
    refundPolicies,
    setRefundPolicies,

    // Media
    mediaList,
    setMediaList,

    // Sponsors
    sponsors,
    setSponsors,

    // Reset
    resetAllForms,
  };
}
// types/statistics.type.ts
export interface GroupedTicketPhase {
  phaseName: string;
  applyPercent: number;
  soldSlot: number;
  actualPrice: number;
  revenue: number;
  commission: number | null;

  commissionPercent:number |null;
  amountToConfRadar:number|null

}

export interface GroupedTicket {
  ticketName: string;
  ticketPrice: number;
  soldSlot: number;
  phases: GroupedTicketPhase[];

}
export interface TicketPhaseStatistic {
  conferencePriceId: string;
  originalPrice: number;
  ticketName: string;
  phaseName: string;
  applyPhasePercent: number;
  totalSold: number;
  totalAmount: number;
  commissionPercentage: number | null;
  amountToCollaborator: number | null;
  amountToConfRadar: number | null;
}

export interface SoldTicketResponse {
  conferenceId: string;
  conferenceName: string;
  isInternalHosted: boolean;
  ticketPhaseStatistics: TicketPhaseStatistic[];
  totalTicketsSold: number;
  totalRevenue: number;
}

export interface TicketHolder {
  ticketId: string;
  customerName: string;
  ticketTypeName: string;
  phaseName: string;
  actualPrice: number;
  purchaseDate: string; // ISO date string
  status: string;
}

export interface PaperDetail {
  paperId: string;
  title: string;
  submittingAuthorId: string;
  paperPhase: string;
  assignedReviewers: string[];
}

export interface SubmittedPapersResponse {
  totalSubmissions: number;
  paperDetails: PaperDetail[];
}

export interface ReviewerAssignment {
  reviewerId: string;
  reviewerName: string;
  assignedPaperCount: number;
  paperIds: string[];
}

export interface Presenter {
  presenterName: string;
  paperTitle: string;
}

export interface Session {
  sessionId: string;
  title: string;
  onDate: string; // ISO date string
  presenters: Presenter[];
}

export type PresentSessionResponse = Session[];
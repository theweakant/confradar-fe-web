
export interface PaperDetail {
  isHeadReviewer: boolean;
  paperId: string;
  conferenceId: string;
  conferenceName: string | null;
  paperPhaseId: string;
  paperPhaseName: string;
  researchConferencePhaseId: string;
  paperCreatedAt: string;
  paperTitle: string;
  paperDescription: string;
  paperRefundedStatus: boolean;
}

export interface AssignedPapersResponse {
  totalPaperAssignPaper: number;
  paperDetails: PaperDetail[];
}

export interface ReviewedPapersResponse {
  totalPaperReviewed: number;
  paperDetails: PaperDetail[];
}

export interface PendingReviewPapersResponse {
  totalPaperPending: number;
  paperDetails: PaperDetail[];
}
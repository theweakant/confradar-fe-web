//paper.type.ts

export interface Paper {
paperId:string;
}


export interface ListPaper {
  paperId: string;
  currentPhase: {
    paperPhaseId: string;
    phaseName: string;
  };
  abstract: {
    abstractId: string;
    globalStatusId: string;
    globalStatusName: string | null;
    abstractUrl: string;
  } | null;
  fullPaper: any | null;
  revisionPaper: any | null;
  cameraReady: any | null;
}

export interface PendingAbstract {
  abstractId: string
  abstractUrl: string
  paperId: string
  presenterId: string
  presenterName: string
  avatarUrl: string
  conferenceId: string
  conferenceName: string
  globalStatusId: string
  globalStatusName: string
  createdAt: string
}


//------------------------------------------


export interface AssignReviewerData {
  paperId: string | number;
  reviewerIds: string[];
}

export interface PaperFormData {
  title: string;
  authors: string[];
  authorEmails: string[];
  abstract: string;
  keywords: string[];
  conferenceId: string;
  trackId: string;
  paperType: "full_paper" | "short_paper" | "poster" | "workshop";
  fileUrl?: string;
  fileSize?: string;
  pageCount?: number;
}

export interface PaperReview {
  id: string;
  paperId: string;
  reviewerId: string;
  reviewerName: string;
  score: number; // 0-10
  confidence: number; // 1-5
  comments: string;
  strengths: string;
  weaknesses: string;
  recommendedAction: "accept" | "minor_revision" | "major_revision" | "reject";
  reviewDate: string;
  status: "pending" | "completed";
}

export interface PaperStatistics {
  total: number;
  submitted: number;
  underReview: number;
  accepted: number;
  rejected: number;
  revisionRequired: number;
  withdrawn: number;
  averageReviewTime: number; // in days
}
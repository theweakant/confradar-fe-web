export interface Paper {
  id: string;
  title: string;
  authors: string[];
  authorEmails: string[];
  abstract: string;
  keywords: string[];

  // Conference & Track
  conferenceId: string;
  conferenceName: string;
  trackId: string;
  trackName: string;

  // Status & Review
  status: "submitted" | "under_review" | "revision_required" | "accepted" | "rejected" | "withdrawn";
  submissionDate: string;
  lastModifiedDate: string;

  // Review information
  reviewers: string[]; // Array of reviewer IDs
  reviewCount: number;
  averageScore: number; // 0-10 scale

  // Paper details
  paperType: "full_paper" | "short_paper" | "poster" | "workshop";
  fileUrl?: string;
  fileSize?: string; // e.g., "2.5 MB"
  pageCount?: number;

  // Additional metadata
  submittedBy: string; // User ID
  submitterName: string;
  submitterEmail: string;
  version: number;
  isPresenterRegistered: boolean;

  // Decision
  finalDecision?: "accept" | "reject" | "conditional_accept";
  decisionDate?: string;
  decisionNotes?: string;
}

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

//CUSTOMER PAPER TYPE
export interface PaperCustomer {
  paperId: string;

  presenterId?: string;
  fullPaperId?: string;
  revisionPaperId?: string;
  cameraReadyId?: string;
  abstractId?: string;
  conferenceId?: string;
  paperPhaseId?: string;
  createdAt?: string;

  // cameraReady?: CameraReady | null;
  // conference?: Conference | null;
  // paperPhase?: PaperPhase | null;
  // presenter?: User | null;
}


export interface PaperDetailResponse {
  paperId: string;
  currentPhase: PaperPhase;
  abstract?: Abstract | null;
  fullPaper?: FullPaper | null;
  revisionPaper?: RevisionPaper | null;
  cameraReady?: CameraReady | null;
}

export interface PaperPhase {
  paperPhaseId: string;
  phaseName?: string | null;
}

export interface Abstract {
  abstractId: string;
  globalStatusId?: string | null;
  abstractUrl?: string | null;
}

export interface FullPaper {
  fullPaperId: string;
  reviewStatusId?: string | null;
  fullPaperUrl?: string | null;
}

export interface RevisionPaper {
  revisionPaperId: string;
  revisionRound?: number | null;
  globalStatusId?: string | null;
}

export interface CameraReady {
  cameraReadyId: string;
  globalStatusId?: string | null;
  cameraReadyUrl?: string | null;
}

export interface CreateAbstractRequest {
  abstractFile: File;
  paperId: string;
  coAuthorId: string[];
}

export interface AvailableCustomerResponse {
  userId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface CreateFullPaperRequest {
  fullPaperFile: File;
  paperId: string;
}

export interface CreateRevisionPaperSubmissionRequest {
  revisionPaperFile: File;
  paperId: string;
}

export interface CreateRevisionPaperSubmissionResponse {
  responses: RevisionPaperSubmissionFeedbackResponse[];
  revisionPaperSubmissionId: string;
  paperId: string;
}

export interface RevisionPaperSubmissionFeedbackResponse {
  revisionSubmissionFeedbackId: string;
  response?: string;
}

export interface CreateCameraReadyRequest {
  paperId: string;
  cameraReadyFile: File;
}
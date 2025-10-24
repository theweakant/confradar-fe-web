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
//paper.type.ts

export interface Paper {
  paperId: string;
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
  fullPaper: unknown | null;
  revisionPaper: unknown | null;
  cameraReady: CameraReadyForReviewer | null;
}

export interface UnassignAbstract {
  abstractId: string;
  paperId: string;
  globalStatusId: string;
  globalStatusName: string;
  abstractUrl: string;
}

export interface PendingAbstract {
  abstractId: string;
  abstractUrl: string;
  paperId: string;
  presenterId: string;
  presenterName: string;
  avatarUrl: string;
  conferenceId: string;
  conferenceName: string;
  globalStatusId: string;
  globalStatusName: string;
  createdAt: string;
}

// Paper đã được assign cho reviewer
export interface AssignedPaperGroup {
  conferenceId: string;
  conferenceName: string;
  assignedPapers: AssignedPaper[];
}

export interface AssignedPaper {
  paperId: string;
  title: string | null;
  description: string | null;
  abstractId: string;
  fullPaperId: string | null;
  revisionPaperId: string | null;
  cameraReadyId: string | null;
  paperPhaseId: string;
  paperPhaseName: string | null;
  createdAt: string;
}

//------------------------------------------
//CAMERA READY

export interface CameraReadyForReviewer {
  paperId: string;
  cameraReadyId: string;
  globalStatusId: string;
  globalStatusName: string;
  cameraReadyUrl: string;
  title: string;
  description: string;
  createdAt: string;
  reviewAt: string | null;
  cameraReadyStartDate: string;
  cameraReadyEndDate: string;
}

export interface PendingCameraReady {
  cameraReadyId: string;
  fileUrl: string;
  status: string;
  rootPaperId: string;
  cameraReadyStartDate: string | null;
  cameraReadyEndDate: string | null;
}

//------------------------------------------
//DETAIL PAPER

export interface RevisionSubmissionFeedbackForReviewer {
  revisionSubmissionFeedbackId: string;
  userId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  feedback: string | null;
  response: string | null;
  sortOrder: number;
  createdAt: string | null;
}

export interface RevisionPaperReview {
  revisionPaperReviewId: string;
  globalStatusId: string;
  globalStatusName: string;
  note: string | null;
  createdAt: string | null;
  feedbackToAuthor: string | null;
  feedbackMaterialUrl: string | null;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewerAvatarUrl: string | null;
  revisionPaperId: string;
}

export interface RevisionPaperSubmissionForReviewer {
  revisionPaperSubmissionId: string;
  revisionPaperUrl: string;
  revisionPaperId: string;
  title?: string;
  description?: string;
  revisionDeadlineRoundId?: string;
  // startDate: string;
  // endDate: string;
  // roundNumber: number;
  revisionSubmissionFeedbacks: RevisionSubmissionFeedbackForReviewer[];
  // revisionPaperReviews: RevisionPaperReview[];
}

export interface RevisionRoundDetail {
  revisionRoundDeadlineId: string;
  startSubmissionDate: string | null;
  endSubmissionDate: string | null;
  roundNumber: number;
  researchConferencePhaseId: string;
}
export interface RevisionPaperForReviewer {
  revisionPaperId: string;
  revisionRound: number;
  globalStatusId: string;
  globalStatusName: string;
  title: string;
  description: string;
  createdAt: string;
  isAllSubmittedRevisionPaperReview: boolean;
  isAnsweredAllDiscussion: boolean;
  revisionPaperSubmissions: RevisionPaperSubmissionForReviewer[];
}

export interface CurrentResearchConferencePhase {
  researchConferencePhaseId: string;
  conferenceId: string;
  registrationStartDate: string;
  registrationEndDate: string;
  fullPaperStartDate: string;
  fullPaperEndDate: string;
  reviewStartDate: string;
  reviewEndDate: string;
  reviseStartDate: string;
  reviseEndDate: string;
  cameraReadyStartDate: string;
  cameraReadyEndDate: string;
  isWaitlist: boolean;
  isActive: boolean;
  revisionRoundsDetail: RevisionRoundDetail[];
}

export interface FullPaperForReviewer {
  fullPaperId: string;
  reviewStatusId: string;
  reviewStatusName: string;
  fullPaperUrl: string;
  isAllSubmittedFullPaperReview: boolean;
  title: string;
  description: string;
  fullPaperStartDate: string | null;
  fullPaperEndDate: string | null;
  fullPaperReviews: FullPaperReview[];
}

export interface PaperDetailForReviewer {
  isHeadReviewer: boolean;
  fullPaper: FullPaperForReviewer | null;
  revisionPaper: RevisionPaperForReviewer | null;
  cameraReady: CameraReadyForReviewer | null;

  currentPaperPhase?: CurrentPaperPhaseForReviewer | null;
  currentResearchConferencePhase?: CurrentResearchConferencePhaseForReviewer | null;

  // currentPaperPhase?: {
  //   paperPhaseId: string;
  //   phaseName: string;
  // } | null;

  // currentResearchConferencePhase?: CurrentResearchConferencePhase | null;
}

export interface CurrentPaperPhaseForReviewer {
  paperPhaseId?: string;
  phaseName?: string;
}
export interface RevisionRoundDeadlineForReviewer {
  revisionRoundDeadlineId: string;
  startSubmissionDate?: string;
  endSubmissionDate?: string;
  roundNumber?: number;
  researchConferencePhaseId?: string;
}

export interface CurrentResearchConferencePhaseForReviewer {
  researchConferencePhaseId: string;
  conferenceId?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  fullPaperStartDate?: string;
  fullPaperEndDate?: string;
  reviewStartDate?: string;
  reviewEndDate?: string;
  reviseStartDate?: string;
  reviseEndDate?: string;
  cameraReadyStartDate?: string;
  cameraReadyEndDate?: string;
  isWaitlist?: boolean;
  isActive?: boolean;
  revisionRoundsDetail?: RevisionRoundDeadlineForReviewer[];
}

//--------------------------------------------------------
//SUBMIT FULL PAPER REVIEW
export interface SubmitFullPaperReviewRequest {
  fullPaperId: string;
  note: string;
  feedbackToAuthor: string;
  reviewStatus: string;
  feedbackMaterialFile?: File | null;
}

//--------------------------------------------------------
//FULL PAPER REVIEW
export interface FullPaperReview {
  fullPaperReviewId: string;
  globalStatusId: string;
  globalStatusName: string;
  reviewStatusName: string;
  note: string;
  createdAt: string | null;
  feedbackToAuthor: string;
  feedbackMaterialUrl: string | null;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewerAvatarUrl: string | null;
  fullPaperId: string;
}

//--------------------------------------------------------
//SUBMIT PAPER REVISION REVIEW
export interface SubmitPaperRevisionReviewRequest {
  revisionPaperSubmissionId?: string;
  paperId: string;
  revisionPaperId: string;
  globalStatus: string;
  note: string;
  feedbackToAuthor: string;
  feedbackMaterialFile?: File;
}

//--------------------------------------------------------
//LIST REVISION PAPER REVIEW
export interface ListRevisionPaperReview {
  revisionPaperReviewId: string;
  globalStatusId: string;
  globalStatusName: string;
  note: string;
  createdAt: string | null;
  feedbackToAuthor: string;
  feedbackMaterialUrl: string;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewerAvatarUrl: string | null;
  revisionPaperId: string;
}

//--------------------------------------------------------
//SUBMIT PAPER REVISION PAPER FEEDBACK
export interface RevisionFeedback {
  feedback: string;
  sortOrder: number;
}

export interface SubmitPaperRevisionFeedbackRequest {
  revisionPaperSubmissionId: string;
  paperId: string;
  feedbacks: RevisionFeedback[];
}

//CUSTOMER PAPER TYPE
export interface PaperCustomer {
  paperId: string;
  title?: string;
  description?: string;

  // presenterId?: string;
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
  title?: string;
  description?: string;
  currentPhase: PaperPhase;
  rootAuthor: Author;
  coAuthors: Author[];
  abstract?: Abstract | null;
  fullPaper?: FullPaper | null;
  revisionPaper?: RevisionPaper | null;
  cameraReady?: CameraReady | null;
  created?: string;

  researchPhase?: ResearchPhaseDtoDetail;
  revisionDeadline?: RevisionDeadlineDetail[];
}

export type RevisionDeadlineDetail = {
  revisionRoundDeadlineId: string
  startSubmissionDate?: string
  endSubmissionDate?: string
  roundNumber?: number
  researchConferencePhaseId?: string
}

export type ResearchPhaseDtoDetail = {
  researchConferencePhaseId: string
  conferenceId?: string
  registrationStartDate?: string
  registrationEndDate?: string
  fullPaperStartDate?: string
  fullPaperEndDate?: string
  reviewStartDate?: string
  reviewEndDate?: string
  reviseStartDate?: string
  reviseEndDate?: string
  cameraReadyStartDate?: string
  cameraReadyEndDate?: string
}

export interface Author {
  userId: string;
  fullName: string;
}

export interface PaperPhase {
  paperPhaseId: string;
  phaseName?: string | null;
}

export interface Abstract {
  abstractId: string;
  title?: string;
  description?: string;
  globalStatusId?: string | null;
  fileUrl?: string | null;
  created?: string;
  reviewedAt?: string;
}

export interface FullPaper {
  fullPaperId: string;
  title?: string;
  description?: string;
  reviewStatusId?: string | null;
  fileUrl?: string | null;
  created?: string;
  reviewedAt?: string;
}

export interface RevisionPaper {
  revisionPaperId: string;
  title?: string;
  description?: string;
  revisionRound?: number | null;
  overallStatus?: string | null;
  submissions: RevisionSubmission[];
  created?: string;
  reviewedAt?: string;
  // reviews: RevisionReview[];
  // revisionPaperId: string;
  // revisionRound?: number | null;
  // globalStatusId?: string | null;
}

export interface RevisionSubmission {
  submissionId: string;
  title?: string;
  description?: string;
  fileUrl: string;
  // revisionDeadline: {
  //   roundNumher: number;
  //   deadline: string;
  // };
  feedbacks: RevisionSubmissionFeedback[];
  // revisionPaperId: string;
  // revisionRound?: number | null;
  // globalStatusId?: string | null;
}

export interface RevisionSubmissionFeedback {
  feedbackId: string;
  feedBack: string;
  response?: string | null;
  order: number;
  createdAt: string;
  // revisionPaperId: string;
  // revisionRound?: number | null;
  // globalStatusId?: string | null;
}

export interface RevisionReview {
  reviewId: string;
  title?: string;
  description?: string;
  note?: string;
  feedBackToAuthor?: string;
  feedbackMaterialURL?: string;
  reviewedAt?: string;
}

export interface CameraReady {
  cameraReadyId: string;
  title?: string;
  description?: string;
  globalStatusId?: string;
  fileUrl?: string;
  created?: string;
  reviewedAt?: string;
}

export interface CreateAbstractRequest {
  abstractFile: File;
  paperId: string;
  title: string;
  description: string;
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
  title: string;
  description: string;
}

export interface CreateRevisionPaperSubmissionRequest {
  revisionPaperFile: File;
  paperId: string;
  title: string;
  description: string;
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
  title: string;
  description: string;
}

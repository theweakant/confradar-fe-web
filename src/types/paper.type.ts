//paper.type.ts



export interface AcceptedPaper {
  paperId: string;
  title: string;
  authorName: string;
}

export interface AssignPresenterRequest {
  paperId: string;
  sessionId: string;
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
  revisionRoundDeadlineId?: string;
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

export interface PaperDetailWrapperForReviewer {
  paperId: string;
  conferenceId: string;
  conferenceName: string;
  conferenceBannerImageUrl: string;
  paperPhaseId: string;
  paperPhaseName: string;
  researchConferencePhaseId: string;
  createdAt: string;
  paperTitle: string;
  paperDescription: string;

  paperDetail: PaperDetailForReviewer;
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
  abstractDecideStatusStart?: string;
  abstractDecideStatusEnd?: string;
  fullPaperStartDate?: string;
  fullPaperEndDate?: string;
  reviewStartDate?: string;
  reviewEndDate?: string;
  fullPaperDecideStatusStart?: string;
  fullPaperDecideStatusEnd?: string;
  reviseStartDate?: string;
  reviseEndDate?: string;
  // revisionPaperReviewStart?: string;
  // revisionPaperReviewEnd?: string;
  revisionPaperDecideStatusStart?: string;
  revisionPaperDecideStatusEnd?: string;
  cameraReadyStartDate?: string;
  cameraReadyEndDate?: string;
  cameraReadyDecideStatusStart?: string;
  cameraReadyDecideStatusEnd?: string;
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
  paperTitle?: string | null;
  paperDescription?: string | null;
  createdAt?: string | null;

  // presenterId?: string;
  fullPaperId?: string;
  revisionPaperId?: string;
  cameraReadyId?: string;
  abstractId?: string;
  conferenceId?: string;
  paperPhaseId?: string;
  // createdAt?: string;

  phaseName?: string | null;
  researchConferencePhaseId?: string | null;
  ticketId?: string | null;

  conferenceName?: string | null;
  conferenceDescription?: string | null;
  conferenceStartDate?: string | null;
  conferenceEndDate?: string | null;
  conferenceTotalSlot?: number | null;
  conferenceAvailableSlot?: number | null;
  address?: string | null;
  bannerImageUrl?: string | null;
  conferenceCreatedAt?: string | null;
  ticketSaleStart?: string | null;
  ticketSaleEnd?: string | null;
  isInternalHosted?: boolean | null;
  isResearchConference?: boolean | null;
  cityId?: string | null;
  cityName?: string | null;

  conferenceCreatedBy?: string | null;
  conferenceCreatedByEmail?: string | null;
  conferenceCreatedByFullName?: string | null;
  conferenceCreatedByAvatarUrl?: string | null;

  conferenceCategoryId?: string | null;
  conferenceStatusId?: string | null;

  abstract?: AbstractDetailForListType | null;
  fullPaper?: FullPaperDetailForListType | null;
  revisionPaper?: RevisionPaperDetailForListType | null;
  cameraReady?: CameraReadyDetailForListType | null;
}

export interface AbstractDetailForListType {
  abstractId: string;
  abstractUrl: string;
  title: string;
  description: string;
  createdAt: string;
  reviewAt: string | null;
  globalStatusId: string;
  globalStatusName: string;
}

export interface FullPaperDetailForListType {
  fullPaperId: string;
  fullPaperUrl: string;
  title: string;
  description: string;
  reviewStatusId: string;
  reviewStatusName: string;
  createdAt: string;
  reviewAt: string | null;
}

export interface RevisionPaperDetailForListType {
  revisionPaperId: string;
  revisionRound: number;
  globalStatusId: string;
  globalStatusName: string;
  createdAt: string;
  reviewAt: string | null;
  revisionRoundDeadlineId: string;
  revisionRoundDeadlineStartSubmissionDate: string;
  revisionRoundDeadlineEndSubmissionDate: string;
  revisionRoundDeadlineRoundNumber: number;
}

export interface CameraReadyDetailForListType {
  cameraReadyId: string;
  cameraReadyUrl: string;
  title: string;
  description: string;
  createdAt: string;
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

  researchConferenceInfo?: ResearchConferenceInfo | null;
}

export interface ResearchConferenceInfo {
  conferenceId?: string | null;
  conferenceName?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalSlot?: number | null;
  availableSlot?: number | null;
  address?: string | null;
  bannerImageFileUrl?: string | null;
  isInternalHosted?: boolean | null;
  isResearchConference?: boolean | null;
  conferenceCategoryId?: string | null;
  cityId?: string | null;
  createdAt?: string | null;
  ticketSaleStart?: string | null;
  ticketSaleEnd?: string | null;
  createdby?: string | null;
  creatorUserName?: string | null;
  statusName?: string | null;
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
  abstractDecideStatusStart?: string
  abstractDecideStatusEnd?: string
  fullPaperStartDate?: string
  fullPaperEndDate?: string
  reviewStartDate?: string
  reviewEndDate?: string
  fullPaperDecideStatusStart?: string
  fullPaperDecideStatusEnd?: string
  reviseStartDate?: string
  reviseEndDate?: string
  revisionPaperReviewStart?: string
  revisionPaperReviewEnd?: string
  revisionPaperDecideStatusStart?: string
  revisionPaperDecideStatusEnd?: string
  cameraReadyStartDate?: string
  cameraReadyEndDate?: string
  cameraReadyDecideStatusStart?: string
  cameraReadyDecideStatusEnd?: string
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
  // globalStatusId?: string | null;
  status?: string | null;
  fileUrl?: string | null;
  created?: string;
  updated?: string;
}

export interface FullPaper {
  fullPaperId: string;
  title?: string;
  description?: string;
  reviewStatus?: string | null;
  fileUrl?: string | null;
  created?: string;
  updated?: string;
}

export interface RevisionPaper {
  revisionPaperId: string;
  // title?: string;
  // description?: string;
  revisionRound?: number | null;
  overallStatus?: string | null;
  revisionRoundDeadlineId?: string;
  submissions: RevisionSubmission[];
  created?: string;
  updated?: string;
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
  revisionRoundId?: string;
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
  status?: string;
  fileUrl?: string;
  created?: string;
  updated?: string;
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


//PAPER TAB
export interface Abstract1 {
  abstractId: string;
  paperId: string;
  presenterName: string;
  conferenceName: string;
  globalStatusName: string;
  createdAt: string;
  abstractUrl: string;
}

export type DecisionType = "Accepted" | "Rejected";

export interface Paper {
  paperId: string;
  title: string;
  submittingAuthorId: string;
  assignedReviewers?: string[];
  paperPhase: string;
}
export interface PaperLike {
  paperId: string;
  title?: string;
  submittingAuthorId?: string;
  paperPhase?: string;
  abstractUrl?: string;
  globalStatusName?: string;
}
export interface Reviewer {
  reviewerId: string;
  reviewerName: string;
  assignedPaperCount: number;
}

export interface AssignedPaperDetail {
  paperId: string | null;
  title: string | null;
  conferenceName: string | null;
  currentPhaseName: string | null;
  isHeadReviewer: boolean | null;

  fullPaperWork: {
    fullPaperId: string | null;
    fileUrl: string | null;
    statusName: string | null;
    isMyReviewSubmitted: boolean | null;
    myReviewResult: string | null;
    canReview: boolean | null;
    canDecide: boolean | null;
  } | null;

  revisionWork: {
    revisionPaperId: string | null;
    revisionRound: number | null;
    isFeedbackSubmitted: boolean | null;
    latestFileUrl: string | null;
    statusName: string | null;
    isMyReviewSubmitted: boolean | null;
    canGiveFeedback: boolean | null;
    canDecide: boolean | null;
  } | null;

  cameraReadyWork: {
    cameraReadyId: string | null;
    fileUrl: string | null;
    statusName: string | null;
    canDecide: boolean | null;
  } | null;
}
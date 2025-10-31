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

export interface UnassignAbstract {
  abstractId: string;
  paperId: string;
  globalStatusId: string;
  globalStatusName: string;
  abstractUrl: string;
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

// Paper đã được assign cho reviewer
export interface AssignedPaper {
  paperId: string;
  presenterId: string;
  fullPaperId: string | null;
  revisionPaperId: string | null;
  cameraReadyId: string | null;
  abstractId: string;
  conferenceId: string;
  paperPhaseId: string;
  createdAt: string;
  cameraReady: any | null;
  conference: any | null;
  paperAuthors: any[];
  paperPhase: any | null;
  presenter: any | null;
}

//------------------------------------------
//CAMERA READY

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

export interface RevisionSubmissionFeedbackA {
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

export interface RevisionPaperSubmission {
  revisionPaperSubmissionId: string;
  revisionPaperUrl: string;
  revisionPaperId: string;
  revisionDeadlineRoundId: string;
  endDate: string;
  roundNumber: number;
  revisionSubmissionFeedbacks: RevisionSubmissionFeedbackA[];
  revisionPaperReviews: RevisionPaperReview[];
}

export interface RevisionPaperA {
  revisionPaperId: string;
  revisionRound: number;
  globalStatusId: string;
  globalStatusName: string;
  isAllSubmittedRevisionPaperReview: boolean;
  isAnsweredAllDiscussion: boolean;
  revisionPaperSubmissions: RevisionPaperSubmission[];

}


export interface FullPaperA {
  fullPaperId: string;  
  reviewStatusId: string;
  reviewStatusName: string;
  fullPaperUrl: string;
  isAllSubmittedFullPaperReview: boolean;
}

export interface PaperDetailForReviewer {
  isHeadReviewer: boolean;
  fullPaper: FullPaperA | null;
  revisionPaper: RevisionPaperA | null;
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
  revisionPaperReviewId: string
  globalStatusId: string
  globalStatusName: string
  note: string
  createdAt: string | null
  feedbackToAuthor: string
  feedbackMaterialUrl: string
  reviewerId: string | null
  reviewerName: string | null
  reviewerAvatarUrl: string | null
  revisionPaperId: string
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
  fileUrl?: string | null;
}

export interface FullPaper {
  fullPaperId: string;  

reviewStatusId?: string | null;
  fileUrl?: string | null;
}

export interface RevisionPaper {
  revisionPaperId: string;
  revisionRound?: number | null;
  overallStatus?: string | null;
  submissions: RevisionSubmission[];
  // reviews: RevisionReview[];
  // revisionPaperId: string;
  // revisionRound?: number | null;
  // globalStatusId?: string | null;
}

export interface RevisionSubmission {
  submissionId: string;
  fileUrl: string;
  revisionDeadline: {
    roundNumher: number;  // typo backend vẫn giữ là roundNumher
    deadline: string;
  };
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
  note?: string;
  feedBackToAuthor?: string;
  feedbackMaterialURL?: string;
  reviewedAt?: string;
}

export interface CameraReady {
  cameraReadyId: string;
  globalStatusId?: string | null;
  fileUrl?: string | null;
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

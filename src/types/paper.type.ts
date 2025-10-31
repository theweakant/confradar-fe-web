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

// export interface RevisionSubmissionFeedback {
//   revisionSubmissionFeedbackId: string
//   presenterId: string | null
//   feedback: string | null
//   response: string | null
//   sortOrder: number
//   createdAt: string | null
// }

// export interface RevisionPaperSubmission {
//   revisionPaperSubmissionId: string
//   revisionPaperUrl: string
//   revisionPaperId: string
//   revisionDeadlineRoundId: string
//   endDate: string
//   roundNumber: number
//   revisionSubmissionFeedbacks: RevisionSubmissionFeedback[]
// }

// export interface RevisionPaper {
//   revisionPaperId: string
//   revisionRound: number
//   globalStatusId: string
//   globalStatusName: string
//   revisionPaperSubmissions: RevisionPaperSubmission[]
// }

// export interface FullPaper {
//   fullPaperId: string
//   reviewStatusId: string
//   reviewStatusName: string
//   fullPaperUrl: string
// }

// export interface PaperDetailForReviewer {
//   isHeadReviewer: boolean
//   fullPaper: FullPaper | null
//   revisionPaper: RevisionPaper | null
// }


export interface RevisionSubmissionFeedback {
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
  revisionSubmissionFeedbacks: RevisionSubmissionFeedback[];
  revisionPaperReviews: RevisionPaperReview[];
}

export interface RevisionPaper {
  revisionPaperId: string;
  revisionRound: number;
  globalStatusId: string;
  globalStatusName: string;
  isAllSubmittedRevisionPaperReview: boolean;
  isAnsweredAllDiscussion: boolean;
  revisionPaperSubmissions: RevisionPaperSubmission[];
}

export interface FullPaper {
  fullPaperId: string;
  reviewStatusId: string;
  reviewStatusName: string;
  fullPaperUrl: string;
  isAllSubmittedFullPaperReview: boolean;
}

export interface PaperDetailForReviewer {
  isHeadReviewer: boolean;
  fullPaper: FullPaper | null;
  revisionPaper: RevisionPaper | null;
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

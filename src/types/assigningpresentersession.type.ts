export interface ChangePresenterRequest {
    ticketId: string;
    paperId: string;
    newUserId: string;
    reason: string;
}

export interface ChangeSessionRequest {
    newSessionId: string;
    ticketId: string;
    paperId: string;
    reason: string;
}

export interface ApproveSessionChangeRequest {
  sessionChangeRequestId: string;
  isApproved: boolean;
  reviewerComment: string;
}

export interface ApprovePresenterChangeRequest {
  presenterChangeRequestId: string;
  isApproved: boolean;
  reviewerComment: string;
}

export interface PendingPresenterChangeResponse {
  presenterChangeRequestId: string;
  ticketId: string;
  requestedById: string;
  requestedByName: string;
  newPresenterId: string;
  newPresenterName: string;
  globalStatusId: string;
  globalStatusName: string;
  reason: string | null;
  requestAt: string | null;
  reviewedAt: string | null;
  paperId: string | null;
  sessionId: string | null;
}

export interface PendingSessionChangeResponse {
  sessionChangeRequestId: string;
  currentSessionId: string;
  newSessionId: string;
  paperId: string;
  requestedById: string;
  requestedByName: string;
  globalStatusId: string;
  globalStatusName: string;
  reason: string | null;
  requestAt: string | null;
  reviewedAt: string | null;
}
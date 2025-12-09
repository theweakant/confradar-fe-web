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

export interface ConferenceSession {
  conferenceSessionId: string;
  title: string;
  description: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;
  date: string; // "YYYY-MM-DD"
  conferenceId: string;
  roomId: string;
  room: {
    roomId: string;
    number: string;
    displayName: string;
    cityId: string;
    cityname: string;
    destinationId: string;
    destinationName: string;
  };
  // sessionMedia: any[]; 
  // feedbacks: any[];
}

export interface PendingSessionChangeResponse {
  sessionChangeRequestId: string;
  currentSessionId: string | null;
  currentSession: ConferenceSession | null;
  newSessionId: string | null;
  newSession: ConferenceSession | null;
  conferenceId: string;
  conferenceName: string;
  conferencDescription: string; 
  paperId: string;
  paparTile: string; 
  paperDescription: string;
  requestedById: string;
  requestedByName: string;
  globalStatusId: string;
  globalStatusName: string;
  reason: string | null;
  requestAt: string | null;
  reviewedAt: string | null;
}
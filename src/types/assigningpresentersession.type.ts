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

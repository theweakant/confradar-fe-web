export interface CreateReviewerContractRequest {
    reviewerId: string;
    wage: number;
    conferenceId: string;
    signDay: string;
    contractFile: File;
}

export interface GetUsersForReviewerContractRequest {
    conferenceId: string;
}

export interface GetUsersForReviewerContractResponse {
    userId: string;
    email?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    bioDescription?: string | null;
}
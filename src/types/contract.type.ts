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

export interface CreateNewReviewerContractRequest {
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    wage: number;
    contractFile: File;
    conferenceId: string;
    signDay: string;
}

export interface ContractDetailResponseForOrganizer {
    reviewerContractId?: string;
    userId?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    isActive?: boolean;
    signDay?: string;
    expireDay?: string;
    wage?: number;
    contractUrl?: string;
    conferenceId?: string;
    conferenceName?: string;
    conferenceDescription?: string;
    conferenceBannerImageUrl?: string;
}

export interface OwnContractDetailResponse {
    reviewerContractId?: string;
    isActive?: boolean;
    signDay?: string;
    expireDay?: string;
    wage?: number;
    contractUrl?: string;
    conferenceId?: string;
    conferenceName?: string;
    conferenceDescription?: string;
    conferenceBannerImageUrl?: string;
}
export interface CollaboratorContract {
    collaboratorContractId: string;
    isSponsorStep: boolean;
    isMediaStep: boolean;
    isPolicyStep: boolean;
    isSessionStep: boolean;
    isPriceStep: boolean;
    isTicketSelling: boolean;
    isClosed: boolean;
    signDay: string;
    finalizePaymentDate: string;
    commission: number;
    contractUrl: string | null;
}

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
    // password: string;
    // confirmPassword: string;
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

export interface CreateCollaboratorContractRequest {
    userId: string;
    isMediaStep: boolean;
    isPolicyStep: boolean;
    isSessionStep: boolean;
    isPriceStep: boolean;
    isTicketSelling: boolean;
    isSponsorStep: boolean;
    commission?: number;
    signDay: string;
    finalizePaymentDate: string;
    conferenceId: string;
    contractFile: File;
}

export interface CollaboratorContractResponse {
    collaboratorContractId?: string | null;
    collaboratorContractUserId?: string | null;
    collaboratorContractEmail?: string | null;
    collaboratorContractFullName?: string | null;
    collaboratorContractAvatarUrl?: string | null;
    organizationId?: string | null;
    organizationDescription?: string | null;
    organizationName?: string | null;
    isSponsorStep?: boolean | null;
    isMediaStep?: boolean | null;
    isPolicyStep?: boolean | null;
    isSessionStep?: boolean | null;
    isPriceStep?: boolean | null;
    isTicketSelling?: boolean | null;
    isClosed?: boolean | null;
    signDay?: string | null;
    finalizePaymentDate?: string | null;
    commission?: number | null;
    contractUrl?: string | null;
    conferenceId?: string | null;
    conferenceName?: string | null;
    conferenceDescription?: string | null;
    conferenceStartDate?: string | null;
    conferenceEndDate?: string | null;
    conferenceTotalSlot?: number | null;
    conferenceAvailableSlot?: number | null;
    conferenceAddress?: string | null;
    conferenceBannerImageUrl?: string | null;
    conferenceCreatedAt?: string | null;
    conferenceTicketSaleStart?: string | null;
    conferenceTicketSaleEnd?: string | null;
    isInternalHosted?: boolean | null;
    isResearchConference?: boolean | null;
    cityId?: string | null;
    conferenceCreatedBy?: string | null;
    conferenceCreatedByName?: string | null;
    conferenceCreatedByEmail?: string | null;
    conferenceCreatedByAvatarUrl?: string | null;
    conferenceCategoryId?: string | null;
    conferenceCategoryName?: string | null;
    conferenceStatusId?: string | null;
    conferenceStatusName?: string | null;
}
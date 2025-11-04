export interface CustomerWaitListResponse {
    paperWaitListId: string;
    createdAt?: string;
    notifiedAt?: string;
    waitListStatusId?: string;
    waitListStatusName?: string;

    conferenceId?: string;
    conferenceName?: string;
    conferenceDescription?: string;
    conferenceStartDate?: string;
    conferenceEndDate?: string;
    conferenceAvailableSlot?: number;
    conferenceAddress?: string;
    conferenceBannerImageUrl?: string;
    isInternalHosted?: boolean;
    isResearchConference?: boolean;
    conferenceCategoryId?: string;
    conferenceCategoryName?: string;
    conferenceStatusId?: string;
    conferenceStatusName?: string;
}

export interface LeaveWaitListRequest {
    conferenceId: string;
}

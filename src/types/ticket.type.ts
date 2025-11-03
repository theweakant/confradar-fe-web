// export interface Ticket {
//     ticketId: string;
//     userId?: string;
//     conferencePriceId?: string;
//     transactionId?: string;
//     registeredDate?: string;
//     isRefunded?: boolean;
//     actualPrice?: number;
// }

export interface CustomerPaidTicketResponse {
    ticketId: string;
    registeredDate?: string;
    isRefunded?: boolean;
    actualPrice?: number;
    transactions: CustomerTransactionDetailResponse[];
    userCheckIns: CustomerCheckInDetailResponse[];
}

export interface CustomerTransactionDetailResponse {
    transactionId: string;
    currency?: string;
    amount?: number;
    createdAt?: string;
    transactionCode?: string;
    isRefunded?: boolean;
    paymentMethodId?: string;
    paymentMethodName?: string;
}

export interface CustomerCheckInDetailResponse {
    userCheckinId: string;
    isPresenter?: boolean;
    checkinStatusId?: string;
    checkinStatusName?: string;
    checkInTime?: string;
    ticketId?: string;
    conferenceSessionId?: string;
    conferenceSessionDetail: CustomerSessionDetailResponse;
}

export interface CustomerSessionDetailResponse {
    conferenceSessionId: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    sessionDate?: string;
    conferenceId?: string;
    conferenceName?: string;
    roomId?: string;
    roomNumber?: string;
    roomDisplayName?: string;
    destinationId?: string;
    destinationName?: string;
    cityId?: string;
    cityName?: string;
    district?: string;
    street?: string;
}
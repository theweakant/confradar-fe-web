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
  ticketPricePhase?: TicketPricePhaseResponse;
  hasRefundPolicy?: boolean;
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

export interface TicketPricePhaseResponse {
  pricePhaseId: string;
  phaseName?: string;
  startDate?: string;
  endDate?: string;
  applyPercent?: number;
  totalSlot?: number;
  availableSlot?: number;
  conferencePriceId?: string;
  conferencePrice?: ConferencePriceForCustomerTicketResponse;
  refundPolicies?: RefundPolicyForCustomerTicketResponse[];
}

export interface ConferencePriceForCustomerTicketResponse {
  conferencePriceId: string;
  ticketPrice?: number;
  ticketName?: string;
  ticketDescription?: string;
  isAuthor?: boolean;
  totalSlot?: number;
  availableSlot?: number;
  conferenceId?: string;
  paperId?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
}

export interface RefundPolicyForCustomerTicketResponse {
  refundPolicyId: string;
  conferenceId?: string;
  pricePhaseId?: string;
  percentRefund?: number;
  pricePhaseStartDate?: string;
  refundDeadline?: string;
  refundOrder?: number;
}

export interface RefundTicketRequest {
  ticketId: string;
  transactionId: string;
}

export interface CancelTicketRequest {
  ticketIds: string[];
}
export type RequestType = "refund" | "change_presenter" | "change_session";
export type RequestStatus = "pending" | "approved" | "rejected" | "more_info";

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  conferenceId: string;
  conferenceName: string;
  type: RequestType;
  reason: string;
  details: string;
  attachment?: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface CreateRequestDto {
  conferenceId: string;
  conferenceName: string;
  type: RequestType;
  reason: string;
  details: string;
  attachment?: string;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
  reviewNote?: string;
}



export interface RefundRequestTicket {
  ticketId: string;
  registeredDate: string;
  isRefunded: boolean;
  actualPrice: number;
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  pricePhaseId: string;
  pricePhaseName: string;
  pricePhaseStartDate: string;
  pricePhaseEndDate: string;
  pricePhaseApplyPercent: number;
  pricePhaseTotalSlot: number;
  pricePhaseAvailableSlot: number;
}

export interface RefundRequest {
  refundRequestId: string;
  transactionId: string;
  ticketId: string;
  ticket: RefundRequestTicket;
  globalStatusId: string;
  globalStatusName: string;
  reason: string;
  createdAt: string | null;
}
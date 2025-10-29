// // src/types/conference.type.ts

export interface Conference {
  conferenceId: string;
  conferenceName: string;
  description: string;
  startDate: string;              // ISO date
  endDate: string;                // ISO date
  capacity: number;
  address: string;
  bannerImageUrl?: string;
  createdAt: string;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  isActive: boolean;

  userId: string;
  locationId: string;
  categoryId: string;

  policies: Policy[];
  media: Media[];
  sponsors: Sponsor[];
  prices: Price[];
  sessions: Session[];
}

export type ConferenceFormData = Omit<
  Conference,
  "conferenceId" | "createdAt" | "isActive" | "priceId" | "sessionId"
>;

//basic step
export interface ConferenceBasicForm {
  conferenceName: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalSlot: number;
  address?: string;
  bannerImageFile?: File | null;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  conferenceCategoryId: string;
  cityId: string;
  ticketSaleStart: string; //ISO
  ticketSaleEnd: string; //ISO
  createdby: string;
  targetAudienceTechnicalConference: string;

}

//price step

export interface Ticket {
  ticketId?: string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: number;
  isAuthor: boolean;
  totalSlot: number;
}

export interface Phase {
  pricePhaseId?: string
  phaseName: string;
  applyPercent: number;
  startDate: string;
  endDate: string;
  totalslot: number;
}

//+++++++++++++



export interface ConferencePriceData {

}

//session step
export interface Session {
  sessionId?: string,
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: string;
  speaker?: Speaker;
  sessionMedias?: SessionMedia
}

export interface Speaker {
  speakerId?: string
  name: string;
  description: string;
  imageUrl: string;
  image: string;
}

export interface SessionMedia {
  sessionMediaId?: string
  mediaFile: string;
  mediaUrl: string;

}

export interface ConferenceSessionData {
  sessions: Session[];
}


// Policies Step
export interface Policy {
  policyId?: string;
  policyName: string;
  description: string;
}

export interface ConferencePolicyData {
  policies: Policy[];
}

// Media Step
export interface Media {
  mediaId?: string;
  mediaFile: string | File | null;
}

export interface ConferenceMediaData {
  media: Media[];
}

// Sponsors Step
export interface Sponsor {
  sponsorId?: string
  name: string;
  imageFile: string | File | null;
}

export interface ConferenceSponsorData {
  sponsors: Sponsor[];
}

//+++
export interface ConferenceStepFormProps {
  conference?: Conference | null;
  onSave?: (data: ConferenceFormData) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}


export interface ConferenceFormProps {
  conference?: ConferenceResponse | null;
  onSave: (data: ConferenceFormData) => void;
  onCancel: () => void;
}

//-----------------------------------
export interface ConferenceDetailProps {
  conference: ConferenceResponse;
  onClose: () => void;
  conferenceId: string;
}

//-----------------------------------

export interface Category {
  conferenceCategoryId: string;
  conferenceCategoryName: string;
  // conferenceCount?:number;
}
// Category options type
export interface CategoryOption {
  value: string;
  label: string;
}


// Conference rankings
export const CONFERENCE_RANKINGS: CategoryOption[] = [
  { value: "ieee", label: "IEEE" },
  { value: "acm", label: "ACM" },
  { value: "springer", label: "Springer" },
  { value: "elsevier", label: "Elsevier" },
  { value: "scopus", label: "Scopus" },
  { value: "other", label: "Khác" }
];

// Global status options
export const GLOBAL_STATUS_OPTIONS: CategoryOption[] = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "open", label: "Đang mở đăng ký" },
  { value: "closed", label: "Đã đóng đăng ký" },
  { value: "ongoing", label: "Đang diễn ra" },
  { value: "completed", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" }
];

// Country options
export const COUNTRY_OPTIONS: CategoryOption[] = [
  { value: "VN", label: "Việt Nam" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "SG", label: "Singapore" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" }
];

//---------------------------------------------------

export interface ConferenceResponse {
  conferenceId: string;
  conferenceName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalSlot?: number;
  availableSlot?: number;
  address?: string;
  bannerImageUrl?: string;
  createdAt?: string;
  ticketSaleStart?: string;
  ticketSaleEnd?: string;
  isInternalHosted?: boolean;
  isResearchConference?: boolean;
  cityId?: string;
  conferenceCategoryId?: string;
  conferenceStatusId?: string;
  // policies?: ConferencePolicyResponse[];
  // media?: ConferenceMediaResponse[];
  // sponsors?: SponsorResponse[];
  conferencePrices?: ConferencePriceResponse[];
  // sessions?: ConferenceSessionResponse[];
}

export interface TechnicalConferenceDetailResponse {
  conferenceId?: string;
  conferenceName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalSlot?: number;
  availableSlot?: number;
  address?: string;
  bannerImageUrl?: string;
  createdAt?: string;
  ticketSaleStart?: string;
  ticketSaleEnd?: string;
  isInternalHosted?: boolean;
  isResearchConference?: boolean;
  cityId?: string;
  conferenceCategoryId?: string;
  conferenceStatusId?: string;
  targetAudience?: string;
  refundPolicies?: RefundPolicyResponse[];
  conferenceMedia?: ConferenceMediaResponse[];
  policies?: ConferencePolicyResponse[];
  sponsors?: SponsorResponse[];
  sessions?: TechnicalConferenceSessionResponse[];
  conferencePrices?: ConferencePriceResponse[]; // 
}

export interface ResearchConferenceDetailResponse {
  conferenceId: string;
  conferenceName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalSlot?: number;
  availableSlot?: number;
  address?: string;
  bannerImageUrl?: string;
  createdAt?: string;
  ticketSaleStart?: string;
  ticketSaleEnd?: string;
  isInternalHosted?: boolean;
  isResearchConference?: boolean;
  cityId?: string;
  conferenceCategoryId?: string;
  conferenceStatusId?: string;

  // Research Conference specific fields
  name?: string;
  paperFormat?: string;
  numberPaperAccept?: number;
  revisionAttemptAllowed?: number;
  rankingDescription?: string;
  allowListener?: boolean;
  rankValue?: string;
  rankYear?: number;
  reviewFee?: number;
  rankingCategoryId?: string;
  rankingCategoryName?: string;

  // Research Conference related data
  rankingFileUrls?: RankingFileUrlResponse[];
  materialDownloads?: MaterialDownloadResponse[];
  rankingReferenceUrls?: RankingReferenceUrlResponse[];
  researchPhase?: ResearchConferencePhaseResponse;
  researchSessions?: ResearchConferenceSessionResponse[];

  // Shared data (same as technical conference)
  policies?: ConferencePolicyResponse[];
  sponsors?: SponsorResponse[];
  refundPolicies?: RefundPolicyResponse[];
  conferenceMedia?: ConferenceMediaResponse[];
  conferencePrices?: ConferencePriceResponse[];
}

export interface ConferencePolicyResponse {
  policyId: string;
  policyName?: string;
  description?: string;
}

export interface ConferenceMediaResponse {
  mediaId: string;
  mediaUrl?: string;
}

export interface SponsorResponse {
  sponsorId: string;
  name?: string;
  imageUrl?: string;
}

export interface ConferencePriceResponse {
  conferencePriceId: string;
  ticketPrice?: number;
  ticketName?: string;
  ticketDescription?: string;
  isAuthor?: boolean;
  totalSlot?: number;
  availableSlot?: number;
  pricePhases?: ConferencePricePhaseResponse[];
}

export interface ConferencePricePhaseResponse {
  pricePhaseId: string;
  phaseName?: string;
  startDate?: string;
  endDate?: string;
  applyPercent?: number;
  totalSlot?: number;
  availableSlot?: number;
}

export interface TechnicalConferenceSessionResponse {
  conferenceSessionId: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  sessionDate?: string;
  conferenceId?: string;
  statusId?: string;
  roomId?: string;
  room?: RoomInfoResponse;
  speakers?: SpeakerResponse[];
  sessionMedia?: ConferenceSessionMediaResponse[];
}

export interface RoomInfoResponse {
  roomId: string;
  number?: string;
  displayName?: string;
  destinationId?: string;
}

export interface SpeakerResponse {
  speakerId: string;
  name: string;
  description?: string;
  image?: string;
}

export interface ConferenceSessionMediaResponse {
  conferenceSessionMediaId: string;
  conferenceSessionMediaUrl?: string;
}

export interface RankingFileUrlResponse {
  rankingFileUrlId: string;
  fileUrl?: string;
}

export interface MaterialDownloadResponse {
  materialDownloadId: string;
  fileName?: string;
  fileDescription?: string;
  fileUrl?: string;
}

export interface RankingReferenceUrlResponse {
  referenceUrlId: string;
  referenceUrl?: string;
}

export interface ResearchConferencePhaseResponse {
  researchConferencePhaseId?: string;
  conferenceId?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  fullPaperStartDate?: string;
  fullPaperEndDate?: string;
  reviewStartDate?: string;
  reviewEndDate?: string;
  reviseStartDate?: string;
  reviseEndDate?: string;
  cameraReadyStartDate?: string;
  cameraReadyEndDate?: string;
  isWaitlist?: boolean;
  isActive?: boolean;
  revisionRoundDeadlines?: RevisionRoundDeadlineResponse[];
}

export interface RevisionRoundDeadlineResponse {
  revisionRoundDeadlineId?: string;
  endDate?: string;
  roundNumber?: number;
  researchConferencePhaseId?: string;
}

export interface ResearchConferenceSessionResponse {
  conferenceSessionId: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  conferenceId?: string;
  roomId?: string;
  room?: RoomInfoResponse;
  sessionMedia?: ConferenceSessionMediaResponse[];
}

export interface RefundPolicyResponse {
  refundPolicyId?: string;
  percentRefund?: number;
  refundDeadline?: string;
  refundOrder?: number;
}

export interface RegisteredUserInConference {
  ticketId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  email: string;
  registeredDate: string;
  conferenceId: string;
  conferenceName: string;
}

//not in use
export interface ConferenceBasicResponse {
  conferenceId: string;
  conferenceName: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  address: string;
  bannerImageUrl: string;
  createdAt: string;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  isActive: boolean;
  userId: string;
  locationId: string | null;
  categoryId: string;
}
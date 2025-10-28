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
  capacity?: number;
  address?: string;
  bannerImageFile?: File | null;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  categoryName: string;
}

//price step
export interface PricePhase {
  name: string;
  earlierBirdEndInterval: string;
  percentForEarly: number;
  standardEndInterval: string;
  lateEndInterval: string;
  percentForEnd: number;
}

export interface Price {
  priceId?: string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: string;
  actualPrice: number;
  currentPhase?: string;
  pricePhaseId?: string
}

export interface ConferencePriceData {
  pricePhase: PricePhase;
  prices: Price[];
}

//session step
export interface Speaker {
  name: string;
  description: string;
}

export interface Session {
  sessionId?: string,
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: string;
  room?: RoomInfoResponse
  speaker?: Speaker;
}

export interface ConferenceSessionData {
  sessions: Session[];
}

export interface Speaker {
  name: string;
  description: string;
}

export interface ConferenceSpeakerData {
  speaker: Speaker;
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
  policies?: ConferencePolicyResponse[];
  media?: ConferenceMediaResponse[];
  sponsors?: SponsorResponse[];
  conferencePrices?: ConferencePriceResponse[];
  sessions?: ConferenceSessionResponse[];
}

export interface ConferencePolicyResponse {
  policyId: string;
  policyName?: string;
  description?: string;
}

export interface ConferenceMediaResponse {
  mediaId: string;
  mediaUrl?: string;
  mediaTypeId?: string;
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
  isAuthot?: boolean;
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

export interface ConferenceSessionResponse {
  sessionId: string;
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
// // src/types/conference.type.ts

export interface Conference {
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
  policies?: Policy[];
  media?: Media[];
  sponsors?: Sponsor[];

  tickets?: Ticket[];
  phases?: Phase[];

  prices?: ConferencePriceData[];
  sessions?: Session[];
  
  createdby?:string;
  targetAudienceTechnicalConference?:string;
}

export interface PendingConference extends Conference {
  createdBy: string | null;
}

export type ConferenceFormData = Omit<
  Conference,
  "conferenceId" | "createdAt" | "isActive" | "priceId" | "sessionId"
>;

//+++++++++++++++

//BASIC STEP
export interface ConferenceBasicForm {
  conferenceId?:string;
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
  createdby?: string;
  targetAudienceTechnicalConference?: string;

}

//PRICE STEP
export interface Ticket {
  ticketId?:string;
  ticketPrice: number;
  ticketName: string; 
  ticketDescription: string;
  isAuthor?: boolean;
  totalSlot: number;
}


export interface Phase {
  pricePhaseId?:string;
  phaseName: string;
  applyPercent: number; 
  startDate: string;
  endDate: string;
  totalslot: number;
}

export interface ConferencePriceData {
  tickets: Ticket[];
  phases: Phase[];
}

//SESSION STEP
export interface Session {
  sessionId?: string,
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  roomId: string;
  speaker?: Speaker;
  sessionMedias?: SessionMedia[]
}

export interface Speaker {
  speakerId?:string;
  name: string;
  description: string;
  imageUrl?: string;
  image?: string;
}

export interface SessionMedia {
  sessionMediaId?: string
  mediaFile: string;
}

export interface ConferenceSessionData {
  sessions: Session[];
}


//POLICY STEP
export interface Policy {
  policyId?: string;
  policyName: string;
  description: string;
}

export interface ConferencePolicyData {
  policies: Policy[];
}

//MEDIA STEP
export interface Media {
  mediaId?: string;
  mediaFile: string | File | null;
  mediaUrl?: string;
}

export interface ConferenceMediaData {
  media: Media[];
}

//SPONSOR STEP
export interface Sponsor {
  sponsorId?: string;
  name: string;
  imageFile: string | File | null;
  imageUrl?: string;

}

export interface ConferenceSponsorData {
  sponsors: Sponsor[];
}

//+++++++++++++++


//prop
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

//-----------------------------------


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
  categoryId?: string;
  conferenceStatusId?: string;
  policies?: ConferencePolicyResponse[];
  media?: ConferenceMediaResponse[];
  sponsors?: SponsorResponse[];
  prices?: ConferencePriceResponse[];
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
  date?: string;
  conferenceId?: string;
  statusId?: string;
  roomId?: string;
  room?: RoomInfoResponse;
  speaker?: SpeakerResponse;
}

export interface RoomInfoResponse {
  roomId: string;
  number?: string;
  displayName?: string;
  destinationId?: string;
}

export interface SpeakerResponse {
  name: string;
  description?: string;
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
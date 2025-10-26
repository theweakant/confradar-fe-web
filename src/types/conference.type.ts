// // src/types/conference.type.ts

import { Room } from "./room.type";


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
  priceId?:string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: string;
  actualPrice: number;
  currentPhase?:string;
  pricePhaseId?:string
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
  sessionId?:string,
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
  policyName: string;
  description: string;
}

export interface ConferencePolicyData {
  policies: Policy[];
}

// Media Step
export interface Media {
  mediaFile: string | File | null;    
}

export interface ConferenceMediaData {
  media: Media[];
}

// Sponsors Step
export interface Sponsor {
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
// xài mấy type ở trên nha SƠN, phần này bỏ

// export interface TechConferenceDetail {
//   conferenceId: Conference;
//   targetAudience: string;
// }

// export interface ResearchConferenceDetail {
//   conferenceId: Conference;
//   name: string;
//   registrationDeadline: string;
//   reviewDeadline: string;
//   cameraReadyDeadline: string;
//   coAuthorSaleDeadline: string;
//   paperTopic: string;
//   paperFormat: string;
//   numberPaperAccepted: number;
//   revisionAttemptAllowed: number;
// }

// export type ConferenceSession = {
//   id: string;
//   title: string;
//   description: string;
//   startTime: string; // ISO datetime 
//   endTime: string;
//   date: string; // ISO date
//   statusId: string;
//   // conferenceDayId: string;
//   roomId: string;
// };



// export type ConferenceTicketType = {
//   ticketId: string;
//   ticketPrice: number;
//   ticketName: string;
//   ticketDescription: string;
//   actualPrice: number;
//   ticketPhaseId: string;
//   conferenceSessionId?: string | null;
//   conferenceId: Conference;
// };

// export type TicketPhase = {
//   id: string;
//   name: string;
//   earlierBirdEndInterval: number;
//   percentForEarly: number;
//   standardEndInterval: number;
//   lateEndInterval: number;
//   percentForEnd: number;
// };


// export interface Location {
//   city: string;
//   country: string;
// }

// export interface ConferenceType {
//   conferenceTypeId: string;
//   conferenceTypeName: string;
// }

// export interface ConferenceCategory {
//   conferenceCategoryId: string;
//   conferenceCategoryName: string;
// }

// export interface ConferenceRanking {
//   conferenceRankingId: string;    // PK
//   name: string;
//   description?: string;
//   referenceUrl?: string;
//   fileUrl?: string;

//   rankingCategoryId: RankingCategory;
// }

// export interface RankingCategory {
//   rankingCategoryId: string;   // PK
//   rankName: string;
//   rankDescription?: string;
// }








// // Type cho validation rules
// export interface ValidationRule {
//   validate: (value: string | number | boolean) => boolean;
//   message: string;
// }

// export type FieldValidation = {
//   [K in keyof ConferenceFormData]?: ValidationRule[];
// };

// Category options type
export interface CategoryOption {
  value: string;
  label: string;
}

// Conference categories
export const CONFERENCE_CATEGORIES: CategoryOption[] = [
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "web-dev", label: "Web Development" },
  { value: "cloud", label: "Cloud Computing" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "data-science", label: "Data Science" },
  { value: "mobile", label: "Mobile Development" }
];

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
  conferenceName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  address?: string;
  bannerImageUrl?: string;
  createdAt?: string;
  isInternalHosted?: boolean;
  isResearchConference?: boolean;
  isActive?: boolean;
  userId?: string;
  locationId?: string;
  categoryId?: string;
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
  priceId: string;
  ticketPrice?: number;
  ticketName?: string;
  ticketDescription?: string;
  actualPrice?: number;
  currentPhase?: string;
  pricePhaseId?: string;
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
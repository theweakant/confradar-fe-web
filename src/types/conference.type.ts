// // src/types/conference.type.ts

import { User } from "./user.type";

// export interface Conference {
//   id: string;
//   title: string;
//   description: string;
//   startDate: string;
//   endDate: string;
//   location: string;
//   venue: string;
//   category: "technology" | "research" | "business" | "education";
//   status: "upcoming" | "ongoing" | "completed" | "cancelled";
//   registrationDeadline: string;
//   maxAttendees: number;
//   currentAttendees: number;
//   registrationFee: number;
//   organizerName: string;
//   organizerEmail: string;
//   website?: string;
//   tags: string[];
// }

// export interface TechConference {
//   id: string;
//   title: string;
//   description: string;
//   startDate: string;
//   endDate: string;
//   location: string;
//   venue: string;
//   category: "technology" | "research" | "business" | "education";
//   status: "upcoming" | "ongoing" | "completed" | "cancelled";
//   registrationDeadline: string;
//   maxAttendees: number;
//   currentAttendees: number;
//   registrationFee: number;
//   organizerName: string;
//   organizerEmail: string;
//   website?: string;
//   tags: string[];
// }

// export interface ResearchConference {
//   id: string;
//   title: string;
//   description: string;
//   startDate: string;
//   endDate: string;
//   location: string;
//   venue: string;
//   category: "technology" | "research" | "business" | "education";
//   status: "upcoming" | "ongoing" | "completed" | "cancelled";
//   registrationDeadline: string;
//   maxAttendees: number;
//   currentAttendees: number;
//   registrationFee: number;
//   organizerName: string;
//   organizerEmail: string;
//   website?: string;
//   tags: string[];
// }

// export type ConferenceFormData = Omit<Conference, "id" | "currentAttendees">;

// export interface ConferenceFormProps {
//   conference?: Conference | null;
//   onSave: (data: ConferenceFormData) => void;
//   onCancel: () => void;
// }

// export interface ConferenceDetailProps {
//   conference: Conference;
//   onClose: () => void;
// }


// // Type cho validation rules
// export interface ValidationRule {
//   validate: (value: string | number) => boolean;
//   message: string;
// }

// export type FieldValidation = {
//   [K in keyof ConferenceFormData]?: ValidationRule[];
// };

// src/types/conference.type.ts

export interface Conference {
  conferenceId: string;            // PK
  conferenceName: string;
  description: string;
  startDate: string;               // ISO date string
  endDate: string;                 // ISO date string
  capacity: number;
  address: string;
  bannerImageUrl?: string;
  createdAt: string;
  isInternalHosted: boolean;

  // Foreign Keys
  conferenceRankingId: ConferenceRanking;     
  userId: User;                 
  locationId: Location;              
  conferenceCategoryId: ConferenceCategory;    
  conferenceTypeId: ConferenceType;        
  globalStatusId: string;          

  isActive: boolean;
}

export interface TechConferenceDetail {
  conferenceId: Conference; 
  targetAudience: string;
}

export interface ResearchConferenceDetail {
  conferenceId: Conference; 
  name: string;
  registrationDeadline: string; 
  reviewDeadline: string; 
  cameraReadyDeadline: string; 
  coAuthorSaleDeadline: string; 
  paperTopic: string;
  paperFormat: string;
  numberPaperAccepted: number;
  revisionAttemptAllowed: number;
}

export type ConferenceSession = {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO datetime 
  endTime: string;
  date: string; // ISO date
  statusId: string;
  // conferenceDayId: string;
  roomId: string;
};

export interface Speaker {
  name: string;
  description: string;
}

export type ConferenceTicketType = {
  ticketId: string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: string;
  actualPrice: number;
  ticketPhaseId: string;
  conferenceSessionId?: string | null;
  conferenceId: Conference; 
};

export type TicketPhase = {
  id: string;
  name: string;
  earlierBirdEndInterval: number;
  percentForEarly: number;
  standardEndInterval: number;
  lateEndInterval: number;
  percentForEnd: number;
};


export interface Location {
  city: string;
  country: string;
}

export interface ConferenceType {
  conferenceTypeId: string;    
  conferenceTypeName: string;      
}

export interface ConferenceCategory {
  conferenceCategoryId: string;    
  conferenceCategoryName: string;      
}

export interface ConferenceRanking {
  conferenceRankingId: string;    // PK
  name: string;
  description?: string;
  referenceUrl?: string;
  fileUrl?: string;

  rankingCategoryId: RankingCategory;       
}

export interface RankingCategory {
  rankingCategoryId: string;   // PK
  rankName: string;
  rankDescription?: string;
}


export type ConferenceFormData = Omit<Conference, "id" | "maxAttendees">;

export interface ConferenceFormProps {
  conference?: Conference | null;
  onSave: (data: ConferenceFormData) => void;
  onCancel: () => void;
}

export interface ConferenceDetailProps {
  conference: Conference;
  onClose: () => void;
}



// Type cho validation rules
export interface ValidationRule {
  validate: (value: string | number | boolean) => boolean;
  message: string;
}

export type FieldValidation = {
  [K in keyof ConferenceFormData]?: ValidationRule[];
};

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
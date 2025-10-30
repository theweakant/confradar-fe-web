// // src/types/conference.type.ts

//NAM
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
  refundPolicies?: RefundPolicy[];
  media?: Media[];
  sponsors?: Sponsor[];

  tickets?: Ticket[];
  phases?: Phase[];

  prices?: ConferencePriceData[];
  sessions?: Session[];
  
  createdby?:string;
  targetAudienceTechnicalConference?:string;

  researchDetail?: ResearchDetail;
  researchPhase?: ResearchPhase;
  researchRankingFiles?: ResearchRankingFile[];
  researchRankingReferences?: ResearchRankingReference[];
  researchMaterials?: ResearchMaterial[]; 


}

export interface PendingConference extends Conference {
  createdBy: string | null;
}

export type ConferenceFormData = Omit<
  Conference,
  "conferenceId" | "createdAt" | "isActive" | "priceId" | "sessionId"
>;

//+++++++++++++++

export interface ConferenceRanking {
  rankId: string;
  rankName: string;
  description: string | null;
}


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
  targetAudienceTechnicalConference?: string; //for tech conf

}

//PRICE STEP
export interface Ticket {
  ticketId?: string;
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
  // tickets: Ticket[];
  typeOfTicket: Ticket
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
  mediaUrl?: string;
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

export interface RefundPolicy {
  refundPolicyId?: string; 
  percentRefund: number;
  refundDeadline: string; 
  refundOrder: number;
}

export interface ConferenceRefundPolicyData {
  refundPolicies: RefundPolicy[];
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

//+++++++++++++++
//RESEARCH DETAIL STEP
export interface ResearchDetail {
  researchDetailId?: string; 
  name: string;
  paperFormat: string;
  numberPaperAccept: number;
  revisionAttemptAllowed: number;
  rankingDescription: string;
  allowListener: boolean;
  rankValue: string;
  rankYear: number;
  reviewFee: number;
  rankingCategoryId: string;
}

export interface ConferenceResearchDetailData {
  researchDetail: ResearchDetail;
}

//RESEARCH PHASE STEP
export interface RevisionRoundDeadline {
  revisionRoundDeadlineId?: string; 
  endDate: string; // ISO date
  roundNumber: number;
}

export interface ResearchPhase {
  researchPhaseId?: string; 
  registrationStartDate: string; // ISO date
  registrationEndDate: string;
  fullPaperStartDate: string;
  fullPaperEndDate: string;
  reviewStartDate: string;
  reviewEndDate: string;
  reviseStartDate: string;
  reviseEndDate: string;
  cameraReadyStartDate: string;
  cameraReadyEndDate: string;
  isWaitlist: boolean;
  isActive: boolean;
  revisionRoundDeadlines: RevisionRoundDeadline[];
}

export interface ConferenceResearchPhaseData {
  researchPhase: ResearchPhase;
}

//RESEARCH RANKING FILE STEP
export interface ResearchRankingFile {
  rankingFileId?: string; // Có thể có khi update
  fileUrl?: string;
  file?: File | null;
}

export interface ConferenceResearchRankingFileData {
  rankingFiles: ResearchRankingFile[];
}

//RESEARCH RANKING REFERENCE STEP
export interface ResearchRankingReference {
  rankingReferenceId?: string;
  referenceUrl: string;
}

export interface ConferenceResearchRankingReferenceData {
  rankingReferences: ResearchRankingReference[];
}

//RESEARCH MATERIAL STEP
export interface ResearchMaterial {
  materialId?: string; 
  fileName: string;
  fileDescription?: string;
  file?: File | null;
  fileUrl?: string; 
}

export interface ConferenceResearchMaterialData {
  materials: ResearchMaterial[];
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


//---------------------------------------------------

//SON

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


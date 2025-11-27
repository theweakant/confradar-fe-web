// // src/types/conference.type.ts

import { CollaboratorContract } from "./contract.type";

//NAM
export type CommonConference =
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;

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

  createdby?: string;
  createdBy?: string | null | undefined;

  targetAudienceTechnicalConference?: string;

  researchDetail?: ResearchDetail;
  researchPhase?: ResearchPhase;
  researchRankingFiles?: ResearchRankingFile[];
  researchRankingReferences?: ResearchRankingReference[];
  researchMaterials?: ResearchMaterial[];

  targetAudience?: string;
  conferenceMedia?: Media[];
  conferencePrices?: ConferencePrice[];

  userNameCreator?: string;    
  organization?: string; 
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
  conferenceId?: string;
  conferenceName: string;
  description?: string;
  startDate: string;
  endDate: string;
  dateRange?: number;
  totalSlot: number;
  address?: string;
  bannerImageFile?: File | null;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  conferenceCategoryId: string;
  cityId: string;
  ticketSaleStart: string; //ISO
  ticketSaleEnd: string; //ISO
  ticketSaleDuration?: number;
  createdby?: string;

  targetAudienceTechnicalConference?: string; //for tech conf
  customTarget?: string;
  conferenceStatusId?: string
}

export interface ConferenceBasicResponse {
  conferenceId: string;
  conferenceName: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSlot: number;
  availableSlot: number;
  address: string;
  bannerImageFileUrl: string;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  conferenceCategoryId: string;
  cityId: string;
  createdAt: string;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  createdby: string;
  targetAudience: string;
}

//PRICE STEP
export interface RefundInPhase {
  refundPolicyId?: string
  percentRefund: number;
  refundDeadline: string;
}

export interface Phase {
  pricePhaseId?: string;
  phaseName: string;
  applyPercent: number;
  startDate: string;
  endDate: string;
  totalslot: number;
  refundInPhase: RefundInPhase[] | RefundPolicyResponse[];
  forWaitlist?: boolean
}

export interface Ticket {
  ticketId?: string;
  priceId?: string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: string;
  isAuthor?: boolean;
  totalSlot: number;
  phases: Phase[];
}

export interface ConferencePriceData {
  typeOfTicket: Ticket[];
}

//API res theo tech conf organizer&collab
export interface PricePhase {
  pricePhaseId: string;
  phaseName: string;
  startDate: string;
  endDate: string;
  applyPercent: number;
  totalSlot: number;
  availableSlot: number;
}

export interface ConferencePrice {
  conferencePriceId: string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: string;
  isAuthor: boolean;
  totalSlot: number;
  availableSlot: number;
  pricePhases: PricePhase[];
}

//SESSION STEP
export interface Session {
  conferenceId?: string;
  sessionId?: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  timeRange?: number;
  speaker: Speaker[];
  sessionMedias?: SessionMedia[];

  roomId: string;
  roomDisplayName?:string
  roomNumber?:string

  conferenceName?: string;
}

export type ResearchSession = Omit<Session, 'speaker'>;


export interface Speaker {
  speakerId?: string;
  name: string;
  description: string;
  image?: File | string;
  imageUrl?: string;
}

export interface SessionMedia {
  sessionMediaId?: string;
  mediaFile?: File | string | null;
  mediaUrl?: string;
}

export interface ConferenceSessionData {
  sessions: Session[];
}

export interface ConferenceResearchSessionData {
  sessions: ResearchSession[];
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
  mediaFile: File | null | string;
  mediaUrl?: string;
}

export interface ConferenceMediaData {
  media: Media[];
}

//SPONSOR STEP
export interface Sponsor {
  sponsorId?: string;
  name: string;
  imageFile: File | null | string;
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
  isRefunded: boolean;
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
  researchPhaseId?: string;
  revisionRoundDeadlineId?: string;
  startSubmissionDate: string;
  endSubmissionDate: string;
  roundNumber: number;
}

export interface ResearchPhase {
  researchPhaseId?: string;
  isWaitlist: boolean;
  isActive: boolean;
  revisionRoundDeadlines: RevisionRoundDeadline[];

  registrationStartDate: string;
  registrationEndDate: string;
  fullPaperStartDate: string;
  fullPaperEndDate: string;
  reviewStartDate: string;
  reviewEndDate: string;
  reviseStartDate: string;
  reviseEndDate: string;
  cameraReadyStartDate: string;
  cameraReadyEndDate: string;

  abstractDecideStatusStart: string;
  abstractDecideStatusEnd: string;
  fullPaperDecideStatusStart: string;
  fullPaperDecideStatusEnd: string;
  revisionPaperDecideStatusStart: string;
  revisionPaperDecideStatusEnd: string;
  cameraReadyDecideStatusStart: string;
  cameraReadyDecideStatusEnd: string;

  registrationDuration?: number;
  fullPaperDuration?: number;
  reviewDuration?: number;
  reviseDuration?: number;
  cameraReadyDuration?: number;
  abstractDecideStatusDuration?: number;
  fullPaperDecideStatusDuration?: number;
  revisionPaperReviewDuration?: number;
  revisionPaperDecideStatusDuration?: number;
  cameraReadyDecideStatusDuration?: number;
}
export type UpdateResearchPhaseRequest = {
  registrationStartDate: string;
  registrationEndDate: string;
  fullPaperStartDate: string;
  fullPaperEndDate: string;
  reviewStartDate: string;
  reviewEndDate: string;
  reviseStartDate: string;
  reviseEndDate: string;
  cameraReadyStartDate: string;
  cameraReadyEndDate: string;

  abstractDecideStatusStart: string;
  abstractDecideStatusEnd: string;
  fullPaperDecideStatusStart: string;
  fullPaperDecideStatusEnd: string;
  revisionPaperDecideStatusStart: string;
  revisionPaperDecideStatusEnd: string;
  cameraReadyDecideStatusStart: string;
  cameraReadyDecideStatusEnd: string;

  registrationDuration?: number;
  fullPaperDuration?: number;
  reviewDuration?: number;
  reviseDuration?: number;
  cameraReadyDuration?: number;

  isWaitlist: boolean;
  isActive: boolean;
};
export interface ConferenceResearchPhaseData {
  researchPhase: ResearchPhase;
}

//RESEARCH RANKING FILE STEP
export interface ResearchRankingFile {
  rankingFileId?: string;
  fileUrl?: string;
  file?: File | null | string;
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
  file?: File | null | string;
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
  mode?: "create" | "edit";
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

export interface ConferenceStatus {
  conferenceStatusId: string;
  conferenceStatusName: string;
  conferenceTimelineAfterwardStatuses: unknown[];
  conferenceTimelinePreviousStatuses: unknown[];
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
  createdBy?: string | null | undefined;
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
  conferencePrices?: ConferencePriceResponse[];
  conferenceTimelines?: ConferenceTimelineResponse[];
  purchasedInfo?: PurchasedInfo;
contract:CollaboratorContract;

}

export interface ResearchConferenceDetailResponse {
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
  researchPhase?: ResearchConferencePhaseResponse[];
  researchSessions?: ResearchConferenceSessionResponse[];

  // Shared data (same as technical conference)
  policies?: ConferencePolicyResponse[];
  sponsors?: SponsorResponse[];
  refundPolicies?: RefundPolicyResponse[];
  conferenceMedia?: ConferenceMediaResponse[];
  conferencePrices?: ConferencePriceResponse[];
  conferenceTimelines?: ConferenceTimelineResponse[];
  purchasedInfo?: PurchasedInfo;
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
  refundPolicies?: RefundPolicyResponse[];
  forWaitlist?: boolean;
}

export interface TechnicalConferenceSessionResponse {
  conferenceSessionId: string;
  title: string;
  description?: string;
  date?: string;
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

  waitlistPhase?: ResearchConferencePhaseResponse;
  
  abstractDecideStatusStart?: string;
  abstractDecideStatusEnd?: string;
  fullPaperDecideStatusStart?: string;
  fullPaperDecideStatusEnd?: string;
  revisionPaperReviewStart?: string;
  revisionPaperReviewEnd?: string;
  revisionPaperDecideStatusStart?: string;
  revisionPaperDecideStatusEnd?: string;
  cameraReadyDecideStatusStart?: string;
  cameraReadyDecideStatusEnd?: string;

}

export interface RevisionRoundDeadlineResponse {
  revisionRoundDeadlineId?: string;
  startSubmissionDate?: string;
  endSubmissionDate?: string;
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

export interface ConferenceTimelineResponse {
  conferenceTimelineId: string;
  conferenceId: string;
  changeDate: string;
  previousStatusId: string;
  afterwardStatusId: string;
  reason: string | null;
  previousStatusName: string;
  afterwardStatusName: string;
  conferenceName: string;
}

export interface PurchasedInfo {
  ticketId: string | null;
  conferencePriceId: string | null;
  pricePhaseId: string | null;
}

export interface FavouriteConferenceDetailResponse {
  conferenceId: string;
  favouriteCreatedAt?: string;
  conferenceName?: string;
  conferenceDescription?: string;
  bannerImageUrl?: string;
  conferenceStartDate?: string;
  conferenceEndDate?: string;
  ticketSaleStart?: string;
  ticketSaleEnd?: string;
  isInternalHosted?: boolean;
  isResearchConference?: boolean;
  availableSlot?: number;
}

export interface DeletedFavouriteConferenceResponse {
  conferenceId: string;
  isDeleted: boolean;
}

export interface AddedFavouriteConferenceResponse {
  conferenceId: string;
  isAdded: boolean;
}

export interface FavouriteConferenceRequest {
  conferenceId: string;
}

export interface ConferenceDetailForScheduleResponse {
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
  cityName?: string;
  conferenceCategoryId?: string;
  conferenceCategoryName?: string;
  conferenceStatusId?: string;
  conferenceStatusName?: string;

  sessions: SessionDetailForScheduleResponse[];
}

export interface SessionDetailForScheduleResponse {
  conferenceSessionId: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;

  date?:string
  sessionDate?: string;

  conferenceId?: string;
  roomId?: string;
  roomNumber?: string;
  roomDisplayName?: string;
  destinationId?: string;
  destinationName?: string;
  destinationDistrict?: string;
  destinationStreet?: string;
  cityId?: string;
  cityName?: string;

  presenterAuthor?: PresenterAuthor[];
  speakerNames?: string[];
}

export interface PresenterAuthor {
  conferenceSessionId: string;
  paperId: string;
  assignedAt?: string;
  conferenceId?: string;
  paperPhaseId?: string;
  paperPhaseName?: string;
  researchConferencePhaseId?: string;
  createdAt?: string;
  paperTitle?: string;
  paperDescription?: string;
  paperAuthor?: PaperAuthor[];
}

export interface PaperAuthor {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  paperId: string;
  isPresenter?: boolean;
  isRootAuthor?: boolean;
}
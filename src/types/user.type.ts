// src/types/user.type.ts

export interface AuthUser {
  userId: string;
  email: string;
  role: string[] | null;
}

export interface UserProfileResponse {
  userId: string;
  email: string;
  fullName: string;
  birthDay: string | null;
  phoneNumber: string | null;
  gender: string | null;
  avatarUrl: string | null;
  bioDescription: string | null;
  createdAt: string;
  // roles?: string[];

  // status?: string
}

export interface ProfileUpdateRequest {
  fullName?: string;
  birthDay?: string;
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  avatarFile?: File;
  bioDescription?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface CollaboratorRequest {
  // userId?: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}




//+++++

export interface UserDetailForAdminAndOrganizerResponse {
  userId: string;
  email?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  isActive?: boolean | null;
  isEmailConfirmed?: boolean | null;
}

export interface ListUserDetailForAdminAndOrganizerResponse {
  roleId: string;
  roleName: string;
  users: UserDetailForAdminAndOrganizerResponse[];
}

export interface ReviewerListResponse {
  userId: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  avatarUrl: string | null;
}

//+++++

export type UserFormData = Omit<UserProfileResponse, "userId" | "createdAt">;

export interface UserFormProps {
  user?: UserProfileResponse | null;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

export interface UserDetailProps {
  user: UserProfileResponse;
  onClose: () => void;
}

export interface UserTableProps {
  users: UserProfileResponse[];
  onView: (user: UserProfileResponse) => void;
  onEdit: (user: UserProfileResponse) => void;
  onDelete: (id: string) => void;
}

//--------------------------------------------------------------

// REVIEWER TYPES
// ============================================

export interface Reviewer {
  reviewerId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  organization: string;
  expertise: string[];
  type: "localreviewer" | "externalreviewer";
  status: "active" | "inactive";
  assignedPapers: number;
  completedReviews: number;
  joinedDate: string;
}

export type ReviewerFormData = Omit<
  Reviewer,
  "reviewerId" | "status" | "assignedPapers" | "completedReviews" | "joinedDate"
>;

export interface ReviewerFormProps {
  reviewer?: Reviewer | null;
  onSave: (data: ReviewerFormData) => void;
  onCancel: () => void;
}

export interface ReviewerDetailProps {
  reviewer: Reviewer;
  onClose: () => void;
}

export interface ReviewerTableProps {
  reviewers: Reviewer[];
  onView: (reviewer: Reviewer) => void;
  onEdit: (reviewer: Reviewer) => void;
  onDelete: (id: string) => void;
}

export type ReviewerFieldValidation = {
  [K in keyof ReviewerFormData]?: ValidationRule[];
};

// Type cho validation rules
export interface ValidationRule {
  validate: (value: string | number) => boolean;
  message: string;
}

export type FieldValidation = {
  [K in keyof UserFormData]?: ValidationRule[];
};


//ORGANIZATION


export interface OrganizationContractDetail {
  collaboratorContractId: string;
  collaboratorContractUserId: string;
  collaboratorContractEmail: string | null;
  collaboratorContractFullName: string | null;
  collaboratorContractAvatarUrl: string | null;
  organizationId: string;
  organizationDescription: string;
  organizationName: string;
  isSponsorStep: boolean;
  isMediaStep: boolean;
  isPolicyStep: boolean;
  isSessionStep: boolean;
  isPriceStep: boolean;
  isTicketSelling: boolean;
  isClosed: boolean;
  signDay: string; 
  finalizePaymentDate: string; 
  commission: number;
  contractUrl: string | null;
  conferenceId: string;
  conferenceName: string;
  conferenceDescription: string | null;
  conferenceStartDate: string | null;
  conferenceEndDate: string | null;
  conferenceTotalSlot: number | null;
  conferenceAvailableSlot: number | null;
  conferenceAddress: string | null;
  conferenceBannerImageUrl: string | null;
  conferenceCreatedAt: string; // ISO string
  conferenceTicketSaleStart: string | null;
  conferenceTicketSaleEnd: string | null;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  cityId: string | null;
  cityName: string | null;
  conferenceCreatedBy: string;
  conferenceCreatedByName: string | null;
  conferenceCreatedByEmail: string | null;
  conferenceCreatedByAvatarUrl: string | null;
  conferenceCategoryId: string | null;
  conferenceCategoryName: string | null;
  conferenceStatusId: string;
  conferenceStatusName: string;
}

export interface OrganizationItem {
  organizationId: string;
  organizationDescription: string;
  organizationName: string;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  contractDetail: OrganizationContractDetail[];
}

export type OrganizationListResponse = OrganizationItem[];

//COLLABORATOR

export interface CollaboratorContractDetail {
  collaboratorContractId: string;
  collaboratorContractUserId: string;
  collaboratorContractEmail: string | null;
  collaboratorContractFullName: string | null;
  collaboratorContractAvatarUrl: string | null;
  organizationId: string | null;
  organizationDescription: string | null;
  organizationName: string | null;
  isSponsorStep: boolean;
  isMediaStep: boolean;
  isPolicyStep: boolean;
  isSessionStep: boolean;
  isPriceStep: boolean;
  isTicketSelling: boolean;
  isClosed: boolean;
  signDay: string;
  finalizePaymentDate: string;
  commission: number;
  contractUrl: string | null;
  conferenceId: string;
  conferenceName: string;
  conferenceDescription: string | null;
  conferenceStartDate: string | null;
  conferenceEndDate: string | null;
  conferenceTotalSlot: number | null;
  conferenceAvailableSlot: number | null;
  conferenceAddress: string | null;
  conferenceBannerImageUrl: string | null;
  conferenceCreatedAt: string;
  conferenceTicketSaleStart: string | null;
  conferenceTicketSaleEnd: string | null;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  cityId: string | null;
  cityName: string | null;
  conferenceCreatedBy: string;
  conferenceCreatedByName: string | null;
  conferenceCreatedByEmail: string | null;
  conferenceCreatedByAvatarUrl: string | null;
  conferenceCategoryId: string | null;
  conferenceCategoryName: string | null;
  conferenceStatusId: string;
  conferenceStatusName: string;
}

export interface CollaboratorItem {
  organizationId: string | null;
  organizationDescription: string | null;
  organizationName: string | null;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  bioDescription: string | null;
  contractDetail: CollaboratorContractDetail[];
}

export type CollaboratorListResponse = CollaboratorItem[];
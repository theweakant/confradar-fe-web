// src/types/user.type.ts

export interface AuthUser {
  userId: string;
  email: string;
  role: string | null;
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
  roles?: string[];
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
  userId?: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

//+++++

export interface UsersListResponse {
  users: UserProfileResponse[];
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

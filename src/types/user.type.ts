// src/types/user.type.ts

export interface AuthUser {
  email: string
  role: string | null
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber:string;
  address:string
  role: string;
  status: "active" | "inactive";
  registeredConferences: number;
  joinedDate: string;
}

export type UserFormData = Omit<User, "userId" | "status" | "registeredConferences" | "joinedDate">;

export interface UserFormProps {
  user?: User | null;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

export interface UserDetailProps {
  user: User;
  onClose: () => void;
}

export interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}


// REVIEWER TYPES
// ============================================

export interface Reviewer {
  reviewerId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  organization: string;
  expertise: string[]; // Các lĩnh vực chuyên môn
  type: "localreviewer" | "externalreviewer";
  status: "active" | "inactive";
  assignedPapers: number;
  completedReviews: number;
  joinedDate: string;
}

export type ReviewerFormData = Omit<Reviewer, "reviewerId" | "status" | "assignedPapers" | "completedReviews" | "joinedDate">;

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
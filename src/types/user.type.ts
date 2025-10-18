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

// Type cho validation rules
export interface ValidationRule {
  validate: (value: string | number) => boolean;
  message: string;
}

export type FieldValidation = {
  [K in keyof UserFormData]?: ValidationRule[];
};
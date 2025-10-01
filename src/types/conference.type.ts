// src/types/conference.type.ts

export interface Conference {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  category: "technology" | "research" | "business" | "education";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrationDeadline: string;
  maxAttendees: number;
  currentAttendees: number;
  registrationFee: number;
  organizerName: string;
  organizerEmail: string;
  website?: string;
  tags: string[];
}

export type ConferenceFormData = Omit<Conference, "id" | "currentAttendees">;

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
  validate: (value: string | number) => boolean;
  message: string;
}

export type FieldValidation = {
  [K in keyof ConferenceFormData]?: ValidationRule[];
};
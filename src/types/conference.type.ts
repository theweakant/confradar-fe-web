interface Conference {
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
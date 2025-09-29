interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organizer" | "attendee";
  status: "active" | "inactive";
  registeredConferences: number;
  joinedDate: string;
}
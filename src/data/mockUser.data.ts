import { User } from "@/types/user.type";
export const mockUsers: User[] = [
    {
      id: "1",
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      role: "admin",
      status: "active",
      registeredConferences: 5,
      joinedDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Trần Thị Bình",
      email: "binh.tran@example.com",
      role: "organizer",
      status: "active",
      registeredConferences: 12,
      joinedDate: "2024-02-20"
    },
    {
      id: "3",
      name: "Lê Hoàng Cường",
      email: "cuong.le@example.com",
      role: "attendee",
      status: "active",
      registeredConferences: 8,
      joinedDate: "2024-03-10"
    },
    {
      id: "4",
      name: "Phạm Thị Dung",
      email: "dung.pham@example.com",
      role: "attendee",
      status: "inactive",
      registeredConferences: 2,
      joinedDate: "2024-04-05"
    }
];
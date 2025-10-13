// src/data/mockRoom.data.ts

import { Room } from "@/types/room.type";

export const mockRooms: Room[] = [
  {
    roomId: "room1",
    number: "A101",
    displayName: "Hội trường Grand Vision",
    destinationId: "dest1",
    status: "active",
  },
  {
    roomId: "room2",
    number: "B202",
    displayName: "Phòng Hội nghị Quốc tế",
    destinationId: "dest1",
    status: "active",
  },
  {
    roomId: "room3",
    number: "C303",
    displayName: "Phòng Workshop Sáng tạo",
    destinationId: "dest2",
    status: "inactive",
  },
  {
    roomId: "room4",
    number: "D404",
    displayName: "Phòng Trình bày Công nghệ",
    destinationId: "dest3",
    status: "active",
  },
];

export const mockDestinations = [
  {
    destinationId: "dest1",
    name: "Trung tâm Hội nghị Quốc gia",
    city: "Hà Nội",
    district: "Nam Từ Liêm",
    street: "57 Phạm Hùng",
  },
  {
    destinationId: "dest2",
    name: "Trung tâm Sự kiện Công nghệ Đà Nẵng",
    city: "Đà Nẵng",
    district: "Hải Châu",
    street: "42 Nguyễn Văn Linh",
  },
  {
    destinationId: "dest3",
    name: "Trung tâm Hội nghị Sài Gòn",
    city: "Hồ Chí Minh",
    district: "Quận 7",
    street: "799 Nguyễn Văn Linh",
  },
];

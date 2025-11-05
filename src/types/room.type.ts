
export type Room = {
  roomId: string;
  number: string;
  displayName: string;
  destinationId: string;
};

export type RoomFormData = Omit<Room, "roomId">

export interface CreateDestinationPayload {
  number: string;
  displayName: string;
  destinationId: string;
}

export interface RoomDetailProps {
  room: Room;
  onClose: () => void;
}

export interface RoomOccupationSlot {
  sessionId: string;
  sessionTitle: string;
  startTime: string;
  endTime: string;
  conferenceId: string;
  conferenceName: string;
}

export interface TimeSpan {
  startTime: string;
  endTime: string;
}

export interface RoomWithSessions {
  roomId: string;
  number: string | null;
  displayName: string | null;
  destinationId: string | null;
  sessions: RoomOccupationSlot[];
}
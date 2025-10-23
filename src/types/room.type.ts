
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



export type Destination = {
  destinationId: string;
  name: string;
  city: string;
  district: string;
  street: string;
};

export type Room = {
  roomId: string;
  number: string;
  displayName: string;
  destinationId: string; 
  status: string;
};

export type RoomFormData = {
  number: string;
  displayName: string;
  destinationId: string; 
  status: string;

};

export interface RoomDetailProps {
  room: Room;
  onClose: () => void;
}

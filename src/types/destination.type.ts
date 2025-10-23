export interface Destination {
  destinationId: string;
  name: string;
  city: string;
  district: string;
  street: string;
}

export interface CreateDestinationPayload {
  name: string;
  city: string;
  district: string;
  street: string;
}

export type DestinationFormData = Omit<Destination, "destinationId">

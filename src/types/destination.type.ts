export interface Destination {
  destinationId: string;
  name: string;
  cityId: string;
  cityName: string;
  district: string;
  street: string;
}

export interface CreateDestinationPayload {
  name: string;
  cityId: string;
  district: string;
  street: string;
}

export type DestinationFormData = Omit<Destination, "destinationId">;

export interface Publisher {
  publisherId: string;
  name: string;
  paperFormat: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  linkTemplate: string;
}

export type PublisherFormData = Omit<Publisher, "publisherId">;
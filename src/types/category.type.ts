export interface Category {
  conferenceCategoryId: string;
  conferenceCategoryName: string;
  // conferenceCount?:number;
}


export type CategoryFormData = Omit<
  Category,
  "conferenceCategoryId"
>;

export interface CategoryDetailProps {
  category: Category;
  onClose: () => void;
}
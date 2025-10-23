export interface Category {
  categoryId: string;
  conferenceCategoryName: string;
  // conferenceCount?:number;
}


export type CategoryFormData = Omit<
  Category,
  "categoryId"
>;

export interface CategoryDetailProps {
  category: Category;
  onClose: () => void;
}
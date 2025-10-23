import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Category } from "@/types/category.type";

interface CategoryState {
  list: Category[];
  loading: boolean;
  selected: Category | null;
}

const initialState: CategoryState = {
  list: [],
  loading: false,
  selected: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {

    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.list = action.payload;
    },


    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selected = action.payload;
    },


    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { setCategories, setSelectedCategory, startLoading, stopLoading } =
  categorySlice.actions;

export default categorySlice.reducer;

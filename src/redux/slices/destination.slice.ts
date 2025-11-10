import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Destination } from "@/types/destination.type";

interface DestinationState {
  list: Destination[];
  loading: boolean;
  selected: Destination | null;
}

const initialState: DestinationState = {
  list: [],
  loading: false,
  selected: null,
};

const destinationSlice = createSlice({
  name: "destination",
  initialState,
  reducers: {
    setDestinations: (state, action: PayloadAction<Destination[]>) => {
      state.list = action.payload;
    },
    setSelectedDestination: (
      state,
      action: PayloadAction<Destination | null>,
    ) => {
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

export const {
  setDestinations,
  setSelectedDestination,
  startLoading,
  stopLoading,
} = destinationSlice.actions;

export default destinationSlice.reducer;

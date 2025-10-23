import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Room } from "@/types/room.type";

interface RoomState {
  list: Room[];
  loading: boolean;
  selected: Room | null;
}

const initialState: RoomState = {
  list: [],
  loading: false,
  selected: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.list = action.payload;
    },
    setSelectedRoom: (state, action: PayloadAction<Room | null>) => {
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

export const { setRooms, setSelectedRoom, startLoading, stopLoading } =
  roomSlice.actions;

export default roomSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Conference } from "@/types/conference.type";

interface ConferenceState {
  list: Conference[];
  loading: boolean;
  selected: Conference | null;
  error?: string | null;
}

const initialState: ConferenceState = {
  list: [],
  loading: false,
  selected: null,
  error: null,
};

const conferenceSlice = createSlice({
  name: "conference",
  initialState,
  reducers: {
    // ✅ Set danh sách conference
    setConferences: (state, action: PayloadAction<Conference[]>) => {
      state.list = action.payload;
    },

    // ✅ Set conference đang được chọn
    setSelectedConference: (
      state,
      action: PayloadAction<Conference | null>,
    ) => {
      state.selected = action.payload;
    },

    // ✅ Set trạng thái loading
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    stopLoading: (state) => {
      state.loading = false;
    },

    // ✅ Xử lý lỗi (nếu cần dùng)
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setConferences,
  setSelectedConference,
  startLoading,
  stopLoading,
  setError,
} = conferenceSlice.actions;

export default conferenceSlice.reducer;

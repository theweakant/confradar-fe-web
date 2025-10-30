// conferenceStepSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConferenceStepState {
  currentStep: number;
  conferenceId: string | null;
  completedSteps: number[];
  loading: boolean;
  error: string | null;
  mode: 'create' | 'edit';
  maxStep: number;
}

const initialState: ConferenceStepState = {
  currentStep: 1,
  conferenceId: null,
  completedSteps: [],
  loading: false,
  error: null,
  mode: 'create',
  maxStep: 6, 
};

const conferenceStepSlice = createSlice({
  name: "conferenceStep",
  initialState,
  reducers: {
    // Set conference ID sau khi tạo basic step
    setConferenceId: (state, action: PayloadAction<string>) => {
      state.conferenceId = action.payload;
    },

    // ✅ THÊM: Set maxStep để hỗ trợ cả Tech (6) và Research (9)
    setMaxStep: (state, action: PayloadAction<number>) => {
      state.maxStep = action.payload;
    },

    // Load existing conference for edit
    loadExistingConference: (state, action: PayloadAction<{id: string, maxStep?: number}>) => {
      state.conferenceId = action.payload.id;
      state.mode = 'edit';
      state.currentStep = 1;
      state.completedSteps = [];
      // ✅ Cho phép set maxStep khi load conference
      if (action.payload.maxStep) {
        state.maxStep = action.payload.maxStep;
      }
    },

    // Set mode - QUAN TRỌNG: Reset về step 1 khi chuyển mode
    setMode: (state, action: PayloadAction<'create' | 'edit'>) => {
      const newMode = action.payload;
      
      // Nếu chuyển từ edit sang create, reset về step 1
      if (state.mode === 'edit' && newMode === 'create') {
        state.currentStep = 1;
        state.conferenceId = null;
        state.completedSteps = [];
        state.error = null;
      }
      
      state.mode = newMode;
    },

    // ✅ FIX: Chuyển sang step tiếp theo - Dùng maxStep động
    nextStep: (state) => {
      if (state.currentStep < state.maxStep) {
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.currentStep += 1;
      }
    },

    // Quay lại step trước
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },

    // ✅ FIX: Chuyển đến step cụ thể - Dùng maxStep động
    goToStep: (state, action: PayloadAction<number>) => {
      const targetStep = action.payload;
      // Chỉ cho phép nhảy step trong edit mode và trong phạm vi maxStep
      if (state.mode === 'edit' && targetStep >= 1 && targetStep <= state.maxStep) {
        state.currentStep = targetStep;
      }
    },

    // Đánh dấu step đã hoàn thành
    markStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
    },

    // Reset toàn bộ wizard về trạng thái ban đầu
    resetWizard: (state) => {
      Object.assign(state, initialState);
    },

    // Set loading
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    stopLoading: (state) => {
      state.loading = false;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setConferenceId,
  setMaxStep, 
  loadExistingConference,
  setMode,
  nextStep,
  prevStep,
  goToStep,
  markStepCompleted,
  resetWizard,
  startLoading,
  stopLoading,
  setError,
} = conferenceStepSlice.actions;

export default conferenceStepSlice.reducer;
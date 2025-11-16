// conferenceStepSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ConferenceBasicResponse } from "@/types/conference.type";

interface ConferenceStepState {
  currentStep: number;
  activeStep: number;
  conferenceId: string | null;
  conferenceBasicData: Partial<ConferenceBasicResponse> | null;
  completedSteps: number[];
  stepsWithData: number[]; // Steps có data (đã load hoặc đã lưu)
  dirtySteps: number[]; // Steps có thay đổi chưa lưu
  loading: boolean;
  error: string | null;
  mode: "create" | "edit";
  maxStep: number;
}

const initialState: ConferenceStepState = {
  currentStep: 1,
  activeStep: 1,
  conferenceId: null,
  conferenceBasicData: null,
  completedSteps: [],
  stepsWithData: [],
  dirtySteps: [],
  loading: false,
  error: null,
  mode: "create",
  maxStep: 6,
};

const conferenceStepSlice = createSlice({
  name: "conferenceStep",
  initialState,
  reducers: {
    setConferenceId: (state, action: PayloadAction<string>) => {
      state.conferenceId = action.payload;
    },

    setConferenceBasicData: (
      state,
      action: PayloadAction<Partial<ConferenceBasicResponse>>,
    ) => {
      state.conferenceBasicData = {
        ...state.conferenceBasicData,
        ...action.payload,
      } as ConferenceBasicResponse;
    },

    setMaxStep: (state, action: PayloadAction<number>) => {
      state.maxStep = action.payload;
    },

    // Đánh dấu step có data (sau khi load hoặc lưu thành công)
    markStepHasData: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.stepsWithData.includes(step)) {
        state.stepsWithData.push(step);
      }
    },

    // Đánh dấu step là dirty (có thay đổi chưa lưu)
    markStepDirty: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.dirtySteps.includes(step)) {
        state.dirtySteps.push(step);
      }
    },

    // Clear dirty status sau khi lưu thành công
    clearStepDirty: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      state.dirtySteps = state.dirtySteps.filter((s) => s !== step);
    },

    // Clear tất cả dirty steps
    clearAllDirtySteps: (state) => {
      state.dirtySteps = [];
    },

    loadExistingConference: (
      state,
      action: PayloadAction<{
        id: string;
        maxStep?: number;
        basicData?: Partial<ConferenceBasicResponse>;
        stepsWithData?: number[];
      }>,
    ) => {
      state.conferenceId = action.payload.id;
      state.mode = "edit";
      state.currentStep = 1;
      state.completedSteps = [];
      state.dirtySteps = [];

      if (action.payload.maxStep) {
        state.maxStep = action.payload.maxStep;
      }

      if (action.payload.basicData) {
        state.conferenceBasicData = action.payload.basicData;
      }

      // Load steps có data
      if (action.payload.stepsWithData) {
        state.stepsWithData = action.payload.stepsWithData;
      }
    },

    setMode: (state, action: PayloadAction<"create" | "edit">) => {
      const newMode = action.payload;

      if (state.mode === "edit" && newMode === "create") {
        state.currentStep = 1;
        state.conferenceId = null;
        state.conferenceBasicData = null;
        state.completedSteps = [];
        state.stepsWithData = [];
        state.dirtySteps = [];
        state.error = null;
      }

      state.mode = newMode;
    },

    nextStep: (state) => {
      if (state.currentStep < state.maxStep) {
        if (state.mode === "edit") {
          state.activeStep = state.currentStep;
          state.currentStep += 1;
          return;
        }

        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.activeStep = state.currentStep;
        state.currentStep += 1;
      }
    },

    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.activeStep = state.currentStep;
        state.currentStep -= 1;
      }
    },

    goToStep: (state, action: PayloadAction<number>) => {
      const targetStep = action.payload;

      if (targetStep < 1 || targetStep > state.maxStep) {
        return;
      }

      if (state.mode === "edit") {
        state.activeStep = state.currentStep;
        state.currentStep = targetStep;
        return;
      }

      if (targetStep <= state.currentStep || state.completedSteps.includes(targetStep)) {
        state.activeStep = state.currentStep;
        state.currentStep = targetStep;
      }
    },

    markStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
      // Khi complete, cũng đánh dấu là có data và clear dirty
      if (!state.stepsWithData.includes(step)) {
        state.stepsWithData.push(step);
      }
      state.dirtySteps = state.dirtySteps.filter((s) => s !== step);
    },

    unmarkStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      state.completedSteps = state.completedSteps.filter((s) => s !== step);
    },

    resetWizard: (state) => {
      Object.assign(state, initialState);
    },

    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    stopLoading: (state) => {
      state.loading = false;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setConferenceId,
  setConferenceBasicData,
  setMaxStep,
  markStepHasData,
  markStepDirty,
  clearStepDirty,
  clearAllDirtySteps,
  loadExistingConference,
  setMode,
  nextStep,
  prevStep,
  goToStep,
  markStepCompleted,
  unmarkStepCompleted,
  resetWizard,
  startLoading,
  stopLoading,
  setError,
} = conferenceStepSlice.actions;

export default conferenceStepSlice.reducer;
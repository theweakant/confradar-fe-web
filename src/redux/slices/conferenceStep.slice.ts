// conferenceStepSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ConferenceBasicResponse } from "@/types/conference.type";

interface ConferenceStepState {
  currentStep: number;
  activeStep: number;
  conferenceId: string | null;
  conferenceBasicData: Partial<ConferenceBasicResponse> | null;
  completedSteps: number[];
  stepsWithData: number[];
  dirtySteps: number[];
  loading: boolean;
  error: string | null;
  mode: "create" | "edit";
  maxStep: number;
  visibleSteps: number[]; 
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
  visibleSteps: [1, 2, 3, 4, 5, 6], 
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

    setVisibleSteps: (state, action: PayloadAction<number[]>) => {
      state.visibleSteps = action.payload;
    },

    markStepHasData: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.stepsWithData.includes(step)) {
        state.stepsWithData.push(step);
      }
      // 🔥 FIX: Khi mark has data, không tự động clear dirty
      // Để component tự quyết định khi nào clear dirty
    },

    markStepDirty: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.dirtySteps.includes(step)) {
        state.dirtySteps.push(step);
      }
    },

    clearStepDirty: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      state.dirtySteps = state.dirtySteps.filter((s) => s !== step);
    },

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
        visibleSteps?: number[]; 
      }>,
    ) => {
      state.conferenceId = action.payload.id;
      state.mode = "edit";
      state.currentStep = 1;
      state.completedSteps = [];
      state.dirtySteps = []; // 🔥 Reset dirty khi load

      if (action.payload.maxStep) {
        state.maxStep = action.payload.maxStep;
      }

      if (action.payload.basicData) {
        state.conferenceBasicData = action.payload.basicData;
      }

      if (action.payload.stepsWithData) {
        state.stepsWithData = action.payload.stepsWithData;
      }

      if (action.payload.visibleSteps) {
        state.visibleSteps = action.payload.visibleSteps;
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
        state.visibleSteps = [1, 2, 3, 4, 5, 6]; 
      }

      state.mode = newMode;
    },

    nextStep: (state) => {
      const currentIndex = state.visibleSteps.indexOf(state.currentStep);
      if (currentIndex >= 0 && currentIndex < state.visibleSteps.length - 1) {
        if (state.mode === "edit") {
          state.activeStep = state.currentStep;
          state.currentStep = state.visibleSteps[currentIndex + 1];
          return;
        }

        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.activeStep = state.currentStep;
        state.currentStep = state.visibleSteps[currentIndex + 1];
      }
    },

    prevStep: (state) => {
      const currentIndex = state.visibleSteps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.activeStep = state.currentStep;
        state.currentStep = state.visibleSteps[currentIndex - 1];
      }
    },

    goToStep: (state, action: PayloadAction<number>) => {
      const targetStep = action.payload;

      if (!state.visibleSteps.includes(targetStep)) {
        console.warn(`⚠️ Step ${targetStep} is not visible. Visible steps:`, state.visibleSteps);
        return;
      }

      if (state.mode === "edit") {
        state.activeStep = state.currentStep;
        state.currentStep = targetStep;
        return;
      }

      const currentIndex = state.visibleSteps.indexOf(state.currentStep);
      const targetIndex = state.visibleSteps.indexOf(targetStep);
      
      if (targetIndex <= currentIndex || state.completedSteps.includes(targetStep)) {
        state.activeStep = state.currentStep;
        state.currentStep = targetStep;
      }
    },

    markStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      
      // 🔥 FIX: Luôn clear dirty khi mark completed
      state.dirtySteps = state.dirtySteps.filter((s) => s !== step);
      
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
      
      if (!state.stepsWithData.includes(step)) {
        state.stepsWithData.push(step);
      }
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
  setVisibleSteps,
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
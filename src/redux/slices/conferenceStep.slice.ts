// // conferenceStepSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import type { ConferenceBasicResponse } from "@/types/conference.type";

// interface ConferenceStepState {
//   currentStep: number;
//   activeStep: number;
//   conferenceId: string | null;
//   conferenceBasicData: Partial<ConferenceBasicResponse> | null;
//   completedSteps: number[];
//   loading: boolean;
//   error: string | null;
//   mode: "create" | "edit";
//   maxStep: number;
// }

// const initialState: ConferenceStepState = {
//   currentStep: 1,
//   activeStep: 1,
//   conferenceId: null,
//   conferenceBasicData: null,
//   completedSteps: [],
//   loading: false,
//   error: null,
//   mode: "create",
//   maxStep: 6,
// };

// const conferenceStepSlice = createSlice({
//   name: "conferenceStep",
//   initialState,
//   reducers: {
//     setConferenceId: (state, action: PayloadAction<string>) => {
//       state.conferenceId = action.payload;
//     },

//     setConferenceBasicData: (
//       state,
//       action: PayloadAction<Partial<ConferenceBasicResponse>>,
//     ) => {
//       state.conferenceBasicData = {
//         ...state.conferenceBasicData,
//         ...action.payload,
//       } as ConferenceBasicResponse;
//     },

//     setMaxStep: (state, action: PayloadAction<number>) => {
//       state.maxStep = action.payload;
//     },

//     loadExistingConference: (
//       state,
//       action: PayloadAction<{
//         id: string;
//         maxStep?: number;
//         basicData?: Partial<ConferenceBasicResponse>;
//       }>,
//     ) => {
//       state.conferenceId = action.payload.id;
//       state.mode = "edit";
//       state.currentStep = 1;
//       state.completedSteps = [];

//       if (action.payload.maxStep) {
//         state.maxStep = action.payload.maxStep;
//       }

//       if (action.payload.basicData) {
//         state.conferenceBasicData = action.payload.basicData;
//       }
//     },

//     setMode: (state, action: PayloadAction<"create" | "edit">) => {
//       const newMode = action.payload;

//       if (state.mode === "edit" && newMode === "create") {
//         state.currentStep = 1;
//         state.conferenceId = null;
//         state.conferenceBasicData = null;
//         state.completedSteps = [];
//         state.error = null;
//       }

//       state.mode = newMode;
//     },

//     nextStep: (state) => {
//       if (state.currentStep < state.maxStep) {

//         if (state.mode === "edit") {
//           state.activeStep = state.currentStep;
//           state.currentStep += 1;
//           return;
//         }
//         if (!state.completedSteps.includes(state.currentStep)) {
//           state.completedSteps.push(state.currentStep);
//         }
//         state.activeStep = state.currentStep;
//         state.currentStep += 1;
//       }
//     },

//     // Quay lại step trước
//     prevStep: (state) => {
//       if (state.currentStep > 1) {
//         state.activeStep = state.currentStep;
//         state.currentStep -= 1;
//       }
//     },

//     goToStep: (state, action: PayloadAction<number>) => {
//       const targetStep = action.payload;
      
//       // Validate range
//       if (targetStep < 1 || targetStep > state.maxStep) {
//         return;
//       }

//       // Edit mode: cho phép jump đến bất kỳ step nào
//       if (state.mode === "edit") {
//         state.activeStep = state.currentStep;
//         state.currentStep = targetStep;
//         return;
//       }

//       // Create mode: chỉ cho phép jump đến step đã completed hoặc step kế tiếp
//       if (targetStep <= state.currentStep || state.completedSteps.includes(targetStep)) {
//         state.activeStep = state.currentStep;
//         state.currentStep = targetStep;
//       }
//     },

//     // Đánh dấu step đã hoàn thành
//     markStepCompleted: (state, action: PayloadAction<number>) => {
//       const step = action.payload;
//       if (!state.completedSteps.includes(step)) {
//         state.completedSteps.push(step);
//       }
//     },

//     unmarkStepCompleted: (state, action: PayloadAction<number>) => {
//       const step = action.payload;
//       state.completedSteps = state.completedSteps.filter((s) => s !== step);
//     },

//     // Reset toàn bộ wizard về trạng thái ban đầu
//     resetWizard: (state) => {
//       Object.assign(state, initialState);
//     },

//     // Set loading
//     startLoading: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     stopLoading: (state) => {
//       state.loading = false;
//     },

//     // Set error
//     setError: (state, action: PayloadAction<string | null>) => {
//       state.error = action.payload;
//       state.loading = false;
//     },
//   },
// });

// export const {
//   setConferenceId,
//   setConferenceBasicData,
//   setMaxStep,
//   loadExistingConference,
//   setMode,
//   nextStep,
//   prevStep,
//   goToStep,
//   markStepCompleted,
//   unmarkStepCompleted,
//   resetWizard,
//   startLoading,
//   stopLoading,
//   setError,
// } = conferenceStepSlice.actions;

// export default conferenceStepSlice.reducer;


// conferenceStepSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ConferenceBasicResponse } from "@/types/conference.type";

interface ConferenceStepState {
  currentStep: number;
  activeStep: number;
  conferenceId: string | null;
  conferenceBasicData: Partial<ConferenceBasicResponse> | null;
  completedSteps: number[];
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

    loadExistingConference: (
      state,
      action: PayloadAction<{
        id: string;
        maxStep?: number;
        basicData?: Partial<ConferenceBasicResponse>;
      }>,
    ) => {
      state.conferenceId = action.payload.id;
      state.mode = "edit";
      state.currentStep = 1;
      state.completedSteps = [];

      if (action.payload.maxStep) {
        state.maxStep = action.payload.maxStep;
      }

      if (action.payload.basicData) {
        state.conferenceBasicData = action.payload.basicData;
      }
    },

    setMode: (state, action: PayloadAction<"create" | "edit">) => {
      const newMode = action.payload;

      if (state.mode === "edit" && newMode === "create") {
        state.currentStep = 1;
        state.conferenceId = null;
        state.conferenceBasicData = null;
        state.completedSteps = [];
        state.error = null;
      }

      state.mode = newMode;
    },

    // ✅ FIXED: Không unmark step khi next
    nextStep: (state) => {
      if (state.currentStep < state.maxStep) {
        if (state.mode === "edit") {
          state.activeStep = state.currentStep;
          state.currentStep += 1;
          return;
        }
        
        // CREATE mode: Chỉ mark completed step hiện tại nếu chưa mark
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.activeStep = state.currentStep;
        state.currentStep += 1;
      }
    },

    // ✅ FIXED: Không unmark step khi quay lại
    prevStep: (state) => {
      console.log('🔍 prevStep called:', { 
        before: { currentStep: state.currentStep, completedSteps: [...state.completedSteps] },
      });
      
      if (state.currentStep > 1) {
        state.activeStep = state.currentStep;
        state.currentStep -= 1;
        // ❌ KHÔNG unmark step: state.completedSteps = state.completedSteps.filter(...)
      }
      
      console.log('🔍 prevStep result:', { 
        after: { currentStep: state.currentStep, completedSteps: [...state.completedSteps] },
      });
    },

    goToStep: (state, action: PayloadAction<number>) => {
      const targetStep = action.payload;
      
      // Validate range
      if (targetStep < 1 || targetStep > state.maxStep) {
        return;
      }

      // Edit mode: cho phép jump đến bất kỳ step nào
      if (state.mode === "edit") {
        state.activeStep = state.currentStep;
        state.currentStep = targetStep;
        return;
      }

      // Create mode: chỉ cho phép jump đến step đã completed hoặc step kế tiếp
      if (targetStep <= state.currentStep || state.completedSteps.includes(targetStep)) {
        state.activeStep = state.currentStep;
        state.currentStep = targetStep;
      }
    },

    // Đánh dấu step đã hoàn thành
    markStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      console.log('🔍 markStepCompleted called:', {
        step,
        before: [...state.completedSteps],
      });
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
      console.log('🔍 markStepCompleted result:', {
        after: [...state.completedSteps],
      });
    },

    unmarkStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      console.log('🔍 unmarkStepCompleted called:', {
        step,
        before: [...state.completedSteps],
      });
      state.completedSteps = state.completedSteps.filter((s) => s !== step);
      console.log('🔍 unmarkStepCompleted result:', {
        after: [...state.completedSteps],
      });
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
  setConferenceBasicData,
  setMaxStep,
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
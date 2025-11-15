// // src/hooks/useStepNavigation.ts
// import { useCallback } from "react";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
// import {
//   nextStep,
//   prevStep,
//   goToStep,
//   markStepCompleted,
//   unmarkStepCompleted,
//   resetWizard,
//   setMode,
// } from "@/redux/slices/conferenceStep.slice";

// export function useStepNavigation() {
//   const dispatch = useAppDispatch();
//   const currentStep = useAppSelector((state) => state.conferenceStep.currentStep);
//   const activeStep = useAppSelector((state) => state.conferenceStep.activeStep);
//   const completedSteps = useAppSelector(
//     (state) => state.conferenceStep.completedSteps
//   );
//   const mode = useAppSelector((state) => state.conferenceStep.mode);

// const handleNext = useCallback(() => {
//   if (mode === "edit") {
//     dispatch(nextStep());
//     return;
//   }
  
//   if (completedSteps.includes(currentStep)) {
//     dispatch(nextStep());
//   } else {
//     console.warn("Cannot navigate forward: Current step not completed");
//   }
// }, [dispatch, mode, currentStep, completedSteps]);

//   const handlePrevious = useCallback(() => {
//     if (mode === "edit") {
//       dispatch(prevStep());
//       return;
//     }
    
//     if (currentStep > 1) {
//       dispatch(prevStep());
//     }
//   }, [dispatch, mode, currentStep]);

//   const handleGoToStep = useCallback((step: number) => {
//     if (mode === "edit") {
//       dispatch(goToStep(step));
//       return;
//     }
//     // Trong chế độ "create", chỉ cho phép nhảy đến step đã hoàn thành hoặc step tiếp theo
//     if (step <= currentStep || completedSteps.includes(step)) {
//       dispatch(goToStep(step));
//     } else {
//       console.warn(`Cannot navigate to step ${step}: Step not accessible`);
//     }
//   }, [dispatch, mode, currentStep, completedSteps]);

//   const handleMarkCompleted = useCallback((step: number) => {
//     dispatch(markStepCompleted(step));
//   }, [dispatch]);

//   const handleUnmarkCompleted = useCallback((step: number) => {
//     dispatch(unmarkStepCompleted(step));
//   }, [dispatch]);

//   const handleReset = useCallback(() => {
//     dispatch(resetWizard());
//   }, [dispatch]);

//   const handleSetMode = useCallback((newMode: "create" | "edit") => {
//     dispatch(setMode(newMode));
//   }, [dispatch]);

//   const isStepCompleted = useCallback((step: number) => {
//     return completedSteps.includes(step);
//   }, [completedSteps]);

//   const isStepAccessible = useCallback((step: number) => {
//     // ✅ Trong edit mode, mọi step đều accessible
//     if (mode === "edit") return true;
//     return completedSteps.includes(step) || step <= currentStep;
//   }, [mode, completedSteps, currentStep]);

//   const canNavigateToStep = useCallback((step: number) => {
//     // ✅ Trong edit mode, có thể điều hướng đến bất kỳ step nào
//     if (mode === "edit") return true;
//     return step <= currentStep || completedSteps.includes(step);
//   }, [mode, currentStep, completedSteps]);

//   return {
//     currentStep,
//     activeStep,
//     completedSteps,
//     mode,
//     handleNext,
//     handlePrevious,
//     handleGoToStep,
//     handleMarkCompleted,
//     handleUnmarkCompleted,
//     handleReset,
//     handleSetMode,
//     isStepCompleted,
//     isStepAccessible,
//     canNavigateToStep,
//   };
// }

// src/hooks/useStepNavigation.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  nextStep,
  prevStep,
  goToStep,
  markStepCompleted,
  unmarkStepCompleted,
  resetWizard,
  setMode,
} from "@/redux/slices/conferenceStep.slice";

export function useStepNavigation() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.conferenceStep.currentStep);
  const activeStep = useAppSelector((state) => state.conferenceStep.activeStep);
  const completedSteps = useAppSelector(
    (state) => state.conferenceStep.completedSteps
  );
  const mode = useAppSelector((state) => state.conferenceStep.mode);

  // ✅ FIXED: Luôn cho phép next trong CREATE mode nếu step đã completed
  const handleNext = useCallback(() => {
    // EDIT mode: Luôn cho phép navigation tự do
    if (mode === "edit") {
      dispatch(nextStep());
      return;
    }
    
    // CREATE mode: Cho phép next nếu step hiện tại đã completed HOẶC là step kế tiếp hợp lệ
    if (completedSteps.includes(currentStep)) {
      dispatch(nextStep());
    } else {
      console.warn("Cannot navigate forward: Current step not completed");
    }
  }, [dispatch, mode, currentStep, completedSteps]);

  // ✅ FIXED: Luôn cho phép previous (không unmark step)
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      dispatch(prevStep());
    }
  }, [dispatch, currentStep]);

  const handleGoToStep = useCallback((step: number) => {
    if (mode === "edit") {
      dispatch(goToStep(step));
      return;
    }
    // Trong chế độ "create", chỉ cho phép nhảy đến step đã hoàn thành hoặc step tiếp theo
    if (step <= currentStep || completedSteps.includes(step)) {
      dispatch(goToStep(step));
    } else {
      console.warn(`Cannot navigate to step ${step}: Step not accessible`);
    }
  }, [dispatch, mode, currentStep, completedSteps]);

  const handleMarkCompleted = useCallback((step: number) => {
    dispatch(markStepCompleted(step));
  }, [dispatch]);

  const handleUnmarkCompleted = useCallback((step: number) => {
    dispatch(unmarkStepCompleted(step));
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetWizard());
  }, [dispatch]);

  const handleSetMode = useCallback((newMode: "create" | "edit") => {
    dispatch(setMode(newMode));
  }, [dispatch]);

  const isStepCompleted = useCallback((step: number) => {
    const result = completedSteps.includes(step);
    console.log('🔍 isStepCompleted check:', { 
      step, 
      completedSteps: [...completedSteps], 
      result 
    });
    return result;
  }, [completedSteps]);

  const isStepAccessible = useCallback((step: number) => {
    // ✅ Trong edit mode, mọi step đều accessible
    if (mode === "edit") return true;
    return completedSteps.includes(step) || step <= currentStep;
  }, [mode, completedSteps, currentStep]);

  const canNavigateToStep = useCallback((step: number) => {
    // ✅ Trong edit mode, có thể điều hướng đến bất kỳ step nào
    if (mode === "edit") return true;
    return step <= currentStep || completedSteps.includes(step);
  }, [mode, currentStep, completedSteps]);

  return {
    currentStep,
    activeStep,
    completedSteps,
    mode,
    handleNext,
    handlePrevious,
    handleGoToStep,
    handleMarkCompleted,
    handleUnmarkCompleted,
    handleReset,
    handleSetMode,
    isStepCompleted,
    isStepAccessible,
    canNavigateToStep,
  };
}
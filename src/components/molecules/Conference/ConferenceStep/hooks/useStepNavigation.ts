// src/hooks/useStepNavigation.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  nextStep,
  prevStep,
  goToStep,
  markStepCompleted,
  unmarkStepCompleted,
  markStepHasData,
  markStepDirty,
  clearStepDirty,
  clearAllDirtySteps,
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
  const stepsWithData = useAppSelector(
    (state) => state.conferenceStep.stepsWithData
  );
  const dirtySteps = useAppSelector(
    (state) => state.conferenceStep.dirtySteps
  );
  const mode = useAppSelector((state) => state.conferenceStep.mode);

  const handleNext = useCallback(() => {
    // EDIT mode: Luôn cho phép navigation tự do
    if (mode === "edit") {
      dispatch(nextStep());
      return;
    }

    // CREATE mode: Cho phép next nếu step hiện tại đã completed HOẶC là step kế tiếp hợp lệ
    if (completedSteps.includes(currentStep)) {
      dispatch(nextStep());
    }
  }, [dispatch, mode, currentStep, completedSteps]);

  // ✅ FIXED: Luôn cho phép previous (không unmark step)
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      dispatch(prevStep());
    }
  }, [dispatch, currentStep]);

  const handleGoToStep = useCallback(
    (step: number) => {
      if (mode === "edit") {
        dispatch(goToStep(step));
        return;
      }
      // Trong chế độ "create", chỉ cho phép nhảy đến step đã hoàn thành hoặc step tiếp theo
      if (step <= currentStep || completedSteps.includes(step)) {
        dispatch(goToStep(step));
      }
    },
    [dispatch, mode, currentStep, completedSteps]
  );

  const handleMarkCompleted = useCallback(
    (step: number) => {
      dispatch(markStepCompleted(step));
    },
    [dispatch]
  );

  const handleUnmarkCompleted = useCallback(
    (step: number) => {
      dispatch(unmarkStepCompleted(step));
    },
    [dispatch]
  );

  // ✅ NEW: Mark step has data
  const handleMarkHasData = useCallback(
    (step: number) => {
      dispatch(markStepHasData(step));
    },
    [dispatch]
  );

  // ✅ NEW: Mark step as dirty (có thay đổi chưa lưu)
  const handleMarkDirty = useCallback(
    (step: number) => {
      dispatch(markStepDirty(step));
    },
    [dispatch]
  );

  // ✅ NEW: Clear dirty flag for a step
  const handleClearDirty = useCallback(
    (step: number) => {
      dispatch(clearStepDirty(step));
    },
    [dispatch]
  );

  // ✅ NEW: Clear all dirty flags
  const handleClearAllDirty = useCallback(() => {
    dispatch(clearAllDirtySteps());
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetWizard());
  }, [dispatch]);

  const handleSetMode = useCallback(
    (newMode: "create" | "edit") => {
      dispatch(setMode(newMode));
    },
    [dispatch]
  );

  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.includes(step);
    },
    [completedSteps]
  );

  const isStepAccessible = useCallback(
    (step: number) => {
      // ✅ Trong edit mode, mọi step đều accessible
      if (mode === "edit") return true;
      return completedSteps.includes(step) || step <= currentStep;
    },
    [mode, completedSteps, currentStep]
  );

  const canNavigateToStep = useCallback(
    (step: number) => {
      // ✅ Trong edit mode, có thể điều hướng đến bất kỳ step nào
      if (mode === "edit") return true;
      return step <= currentStep || completedSteps.includes(step);
    },
    [mode, currentStep, completedSteps]
  );

  // ✅ NEW: Check if step has data
  const hasStepData = useCallback(
    (step: number) => {
      return stepsWithData.includes(step);
    },
    [stepsWithData]
  );

  // ✅ NEW: Check if step is dirty
  const isStepDirty = useCallback(
    (step: number) => {
      return dirtySteps.includes(step);
    },
    [dirtySteps]
  );

  // ✅ NEW: Check if there are any dirty steps
  const hasDirtySteps = useCallback(() => {
    return dirtySteps.length > 0;
  }, [dirtySteps]);

  return {
    // State
    currentStep,
    activeStep,
    completedSteps,
    stepsWithData,
    dirtySteps,
    mode,
    
    // Navigation
    handleNext,
    handlePrevious,
    handleGoToStep,
    
    // Step Management
    handleMarkCompleted,
    handleUnmarkCompleted,
    handleMarkHasData,
    handleMarkDirty,
    handleClearDirty,
    handleClearAllDirty,
    
    // Wizard Control
    handleReset,
    handleSetMode,
    
    // Checkers
    isStepCompleted,
    isStepAccessible,
    canNavigateToStep,
    hasStepData,
    isStepDirty,
    hasDirtySteps,
  };
}
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  nextStep,
  prevStep,
  goToStep,
  markStepCompleted,
  resetWizard,
  setMode,
} from "@/redux/slices/conferenceStep.slice";

export function useStepNavigation() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.conferenceStep.currentStep);
  const completedSteps = useAppSelector(
    (state) => state.conferenceStep.completedSteps
  );
  const mode = useAppSelector((state) => state.conferenceStep.mode);

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handlePrevious = () => {
    dispatch(prevStep());
  };

  const handleGoToStep = (step: number) => {
    dispatch(goToStep(step));
  };

  const handleMarkCompleted = (step: number) => {
    dispatch(markStepCompleted(step));
  };

  const handleReset = () => {
    dispatch(resetWizard());
  };

  const handleSetMode = (newMode: "create" | "edit") => {
    dispatch(setMode(newMode));
  };

  const isStepCompleted = (step: number) => {
    return completedSteps.includes(step);
  };

  const isStepAccessible = (step: number) => {
    return isStepCompleted(step) || step <= currentStep;
  };

  const canNavigateToStep = (step: number) => {
    // Can navigate to any completed step or the current step
    return step <= currentStep || completedSteps.includes(step);
  };

  return {
    currentStep,
    completedSteps,
    mode,
    handleNext,
    handlePrevious,
    handleGoToStep,
    handleMarkCompleted,
    handleReset,
    handleSetMode,
    isStepCompleted,
    isStepAccessible,
    canNavigateToStep,
  };
}
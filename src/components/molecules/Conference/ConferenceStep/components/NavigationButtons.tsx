// src/app/(workspace)/.../create/components/CreateNavigationButtons.tsx
import { Button } from "@/components/ui/button";

interface CreateNavigationButtonsProps {
  currentStep: number;
  isStepCompleted: boolean;
  isSubmitting: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  showSkip?: boolean;
  submitButtonText?: string;
  nextButtonText?: string;
  onPrevious: () => void;
  onNext?: () => void;
  onSubmit?: () => void; 
  canSkip?: boolean;
}

export function CreateNavigationButtons({
  currentStep,
  isStepCompleted,
  isSubmitting,
  showPrevious = true,
  showNext = true,
  showSkip = false,
  submitButtonText,
  nextButtonText = "Tiếp tục →",
  onPrevious,
  onNext,
  onSubmit,
  canSkip = false,
}: CreateNavigationButtonsProps) {
  const getSubmitButtonText = () => {
    if (submitButtonText) return submitButtonText;
    if (isSubmitting) return "Đang lưu...";
    if (isStepCompleted) return "Đã lưu";
    if (canSkip) return "Bỏ qua";
    return "Lưu thông tin";
  };

  return (
    <div className="flex gap-3 mt-6">
      {showPrevious && currentStep > 1 && (
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          ← Quay lại
        </Button>
      )}

      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || isStepCompleted}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          {getSubmitButtonText()}
        </Button>
      )}

      {showNext && isStepCompleted && onNext && currentStep < 6 && (
        <Button
          onClick={onNext}
          className="flex-1 bg-green-600 text-white hover:bg-green-700"
          disabled={isSubmitting}
        >
          {nextButtonText}
        </Button>
      )}
    </div>
  );
}
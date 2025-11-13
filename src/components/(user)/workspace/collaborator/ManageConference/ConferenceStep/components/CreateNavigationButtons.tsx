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

  const isLastStep = currentStep === 6;

  return (
    <div className="flex gap-3 mt-6">
      {/* Nút Quay lại */}
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

      {/* Nút Lưu (Submit) */}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || isStepCompleted}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          {getSubmitButtonText()}
        </Button>
      )}

      {/* Nút Tiếp theo — chỉ hiện nếu step đã hoàn thành */}
      {showNext && isStepCompleted && onNext && !isLastStep && (
        <Button
          onClick={onNext}
          className="flex-1 bg-green-600 text-white hover:bg-green-700"
          disabled={isSubmitting}
        >
          {nextButtonText}
        </Button>
      )}

      {/* Nút Hoàn tất — ở step cuối */}
      {isLastStep && isStepCompleted && (
        <div className="flex-1 text-center text-green-600 font-medium py-2.5">
          Đã hoàn thành
        </div>
      )}
    </div>
  );
}
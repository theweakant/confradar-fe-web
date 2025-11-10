import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  isStepCompleted: boolean;
  isSubmitting: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  showSkip?: boolean;
  submitButtonText?: string;
  nextButtonText?: string;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canSkip?: boolean;
}

export function NavigationButtons({
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
}: NavigationButtonsProps) {
  const getSubmitButtonText = () => {
    if (submitButtonText) return submitButtonText;
    if (isSubmitting) return "Đang lưu...";
    if (isStepCompleted) return "Đã lưu";
    if (canSkip) return "Bỏ qua";
    return "Lưu và tiếp tục";
  };

  const getSubmitButtonClass = () => {
    if (isStepCompleted) return "bg-gray-400 text-white";
    if (currentStep === 6) return "bg-green-600 text-white hover:bg-green-700";
    return "bg-blue-600 text-white hover:bg-blue-700";
  };

  return (
    <div className="flex gap-3 mt-6">
      {/* Previous Button */}
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

      {/* Submit/Save Button */}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || isStepCompleted}
        className={`flex-1 ${getSubmitButtonClass()}`}
      >
        {getSubmitButtonText()}
      </Button>

      {/* Next Button (appears after step is completed) */}
      {showNext && isStepCompleted && currentStep < 6 && (
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
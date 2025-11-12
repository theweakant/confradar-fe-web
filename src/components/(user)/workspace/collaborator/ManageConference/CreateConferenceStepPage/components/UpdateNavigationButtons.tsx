// src/app/(workspace)/.../create/components/UpdateNavigationButtons.tsx
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks/hooks";

interface UpdateNavigationButtonsProps {
  currentStep: number;
  isSubmitting: boolean;
  showPrevious?: boolean;
  showSkip?: boolean;
  canSkip?: boolean;
  onPrevious: () => void;
  onSubmit: () => Promise<{ success: boolean }>;
}

export function UpdateNavigationButtons({
  currentStep,
  isSubmitting,
  showPrevious = true,
  showSkip = false,
  canSkip = false,
  onPrevious,
  onSubmit,
}: UpdateNavigationButtonsProps) {
  const maxStep = useAppSelector((state) => state.conferenceStep.maxStep);
  const isLastStep = currentStep === maxStep;

  const mainButtonText = isSubmitting
    ? "Đang lưu..."
    : showSkip && canSkip
      ? "Bỏ qua"
      : isLastStep
        ? "Cập nhật hội thảo"
        : "Lưu & Tiếp tục";

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

      {/* Nút "Lưu & Tiếp" (hoặc "Hoàn tất") */}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
      >
        {mainButtonText}
      </Button>
    </div>
  );
}
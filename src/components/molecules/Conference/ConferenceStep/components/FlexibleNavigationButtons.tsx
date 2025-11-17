"use client";

import { Button } from "@/components/ui/button";

interface FlexibleNavigationButtonsProps {
  currentStep: number;
  maxStep: number;
  isSubmitting: boolean;
  mode: "create" | "edit"; 
  isLastStep?: boolean;
  isOptionalStep?: boolean;
  isSkippable?: boolean;
  isStepCompleted?: (step: number) => boolean;

  // Điều hướng
  onPrevious?: () => void;
  onNext?: () => void;

  // Submit & Next (dùng cho CREATE mode - step chưa completed)
  onSubmit?: () => Promise<void>;

  // Update step hiện tại (dùng cho step đã completed - cả CREATE và EDIT)
  onUpdate?: () => Promise<{ success: boolean }>;

  // Lưu toàn bộ các step (chỉ dùng ở bước cuối trong EDIT)
  onUpdateAll?: () => Promise<{ success: boolean; errors?: string[] }>;
}

export function FlexibleNavigationButtons({
  currentStep,
  maxStep,
  isSubmitting,
  mode,
  isLastStep = false,
  isOptionalStep = false,
  isSkippable = false,
  isStepCompleted,
  onPrevious,
  onNext,
  onSubmit,
  onUpdate,
  onUpdateAll,
}: FlexibleNavigationButtonsProps) {
  // ✅ Check if current step is already completed
  const currentStepCompleted = isStepCompleted?.(currentStep) ?? false;

  const showPrevious = currentStep > 1 && onPrevious;
  const showNext = currentStep < maxStep && onNext;

  // 🔍 DEBUG LOG
  console.log('FlexibleNavigationButtons Debug:', {
    currentStep,
    maxStep,
    mode,
    currentStepCompleted,
    showPrevious,
    showNext,
    hasOnNext: !!onNext,
    hasOnUpdate: !!onUpdate,
    isLastStep,
  });

  // ========================================
  // CREATE MODE
  // ========================================
  if (mode === "create") {
    return (
      <div className="flex flex-wrap gap-3 mt-6">
        {/* Nút Quay lại */}
        {showPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="flex-1 min-w-[120px]"
            disabled={isSubmitting}
          >
            ← Quay lại
          </Button>
        )}

        {/* ✅ Nếu step đã completed: Show "Cập nhật" + "Tiếp theo" */}
        {currentStepCompleted ? (
          <>
            {/* Nút Tiếp theo (nếu không phải step cuối) */}
            {showNext && (
              <Button
                onClick={onNext}
                variant="outline"
                className="flex-1 min-w-[120px]"
                disabled={isSubmitting}
              >
                Tiếp theo →
              </Button>
            )}

            {/* Nút Cập nhật step hiện tại */}
            {onUpdate && (
              <Button
                onClick={onUpdate}
                disabled={isSubmitting}
                className="flex-1 min-w-[180px] bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật bước này"}
              </Button>
            )}
          </>
        ) : (
          <>
            {/* ✅ Nếu step chưa completed: Show "Lưu & Tiếp tục" hoặc "Hoàn tất" */}
            {!isLastStep && onSubmit && (
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 min-w-[180px] bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu & Tiếp tục →"}
              </Button>
            )}

            {/* Nút Hoàn tất (bước cuối) */}
            {isLastStep && onSubmit && (
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 min-w-[180px] bg-green-600 text-white hover:bg-green-700"
              >
                {isSubmitting
                  ? "Đang hoàn tất..."
                  : isOptionalStep && isSkippable
                  ? "Hoàn tất (Bỏ qua)"
                  : "Hoàn tất"}
              </Button>
            )}

            {/* Nút Bỏ qua (các bước optional chưa completed) */}
            {isOptionalStep && isSkippable && onNext && !isLastStep && (
              <Button
                onClick={onNext}
                variant="ghost"
                className="flex-1 min-w-[120px] text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                Bỏ qua
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  // ========================================
  // EDIT MODE: Previous, Next, Update riêng biệt
  // ========================================
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {/* Nút Quay lại */}
      {showPrevious && (
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 min-w-[120px]"
          disabled={isSubmitting}
        >
          ← Quay lại
        </Button>
      )}

      {/* Nút Tiếp theo (chỉ hiện khi không phải bước cuối) */}
      {showNext && (
        <Button
          onClick={onNext}
          variant="outline"
          className="flex-1 min-w-[120px]"
          disabled={isSubmitting}
        >
          Tiếp theo →
        </Button>
      )}

      {/* Nút Cập nhật step hiện tại */}
      {onUpdate && (
        <Button
          onClick={onUpdate}
          disabled={isSubmitting}
          className="flex-1 min-w-[120px] bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật bước này"}
        </Button>
      )}

      {/* Nút Cập nhật tổng (chỉ ở bước cuối) */}
      {isLastStep && onUpdateAll && (
        <Button
          onClick={onUpdateAll}
          disabled={isSubmitting}
          className="flex-1 min-w-[180px] bg-green-600 text-white hover:bg-green-700"
        >
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật toàn bộ"}
        </Button>
      )}

      {/* Nút Bỏ qua (các bước optional) */}
      {isOptionalStep && isSkippable && onNext && (
        <Button
          onClick={onNext}
          variant="ghost"
          className="flex-1 min-w-[120px] text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          Bỏ qua
        </Button>
      )}
    </div>
  );
}
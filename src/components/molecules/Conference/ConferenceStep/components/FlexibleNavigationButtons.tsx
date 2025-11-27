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
  const currentStepCompleted = isStepCompleted?.(currentStep) ?? false;

  const showPrevious = currentStep > 1 && onPrevious;
  const showNext = currentStep < maxStep && onNext;

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

      {/* ✅ Luôn hiển thị nút "Tiếp theo" nếu không phải step cuối */}
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

      {/* Nút Lưu & Tiếp tục (hoặc Hoàn tất ở step cuối) */}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex-1 min-w-[180px] ${
            isLastStep 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {isSubmitting
            ? "Đang xử lý..."
            : isLastStep
            ? "Hoàn tất"
            : currentStepCompleted
            ? "Lưu thay đổi & Tiếp tục →"
            : "Lưu & Tiếp tục →"}
        </Button>
      )}

      {/* Nút Bỏ qua (các bước optional chưa có dữ liệu) */}
      {isOptionalStep && isSkippable && onNext && !isLastStep && !currentStepCompleted && (
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
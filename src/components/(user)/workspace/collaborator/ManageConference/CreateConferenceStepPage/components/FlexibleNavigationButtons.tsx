// src/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/components/FlexibleNavigationButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks/hooks";

interface FlexibleNavigationButtonsProps {
  currentStep: number;
  maxStep: number;
  isSubmitting: boolean;
  isLastStep?: boolean;
  isOptionalStep?: boolean;
  isSkippable?: boolean;

  // Điều hướng thuần túy (không liên quan đến submit)
  onPrevious?: () => void;
  onNext?: () => void;

  // Lưu step hiện tại (submit mà không next)
  onUpdate: () => Promise<{ success: boolean }>;

  // Lưu toàn bộ các step (chỉ dùng ở bước cuối)
  onUpdateAll?: () => Promise<{ success: boolean; errors?: string[] }>;
}

export function FlexibleNavigationButtons({
  currentStep,
  maxStep,
  isSubmitting,
  isLastStep = false,
  isOptionalStep = false,
  isSkippable = false,
  onPrevious,
  onNext,
  onUpdate,
  onUpdateAll,
}: FlexibleNavigationButtonsProps) {
  const showPrevious = currentStep > 1 && onPrevious;
  const showNext = currentStep < maxStep && onNext;

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

      {/* Nút Tiếp theo (chỉ điều hướng, KHÔNG submit) */}
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

      {/* Nút Cập nhật (submit step hiện tại, không next) */}
      <Button
        onClick={onUpdate}
        disabled={isSubmitting}
        className="flex-1 min-w-[120px] bg-blue-600 text-white hover:bg-blue-700"
      >
        {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
      </Button>

      {/* Nút Cập nhật toàn bộ (chỉ hiển thị ở bước cuối) */}
      {isLastStep && onUpdateAll && (
        <Button
          onClick={onUpdateAll}
          disabled={isSubmitting}
          className="flex-1 min-w-[180px] bg-green-600 text-white hover:bg-green-700"
        >
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật tổng"}
        </Button>
      )}

      {/* Nút Bỏ qua (chỉ cho bước tùy chọn và có thể skip) */}
      {isOptionalStep && isSkippable && (
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
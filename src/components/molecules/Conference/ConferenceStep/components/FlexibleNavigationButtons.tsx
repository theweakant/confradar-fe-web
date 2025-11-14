// // src/components/(user)/workspace/collaborator/ManageConference/CreateConferenceStepPage/components/FlexibleNavigationButtons.tsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { useAppSelector } from "@/redux/hooks/hooks";

// interface FlexibleNavigationButtonsProps {
//   currentStep: number;
//   maxStep: number;
//   isSubmitting: boolean;
//   isLastStep?: boolean;
//   isOptionalStep?: boolean;
//   isSkippable?: boolean;

//   // Điều hướng (không liên quan đến submit)
//   onPrevious?: () => void;
//   onNext?: () => void;

//   // Lưu step hiện tại (submit mà không next)
//   onUpdate?: () => Promise<{ success: boolean }>;

//   // Lưu toàn bộ các step (chỉ dùng ở bước cuối)
//   onUpdateAll?: () => Promise<{ success: boolean; errors?: string[] }>;
// }

// export function FlexibleNavigationButtons({
//   currentStep,
//   maxStep,
//   isSubmitting,
//   isLastStep = false,
//   isOptionalStep = false,
//   isSkippable = false,
//   onPrevious,
//   onNext,
//   onUpdate,
//   onUpdateAll,
// }: FlexibleNavigationButtonsProps) {
//   const showPrevious = currentStep > 1 && onPrevious;
//   const showNext = currentStep < maxStep && onNext;

//   return (
//     <div className="flex flex-wrap gap-3 mt-6">
//       {/* Nút Quay lại */}
//       {showPrevious && (
//         <Button
//           onClick={onPrevious}
//           variant="outline"
//           className="flex-1 min-w-[120px]"
//           disabled={isSubmitting}
//         >
//           ← Quay lại
//         </Button>
//       )}

//       {/* Nút Tiếp theo */}
//       {showNext && (
//         <Button
//           onClick={onNext}
//           variant="outline"
//           className="flex-1 min-w-[120px]"
//           disabled={isSubmitting}
//         >
//           Tiếp theo →
//         </Button>
//       )}

//       {/* Nút Cập nhật — CHỈ HIỂN THỊ KHI onUpdate TỒN TẠI */}
//       {onUpdate && (
//         <Button
//           onClick={onUpdate}
//           disabled={isSubmitting}
//           className="flex-1 min-w-[120px] bg-blue-600 text-white hover:bg-blue-700"
//         >
//           {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
//         </Button>
//       )}

//       {/* Nút Cập nhật tổng — chỉ ở bước cuối và khi có onUpdateAll */}
//       {isLastStep && onUpdateAll && (
//         <Button
//           onClick={onUpdateAll}
//           disabled={isSubmitting}
//           className="flex-1 min-w-[180px] bg-green-600 text-white hover:bg-green-700"
//         >
//           {isSubmitting ? "Đang cập nhật..." : "Cập nhật tổng"}
//         </Button>
//       )}

//       {/* Nút Bỏ qua */}
//       {isOptionalStep && isSkippable && onNext && (
//         <Button
//           onClick={onNext}
//           variant="ghost"
//           className="flex-1 min-w-[120px] text-gray-500 hover:text-gray-700"
//           disabled={isSubmitting}
//         >
//           Bỏ qua
//         </Button>
//       )}
//     </div>
//   );
// }

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

  // Điều hướng
  onPrevious?: () => void;
  onNext?: () => void;

  // Submit & Next (dùng cho CREATE mode)
  onSubmit?: () => Promise<void>;

  // Lưu step hiện tại (dùng cho UPDATE mode - submit mà không next)
  onUpdate?: () => Promise<{ success: boolean }>;

  // Lưu toàn bộ các step (chỉ dùng ở bước cuối trong UPDATE)
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
  onPrevious,
  onNext,
  onSubmit,
  onUpdate,
  onUpdateAll,
}: FlexibleNavigationButtonsProps) {
  const showPrevious = currentStep > 1 && onPrevious;
  const showNext = currentStep < maxStep && onNext && mode === "edit";

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

        {/* Nút Submit & Next (bước 1-8) */}
        {!isLastStep && onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 min-w-[180px] bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSubmitting ? "Đang xử lý..." : "Lưu & Tiếp tục →"}
          </Button>
        )}

        {/* Nút Hoàn tất (bước 9) */}
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

        {/* Nút Bỏ qua (các bước optional) */}
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
      </div>
    );
  }

  // ============================================
  // UPDATE MODE: Previous, Next, Update riêng biệt
  // ============================================
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
"use client";
import React from "react";
import { CheckCircle2, CircleDot, Circle, XCircle } from "lucide-react";
import { cn } from "@/utils/utils";

export interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  maxReachedStep?: number;
  onStepChange?: (stepIndex: number) => void;
  hiddenStepIndexes?: number[];
  completedStepIndexes?: number[];
  failedStepIndexes?: number[];
}

const PaperStepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  maxReachedStep,
  onStepChange,
  hiddenStepIndexes = [],
  completedStepIndexes = [],
  failedStepIndexes = [],
}) => {
    const stepLabelMap: Record<string, string> = {
        Abstract: "Tóm tắt (Abstract)",
        FullPaper: "Bài báo đầy đủ (Full Paper)",
        Revise: "Final Review (Vòng chỉnh sửa và đánh giá cuối cùng)",
        CameraReady: "Bản cuối cùng (Camera Ready)",
        Payment: "Thanh toán",
    };

  const visibleSteps = hiddenStepIndexes.length > 0
    ? steps.map((step, idx) => ({ step, index: idx })).filter(({ index }) => !hiddenStepIndexes.includes(index))
    : steps.map((step, idx) => ({ step, index: idx }));

  const handleClick = (stepIndex: number) => {
    if (stepIndex > (maxReachedStep || currentStep)) {
      alert("Bạn không thể bỏ qua giai đoạn.");
      return;
    }
    onStepChange?.(stepIndex);
  };

  const getStepIcon = (stepIndex: number, isActive: boolean, isCompleted: boolean) => {
    if (failedStepIndexes.includes(stepIndex)) {
      return <XCircle className="h-8 w-8 text-white" />;
    }
    if (completedStepIndexes.includes(stepIndex) || isCompleted) {
      return <CheckCircle2 className="h-8 w-8 text-white" />;
    }
    if (isActive) {
      return <CircleDot className="h-8 w-8 text-white animate-pulse" />;
    }
    return <Circle className="h-7 w-7 text-gray-400" />;
  };

  return (
    <div className="relative w-full px-8">
      <div className="flex items-start justify-between relative">
        {visibleSteps.map(({ step, index }, visibleIdx) => {
          const isActive = index === currentStep;
          const isCompleted = completedStepIndexes.includes(index) && !isActive;
          const isFailed = failedStepIndexes.includes(index) && !isActive;
          const isCompletedStrict = completedStepIndexes.includes(index);
          const isDisabled = index > (maxReachedStep || currentStep);
          const isLast = visibleIdx === visibleSteps.length - 1;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
                    isFailed
                      ? "bg-red-600 shadow-lg shadow-red-600/50"
                      : isActive
                        ? "bg-green-500 shadow-xl shadow-green-500/60 scale-110"
                        : isCompleted
                          ? "bg-blue-500 shadow-lg shadow-blue-500/50 hover:scale-110 cursor-pointer"
                          : "bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    !isDisabled && !isActive && !isCompleted && !isFailed && "hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 cursor-pointer"
                  )}
                  onClick={() => !isDisabled && handleClick(index)}
                >
                  {getStepIcon(index, isActive, isCompleted)}
                </div>

                <span
                  className={cn(
                    "text-sm mt-3 text-center transition-all duration-200 font-medium whitespace-nowrap",
                    isFailed
                      ? "text-red-600"
                      : isActive
                        ? "text-green-600 scale-105 font-bold"
                        : isCompleted
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-700 dark:text-gray-500",
                    !isDisabled && "hover:text-black dark:hover:text-white cursor-pointer"
                  )}
                  onClick={() => !isDisabled && handleClick(index)}
                >
                  {stepLabelMap[step.label] || step.label}
                </span>

                <span
                  className={cn(
                    "text-sm mt-1 font-semibold transition-all duration-300",
                    isFailed
                      ? "text-red-600"
                      : isActive
                        ? "text-green-600 animate-pulse"
                        : isCompletedStrict
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-700 dark:text-gray-500"
                  )}
                >
                  {isFailed
                    ? "Đã từ chối"
                    : isCompletedStrict
                      ? "Đã kết thúc"
                      : isActive
                        ? "Đang diễn ra"
                        : "Chưa đến"}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 relative self-start mt-8">
                  <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700" />
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500 ease-in-out bg-blue-500",
                      (isCompleted || isActive) ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PaperStepIndicator;
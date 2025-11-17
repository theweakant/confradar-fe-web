  import { ReactNode } from "react";

  interface StepContainerProps {
    stepNumber: number;
    title: string;
    isCompleted?: boolean;
    children: ReactNode;
  }

  export function StepContainer({
    stepNumber,
    title,
    isCompleted = false,
    children,
  }: StepContainerProps) {
    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {stepNumber}. {title}
          </h3>
          {isCompleted && (
            <span className="text-sm text-green-600 font-medium">
              Đã hoàn thành
            </span>
          )}
        </div>

        {children}
      </div>
    );
  }
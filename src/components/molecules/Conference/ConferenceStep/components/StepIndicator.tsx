import { AlertTriangle } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  activeStep: number;
  completedSteps: number[];
  stepsWithData: number[];
  dirtySteps: number[];
  maxStep: number;
  stepLabels: string[];
  mode: "create" | "edit";
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  activeStep,
  completedSteps,
  stepsWithData,
  dirtySteps,
  maxStep,
  stepLabels,
  mode,
  onStepClick,
}: StepIndicatorProps) {
  const getStepStatus = (step: number) => {
    const isCurrent = currentStep === step;
    const isDirty = dirtySteps.includes(step);
    const isCompleted = completedSteps.includes(step);
    const hasData = stepsWithData.includes(step);

    // Priority order:
    // 1. Current step (hiện tại đang ở)
    // 2. Dirty (có thay đổi chưa lưu) - màu vàng warning
    // 3. Completed (đã hoàn thành trong create mode)
    // 4. Has Data (có data trong edit mode) - màu xanh
    // 5. Empty (chưa có gì)

    if (isCurrent) {
      return {
        bg: "bg-blue-600",
        text: "text-white",
        ring: "ring-4 ring-blue-200",
        icon: step.toString(),
      };
    }

    if (isDirty) {
      return {
        bg: "bg-yellow-500",
        text: "text-white",
        ring: "ring-2 ring-yellow-300",
        icon: "!",
      };
    }

    if (isCompleted) {
      return {
        bg: "bg-green-600",
        text: "text-white",
        ring: "",
        icon: "✓",
      };
    }

    if (mode === "edit" && hasData) {
      return {
        bg: "bg-green-600",
        text: "text-white",
        ring: "",
        icon: "✓",
      };
    }

    return {
      bg: "bg-gray-200",
      text: "text-gray-500",
      ring: "",
      icon: step.toString(),
    };
  };

  const isStepAccessible = (step: number) => {
    if (mode === "edit") return true;
    return completedSteps.includes(step) || step <= activeStep;
  };

  return (
    <div className="mb-8">
      {/* Warning nếu có dirty steps */}
      {dirtySteps.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Có thay đổi chưa lưu
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Các bước {dirtySteps.join(", ")} có thay đổi chưa được lưu. Vui lòng nhấn nút
              {mode === "edit" ? ' "Cập nhật" ' : ' "Lưu & Tiếp tục" '}
              để lưu thay đổi.
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: maxStep }, (_, i) => i + 1).map((step) => {
          const status = getStepStatus(step);
          const isAccessible = isStepAccessible(step);
          const isDirty = dirtySteps.includes(step);

          return (
            <div
              key={step}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="relative">
                <button
                  onClick={() => isAccessible && onStepClick(step)}
                  disabled={!isAccessible}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    font-semibold transition-all relative
                    ${status.bg} ${status.text} ${status.ring}
                    ${isAccessible ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}
                  `}
                  aria-label={`Step ${step}: ${stepLabels[step - 1]}${isDirty ? " (có thay đổi chưa lưu)" : ""}`}
                  aria-current={currentStep === step ? "step" : undefined}
                  title={isDirty ? "Có thay đổi chưa lưu" : undefined}
                >
                  {status.icon}
                </button>

                {/* Warning icon overlay cho dirty steps */}
                {isDirty && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </div>

              {step < maxStep && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    completedSteps.includes(step) ||
                    (mode === "edit" && stepsWithData.includes(step))
                      ? "bg-green-600"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between">
        {stepLabels.map((label, index) => {
          const step = index + 1;
          const isCurrent = currentStep === step;
          const isDirty = dirtySteps.includes(step);

          return (
            <span
              key={step}
              className={`text-xs ${
                isCurrent
                  ? "font-semibold text-blue-600"
                  : isDirty
                  ? "font-medium text-yellow-600"
                  : "text-gray-500"
              }`}
              style={{
                width: `${100 / maxStep}%`,
                textAlign: "center",
                whiteSpace: maxStep > 6 ? "nowrap" : "normal",
              }}
            >
              {label}
              {isDirty}
            </span>
          );
        })}
      </div>
    </div>
  );
}
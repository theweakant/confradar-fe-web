interface StepIndicatorProps {
  currentStep: number;
  activeStep: number;
  completedSteps: number[];
  maxStep: number;
  stepLabels: string[];
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  activeStep,
  completedSteps,
  maxStep,
  stepLabels,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: maxStep }, (_, i) => i + 1).map((step) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step;
          const isAccessible = isCompleted || step <= activeStep;

          return (
            <div
              key={step}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                onClick={() => isAccessible && onStepClick(step)}
                disabled={!isAccessible}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center 
                  font-semibold transition-all
                  ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-200" : ""}
                  ${isCompleted && !isCurrent ? "bg-green-600 text-white" : ""}
                  ${!isCompleted && !isCurrent ? "bg-gray-200 text-gray-500" : ""}
                  ${isAccessible ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}
                `}
                aria-label={`Step ${step}: ${stepLabels[step - 1]}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? "✓" : step}
              </button>

              {step < maxStep && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${isCompleted ? "bg-green-600" : "bg-gray-200"
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

          return (
            <span
              key={step}
              className={`text-xs ${isCurrent ? "font-semibold text-blue-600" : "text-gray-500"
                }`}
              style={{
                width: `${100 / maxStep}%`,
                textAlign: "center",
                whiteSpace: maxStep > 6 ? "nowrap" : "normal"
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
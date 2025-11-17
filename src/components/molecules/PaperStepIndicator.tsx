// components/PaperStepIndicator.tsx
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
    const visibleSteps = hiddenStepIndexes && hiddenStepIndexes.length > 0
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
                    const isActive = currentStep === index;
                    const isCompleted = index < (maxReachedStep || currentStep);
                    const isDisabled = index > (maxReachedStep || currentStep);
                    const isLast = visibleIdx === visibleSteps.length - 1;
                    const isFailed = failedStepIndexes.includes(index);

                    return (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
                                        isFailed
                                            ? "bg-red-600 shadow-lg shadow-red-600/50"
                                            : isCompleted
                                                ? "bg-blue-500 shadow-lg shadow-blue-500/50 hover:scale-110 cursor-pointer"
                                                : isActive
                                                    ? "bg-blue-600 shadow-xl shadow-blue-600/60 scale-110"
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
                                        isFailed ? "text-red-600"
                                            : isActive ? "text-blue-600 scale-105"
                                                : isCompleted ? "text-gray-600 dark:text-gray-300"
                                                    : "text-gray-700 dark:text-gray-500",
                                        !isDisabled && "hover:text-black dark:hover:text-white cursor-pointer"
                                    )}
                                    onClick={() => !isDisabled && handleClick(index)}
                                >
                                    {step.label}
                                </span>

                                <span
                                    className={cn(
                                        "text-sm mt-1 font-semibold transition-all duration-300",
                                        isFailed ? "text-red-600"
                                            : index < (maxReachedStep || currentStep) ? "text-gray-600 dark:text-gray-300"
                                                : index === maxReachedStep ? "text-blue-600 animate-pulse"
                                                    : "text-gray-700 dark:text-gray-500"
                                    )}
                                >
                                    {isFailed
                                        ? "Đã từ chối"
                                        : index < (maxReachedStep || currentStep)
                                            ? "Đã kết thúc"
                                            : index === (maxReachedStep || currentStep)
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
                                            isCompleted ? "w-full" : "w-0"
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

// // // components/PaperStepIndicator.tsx
// // "use client";
// // import React from "react";
// // import { CheckCircle2, CircleDot, Circle } from "lucide-react";
// // import { cn } from "@/utils/utils";

// // export interface Step {
// //     id: number;
// //     label: string;
// // }

// // interface StepIndicatorProps {
// //     steps: Step[];
// //     currentStep: number;
// //     maxReachedStep?: number;
// //     onStepChange?: (stepId: number) => void;
// //     hiddenStepIndexes?: number[];
// // }

// // const PaperStepIndicator: React.FC<StepIndicatorProps> = ({
// //     steps,
// //     currentStep,
// //     maxReachedStep,
// //     onStepChange,
// //     hiddenStepIndexes,
// // }) => {
// //     const visibleSteps = hiddenStepIndexes && hiddenStepIndexes.length > 0
// //         ? steps.filter((_, idx) => !hiddenStepIndexes.includes(idx))
// //         : steps;

// //     const handleClick = (stepId: number) => {
// //         if (stepId > (maxReachedStep || currentStep)) {
// //             alert("Bạn không thể bỏ qua giai đoạn.");
// //             return;
// //         }
// //         onStepChange?.(stepId);
// //     };

// //     return (
// //         <div className="relative w-full px-8">
// //             {/* Background line container */}
// //             <div className="absolute left-8 right-8 top-8 flex items-center">
// //                 {visibleSteps.map((step, idx) => {
// //                     if (idx === steps.length - 1) return null;
// //                     const isCompleted = step.id < currentStep;
// //                     return (
// //                         <div key={`line-${step.id}`} className="flex-1 h-0.5 bg-gray-700 relative mx-8">
// //                             <div
// //                                 className={cn(
// //                                     "absolute inset-0 transition-all duration-500 ease-in-out bg-blue-500",
// //                                     isCompleted ? "w-full" : "w-0"
// //                                 )}
// //                             />
// //                         </div>
// //                     );
// //                 })}
// //             </div>

// //             {/* Steps */}
// //             <div className="flex items-start justify-between relative">
// //                 {visibleSteps.map((step) => {
// //                     const isActive = currentStep === step.id;
// //                     const isCompleted = step.id < (maxReachedStep || currentStep);
// //                     const isDisabled = step.id > (maxReachedStep || currentStep);
// //                     // const isCompleted = step.id < currentStep;
// //                     // const isDisabled = step.id > (maxReachedStep || currentStep);

// //                     return (
// //                         <div key={step.id} className="flex flex-col items-center">
// //                             <div
// //                                 className={cn(
// //                                     "w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
// //                                     isCompleted && "bg-blue-500 shadow-lg shadow-blue-500/50 hover:scale-110 cursor-pointer",
// //                                     isActive && "bg-blue-600 shadow-xl shadow-blue-600/60 scale-110",
// //                                     !isActive && !isCompleted && "bg-gray-700 border-2 border-gray-600",
// //                                     isDisabled && "opacity-50 cursor-not-allowed",
// //                                     !isDisabled && !isActive && !isCompleted && "hover:bg-gray-600 hover:scale-105 cursor-pointer"
// //                                 )}
// //                                 onClick={() => !isDisabled && handleClick(step.id)}
// //                             >
// //                                 {isCompleted ? (
// //                                     <CheckCircle2 className="h-8 w-8 text-white" />
// //                                 ) : step.id === maxReachedStep ? (
// //                                     <CircleDot className="h-8 w-8 text-white animate-pulse" />
// //                                 ) : (
// //                                     <Circle className="h-7 w-7 text-gray-400" />
// //                                 )}
// //                             </div>

// //                             <span
// //                                 className={cn(
// //                                     "text-sm mt-3 text-center transition-all duration-200 font-medium whitespace-nowrap",
// //                                     isActive && "text-blue-400 scale-105",
// //                                     isCompleted && "text-gray-300",
// //                                     !isActive && !isCompleted && "text-gray-500",
// //                                     !isDisabled && "hover:text-white cursor-pointer"
// //                                 )}
// //                                 onClick={() => !isDisabled && handleClick(step.id)}
// //                             >
// //                                 {step.label}
// //                             </span>


// //                             {/* Trạng thái bên dưới label */}
// //                             <span
// //                                 className={cn(
// //                                     "text-sm mt-1 font-semibold transition-all duration-300",
// //                                     step.id < (maxReachedStep || currentStep) && "text-gray-300",
// //                                     step.id === maxReachedStep && "text-blue-400 animate-pulse",
// //                                     // step.id === (maxReachedStep || currentStep) && "text-blue-400 animate-pulse",
// //                                     step.id > (maxReachedStep || currentStep) && "text-gray-500"
// //                                 )}
// //                             >
// //                                 {step.id < (maxReachedStep || currentStep)
// //                                     ? "Đã kết thúc"
// //                                     : step.id === (maxReachedStep || currentStep)
// //                                         ? "Đang diễn ra"
// //                                         : "Chưa đến"}
// //                             </span>
// //                         </div>
// //                     );
// //                 })}
// //             </div>
// //         </div>
// //     );
// // };

// // // const PaperStepIndicator: React.FC<StepIndicatorProps> = ({
// // //     steps,
// // //     currentStep,
// // //     maxReachedStep,
// // //     onStepChange,
// // // }) => {
// // //     const handleClick = (stepId: number) => {
// // //         if (stepId > (maxReachedStep || currentStep)) {
// // //             alert("Bạn không thể bỏ qua giai đoạn.");
// // //             return;
// // //         }
// // //         onStepChange?.(stepId);
// // //     };

// // //     return (
// // //         <div className="flex items-center justify-between relative w-full px-8">
// // //             {steps.map((step, idx) => {
// // //                 const isActive = currentStep === step.id;
// // //                 const isCompleted = step.id < currentStep;
// // //                 const isDisabled = step.id > (maxReachedStep || currentStep);
// // //                 const isLast = idx === steps.length - 1;

// // //                 return (
// // //                     <React.Fragment key={step.id}>
// // //                         <div className="flex flex-col items-center relative z-10">
// // //                             {/* Step circle */}
// // //                             <div
// // //                                 className={cn(
// // //                                     "w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
// // //                                     isCompleted && "bg-blue-500 shadow-lg shadow-blue-500/50 hover:scale-110 cursor-pointer",
// // //                                     isActive && "bg-blue-600 shadow-xl shadow-blue-600/60 scale-110",
// // //                                     !isActive && !isCompleted && "bg-gray-700 border-2 border-gray-600",
// // //                                     isDisabled && "opacity-50 cursor-not-allowed",
// // //                                     !isDisabled && !isActive && !isCompleted && "hover:bg-gray-600 hover:scale-105 cursor-pointer"
// // //                                 )}
// // //                                 onClick={() => !isDisabled && handleClick(step.id)}
// // //                             >
// // //                                 {isCompleted ? (
// // //                                     <CheckCircle2 className="h-8 w-8 text-white" />
// // //                                 ) : isActive ? (
// // //                                     <CircleDot className="h-8 w-8 text-white animate-pulse" />
// // //                                 ) : (
// // //                                     <Circle className="h-7 w-7 text-gray-400" />
// // //                                 )}
// // //                             </div>

// // //                             {/* Label */}
// // //                             <span
// // //                                 className={cn(
// // //                                     "text-sm mt-3 text-center transition-all duration-200 font-medium",
// // //                                     isActive && "text-blue-400 scale-105",
// // //                                     isCompleted && "text-gray-300",
// // //                                     !isActive && !isCompleted && "text-gray-500",
// // //                                     !isDisabled && "hover:text-white cursor-pointer"
// // //                                 )}
// // //                                 onClick={() => !isDisabled && handleClick(step.id)}
// // //                             >
// // //                                 {step.label}
// // //                             </span>
// // //                         </div>

// // //                         {/* Connecting line */}
// // //                         {!isLast && (
// // //                             <div className="flex-1 h-0.5 mx-4 relative">
// // //                                 <div className="absolute inset-0 bg-gray-700" />
// // //                                 <div
// // //                                     className={cn(
// // //                                         "absolute inset-0 transition-all duration-500 ease-in-out",
// // //                                         isCompleted ? "bg-blue-500 w-full" : "bg-transparent w-0"
// // //                                     )}
// // //                                 />
// // //                             </div>
// // //                         )}
// // //                     </React.Fragment>
// // //                 );
// // //             })}
// // //         </div>
// // //     );
// // // };

// // export default PaperStepIndicator;

// // components/PaperStepIndicator.tsx
// "use client";
// import React from "react";
// import { CheckCircle2, CircleDot, Circle, XCircle } from "lucide-react";
// import { cn } from "@/utils/utils";

// export interface Step {
//     label: string;
// }

// interface StepIndicatorProps {
//     steps: Step[];
//     currentStep: number;
//     maxReachedStep?: number;
//     onStepChange?: (stepId: number) => void;
//     hiddenStepIndexes?: number[];
//     completedStepIndexes?: number[];
//     failedStepIndexes?: number[];
// }

// const PaperStepIndicator: React.FC<StepIndicatorProps> = ({
//     steps,
//     currentStep,
//     maxReachedStep,
//     onStepChange,
//     hiddenStepIndexes = [],
//     completedStepIndexes = [],
//     failedStepIndexes = [],
// }) => {
//     const visibleSteps = hiddenStepIndexes && hiddenStepIndexes.length > 0
//         ? steps.filter((_, idx) => !hiddenStepIndexes.includes(idx))
//         : steps;

//     const handleClick = (stepId: number) => {
//         if (stepId > (maxReachedStep || currentStep)) {
//             alert("Bạn không thể bỏ qua giai đoạn.");
//             return;
//         }
//         onStepChange?.(stepId);
//     };

//     const getStepIcon = (stepIndex: number, isActive: boolean, isCompleted: boolean) => {
//         if (failedStepIndexes.includes(stepIndex)) {
//             return <XCircle className="h-8 w-8 text-white" />;
//         }
//         if (completedStepIndexes.includes(stepIndex) || isCompleted) {
//             return <CheckCircle2 className="h-8 w-8 text-white" />;
//         }
//         if (isActive) {
//             return <CircleDot className="h-8 w-8 text-white animate-pulse" />;
//         }
//         return <Circle className="h-7 w-7 text-gray-400" />;
//     };

//     return (
//         <div className="relative w-full px-8">
//             <div className="flex items-start justify-between relative">
//                 {visibleSteps.map((step, idx) => {
//                     const originalIndex = steps.findIndex(s => s.id === step.id);
//                     const isActive = currentStep === step.id;
//                     const isCompleted = step.id < (maxReachedStep || currentStep);
//                     const isDisabled = step.id > (maxReachedStep || currentStep);
//                     const isLast = idx === visibleSteps.length - 1;
//                     const isFailed = failedStepIndexes.includes(originalIndex);

//                     return (
//                         <React.Fragment key={step.id}>
//                             <div className="flex flex-col items-center">
//                                 <div
//                                     className={cn(
//                                         "w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
//                                         isFailed
//                                             ? "bg-red-600 shadow-lg shadow-red-600/50"
//                                             : isCompleted
//                                                 ? "bg-blue-500 shadow-lg shadow-blue-500/50 hover:scale-110 cursor-pointer"
//                                                 : isActive
//                                                     ? "bg-blue-600 shadow-xl shadow-blue-600/60 scale-110"
//                                                     : "bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600",
//                                         isDisabled && "opacity-50 cursor-not-allowed",
//                                         !isDisabled && !isActive && !isCompleted && !isFailed && "hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 cursor-pointer"
//                                     )}
//                                     // className={cn(
//                                     //     "w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
//                                     //     isFailed && "bg-red-600 shadow-lg shadow-red-600/50", // Thêm mới
//                                     //     !isFailed && isCompleted && "bg-blue-500 shadow-lg shadow-blue-500/50 hover:scale-110 cursor-pointer",
//                                     //     !isFailed && isActive && "bg-blue-600 shadow-xl shadow-blue-600/60 scale-110",
//                                     //     !isFailed && !isActive && !isCompleted && "bg-gray-700 border-2 border-gray-600",
//                                     //     isDisabled && "opacity-50 cursor-not-allowed",
//                                     //     !isDisabled && !isActive && !isCompleted && !isFailed && "hover:bg-gray-600 hover:scale-105 cursor-pointer"
//                                     // )}
//                                     onClick={() => !isDisabled && handleClick(step.id)}
//                                 >
//                                     {getStepIcon(originalIndex, isActive, isCompleted)}
//                                 </div>

//                                 <span
//                                     className={cn(
//                                         "text-sm mt-3 text-center transition-all duration-200 font-medium whitespace-nowrap",
//                                         isFailed ? "text-red-600"
//                                             : isActive ? "text-blue-600 scale-105"
//                                                 : isCompleted ? "text-gray-600 dark:text-gray-300"
//                                                     : "text-gray-700 dark:text-gray-500",
//                                         !isDisabled && "hover:text-black dark:hover:text-white cursor-pointer"
//                                     )}
//                                     // className={cn(
//                                     //     "text-sm mt-3 text-center transition-all duration-200 font-medium whitespace-nowrap",
//                                     //     isFailed && "text-red-400", // Thêm mới
//                                     //     !isFailed && isActive && "text-blue-400 scale-105",
//                                     //     !isFailed && isCompleted && "text-gray-300",
//                                     //     !isFailed && !isActive && !isCompleted && "text-gray-500",
//                                     //     !isDisabled && "hover:text-white cursor-pointer"
//                                     // )}
//                                     onClick={() => !isDisabled && handleClick(step.id)}
//                                 >
//                                     {step.label}
//                                 </span>

//                                 <span
//                                     className={cn(
//                                         "text-sm mt-1 font-semibold transition-all duration-300",
//                                         isFailed ? "text-red-600"
//                                             : step.id < (maxReachedStep || currentStep) ? "text-gray-600 dark:text-gray-300"
//                                                 : step.id === maxReachedStep ? "text-blue-600 animate-pulse"
//                                                     : "text-gray-700 dark:text-gray-500"
//                                     )}
//                                 // className={cn(
//                                 //     "text-sm mt-1 font-semibold transition-all duration-300",
//                                 //     isFailed && "text-red-400",
//                                 //     !isFailed && step.id < (maxReachedStep || currentStep) && "text-gray-300",
//                                 //     !isFailed && step.id === maxReachedStep && "text-blue-400 animate-pulse",
//                                 //     !isFailed && step.id > (maxReachedStep || currentStep) && "text-gray-500"
//                                 // )}
//                                 >
//                                     {isFailed
//                                         ? "Đã từ chối"
//                                         : step.id < (maxReachedStep || currentStep)
//                                             ? "Đã kết thúc"
//                                             : step.id === (maxReachedStep || currentStep)
//                                                 ? "Đang diễn ra"
//                                                 : "Chưa đến"}
//                                 </span>
//                             </div>

//                             {!isLast && (
//                                 <div className="flex-1 h-0.5 mx-4 relative self-start mt-8">
//                                     {/* <div className="absolute inset-0 bg-gray-700" /> */}
//                                     <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700" />
//                                     <div
//                                         className={cn(
//                                             "absolute inset-0 transition-all duration-500 ease-in-out bg-blue-500",
//                                             isCompleted ? "w-full" : "w-0"
//                                         )}
//                                     />
//                                 </div>
//                             )}
//                         </React.Fragment>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// export default PaperStepIndicator;
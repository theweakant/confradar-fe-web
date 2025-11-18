// components/RightSidebar/ProgressTimelineSection.tsx
import { Clock } from "lucide-react";
import type { CommonConference } from "@/types/conference.type";
import { useState } from "react";

interface ProgressTimelineSectionProps {
  conference: CommonConference;
  getStatusName: (id: string) => string;
}

export function ProgressTimelineSection({
  conference,
  getStatusName,
}: ProgressTimelineSectionProps) {
  const [reminderActive, setReminderActive] = useState(false);
  const statusName = getStatusName(conference.conferenceStatusId ?? "");

  // Define status progression
  const statusProgression = [
    { name: "Draft", color: "bg-gray-400" },
    { name: "Pending", color: "bg-yellow-400" },
    { name: "Preparing", color: "bg-blue-500" },
    { name: "Ready", color: "bg-purple-500" },
    { name: "Completed", color: "bg-green-500" },
  ];

  // Calculate current status index
  const getCurrentStatusIndex = () => {
    const index = statusProgression.findIndex(s => s.name === statusName);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getCurrentStatusIndex();
  const progressPercentage = ((currentIndex + 1) / statusProgression.length) * 100;

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const now = new Date();
    const start = new Date(conference.startDate || "");
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Project Stats</h3>
      
      <div className="space-y-5">
        {/* Time Remaining */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Time Remaining</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{daysRemaining}d</span>
        </div>  

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
              <span className="text-sm font-medium text-gray-900">Progress</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{Math.round(progressPercentage)}%</span>
          </div>

          {/* Progress Bar with Status Milestones */}
          <div className="relative pt-2">
            <div className="relative">
              {/* Background track */}
              <div className="h-2 bg-gray-200 rounded-full relative overflow-hidden">
                {/* Progress fill */}
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Status milestone dots */}
              <div className="absolute inset-0 flex items-center justify-between">
                {statusProgression.map((status, index) => {
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div
                      key={status.name}
                      className="relative flex flex-col items-center"
                      style={{ 
                        left: `${(index / (statusProgression.length - 1)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {/* Dot */}
                      <div
                        className={`w-2 h-2 rounded-full z-10 transition-all ${
                          isCompleted ? status.color : 'bg-gray-300'
                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Current position indicator */}
              {currentIndex >= 0 && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-md z-20 transition-all duration-500"
                  style={{ left: `calc(${progressPercentage}% - 6px)` }}
                />
              )}
            </div>

            {/* Status labels */}
            <div className="relative mt-3 flex justify-between text-xs">
              {statusProgression.map((status, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <div
                    key={status.name}
                    className={`text-center transition-colors ${
                      isCurrent 
                        ? 'text-blue-600 font-semibold' 
                        : isCompleted 
                        ? 'text-gray-700' 
                        : 'text-gray-400'
                    }`}
                    style={{ width: '20%' }}
                  >
                    {status.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Status Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Current Status</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              statusName === "Draft" ? "bg-gray-100 text-gray-700" :
              statusName === "Pending" ? "bg-yellow-100 text-yellow-700" :
              statusName === "Preparing" ? "bg-blue-100 text-blue-700" :
              statusName === "Ready" ? "bg-purple-100 text-purple-700" :
              statusName === "Completed" ? "bg-green-100 text-green-700" :
              statusName === "Canceled" ? "bg-red-100 text-red-700" :
              statusName === "On Hold" ? "bg-orange-100 text-orange-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {statusName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
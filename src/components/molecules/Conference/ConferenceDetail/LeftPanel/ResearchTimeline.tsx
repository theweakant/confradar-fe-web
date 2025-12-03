// components/LeftPanel/ResearchPhaseTimeline.tsx
import { FileEdit, FileText, Eye, RefreshCw, Camera } from "lucide-react";
import { formatDate } from "@/helper/format";

interface ResearchPhaseItem {
  name: string;
  startDate: string;
  endDate: string;
}

interface ResearchPhaseTimelineProps {
  phases: ResearchPhaseItem[];
}

export function ResearchPhaseTimeline({ phases }: ResearchPhaseTimelineProps) {
  if (phases.length === 0) return null;

  const now = new Date();

  const phaseStatuses = phases.map((phase, index) => {
    const start = new Date(phase.startDate);
    const end = new Date(phase.endDate);

    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    if (now > end) {
      status = "completed";
    } else if (now >= start && now <= end) {
      status = "in-progress";
    }

    return {
      ...phase,
      status,
      index: index + 1,
    };
  });

  const phaseIcons = [FileEdit, FileText, Eye, RefreshCw, Camera];

  const getStatusConfig = (status: "completed" | "in-progress" | "upcoming") => {
    switch (status) {
      case "completed":
        return {
          badgeClass: "bg-emerald-100 text-emerald-700",
          iconColor: "text-emerald-600",
          bgColor: "bg-emerald-50",
        };
      case "in-progress":
        return {
          badgeClass: "bg-blue-100 text-blue-700",
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      default:
        return {
          badgeClass: "bg-gray-100 text-gray-600",
          iconColor: "text-gray-400",
          bgColor: "bg-gray-50",
        };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Timeline nghiên cứu</h3>

      <div className="flex items-start justify-between gap-2 py-4 px-3 bg-white rounded-lg border border-gray-200 shadow-sm">
        {phaseStatuses.map((phase, index) => {
          const config = getStatusConfig(phase.status);
          const PhaseIcon = phaseIcons[index] || FileEdit;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor} border-2 ${
                  phase.status === "completed"
                    ? "border-emerald-300"
                    : phase.status === "in-progress"
                    ? "border-blue-300"
                    : "border-gray-200"
                } shadow-sm`}
              >
                <PhaseIcon className={`w-6 h-6 ${config.iconColor}`} />
              </div>

              <div className="mt-3 text-center max-w-[90px]">
                <div className="text-xs font-semibold text-gray-900 leading-tight">
                  {phase.name}
                </div>
                <div className="text-[10px] text-gray-500 mt-1 font-medium">
                  {formatDate(phase.startDate)}
                </div>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-[10px] rounded-full font-medium ${config.badgeClass}`}
                >
                  {phase.status === "completed"
                    ? "Hoàn thành"
                    : phase.status === "in-progress"
                    ? "Đang diễn ra"
                    : "Sắp tới"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
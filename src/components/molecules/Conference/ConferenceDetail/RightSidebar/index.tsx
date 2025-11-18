// components/RightSidebar/index.tsx
import { ProgressTimelineSection } from "./ProgressTimelineSection";
import { StatisticsSection } from "./StatisticsSection";
import { RecentActivitiesSection } from "./RecentActivitiesSection";
import type { CommonConference } from "@/types/conference.type";

interface RightSidebarProps {
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
}

export function RightSidebar({
  conference,
  getStatusName,
}: RightSidebarProps) {
  return (
    <div className="w-80 flex-shrink-0 space-y-4 sticky top-6 self-start">
      {/* Progress Timeline */}
      <ProgressTimelineSection
        conference={conference}
        getStatusName={getStatusName}
      />

      {/* Statistics */}
      <StatisticsSection
        conference={conference}
      />

      {/* Recent Activities */}
      <RecentActivitiesSection
        conferenceId={conference.conferenceId!}
        limit={10}
      />
    </div>
  );
}
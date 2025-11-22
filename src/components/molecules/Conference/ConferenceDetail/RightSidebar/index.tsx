// components/RightSidebar/index.tsx
import { ProgressTimelineSection } from "./ProgressSection"; 
import { StatisticsSection } from "./StatisticsSection";
import { RegisteredUserSection } from "./RegisteredUserSection";
import type { CommonConference } from "@/types/conference.type";

interface RightSidebarProps {
  conference: CommonConference;
  conferenceId: string;
  isCollaborator: boolean;
  conferenceType: "technical" | "research" | null;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
  onOpenTimeline?: () => void; 
  onOpenFullAttendees?: () => void;
}

export function RightSidebar({
  conference,
  conferenceId,
  isCollaborator,
  getStatusName,
  onOpenTimeline,
  onOpenFullAttendees
}: RightSidebarProps) {
  return (
    <div className="w-80 flex-shrink-0 space-y-4 sticky top-6 self-start">
      {/* Progress Timeline */}
      <ProgressTimelineSection
        conference={conference}
        getStatusName={getStatusName}
        onOpenTimeline={onOpenTimeline} 
      />

      {/* Statistics */}
      <StatisticsSection
        conferenceId={conferenceId}
        isCollaborator={isCollaborator}
      />

      {/* Recent Activities */}
      <RegisteredUserSection
        conferenceId={conference.conferenceId!}
        conferenceName={conference.conferenceName!}
        limit={1}
        onOpenFullList={onOpenFullAttendees}
      />
    </div>
  );
}
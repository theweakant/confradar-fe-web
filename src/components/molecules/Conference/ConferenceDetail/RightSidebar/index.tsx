// components/RightSidebar/index.tsx
import { ProgressTimelineSection } from "./ProgressSection"; 
import { StatisticsSection } from "./StatisticSection";
import { RegisteredUserSection } from "./RegisteredUserSection";
import type { CommonConference } from "@/types/conference.type";
import { useGlobalTime } from "@/utils/TimeContext"; 

interface RightSidebarProps {
  conference: CommonConference;
  conferenceId: string;
  isCollaborator: boolean;
  conferenceType: "technical" | "research" | null;
  isOwnConference: boolean;
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
  conferenceType,
  isOwnConference,
  getStatusName,
  onOpenTimeline,
  onOpenFullAttendees
}: RightSidebarProps) {
  const { now } = useGlobalTime(); 

  return (
    <div className="w-80 flex-shrink-0 space-y-4 sticky top-6 self-start">
      <ProgressTimelineSection
        conference={conference}
        getStatusName={getStatusName}
        onOpenTimeline={onOpenTimeline}
        now={now} 
      />

      {/* Statistics */}
      {conferenceType && (
        <StatisticsSection
          conferenceId={conferenceId}
          conferenceType={conferenceType} // ✅ "technical" hoặc "research"
          isOwnConference={isOwnConference}
        />
      )}

      {/* Recent Activities */}
      <RegisteredUserSection
        conferenceId={conference.conferenceId!}
        conferenceName={conference.conferenceName!}
        limit={2}
        onOpenFullList={onOpenFullAttendees}
      />
    </div>
  );
}
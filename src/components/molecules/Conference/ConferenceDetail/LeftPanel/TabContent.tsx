// components/LeftPanel/TabContent.tsx
import type { CommonConference } from "@/types/conference.type";
import type { TabId } from "../constants/tabConfig";

// Import all tab components
import { PriceTab } from "../Tab/PriceTab";
import { RefundPolicyTab } from "../Tab/RefundPolicyTab";
import { SessionTab } from "../Tab/SessionTab";
import { SponsorsMediaTab } from "../Tab/SponsorsMediaTab";
import { ResearchMaterialsTab } from "../Tab/ResearchMaterialsTab";
import { ResearchInfoTab } from "../Tab/ResearchInfoTab";
import { RefundRequestTab } from "../Tab/RefundRequestTab";
import { OtherRequestTab } from "../Tab/OtherRequestTab";
import { ResearchTimelineTab } from "../Tab/ResearchTimelineTab";
import { PaperPhaseTab } from "../Tab/PaperPhaseTab";
import { PaperAssignmentTab } from "../Tab/PaperAssignmentTab";

interface TabContentProps {
  activeSubtab: TabId;
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
}

export function TabContent({
  activeSubtab,
  conference,
  conferenceType,
}: TabContentProps) {
  // Render the appropriate tab component
  const renderTabContent = () => {
    switch (activeSubtab) {
      case "price":
        return <PriceTab conference={conference} />;
      
      case "refund-policy":
        return <RefundPolicyTab conference={conference} />;
      
      case "session":
        return <SessionTab conference={conference} conferenceType={conferenceType} />;
      
      case "sponsors-media":
        return <SponsorsMediaTab conference={conference} />;
      
      case "research-materials":
        return conferenceType === "research" ? (
          <ResearchMaterialsTab conference={conference} />
        ) : null;
      
      case "research-info":
        return conferenceType === "research" ? (
          <ResearchInfoTab conference={conference as any} />
        ) : null;
      
      case "research-timeline":
        return <ResearchTimelineTab conferenceId={conference.conferenceId!} />;
      
      case "paper-phase":
        return conferenceType === "research" ? <PaperPhaseTab /> : null;
      
      case "refund-requests":
        return (
          <RefundRequestTab
            conferenceId={conference.conferenceId!}
            conferenceType={conferenceType}
          />
        );
      
      case "other-requests":
        return conferenceType === "research" ? (
          <OtherRequestTab conferenceId={conference.conferenceId!} />
        ) : null;
      
      case "paper-assignment":
        return conferenceType === "research" ? (
          <PaperAssignmentTab conferenceId={conference.conferenceId!} />
        ) : null;
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Tab content not found</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-b-xl shadow-sm p-6">
      {renderTabContent()}
    </div>
  );
}
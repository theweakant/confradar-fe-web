// components/LeftPanel/TabContent.tsx

import type { CommonConference } from "@/types/conference.type";
import type { TabId } from "../constants/tab";

import { PriceTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/PriceTab";
import { RefundPolicyTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/RefundPolicyTab";
import { SessionTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/SessionTab";
import { SponsorsMediaTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/SponsorsMediaTab";
import { ResearchMaterialsTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ResearchMaterialsTab";
import { ResearchInfoTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ResearchInfoTab";
import { RefundRequestTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/RefundRequestTab";
import { OtherRequestTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/OtherRequest";
import { ResearchTimelineTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ResearchTimelineTab";
import { PaperTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/Paper/index";
import { PaperAssignmentTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/PaperAssignmentTab";
import { CustomerTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/Customer/CustomerTab";
import { ContractTab } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ContractTab";

import { TechnicalConferenceDetailResponse } from "@/types/conference.type";
import { useGlobalTime } from "@/utils/TimeContext"; // ✅ Import hook

interface TabContentProps {
  activeSubtab: TabId;
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  isCollaborator: boolean; 
  currentUserId?: string;
}

export function TabContent({
  activeSubtab,
  conference,
  conferenceType,
  isCollaborator, 
  currentUserId
}: TabContentProps) {
  const { now } = useGlobalTime(); 

  const renderTabContent = () => {
    switch (activeSubtab) {
      case "price":
        return <PriceTab conference={conference} now={now} />; 
      
      case "refund-policy":
        return <RefundPolicyTab conference={conference} />;
      
      case "session":
        return <SessionTab conference={conference} conferenceId={conference.conferenceId!} conferenceType={conferenceType} />;
      
      case "customers":
        return (
          <CustomerTab
            conferenceId={conference.conferenceId!}
            conferenceType={conferenceType}
            currentUserId={currentUserId}
            conferenceOwnerId={conference.createdBy}
          />
        );
      case "sponsors-media":
        return <SponsorsMediaTab conference={conference} />;
      
      case "research-materials":
        return conferenceType === "research" ? (
          <ResearchMaterialsTab conference={conference} />
        ) : null;
      
      case "research-info":
        return conferenceType === "research" ? (
          <ResearchInfoTab conference={conference} />
        ) : null;
      
      case "research-timeline":
        return <ResearchTimelineTab conferenceId={conference.conferenceId!} />;
      
      case "paper-phase":
        return conferenceType === "research" ? (
          <PaperTab 
            conferenceId={conference.conferenceId!} 
            conferenceData={conference} 
          />
        ) : null;
      
      case "refund-requests":
        const isTicketSelling = "contract" in conference && conference.contract 
          ? conference.contract.isTicketSelling 
          : true;
        return (
          <RefundRequestTab
            conferenceId={conference.conferenceId!}
            conferenceType={conferenceType}
            isCollaborator={isCollaborator}
            isTicketSelling={isTicketSelling}
            currentUserId={currentUserId} 
            conferenceOwnerId={conference.createdBy}
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

      case "contract":
        if (
          conferenceType === "technical" &&
          isCollaborator &&
          "contract" in conference &&
          conference.contract
        ) {
          return <ContractTab conferenceData={conference as TechnicalConferenceDetailResponse} />;
        }
        return null;

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
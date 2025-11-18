// constants/tabConfig.ts
import {
  Info,
  DollarSign,
  ShieldCheck,
  Calendar,
  ImageIcon,
  FileText,
  BookOpen,
  Clock,
  RefreshCw,
  MessageCircle,
  ClipboardList,
  Activity,
} from "lucide-react";

export type TabId = 
  | "price"
  | "refund-policy"
  | "sponsors-media"
  | "research-materials"
  | "research-info"
  | "research-timeline"
  | "paper-phase"
  | "refund-requests"
  | "other-requests"
  | "session"
  | "paper-assignment";

export interface TabConfig {
  id: TabId;
  label: string;
  icon: any;
  conferenceType?: "technical" | "research" | "all";
  roles?: string[];
}

export interface TabGroup {
  id: "detail" | "action";
  label: string;
  icon: any;
  tabs: TabConfig[];
}

export const TAB_GROUPS: TabGroup[] = [
  {
    id: "detail",
    label: "Detail",
    icon: Info,
    tabs: [
      {
        id: "price",
        label: "Giá vé",
        icon: DollarSign,
        conferenceType: "all",
      },
      {
        id: "refund-policy",
        label: "Hoàn trả & Chính sách",
        icon: ShieldCheck,
        conferenceType: "all",
      },
      {
        id: "sponsors-media",
        label: "Sponsors & Media",
        icon: ImageIcon,
        conferenceType: "all",
      },
      {
        id: "research-materials",
        label: "Tài liệu nghiên cứu",
        icon: FileText,
        conferenceType: "research",
      },
      {
        id: "research-info",
        label: "Research Info",
        icon: BookOpen,
        conferenceType: "research",
      },
      {
        id: "research-timeline",
        label: "Research Timeline",
        icon: Clock,
        conferenceType: "all",
      },
      {
        id: "paper-phase",
        label: "Bài báo",
        icon: FileText,
        conferenceType: "research",
      },
    ],
  },
  {
    id: "action",
    label: "Action",
    icon: Activity,
    tabs: [
      {
        id: "refund-requests",
        label: "Yêu cầu hoàn vé",
        icon: RefreshCw,
        conferenceType: "all",
      },
      {
        id: "other-requests",
        label: "Yêu cầu khác",
        icon: MessageCircle,
        conferenceType: "research",
      },
      {
        id: "session",
        label: "Session",
        icon: Calendar,
        conferenceType: "all",
      },
      {
        id: "paper-assignment",
        label: "Xếp bài báo",
        icon: ClipboardList,
        conferenceType: "research",
      },
    ],
  },
];

// Helper function to get tabs based on conference type
export function getFilteredTabs(
  groupId: "detail" | "action",
  conferenceType: "technical" | "research" | null
): TabConfig[] {
  const group = TAB_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];

  return group.tabs.filter((tab) => {
    if (!conferenceType) return true;
    if (tab.conferenceType === "all") return true;
    return tab.conferenceType === conferenceType;
  });
}
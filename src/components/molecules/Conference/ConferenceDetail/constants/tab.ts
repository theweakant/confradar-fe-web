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
  | "customers"
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
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface TabConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
  conferenceType?: "technical" | "research" | "all";
  roles?: string[];
}

export interface TabGroup {
  id: "detail" | "action";
  label: string;
  icon: LucideIcon;
  tabs: TabConfig[];
}

export const TAB_GROUPS: TabGroup[] = [
  {
    id: "detail",
    label: "Tổng quan",
    icon: Info,
    tabs: [
      { 
        id: "research-info",
        label: "Thông tin",
        icon: BookOpen,
        conferenceType: "research",
      },
      {
        id: "price",
        label: "Giá vé",
        icon: DollarSign,
        conferenceType: "all",
      },
      {
        id: "refund-policy",
        label: "Chính sách",
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
        label: "Tài liệu",
        icon: FileText,
        conferenceType: "research",
      },
      {
        id: "session",
        label: "Session",
        icon: Calendar,
        conferenceType: "all",
      },
      {
        id: "customers",
        label: "Người mua",
        icon: Calendar,
        conferenceType: "all",
      },
    ],
  },
  {
    id: "action",
    label: "Quản lí",
    icon: Activity,
    tabs: [
      {
        id: "refund-requests",
        label: "Hoàn vé",
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
        id: "paper-assignment",
        label: "Xếp bài báo",
        icon: ClipboardList,
        conferenceType: "research",
      },
      {
        id: "research-timeline",
        label: "Timeline",
        icon: Clock,
        conferenceType: "research",
      },
      {
        id: "paper-phase",
        label: "Bài báo",
        icon: FileText,
        conferenceType: "research",
      },
    ],
  },
];

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
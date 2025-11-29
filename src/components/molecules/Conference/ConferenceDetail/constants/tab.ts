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
  FileSignature, // 👈 Icon cho hợp đồng
} from "lucide-react";

// Giả sử TabId được export từ file khác (như bạn đã dùng)
// Nếu bạn muốn định nghĩa TabId trong file này, hãy bỏ comment dòng dưới
// và xóa import { TabId } ở nơi dùng (nhưng bạn đang import từ "../constants/tab")
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
  | "paper-assignment"
  | "contract"; // 👈 ĐÃ THÊM

type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface TabConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
  conferenceType?: "technical" | "research" | "all";
  roles?: string[]; // 👈 thêm roles
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
        label: "Chi phí",
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
      // 👇 TAB HỢP ĐỒNG - CHỈ TECH & COLLABORATOR
      {
        id: "contract",
        label: "Hợp đồng",
        icon: FileSignature,
        conferenceType: "technical",
        roles: ["Collaborator"],
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
        label: "Hoàn tiền",
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
  conferenceType: "technical" | "research" | null,
  userRoles: string[] = []
): TabConfig[] {
  const group = TAB_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];

  return group.tabs.filter((tab) => {
    if (!conferenceType) return true;
    if (tab.conferenceType === "all") return true;
    if (tab.conferenceType !== conferenceType) return false;

    if (tab.roles && tab.roles.length > 0) {
      return tab.roles.some((requiredRole) => userRoles.includes(requiredRole));
    }

    return true;
  });
}
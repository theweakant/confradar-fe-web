// Conference base interface (dùng chung)
export interface Conference {
  conferenceId: string;
  conferenceName: string;
  description: string;
  startDate: string; // ISO date: "2026-04-21"
  endDate: string; // ISO date
  totalSlot: number;
  availableSlot: number;
  address: string;
  bannerImageUrl: string;
  createdAt: string; // ISO datetime
  ticketSaleStart: string; // ISO date
  ticketSaleEnd: string; // ISO date
  isInternalHosted: boolean;
  isResearchConference: boolean;
  cityId: string;
  createdBy: string;
  conferenceCategoryId: string;
  conferenceStatusId: string;
}

// Group theo trạng thái
export interface GroupByStatusItem {
  groupId: string;
  groupName: string; // e.g., "Preparing", "Ready"
  count: number;
  conferences: Conference[];
}

// Response chính cho thống kê theo status
export interface DashboardConferencesGroupByStatusResponse {
  total: number;
  groupByStatus: GroupByStatusItem[];
}

// ================
// Các interface khác bạn đã gửi — giữ nguyên
// ================

export interface UpcomingConference {
  conferenceId: string;
  conferenceName: string;
  bannerImageUrl: string;
  startDate: string;
  endDate: string;
  daysUntilStart: number;
  statusName: string;
}

export interface TopRegisteredConference {
  conferenceId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSlot: number;
  purchaseSlot: number;
  occupancyRate: number;
}

export interface TopRegisteredConferencesResponse {
  conferenceRegisters: TopRegisteredConference[];
}

export interface MonthlyStat {
  month: string; // e.g., "2025-11"
  revenue: number;
  ticketsSold: number;
}

export interface RevenueStatsResponse {
  totalRevenue: number;
  totalTicketsSold: number;
  monthlyStats: MonthlyStat[];
}
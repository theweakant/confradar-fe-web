export interface AuditLogItem {
    auditLogId: string;
    userId: string;
    userFullName: string;
    userAvatarUrl: string | null;
    categoryId: string;
    categoryName: string;
    actionDescription: string;
    createdAt: string;
}

export interface AuditLogCategory {
    categoryId: string;
    name: string;
    auditLogs: AuditLogItem[];
}


export interface RecentAuditLogItem {
  auditLogId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  categoryId: string;
  categoryName: string;
  actionDescription: string;
  createdAt: string; 
}

export interface RecentReportItem {
  reportId: string;
  reportSubject: string;
  reason: string;
  description: string;
  hasResolve: boolean;
  createdAt: string;
  reportFeedbackId: string;
  reportFeedbackSubject: string;
  reportFeedbackReason: string;
  reportFeedbackAdminId: string;
  reporterAvatarUrl: string | null;
  reporterFullName: string;
  reporterEmail: string;
  reporterId: string;
}

export type TotalUsersResponse = number;

export interface InternalEventCount {
  totalInternal: number;
  totalActiveInternalResearch: number;
  totalActiveInternalTech: number;
}

export interface ExternalEventCount {
  totalExternal: number;
  totalActiveExternalResearch: number;
  totalActiveExternalTech: number;
}
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

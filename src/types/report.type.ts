export interface ReportRequest {
    reportSubject: string;
    reason: string;
    description: string;
}

export interface UnresolvedReportResponse {
    reportId: string;
    reportSubject?: string;
    reason?: string;
    description?: string;
    createdAt?: string | null;
    userId?: string;
    user?: UserResponse;
}

export interface UserResponse {
    userId: string;
    userName?: string;
    email?: string;
    fullName?: string;
}

export interface ReportResponseRequest {
    reportSubject: string;
    reason: string;
}

export interface ReportFeedbackResponse {
    reportId: string;
    reportSubject?: string;
    reason?: string;
    adminId?: string;
    admin?: UserResponse;
}
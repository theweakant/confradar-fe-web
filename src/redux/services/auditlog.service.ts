import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { ApiResponse } from "@/types/api.type";
import {
  AuditLogItem,
  AuditLogCategory,
  RecentAuditLogItem,
  RecentReportItem,
  InternalEventCount,
  ExternalEventCount,
} from "@/types/auditlog.type";
import { endpoint } from "../api/endpoint";
import { GeneralFaq } from "@/types/statistics.type";

export const auditLogApi = createApi({
  reducerPath: "auditLogApi",
  baseQuery: apiClient,
  tagTypes: ["AuditLog", "AuditLogCategory", "RecentAudit", "RecentReport"],
  endpoints: (builder) => ({
    // ==== API 1: Lấy danh sách audit logs ====
    getAuditLogs: builder.query<ApiResponse<AuditLogItem[]>, void>({
      query: () => ({
        url: endpoint.AUDIT_LOG.LIST,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ auditLogId }) => ({
                type: "AuditLog" as const,
                id: auditLogId,
              })),
              { type: "AuditLog", id: "LIST" },
            ]
          : [{ type: "AuditLog", id: "LIST" }],
    }),

    // ==== API 2: Lấy danh mục audit log categories ====
    getAuditLogCategories: builder.query<ApiResponse<AuditLogCategory[]>, void>({
      query: () => ({
        url: endpoint.AUDIT_LOG.CATEGORIES,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ categoryId }) => ({
                type: "AuditLogCategory" as const,
                id: categoryId,
              })),
              { type: "AuditLogCategory", id: "LIST" },
            ]
          : [{ type: "AuditLogCategory", id: "LIST" }],
    }),

    // ==== API 3: Lấy recent audit logs (tùy chỉnh row) ====
    getRecentAuditLogs: builder.query<
      ApiResponse<RecentAuditLogItem[]>,
      { row?: number }
    >({
      query: ({ row = 5 }) => ({
        url: endpoint.AUDIT_LOG.LIST_RECENT_AUDIT,
        method: "GET",
        params: { row },
      }),
      providesTags: [{ type: "RecentAudit", id: "LIST" }],
    }),

    // ==== API 4: Lấy recent reports (tùy chỉnh row) ====
    getRecentReports: builder.query<
      ApiResponse<RecentReportItem[]>,
      { row?: number }
    >({
      query: ({ row = 5 }) => ({
        url: endpoint.AUDIT_LOG.LIST_RECENT_REPORT,
        method: "GET",
        params: { row },
      }),
      providesTags: [{ type: "RecentReport", id: "LIST" }],
    }),

    // ==== API 5: Tổng số người dùng ====
    getTotalUsers: builder.query<ApiResponse<number>, void>({
      query: () => ({
        url: endpoint.AUDIT_LOG.TOTAL_USERS,
        method: "GET",
      }),
      providesTags: [{ type: "AuditLog", id: "TOTAL_USERS" }],
    }),

    getTotalUnresolveReports: builder.query<ApiResponse<number>, void>({
    query: () => ({
        url: endpoint.AUDIT_LOG.TOTAL_UNRESOLVE_REPORTS,
        method: "GET",
    }),
    providesTags: [{ type: "AuditLog", id: "TOTAL_UNRESOLVE_REPORTS" }],
    }),

    // ==== API 6: Thống kê hội nghị nội bộ ====
    getInternalEventCount: builder.query<ApiResponse<InternalEventCount>, void>({
      query: () => ({
        url: endpoint.AUDIT_LOG.INTERNAL_EVENT_COUNT,
        method: "GET",
      }),
      providesTags: [{ type: "AuditLog", id: "INTERNAL_EVENT" }],
    }),

    // ==== API 7: Thống kê hội nghị bên ngoài ====
    getExternalEventCount: builder.query<ApiResponse<ExternalEventCount>, void>({
      query: () => ({
        url: endpoint.AUDIT_LOG.EXTERNAL_EVENT_COUNT,
        method: "GET",
      }),
      providesTags: [{ type: "AuditLog", id: "EXTERNAL_EVENT" }],
    }),
    getGeneralFaqs: builder.query<ApiResponse<GeneralFaq[]>, void>({
      query: () => ({
        url: endpoint.AUDIT_LOG.LIST_GENERAL_FAQ,
      }),
    }),
  }),
});

// Export tất cả hooks
export const {
  useGetAuditLogsQuery,
  useLazyGetAuditLogsQuery,
  useGetAuditLogCategoriesQuery,
  useLazyGetAuditLogCategoriesQuery,
  useGetRecentAuditLogsQuery,
  useLazyGetRecentAuditLogsQuery,
  useGetRecentReportsQuery,
  useLazyGetRecentReportsQuery,
  useGetTotalUsersQuery,
  useLazyGetTotalUsersQuery,
useGetTotalUnresolveReportsQuery,
  useLazyGetTotalUnresolveReportsQuery,
  useGetInternalEventCountQuery,
  useLazyGetInternalEventCountQuery,
  useGetExternalEventCountQuery,
  useLazyGetExternalEventCountQuery,
  useGetGeneralFaqsQuery
} = auditLogApi;
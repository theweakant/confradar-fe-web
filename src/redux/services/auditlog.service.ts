import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { ApiResponse } from "@/types/api.type";
import { AuditLogItem, AuditLogCategory } from "@/types/auditlog.type";
import { endpoint } from "../api/endpoint";

export const auditLogApi = createApi({
    reducerPath: "auditLogApi",
    baseQuery: apiClient,
    tagTypes: ["AuditLog", "AuditLogCategory"],
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
    }),
});

export const {
    useGetAuditLogsQuery,
    useLazyGetAuditLogsQuery,
    useGetAuditLogCategoriesQuery,
    useLazyGetAuditLogCategoriesQuery,
} = auditLogApi;

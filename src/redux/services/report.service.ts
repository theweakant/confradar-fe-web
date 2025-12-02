import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { OwnReportResponse, ReportFeedbackResponse, ReportRequest, ReportResponseRequest, UnresolvedReportResponse } from "@/types/report.type";

export const reportApi = createApi({
    reducerPath: "reportApi",
    baseQuery: apiClient,
    tagTypes: ["Report"],
    endpoints: (builder) => ({
        submitReport: builder.mutation<ApiResponse<string>, ReportRequest>({
            query: (data) => ({
                url: endpoint.REPORT.CREATE,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Report"],
        }),

        getUnresolvedReports: builder.query<ApiResponse<UnresolvedReportResponse[]>, void>({
            query: () => ({
                url: endpoint.REPORT.GET_UNRESOLVED,
                method: "GET",
            }),
            providesTags: ["Report"],
        }),

        respondToReport: builder.mutation<
            ApiResponse<string>,
            { reportId: string; data: ReportResponseRequest }
        >({
            query: ({ reportId, data }) => ({
                url: endpoint.REPORT.RESPONSE(reportId),
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Report"],
        }),

        getReportResponses: builder.query<
            ApiResponse<ReportFeedbackResponse>,
            string
        >({
            query: (reportId) => ({
                url: endpoint.REPORT.GET_RESPONSE(reportId),
                method: "GET",
            }),
            providesTags: ["Report"],
        }),

        getOwnReports: builder.query<
            ApiResponse<OwnReportResponse[]>,
            void
        >({
            query: () => ({
                url: endpoint.REPORT.GET_OWN_REPORTS,
                method: "GET",
            }),
            providesTags: ["Report"],
        }),
    }),
});

export const {
    useSubmitReportMutation,
    useGetUnresolvedReportsQuery,
    useLazyGetUnresolvedReportsQuery,
    useRespondToReportMutation,
    useGetReportResponsesQuery,
    useLazyGetReportResponsesQuery,
    useGetOwnReportsQuery,
    useLazyGetOwnReportsQuery,
} = reportApi;

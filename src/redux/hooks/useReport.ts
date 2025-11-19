// src/hooks/useReport.ts
import {
    useSubmitReportMutation,
    useGetUnresolvedReportsQuery,
    useRespondToReportMutation,
    useGetReportResponsesQuery,
    useLazyGetReportResponsesQuery,
    useLazyGetUnresolvedReportsQuery,
} from "@/redux/services/report.service";
import { parseApiError } from "@/helper/api";
import type {
    ApiResponse,
} from "@/types/api.type";
import type {
    ReportRequest,
    ReportResponseRequest,
    UnresolvedReportResponse,
    ReportFeedbackResponse,
} from "@/types/report.type";
import { useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

export const useReport = (reportId?: string) => {
    const [
        submitReport,
        {
            isLoading: submitLoading,
            data: submitData,
            error: submitRawError,
        },
    ] = useSubmitReportMutation();

    const {
        data: unresolvedData,
        isLoading: unresolvedLoading,
        error: unresolvedRawError,
    } = useGetUnresolvedReportsQuery();

    const [
        fetchUnresolvedReports,
        {
            isLoading: lazyUnresolvedLoading,
            data: lazyUnresolvedData,
            error: lazyUnresolvedRawError,
        },
    ] = useLazyGetUnresolvedReportsQuery();

    const [
        respondToReport,
        {
            isLoading: respondLoading,
            data: respondData,
            error: respondRawError,
        },
    ] = useRespondToReportMutation();

    const {
        data: responseData,
        isLoading: responseLoading,
        error: responseRawError,
    } = useGetReportResponsesQuery(reportId ?? skipToken);

    const [
        fetchReportResponses,
        {
            isLoading: lazyResponseLoading,
            data: lazyResponseData,
            error: lazyResponseRawError,
        },
    ] = useLazyGetReportResponsesQuery();

    // -------------------- Error Parsing -------------------- //
    const submitError = parseApiError<string>(submitRawError);
    const unresolvedError = parseApiError<string>(
        unresolvedRawError || lazyUnresolvedRawError
    );
    const respondError = parseApiError<string>(respondRawError);
    const responseError = parseApiError<string>(responseRawError || lazyResponseRawError);

    // -------------------- ACTIONS (async) -------------------- //
    const createReport = async (
        request: ReportRequest,
    ): Promise<ApiResponse<string>> => {
        try {
            const result = await submitReport(request).unwrap();
            return result;
        } catch (err) {
            throw err;
        }
    };


    const getUnresolvedReportsLazy = useCallback(
        async (): Promise<ApiResponse<UnresolvedReportResponse[]>> => {
            try {
                const result = await fetchUnresolvedReports().unwrap();
                return result;
            } catch (err) {
                throw err;
            }
        },
        [fetchUnresolvedReports]
    );



    const sendReportResponse = async (
        reportId: string,
        data: ReportResponseRequest,
    ): Promise<ApiResponse<string>> => {
        try {
            const result = await respondToReport({ reportId, data }).unwrap();
            return result;
        } catch (err) {
            throw err;
        }
    };

    const getSingleReportResponses = useCallback(
        async (reportId: string): Promise<ApiResponse<ReportFeedbackResponse>> => {
            try {
                const result = await fetchReportResponses(reportId).unwrap();
                return result;
            } catch (err) {
                throw err;
            }
        },
        [fetchReportResponses]
    );

    // -------------------- RETURN -------------------- //
    return {
        // ACTIONS
        createReport,
        getUnresolvedReportsLazy,
        sendReportResponse,
        getSingleReportResponses,

        // LOADING
        loading:
            submitLoading ||
            unresolvedLoading ||
            lazyUnresolvedLoading ||
            respondLoading ||
            responseLoading ||
            lazyResponseLoading,

        // ERRORS
        submitError,
        unresolvedError,
        respondError,
        responseError,

        // DATA
        submitReportResponse: submitData,
        unresolvedReports:
            unresolvedData?.data || lazyUnresolvedData?.data || [],
        respondResponse: respondData,
        reportResponse:
            responseData?.data || lazyResponseData?.data || null,
    };
};

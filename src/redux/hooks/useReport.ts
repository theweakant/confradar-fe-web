// src/hooks/useReport.ts
import {
    useSubmitReportMutation,
    useGetUnresolvedReportsQuery,
    useRespondToReportMutation,
    useGetReportResponsesQuery,
    useLazyGetReportResponsesQuery,
    useLazyGetUnresolvedReportsQuery,
    useLazyGetOwnReportsQuery,
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

    //     const {
    //     data: ownReportsData,
    //     isLoading: ownReportsLoading,
    //     error: ownReportsRawError,
    // } = useGetOwnReportsQuery();

    const [
        fetchOwnReports,
        {
            isLoading: lazyOwnReportsLoading,
            data: lazyOwnReportsData,
            error: lazyOwnReportsRawError,
        }
    ] = useLazyGetOwnReportsQuery();

    // -------------------- Error Parsing -------------------- //
    const submitError = parseApiError<string>(submitRawError);
    const unresolvedError = parseApiError<string>(
        unresolvedRawError || lazyUnresolvedRawError
    );
    const respondError = parseApiError<string>(respondRawError);
    const responseError = parseApiError<string>(responseRawError || lazyResponseRawError);
    const ownReportsError = parseApiError<string>(
        lazyOwnReportsRawError
    );

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

    const getOwnReportsLazy = useCallback(
        async (): Promise<ApiResponse<UnresolvedReportResponse[]>> => {
            const result = await fetchOwnReports().unwrap();
            return result;
        },
        [fetchOwnReports]
    );

    // -------------------- RETURN -------------------- //
    return {
        // ACTIONS
        createReport,
        getUnresolvedReportsLazy,
        sendReportResponse,
        getSingleReportResponses,
        getOwnReportsLazy,

        // LOADING
        loading:
            submitLoading ||
            unresolvedLoading ||
            lazyUnresolvedLoading ||
            respondLoading ||
            responseLoading ||
            lazyResponseLoading ||
            // ownReportsLoading ||
            lazyOwnReportsLoading,

        // ERRORS
        submitError,
        unresolvedError,
        respondError,
        responseError,
        ownReportsError,

        // DATA
        submitReportResponse: submitData,
        unresolvedReports:
            unresolvedData?.data || lazyUnresolvedData?.data || [],
        respondResponse: respondData,
        reportResponse:
            responseData?.data || lazyResponseData?.data || null,
        ownReports:
            // ownReportsData?.data || 
            lazyOwnReportsData?.data || [],
    };
};

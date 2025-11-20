import { createApi } from '@reduxjs/toolkit/query/react';
import { apiClient } from '../api/apiClient';
import { endpoint } from '../api/endpoint';
import { ApiResponse } from '@/types/api.type';
import { 
    ChangePresenterRequest, 
    ChangeSessionRequest,
    PendingPresenterChangeResponse,
    PendingSessionChangeResponse,
    ApprovePresenterChangeRequest,
    ApproveSessionChangeRequest
} from '@/types/assigningpresentersession.type';

export const presenterApi = createApi({
    reducerPath: 'presenterApi',
    baseQuery: apiClient,
    tagTypes: ['PresenterChangeRequests', 'SessionChangeRequests'], // Định nghĩa tags
    endpoints: (builder) => ({
        requestChangePresenter: builder.mutation<
            ApiResponse<string>,
            ChangePresenterRequest
        >({
            query: (body) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.REQUEST_CHANGE_PRESENTER,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PresenterChangeRequests'], // Refetch sau khi tạo request mới
        }),

        requestChangeSession: builder.mutation<
            ApiResponse<string>,
            ChangeSessionRequest
        >({
            query: (body) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.REQUEST_CHANGE_SESSION,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SessionChangeRequests'], // Refetch sau khi tạo request mới
        }),

        getPendingPresenterChangeRequests: builder.query<
            ApiResponse<PendingPresenterChangeResponse[]>,
            string
        >({
            query: (confId) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.GET_PENDING_PRESENTER_CHANGE_REQUESTS,
                params: { confId },
            }),
            providesTags: ['PresenterChangeRequests'], // Tag này sẽ bị invalidate
        }),

        getPendingSessionChangeRequests: builder.query<
            ApiResponse<PendingSessionChangeResponse[]>,
            string
        >({
            query: (confId) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.GET_PENDING_SESSION_CHANGE_REQUESTS,
                params: { confId },
            }),
            providesTags: ['SessionChangeRequests'], 
        }),

        approveChangeSession: builder.mutation<
            ApiResponse<string>,
            ApproveSessionChangeRequest
        >({
            query: (body) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.APPROVE_CHANGE_SESSION,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SessionChangeRequests'], 
        }),

        approveChangePresenter: builder.mutation<
            ApiResponse<string>,
            ApprovePresenterChangeRequest
        >({
            query: (body) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.APPROVE_CHANGE_PRESENTER,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PresenterChangeRequests'], 
        }),
    }),
});

export const {
    useRequestChangePresenterMutation,
    useRequestChangeSessionMutation,
    useGetPendingPresenterChangeRequestsQuery,
    useGetPendingSessionChangeRequestsQuery,
    useApproveChangeSessionMutation,
    useApproveChangePresenterMutation,
} = presenterApi;
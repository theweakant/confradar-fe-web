import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiClient } from '../api/apiClient';
import { endpoint } from '../api/endpoint';
import { ApiResponse } from '@/types/api.type';
import { ChangePresenterRequest, ChangeSessionRequest } from '@/types/assigningpresentersession.type';

export const presenterApi = createApi({
    reducerPath: 'presenterApi',
    baseQuery: apiClient,
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
        }),

        requestChangeSession: builder.mutation<
            ApiResponse<string>,
            ChangeSessionRequest
        >({
            query: (body) => ({
                url: endpoint.ASSIGNINGPRESENTERSESSION.REQUEST_CHANGE_SESSION,
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        }),
    }),
});

export const {
    useRequestChangePresenterMutation,
    useRequestChangeSessionMutation,
} = presenterApi;

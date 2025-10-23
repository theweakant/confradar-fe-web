import { ApiResponse } from "@/types/api.type";
import { CreateTechPaymentRequest, Transaction } from "@/types/transaction.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";

export const transactionApi = createApi({
    reducerPath: 'transactionApi',
    baseQuery: apiClient,
    tagTypes: ['Transaction'],
    endpoints: (builder) => ({
        createPaymentForTech: builder.mutation<ApiResponse<string>, CreateTechPaymentRequest>({
            query: (request) => ({
                url: '/payment/pay-tech-with-momo',
                method: 'POST',
                body: request,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    // Payment URL returned, can be used to redirect user
                    if (data.data) {
                        // Optionally handle payment URL
                        console.log('Payment URL:', data.data);
                    }
                } catch (err: any) {
                } finally {
                }
            },
            invalidatesTags: ['Transaction'],
        }),

        getOwnTransaction: builder.query<ApiResponse<Transaction[]>, void>({
            query: () => '/payment/get-own-transaction',
            providesTags: ['Transaction'],
        }),
    }),
});

export const {
    useCreatePaymentForTechMutation,
    useGetOwnTransactionQuery,
    useLazyGetOwnTransactionQuery,
} = transactionApi;
import { ApiResponse } from "@/types/api.type";
import { CreatePaperPaymentRequest, CreateTechPaymentRequest, GeneralPaymentResultResponse, PaymentMethod, Transaction } from "@/types/transaction.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";

export const transactionApi = createApi({
    reducerPath: 'transactionApi',
    baseQuery: apiClient,
    tagTypes: ['Transaction', 'PaymentMethod'],
    endpoints: (builder) => ({
        createPaymentForTech: builder.mutation<ApiResponse<GeneralPaymentResultResponse>, CreateTechPaymentRequest>({
            query: (request) => ({
                url: endpoint.TRANSACTION.CREATE_TECH_PAYMENT,
                method: 'POST',
                body: request,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.data) {
                        console.log('Payment URL:', data.data);
                    }
                } catch (err) {
                } finally {
                }
            },
            invalidatesTags: ['Transaction'],
        }),

        createPaymentForResearchPaper: builder.mutation<ApiResponse<GeneralPaymentResultResponse>, CreatePaperPaymentRequest>({
            query: (request) => ({
                url: endpoint.TRANSACTION.CREATE_RESEARCH_PAPER_PAYMENT,
                method: 'POST',
                body: request,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.data) {
                        console.log('Research Paper Payment URL:', data.data);
                    }
                } catch (err) { }
            },
            invalidatesTags: ['Transaction'],
        }),

        getOwnTransaction: builder.query<ApiResponse<Transaction[]>, void>({
            query: () => endpoint.TRANSACTION.GET_OWN_TRANSACTION,
            providesTags: ['Transaction'],
        }),

        getAllPaymentMethods: builder.query<ApiResponse<PaymentMethod[]>, void>({
            query: () => endpoint.PAYMENT_METHOD.GET_ALL,
            providesTags: ["PaymentMethod"],
        }),
    }),
});

export const {
    useCreatePaymentForTechMutation,
    useCreatePaymentForResearchPaperMutation,
    useGetOwnTransactionQuery,
    useLazyGetOwnTransactionQuery,
    useGetAllPaymentMethodsQuery,
    useLazyGetAllPaymentMethodsQuery,
} = transactionApi;
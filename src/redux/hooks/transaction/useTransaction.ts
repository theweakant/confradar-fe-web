import { useCreatePaymentForTechMutation, useLazyGetOwnTransactionQuery } from "@/redux/services/transaction.service";
import { ApiResponse } from "@/types/api.type";
import { CreateTechPaymentRequest } from "@/types/transaction.type";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const useTransaction = () => {
    const [
        createPaymentMutation,
        { isLoading: paymentLoading, error: paymentRawError, data: paymentData }
    ] = useCreatePaymentForTechMutation();

    const [
        getTransactions,
        { isLoading: transactionsLoading, data: transactionsData, error: transactionsRawError }
    ] = useLazyGetOwnTransactionQuery();

    const parseError = (error: FetchBaseQueryError | SerializedError | undefined): string => {
        if (!error) return 'Có lỗi xảy ra. Vui lòng thử lại.';

        if ('data' in error) {
            const data = error.data as ApiResponse<null>;
            if (data?.message) return data.message;
            if (typeof data === 'string') return data;
        }

        if ('message' in error && error.message) return error.message;

        return 'Có lỗi xảy ra. Vui lòng thử lại.';
    };
    // const parseError = (error: any): string => {
    //     if (error?.data?.Message) {
    //         return error.data.Message;
    //     }
    //     if (error?.data?.message) {
    //         return error.data.message;
    //     }
    //     if (typeof error?.data === 'string') {
    //         return error.data;
    //     }
    //     return 'Có lỗi xảy ra. Vui lòng thử lại.';
    // };

    const paymentError = paymentRawError ? parseError(paymentRawError) : null;
    const transactionsError = transactionsRawError ? parseError(transactionsRawError) : null;

    const purchaseTicket = async (request: CreateTechPaymentRequest) => {
        try {
            const result = await createPaymentMutation(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const fetchTransactions = async () => {
        try {
            const result = await getTransactions().unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    return {
        purchaseTicket,
        fetchTransactions,
        loading: paymentLoading || transactionsLoading,
        // loading: paymentLoading,
        paymentError,
        transactionsError,
        paymentResponse: paymentData,
        transactions: transactionsData?.data || [],
    };
};
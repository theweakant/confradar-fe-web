import { useCreatePaymentForResearchPaperMutation, useCreatePaymentForTechMutation, useLazyGetOwnTransactionQuery } from "@/redux/services/transaction.service";
import { parseApiError } from "@/redux/utils/api";
import { ApiResponse } from "@/types/api.type";
import { CreatePaperPaymentRequest, CreateTechPaymentRequest } from "@/types/transaction.type";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const useTransaction = () => {
    const [
        createTechPayment,
        { isLoading: techPaymentLoading, error: techPaymentRawError, data: techPaymentData },
    ] = useCreatePaymentForTechMutation();

    const [
        createResearchPayment,
        { isLoading: researchPaymentLoading, error: researchPaymentRawError, data: researchPaymentData },
    ] = useCreatePaymentForResearchPaperMutation();

    const [
        getTransactions,
        { isLoading: transactionsLoading, data: transactionsData, error: transactionsRawError }
    ] = useLazyGetOwnTransactionQuery();

    const techPaymentError = parseApiError<string>(techPaymentRawError);
    const researchPaymentError = parseApiError<string>(researchPaymentRawError);
    const transactionsError = parseApiError<string>(transactionsRawError);

    const purchaseTechTicket = async (request: CreateTechPaymentRequest) => {
        try {
            const result = await createTechPayment(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const purchaseResearchPaper = async (request: CreatePaperPaymentRequest): Promise<ApiResponse<string>> => {
        try {
            const result = await createResearchPayment(request).unwrap();
            return result;
        } catch (err) {
            throw err;
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
        // Actions
        purchaseTechTicket,
        purchaseResearchPaper,
        fetchTransactions,

        // loading
        loading: techPaymentLoading || researchPaymentLoading || transactionsLoading,

        //Error
        techPaymentError,
        researchPaymentError,
        transactionsError,

        //Data responses
        techPaymentResponse: techPaymentData,
        researchPaymentResponse: researchPaymentData,
        transactions: transactionsData?.data || [],

        // purchaseTicket,
        // fetchTransactions,
        // loading: paymentLoading || transactionsLoading,
        // // loading: paymentLoading,
        // paymentError,
        // transactionsError,
        // paymentResponse: paymentData,
        // transactions: transactionsData?.data || [],
    };
};
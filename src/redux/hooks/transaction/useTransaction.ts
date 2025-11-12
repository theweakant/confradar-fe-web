import {
  useCreatePaymentForAttendeeResearchMutation,
  useCreatePaymentForResearchPaperMutation,
  useCreatePaymentForTechMutation,
  useGetAllPaymentMethodsQuery,
  useLazyGetAllPaymentMethodsQuery,
  useLazyGetOwnTransactionQuery,
} from "@/redux/services/transaction.service";
import { parseApiError } from "@/helper/api";
import { ApiResponse } from "@/types/api.type";
import {
  CreatePaperPaymentRequest,
  CreateTechPaymentRequest,
  GeneralPaymentResultResponse,
  PaymentMethod,
} from "@/types/transaction.type";

export const useTransaction = () => {
  const [
    createTechPayment,
    {
      isLoading: techPaymentLoading,
      error: techPaymentRawError,
      data: techPaymentData,
    },
  ] = useCreatePaymentForTechMutation();

  const [
    createResearchPayment,
    {
      isLoading: researchPaymentLoading,
      error: researchPaymentRawError,
      data: researchPaymentData,
    },
  ] = useCreatePaymentForResearchPaperMutation();

  const [
    createAttendeeResearchPayment,
    {
      isLoading: attendeeResearchPaymentLoading,
      error: attendeeResearchPaymentRawError,
      data: attendeeResearchPaymentData,
    },
  ] = useCreatePaymentForAttendeeResearchMutation();

  const [
    getTransactions,
    {
      isLoading: transactionsLoading,
      data: transactionsData,
      error: transactionsRawError,
    },
  ] = useLazyGetOwnTransactionQuery();

  const { data, isLoading, error } = useGetAllPaymentMethodsQuery();
  const [
    fetchPaymentMethods,
    { isLoading: lazyLoading, data: lazyData, error: lazyError },
  ] = useLazyGetAllPaymentMethodsQuery();

  const techPaymentError = parseApiError<string>(techPaymentRawError);
  const researchPaymentError = parseApiError<string>(researchPaymentRawError);
  const attendeeResearchPaymentError = parseApiError<string>(attendeeResearchPaymentRawError);
  const transactionsError = parseApiError<string>(transactionsRawError);
  const paymentMethodsError = parseApiError<string>(error || lazyError);

  const purchaseTechTicket = async (
    request: CreateTechPaymentRequest,
  ): Promise<ApiResponse<GeneralPaymentResultResponse>> => {
    try {
      const result = await createTechPayment(request).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const purchaseResearchPaper = async (
    request: CreatePaperPaymentRequest,
  ): Promise<ApiResponse<GeneralPaymentResultResponse>> => {
    try {
      const result = await createResearchPayment(request).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const purchaseAttendeeResearch = async (
    request: CreatePaperPaymentRequest
  ): Promise<ApiResponse<GeneralPaymentResultResponse>> => {
    try {
      const result = await createAttendeeResearchPayment(request).unwrap();
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

  const fetchAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
      const result = await fetchPaymentMethods().unwrap();
      return result.data || [];
    } catch (err) {
      throw err;
    }
  };

  return {
    // Actions
    purchaseTechTicket,
    purchaseResearchPaper,
    purchaseAttendeeResearch,
    fetchTransactions,
    fetchAllPaymentMethods,

    // loading
    loading:
      techPaymentLoading ||
      researchPaymentLoading ||
      attendeeResearchPaymentLoading ||
      transactionsLoading ||
      isLoading ||
      lazyLoading,

    //Error
    techPaymentError,
    researchPaymentError,
    attendeeResearchPaymentError,
    transactionsError,
    paymentMethodsError,

    //Data responses
    techPaymentResponse: techPaymentData,
    researchPaymentResponse: researchPaymentData,
    attendeeResearchPaymentResponse: attendeeResearchPaymentData,
    transactions: transactionsData?.data || [],
    paymentMethods: data?.data || lazyData?.data || [],

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

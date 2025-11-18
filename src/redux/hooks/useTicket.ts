import {
  useGetOwnPaidTicketsQuery,
  useLazyGetOwnPaidTicketsByConferenceQuery,
  useLazyGetOwnPaidTicketsQuery,
  useRefundTicketMutation,
} from "@/redux/services/ticket.service";
import { parseApiError } from "@/helper/api";
import { RefundTicketRequest } from "@/types/ticket.type";

export const useTicket = (filters?: {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
  sessionStartTime?: string;
  sessionEndTime?: string;
}) => {
  const {
    data: ticketsResponse,
    isLoading: ticketsLoading,
    error: ticketsRawError,
    refetch: refetchTickets,
  } = useGetOwnPaidTicketsQuery(filters ?? {});

  const [
    getTickets,
    { isLoading: lazyTicketsLoading, error: lazyTicketsRawError },
  ] = useLazyGetOwnPaidTicketsQuery();

  const [
    refundTicket,
    {
      data: refundData,
      error: refundError,
      isLoading: refunding,
      isSuccess: refundSuccess,
      isError: refundFailed,
    },
  ] = useRefundTicketMutation();

  const [
    getTicketsByConference,
    { isLoading: lazyTicketsByConfLoading, error: lazyTicketsByConfError },
  ] = useLazyGetOwnPaidTicketsByConferenceQuery();

  const ticketsError = parseApiError<string>(ticketsRawError);
  const lazyTicketsError = parseApiError<string>(lazyTicketsRawError);
  const refundParsedError = parseApiError<string>(refundError);
  const lazyTicketsByConfParsedError = parseApiError<string>(lazyTicketsByConfError);

  const fetchTickets = async (params?: typeof filters) => {
    try {
      const result = await getTickets(params ?? {}).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleRefundTicket = async (request: RefundTicketRequest) => {
    try {
      const res = await refundTicket(request).unwrap();
      return res;
    } catch (error) {
      throw error;
    }
  };

  const fetchTicketsByConference = async (conferenceId: string | number, params?: typeof filters) => {
    try {
      const result = await getTicketsByConference({ conferenceId, ...params }).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data
    tickets: ticketsResponse?.data?.items ?? [],
    totalPages: ticketsResponse?.data?.totalPages ?? 1,
    totalCount: ticketsResponse?.data?.totalCount ?? 0,

    // Methods
    fetchTickets,
    fetchTicketsByConference,
    refetchTickets,
    handleRefundTicket,

    // Loading states
    loading: ticketsLoading || lazyTicketsLoading,
    refunding,
    loadingByConference: lazyTicketsByConfLoading,

    // Errors
    ticketsError: ticketsError || lazyTicketsError,
    refundError: refundParsedError,
    ticketsByConferenceError: lazyTicketsByConfParsedError,
  };
};

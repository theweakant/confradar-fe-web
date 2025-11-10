import {
  useGetOwnPaidTicketsQuery,
  useLazyGetOwnPaidTicketsQuery,
} from "@/redux/services/ticket.service";
import { parseApiError } from "@/helper/api";

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

  const ticketsError = parseApiError<string>(ticketsRawError);
  const lazyTicketsError = parseApiError<string>(lazyTicketsRawError);

  const fetchTickets = async (params?: typeof filters) => {
    try {
      const result = await getTickets(params ?? {}).unwrap();
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
    refetchTickets,

    // Loading states
    loading: ticketsLoading || lazyTicketsLoading,

    // Errors
    ticketsError: ticketsError || lazyTicketsError,
  };
};

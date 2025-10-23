import { useGetOwnPaidTicketsQuery, useLazyGetOwnPaidTicketsQuery } from '@/redux/services/ticket.service';
import { useEffect } from 'react';


export const useTicket = () => {
    const {
        data: ticketsData,
        isLoading: ticketsLoading,
        error: ticketsRawError,
        refetch: refetchTickets
    } = useGetOwnPaidTicketsQuery();

    const [
        getTickets,
        { isLoading: lazyTicketsLoading, error: lazyTicketsRawError }
    ] = useLazyGetOwnPaidTicketsQuery();

    // const [
    //     getTicketById,
    //     { isLoading: ticketByIdLoading, error: ticketByIdRawError }
    // ] = useLazyGetTicketByIdQuery();

    // Parse error function
    const parseError = (error: any): string => {
        if (error?.data?.Message) {
            return error.data.Message;
        }
        if (error?.data?.message) {
            return error.data.message;
        }
        if (typeof error?.data === 'string') {
            return error.data;
        }
        return 'Có lỗi xảy ra. Vui lòng thử lại.';
    };

    // Parse errors
    const ticketsError = ticketsRawError ? parseError(ticketsRawError) : null;
    const lazyTicketsError = lazyTicketsRawError ? parseError(lazyTicketsRawError) : null;
    // const ticketByIdError = ticketByIdRawError ? parseError(ticketByIdRawError) : null;

    // Fetch tickets handler
    const fetchTickets = async () => {
        try {
            const result = await getTickets().unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    // Fetch ticket by ID handler
    // const fetchTicketById = async (id: string) => {
    //     try {
    //         const result = await getTicketById(id).unwrap();
    //         return result;
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    return {

        // Data
        tickets: ticketsData?.data || [],
        ticketsResponse: ticketsData,

        // Methods
        fetchTickets,
        // fetchTicketById,
        refetchTickets,

        // Loading states
        // loading: paymentLoading || transactionsLoading || ticketsLoading || lazyTicketsLoading || ticketByIdLoading,
        loading: ticketsLoading || lazyTicketsLoading,
        // ticketsLoading,

        // Errors
        ticketsError: ticketsError || lazyTicketsError,
        // ticketByIdError,
    };
};
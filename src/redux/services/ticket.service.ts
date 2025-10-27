import { ApiResponse } from "@/types/api.type";
// import { CreateTechPaymentRequest } from "@/types/transaction.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { Ticket } from "@/types/ticket.type";

export const ticketApi = createApi({
    reducerPath: 'ticketApi',
    baseQuery: apiClient,
    tagTypes: ['Ticket'],
    endpoints: (builder) => ({
        // Get own paid tickets
        getOwnPaidTickets: builder.query<ApiResponse<Ticket[]>, void>({
            query: () => ({
                url: '/Ticket/get-own-paid-ticket',
                method: 'GET',
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ ticketId }) => ({
                            type: 'Ticket' as const,
                            id: ticketId,
                        })),
                        { type: 'Ticket', id: 'LIST' },
                    ]
                    : [{ type: 'Ticket', id: 'LIST' }],
        }),

        // Get ticket by ID
        // getTicketById: builder.query<ApiResponse<Ticket>, string>({
        //     query: (id) => ({
        //         url: `/ticket/${id}`,
        //         method: 'GET',
        //     }),
        //     providesTags: (result, error, id) => [{ type: 'Ticket', id }],
        // }),
    }),
});

export const {
    useGetOwnPaidTicketsQuery,
    useLazyGetOwnPaidTicketsQuery,
    // useGetTicketByIdQuery,
    // useLazyGetTicketByIdQuery,
} = ticketApi;
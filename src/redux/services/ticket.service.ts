import { ApiResponse, ApiResponsePagination } from "@/types/api.type";
// import { CreateTechPaymentRequest } from "@/types/transaction.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { CustomerPaidTicketResponse } from "@/types/ticket.type";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: apiClient,
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    getOwnPaidTickets: builder.query<
      ApiResponsePagination<CustomerPaidTicketResponse[]>,
      {
        keyword?: string;
        pageNumber?: number;
        pageSize?: number;
        sessionStartTime?: string;
        sessionEndTime?: string;
      }
    >({
      query: ({
        keyword,
        pageNumber = 1,
        pageSize = 10,
        sessionStartTime,
        sessionEndTime,
      } = {}) => ({
        url: "/Ticket/get-own-paid-ticket",
        method: "GET",
        params: {
          keyword,
          pageNumber,
          pageSize,
          sessionStartTime,
          sessionEndTime,
        },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ ticketId }) => ({
                type: "Ticket" as const,
                id: ticketId,
              })),
              { type: "Ticket", id: "LIST" },
            ]
          : [{ type: "Ticket", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOwnPaidTicketsQuery,
  useLazyGetOwnPaidTicketsQuery,
  // useGetTicketByIdQuery,
  // useLazyGetTicketByIdQuery,
} = ticketApi;

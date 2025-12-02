import { ApiResponse, ApiResponsePagination } from "@/types/api.type";
// import { CreateTechPaymentRequest } from "@/types/transaction.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { CustomerPaidTicketResponse, RefundTicketRequest, CancelTicketRequest } from "@/types/ticket.type";

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

    refundTicket: builder.mutation<ApiResponse<number>, RefundTicketRequest>({
      query: (body) => ({
        url: "/Ticket/refund-ticket",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    getOwnPaidTicketsByConference: builder.query<
      ApiResponsePagination<CustomerPaidTicketResponse[]>,
      {
        conferenceId: number | string;
        keyword?: string;
        pageNumber?: number;
        pageSize?: number;
        sessionStartTime?: string | number;
        sessionEndTime?: string | number;
      }
    >({
      query: ({
        conferenceId,
        keyword,
        pageNumber = 1,
        pageSize = 10,
        sessionStartTime,
        sessionEndTime,
      }) => ({
        url: "/ticket/get-own-paid-ticket-by-conference",
        method: "GET",
        params: { conferenceId, keyword, pageNumber, pageSize, sessionStartTime, sessionEndTime },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data.items.map(({ ticketId }) => ({ type: "Ticket" as const, id: ticketId })),
            { type: "Ticket", id: "LIST" },
          ]
          : [{ type: "Ticket", id: "LIST" }],
    }),


    cancelResearchTicket: builder.mutation<ApiResponse<void>, CancelTicketRequest>({
      query: (body) => ({
        url: "/ticket/cancel-research",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { ticketIds }) =>
        ticketIds
          .map((id) => ({ type: "Ticket" as const, id }))
          .concat({ type: "Ticket", id: "LIST" }),
    }),

    cancelTechnicalTicket: builder.mutation<ApiResponse<void>, CancelTicketRequest>({
      query: (body) => ({
        url: "/ticket/cancel-technical",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { ticketIds }) =>
        ticketIds
          .map((id) => ({ type: "Ticket" as const, id }))
          .concat({ type: "Ticket", id: "LIST" }),
    }),
  }),
});

export const {
  useGetOwnPaidTicketsQuery,
  useLazyGetOwnPaidTicketsQuery,
  useRefundTicketMutation,
  useGetOwnPaidTicketsByConferenceQuery,
  useLazyGetOwnPaidTicketsByConferenceQuery,
  // useGetTicketByIdQuery,
  // useLazyGetTicketByIdQuery,
  useCancelResearchTicketMutation,
  useCancelTechnicalTicketMutation,
} = ticketApi;

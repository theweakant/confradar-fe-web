// statisticsApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { apiClient } from '../api/apiClient';
import { endpoint } from '../api/endpoint';
import { ApiResponse } from '@/types/api.type';
import {
  SoldTicketResponse,
  SubmittedPapersResponse,
  ReviewerAssignment,
  PresentSessionResponse,
  TicketHolderPagination,
  TransactionHistoryResponse,
} from '@/types/statistics.type';

export const statisticsApi = createApi({
  reducerPath: 'statisticsApi',
  baseQuery: apiClient,
  endpoints: (builder) => ({
    
    getSoldTicket: builder.query<ApiResponse<SoldTicketResponse>, string>({
      query: (confId) => ({
        url: endpoint.STATISTICS.SOLD_TICKET,
        params: { confId },
      }),
    }),

  getTicketHolders: builder.query<ApiResponse<TicketHolderPagination>, string>({
    query: (conferenceId) => ({
      url: endpoint.STATISTICS.TICKET_HOLDERS,
      params: { conferenceId }, 
    }),
  }),

    exportSoldTicket: builder.query<Blob, string>({
      query: (confId) => ({
        url: endpoint.STATISTICS.EXPORT_SOLD_TICKET,
        params: { confId },
        responseHandler: (response) => response.blob(),
        cache: 'no-cache',
      }),
    }),

    getSubmittedPapers: builder.query<ApiResponse<SubmittedPapersResponse>, string>({
      query: (confId) => ({
        url: endpoint.STATISTICS.SUBMITTED_PAPERS,
        params: { confId },
      }),
    }),

    getAssignReviewers: builder.query<ApiResponse<ReviewerAssignment[]>, string>({
      query: (confId) => ({
        url: endpoint.STATISTICS.ASSIGN_REVIEWERS,
        params: { confId },
      }),
    }),

    getPresentSession: builder.query<ApiResponse<PresentSessionResponse>, string>({
      query: (confId) => ({
        url: endpoint.STATISTICS.PRESENT_SESSION,
        params: { confId },
      }),
    }),
    getTransactionHistory: builder.query<ApiResponse<TransactionHistoryResponse>, string>({
      query: (confId) => ({
        url: endpoint.STATISTICS.TRANSACTION_HISTORY,
        params: { confId },
      }),
    }),
  }),
});

export const {
  useGetSoldTicketQuery,
  useGetTicketHoldersQuery,
  useExportSoldTicketQuery,
  useGetSubmittedPapersQuery,
  useGetAssignReviewersQuery,
  useGetPresentSessionQuery,
  useGetTransactionHistoryQuery
} = statisticsApi;
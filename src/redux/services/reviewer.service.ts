// src/api/reviewerApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { apiClient } from '../api/apiClient';
import { endpoint } from '../api/endpoint';
import { ApiResponse } from '@/types/api.type';
import {
  AssignedPapersResponse,
  ReviewedPapersResponse,
  PendingReviewPapersResponse,
} from '@/types/reviewer.type';

export const reviewerApi = createApi({
  reducerPath: 'reviewerApi',
  baseQuery: apiClient,
  endpoints: (builder) => ({
    getAssignedPapers: builder.query<ApiResponse<AssignedPapersResponse>, void>({
      query: () => ({ url: endpoint.REVIEWER.STATS.ASSIGNED }),
    }),

    getReviewedPapers: builder.query<ApiResponse<ReviewedPapersResponse>, void>({
      query: () => ({ url: endpoint.REVIEWER.STATS.REVIEWED }),
    }),

    getPendingReviewPapers: builder.query<ApiResponse<PendingReviewPapersResponse>, void>({
      query: () => ({ url: endpoint.REVIEWER.STATS.PENDING_REVIEWS }),
    }),
  }),
});

export const {
  useGetAssignedPapersQuery,
  useGetReviewedPapersQuery,
  useGetPendingReviewPapersQuery,
} = reviewerApi;
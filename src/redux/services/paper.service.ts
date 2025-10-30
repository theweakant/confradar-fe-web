  import { createApi } from "@reduxjs/toolkit/query/react";
  import { apiClient } from "../api/apiClient";
  import { endpoint } from "../api/endpoint";
  import {PendingAbstract,ListPaper}from "@/types/paper.type"
  import type { ApiResponse } from "@/types/api.type";

  export const paperApi = createApi({
    reducerPath: "paperApi",
    baseQuery: apiClient,
    tagTypes: ["Paper"],
    endpoints: (builder) => ({

      listPendingAbstracts: builder.query<ApiResponse<PendingAbstract[]>, void>({
        query: () => ({
          url: endpoint.PAPER.LIST_PENDING_ABSTRACT,
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),

      listAllPapers: builder.query<ApiResponse<ListPaper[]>, void>({
        query: () => ({
          url: endpoint.PAPER.LIST_ALL_PAPERS,
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),


      decideAbstractStatus: builder.mutation<
        ApiResponse<any>,
        { paperId: string; abstractId: string; globalStatus: string }
      >({
        query: (body) => ({
          url: endpoint.PAPER.DECIDE_ABSTRACT,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["Paper"],
      }),

      assignPaperToReviewer: builder.mutation<
        ApiResponse<any>,
        { userId: string; paperId: string; isHeadReviewer: boolean }
      >({
        query: (body) => ({
          url: endpoint.PAPER.ASSIGN_PAPER_TO_REVIEWER,
          method: "POST",
          body, 
        }),
        invalidatesTags: ["Paper"],
      }),


    }),
  });

  export const {
    useListAllPapersQuery,
    useListPendingAbstractsQuery,
    useDecideAbstractStatusMutation,
    useAssignPaperToReviewerMutation,
  } = paperApi;
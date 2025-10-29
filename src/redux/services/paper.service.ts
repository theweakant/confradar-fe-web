  import { createApi } from "@reduxjs/toolkit/query/react";
  import { apiClient } from "../api/apiClient";
  import { endpoint } from "../api/endpoint";
  import type { ApiResponse } from "@/types/api.type";

  export const paperApi = createApi({
    reducerPath: "paperApi",
    baseQuery: apiClient,
    tagTypes: ["Paper"],
    endpoints: (builder) => ({
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
    useDecideAbstractStatusMutation,
    useAssignPaperToReviewerMutation,
  } = paperApi;
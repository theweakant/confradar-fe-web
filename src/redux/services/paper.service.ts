import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import { AvailableCustomerResponse, CreateAbstractRequest, CreateCameraReadyRequest, CreateFullPaperRequest, CreateRevisionPaperSubmissionRequest, CreateRevisionPaperSubmissionResponse, PaperCustomer, PaperDetailResponse, PaperPhase } from "@/types/paper.type";

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

    listSubmittedPapersForCustomer: builder.query<
      ApiResponse<PaperCustomer[]>,
      void
    >({
      query: () => ({
        url: endpoint.PAPER.LIST_SUBMITTED_PAPERS_CUSTOMER,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    getPaperDetailCustomer: builder.query<
      ApiResponse<PaperDetailResponse>,
      string
    >({
      query: (paperId) => ({
        url: `${endpoint.PAPER.GET_PAPER_DETAIL_CUSTOMER}?paperId=${paperId}`,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    listPaperPhases: builder.query<ApiResponse<PaperPhase[]>, void>({
      query: () => ({
        url: endpoint.PAPER.LIST_PAPER_PHASES,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    submitAbstract: builder.mutation<ApiResponse<number>, CreateAbstractRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append("abstractFile", body.abstractFile);
        formData.append("paperId", body.paperId);
        body.coAuthorId.forEach((id) => {
          formData.append("coAuthorId", id);
        });

        return {
          url: endpoint.PAPER.SUBMIT_ABSTRACT,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),

    listAvailableCustomers: builder.query<
      ApiResponse<AvailableCustomerResponse[]>,
      void
    >({
      query: () => ({
        url: endpoint.PAPER.LIST_AVAILABLE_CUSTOMERS,
        method: "GET",
      }),
    }),

    submitFullPaper: builder.mutation<ApiResponse<number>, CreateFullPaperRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append("fullPaperFile", body.fullPaperFile);
        formData.append("paperId", body.paperId);

        return {
          url: endpoint.PAPER.SUBMIT_FULLPAPER,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),

    submitPaperRevision: builder.mutation<
      ApiResponse<number>,
      CreateRevisionPaperSubmissionRequest
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("revisionPaperFile", body.revisionPaperFile);
        formData.append("paperId", body.paperId);

        return {
          url: endpoint.PAPER.SUBMIT_PAPER_REVISION,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),

    submitPaperRevisionResponse: builder.mutation<
      ApiResponse<number>,
      CreateRevisionPaperSubmissionResponse
    >({
      query: (body) => ({
        url: endpoint.PAPER.SUBMIT_PAPER_REVISION_RESPONSE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    submitCameraReady: builder.mutation<ApiResponse<string>, CreateCameraReadyRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append("cameraReadyFile", body.cameraReadyFile);
        formData.append("paperId", body.paperId);

        return {
          url: endpoint.PAPER.SUBMIT_CAMERA_READY,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),
  }),
});

export const {
  useDecideAbstractStatusMutation,
  useAssignPaperToReviewerMutation,
  useListSubmittedPapersForCustomerQuery,
  useGetPaperDetailCustomerQuery,
  useLazyGetPaperDetailCustomerQuery,
  useListPaperPhasesQuery,
  useSubmitAbstractMutation,
  useListAvailableCustomersQuery,
  useLazyListAvailableCustomersQuery,
  useSubmitFullPaperMutation,
  useSubmitPaperRevisionMutation,
  useSubmitPaperRevisionResponseMutation,
  useSubmitCameraReadyMutation,
} = paperApi;
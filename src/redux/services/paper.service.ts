import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import {
  PendingAbstract,
  UnassignAbstract,
  ListPaper,
  FullPaperReview,
  PendingCameraReady,
  AssignedPaper,
  PaperDetailForReviewer,
  SubmitFullPaperReviewRequest,
  SubmitPaperRevisionReviewRequest, //REVISION
  ListRevisionPaperReview, //REVISION
  SubmitPaperRevisionFeedbackRequest, //REVISION
  AvailableCustomerResponse,
  CreateAbstractRequest,
  CreateCameraReadyRequest,
  CreateFullPaperRequest,
  CreateRevisionPaperSubmissionRequest,
  CreateRevisionPaperSubmissionResponse,
  PaperCustomer,
  PaperDetailResponse,
  PaperPhase,
  AssignedPaperGroup,
} from "@/types/paper.type";

import type { ApiResponse } from "@/types/api.type";
import {
  CustomerWaitListResponse,
  LeaveWaitListRequest,
} from "@/types/waitlist.type";

export const paperApi = createApi({
  reducerPath: "paperApi",
  baseQuery: apiClient,
  tagTypes: ["Paper"],
  endpoints: (builder) => ({
    listAllPapers: builder.query<ApiResponse<ListPaper[]>, void>({
      query: () => ({
        url: endpoint.PAPER.LIST_ALL_PAPERS,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    listPendingAbstracts: builder.query<
      ApiResponse<PendingAbstract[]>, string>({
        query: (confId?: string) => ({
          url: endpoint.PAPER.LIST_PENDING_ABSTRACT(confId),
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),

    listUnassignAbstracts: builder.query<ApiResponse<UnassignAbstract[]>, void>(
      {
        query: () => ({
          url: endpoint.PAPER.LIST_UNASSIGN_ABSTRACT,
          method: "GET",
        }),
        providesTags: ["Paper"],
      },
    ),

    listAssignedPapers: builder.query<ApiResponse<AssignedPaperGroup[]>, { confId?: string } | void>({
      query: (arg) => {
        const confId = arg?.confId;
        return {
          url: endpoint.PAPER.LIST_ASSIGN_PAPER_REVIEWER,
          method: "GET",
          params: confId ? { confId } : {},
        };
      },
      providesTags: ["Paper"],
    }),

    listPendingCameraReady: builder.query<
      ApiResponse<PendingCameraReady[]>,
      void
    >({
      query: () => ({
        url: endpoint.PAPER.LIST_PENDING_CAMERA_READY,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    decideAbstractStatus: builder.mutation<
      ApiResponse<unknown>,
      { paperId: string; abstractId: string; globalStatus: string }
    >({
      query: (body) => ({
        url: endpoint.PAPER.DECIDE_ABSTRACT,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    decideCameraReady: builder.mutation<
      ApiResponse<unknown>,
      { cameraReadyId: string; globalStatus: string; paperid: string }
    >({
      query: (body) => ({
        url: endpoint.PAPER.DECIDE_CAMERA_READY,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    assignPaperToReviewer: builder.mutation<
      ApiResponse<unknown>,
      { userId: string; paperId: string; isHeadReviewer: boolean }
    >({
      query: (body) => ({
        url: endpoint.PAPER.ASSIGN_PAPER_TO_REVIEWER,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    getPaperDetailForReviewer: builder.query<
      ApiResponse<PaperDetailForReviewer>,
      string
    >({
      query: (paperId) => ({
        url: endpoint.PAPER.GET_PAPER_DETAIL_REVIEWER(paperId),
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    submitFullPaperReview: builder.mutation<
      ApiResponse<unknown>,
      SubmitFullPaperReviewRequest
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("fullPaperId", body.fullPaperId);
        formData.append("note", body.note);
        formData.append("feedbackToAuthor", body.feedbackToAuthor);
        formData.append("reviewStatus", body.reviewStatus);

        if (body.feedbackMaterialFile) {
          formData.append("feedbackMaterialFile", body.feedbackMaterialFile);
        }

        return {
          url: endpoint.PAPER.SUBMIT_FULLPAPER_REVIEW,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),

    getFullPaperReviews: builder.query<ApiResponse<FullPaperReview[]>, string>({
      query: (fullPaperId) => ({
        url: endpoint.PAPER.LIST_FULLPAPER_REVIEWS(fullPaperId),
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    decideFullPaperStatus: builder.mutation<
      ApiResponse<unknown>,
      { paperId: string; fullPaperId: string; reviewStatus: string }
    >({
      query: (body) => ({
        url: endpoint.PAPER.DECIDE_FULLPAPER_STATUS,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    submitPaperRevisionReview: builder.mutation<
      ApiResponse<unknown>,
      SubmitPaperRevisionReviewRequest
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("paperId", body.paperId);
        formData.append("revisionPaperId", body.revisionPaperId);
        formData.append("globalStatus", body.globalStatus);
        formData.append("note", body.note);
        formData.append("feedbackToAuthor", body.feedbackToAuthor);
        if (body.feedbackMaterialFile) {
          formData.append("feedbackMaterialFile", body.feedbackMaterialFile);
        }

        return {
          url: endpoint.PAPER.SUBMIT_PAPER_REVISION_REVIEW,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),

    listRevisionPaperReviews: builder.query<
      ApiResponse<ListRevisionPaperReview[]>,
      { revisionPaperId: string; paperId: string }
    >({
      query: ({ revisionPaperId, paperId }) => ({
        url: endpoint.PAPER.LIST_REVISION_PAPER_REVIEW,
        method: "GET",
        params: { revisionPaperId, paperId },
      }),
      providesTags: ["Paper"],
    }),

    decideRevisionStatus: builder.mutation<
      ApiResponse<unknown>,
      { revisionPaperId: string; paperId: string; globalStatus: string }
    >({
      query: (body) => ({
        url: endpoint.PAPER.DECIDE_REVISION_STATUS,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    submitPaperRevisionFeedback: builder.mutation<
      ApiResponse<unknown>,
      SubmitPaperRevisionFeedbackRequest
    >({
      query: (body) => ({
        url: endpoint.PAPER.SUBMIT_PAPER_REVISION_FEEDBACK,
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

    submitAbstract: builder.mutation<
      ApiResponse<number>,
      CreateAbstractRequest
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("abstractFile", body.abstractFile);
        formData.append("paperId", body.paperId);
        formData.append("title", body.title);
        formData.append("description", body.description);
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

    submitFullPaper: builder.mutation<
      ApiResponse<number>,
      CreateFullPaperRequest
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("fullPaperFile", body.fullPaperFile);
        formData.append("paperId", body.paperId);
        formData.append("title", body.title);
        formData.append("description", body.description);

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
        formData.append("title", body.title);
        formData.append("description", body.description);

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
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Paper"],
    }),

    submitCameraReady: builder.mutation<
      ApiResponse<string>,
      CreateCameraReadyRequest
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("cameraReadyFile", body.cameraReadyFile);
        formData.append("paperId", body.paperId);
        formData.append("title", body.title);
        formData.append("description", body.description);

        return {
          url: endpoint.PAPER.SUBMIT_CAMERA_READY,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Paper"],
    }),

    listCustomerWaitList: builder.query<
      ApiResponse<CustomerWaitListResponse[]>,
      void
    >({
      query: () => ({
        url: endpoint.PAPER.LIST_CUSTOMER_WAITLIST,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    addToWaitList: builder.mutation<ApiResponse<boolean>, LeaveWaitListRequest>(
      {
        query: (body) => ({
          url: endpoint.PAPER.ADD_TO_WAITLIST,
          method: "POST",
          body,
        }),
        invalidatesTags: ["Paper"],
      },
    ),

    leaveWaitList: builder.mutation<ApiResponse<boolean>, LeaveWaitListRequest>(
      {
        query: (body) => ({
          url: endpoint.PAPER.LEAVE_WAITLIST,
          method: "DELETE",
          body,
        }),
        invalidatesTags: ["Paper"],
      },
    ),
  }),
});

export const {
  useListAllPapersQuery,
  useListPendingAbstractsQuery,
  useListUnassignAbstractsQuery,
  useListAssignedPapersQuery,
  useDecideAbstractStatusMutation,
  useAssignPaperToReviewerMutation,

  //FULL PAPER
  useGetPaperDetailForReviewerQuery,
  useLazyGetPaperDetailForReviewerQuery,
  useSubmitFullPaperReviewMutation,
  useGetFullPaperReviewsQuery,
  useDecideFullPaperStatusMutation,

  //CAMERA READY
  useListPendingCameraReadyQuery,
  useDecideCameraReadyMutation,

  //REVISION
  useSubmitPaperRevisionReviewMutation,
  useListRevisionPaperReviewsQuery,
  useDecideRevisionStatusMutation,
  useSubmitPaperRevisionFeedbackMutation,

  //SON
  useListSubmittedPapersForCustomerQuery,
  useLazyListSubmittedPapersForCustomerQuery,
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
  useListCustomerWaitListQuery,
  useLazyListCustomerWaitListQuery,
  useAddToWaitListMutation,
  useLeaveWaitListMutation,
} = paperApi;

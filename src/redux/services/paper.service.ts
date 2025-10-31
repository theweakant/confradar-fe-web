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
    SubmitPaperRevisionFeedbackRequest,  //REVISION

    AvailableCustomerResponse, CreateAbstractRequest, CreateCameraReadyRequest, CreateFullPaperRequest, CreateRevisionPaperSubmissionRequest, CreateRevisionPaperSubmissionResponse, PaperCustomer, PaperDetailResponse, PaperPhase

  }from "@/types/paper.type"


  import type { ApiResponse } from "@/types/api.type";

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

      listPendingAbstracts: builder.query<ApiResponse<PendingAbstract[]>, void>({
        query: () => ({
          url: endpoint.PAPER.LIST_PENDING_ABSTRACT,
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),

      listUnassignAbstracts: builder.query<ApiResponse<UnassignAbstract[]>, void>({
        query: () => ({
          url: endpoint.PAPER.LIST_UNASSIGN_ABSTRACT,
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),

      listAssignedPapers: builder.query<ApiResponse<AssignedPaper[]>, void>({
        query: () => ({
          url: endpoint.PAPER.LIST_ASSIGN_PAPER_REVIEWER,
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),      

      listPendingCameraReady: builder.query<ApiResponse<PendingCameraReady[]>, void>({
        query: () => ({
          url: endpoint.PAPER.LIST_PENDING_CAMERA_READY,
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

      decideCameraReady: builder.mutation<
        ApiResponse<any>,
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


      getPaperDetailForReviewer: builder.query<ApiResponse<PaperDetailForReviewer>, string>({
        query: (paperId) => ({
          url: endpoint.PAPER.GET_PAPER_DETAIL_REVIEWER(paperId),
          method: "GET",
        }),
        providesTags: ["Paper"],
      }),   
      
    submitFullPaperReview: builder.mutation<
      ApiResponse<any>,
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
    
   getFullPaperReviews: builder.query<ApiResponse<FullPaperReview[]>, string >({
      query: (fullPaperId) => ({
        url: endpoint.PAPER.LIST_FULLPAPER_REVIEWS(fullPaperId),
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    decideFullPaperStatus: builder.mutation<
      ApiResponse<any>,
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
      ApiResponse<any>,
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
      ApiResponse<any>,
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
      ApiResponse<any>,
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
        method: "PUT",
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
    useListAllPapersQuery,
    useListPendingAbstractsQuery,
    useListUnassignAbstractsQuery,
    useListAssignedPapersQuery,
    useDecideAbstractStatusMutation,
    useAssignPaperToReviewerMutation,

    //FULL PAPER
    useGetPaperDetailForReviewerQuery,
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


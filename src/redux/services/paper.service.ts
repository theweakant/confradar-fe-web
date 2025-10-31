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
    SubmitPaperRevisionFeedbackRequest  //REVISION

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
  } = paperApi;
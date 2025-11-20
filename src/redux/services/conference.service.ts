import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type {
  ConferenceFormData,
  ConferenceResponse,
  RegisteredUserInConference,
  ResearchConferenceDetailResponse,
  TechnicalConferenceDetailResponse,
  Conference,
  ConferenceStatus,
  AddedFavouriteConferenceResponse,
  DeletedFavouriteConferenceResponse,
  FavouriteConferenceDetailResponse,
  FavouriteConferenceRequest,
  ConferenceDetailForScheduleResponse,
} from "@/types/conference.type";
import type { ApiResponse, ApiResponsePagination } from "@/types/api.type";

export const conferenceApi = createApi({
  reducerPath: "conferenceApi",
  baseQuery: apiClient,
  tagTypes: ["Conference"],

  endpoints: (builder) => ({
    //get all conf for customer
    getAllConferencesPagination: builder.query<
      ApiResponsePagination<ConferenceResponse[]>,
      { page?: number; pageSize?: number }
    >({
      query: ({ page = 1, pageSize = 12 }) => ({
        url: endpoint.CONFERENCE.LIST_PAGINATED,
        method: "GET",
        params: { page, pageSize },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data?.items.map(({ conferenceId }) => ({
              type: "Conference" as const,
              id: conferenceId,
            })),
            { type: "Conference", id: "LIST" },
          ]
          : [{ type: "Conference", id: "LIST" }],
    }),

    //get all conf for customer with prices
    getAllConferencesWithPricesPagination: builder.query<
      ApiResponsePagination<ConferenceResponse[]>,
      {
        page?: number;
        pageSize?: number;
        searchKeyword?: string;
        cityId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({
        page = 1,
        pageSize = 12,
        searchKeyword,
        cityId,
        startDate,
        endDate,
      }) => ({
        url: endpoint.CONFERENCE.LIST_WITH_PRICES,
        method: "GET",
        params: { page, pageSize, searchKeyword, cityId, startDate, endDate },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data?.items.map(({ conferenceId }) => ({
              type: "Conference" as const,
              id: conferenceId,
            })),
            { type: "Conference", id: "LIST" },
          ]
          : [{ type: "Conference", id: "LIST" }],
    }),
    // getAllConferences: builder.query<ApiResponse<Conference[]>, void>({
    //   query: () => ({
    //     url: endpoint.CONFERENCE.LIST,
    //     method: "GET",
    //   }),
    //   providesTags: ["Conference"],
    // }),

    getResearchConferencesForOrganizer: builder.query<
      ApiResponsePagination<Conference[]>,
      {
        page?: number;
        pageSize?: number;
        conferenceStatusId?: string;
        searchKeyword?: string;
        cityId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: endpoint.CONFERENCE.RESEARCH_CONF_FOR_ORGANIZER,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          ...(params?.conferenceStatusId && {
            conferenceStatusId: params.conferenceStatusId,
          }),
          ...(params?.searchKeyword && { searchKeyword: params.searchKeyword }),
          ...(params?.cityId && { cityId: params.cityId }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
      }),
      providesTags: ["Conference"],
    }),

    //collaborator get tech detail
    getTechnicalConferenceDetailInternal: builder.query<
      ApiResponse<TechnicalConferenceDetailResponse>,
      string
    >({
      query: (conferenceId) => ({
        url: endpoint.CONFERENCE.GET_TECH_BY_ID_INTERNAL(conferenceId),
        method: "GET",
      }),
      providesTags: (result, error, conferenceId) => [
        { type: "Conference", id: conferenceId },
      ],
    }),

    //collaborator/organizer get research detail
    getResearchConferenceDetailInternal: builder.query<
      ApiResponse<ResearchConferenceDetailResponse>,
      string
    >({
      query: (conferenceId) => ({
        url: endpoint.CONFERENCE.GET_RESEARCH_BY_ID_INTERNAL(conferenceId),
        method: "GET",
      }),
      providesTags: (result, error, conferenceId) => [
        { type: "Conference", id: conferenceId },
      ],
    }),

    //tech detail endpoint
    getTechnicalConferenceDetail: builder.query<
      ApiResponse<TechnicalConferenceDetailResponse>,
      string
    >({
      query: (conferenceId) => ({
        url: `${endpoint.CONFERENCE.TECHNICAL_DETAIL}/${conferenceId}`,
        method: "GET",
      }),
      providesTags: (result, error, conferenceId) => [
        { type: "Conference", id: conferenceId },
      ],
    }),

    //research detail endpoint
    getResearchConferenceDetail: builder.query<
      ApiResponse<ResearchConferenceDetailResponse>,
      string
    >({
      query: (conferenceId) => ({
        url: `${endpoint.CONFERENCE.RESEARCH_DETAIL}/${conferenceId}`,
        method: "GET",
      }),
      providesTags: (result, error, conferenceId) => [
        { type: "Conference", id: conferenceId },
      ],
    }),

    //conferences by status with pagination & start endDate filter
    getConferencesByStatus: builder.query<
      ApiResponsePagination<ConferenceResponse[]>,
      {
        conferenceStatusId: string;
        page?: number;
        pageSize?: number;
        searchKeyword?: string;
        cityId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({
        conferenceStatusId,
        page = 1,
        pageSize = 10,
        searchKeyword,
        cityId,
        startDate,
        endDate,
      }) => ({
        url: `${endpoint.CONFERENCE.LIST_BY_STATUS}/${conferenceStatusId}`,
        method: "GET",
        params: { page, pageSize, searchKeyword, cityId, startDate, endDate },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data.items.map(({ conferenceId }) => ({
              type: "Conference" as const,
              id: conferenceId,
            })),
            { type: "Conference", id: "LIST" },
          ]
          : [{ type: "Conference", id: "LIST" }],
    }),

    //view conf detail for customer old version
    // getConferenceById: builder.query<ApiResponse<ConferenceResponse>, string>({
    //   query: (id) => ({
    //     url: `${endpoint.CONFERENCE.DETAIL}/${id}`,
    //     method: 'GET',
    //   }),
    //   providesTags: (result, error, id) => [{ type: 'Conference', id }],
    // }),
    // getConferenceById: builder.query<ApiResponse<Conference>, string>({
    //   query: (id) => ({
    //     url: `${endpoint.CONFERENCE.DETAIL}/${id}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["Conference"],
    // }),

    createConference: builder.mutation<ApiResponse<string>, ConferenceFormData>(
      {
        query: (body) => ({
          url: endpoint.CONFERENCE.CREATE,
          method: "POST",
          body,
        }),
        invalidatesTags: ["Conference"],
      },
    ),

    updateConference: builder.mutation<
      ApiResponse<string>,
      { id: string; data: ConferenceFormData }
    >({
      query: ({ id, data }) => ({
        url: `${endpoint.CONFERENCE.UPDATE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Conference"],
    }),

    deleteConference: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({
        url: `${endpoint.CONFERENCE.DELETE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conference"],
    }),

    viewRegisteredUsersForConference: builder.query<
      ApiResponse<RegisteredUserInConference[]>,
      string
    >({
      query: (conferenceId) => ({
        url: `${endpoint.CONFERENCE.VIEW_REGISTERED_USERS}?conferenceId=${conferenceId}`,
        method: "GET",
      }),
      providesTags: ["Conference"],
    }),

    getPendingConferences: builder.query<
      ApiResponsePagination<ConferenceResponse[]>,
      { page?: number; pageSize?: number }
    >({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: endpoint.CONFERENCE.PENDING_CONFERENCES,
        method: "GET",
        params: { page, pageSize },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data.items.map(({ conferenceId }) => ({
              type: "Conference" as const,
              id: conferenceId,
            })),
            { type: "Conference", id: "PENDING_LIST" },
          ]
          : [{ type: "Conference", id: "PENDING_LIST" }],
    }),

    approveConference: builder.mutation<
      ApiResponse<null>,
      { conferenceId: string; reason: string; isApprove: boolean }
    >({
      query: ({ conferenceId, reason, isApprove }) => ({
        url: endpoint.CONFERENCE.APPROVE_CONFERENCE(conferenceId),
        method: "PUT",
        body: { reason, isApprove },
      }),
      invalidatesTags: ["Conference"],
    }),

    getTechConferencesForCollaboratorAndOrganizer: builder.query<
      ApiResponsePagination<Conference[]>,
      {
        page?: number;
        pageSize?: number;
        conferenceStatusId?: string;
        searchKeyword?: string;
        cityId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: endpoint.CONFERENCE.TECH_CONF_FOR_COLLABORATOR_AND_ORGANIZER,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          ...(params?.conferenceStatusId && {
            conferenceStatusId: params.conferenceStatusId,
          }),
          ...(params?.searchKeyword && { searchKeyword: params.searchKeyword }),
          ...(params?.cityId && { cityId: params.cityId }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
        },
      }),
      providesTags: ["Conference"],
    }),

    getOwnFavouriteConferences: builder.query<
      ApiResponse<FavouriteConferenceDetailResponse[]>,
      void
    >({
      query: () => ({
        url: endpoint.FAVOURITE_CONFERENCE.LIST_OWN,
        method: "GET",
      }),
      providesTags: ["Conference"],
    }),
    addToFavourite: builder.mutation<
      ApiResponse<AddedFavouriteConferenceResponse>,
      FavouriteConferenceRequest
    >({
      query: (body) => ({
        url: endpoint.FAVOURITE_CONFERENCE.ADD,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conference"],
    }),

    // Remove conference from favourites
    deleteFromFavourite: builder.mutation<
      ApiResponse<DeletedFavouriteConferenceResponse>,
      FavouriteConferenceRequest
    >({
      query: (body) => ({
        url: endpoint.FAVOURITE_CONFERENCE.DELETE,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Conference"],
    }),

    getOwnConferencesForSchedule: builder.query<
      ApiResponse<ConferenceDetailForScheduleResponse[]>,
      void
    >({
      query: () => ({
        url: endpoint.CONFERENCE.GET_OWN_CONFERENCES_FOR_SCHEDULE,
        method: "GET",
      }),
      providesTags: ["Conference"],
    }),

    getConferencesHasAssignedPaperForLocalReviewer: builder.query<
      ApiResponse<ConferenceResponse[]>,
      void
    >({
      query: () => ({
        url: endpoint.CONFERENCE.GET_CONFERENCES_HAS_ASSIGNED_PAPERS,
        method: "GET",
      }),
      providesTags: ["Conference"],
    }),

    activateWaitlist: builder.mutation<
      ApiResponse<string>,
      string
    >({
      query: (confId) => ({
        url: `${endpoint.CONFERENCE.ACTIVATE_WAITLIST}?confId=${confId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Conference"],
    }),
  }),
});

export const {
  useGetAllConferencesPaginationQuery,
  useGetTechnicalConferenceDetailQuery,
  useGetResearchConferenceDetailQuery,
  useGetAllConferencesWithPricesPaginationQuery,
  useGetTechnicalConferenceDetailInternalQuery, //collab
  useGetResearchConferenceDetailInternalQuery, //organizer
  useGetResearchConferencesForOrganizerQuery,
  useGetTechConferencesForCollaboratorAndOrganizerQuery,
  // useGetConferenceByIdQuery,
  useGetConferencesByStatusQuery,
  useLazyGetAllConferencesPaginationQuery,
  useLazyGetAllConferencesWithPricesPaginationQuery,
  // useLazyGetConferenceByIdQuery,
  useLazyGetConferencesByStatusQuery,
  useViewRegisteredUsersForConferenceQuery,

  useLazyGetPendingConferencesQuery,
  useApproveConferenceMutation,

  useCreateConferenceMutation,
  useUpdateConferenceMutation,
  useDeleteConferenceMutation,

  // Favourite conference hooks
  useGetOwnFavouriteConferencesQuery,
  useLazyGetOwnFavouriteConferencesQuery,
  useAddToFavouriteMutation,
  useDeleteFromFavouriteMutation,

  useGetOwnConferencesForScheduleQuery,
  useLazyGetOwnConferencesForScheduleQuery,

  useGetConferencesHasAssignedPaperForLocalReviewerQuery,
  useLazyGetConferencesHasAssignedPaperForLocalReviewerQuery,

  useActivateWaitlistMutation,
} = conferenceApi;

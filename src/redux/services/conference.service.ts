import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ConferenceFormData, ConferenceResponse, RegisteredUserInConference, ResearchConferenceDetailResponse, TechnicalConferenceDetailResponse } from "@/types/conference.type";
import type { ApiResponse, ApiResponsePagination } from "@/types/api.type";

export const conferenceApi = createApi({
  reducerPath: "conferenceApi",
  baseQuery: apiClient,
  tagTypes: ["Conference"],

  endpoints: (builder) => ({
    //get all conf for customer
    getAllConferencesPagination: builder.query<ApiResponsePagination<ConferenceResponse[]>,
      { page?: number; pageSize?: number; }
    >({
      query: ({ page = 1, pageSize = 12, }) => ({
        url: endpoint.CONFERENCE.LIST_PAGINATED,
        method: 'GET',
        params: { page, pageSize, },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data?.items.map(({ conferenceId }) => ({
              type: 'Conference' as const,
              id: conferenceId,
            })),
            { type: 'Conference', id: 'LIST' },
          ]
          : [{ type: 'Conference', id: 'LIST' }],
    }),

    //get all conf for customer with prices
    getAllConferencesWithPricesPagination: builder.query<ApiResponsePagination<ConferenceResponse[]>,
      { page?: number; pageSize?: number; searchKeyword?: string; cityId?: string; startDate?: string; endDate?: string }
    >({
      query: ({ page = 1, pageSize = 12, searchKeyword, cityId, startDate, endDate }) => ({
        url: endpoint.CONFERENCE.LIST_WITH_PRICES,
        method: 'GET',
        params: { page, pageSize, searchKeyword, cityId, startDate, endDate },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data?.items.map(({ conferenceId }) => ({
              type: 'Conference' as const,
              id: conferenceId,
            })),
            { type: 'Conference', id: 'LIST' },
          ]
          : [{ type: 'Conference', id: 'LIST' }],
    }),
    // getAllConferences: builder.query<ApiResponse<Conference[]>, void>({
    //   query: () => ({
    //     url: endpoint.CONFERENCE.LIST,
    //     method: "GET",
    //   }),
    //   providesTags: ["Conference"],
    // }),

    //tech detail endpoint
    getTechnicalConferenceDetail: builder.query<
      ApiResponse<TechnicalConferenceDetailResponse>,
      string
    >({
      query: (conferenceId) => ({
        url: `${endpoint.CONFERENCE.TECHNICAL_DETAIL}/${conferenceId}`,
        method: "GET",
      }),
      providesTags: (result, error, conferenceId) => [{ type: "Conference", id: conferenceId }],
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
      providesTags: (result, error, conferenceId) => [{ type: "Conference", id: conferenceId }],
    }),

    //conferences by status with pagination & start endDate filter
    getConferencesByStatus: builder.query<
      ApiResponsePagination<ConferenceResponse[]>,
      { conferenceStatusId: string; page?: number; pageSize?: number; searchKeyword?: string; cityId?: string; startDate?: string; endDate?: string }
    >({
      query: ({ conferenceStatusId, page = 1, pageSize = 10, searchKeyword, cityId, startDate, endDate }) => ({
        url: `${endpoint.CONFERENCE.LIST_BY_STATUS}/${conferenceStatusId}`,
        method: "GET",
        params: { page, pageSize, searchKeyword, cityId, startDate, endDate },
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
            ...result.data.items.map(({ conferenceId }) => ({ type: "Conference" as const, id: conferenceId })),
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

    createConference: builder.mutation<ApiResponse<string>, ConferenceFormData>({
      query: (body) => ({
        url: endpoint.CONFERENCE.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conference"],
    }),

    updateConference: builder.mutation<ApiResponse<string>, { id: string; data: ConferenceFormData }>({
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

  }),
});

export const {
  useGetAllConferencesPaginationQuery,
  useGetTechnicalConferenceDetailQuery,
  useGetAllConferencesWithPricesPaginationQuery,
  // useGetConferenceByIdQuery,
  useGetConferencesByStatusQuery,
  useLazyGetAllConferencesPaginationQuery,
  useLazyGetAllConferencesWithPricesPaginationQuery,
  // useLazyGetConferenceByIdQuery,
  useLazyGetConferencesByStatusQuery,
  useCreateConferenceMutation,
  useUpdateConferenceMutation,
  useDeleteConferenceMutation,
  useViewRegisteredUsersForConferenceQuery
} = conferenceApi;

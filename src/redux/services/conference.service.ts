import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ConferenceFormData, ConferenceResponse, RegisteredUserInConference } from "@/types/conference.type";
import type { ApiResponse } from "@/types/api.type";

export const conferenceApi = createApi({
  reducerPath: "conferenceApi",
  baseQuery: apiClient,
  tagTypes: ["Conference"],

  endpoints: (builder) => ({
    //get all conf for customer
    getAllConferences: builder.query<ApiResponse<ConferenceResponse[]>, void>({
      query: () => ({
        url: endpoint.CONFERENCE.LIST,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ conferenceId }) => ({
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

    //view conf detail for customer
    getConferenceById: builder.query<ApiResponse<ConferenceResponse>, string>({
      query: (id) => ({
        url: `${endpoint.CONFERENCE.DETAIL}/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Conference', id }],
    }),
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
  useGetAllConferencesQuery,
  useGetConferenceByIdQuery,
  useLazyGetAllConferencesQuery,
  useLazyGetConferenceByIdQuery,
  useCreateConferenceMutation,
  useUpdateConferenceMutation,
  useDeleteConferenceMutation,
  useViewRegisteredUsersForConferenceQuery
} = conferenceApi;

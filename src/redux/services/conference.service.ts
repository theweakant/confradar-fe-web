import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { Conference, ConferenceFormData } from "@/types/conference.type";
import type { ApiResponse } from "@/types/api.type";

export const conferenceApi = createApi({
  reducerPath: "conferenceApi",
  baseQuery: apiClient,
  tagTypes: ["Conference"],

  endpoints: (builder) => ({
    getAllConferences: builder.query<ApiResponse<Conference[]>, void>({
      query: () => ({
        url: endpoint.CONFERENCE.LIST,
        method: "GET",
      }),
      providesTags: ["Conference"],
    }),

    getConferenceById: builder.query<ApiResponse<Conference>, string>({
      query: (id) => ({
        url: `${endpoint.CONFERENCE.DETAIL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Conference"],
    }),

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
  }),
});

export const {
  useGetAllConferencesQuery,
  useGetConferenceByIdQuery,
  useCreateConferenceMutation,
  useUpdateConferenceMutation,
  useDeleteConferenceMutation,
} = conferenceApi;

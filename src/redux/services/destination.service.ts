import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type {
  Destination,
  DestinationFormData,
} from "@/types/destination.type";
import type { ApiResponse } from "@/types/api.type";

export const destinationApi = createApi({
  reducerPath: "destinationApi",
  baseQuery: apiClient,
  tagTypes: ["Destination"],
  endpoints: (builder) => ({
    getAllDestinations: builder.query<ApiResponse<Destination[]>, void>({
      query: () => ({
        url: endpoint.DESTINATION.LIST,
        method: "GET",
      }),
      providesTags: ["Destination"],
    }),

    createDestination: builder.mutation<
      ApiResponse<string>,
      DestinationFormData
    >({
      query: (body) => ({
        url: endpoint.DESTINATION.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Destination"],
    }),

    updateDestination: builder.mutation<
      ApiResponse<string>,
      { id: string; data: DestinationFormData }
    >({
      query: ({ id, data }) => ({
        url: `${endpoint.DESTINATION.UPDATE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Destination"],
    }),

    deleteDestination: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({
        url: `${endpoint.DESTINATION.DELETE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Destination"],
    }),
  }),
});

export const {
  useGetAllDestinationsQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
} = destinationApi;

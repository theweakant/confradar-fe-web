// src/api/publisherApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type {
  Publisher,
  PublisherFormData,
} from "@/types/publisher.type";
import type { ApiResponse } from "@/types/api.type";

export const publisherApi = createApi({
  reducerPath: "publisherApi",
  baseQuery: apiClient,
  tagTypes: ["Publisher"],
  endpoints: (builder) => ({
    getAllPublishers: builder.query<ApiResponse<Publisher[]>, void>({
      query: () => ({
        url: endpoint.PUBLISHER.LIST,
        method: "GET",
      }),
      providesTags: ["Publisher"],
    }),

    createPublisher: builder.mutation<
      ApiResponse<string>,
      PublisherFormData
    >({
      query: (body) => ({
        url: endpoint.PUBLISHER.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Publisher"],
    }),

    updatePublisher: builder.mutation<
      ApiResponse<string>,
      { id: string; data: PublisherFormData }
    >({
      query: ({ id, data }) => ({
        url: `${endpoint.PUBLISHER.UPDATE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Publisher"],
    }),

    deletePublisher: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({
        url: `${endpoint.PUBLISHER.DELETE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Publisher"],
    }),
  }),
});

export const {
  useGetAllPublishersQuery,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
  useDeletePublisherMutation,
} = publisherApi;
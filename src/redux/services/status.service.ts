import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { 
  ConferenceStatus
} from "@/types/conference.type";
import type { ApiResponse } from "@/types/api.type";

export const statusApi = createApi({
  reducerPath: "statusApi",
  baseQuery: apiClient,
  tagTypes: ["Status"],
  endpoints: (builder) => ({
    getAllConferenceStatuses: builder.query<ApiResponse<ConferenceStatus[]>, void>({
      query: () => ({
        url: endpoint.CONFERENCE.LIST_ALL_CONF_STATUS, 
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ conferenceStatusId }) => ({
                type: "Status" as const,
                id: conferenceStatusId,
              })),
              { type: "Status", id: "LIST" },
            ]
          : [{ type: "Status", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllConferenceStatusesQuery, 
  useLazyGetAllConferenceStatusesQuery,
} = statusApi;

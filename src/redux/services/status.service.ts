import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ConferenceStatus } from "@/types/conference.type";
import type { ApiResponse } from "@/types/api.type";

export const statusApi = createApi({
  reducerPath: "statusApi",
  baseQuery: apiClient,
  tagTypes: ["Status"],
  endpoints: (builder) => ({
    getAllConferenceStatuses: builder.query<
      ApiResponse<ConferenceStatus[]>,
      void
    >({
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

    updateOwnConferenceStatus: builder.mutation<
      ApiResponse<null>,
      { confid: string; newStatus: string; reason: string }
    >({
      query: ({ confid, newStatus, reason }) => ({
        url: endpoint.CONFERENCE.UPDATE_OWN_STATUS,
        method: "PUT",
        params: { confid, newStatus, reason },
      }),
      invalidatesTags: ["Status"],
    }),
    requestConferenceApproval: builder.mutation<
      ApiResponse<null>,
      { confId: string }
    >({
      query: ({ confId }) => ({
        url: endpoint.CONFERENCE.REQUEST_CONFERENCE_APPROVE,
        method: "PUT",
        params: { confId }, 
      }),
      invalidatesTags: ["Status"], 
    }),


        disableConference: builder.mutation<
      ApiResponse<null>,
      { conferenceId: string; reason: string }
    >({
      query: ({ conferenceId, reason }) => ({
        url: endpoint.CONFERENCE.DISABLE_CONFERENCE,
        method: "PUT",
        params: { conferenceId, reason },
      }),
      invalidatesTags: ["Status"],
    }),

        transitionConferenceFromDisableToReady: builder.mutation<
      ApiResponse<null>,
      { conferenceId: string; reason: string }
    >({
      query: ({ conferenceId, reason }) => ({
        url: endpoint.CONFERENCE.TRANSITION_CONF_FROM_DISABLE_TO_READY,
        method: "PUT",
        params: { conferenceId, reason },
      }),
      invalidatesTags: ["Status"],
    }),

  }),
});

export const {
  useGetAllConferenceStatusesQuery,
  useLazyGetAllConferenceStatusesQuery,
  useUpdateOwnConferenceStatusMutation,
  useRequestConferenceApprovalMutation,

  useDisableConferenceMutation,
  useTransitionConferenceFromDisableToReadyMutation
} = statusApi;

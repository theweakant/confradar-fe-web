import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type {
RefundRequest
} from "@/types/request.type";
import type { ApiResponse } from "@/types/api.type";

export const requestApi = createApi({
  reducerPath: "requestApi",
  baseQuery: apiClient,
  tagTypes: ["RefundRequest"],
  endpoints: (builder) => ({
    getAllRefundRequests: builder.query<ApiResponse<RefundRequest[]>, void>({
      query: () => ({
        url: endpoint.REQUEST.REFUND_REQUEST,
        method: "GET",
      }),
      providesTags: ["RefundRequest"],
    }),

    getRefundRequestsByConferenceId: builder.query<
      ApiResponse<RefundRequest[]>,
      string 
    >({
      query: (conferenceId) => ({
        url: endpoint.REQUEST.REFUND_REQUEST_BY_CONFID(conferenceId),
        method: "GET",
      }),
      providesTags: (result, error, conferenceId) => [
        { type: "RefundRequest", id: conferenceId },
      ],
    }),


  }),
});

export const {
useGetAllRefundRequestsQuery,
useGetRefundRequestsByConferenceIdQuery


} = requestApi;

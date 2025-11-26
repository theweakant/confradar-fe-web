// src/services/dashboard.service.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type {
  DashboardConferencesGroupByStatusResponse,
  UpcomingConference,
  TopRegisteredConferencesResponse,
  RevenueStatsResponse,
} from "@/types/dashboard.type";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: apiClient,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getConferencesGroupByStatus: builder.query<
      ApiResponse<DashboardConferencesGroupByStatusResponse>,
      string 
    >({
      query: (userId) => ({
        url: endpoint.DASHBOARD.CONFERENCES_GROUP_BY_STATUS,
        method: "GET",
        params: { userId },
      }),
      providesTags: ["Dashboard"],
    }),

    getUpcomingConferences: builder.query<
      ApiResponse<UpcomingConference[]>,
      { userId: string; nextMonths: number }
    >({
      query: ({ userId, nextMonths }) => ({
        url: endpoint.DASHBOARD.UPCOMING_CONFERENCES,
        method: "GET",
        params: { userId, nextMonths },
      }),
      providesTags: ["Dashboard"],
    }),

    getTopRegisteredConferences: builder.query<
      ApiResponse<TopRegisteredConferencesResponse>,
      { userId: string; numberToTake: number }
    >({
      query: ({ userId, numberToTake }) => ({
        url: endpoint.DASHBOARD.TOP_REGISTERED_CONFERENCES,
        method: "GET",
        params: { userId, numberToTake },
      }),
      providesTags: ["Dashboard"],
    }),

    getRevenueStats: builder.query<
      ApiResponse<RevenueStatsResponse>,
      { userId: string; monthBack: number }
    >({
      query: ({ userId, monthBack }) => ({
        url: endpoint.DASHBOARD.REVENUE,
        method: "GET",
        params: { userId, monthBack },
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetConferencesGroupByStatusQuery,
  useLazyGetConferencesGroupByStatusQuery,

  useGetUpcomingConferencesQuery,
  useLazyGetUpcomingConferencesQuery,

  useGetTopRegisteredConferencesQuery,
  useLazyGetTopRegisteredConferencesQuery,

  useGetRevenueStatsQuery,
  useLazyGetRevenueStatsQuery,
} = dashboardApi;
// redux/services/user.service.ts
import { createApi } from "@reduxjs/toolkit/query/react"
import { apiClient } from "../api/apiClient"
import { endpoint } from "../api/endpoint"
import { UserProfileResponse } from "@/types/user.type"
import { ApiResponse } from "@/types/api.type"

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: apiClient,
  endpoints: (builder) => ({
    getProfileById: builder.query<ApiResponse<UserProfileResponse>, string>({
      query: (userId) => ({
        url: `${endpoint.AUTH.PROFILE}?userId=${userId}`,
        method: "GET",
      }),
    }),

    updateProfile: builder.mutation<ApiResponse<UserProfileResponse>, { userId: string; data: Partial<UserProfileResponse> }>({
      query: ({ userId, data }) => ({
        url: `${endpoint.AUTH.PROFILE}`,
        method: "PUT",
        body: { userId, ...data },
      }),
    }),
  }),
})

export const {
  useGetProfileByIdQuery,
  useUpdateProfileMutation
} = userApi
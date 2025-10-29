// redux/services/user.service.ts
import { createApi } from "@reduxjs/toolkit/query/react"
import { apiClient } from "../api/apiClient"
import { endpoint } from "../api/endpoint"
import { UserProfileResponse,CollaboratorRequest, UsersListResponse } from "@/types/user.type"
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

    getUsersList: builder.query<ApiResponse<UsersListResponse>, void>({
      query: () => ({
        url: endpoint.AUTH.USERS_LIST,
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


    createCollaborator: builder.mutation<ApiResponse<number>, CollaboratorRequest>({
      query: (data) => ({
        url: endpoint.AUTH.CREATE_COLLABORATOR,
        method: "POST",
        body: data,
      }),
    }),

    suspendAccount: builder.mutation<ApiResponse<any>, string>({
      query: (userId) => ({
        url: endpoint.AUTH.SUSPEND(userId),
        method: "PUT",
      }),
    }),

    // ✅ Activate account
    activateAccount: builder.mutation<ApiResponse<any>, string>({
      query: (userId) => ({
        url: endpoint.AUTH.ACTIVATE(userId),
        method: "PUT",
      }),
    }),
  }),
})

export const { 
  useGetProfileByIdQuery,
  useGetUsersListQuery,
  useUpdateProfileMutation,
  useCreateCollaboratorMutation,
  
  useSuspendAccountMutation,
  useActivateAccountMutation
} = userApi
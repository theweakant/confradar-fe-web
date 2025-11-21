// redux/services/user.service.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";

import {
  UserProfileResponse,
  CollaboratorRequest,
  ReviewerListResponse,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  ListUserDetailForAdminAndOrganizerResponse,
} from "@/types/user.type";
import { ApiResponse } from "@/types/api.type";

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

    getUsersList: builder.query<ApiResponse<ListUserDetailForAdminAndOrganizerResponse>, void>({
      query: () => ({
        url: endpoint.AUTH.USERS_LIST,
        method: "GET",
      }),
    }),

    getReviewersList: builder.query<ApiResponse<ReviewerListResponse[]>, void>({
      query: () => ({
        url: endpoint.AUTH.REVIEWERS_LIST,
        method: "GET",
      }),
    }),

    // updateProfile: builder.mutation<ApiResponse<UserProfileResponse>, { userId: string; data: Partial<UserProfileResponse> }>({
    //   query: ({ userId, data }) => ({
    //     url: `${endpoint.AUTH.PROFILE}`,
    //     method: "PUT",
    //     body: { userId, ...data },
    //   }),
    // }),

    updateProfile: builder.mutation<ApiResponse<number>, ProfileUpdateRequest>({
      query: (data) => {
        const formData = new FormData();
        if (data.fullName) formData.append("FullName", data.fullName);
        if (data.birthDay) formData.append("BirthDay", data.birthDay);
        if (data.phoneNumber) formData.append("PhoneNumber", data.phoneNumber);
        if (data.gender) formData.append("Gender", data.gender);
        if (data.avatarFile) formData.append("AvatarFile", data.avatarFile);
        if (data.bioDescription)
          formData.append("BioDescription", data.bioDescription);

        return {
          url: endpoint.AUTH.UPDATE_PROFILE,
          method: "PUT",
          body: formData,
        };
      },
    }),

    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordRequest>({
      query: (data) => ({
        url: endpoint.AUTH.CHANGE_PASSWORD,
        method: "PUT",
        body: data,
      }),
    }),

    createCollaborator: builder.mutation<
      ApiResponse<number>,
      CollaboratorRequest
    >({
      query: (data) => ({
        url: endpoint.AUTH.CREATE_COLLABORATOR,
        method: "POST",
        body: data,
      }),
    }),

    suspendAccount: builder.mutation<ApiResponse<unknown>, string>({
      query: (userId) => ({
        url: endpoint.AUTH.SUSPEND(userId),
        method: "PUT",
      }),
    }),

    activateAccount: builder.mutation<ApiResponse<unknown>, string>({
      query: (userId) => ({
        url: endpoint.AUTH.ACTIVATE(userId),
        method: "PUT",
      }),
    }),

    suspendExternalReviewer: builder.mutation<ApiResponse<unknown>, string>({
      query: (userId) => ({
        url: endpoint.AUTH.SUSPEND_EXTERNAL_REVIEWER(userId),
        method: "PUT",
      }),
    }),

    activateExternalReviewer: builder.mutation<ApiResponse<unknown>, string>({
      query: (userId) => ({
        url: endpoint.AUTH.ACTIVATE_EXTERNAL_REVIEWER(userId),
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useGetProfileByIdQuery,
  useGetUsersListQuery,
  useGetReviewersListQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useCreateCollaboratorMutation,

  useSuspendAccountMutation,
  useActivateAccountMutation,

  useSuspendExternalReviewerMutation,
  useActivateExternalReviewerMutation,
} = userApi;

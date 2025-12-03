// redux/services/auth.service.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import {
  ForgetPasswordResponse,
  VerifyForgetPasswordResponse,
  VerifyForgetPasswordData,
} from "@/types/auth.type";
import { ApiResponse } from "@/types/api.type";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: apiClient,
  endpoints: (builder) => ({
    // login: builder.mutation({
    //   query: (body) => ({
    //     url: endpoint.AUTH.LOGIN,
    //     method: "POST",
    //     body,
    //   }),
    // }),
    login: builder.mutation({
      query: ({ email, password, firebaseWebFcmToken, firebaseMobileFcmToken }) => ({
        url: endpoint.AUTH.LOGIN,
        method: "POST",
        body: {
          email,
          password,
          ...(firebaseWebFcmToken && { firebaseWebFcmToken }),
          ...(firebaseMobileFcmToken && { firebaseMobileFcmToken }),
        },
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: endpoint.AUTH.REGISTER,
        method: "POST",
        body,
      }),
    }),
    firebaseLogin: builder.mutation({
      query: ({ token, firebaseWebFcmToken, firebaseMobileFcmToken }) => ({
        url: endpoint.AUTH.GOOGLE,
        method: "POST",
        body: {
          token,
          ...(firebaseWebFcmToken && { firebaseWebFcmToken }),
          ...(firebaseMobileFcmToken && { firebaseMobileFcmToken }),
        },
      }),
    }),
    // firebaseLogin: builder.mutation({
    //   query: (token) => ({
    //     url: endpoint.AUTH.GOOGLE,
    //     method: "POST",
    //     body: { token },
    //   }),
    // }),
    forgetPassword: builder.mutation<
      ApiResponse<ForgetPasswordResponse>,
      string
    >({
      query: (email) => ({
        url: endpoint.AUTH.FORGET_PASSWORD,
        method: "POST",
        params: { email },
      }),
    }),

    verifyForgetPassword: builder.mutation<
      ApiResponse<VerifyForgetPasswordResponse>,
      VerifyForgetPasswordData
    >({
      query: (body) => ({
        url: endpoint.AUTH.VERIFY_FORGET_PASSWORD,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useFirebaseLoginMutation,
  useForgetPasswordMutation,
  useVerifyForgetPasswordMutation,
} = authApi;

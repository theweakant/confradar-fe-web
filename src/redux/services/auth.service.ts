// redux/services/auth.service.ts
import { createApi } from "@reduxjs/toolkit/query/react"
import { apiClient } from "../api/apiClient"
import { endpoint } from "../api/endpoint"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: apiClient,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: endpoint.AUTH.LOGIN,
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: endpoint.AUTH.REGISTER,
        method: "POST",
        body,
      }),
    }),

  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi

// redux/api/apiClient.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/token"
import { endpoint } from "./endpoint"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = getAccessToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    headers.set("Content-Type", "application/json")
    return headers
  },
})

// custom base query có auto refresh token
export const apiClient: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  // nếu token hết hạn
  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      window.location.href = "/auth/login"
      return result
    }

    // gọi API refresh token
    const refreshResult = await rawBaseQuery(
      {
        url: endpoint.AUTH.REFRESH,
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      const data = refreshResult.data as { accessToken: string; refreshToken: string }
      setTokens(data.accessToken, data.refreshToken)
      // retry request gốc sau khi refresh token thành công
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      clearTokens()
      window.location.href = "/auth/login"
    }
  }

  return result
}

// // redux/api/apiClient.ts


import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from "../utils/token"
import { endpoint } from "./endpoint"
import type { ApiResponse } from "@/types/api.type"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    const token = getAccessToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

export const apiClient: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  // Nếu token hết hạn (401)
  if (result.error && result.error.status === 401) {
    console.log("🔴 [Auth] Token expired (401), attempting refresh...")
    
    const refreshToken = getRefreshToken()
    const accessToken = getAccessToken()
    
    // ✅ CHECK: Token có hợp lệ không
    if (!refreshToken || !accessToken) {
      console.log("❌ [Auth] Missing tokens, redirecting to login")
      clearTokens()
      window.location.href = "/auth/login"
      return result
    }

    // ✅ CHECK: Access token có hết hạn quá lâu không (refresh token cũng có thể hết hạn)
    if (isTokenExpired(accessToken)) {
      console.log("⚠️ [Auth] Access token expired, checking refresh token validity...")
    }

    console.log("🔄 [Auth] Calling refresh token API...")
    
    // Gọi API refresh token
    const refreshResult = await rawBaseQuery(
      {
        url: endpoint.AUTH.REFRESH,
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: { token: refreshToken },
      },
      api,
      extraOptions
    )

    console.log("📥 [Auth] Refresh API response:", {
      success: !!refreshResult.data,
      error: refreshResult.error,
    })

    if (refreshResult.data) {
      const response = refreshResult.data as ApiResponse<{
        accessToken: string
        refreshToken: string
      }>
      
      // Lưu token mới và retry request ban đầu
      if (response.success && response.data) {
        console.log("✅ [Auth] Tokens refreshed successfully")
        setTokens(response.data.accessToken, response.data.refreshToken)
        
        // Retry request ban đầu
        result = await rawBaseQuery(args, api, extraOptions)
        console.log("🎉 [Auth] Original request retried:", !result.error ? "SUCCESS" : "FAILED")
      } else {
        console.log("❌ [Auth] Refresh response invalid, redirecting to login")
        clearTokens()
        window.location.href = "/auth/login"
      }
    } else {
      // ✅ QUAN TRỌNG: Nếu refresh-token cũng bị 401 → Refresh token đã hết hạn
      if (refreshResult.error?.status === 401) {
        console.log("🚨 [Auth] Refresh token expired, forcing re-login")
      } else {
        console.log("❌ [Auth] Refresh API failed:", refreshResult.error)
      }
      clearTokens()
      window.location.href = "/auth/login"
    }
  }

  return result
}

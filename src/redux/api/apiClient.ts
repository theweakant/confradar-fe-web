// // redux/api/apiClient.ts
// import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
// import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
// import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/token"
// import { endpoint } from "./endpoint"

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

// const rawBaseQuery = fetchBaseQuery({
//   baseUrl,
//   prepareHeaders: (headers) => {
//     const token = getAccessToken()
//     if (token) headers.set("Authorization", `Bearer ${token}`)
//     // headers.set("Content-Type", "application/json")
//     return headers
//   },
// })

// // custom base query có auto refresh token
// export const apiClient: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
//   args,
//   api,
//   extraOptions
// ) => {
//   let result = await rawBaseQuery(args, api, extraOptions)

//   //token hết hạn
//   if (result.error && result.error.status === 401) {
//     const refreshToken = getRefreshToken()
//     if (!refreshToken) {
//       clearTokens()
//       window.location.href = "/auth/login"
//       return result
//     }

//     //API refresh token
//     const refreshResult = await rawBaseQuery(
//       {
//         url: endpoint.AUTH.REFRESH,
//         method: "POST",
//         body: { refreshToken },
//       },
//       api,
//       extraOptions
//     )

//     if (refreshResult.data) {
//       const data = refreshResult.data as { accessToken: string; refreshToken: string }
//       setTokens(data.accessToken, data.refreshToken)
//       // retry request gốc sau khi refresh token thành công
//       result = await rawBaseQuery(args, api, extraOptions)
//     } else {
//       clearTokens()
//       window.location.href = "/auth/login"
//     }
//   }

//   return result
// }


// import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
// import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
// import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/token"
// import { endpoint } from "./endpoint"
// import type { ApiResponse } from "@/types/api.type" 

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

// const rawBaseQuery = fetchBaseQuery({
//   baseUrl,
//   prepareHeaders: (headers) => {
//     const token = getAccessToken()
//     if (token) headers.set("Authorization", `Bearer ${token}`)
//     return headers
//   },
// })

// export const apiClient: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
//   args,
//   api,
//   extraOptions
// ) => {
//   let result = await rawBaseQuery(args, api, extraOptions)

//   // Nếu token hết hạn (401)
//   if (result.error && result.error.status === 401) {
//     const refreshToken = getRefreshToken()
//     const accessToken = getAccessToken()
    
//     // Kiểm tra có đủ token không
//     if (!refreshToken || !accessToken) {
//       clearTokens()
//       window.location.href = "/auth/login"
//       return result
//     }

//     // Gọi API refresh token
//     const refreshResult = await rawBaseQuery(
//       {
//         url: endpoint.AUTH.REFRESH,
//         method: "POST",
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//         },
//         body: { token: refreshToken },
//       },
//       api,
//       extraOptions
//     )

//     // Xử lý response với ApiResponse type
//     if (refreshResult.data) {
//       const response = refreshResult.data as ApiResponse<{
//         accessToken: string
//         refreshToken: string
//       }>
      
//       // Lưu token mới và retry request ban đầu
//       if (response.success && response.data) {
//         setTokens(response.data.accessToken, response.data.refreshToken)
//         result = await rawBaseQuery(args, api, extraOptions)
//       } else {
//         clearTokens()
//         window.location.href = "/auth/login"
//       }
//     } else {
//       clearTokens()
//       window.location.href = "/auth/login"
//     }
//   }

//   return result
// }


import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/token"
import { endpoint } from "./endpoint"
import type { ApiResponse } from "@/types/api.type"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
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
    
    console.log("📋 [Auth] Current tokens:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: accessToken?.substring(0, 20) + "...",
    })
    
    // Kiểm tra có đủ token không
    if (!refreshToken || !accessToken) {
      console.log("❌ [Auth] Missing tokens, redirecting to login")
      clearTokens()
      window.location.href = "/auth/login"
      return result
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

    // Xử lý response với ApiResponse type
    if (refreshResult.data) {
      const response = refreshResult.data as ApiResponse<{
        accessToken: string
        refreshToken: string
      }>
      
      console.log("✅ [Auth] Refresh response:", {
        success: response.success,
        message: response.message,
        hasNewTokens: !!(response.data?.accessToken && response.data?.refreshToken),
      })
      
      // Lưu token mới và retry request ban đầu
      if (response.success && response.data) {
        setTokens(response.data.accessToken, response.data.refreshToken)
        console.log("💾 [Auth] New tokens saved, retrying original request...")
        
        result = await rawBaseQuery(args, api, extraOptions)
        
        console.log("🎉 [Auth] Original request retry result:", {
          success: !result.error,
          status: result.error ? (result.error as any).status : "OK",
        })
      } else {
        console.log("❌ [Auth] Refresh failed, redirecting to login")
        clearTokens()
        window.location.href = "/auth/login"
      }
    } else {
      console.log("❌ [Auth] No data in refresh response, redirecting to login")
      clearTokens()
      window.location.href = "/auth/login"
    }
  }

  return result
}

// redux/api/apiClient.ts

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/token";
import { endpoint } from "./endpoint";
import type { ApiResponse } from "@/types/api.type";
import { toast } from "sonner";
import { clearReduxState } from "@/helper/api"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const PUBLIC_ENDPOINTS = [
  endpoint.AUTH.LOGIN,
  endpoint.AUTH.REGISTER,
  endpoint.AUTH.GOOGLE,
  endpoint.AUTH.FORGET_PASSWORD,
  endpoint.AUTH.VERIFY_FORGET_PASSWORD,
];

const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

export const apiClient: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;

  if (isPublicEndpoint(url) && result.error) {
    return result;
  }

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();

    if (!refreshToken || !accessToken) {
      toast.error("Phiên đăng nhập đã hết hạn", {
        description: "Vui lòng đăng nhập lại"
      })
      clearTokens()
      clearReduxState()
      // window.location.href = "/auth/login"
      return result
    }

    const refreshResult = await rawBaseQuery(
      {
        url: endpoint.AUTH.REFRESH,
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { token: refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const response = refreshResult.data as ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>;

      if (response.success && response.data) {
        setTokens(response.data.accessToken, response.data.refreshToken);
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        toast.error("Không thể làm mới phiên đăng nhập", {
          description: "Vui lòng đăng nhập lại",
        });
        clearTokens();
        window.location.href = "/auth/login";
      }
    } else {
      if (refreshResult.error?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn", {
          description: "Vui lòng đăng nhập lại",
        });
      } else {
        toast.error("Lỗi xác thực", {
          description: "Vui lòng đăng nhập lại",
        });
      }
      clearTokens();
      window.location.href = "/auth/login";
    }
  }

  return result;
};

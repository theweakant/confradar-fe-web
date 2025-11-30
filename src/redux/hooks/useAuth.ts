// redux/hooks/useAuth.ts

import { useLoginMutation } from "../services/auth.service";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  setCredentials,
  logout,
  startLoading,
  stopLoading,
} from "../slices/auth.slice";
import {
  decodeToken,
  getCustomerRole,
  getRolesFromToken,
} from "../utils/token";
import { toast } from "sonner";
import { ApiResponse } from "@/types/api.type";
import { parseApiError } from "@/helper/api";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

type LoginResult = {
  success: boolean;
  user: { userId: string | null; email: string; role: string[] | null } | null;
  message?: string;
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken, loading } = useAppSelector(
    (state) => state.auth,
  );
  const [loginMutation] = useLoginMutation();

  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<LoginResult> => {
    try {
      dispatch(startLoading());
      const res = await loginMutation(credentials).unwrap();
      const { accessToken, refreshToken } = res?.data || {};

      if (!accessToken) throw new Error("Access token missing");

      const decoded = decodeToken(accessToken);
      // const rawRole = getRolesFromToken(accessToken);
      const role = getRolesFromToken(accessToken);
      const email = decoded?.email || credentials.email;
      const userId = decoded?.sub || "";

      // let role: string | null = null;

      // const customerRole = getCustomerRole(accessToken);
      // role = customerRole || (rawRole.length > 0 ? rawRole[0] : null);

      const userInfo = { userId, email, role };

      dispatch(setCredentials({ user: userInfo, accessToken, refreshToken }));

      return {
        success: true,
        user: userInfo,
        message: "Đăng nhập thành công!",
      };
    } catch (error) {
      const parsedError = parseApiError<string>(error as FetchBaseQueryError | SerializedError);

      return {
        success: false,
        user: null,
        message: parsedError?.data?.message,
      };
      // const err = error as ApiResponse | Error;

      // const message =
      //   err instanceof Error
      //     ? err.message
      //     : err?.message ||
      //     err?.errors?.message ||
      //     "Đăng nhập thất bại, vui lòng thử lại.";

      // console.error("Login failed:", error);
      // toast.error(message);
      // return { success: false, user: null, message };
    } finally {
      dispatch(stopLoading());
    }
  };

  const signout = () => dispatch(logout());

  return {
    user,
    // role,
    token: accessToken,
    loading,
    isAuthenticated: !!accessToken,
    login,
    signout,
  };
};

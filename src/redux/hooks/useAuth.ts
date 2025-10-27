// // redux/hooks/useAuth.ts


import { useLoginMutation } from "../services/auth.service"
import { useAppDispatch, useAppSelector } from "./hooks"
import { setCredentials, logout, startLoading, stopLoading } from "../slices/auth.slice"
import { decodeToken, getRoleFromToken } from "../utils/token"


type LoginResult = {
  success: boolean
  user: { email: string; role: string | null } | null
  message?: string
}

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, loading } = useAppSelector((state) => state.auth)
  const [loginMutation] = useLoginMutation()

  const login = async (credentials: { email: string; password: string }): Promise<LoginResult> => {
  try {
    dispatch(startLoading())
    const res = await loginMutation(credentials).unwrap()
    const { accessToken, refreshToken } = res?.data || {}

    if (!accessToken) throw new Error("Access token missing")

    const decoded = decodeToken(accessToken)
    const role = getRoleFromToken(accessToken)
    const email = decoded?.email || credentials.email

    const userInfo = { email, role }
    dispatch(setCredentials({ user: userInfo, accessToken, refreshToken }))

    return { success: true, user: userInfo, message: "Đăng nhập thành công!" }
  } catch (error: any) {
    const message =
      error?.data?.message ||
      error?.error ||
      error?.message ||
      "Đăng nhập thất bại, vui lòng thử lại."

    console.error("Login failed:", error)
    return { success: false, user: null, message }
  } finally {
    dispatch(stopLoading())
  }
}


  const signout = () => dispatch(logout())

  return {
    user,
    token: accessToken,
    loading,
    isAuthenticated: !!accessToken,
    login,
    signout,
  }
}

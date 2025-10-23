// // redux/hooks/useAuth.ts


import { useLoginMutation } from "../services/auth.service"
import { useAppDispatch, useAppSelector } from "./hooks"
import { setCredentials, logout, startLoading, stopLoading } from "../slices/auth.slice"
import { decodeToken, getRoleFromToken } from "../utils/token"

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, loading } = useAppSelector((state) => state.auth)
  const [loginMutation] = useLoginMutation()

  const login = async (credentials: { email: string; password: string }) => {
    try {
      dispatch(startLoading())
      const res = await loginMutation(credentials).unwrap()
      const { accessToken, refreshToken } = res.data || {}

      if (!accessToken) throw new Error("Access token missing")

      const decoded = decodeToken(accessToken)
      const role = getRoleFromToken(accessToken)
      const email = decoded?.email || credentials.email

      const userInfo = { email, role }

      dispatch(setCredentials({ user: userInfo, accessToken, refreshToken }))
      return { success: true, user: userInfo }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, user: null }
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

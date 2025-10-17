// redux/hooks/useAuth.ts
import { useLoginMutation } from "../services/auth.service"
import { useAppDispatch, useAppSelector } from "./hooks"
import { setCredentials, logout, startLoading, stopLoading } from "../slices/auth.slice"

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, loading } = useAppSelector((state) => state.auth)
  const [loginMutation] = useLoginMutation()

  const login = async (credentials: { email: string; password: string }) => {
    try {
      dispatch(startLoading())
      const res = await loginMutation(credentials).unwrap()
      const { accessToken, refreshToken, user } = res.data
      dispatch(setCredentials({ user, accessToken, refreshToken }))
      return { success: true, user }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, user: null }
    } finally {
      dispatch(stopLoading())
    }
  }

  const signout = () => dispatch(logout())

  return {
    user:  user,
    token: accessToken,
    loading,
    isAuthenticated: !!accessToken, 
    login,
    signout,
  }
}

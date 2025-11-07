// redux/slices/auth.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { setTokens, clearTokens, getRolesFromToken, getCustomerRole } from "../utils/token"
import { UserProfileResponse, AuthUser } from "@/types/user.type"

export interface AuthState {
  user: UserProfileResponse | AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  role: string | null
  loading: boolean
  isRegistered: boolean
}
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  loading: false,
  isRegistered: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true
    },
    stopLoading: (state) => {
      state.loading = false
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfileResponse | AuthUser; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload

      const rawRole = getRolesFromToken(accessToken)
      let role: string | null = null

      // 🟩 Phân nhánh logic role giống useAuth
      if (Array.isArray(rawRole)) {
        role = getCustomerRole(accessToken)
      } else if (typeof rawRole === "string") {
        role = rawRole
      }
      // const role = getRoleFromToken(accessToken)
      // console.log("🟢 Decoded role:", role)
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      // state.role = getRoleFromToken(accessToken) || null
      state.role = role || null
      setTokens(accessToken, refreshToken)
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.role = null
      clearTokens()
      state.loading = false
    },

    registerSuccess: (state) => {
      state.isRegistered = true
      state.loading = false
    },

    resetRegisterState: (state) => {
      state.isRegistered = false
    },
  },
})

export const { setCredentials, logout, startLoading, stopLoading } = authSlice.actions
export default authSlice.reducer

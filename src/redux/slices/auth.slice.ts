// redux/slices/auth.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { setTokens, clearTokens, getRoleFromToken } from "../utils/token"
import {User, AuthUser} from "@/types/user.type"

export interface AuthState {
  user: User | AuthUser | null
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
      action: PayloadAction<{ user: User | AuthUser; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload
      const role = getRoleFromToken(accessToken)
      console.log("🟢 Decoded role:", role)
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.role = getRoleFromToken(accessToken) || null
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

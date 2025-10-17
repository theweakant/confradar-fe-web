// redux/slices/auth.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { setTokens, clearTokens } from "../utils/token"
import { AuthState } from "@/types/auth.type"
import {User} from "@/types/user.type"

 const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
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
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      setTokens(accessToken, refreshToken)
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      clearTokens()
      state.loading = false
    },
  },
})

export const { setCredentials, logout, startLoading, stopLoading } = authSlice.actions
export default authSlice.reducer

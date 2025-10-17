import { combineReducers } from "@reduxjs/toolkit"
import authReducer from "@/redux/slices/auth.slice"
import { authApi } from "@/redux/services/auth.service"

export const rootReducer = combineReducers({

  //slice reducer  
  auth: authReducer,

  //API reducer
  [authApi.reducerPath]: authApi.reducer,
})


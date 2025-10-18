import { combineReducers } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import authReducer from "@/redux/slices/auth.slice"
import { authApi } from "@/redux/services/auth.service"

// Cấu hình persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Chỉ persist auth slice
  blacklist: [authApi.reducerPath], // Không persist API cache
}

const appReducer = combineReducers({
  // slice reducer  
  auth: authReducer,

  // API reducer
  [authApi.reducerPath]: authApi.reducer,
})

// Wrap với persistReducer
export const rootReducer = persistReducer(persistConfig, appReducer)
// redux/utils/persistConfig.ts
import storage from "redux-persist/lib/storage"
import { persistReducer } from "redux-persist"
import { combineReducers } from "@reduxjs/toolkit"
import authReducer from "@/redux/slices/auth.slice"
import { authApi } from "@/redux/services/auth.service"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], 
}

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
})

export const persistedReducer = persistReducer(persistConfig, rootReducer)

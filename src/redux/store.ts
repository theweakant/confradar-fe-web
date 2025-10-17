// redux/utils/store.ts
import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { persistStore } from "redux-persist"
import { persistedReducer } from "./persistConfig"
import { authApi } from "@/redux/services/auth.service"

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // bắt buộc khi dùng persist
    }).concat(authApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
})

export const persistor = persistStore(store)
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

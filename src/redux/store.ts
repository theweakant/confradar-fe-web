// redux/utils/store.ts
import { configureStore } from "@reduxjs/toolkit"
import { persistStore } from "redux-persist"
import { setupListeners } from "@reduxjs/toolkit/query"
import {rootReducer} from "./rootReducer"
import { apiMiddlewares } from "./utils/middleware"


export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false,}).concat(apiMiddlewares)})

export const persistor = persistStore(store)

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

import { AnyAction, combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { authApi } from "@/redux/services/auth.service";
import { destinationApi } from "@/redux/services/destination.service";
import { roomApi } from "@/redux/services/room.service";
import { categoryApi } from "@/redux/services/category.service";
import { conferenceApi } from "@/redux/services/conference.service";
import { conferenceStepApi } from "@/redux/services/conferenceStep.service";

import authReducer from "@/redux/slices/auth.slice";
import destinationReducer from "@/redux/slices/destination.slice";
import roomReducer from "@/redux/slices/room.slice";
import conferenceReducer from "@/redux/slices/conference.slice";
import conferenceStepReducer from "@/redux/slices/conferenceStep.slice";
import categoryReducer from "@/redux/slices/category.slice";

import { transactionApi } from "./services/transaction.service";
import { ticketApi } from "./services/ticket.service";
import { cityApi } from "./services/city.service";
import { userApi } from "./services/user.service";
import { paperApi } from "./services/paper.service";
import { statusApi } from "./services/status.service";

// Cấu hình persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  blacklist: [
    authApi.reducerPath,
    destinationApi.reducerPath,
    roomApi.reducerPath,
    conferenceApi.reducerPath,
    conferenceStepApi.reducerPath,
    categoryApi.reducerPath,
    userApi.reducerPath,
    paperApi.reducerPath,
    statusApi.reducerPath,
  ],
};

const appReducer = combineReducers({
  // slice reducer
  auth: authReducer,
  destination: destinationReducer,
  room: roomReducer,
  category: categoryReducer,
  conference: conferenceReducer,
  conferenceStep: conferenceStepReducer,

  // API reducer
  [authApi.reducerPath]: authApi.reducer,
  [destinationApi.reducerPath]: destinationApi.reducer,
  [roomApi.reducerPath]: roomApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [conferenceApi.reducerPath]: conferenceApi.reducer,
  [conferenceStepApi.reducerPath]: conferenceStepApi.reducer,
  [transactionApi.reducerPath]: transactionApi.reducer,
  [ticketApi.reducerPath]: ticketApi.reducer,
  [cityApi.reducerPath]: cityApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [paperApi.reducerPath]: paperApi.reducer,
  [statusApi.reducerPath]: statusApi.reducer,
});

export type AppState = ReturnType<typeof appReducer>;

const clearReducer = (state: AppState | undefined, action: AnyAction): AppState => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return appReducer(state, action);
};

// Wrap với persistReducer
export const rootReducer = persistReducer(persistConfig, clearReducer)

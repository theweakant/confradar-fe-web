import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import authReducer from "@/redux/slices/auth.slice";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user"],
};

export const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authReducer,
);

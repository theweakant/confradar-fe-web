import { persistor, store } from "@/redux/store";
import { ApiQueryError } from "@/types/api.type";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const parseApiError = <T>(
  error: FetchBaseQueryError | SerializedError | undefined,
): ApiQueryError<T> | null => {
  if (!error) return null;
  if ("data" in error) {
    return error as ApiQueryError<T>;
  }
  return null;
};

export const clearReduxState = () => {
  import('@/redux/store').then(({ store, persistor }) => {
    store.dispatch({ type: "RESET_STORE" })
    persistor.purge()
  })
}

import { ApiQueryError } from "@/types/api.type";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const parseApiError = <T>(error: FetchBaseQueryError | SerializedError | undefined): ApiQueryError<T> | null => {
    if (!error) return null;
    if ('data' in error) {
        return error as ApiQueryError<T>;
    }
    // if ('message' in error) {
    //   return { name: 'Error', message: error.message } as ApiQueryError<T>;
    // }
    return null;
};
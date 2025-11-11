import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string>;
}

export interface ApiResponsePagination<T = unknown> {
  success: boolean;
  message: string;
  data: PaginationData<T>;
  errors: Record<string, string>;
}

export interface PaginationData<T = unknown> {
  items: T;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems?: number;
}

export interface ApiError<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export type ApiQueryError<T = unknown> = FetchBaseQueryError & {
  data?: ApiError<T>;
};

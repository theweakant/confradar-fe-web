import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { Category, CategoryFormData } from "@/types/category.type";
import type { ApiResponse } from "@/types/api.type";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: apiClient,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getAllCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => ({
        url: endpoint.CATEGORY.LIST,
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (id) => ({
        url: `${endpoint.CATEGORY.DETAIL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Category"],
    }),


 
    createCategory: builder.mutation<ApiResponse<string>, CategoryFormData>({
      query: (body) => ({
        url: endpoint.CATEGORY.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),


    updateCategory: builder.mutation<ApiResponse<string>, { id: string; data: CategoryFormData }>({
      query: ({ id, data }) => ({
        url: `${endpoint.CATEGORY.UPDATE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

 
    deleteCategory: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({
        url: `${endpoint.CATEGORY.DELETE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

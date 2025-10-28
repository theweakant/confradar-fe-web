import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { ApiResponse } from "@/types/api.type";
import { City } from "@/types/city.type";
import { endpoint } from "../api/endpoint";

export const cityApi = createApi({
    reducerPath: "cityApi",
    baseQuery: apiClient,
    tagTypes: ["City"],
    endpoints: (builder) => ({
        getAllCities: builder.query<ApiResponse<City[]>, void>({
            query: () => ({
                url: endpoint.CITY.LIST,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ cityId }) => ({
                            type: "City" as const,
                            id: cityId,
                        })),
                        { type: "City", id: "LIST" },
                    ]
                    : [{ type: "City", id: "LIST" }],
        }),
    }),
});

export const { useGetAllCitiesQuery, useLazyGetAllCitiesQuery } = cityApi;
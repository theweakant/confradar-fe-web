import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { OrcidStatusResponse } from "@/types/orcid.type";

export const orcidApi = createApi({
    reducerPath: "orcidApi",
    baseQuery: apiClient,
    tagTypes: ["Orcid"],
    endpoints: (builder) => ({
        authorizeOrcid: builder.query<ApiResponse<string>, void>({
            query: () => ({
                url: endpoint.ORCID.AUTHORIZE,
                method: "GET",
            }),
        }),

        // exchangeForAccessToken: builder.query<void, { code: string; state: string }>({
        //   query: ({ code, state }) => ({
        //     url: `${endpoint.ORCID.CALLBACK}?code=${code}&state=${state}`,
        //     method: "GET",
        //   }),
        // }),

        getWorks: builder.query<ApiResponse<string>, void>({
            query: () => ({
                url: endpoint.ORCID.GET_WORKS,
                method: "GET",
            }),
        }),

        getBiography: builder.query<ApiResponse<string>, void>({
            query: () => ({
                url: endpoint.ORCID.GET_BIOGRAPHY,
                method: "GET",
            }),
        }),

        getEducations: builder.query<ApiResponse<string>, void>({
            query: () => ({
                url: endpoint.ORCID.GET_EDUCATIONS,
                method: "GET",
            }),
        }),

        getSectionByUserId: builder.query<ApiResponse<any>, { section: string }>({
            query: ({ section }) => ({
                url: `${endpoint.ORCID.GET_SECTION}?section=${section}`,
                method: "GET",
            }),
        }),

        getOrcidStatus: builder.query<ApiResponse<OrcidStatusResponse>, void>({
            query: () => ({
                url: endpoint.ORCID.STATUS,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useAuthorizeOrcidQuery,
    useLazyAuthorizeOrcidQuery,
    // useExchangeForAccessTokenQuery,
    useGetWorksQuery,
    useLazyGetWorksQuery,
    useGetBiographyQuery,
    useLazyGetBiographyQuery,
    useGetEducationsQuery,
    useLazyGetEducationsQuery,
    useGetSectionByUserIdQuery,
    useGetOrcidStatusQuery,
} = orcidApi;

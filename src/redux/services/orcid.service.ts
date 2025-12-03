import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { OrcidBiography, OrcidEducation, OrcidStatusResponse, OrcidWorksResponse } from "@/types/orcid.type";

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

        getEducations: builder.query<ApiResponse<OrcidEducation[]>, void>({
            query: () => ({
                url: endpoint.ORCID.GET_EDUCATIONS,
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<string>) => ({
                ...response,
                data: response.data ? JSON.parse(response.data) as OrcidEducation[] : [],
            }),
        }),

        getBiography: builder.query<ApiResponse<OrcidBiography | null>, void>({
            query: () => ({
                url: endpoint.ORCID.GET_BIOGRAPHY,
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<string>) => ({
                ...response,
                data: response.data ? JSON.parse(response.data) as OrcidBiography : null,
            }),
        }),

        getWorks: builder.query<ApiResponse<OrcidWorksResponse | null>, void>({
            query: () => ({
                url: endpoint.ORCID.GET_WORKS,
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<string>) => ({
                ...response,
                data: response.data ? JSON.parse(response.data) as OrcidWorksResponse : null,
            }),
        }),


        // getWorks: builder.query<ApiResponse<string>, void>({
        //     query: () => ({
        //         url: endpoint.ORCID.GET_WORKS,
        //         method: "GET",
        //     }),
        // }),

        // getBiography: builder.query<ApiResponse<string>, void>({
        //     query: () => ({
        //         url: endpoint.ORCID.GET_BIOGRAPHY,
        //         method: "GET",
        //     }),
        // }),

        // getEducations: builder.query<ApiResponse<string>, void>({
        //     query: () => ({
        //         url: endpoint.ORCID.GET_EDUCATIONS,
        //         method: "GET",
        //     }),
        // }),

        getSectionByUserId: builder.query<ApiResponse<string>, { section: string }>({
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

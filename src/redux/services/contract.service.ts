import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { endpoint } from "../api/endpoint";
import { CreateReviewerContractRequest, GetUsersForReviewerContractRequest, GetUsersForReviewerContractResponse } from "@/types/contract.type";
import { apiClient } from "../api/apiClient";
import { ApiResponse } from "@/types/api.type";

export const contractApi = createApi({
    reducerPath: "contractApi",
    baseQuery: apiClient,
    tagTypes: ["Contract"],
    endpoints: (builder) => ({
        createReviewContract: builder.mutation<ApiResponse<number>, CreateReviewerContractRequest>({
            query: ({ reviewerId, wage, conferenceId, signDay, contractFile }) => {
                const formData = new FormData();
                formData.append("contractFile", contractFile);

                return {
                    url: endpoint.CONTRACT.CREATE_REVIEWER_CONTRACT,
                    method: "POST",
                    params: {
                        reviewerId,
                        wage,
                        conferenceId,
                        signDay,
                    },
                    body: formData,
                };
            },
            invalidatesTags: ["Contract"],
        }),

        getUsersForReviewerContract: builder.query<
            ApiResponse<GetUsersForReviewerContractResponse[]>,
            GetUsersForReviewerContractRequest
        >({
            query: (params) => ({
                url: endpoint.CONTRACT.USER_FOR_REVIEWER_CONTRACT,
                params,
            }),
            providesTags: ["Contract"],
        }),

        // getConferencesForOutsourcedReviewer: builder.query<
        //   ConferenceBelongToReviewContractResponse[],
        //   void
        // >({
        //   query: () => "conferences-for-outsourced-reviewer",
        //   providesTags: ["Contract"],
        // }),

        // getPapersBelongToConference: builder.query<
        //   PaperDetailBelongToConferenceInReviewContractResponse[],
        //   string
        // >({
        //   query: (conferenceId) => ({
        //     url: "papers-belong-to-conference",
        //     params: { conferenceId },
        //   }),
        //   providesTags: ["Contract"],
        // }),
    }),
});

export const {
    useCreateReviewContractMutation,
    useGetUsersForReviewerContractQuery,
    useLazyGetUsersForReviewerContractQuery,
    //   useGetConferencesForOutsourcedReviewerQuery,
    //   useGetPapersBelongToConferenceQuery,
} = contractApi;
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { endpoint } from "../api/endpoint";
import { CollaboratorContractResponse, ContractDetailResponseForOrganizer, CreateCollaboratorContractRequest, CreateNewReviewerContractRequest, CreateReviewerContractRequest, GetUsersForReviewerContractRequest, GetUsersForReviewerContractResponse, OwnContractDetailResponse } from "@/types/contract.type";
import { apiClient } from "../api/apiClient";
import { ApiResponse, ApiResponsePagination } from "@/types/api.type";

export const contractApi = createApi({
    reducerPath: "contractApi",
    baseQuery: apiClient,
    tagTypes: ["Contract"],
    endpoints: (builder) => ({
        createReviewContract: builder.mutation<ApiResponse<number>, CreateReviewerContractRequest>({
            query: ({ reviewerId, wage, conferenceId, signDay, contractFile }) => {
                const formData = new FormData()
                formData.append("contractFile", contractFile)
                formData.append("reviewerId", reviewerId.toString())
                formData.append("wage", wage.toString())
                formData.append("conferenceId", conferenceId.toString())
                formData.append("signDay", signDay)

                return {
                    url: endpoint.CONTRACT.CREATE_REVIEWER_CONTRACT,
                    method: "POST",
                    body: formData,
                }
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

        createReviewContractForNewUser: builder.mutation<
            ApiResponse<number>,
            CreateNewReviewerContractRequest
        >({
            query: (data) => {
                const formData = new FormData();

                formData.append("email", data.email);
                formData.append("fullName", data.fullName);
                // formData.append("password", data.password);
                // formData.append("confirmPassword", data.confirmPassword);
                formData.append("wage", data.wage.toString());
                formData.append("conferenceId", data.conferenceId);
                formData.append("signDay", data.signDay);

                if (data.contractFile) {
                    formData.append("contractFile", data.contractFile);
                }

                return {
                    url: endpoint.CONTRACT.CREATE_REVIEW_CONTRACT_FOR_NEW_USER,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Contract"],
        }),

        getContractsByReviewer: builder.query<
            ApiResponse<ContractDetailResponseForOrganizer[]>,
            { reviewerId: string | number }
        >({
            query: ({ reviewerId }) => ({
                url: endpoint.CONTRACT.LIST_BY_REVIEWER,
                params: { reviewerId },
            }),
            providesTags: ["Contract"],
        }),

        getOwnReviewContracts: builder.query<
            ApiResponse<OwnContractDetailResponse[]>,
            void
        >({
            query: () => ({
                url: endpoint.CONTRACT.LIST_OWN_REVIEW_CONTRACT,
                method: "GET",
            }),
            providesTags: ["Contract"],
        }),

        createCollaboratorContract: builder.mutation<
            ApiResponse<number>,
            CreateCollaboratorContractRequest
        >({
            query: (data) => {
                const formData = new FormData();

                formData.append("userId", data.userId);
                formData.append("isMediaStep", data.isMediaStep.toString());
                formData.append("isPolicyStep", data.isPolicyStep.toString());
                formData.append("isSessionStep", data.isSessionStep.toString());
                formData.append("isPriceStep", data.isPriceStep.toString());
                formData.append("isTicketSelling", data.isTicketSelling.toString());
                formData.append("isSponsorStep", data.isSponsorStep.toString());
                formData.append("signDay", data.signDay);
                formData.append("finalizePaymentDate", data.finalizePaymentDate);
                formData.append("conferenceId", data.conferenceId);

                if (data.commission !== undefined) {
                    formData.append("commission", data.commission.toString());
                }

                formData.append("contractFile", data.contractFile);

                return {
                    url: endpoint.CONTRACT.CREATE_COLLABORATOR_CONTRACT,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Contract"],
        }),

        listCollaboratorContracts: builder.query<
            ApiResponsePagination<CollaboratorContractResponse[]>,
            {
                conferenceName?: string;
                organizationId?: string;
                userId?: string;
                page?: number;
                pageSize?: number;
            }
        >({
            query: (params) => ({
                url: endpoint.CONTRACT.LIST_COLLABORATOR_CONTRACT,
                params,
            }),
            providesTags: ["Contract"],
        }),
    }),
});

export const {
    useCreateReviewContractMutation,
    useGetUsersForReviewerContractQuery,
    useLazyGetUsersForReviewerContractQuery,
    //   useGetConferencesForOutsourcedReviewerQuery,
    //   useGetPapersBelongToConferenceQuery,
    useCreateReviewContractForNewUserMutation,
    useGetContractsByReviewerQuery,
    useGetOwnReviewContractsQuery,
    useCreateCollaboratorContractMutation,
    useListCollaboratorContractsQuery,
    useLazyListCollaboratorContractsQuery,
} = contractApi;
import {
    useCreateCollaboratorContractMutation,
    useCreateReviewContractMutation,
    useGetUsersForReviewerContractQuery,
    useLazyGetUsersForReviewerContractQuery,
    // useGetConferencesForOutsourcedReviewerQuery,
    // useGetPapersBelongToConferenceQuery,
} from "@/redux/services/contract.service";
import { parseApiError } from "@/helper/api";
import { ApiResponse } from "@/types/api.type";
import {
    CreateCollaboratorContractRequest,
    CreateReviewerContractRequest,
    GetUsersForReviewerContractRequest,
    GetUsersForReviewerContractResponse,
    // ConferenceBelongToReviewContractResponse,
    // PaperDetailBelongToConferenceInReviewContractResponse,
} from "@/types/contract.type";

export const useContract = (conferenceId: string) => {
    // ---------- CREATE REVIEW CONTRACT ----------
    const [
        createReviewContract,
        {
            isLoading: createContractLoading,
            error: createContractRawError,
            data: createContractData,
        },
    ] = useCreateReviewContractMutation();

    // ---------- GET USERS FOR REVIEW CONTRACT ----------
    const { data, isLoading, error } = useGetUsersForReviewerContractQuery({
        conferenceId,
    });
    const [
        fetchUsersForReviewerContract,
        {
            isLoading: lazyLoading,
            data: lazyData,
            error: lazyError,
        },
    ] = useLazyGetUsersForReviewerContractQuery();

    const [
        createCollaboratorContract,
        {
            isLoading: createCollaboratorLoading,
            error: createCollaboratorRawError,
            data: createCollaboratorData,
        },
    ] = useCreateCollaboratorContractMutation();

    // ---------- ERROR PARSING ----------
    const createContractError = parseApiError<string>(createContractRawError);
    const usersError = parseApiError<string>(error || lazyError);
    const createCollaboratorContractError =
        parseApiError<string>(createCollaboratorRawError);

    // ---------- ACTIONS ----------
    const createReviewerContract = async (
        request: CreateReviewerContractRequest
    ): Promise<ApiResponse<number>> => {
        try {
            const result = await createReviewContract(request).unwrap();
            return result;
        } catch (err) {
            throw err;
        }
    };

    const fetchAllUsersForReviewerContract = async (
        request: GetUsersForReviewerContractRequest
    ): Promise<GetUsersForReviewerContractResponse[]> => {
        try {
            const result = await fetchUsersForReviewerContract(request).unwrap();
            return result.data || [];
        } catch (err) {
            throw err;
        }
    };

    const createNewCollaboratorContract = async (
        request: CreateCollaboratorContractRequest
    ): Promise<ApiResponse<number>> => {
        try {
            const result = await createCollaboratorContract(request).unwrap();
            return result;
        } catch (err) {
            throw err;
        }
    };

    // ---------- (OPTIONAL) CONFERENCE & PAPER ----------
    // const { data: conferencesData, isLoading: conferencesLoading } = useGetConferencesForOutsourcedReviewerQuery();
    // const { data: papersData, isLoading: papersLoading } = useGetPapersBelongToConferenceQuery(conferenceId);

    return {
        // Actions
        createReviewerContract,
        fetchAllUsersForReviewerContract,

        // Data
        createContractResponse: createContractData,
        usersForReviewerContract: data?.data || lazyData?.data || [],
        createCollaboratorResponse: createCollaboratorData,

        // Loading
        loading: createContractLoading || createCollaboratorLoading || isLoading || lazyLoading,

        // Errors
        createContractError,
        usersError,
        createCollaboratorContractError,
    };
};

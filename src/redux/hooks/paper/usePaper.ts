import {
    useListSubmittedPapersForCustomerQuery,
    useLazyGetPaperDetailCustomerQuery,
    useListPaperPhasesQuery,
    useListAvailableCustomersQuery,
    useLazyListAvailableCustomersQuery,
    useSubmitAbstractMutation,
    useSubmitFullPaperMutation,
    useSubmitPaperRevisionMutation,
    useSubmitPaperRevisionResponseMutation,
    useSubmitCameraReadyMutation,
} from "@/redux/services/paper.service";
import { parseApiError } from "@/redux/utils/api";
import type { ApiResponse } from "@/types/api.type";
import type { AvailableCustomerResponse, CreateAbstractRequest, CreateCameraReadyRequest, CreateFullPaperRequest, CreateRevisionPaperSubmissionRequest, CreateRevisionPaperSubmissionResponse, PaperCustomer, PaperDetailResponse, PaperPhase } from "@/types/paper.type";

export const usePaperCustomer = () => {
    const {
        data: submittedPapersData,
        isLoading: submittedPapersLoading,
        error: submittedPapersRawError,
    } = useListSubmittedPapersForCustomerQuery();

    const [
        getPaperDetailCustomer,
        {
            data: paperDetailData,
            isLoading: paperDetailLoading,
            error: paperDetailRawError,
        },
    ] = useLazyGetPaperDetailCustomerQuery();

    const {
        data: paperPhasesData,
        isLoading: paperPhasesLoading,
        error: paperPhasesRawError,
    } = useListPaperPhasesQuery();

    const {
        data: availableCustomersData,
        isLoading: availableCustomersLoading,
        error: availableCustomersRawError,
    } = useListAvailableCustomersQuery();

    const [
        getAvailableCustomers,
        {
            data: lazyAvailableCustomersData,
            isLoading: lazyAvailableCustomersLoading,
            error: lazyAvailableCustomersRawError,
        },
    ] = useLazyListAvailableCustomersQuery();

    const [submitAbstract, { isLoading: submitAbstractLoading, error: submitAbstractRawError }] =
        useSubmitAbstractMutation();

    const [submitFullPaper, { isLoading: submitFullPaperLoading, error: submitFullPaperRawError }] =
        useSubmitFullPaperMutation();

    const [submitPaperRevision, { isLoading: submitRevisionLoading, error: submitRevisionRawError }] =
        useSubmitPaperRevisionMutation();

    const [submitPaperRevisionResponse, { isLoading: submitRevisionResponseLoading, error: submitRevisionResponseRawError }] =
        useSubmitPaperRevisionResponseMutation();

    const [submitCameraReady, { isLoading: submitCameraReadyLoading, error: submitCameraReadyRawError }] =
        useSubmitCameraReadyMutation();

    // errors
    const submittedPapersError = parseApiError<string>(submittedPapersRawError);
    const paperDetailError = parseApiError<string>(paperDetailRawError);
    const paperPhasesError = parseApiError<string>(paperPhasesRawError);
    const availableCustomersError = parseApiError<string>(availableCustomersRawError);
    const lazyAvailableCustomersError = parseApiError<string>(lazyAvailableCustomersRawError);
    const submitAbstractError = parseApiError<string>(submitAbstractRawError);
    const submitFullPaperError = parseApiError<string>(submitFullPaperRawError);
    const submitRevisionError = parseApiError<string>(submitRevisionRawError);
    const submitRevisionResponseError = parseApiError<string>(submitRevisionResponseRawError);
    const submitCameraReadyError = parseApiError<string>(submitCameraReadyRawError);

    const fetchPaperDetail = async (
        paperId: string
    ): Promise<ApiResponse<PaperDetailResponse>> => {
        try {
            const result = await getPaperDetailCustomer(paperId).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const fetchAvailableCustomers = async (): Promise<ApiResponse<AvailableCustomerResponse[]>> => {
        try {
            const result = await getAvailableCustomers().unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmitAbstract = async (
        request: CreateAbstractRequest
    ): Promise<ApiResponse<number>> => {
        try {
            const result = await submitAbstract(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmitFullPaper = async (
        request: CreateFullPaperRequest
    ): Promise<ApiResponse<number>> => {
        try {
            const result = await submitFullPaper(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmitPaperRevision = async (
        request: CreateRevisionPaperSubmissionRequest
    ): Promise<ApiResponse<number>> => {
        try {
            const result = await submitPaperRevision(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmitPaperRevisionResponse = async (
        request: CreateRevisionPaperSubmissionResponse
    ): Promise<ApiResponse<number>> => {
        try {
            const result = await submitPaperRevisionResponse(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmitCameraReady = async (
        request: CreateCameraReadyRequest
    ): Promise<ApiResponse<string>> => {
        try {
            const result = await submitCameraReady(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const loading =
        submittedPapersLoading ||
        paperDetailLoading ||
        paperPhasesLoading ||
        availableCustomersLoading ||
        lazyAvailableCustomersLoading ||
        submitAbstractLoading ||
        submitFullPaperLoading ||
        submitRevisionLoading ||
        submitRevisionResponseLoading ||
        submitCameraReadyLoading;
    ;

    return {
        //Data
        submittedPapers: submittedPapersData?.data || [],
        paperDetail: paperDetailData?.data || null,
        paperPhases: paperPhasesData?.data || [],
        availableCustomers: availableCustomersData?.data || lazyAvailableCustomersData?.data || [],

        fetchPaperDetail,
        fetchAvailableCustomers,
        handleSubmitAbstract,
        handleSubmitFullPaper,
        handleSubmitPaperRevision,
        handleSubmitPaperRevisionResponse,
        handleSubmitCameraReady,

        //Loading
        loading,

        //Errors
        submittedPapersError,
        paperDetailError,
        paperPhasesError,
        availableCustomersError,
        lazyAvailableCustomersError,
        submitAbstractError,
        submitFullPaperError,
        submitRevisionError,
        submitRevisionResponseError,
        submitCameraReadyError,
    };
};

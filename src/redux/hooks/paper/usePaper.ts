import {
    useListSubmittedPapersForCustomerQuery,
    useLazyGetPaperDetailCustomerQuery,
    useListPaperPhasesQuery,
} from "@/redux/services/paper.service";
import { parseApiError } from "@/redux/utils/api";
import type { ApiResponse } from "@/types/api.type";
import type { PaperCustomer, PaperDetailResponse, PaperPhase } from "@/types/paper.type";

export const usePaperCustomer = () => {
    // --- 1️⃣ List all submitted papers for the logged-in customer ---
    const {
        data: submittedPapersData,
        isLoading: submittedPapersLoading,
        error: submittedPapersRawError,
    } = useListSubmittedPapersForCustomerQuery();

    // --- 2️⃣ Lazy query: get paper detail by id ---
    const [
        getPaperDetailCustomer,
        {
            data: paperDetailData,
            isLoading: paperDetailLoading,
            error: paperDetailRawError,
        },
    ] = useLazyGetPaperDetailCustomerQuery();

    // --- 3️⃣ List all paper phases ---
    const {
        data: paperPhasesData,
        isLoading: paperPhasesLoading,
        error: paperPhasesRawError,
    } = useListPaperPhasesQuery();

    // --- Format errors ---
    const submittedPapersError = parseApiError<string>(submittedPapersRawError);
    const paperDetailError = parseApiError<string>(paperDetailRawError);
    const paperPhasesError = parseApiError<string>(paperPhasesRawError);

    // --- Async Actions ---
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

    // --- Combined loading state ---
    const loading = submittedPapersLoading || paperDetailLoading || paperPhasesLoading;

    return {
        // ✅ Data
        submittedPapers: submittedPapersData?.data || [],
        paperDetail: paperDetailData?.data || null,
        paperPhases: paperPhasesData?.data || [],

        // ✅ Actions
        fetchPaperDetail,

        // ✅ Loading
        loading,

        // ✅ Errors
        submittedPapersError,
        paperDetailError,
        paperPhasesError,
    };
};

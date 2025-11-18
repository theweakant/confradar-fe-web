import { parseApiError } from "@/helper/api";
import { ApiResponse } from "@/types/api.type";
import {
    ChangePresenterRequest,
    ChangeSessionRequest,
} from "@/types/assigningpresentersession.type";
import {
    useRequestChangePresenterMutation,
    useRequestChangeSessionMutation,
} from "@/redux/services/assigningpresentersession.service";

export const usePresenter = () => {
    const [
        requestChangePresenter,
        {
            isLoading: presenterLoading,
            error: presenterRawError,
            data: presenterData,
        },
    ] = useRequestChangePresenterMutation();

    const [
        requestChangeSession,
        {
            isLoading: sessionLoading,
            error: sessionRawError,
            data: sessionData,
        },
    ] = useRequestChangeSessionMutation();

    // Parse errors
    const changePresenterError = parseApiError<string>(presenterRawError);
    const changeSessionError = parseApiError<string>(sessionRawError);

    // Actions
    const changePresenter = async (
        request: ChangePresenterRequest
    ): Promise<ApiResponse<string>> => {
        try {
            const result = await requestChangePresenter(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const changeSession = async (
        request: ChangeSessionRequest
    ): Promise<ApiResponse<string>> => {
        try {
            const result = await requestChangeSession(request).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    return {
        // Actions
        changePresenter,
        changeSession,

        // Loading
        loading: presenterLoading || sessionLoading,

        // Errors
        changePresenterError,
        changeSessionError,

        // Data responses
        changePresenterResponse: presenterData,
        changeSessionResponse: sessionData,
    };
};
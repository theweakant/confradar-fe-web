import { useGetAllConferencesQuery, useGetConferenceByIdQuery, useLazyGetAllConferencesQuery, useLazyGetConferenceByIdQuery } from '@/redux/services/conference.service';
import { ApiResponse } from '@/types/api.type';
import { ConferenceResponse } from '@/types/conference.type';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useCallback } from 'react';

// type ApiError<T = null> = FetchBaseQueryError & {
//     data?: ApiResponse<T>;
// };

export const useConference = () => {
    const parseError = (error: FetchBaseQueryError | SerializedError | undefined): string => {
        if (!error) return 'Có lỗi xảy ra khi tải thông tin hội nghị.';

        if ('data' in error) {
            const data = error.data as ApiResponse<null>;
            if (data?.message) return data.message;
            if (typeof data === 'string') return data;
        }

        if ('message' in error && error.message) return error.message;

        return 'Có lỗi xảy ra khi tải thông tin hội nghị.';
    };
    // const parseError = (error: any): string => {
    //     if (error?.data?.Message) return error.data.Message;
    //     if (error?.data?.message) return error.data.message;
    //     if (typeof error?.data === 'string') return error.data;
    //     return 'Có lỗi xảy ra khi tải thông tin hội nghị.';
    // };

    const {
        data: conferencesData,
        error: conferencesError,
        isLoading: conferencesLoading,
        isFetching: conferencesFetching,
        refetch: refetchConferences,
    } = useGetAllConferencesQuery();

    const {
        data: conferenceData,
        error: conferenceError,
        isLoading: conferenceLoading,
        isFetching: conferenceFetching,
        refetch: refetchConference,
    } = useGetConferenceByIdQuery('', { skip: true });

    const [triggerGetAll, { data: lazyConferences, error: lazyConferencesError, isLoading: lazyConferencesLoading }] =
        useLazyGetAllConferencesQuery();

    const [triggerGetById, { data: lazyConference, error: lazyConferenceError, isLoading: lazyConferenceLoading }] =
        useLazyGetConferenceByIdQuery();

    const fetchConferences = useCallback(async () => {
        try {
            return await triggerGetAll().unwrap();
        } catch (err) {
            throw err;
        }
    }, [triggerGetAll]);

    const fetchConference = useCallback(
        async (id: string): Promise<ApiResponse<ConferenceResponse>> => {
            try {
                return await triggerGetById(id).unwrap();
            } catch (err) {
                throw err;
            }
        },
        [triggerGetById]
    );

    return {
        conferences: conferencesData?.data || [],
        conference: conferenceData?.data || null,

        lazyConferences: lazyConferences?.data || [],
        lazyConference: lazyConference?.data || null,

        fetchConferences,
        fetchConference,
        refetchConferences,
        refetchConference,

        loading:
            conferencesLoading ||
            conferenceLoading ||
            lazyConferencesLoading ||
            lazyConferenceLoading ||
            conferencesFetching ||
            conferenceFetching,
        error:
            conferencesError
                ? parseError(conferencesError)
                : conferenceError
                    ? parseError(conferenceError)
                    : lazyConferencesError
                        ? parseError(lazyConferencesError)
                        : lazyConferenceError
                            ? parseError(lazyConferenceError)
                            : null,
    };
};
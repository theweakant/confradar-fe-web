// import { useGetAllConferencesWithPricesPaginationQuery, useGetConferenceByIdQuery, useLazyGetAllConferencesWithPricesPaginationQuery, useLazyGetConferenceByIdQuery } from '@/redux/services/conference.service';
import { useGetAllConferencesPaginationQuery, useLazyGetAllConferencesPaginationQuery, useLazyGetAllConferencesWithPricesPaginationQuery, useLazyGetConferencesByStatusQuery } from '@/redux/services/conference.service';
import { parseApiError } from '@/redux/utils/api';
import { ApiResponse } from '@/types/api.type';
import { ConferenceResponse } from '@/types/conference.type';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useCallback } from 'react';

export const useConference = () => {
    // Auto-fetch default paginated list
    const {
        data: defaultConferencesData,
        error: defaultConferencesError,
        isLoading: defaultConferencesLoading,
        isFetching: defaultConferencesFetching,
        refetch: refetchDefaultConferences,
    } = useGetAllConferencesPaginationQuery({ page: 1, pageSize: 10 });

    // Lazy load default paginated list
    const [triggerGetAll, { data: lazyDefaultData, error: lazyDefaultError, isLoading: lazyDefaultLoading }] =
        useLazyGetAllConferencesPaginationQuery();

    // Lazy load all conferences with price & filter
    const [triggerGetAllWithPrices, { data: lazyWithPricesData, error: lazyWithPricesError, isLoading: lazyWithPricesLoading }] =
        useLazyGetAllConferencesWithPricesPaginationQuery();

    // Lazy load conferences by status
    const [triggerGetByStatus, { data: statusConferencesData, error: statusConferencesError, isLoading: statusConferencesLoading }] =
        useLazyGetConferencesByStatusQuery();

    // Fetch functions
    const fetchDefaultConferences = useCallback(
        (params?: { page?: number; pageSize?: number }) => triggerGetAll(params || {}).unwrap(),
        [triggerGetAll]
    );

    const fetchConferencesWithPrices = useCallback(
        (params?: { page?: number; pageSize?: number; searchKeyword?: string; cityId?: string; startDate?: string; endDate?: string }) =>
            triggerGetAllWithPrices(params || {}).unwrap(),
        [triggerGetAllWithPrices]
    );

    const fetchConferencesByStatus = useCallback(
        (statusId: string, params?: { page?: number; pageSize?: number; searchKeyword?: string; cityId?: string; startDate?: string; endDate?: string }) =>
            triggerGetByStatus({ conferenceStatusId: statusId, ...params }).unwrap(),
        [triggerGetByStatus]
    );

    return {
        // Default paginated conferences
        defaultConferences: defaultConferencesData?.data,
        lazyDefaultConferences: lazyDefaultData?.data,
        fetchDefaultConferences,
        refetchDefaultConferences,
        defaultLoading: defaultConferencesLoading || defaultConferencesFetching || lazyDefaultLoading,
        // defaultError: defaultConferencesError || lazyDefaultError,

        // Conferences with prices (filterable)
        lazyConferencesWithPrices: lazyWithPricesData?.data,
        fetchConferencesWithPrices,
        lazyWithPricesLoading,
        // lazyWithPricesError,

        // Conferences by status
        statusConferences: statusConferencesData?.data,
        fetchConferencesByStatus,
        statusConferencesLoading,
        // statusConferencesError,

        defaultError: parseApiError<ConferenceResponse[]>(defaultConferencesError || lazyDefaultError),
        lazyWithPricesError: parseApiError<ConferenceResponse[]>(lazyWithPricesError),
        statusConferencesError: parseApiError<ConferenceResponse[]>(statusConferencesError),
    };
};

// type ApiError<T = null> = FetchBaseQueryError & {
//     data?: ApiResponse<T>;
// };

// export const useConference = () => {
//     const parseError = (error: FetchBaseQueryError | SerializedError | undefined): string => {
//         if (!error) return 'Có lỗi xảy ra khi tải thông tin hội nghị.';

//         if ('data' in error) {
//             const data = error.data as ApiResponse<null>;
//             if (data?.message) return data.message;
//             if (typeof data === 'string') return data;
//         }

//         if ('message' in error && error.message) return error.message;

//         return 'Có lỗi xảy ra khi tải thông tin hội nghị.';
//     };
//     // const parseError = (error: any): string => {
//     //     if (error?.data?.Message) return error.data.Message;
//     //     if (error?.data?.message) return error.data.message;
//     //     if (typeof error?.data === 'string') return error.data;
//     //     return 'Có lỗi xảy ra khi tải thông tin hội nghị.';
//     // };

//     const {
//         data: conferencesData,
//         error: conferencesError,
//         isLoading: conferencesLoading,
//         isFetching: conferencesFetching,
//         refetch: refetchConferences,
//     } = useGetAllConferencesWithPricesPaginationQuery();

//     const {
//         data: conferenceData,
//         error: conferenceError,
//         isLoading: conferenceLoading,
//         isFetching: conferenceFetching,
//         refetch: refetchConference,
//     } = useGetConferenceByIdQuery('', { skip: true });

//     const [triggerGetAll, { data: lazyConferences, error: lazyConferencesError, isLoading: lazyConferencesLoading }] =
//         useLazyGetAllConferencesWithPricesPaginationQuery();

//     const [triggerGetById, { data: lazyConference, error: lazyConferenceError, isLoading: lazyConferenceLoading }] =
//         useLazyGetConferenceByIdQuery();

//     const fetchConferences = useCallback(async () => {
//         try {
//             return await triggerGetAll().unwrap();
//         } catch (err) {
//             throw err;
//         }
//     }, [triggerGetAll]);

//     const fetchConference = useCallback(
//         async (id: string): Promise<ApiResponse<ConferenceResponse>> => {
//             try {
//                 return await triggerGetById(id).unwrap();
//             } catch (err) {
//                 throw err;
//             }
//         },
//         [triggerGetById]
//     );

//     return {
//         conferences: conferencesData?.data || [],
//         conference: conferenceData?.data || null,

//         lazyConferences: lazyConferences?.data || [],
//         lazyConference: lazyConference?.data || null,

//         fetchConferences,
//         fetchConference,
//         refetchConferences,
//         refetchConference,

//         loading:
//             conferencesLoading ||
//             conferenceLoading ||
//             lazyConferencesLoading ||
//             lazyConferenceLoading ||
//             conferencesFetching ||
//             conferenceFetching,
//         error:
//             conferencesError
//                 ? parseError(conferencesError)
//                 : conferenceError
//                     ? parseError(conferenceError)
//                     : lazyConferencesError
//                         ? parseError(lazyConferencesError)
//                         : lazyConferenceError
//                             ? parseError(lazyConferenceError)
//                             : null,
//     };
// };
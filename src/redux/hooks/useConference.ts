// import { useGetAllConferencesWithPricesPaginationQuery, useGetConferenceByIdQuery, useLazyGetAllConferencesWithPricesPaginationQuery, useLazyGetConferenceByIdQuery } from '@/redux/services/conference.service';
import {
  useAddToFavouriteMutation,
  useDeleteFromFavouriteMutation,
  useGetAllConferencesPaginationQuery,
  useGetOwnConferencesForScheduleQuery,
  useGetOwnFavouriteConferencesQuery,
  useGetResearchConferenceDetailQuery,
  useGetTechnicalConferenceDetailQuery,
  useLazyGetAllConferencesPaginationQuery,
  useLazyGetAllConferencesWithPricesPaginationQuery,
  useLazyGetConferencesByStatusQuery,
  useLazyGetConferencesHasAssignedPaperForLocalReviewerQuery,
  useLazyGetOwnConferencesForScheduleQuery,
  useLazyGetOwnFavouriteConferencesQuery,
} from "@/redux/services/conference.service";
import { parseApiError } from "@/helper/api";
import {
  AddedFavouriteConferenceResponse,
  ConferenceDetailForScheduleResponse,
  ConferenceResponse,
  DeletedFavouriteConferenceResponse,
  FavouriteConferenceDetailResponse,
} from "@/types/conference.type";
import { useCallback } from "react";

export const useConference = (params?: {
  page?: number;
  pageSize?: number;
  id?: string;
}) => {
  const {
    data: defaultConferencesData,
    error: defaultConferencesError,
    isLoading: defaultConferencesLoading,
    isFetching: defaultConferencesFetching,
    refetch: refetchDefaultConferences,
  } = useGetAllConferencesPaginationQuery({
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 12,
  });

  const {
    data: technicalConferenceData,
    error: technicalConferenceError,
    isLoading: technicalConferenceLoading,
    isFetching: technicalConferenceFetching,
    refetch: refetchTechnicalConference,
  } = useGetTechnicalConferenceDetailQuery(params?.id ?? "", {
    skip: !params?.id,
  });

  const {
    data: researchConferenceData,
    error: researchConferenceError,
    isLoading: researchConferenceLoading,
    isFetching: researchConferenceFetching,
    refetch: refetchResearchConference,
  } = useGetResearchConferenceDetailQuery(params?.id ?? "", {
    skip: !params?.id,
  });

  // Lazy load default paginated list
  const [
    triggerGetAll,
    {
      data: lazyDefaultData,
      error: lazyDefaultError,
      isLoading: lazyDefaultLoading,
    },
  ] = useLazyGetAllConferencesPaginationQuery();

  // Lazy load all conferences with price & filter
  const [
    triggerGetAllWithPrices,
    {
      data: lazyWithPricesData,
      error: lazyWithPricesError,
      isLoading: lazyWithPricesLoading,
    },
  ] = useLazyGetAllConferencesWithPricesPaginationQuery();

  // Lazy load conferences by status
  const [
    triggerGetByStatus,
    {
      data: statusConferencesData,
      error: statusConferencesError,
      isLoading: statusConferencesLoading,
    },
  ] = useLazyGetConferencesByStatusQuery();

  // const {
  //     data: favouriteConferencesData,
  //     error: favouriteConferencesError,
  //     isLoading: favouriteConferencesLoading,
  //     isFetching: favouriteConferencesFetching,
  //     refetch: refetchFavouriteConferences,
  // } = useGetOwnFavouriteConferencesQuery();

  const [
    triggerGetFavourites,
    {
      data: lazyFavouritesData,
      error: lazyFavouritesError,
      isLoading: lazyFavouritesLoading,
    },
  ] = useLazyGetOwnFavouriteConferencesQuery();

  // const {
  //     data: ownConferencesScheduleData,
  //     error: ownConferencesScheduleError,
  //     isLoading: ownConferencesScheduleLoading,
  //     isFetching: ownConferencesScheduleFetching,
  //     refetch: refetchOwnConferencesSchedule,
  // } = useGetOwnConferencesForScheduleQuery();

  const [
    triggerGetOwnConferencesSchedule,
    {
      data: lazyOwnConferencesScheduleData,
      error: lazyOwnConferencesScheduleError,
      isLoading: lazyOwnConferencesScheduleLoading,
    },
  ] = useLazyGetOwnConferencesForScheduleQuery();

  const [
    triggerGetAssignedConferences,
    {
      data: assignedConferencesData,
      error: assignedConferencesError,
      isLoading: assignedConferencesLoading,
    },
  ] = useLazyGetConferencesHasAssignedPaperForLocalReviewerQuery();

  // Favourite mutations
  const [
    addToFavourite,
    { isLoading: addingToFavourite, error: addToFavouriteError },
  ] = useAddToFavouriteMutation();

  const [
    deleteFromFavourite,
    { isLoading: deletingFromFavourite, error: deleteFromFavouriteError },
  ] = useDeleteFromFavouriteMutation();

  // Fetch functions
  const fetchDefaultConferences = useCallback(
    (params?: { page?: number; pageSize?: number }) =>
      triggerGetAll(params || {}).unwrap(),
    [triggerGetAll],
  );

  const fetchConferencesWithPrices = useCallback(
    (params?: {
      page?: number;
      pageSize?: number;
      searchKeyword?: string;
      cityId?: string;
      startDate?: string;
      endDate?: string;
      rankingCategoryId?: string;
      allowListener?: boolean;
    }) => triggerGetAllWithPrices(params || {}).unwrap(),
    [triggerGetAllWithPrices],
  );

  const fetchConferencesByStatus = useCallback(
    (
      statusId: string,
      params?: {
        page?: number;
        pageSize?: number;
        searchKeyword?: string;
        cityId?: string;
        startDate?: string;
        endDate?: string;
      },
    ) =>
      triggerGetByStatus({ conferenceStatusId: statusId, ...params }).unwrap(),
    [triggerGetByStatus],
  );

  const fetchFavouriteConferences = useCallback(
    () => triggerGetFavourites().unwrap(),
    [triggerGetFavourites],
  );

  const addFavourite = useCallback(
    (conferenceId: string) => addToFavourite({ conferenceId }).unwrap(),
    [addToFavourite],
  );

  const removeFavourite = useCallback(
    (conferenceId: string) => deleteFromFavourite({ conferenceId }).unwrap(),
    [deleteFromFavourite],
  );

  const fetchOwnConferencesForSchedule = useCallback(
    () => triggerGetOwnConferencesSchedule().unwrap(),
    [triggerGetOwnConferencesSchedule],
  );

  const fetchAssignedConferences = useCallback(
    () => triggerGetAssignedConferences().unwrap(),
    [triggerGetAssignedConferences],
  );

  return {
    // Default paginated conferences
    defaultConferences: defaultConferencesData?.data,
    lazyDefaultConferences: lazyDefaultData?.data,
    fetchDefaultConferences,
    refetchDefaultConferences,
    defaultLoading:
      defaultConferencesLoading ||
      defaultConferencesFetching ||
      lazyDefaultLoading,
    // defaultError: defaultConferencesError || lazyDefaultError,
    defaultError: parseApiError<ConferenceResponse[]>(
      defaultConferencesError || lazyDefaultError,
    ),

    // Conferences with prices (filterable)
    lazyConferencesWithPrices: lazyWithPricesData?.data,
    fetchConferencesWithPrices,
    lazyWithPricesLoading,
    // lazyWithPricesError,
    lazyWithPricesError:
      parseApiError<ConferenceResponse[]>(lazyWithPricesError),

    // Conferences by status
    statusConferences: statusConferencesData?.data,
    fetchConferencesByStatus,
    statusConferencesLoading,
    // statusConferencesError,
    statusConferencesError: parseApiError<ConferenceResponse[]>(
      statusConferencesError,
    ),

    // technical conference
    technicalConference: technicalConferenceData?.data,
    refetchTechnicalConference,
    technicalConferenceLoading:
      technicalConferenceLoading || technicalConferenceFetching,
    technicalConferenceError: parseApiError(technicalConferenceError),

    // Research conference
    researchConference: researchConferenceData?.data,
    refetchResearchConference,
    researchConferenceLoading:
      researchConferenceLoading || researchConferenceFetching,
    researchConferenceError: parseApiError(researchConferenceError),

    // Favourite conferences
    // favouriteConferences: favouriteConferencesData?.data,
    lazyFavouriteConferences: lazyFavouritesData?.data,
    fetchFavouriteConferences,
    // refetchFavouriteConferences,
    favouriteConferencesLoading: lazyFavouritesLoading,
    favouriteConferencesError:
      parseApiError<FavouriteConferenceDetailResponse[]>(lazyFavouritesError),

    //   favouriteConferencesLoading: favouriteConferencesLoading || favouriteConferencesFetching || lazyFavouritesLoading,
    // favouriteConferencesError: parseApiError<FavouriteConferenceDetailResponse[]>(
    //     favouriteConferencesError || lazyFavouritesError
    // ),

    // Favourite mutations
    addFavourite,
    removeFavourite,
    addingToFavourite,
    deletingFromFavourite,
    addToFavouriteError:
      parseApiError<AddedFavouriteConferenceResponse>(addToFavouriteError),
    deleteFromFavouriteError: parseApiError<DeletedFavouriteConferenceResponse>(
      deleteFromFavouriteError,
    ),

    // --- Own Conferences for Schedule ---
    // ownConferencesForSchedule: ownConferencesScheduleData?.data,
    lazyOwnConferencesForSchedule: lazyOwnConferencesScheduleData?.data,
    fetchOwnConferencesForSchedule,
    // refetchOwnConferencesSchedule,
    ownConferencesForScheduleLoading: lazyOwnConferencesScheduleLoading,
    ownConferencesForScheduleError: parseApiError<
      ConferenceDetailForScheduleResponse[]
    >(lazyOwnConferencesScheduleError),

    // Assigned conferences for local reviewer
    lazyAssignedConferences: assignedConferencesData?.data as ConferenceResponse[] | undefined,
    fetchAssignedConferences,
    assignedConferencesLoading,
    assignedConferencesError: parseApiError<ConferenceResponse[]>(assignedConferencesError),

    //   ownConferencesForScheduleLoading:
    //     ownConferencesScheduleLoading || ownConferencesScheduleFetching || lazyOwnConferencesScheduleLoading,
    // ownConferencesForScheduleError: parseApiError<ConferenceDetailForScheduleResponse[]>(
    //     ownConferencesScheduleError || lazyOwnConferencesScheduleError
    // ),
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
//     //     if (error?.data?.message) return error.data.Message;
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

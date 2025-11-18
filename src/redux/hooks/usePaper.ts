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
  useListCustomerWaitListQuery,
  useAddToWaitListMutation,
  useLeaveWaitListMutation,
  useLazyListCustomerWaitListQuery,
  useLazyListSubmittedPapersForCustomerQuery,
  useUpdateAbstractMutation,
  useUpdateFullPaperMutation,
  useUpdateRevisionSubmissionMutation,
  useUpdateCameraReadyMutation,
} from "@/redux/services/paper.service";
import { parseApiError } from "@/helper/api";
import type { ApiResponse } from "@/types/api.type";
import type {
  AvailableCustomerResponse,
  CreateAbstractRequest,
  CreateCameraReadyRequest,
  CreateFullPaperRequest,
  CreateRevisionPaperSubmissionRequest,
  CreateRevisionPaperSubmissionResponse,
  PaperCustomer,
  PaperDetailResponse,
  PaperPhase,
} from "@/types/paper.type";
import { LeaveWaitListRequest } from "@/types/waitlist.type";
import { useCallback } from "react";

export const usePaperCustomer = () => {
  // const {
  //     data: submittedPapersData,
  //     isLoading: submittedPapersLoading,
  //     error: submittedPapersRawError,
  // } = useListSubmittedPapersForCustomerQuery();

  const [
    getSubmittedPapers,
    {
      data: submittedPapersData,
      isLoading: submittedPapersLoading,
      error: submittedPapersRawError,
    },
  ] = useLazyListSubmittedPapersForCustomerQuery();

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

  const [
    submitAbstract,
    { isLoading: submitAbstractLoading, error: submitAbstractRawError },
  ] = useSubmitAbstractMutation();

  const [
    submitFullPaper,
    { isLoading: submitFullPaperLoading, error: submitFullPaperRawError },
  ] = useSubmitFullPaperMutation();

  const [
    submitPaperRevision,
    { isLoading: submitRevisionLoading, error: submitRevisionRawError },
  ] = useSubmitPaperRevisionMutation();

  const [
    submitPaperRevisionResponse,
    {
      isLoading: submitRevisionResponseLoading,
      error: submitRevisionResponseRawError,
    },
  ] = useSubmitPaperRevisionResponseMutation();

  const [
    submitCameraReady,
    { isLoading: submitCameraReadyLoading, error: submitCameraReadyRawError },
  ] = useSubmitCameraReadyMutation();

  // const {
  //     data: waitListData,
  //     isLoading: waitListLoading,
  //     error: waitListRawError,
  // } = useListCustomerWaitListQuery();

  const [
    getWaitList,
    { data: waitListData, isLoading: waitListLoading, error: waitListRawError },
  ] = useLazyListCustomerWaitListQuery();

  const [
    addToWaitList,
    { isLoading: addingToWaitListLoading, error: addToWaitListRawError },
  ] = useAddToWaitListMutation();

  const [
    leaveWaitList,
    { isLoading: leavingWaitListLoading, error: leaveWaitListRawError },
  ] = useLeaveWaitListMutation();

  const [
    updateAbstract,
    { isLoading: updateAbstractLoading, error: updateAbstractRawError },
  ] = useUpdateAbstractMutation();

  const [
    updateFullPaper,
    { isLoading: updateFullPaperLoading, error: updateFullPaperRawError },
  ] = useUpdateFullPaperMutation();

  const [
    updateRevisionSubmission,
    { isLoading: updateRevisionLoading, error: updateRevisionRawError },
  ] = useUpdateRevisionSubmissionMutation();

  const [
    updateCameraReady,
    { isLoading: updateCameraReadyLoading, error: updateCameraReadyRawError },
  ] = useUpdateCameraReadyMutation();

  // errors
  const submittedPapersError = parseApiError<string>(submittedPapersRawError);
  const paperDetailError = parseApiError<string>(paperDetailRawError);
  const paperPhasesError = parseApiError<string>(paperPhasesRawError);
  const availableCustomersError = parseApiError<string>(
    availableCustomersRawError,
  );
  const lazyAvailableCustomersError = parseApiError<string>(
    lazyAvailableCustomersRawError,
  );
  const submitAbstractError = parseApiError<string>(submitAbstractRawError);
  const submitFullPaperError = parseApiError<string>(submitFullPaperRawError);
  const submitRevisionError = parseApiError<string>(submitRevisionRawError);
  const submitRevisionResponseError = parseApiError<string>(
    submitRevisionResponseRawError,
  );
  const submitCameraReadyError = parseApiError<string>(
    submitCameraReadyRawError,
  );
  const waitListError = parseApiError<string>(waitListRawError);
  const addToWaitListError = parseApiError<string>(addToWaitListRawError);
  const leaveWaitListError = parseApiError<string>(leaveWaitListRawError);

  const updateAbstractError = parseApiError<string>(updateAbstractRawError);
  const updateFullPaperError = parseApiError<string>(updateFullPaperRawError);
  const updateRevisionError = parseApiError<string>(updateRevisionRawError);
  const updateCameraReadyError = parseApiError<string>(updateCameraReadyRawError);

  const fetchSubmittedPapers = useCallback(async (): Promise<
    ApiResponse<PaperCustomer[]>
  > => {
    try {
      const result = await getSubmittedPapers().unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [getSubmittedPapers]);

  const fetchPaperDetail = useCallback(
    async (paperId: string): Promise<ApiResponse<PaperDetailResponse>> => {
      try {
        const result = await getPaperDetailCustomer(paperId).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [getPaperDetailCustomer],
  );

  // const fetchPaperDetail = async (
  //     paperId: string
  // ): Promise<ApiResponse<PaperDetailResponse>> => {
  //     try {
  //         const result = await getPaperDetailCustomer(paperId).unwrap();
  //         return result;
  //     } catch (error) {
  //         throw error;
  //     }
  // };

  const fetchAvailableCustomers = async (): Promise<
    ApiResponse<AvailableCustomerResponse[]>
  > => {
    try {
      const result = await getAvailableCustomers().unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitAbstract = async (
    request: CreateAbstractRequest,
  ): Promise<ApiResponse<number>> => {
    try {
      const result = await submitAbstract(request).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitFullPaper = async (
    request: CreateFullPaperRequest,
  ): Promise<ApiResponse<number>> => {
    try {
      const result = await submitFullPaper(request).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitPaperRevision = async (
    request: CreateRevisionPaperSubmissionRequest,
  ): Promise<ApiResponse<number>> => {
    try {
      const result = await submitPaperRevision(request).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitPaperRevisionResponse = async (
    request: CreateRevisionPaperSubmissionResponse,
  ): Promise<ApiResponse<number>> => {
    try {
      const formData = new FormData();

      // formData.append('revisionPaperSubmissionId', request.revisionPaperSubmissionId);
      // formData.append('paperId', request.paperId);
      // formData.append('responses', JSON.stringify(request.responses));

      // const result = await submitPaperRevisionResponse(formData).unwrap();
      const result = await submitPaperRevisionResponse(request).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitCameraReady = async (
    request: CreateCameraReadyRequest,
  ): Promise<ApiResponse<string>> => {
    try {
      const result = await submitCameraReady(request).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const fetchWaitList = useCallback(async () => {
    try {
      const result = await getWaitList().unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [getWaitList]);

  const handleAddToWaitList = useCallback(
    async (conferenceId: string): Promise<ApiResponse<boolean>> => {
      try {
        const result = await addToWaitList({
          conferenceId,
        } as LeaveWaitListRequest).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [addToWaitList],
  );

  const handleLeaveWaitList = useCallback(
    async (conferenceId: string): Promise<ApiResponse<boolean>> => {
      try {
        const result = await leaveWaitList({
          conferenceId,
        } as LeaveWaitListRequest).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [leaveWaitList],
  );

  const handleUpdateAbstract = useCallback(
    async (
      paperId: string,
      data: { title?: string; description?: string; abstractFile?: File | null; coAuthorId?: string[] }
    ): Promise<ApiResponse<unknown>> => {
      try {
        const result = await updateAbstract({ paperId, ...data }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateAbstract]
  );

  const handleUpdateFullPaper = useCallback(
    async (
      paperId: string,
      data: { title?: string; description?: string; fullPaperFile?: File | null }
    ): Promise<ApiResponse<unknown>> => {
      try {
        const result = await updateFullPaper({ paperId, ...data }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateFullPaper]
  );

  const handleUpdateRevisionSubmission = useCallback(
    async (
      paperId: string,
      revisionPaperSubmissionId: string,
      data: { title?: string; description?: string; revisionPaperFile?: File | null }
    ): Promise<ApiResponse<unknown>> => {
      try {
        const result = await updateRevisionSubmission({
          paperId,
          revisionPaperSubmissionId,
          ...data,
        }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateRevisionSubmission]
  );

  const handleUpdateCameraReady = useCallback(
    async (
      cameraReadyId: string,
      data: { title?: string; description?: string; cameraReadyFile?: File | null }
    ): Promise<ApiResponse<unknown>> => {
      try {
        const result = await updateCameraReady({ cameraReadyId, ...data }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateCameraReady]
  );

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
    submitCameraReadyLoading ||
    waitListLoading ||
    addingToWaitListLoading ||
    leavingWaitListLoading ||
    updateAbstractLoading ||
    updateFullPaperLoading ||
    updateRevisionLoading ||
    updateCameraReadyLoading;

  return {
    //Data
    submittedPapers: submittedPapersData?.data || [],
    paperDetail: paperDetailData?.data || null,
    paperPhases: paperPhasesData?.data || [],
    availableCustomers:
      availableCustomersData?.data || lazyAvailableCustomersData?.data || [],
    waitLists: waitListData?.data || [],

    fetchSubmittedPapers,
    fetchPaperDetail,
    fetchAvailableCustomers,
    handleSubmitAbstract,
    handleSubmitFullPaper,
    handleSubmitPaperRevision,
    handleSubmitPaperRevisionResponse,
    handleSubmitCameraReady,
    fetchWaitList,
    handleAddToWaitList,
    handleLeaveWaitList,
    handleUpdateAbstract,
    handleUpdateFullPaper,
    handleUpdateRevisionSubmission,
    handleUpdateCameraReady,

    //Loading
    loading,
    waitListLoading,
    addingToWaitListLoading,
    leavingWaitListLoading,

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
    waitListError,
    addToWaitListError,
    leaveWaitListError,
    updateAbstractError,
    updateFullPaperError,
    updateRevisionError,
    updateCameraReadyError,
  };
};

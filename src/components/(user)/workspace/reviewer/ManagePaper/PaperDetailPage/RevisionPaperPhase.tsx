import { useState, useEffect, useMemo } from "react";
import {
    FileText,
    Download,
    Send,
    CheckCircle,
    XCircle,
    MessageSquare,
    Plus,
    ChevronDown,
    ChevronUp,
    Gavel,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { Button } from "@/components/ui/button";
import EmblaCarousel from '@/components/molecules/EmblaCarousel';
import { SwiperSlide } from 'swiper/react';
import { formatDate } from "@/helper/format";
import {
    useSubmitPaperRevisionFeedbackMutation,
    useSubmitPaperRevisionReviewMutation,
    useListRevisionPaperReviewsQuery,
    useDecideRevisionStatusMutation,
    useMarkCompleteReviseMutation,
} from "@/redux/services/paper.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { CurrentPaperPhaseForReviewer, CurrentResearchConferencePhaseForReviewer, PaperDetailForReviewer, RevisionPaperSubmissionForReviewer, RevisionSubmissionFeedbackForReviewer } from "@/types/paper.type";
import { isValidUrl } from "@/helper/paper";
import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";
import ReviewerPaperCard from "./ReviewerPaperCard";
import RevisionReviewsList from "./RevisionReviewsList";
import { parseApiError } from "@/helper/api";
import { cn } from "@/utils/utils";

interface RevisionPaperPhaseProps {
    paperDetail: PaperDetailForReviewer;
    currentPhase: CurrentResearchConferencePhaseForReviewer | null | undefined;
    paperId: string;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
}

export default function RevisionPaperPhase({
    paperDetail,
    currentPhase,
    paperId,
    getStatusIcon,
    getStatusColor,
}: RevisionPaperPhaseProps) {
    // Revision Paper Review Form states - keyed by submission ID
    const [revisionReview, setRevisionReview] = useState<{
        note: string;
        feedbackToAuthor: string;
        globalStatus: string;
        file: File | null;
    }>({
        note: "",
        feedbackToAuthor: "",
        globalStatus: "Accepted",
        file: null,
    });
    //   const [revisionReviews, setRevisionReviews] = useState<{
    //     [key: string]: {
    //       note: string;
    //       feedbackToAuthor: string;
    //       globalStatus: string;
    //       file: File | null;
    //     };
    //   }>({});

    const [revisionFeedbacks, setRevisionFeedbacks] = useState<{
        [key: string]: Array<{ feedback: string; sortOrder: number }>;
    }>({});

    const [showViewFeedbackDialogs, setShowViewFeedbackDialogs] = useState<{
        [key: string]: boolean;
    }>({});


    const [expandedReviewsSubmissions, setExpandedReviewsSubmissions] = useState<boolean>(false);

    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showFeedbackDialogs, setShowFeedbackDialogs] = useState<{
        [key: string]: boolean;
    }>({});

    const [showRevisionDecisionPopup, setShowRevisionDecisionPopup] =
        useState(false);

    const [revisionDecisionStatus, setRevisionDecisionStatus] =
        useState("Pending");


    const [docAvailability, setDocAvailability] = useState<{
        [key: string]: boolean | null;
    }>({});

    const [markingComplete, setMarkingComplete] = useState<{
        [key: string]: boolean;
    }>({});

    const [activeRoundTab, setActiveRoundTab] = useState<number>(0);
    const [showReviewsDialog, setShowReviewsDialog] = useState(false);

    const { data: revisionReviews, isLoading } = useListRevisionPaperReviewsQuery(
        { revisionPaperId: paperDetail?.revisionPaper?.revisionPaperId || "", paperId },
        { skip: !paperDetail?.revisionPaper?.revisionPaperId }
    );

    const [submitRevisionReview, { isLoading: isSubmittingRevisionReview }] =
        useSubmitPaperRevisionReviewMutation();
    const [submitRevisionFeedback, { isLoading: isSubmittingRevision, error: submitRevisionFeedbackError }] =
        useSubmitPaperRevisionFeedbackMutation();
    const [decideRevisionStatus, { isLoading: isDecidingRevision, error: decideStatusError }] =
        useDecideRevisionStatusMutation();

    const [markCompleteRevise, { isLoading: isMarkingComplete, error: markCompleteReviseError }] =
        useMarkCompleteReviseMutation();

    const isWithinDateRange = (startDate: string, endDate: string): boolean => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return now >= start && now <= end;
    };

    // const canSubmitRevisionReview = (): boolean => {
    //     if (!currentPhase?.revisionPaperReviewStart || !currentPhase?.revisionPaperReviewEnd) {
    //         return false;
    //     }
    //     return isWithinDateRange(
    //         currentPhase.revisionPaperReviewStart,
    //         currentPhase.revisionPaperReviewEnd
    //     );
    // };

    const isSubmissionCompleted = (submissionId: string): boolean => {
        if (!paperDetail?.revisionPaper?.revisionRoundDeadlineId) return false;

        const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
            s => s.revisionPaperSubmissionId === submissionId
        );

        if (!submission) return false;

        const currentRound = currentPhase?.revisionRoundsDetail?.find(
            r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
        );

        const markedRound = currentPhase?.revisionRoundsDetail?.find(
            r => r.revisionRoundDeadlineId === paperDetail?.revisionPaper?.revisionRoundDeadlineId
        );

        if (!currentRound || !markedRound) return false;

        if (currentRound.roundNumber == null || markedRound.roundNumber == null) return false;

        return currentRound.roundNumber >= markedRound.roundNumber;
    };

    const isLatestSubmission = (submissionId: string): boolean => {
        if (!paperDetail?.revisionPaper?.revisionPaperSubmissions) return false;

        const submissions = paperDetail.revisionPaper.revisionPaperSubmissions;
        if (submissions.length === 0) return false;

        const sortedSubmissions = [...submissions].sort((a, b) => {
            const roundA = currentPhase?.revisionRoundsDetail?.find(
                r => r.revisionRoundDeadlineId === a.revisionDeadlineRoundId
            );
            const roundB = currentPhase?.revisionRoundsDetail?.find(
                r => r.revisionRoundDeadlineId === b.revisionDeadlineRoundId
            );

            return (roundB?.roundNumber || 0) - (roundA?.roundNumber || 0);
        });

        return sortedSubmissions[0].revisionPaperSubmissionId === submissionId;
    };

    const canDecideRevisionStatus = (): boolean => {
        if (!currentPhase?.revisionPaperDecideStatusStart || !currentPhase?.revisionPaperDecideStatusEnd) {
            return false;
        }
        return isWithinDateRange(
            currentPhase.revisionPaperDecideStatusStart,
            currentPhase.revisionPaperDecideStatusEnd
        );
    };

    const canSubmitRevisionFeedback = (submissionId: string): boolean => {
        if (!paperDetail?.revisionPaper) return false;

        const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
            (s) => s.revisionPaperSubmissionId === submissionId
        );

        if (!submission?.revisionDeadlineRoundId) return false;

        const roundDetail = currentPhase?.revisionRoundsDetail?.find(
            (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
        );

        if (!roundDetail?.startSubmissionDate || !roundDetail?.endSubmissionDate) {
            return false;
        }

        return isWithinDateRange(
            roundDetail.startSubmissionDate,
            roundDetail.endSubmissionDate
        );
    };

    // const isNotAllSubmittedRevision =
    //     !paperDetail.revisionPaper?.isAllSubmittedRevisionPaperReview;
    // const hasAtLeastOneReview =
    //     revisionReviews?.data &&
    //     revisionReviews?.data.length > 0;
    const isOutOfRevisionDecisionTime = !canDecideRevisionStatus();

    const toggleReviewsExpansion = () => {
        setExpandedReviewsSubmissions((prev) => !prev);
    };

    const handleMarkCompleteRevise = async (submissionId: string) => {
        if (!paperDetail?.revisionPaper) return;

        const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
            s => s.revisionPaperSubmissionId === submissionId
        );

        if (!submission?.revisionDeadlineRoundId) {
            toast.error("Không tìm thấy thông tin round");
            return;
        }

        setMarkingComplete(prev => ({ ...prev, [submissionId]: true }));

        try {
            await markCompleteRevise({
                revisionRoundDeadlineId: submission.revisionDeadlineRoundId,
                revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
                paperId: paperId
            }).unwrap();

            toast.success("Đã đánh dấu hoàn tất revision, chờ kết quả review");
        } catch (error: unknown) {
            // const err = error as ApiError;
            // toast.error(err?.data?.message || "Lỗi khi đánh dấu hoàn tất");
        } finally {
            setMarkingComplete(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    // const handleSubmitRevisionReview = async () => {
    //     if (!paperDetail?.revisionPaper) return;

    //     if (!revisionReview.note && !revisionReview.feedbackToAuthor && !revisionReview.file) {
    //         toast.error("Vui lòng nhập thông tin đánh giá");
    //         return;
    //     }

    //     if (!canSubmitRevisionReview()) {
    //         toast.error(
    //             `Thời hạn nộp đánh giá Revision là từ ${formatDate(currentPhase!.revisionPaperReviewStart)} đến ${formatDate(currentPhase!.revisionPaperReviewEnd)}`
    //         );
    //         return;
    //     }

    //     try {
    //         await submitRevisionReview({
    //             paperId,
    //             revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
    //             globalStatus: revisionReview.globalStatus,
    //             note: revisionReview.note,
    //             feedbackToAuthor: revisionReview.feedbackToAuthor,
    //             feedbackMaterialFile: revisionReview.file || undefined,
    //         }).unwrap();

    //         toast.success("Gửi đánh giá revision thành công");

    //         setRevisionReview({
    //             note: "",
    //             feedbackToAuthor: "",
    //             globalStatus: "Accepted",
    //             file: null,
    //         });
    //     } catch (error: unknown) {
    //         const err = error as ApiError;
    //         const errorMessage = err?.message || "Lỗi khi gửi revision review";
    //         toast.error(errorMessage);
    //     }
    // };

    const handleSubmitRevisionFeedback = async (submissionId: string) => {
        if (!paperDetail?.revisionPaper) return;

        const feedbacks = revisionFeedbacks[submissionId];
        if (!feedbacks || feedbacks.length === 0) {
            toast.error("Vui lòng nhập ít nhất một feedback");
            return;
        }

        const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
            (s) => s.revisionPaperSubmissionId === submissionId,
        );

        if (!submission) return;

        const roundDeadline = paperDetail.currentResearchConferencePhase?.revisionRoundsDetail?.find(
            (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
        );

        if (!roundDeadline) {
            toast.error(`Không tìm thấy round tương ứng với submission này`);
            return;
        }

        if (!canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)) {
            console.log(Date.now)

            if (roundDeadline.startSubmissionDate && roundDeadline.endSubmissionDate) {
                toast.error(
                    `Thời hạn nhập feedback cho Round ${roundDeadline.roundNumber} là từ ${formatDate(
                        roundDeadline.startSubmissionDate
                    )} đến ${formatDate(roundDeadline.endSubmissionDate)}`
                );
            } else {
                toast.error(`Không thể nhập feedback cho Round cuối cùng`);
            }
            return;
        }

        const roundDetail = currentPhase?.revisionRoundsDetail?.find(
            (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
        );

        if (!roundDetail) {
            toast.error("Không tìm thấy thông tin round tương ứng");
            return;
        }

        if (!canSubmitRevisionFeedback(submissionId)) {
            toast.error(
                `Thời hạn gửi feedback cho Round ${roundDetail.roundNumber} là từ ${formatDate(roundDetail.startSubmissionDate)} đến ${formatDate(roundDetail.endSubmissionDate)}`
            );
            return;
        }

        try {
            const response = await submitRevisionFeedback({
                paperId,
                revisionPaperSubmissionId: submissionId,
                feedbacks: feedbacks.map((f) => ({
                    feedback: f.feedback,
                    sortOrder: f.sortOrder,
                })),
            }).unwrap();

            toast.success(response?.message || "Đã gửi thành công revision feedback");

            setRevisionFeedbacks((prev) => ({
                ...prev,
                [submissionId]: [],
            }));
        } catch (error: unknown) {
            const err = error as ApiError;
            const errorMessage = err?.message || "Lỗi khi gửi revision feedback";
            toast.error(errorMessage);
        }
    };

    const updateRevisionReview = (
        field: "note" | "feedbackToAuthor" | "globalStatus" | "file",
        value: string | File | null
    ) => {
        setRevisionReview((prev) => ({ ...prev, [field]: value }));
    };

    const handleDecideRevisionStatus = async () => {
        if (!paperDetail?.revisionPaper) return;
        if (!canDecideRevisionStatus()) {
            toast.error(
                `Chỉ có thể quyết định Revision trong khoảng ${formatDate(currentPhase!.revisionPaperDecideStatusStart)} - ${formatDate(currentPhase!.revisionPaperDecideStatusEnd)}`,
            );
            return;
        }

        try {
            const response = await decideRevisionStatus({
                revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
                paperId,
                globalStatus: revisionDecisionStatus,
            }).unwrap();
            toast.success("Cập nhật trạng thái revision thành công");
            setShowRevisionDecisionPopup(false);
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err.message || "Lỗi khi cập nhật trạng thái revision");
        }
    };

    const addFeedbackField = (submissionId: string) => {
        setRevisionFeedbacks((prev) => {
            const current = prev[submissionId] || [];
            const nextSortOrder = current.length + 1;
            return {
                ...prev,
                [submissionId]: [
                    ...current,
                    { feedback: "", sortOrder: nextSortOrder },
                ],
            };
        });
    };

    const updateFeedback = (
        submissionId: string,
        index: number,
        value: string,
    ) => {
        setRevisionFeedbacks((prev) => {
            const current = prev[submissionId] || [];
            const updated = [...current];
            updated[index] = { ...updated[index], feedback: value };
            return {
                ...prev,
                [submissionId]: updated,
            };
        });
    };

    const removeFeedback = (submissionId: string, index: number) => {
        setRevisionFeedbacks((prev) => {
            const current = prev[submissionId] || [];
            const updated = current.filter((_, i) => i !== index);
            const reIndexed = updated.map((f, i) => ({ ...f, sortOrder: i + 1 }));
            return {
                ...prev,
                [submissionId]: reIndexed,
            };
        });
    };

    const allRounds = useMemo(() => {
        if (!currentPhase?.revisionRoundsDetail) return [];

        // Sort rounds by roundNumber
        const sortedRounds = [...currentPhase.revisionRoundsDetail].sort((a, b) =>
            (a.roundNumber || 0) - (b.roundNumber || 0)
        );

        return sortedRounds.map((roundDetail) => {
            // Find submission for this round
            const submission = paperDetail.revisionPaper?.revisionPaperSubmissions?.find(
                (s) => s.revisionDeadlineRoundId === roundDetail.revisionRoundDeadlineId
            );

            const hasSubmission = !!submission;
            const isCompleted = hasSubmission && isSubmissionCompleted(submission.revisionPaperSubmissionId);
            const isLatest = hasSubmission && isLatestSubmission(submission.revisionPaperSubmissionId);
            const canFeedback = hasSubmission && canSubmitRevisionFeedback(submission.revisionPaperSubmissionId);

            const now = new Date();
            const startDate = roundDetail.startSubmissionDate ? new Date(roundDetail.startSubmissionDate) : null;
            const endDate = roundDetail.endSubmissionDate ? new Date(roundDetail.endSubmissionDate) : null;

            let roundStatus: 'pending' | 'open' | 'expired' = 'pending';
            if (startDate && endDate) {
                if (now < startDate) {
                    roundStatus = 'pending';
                } else if (now >= startDate && now <= endDate) {
                    roundStatus = 'open';
                } else {
                    roundStatus = 'expired';
                }
            }

            return {
                roundNumber: roundDetail.roundNumber || 0,
                submission: submission || null,
                roundDetail,
                hasSubmission,
                isCompleted,
                isLatest,
                canFeedback,
                roundStatus,
                isDisabled: !hasSubmission,
            };
        });
    }, [
        currentPhase?.revisionRoundsDetail,
        paperDetail.revisionPaper?.revisionPaperSubmissions,
    ]);

    useEffect(() => {
        if (submitRevisionFeedbackError) toast.error(parseApiError<string>(submitRevisionFeedbackError)?.data?.message)
        if (decideStatusError) toast.error(parseApiError<string>(decideStatusError)?.data?.message)
    }, [submitRevisionFeedbackError, decideStatusError])

    useEffect(() => {
        // Auto-select first round with submission
        const firstSubmissionIndex = allRounds.findIndex(r => r.hasSubmission);
        if (firstSubmissionIndex !== -1) {
            setActiveRoundTab(firstSubmissionIndex);
        }
    }, [allRounds]);

    useEffect(() => {
        if (markCompleteReviseError) toast.error(parseApiError(markCompleteReviseError)?.data?.message);
    }, [markCompleteReviseError])

    useEffect(() => {
        if (!paperDetail?.revisionPaper?.revisionPaperSubmissions) return;

        paperDetail.revisionPaper.revisionPaperSubmissions.forEach((submission) => {
            const url = submission.revisionPaperUrl;

            if (!url || !isValidUrl(url)) {
                setDocAvailability(prev => ({ ...prev, [submission.revisionPaperSubmissionId]: false }));
                return;
            }

            fetch(url, { method: "HEAD" })
                .then((res) => setDocAvailability(prev => ({
                    ...prev,
                    [submission.revisionPaperSubmissionId]: res.ok
                })))
                .catch(() => setDocAvailability(prev => ({
                    ...prev,
                    [submission.revisionPaperSubmissionId]: false
                })));
        });
    }, [paperDetail?.revisionPaper?.revisionPaperSubmissions]);

    if (!paperDetail.revisionPaper) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Chưa có thông tin Revision Paper</p>
            </div>
        );
    }

    // const allRounds = useMemo(() => {
    //     if (!paperDetail.revisionPaper?.revisionPaperSubmissions) return [];

    //     return paperDetail.revisionPaper.revisionPaperSubmissions
    //         .map((submission) => {
    //             const roundDetail = currentPhase?.revisionRoundsDetail?.find(
    //                 (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
    //             );

    //             return {
    //                 roundNumber: roundDetail?.roundNumber || 0,
    //                 submission,
    //                 roundDetail,
    //                 isCompleted: isSubmissionCompleted(submission.revisionPaperSubmissionId),
    //                 isLatest: isLatestSubmission(submission.revisionPaperSubmissionId),
    //             };
    //         })
    //         .sort((a, b) => a.roundNumber - b.roundNumber);
    // }, [paperDetail.revisionPaper?.revisionPaperSubmissions, currentPhase?.revisionRoundsDetail]);

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Đánh giá tổng Revision Paper
                    </h3>
                    {paperDetail.isHeadReviewer && (
                        <div className="flex gap-3">
                            {revisionReviews?.data && revisionReviews.data.length > 0 && (
                                <Button
                                    onClick={() => setShowReviewsDialog(true)}
                                    variant="outline"
                                    size="lg"
                                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {revisionReviews.data.length} lượt đánh giá
                                </Button>
                            )}

                            <Button
                                onClick={() => setShowRevisionDecisionPopup(true)}
                                className="bg-orange-600 hover:bg-orange-700"
                                size="lg"
                                disabled={isOutOfRevisionDecisionTime}
                            >
                                <Gavel className="w-4 h-4 mr-2" />
                                {/* {isNotAllSubmittedRevision && !isOutOfRevisionDecisionTime &&
                                "Chưa thể quyết định, còn reviewer chưa nộp"}
                            {!isNotAllSubmittedRevision && isOutOfRevisionDecisionTime &&
                                "Chưa thể quyết định, ngoài khoảng thời gian"}
                            {isNotAllSubmittedRevision && isOutOfRevisionDecisionTime &&
                                "Chưa thể quyết định, reviewer chưa nộp & ngoài thời gian"}
                            {!isNotAllSubmittedRevision && !isOutOfRevisionDecisionTime &&
                                "Quyết định cuối cùng"} */}

                                {isOutOfRevisionDecisionTime
                                    ? "Ngoài thời gian quyết định"
                                    : "Quyết định cuối cùng"}
                                {/* 
                                {!hasAtLeastOneReview && !isOutOfRevisionDecisionTime && "Chưa thể quyết định, chưa có review nào"}
                                {hasAtLeastOneReview && isOutOfRevisionDecisionTime && "Ngoài thời gian quyết định"}
                                {!hasAtLeastOneReview && isOutOfRevisionDecisionTime && "Chưa có review & ngoài thời gian"}
                                {hasAtLeastOneReview && !isOutOfRevisionDecisionTime && "Quyết định cuối cùng"} */}

                            </Button>
                        </div>
                        // <Button
                        //     onClick={() => setShowRevisionDecisionPopup(true)}
                        //     className="bg-orange-600 hover:bg-orange-700"
                        //     size="lg"
                        //     disabled={!paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview}
                        // >
                        //     <Gavel className="w-4 h-4 mr-2" />
                        //     {paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview
                        //         ? "Quyết định cuối cùng"
                        //         : "Chưa thể quyết định, còn reviewer chưa nộp"}
                        // </Button>
                    )}
                </div>

                <ReviewerPaperCard
                    paperInfo={{
                        id: paperDetail.revisionPaper.revisionPaperId,
                        title: paperDetail.revisionPaper.title,
                        description: paperDetail.revisionPaper.description,
                        globalStatusName: paperDetail.revisionPaper.globalStatusName,
                        isAllSubmittedReview: paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview,
                        reviewStartDate: currentPhase?.reviseStartDate,
                        reviewEndDate: currentPhase?.reviseEndDate,
                        fileUrl: undefined
                    }}
                    paperType="Revision Paper"
                    phaseInfo={paperDetail.currentResearchConferencePhase}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                />
            </div>

            {/* Reviews from Other Reviewers - Only for Head Reviewer */}
            <Transition appear show={showReviewsDialog} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowReviewsDialog(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all max-h-[85vh] flex flex-col">
                                    <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                                        <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-orange-600" />
                                            Các đánh giá từ Reviewer ({revisionReviews?.data?.length || 0})
                                        </Dialog.Title>
                                    </div>

                                    <div className="overflow-y-auto px-6 py-4">
                                        {isLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                                                <p className="text-sm text-gray-600">Đang tải đánh giá...</p>
                                            </div>
                                        ) : revisionReviews?.data?.length ? (
                                            <div className="space-y-3">
                                                {revisionReviews.data.map((review) => (
                                                    <div key={review.revisionPaperReviewId} className="border rounded-lg p-4 bg-gray-50">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            {review.reviewerAvatarUrl ? (
                                                                <img
                                                                    src={review.reviewerAvatarUrl}
                                                                    alt={review.reviewerName || "Reviewer"}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                                                                    {review.reviewerName?.charAt(0).toUpperCase() || "R"}
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-semibold text-gray-900">{review.reviewerName || "N/A"}</p>
                                                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}>
                                                                        {getStatusIcon(review.globalStatusName)}
                                                                        {review.globalStatusName}
                                                                    </span>
                                                                </div>
                                                                {review.createdAt && (
                                                                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {review.note && (
                                                            <div className="mb-2 bg-yellow-50 border-l-4 border-yellow-400 p-2.5 rounded text-sm">
                                                                <p className="font-semibold text-yellow-800 text-xs mb-1">Ghi chú nội bộ:</p>
                                                                <p className="text-gray-700">{review.note}</p>
                                                            </div>
                                                        )}

                                                        {review.feedbackToAuthor && (
                                                            <div className="mb-2 text-sm">
                                                                <p className="font-semibold text-gray-600 text-xs mb-1">Phản hồi tới tác giả:</p>
                                                                <p className="text-gray-700 leading-relaxed">{review.feedbackToAuthor}</p>
                                                            </div>
                                                        )}

                                                        {review.feedbackMaterialUrl && (
                                                            <a
                                                                href={review.feedbackMaterialUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Tải tài liệu
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 py-8 text-center">Chưa có đánh giá nào</p>
                                        )}
                                    </div>

                                    <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                                        <Button variant="outline" onClick={() => setShowReviewsDialog(false)} className="w-full">
                                            Đóng
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* {paperDetail.isHeadReviewer &&
                paperDetail.revisionPaper && (
                    <>
                        <RevisionReviewsList
                            paperId={paperId}
                            revisionPaperId={
                                paperDetail.revisionPaper.revisionPaperId
                            }
                            // submissionId={submission.revisionPaperSubmissionId}
                            isExpanded={expandedReviewsSubmissions}
                            onToggle={toggleReviewsExpansion}
                            // () =>
                            //   toggleReviewsExpansion(
                            //     submission.revisionPaperSubmissionId,
                            //   )

                            getStatusIcon={getStatusIcon}
                            getStatusColor={getStatusColor}
                            revisionReviews={revisionReviews}
                            isLoading={isLoading}
                        />
                    </>

                )} */}

            {/* Revision Submissions with Review Forms */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Các Round Revision
                </h3>

                {allRounds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                        <FileText className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-center">
                            Chưa có vòng revision nào được mở cho bài báo này.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tab Navigation */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {allRounds.map((round, index) => {
                                const isActive = activeRoundTab === index;

                                return (
                                    <button
                                        key={`tab-${round.roundNumber}`}
                                        onClick={() => !round.isDisabled && setActiveRoundTab(index)}
                                        disabled={round.isDisabled}
                                        className={cn(
                                            "relative flex items-center gap-3 px-5 py-3 rounded-full transition-all min-w-[180px]",
                                            "border-2",
                                            // Disabled state
                                            round.isDisabled && "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400",
                                            // Active states (only when not disabled)
                                            !round.isDisabled && isActive && round.isCompleted && "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/50",
                                            !round.isDisabled && isActive && !round.isCompleted && round.canFeedback && "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/50",
                                            !round.isDisabled && isActive && !round.isCompleted && !round.canFeedback && "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/50",
                                            // Inactive states (only when not disabled)
                                            !round.isDisabled && !isActive && round.isCompleted && "bg-white border-green-600/50 text-gray-700 hover:border-green-500",
                                            !round.isDisabled && !isActive && !round.isCompleted && "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                        )}
                                    >
                                        {/* Status Indicator Dot */}
                                        <div className={cn(
                                            "flex items-center justify-center w-2 h-2 rounded-full",
                                            round.isDisabled && "bg-gray-300",
                                            !round.isDisabled && round.isCompleted && "bg-green-400",
                                            !round.isDisabled && !round.isCompleted && round.canFeedback && "bg-blue-400",
                                            !round.isDisabled && !round.isCompleted && !round.canFeedback && "bg-orange-400"
                                        )}>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full animate-pulse",
                                                isActive && !round.isDisabled && "opacity-100",
                                                "opacity-0"
                                            )} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col items-start flex-1">
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                round.isDisabled && "text-gray-400",
                                                !round.isDisabled && isActive && "text-white",
                                                !round.isDisabled && !isActive && "text-gray-700"
                                            )}>
                                                Round {round.roundNumber}
                                            </span>

                                            <span className={cn(
                                                "text-xs",
                                                round.isDisabled && "text-gray-400",
                                                !round.isDisabled && isActive && "text-white/80",
                                                !round.isDisabled && !isActive && "text-gray-500"
                                            )}>
                                                {round.isDisabled
                                                    ? round.roundStatus === 'pending'
                                                        ? "Chưa diễn ra"
                                                        : round.roundStatus === 'expired'
                                                            ? "Đã hết hạn, chưa có submission"
                                                            : "Chưa được nộp"
                                                    : round.isCompleted
                                                        ? "Đã hoàn tất"
                                                        : round.canFeedback
                                                            ? "Đang mở feedback"
                                                            : "Đã kết thúc"}
                                            </span>

                                            {round.roundDetail?.startSubmissionDate && round.roundDetail?.endSubmissionDate && (
                                                <div className={cn(
                                                    "text-[10px] mt-0.5",
                                                    round.isDisabled && "text-gray-400",
                                                    !round.isDisabled && isActive && "text-white/70",
                                                    !round.isDisabled && !isActive && "text-gray-400"
                                                )}>
                                                    {new Date(round.roundDetail.startSubmissionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {new Date(round.roundDetail.endSubmissionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && !round.isDisabled && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {allRounds.map((round, index) => {
                                const isActive = activeRoundTab === index;
                                const canFeedback = canSubmitRevisionFeedback(round.submission.revisionPaperSubmissionId);

                                return (
                                    <button
                                        key={`tab-${round.roundNumber}`}
                                        onClick={() => setActiveRoundTab(index)}
                                        className={cn(
                                            "relative flex items-center gap-3 px-5 py-3 rounded-full transition-all min-w-[180px]",
                                            "border-2",
                                            // Active states
                                            isActive && round.isCompleted && "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/50",
                                            isActive && !round.isCompleted && canFeedback && "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/50",
                                            isActive && !round.isCompleted && !canFeedback && "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/50",
                                            // Inactive states
                                            !isActive && round.isCompleted && "bg-white border-green-600/50 text-gray-700 hover:border-green-500",
                                            !isActive && !round.isCompleted && "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                        )}
                                    >
                                       
                                        <div className={cn(
                                            "flex items-center justify-center w-2 h-2 rounded-full",
                                            round.isCompleted && "bg-green-400",
                                            !round.isCompleted && canFeedback && "bg-blue-400",
                                            !round.isCompleted && !canFeedback && "bg-orange-400"
                                        )}>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full animate-pulse",
                                                isActive && "opacity-100",
                                                !isActive && "opacity-0"
                                            )} />
                                        </div>

                                        <div className="flex flex-col items-start flex-1">
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                isActive && "text-white",
                                                !isActive && "text-gray-700"
                                            )}>
                                                Round {round.roundNumber}
                                            </span>

                                            <span className={cn(
                                                "text-xs",
                                                isActive && "text-white/80",
                                                !isActive && "text-gray-500"
                                            )}>
                                                {round.isCompleted
                                                    ? "Đã hoàn tất"
                                                    : canFeedback
                                                        ? "Đang mở feedback"
                                                        : "Chưa đến hạn"}
                                            </span>

                                            {round.roundDetail?.startSubmissionDate && round.roundDetail?.endSubmissionDate && (
                                                <div className={cn(
                                                    "text-[10px] mt-0.5",
                                                    isActive && "text-white/70",
                                                    !isActive && "text-gray-400"
                                                )}>
                                                    {new Date(round.roundDetail.startSubmissionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {new Date(round.roundDetail.endSubmissionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                </div>
                                            )}
                                        </div>

                               
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div> */}

                        {/* Tab Content */}
                        {allRounds[activeRoundTab] && (() => {
                            const round = allRounds[activeRoundTab];

                            if (!round.hasSubmission || !round.submission) {
                                return (
                                    <div className="border border-gray-200 rounded-lg p-8 text-center">
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                            <FileText className="w-12 h-12 mb-3 text-gray-300" />
                                            <h4 className="font-semibold text-lg text-gray-600 mb-2">
                                                Round {round.roundNumber}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {round.roundStatus === 'pending' && "Vòng này chưa bắt đầu"}
                                                {round.roundStatus === 'open' && "Vòng này đang mở nhưng chưa có submission"}
                                                {round.roundStatus === 'expired' && "Vòng này đã kết thúc mà chưa có submission"}
                                            </p>
                                            {round.roundDetail?.startSubmissionDate && round.roundDetail?.endSubmissionDate && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Thời gian: {new Date(round.roundDetail.startSubmissionDate).toLocaleDateString('vi-VN')} - {new Date(round.roundDetail.endSubmissionDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            const submission = round.submission;

                            return (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="font-semibold text-lg text-black">
                                                Round {round.roundNumber}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ID: {submission.revisionPaperSubmissionId}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* View Feedback Button */}
                                            {submission.revisionSubmissionFeedbacks.length > 0 && (
                                                <button
                                                    onClick={() => setShowViewFeedbackDialogs(prev => ({
                                                        ...prev,
                                                        [submission.revisionPaperSubmissionId]: true
                                                    }))}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-green-600/80 hover:bg-green-700 text-white text-xs rounded-md transition"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    <span>{submission.revisionSubmissionFeedbacks.length} Feedback đã gửi</span>
                                                </button>
                                            )}

                                            {/* Submit Feedback Button */}
                                            <Button
                                                onClick={() =>
                                                    setShowFeedbackDialogs((prev) => ({
                                                        ...prev,
                                                        [submission.revisionPaperSubmissionId]: true,
                                                    }))
                                                }
                                                className="bg-blue-600 hover:bg-blue-700"
                                                size="sm"
                                                disabled={!canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)}
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                {canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)
                                                    ? "Nhập feedback"
                                                    : `Chưa đến hạn feedback cho round ${round.roundNumber}`}
                                            </Button>

                                            {/* Completion Status */}
                                            {round.isCompleted ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-700">
                                                        Đã hoàn tất, chờ kết quả review
                                                    </span>
                                                </div>
                                            ) : round.isLatest ? (
                                                <Button
                                                    onClick={() => handleMarkCompleteRevise(submission.revisionPaperSubmissionId)}
                                                    disabled={markingComplete[submission.revisionPaperSubmissionId] || isMarkingComplete}
                                                    className="bg-green-600 hover:bg-green-700"
                                                    size="sm"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    {markingComplete[submission.revisionPaperSubmissionId]
                                                        ? "Đang xử lý..."
                                                        : "Đánh dấu hoàn tất revise"}
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Paper Card */}
                                    <ReviewerPaperCard
                                        paperInfo={{
                                            id: submission.revisionPaperSubmissionId,
                                            title: submission.title,
                                            description: submission.description,
                                            reviewStartDate: round.roundDetail?.startSubmissionDate,
                                            reviewEndDate: round.roundDetail?.endSubmissionDate,
                                            fileUrl: submission.revisionPaperUrl
                                        }}
                                        paperType={`Submission Round ${round.roundNumber}`}
                                        phaseInfo={paperDetail.currentResearchConferencePhase}
                                        revisionRoundDetail={round.roundDetail}
                                        getStatusIcon={getStatusIcon}
                                        getStatusColor={getStatusColor}
                                    />
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>

            {/* Dialog XEM feedbacks đã gửi*/}
            {
                paperDetail.revisionPaper.revisionPaperSubmissions.map(
                    (submission: RevisionPaperSubmissionForReviewer) => (
                        <Transition
                            key={`view-${submission.revisionPaperSubmissionId}`}
                            appear
                            show={showViewFeedbackDialogs[submission.revisionPaperSubmissionId] || false}
                            as={Fragment}
                        >
                            <Dialog
                                as="div"
                                className="relative z-50"
                                onClose={() =>
                                    setShowViewFeedbackDialogs((prev) => ({
                                        ...prev,
                                        [submission.revisionPaperSubmissionId]: false,
                                    }))
                                }
                            >
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                                </Transition.Child>

                                <div className="fixed inset-0 overflow-y-auto">
                                    <div className="flex min-h-full items-center justify-center p-4">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[80vh] overflow-y-auto">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    Feedbacks đã gửi cho Round {currentPhase?.revisionRoundsDetail?.find(
                                                        r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                                    )?.roundNumber}
                                                </Dialog.Title>

                                                <div className="space-y-4">
                                                    {submission.revisionSubmissionFeedbacks.length === 0 ? (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                            <p>Chưa có feedback nào</p>
                                                        </div>
                                                    ) : (
                                                        submission.revisionSubmissionFeedbacks.length > 0 && (
                                                            <div className="mb-6">
                                                                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    Feedbacks đã gửi
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {submission.revisionSubmissionFeedbacks.map(
                                                                        (feedback: RevisionSubmissionFeedbackForReviewer) => (
                                                                            <div
                                                                                key={feedback.revisionSubmissionFeedbackId}
                                                                                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                                                                            >
                                                                                <div className="flex items-start gap-3">
                                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                                                                                        {feedback.sortOrder}
                                                                                    </span>
                                                                                    <div className="flex-1">
                                                                                        <p className="text-sm text-gray-900 leading-relaxed">
                                                                                            {feedback.feedback || "N/A"}
                                                                                        </p>
                                                                                        {feedback.response && (
                                                                                            <div className="mt-3 pl-4 border-l-2 border-blue-300 bg-blue-50 p-3 rounded">
                                                                                                <p className="text-xs text-gray-600">
                                                                                                    <span className="font-semibold text-blue-700">
                                                                                                        Response:
                                                                                                    </span>{" "}
                                                                                                    {feedback.response}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                        {feedback.createdAt && (
                                                                                            <p className="text-xs text-gray-400 mt-2">
                                                                                                {formatDate(feedback.createdAt)}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>

                                                            // submission.revisionSubmissionFeedbacks.map(
                                                            //     (feedback: RevisionSubmissionFeedbackForReviewer) => (
                                                            //         <div
                                                            //             key={feedback.revisionSubmissionFeedbackId}
                                                            //             className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                                                            //         >
                                                            //             <div className="flex-shrink-0">
                                                            //                 <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">
                                                            //                     {feedback.sortOrder}
                                                            //                 </div>
                                                            //             </div>

                                                            //             <div className="flex-1 min-w-0">
                                                            //                 <div className="flex items-center gap-2 mb-2">
                                                            //                     <span className="font-semibold text-gray-900">
                                                            //                         Feedback #{feedback.sortOrder}
                                                            //                     </span>
                                                            //                     {feedback.createdAt && (
                                                            //                         <span className="text-xs text-gray-500">
                                                            //                             {formatDate(feedback.createdAt)}
                                                            //                         </span>
                                                            //                     )}
                                                            //                 </div>

                                                            //                 <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                            //                     {feedback.feedback || "N/A"}
                                                            //                 </p>

                                                            //                 {feedback.response && (
                                                            //                     <div className="mt-3 pl-4 border-l-3 border-blue-400 bg-blue-50 p-3 rounded-lg">
                                                            //                         <div className="flex items-center gap-2 mb-1">
                                                            //                             <span className="text-xs font-semibold text-blue-700">
                                                            //                                 Phản hồi từ tác giả:
                                                            //                             </span>
                                                            //                         </div>
                                                            //                         <p className="text-sm text-gray-700">
                                                            //                             {feedback.response}
                                                            //                         </p>
                                                            //                     </div>
                                                            //                 )}
                                                            //             </div>
                                                            //         </div>
                                                            //     )
                                                        )
                                                    )}
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setShowViewFeedbackDialogs((prev) => ({
                                                                ...prev,
                                                                [submission.revisionPaperSubmissionId]: false,
                                                            }))
                                                        }
                                                    >
                                                        Đóng
                                                    </Button>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    )
                )
            }

            <div>
                {/* Feedback for each submission */}
                {(paperDetail.revisionPaper?.revisionPaperSubmissions || []).map(
                    (submission: RevisionPaperSubmissionForReviewer) => (
                        <div
                            key={submission.revisionPaperSubmissionId}
                            className="mb-8 last:mb-0"
                        >
                            {/* Round Header */}
                            {/* <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                    <span className="text-lg font-bold text-blue-700">
                                        {submission.roundNumber}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900">
                                        Feedback cho Round {submission.roundNumber}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Deadline: {formatDate(submission.endDate)}
                                    </p>
                                </div>
                            </div> */}

                            {/* Feedback Form */}
                            {/* <div className="flex gap-3">
                                <div className="w-8"></div>
                                <Button
                                    onClick={() => setShowFeedbackDialogs(prev => ({
                                        ...prev,
                                        [submission.revisionPaperSubmissionId]: true
                                    }))}
                                    className="bg-blue-600 hover:bg-blue-700"
                                // disabled={!canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    {canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)
                                        ? "Nhập feedback"
                                        : "Chưa đến hạn feedback"}
                                </Button>
                            </div> */}

                            {/* Dialog feedback cho submission này */}
                            <Transition
                                appear
                                show={showFeedbackDialogs[submission.revisionPaperSubmissionId] || false}
                                as={Fragment}
                            >
                                <Dialog
                                    as="div"
                                    className="relative z-50"
                                    onClose={() =>
                                        setShowFeedbackDialogs((prev) => ({
                                            ...prev,
                                            [submission.revisionPaperSubmissionId]: false,
                                        }))
                                    }
                                >
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                                    </Transition.Child>

                                    <div className="fixed inset-0 overflow-y-auto">
                                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                                            <Transition.Child
                                                as={Fragment}
                                                enter="ease-out duration-300"
                                                enterFrom="opacity-0 scale-95"
                                                enterTo="opacity-100 scale-100"
                                                leave="ease-in duration-200"
                                                leaveFrom="opacity-100 scale-100"
                                                leaveTo="opacity-0 scale-95"
                                            >
                                                {/* Nội dung chính của dialog feedback */}
                                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                    <Dialog.Title
                                                        as="h3"
                                                        className="text-lg font-medium leading-6 text-gray-900 mb-4"
                                                    >
                                                        Feedback cho Revision Paper
                                                    </Dialog.Title>

                                                    {/* Nội dung form feedback bạn đang có */}
                                                    <div className="space-y-3">
                                                        {(revisionFeedbacks[submission.revisionPaperSubmissionId] || []).map(
                                                            (feedback, index) => (
                                                                <div key={index} className="flex gap-3 items-start">
                                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center mt-2">
                                                                        {feedback.sortOrder}
                                                                    </span>
                                                                    <div className="flex-1 flex gap-2 items-start">
                                                                        <textarea
                                                                            placeholder={`Viết feedback #${feedback.sortOrder}...`}
                                                                            className="flex-1 border border-gray-300 rounded-lg p-3 text-sm min-h-[90px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none hover:border-gray-400 transition-colors"
                                                                            value={feedback.feedback}
                                                                            onChange={(e) =>
                                                                                updateFeedback(
                                                                                    submission.revisionPaperSubmissionId,
                                                                                    index,
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <button
                                                                            onClick={() =>
                                                                                removeFeedback(
                                                                                    submission.revisionPaperSubmissionId,
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Xóa feedback"
                                                                        >
                                                                            <XCircle className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}

                                                        {/* Add Feedback Button */}
                                                        <div className="flex gap-3">
                                                            <div className="w-8"></div>
                                                            <Button
                                                                onClick={() =>
                                                                    addFeedbackField(submission.revisionPaperSubmissionId)
                                                                }
                                                                variant="outline"
                                                                className="flex-1 border-dashed border-2 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                                                            >
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Thêm feedback
                                                            </Button>
                                                        </div>

                                                        {/* Submit Button */}
                                                        {(revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0) > 0 && (
                                                            <div className="flex gap-3 pt-2">
                                                                <div className="w-8"></div>
                                                                <Button
                                                                    onClick={() =>
                                                                        handleSubmitRevisionFeedback(
                                                                            submission.revisionPaperSubmissionId,
                                                                        )
                                                                    }
                                                                    disabled={isSubmittingRevision}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <Send className="w-4 h-4 mr-2" />
                                                                    {isSubmittingRevision
                                                                        ? "Đang gửi..."
                                                                        : `Gửi ${revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0
                                                                        } feedback`}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Dialog.Panel>
                                            </Transition.Child>
                                        </div>
                                    </div>
                                </Dialog>
                            </Transition>


                        </div>
                    ),
                )}
            </div>

            {/* Dialog cho review tổng */}
            <Transition appear show={showReviewDialog} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowReviewDialog(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 mb-4"
                                    >
                                        Đánh giá tổng Revision Paper
                                    </Dialog.Title>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ghi chú nội bộ
                                            </label>
                                            <textarea
                                                placeholder="Nhập ghi chú nội bộ..."
                                                className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-orange-500"
                                                value={revisionReview.note}
                                                onChange={(e) => updateRevisionReview("note", e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phản hồi tới tác giả
                                            </label>
                                            <textarea
                                                placeholder="Nhập phản hồi tới tác giả..."
                                                className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-orange-500"
                                                value={revisionReview.feedbackToAuthor}
                                                onChange={(e) =>
                                                    updateRevisionReview("feedbackToAuthor", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Trạng thái đánh giá
                                            </label>
                                            <select
                                                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-orange-500"
                                                value={revisionReview.globalStatus}
                                                onChange={(e) =>
                                                    updateRevisionReview("globalStatus", e.target.value)
                                                }
                                            >
                                                <option value="Accepted">Accepted</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tài liệu đánh giá (nếu có)
                                            </label>
                                            <input
                                                type="file"
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                                onChange={(e) =>
                                                    updateRevisionReview("file", e.target.files?.[0] || null)
                                                }
                                            />
                                            {revisionReview.file && (
                                                <p className="text-xs text-gray-600 mt-2">
                                                    File đã chọn: {revisionReview.file.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowReviewDialog(false)}
                                                disabled={isSubmittingRevisionReview}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                                // onClick={handleSubmitRevisionReview}
                                                disabled={isSubmittingRevisionReview}
                                            >
                                                {isSubmittingRevisionReview ? "Đang gửi..." : "Gửi đánh giá"}
                                            </Button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {
                showRevisionDecisionPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-orange-600" />
                                Quyết định cuối cùng - Revision Paper
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn trạng thái
                                    </label>
                                    <select
                                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                                        value={revisionDecisionStatus}
                                        onChange={(e) => setRevisionDecisionStatus(e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRevisionDecisionPopup(false)}
                                        className="flex-1"
                                        disabled={isDecidingRevision}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleDecideRevisionStatus}
                                        disabled={isDecidingRevision}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                                    >
                                        {isDecidingRevision ? "Đang xử lý..." : "Xác nhận"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
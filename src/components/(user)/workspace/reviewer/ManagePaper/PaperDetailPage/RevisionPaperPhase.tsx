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
import { isValidUrl, isWithinDateRange } from "@/helper/paper";
import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";
import ReviewerPaperCard from "./ReviewerPaperCard";
import RevisionReviewsList from "./RevisionReviewsList";
import { parseApiError } from "@/helper/api";
import { cn } from "@/utils/utils";
import { useGlobalTime } from "@/utils/TimeContext";
import { Editor } from '@tinymce/tinymce-react'

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
    const { now } = useGlobalTime();

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


    const [markingComplete, setMarkingComplete] = useState<{
        [key: string]: boolean;
    }>({});

    const [activeRoundTab, setActiveRoundTab] = useState<number>(0);
    const [showReviewsDialog, setShowReviewsDialog] = useState(false);

    const [revisionDecisionReason, setRevisionDecisionReason] = useState("");

    const [selectedFeedback, setSelectedFeedback] = useState<{
        submissionId: string;
        feedback: RevisionSubmissionFeedbackForReviewer | null;
    }>({ submissionId: '', feedback: null });

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

    const canDecideRevisionStatus = currentPhase &&
        currentPhase.revisionPaperDecideStatusStart &&
        currentPhase.revisionPaperDecideStatusEnd
        ? isWithinDateRange(
            currentPhase.revisionPaperDecideStatusStart,
            currentPhase.revisionPaperDecideStatusEnd,
            now
        )
        : false;

    // const canDecideRevisionStatus = (): boolean => {
    //     if (!currentPhase?.revisionPaperDecideStatusStart || !currentPhase?.revisionPaperDecideStatusEnd) {
    //         return false;
    //     }
    //     return isWithinDateRange(
    //         currentPhase.revisionPaperDecideStatusStart,
    //         currentPhase.revisionPaperDecideStatusEnd
    //     );
    // };

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

        // const now = new Date();
        const endDate = new Date(roundDetail.endSubmissionDate);

        return now <= endDate;

        // return isWithinDateRange(
        //     roundDetail.startSubmissionDate,
        //     roundDetail.endSubmissionDate
        // );
    };

    // const isNotAllSubmittedRevision =
    //     !paperDetail.revisionPaper?.isAllSubmittedRevisionPaperReview;
    // const hasAtLeastOneReview =
    //     revisionReviews?.data &&
    //     revisionReviews?.data.length > 0;
    const isOutOfRevisionDecisionTime = !canDecideRevisionStatus;

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
            // toast.error(errorMessage);
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
        if (!canDecideRevisionStatus) {
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
                reason: revisionDecisionReason
            }).unwrap();
            toast.success("Cập nhật trạng thái revision thành công");
            setShowRevisionDecisionPopup(false);
        } catch (error: unknown) {
            const err = error as ApiError;
            // toast.error(err.message || "Lỗi khi cập nhật trạng thái revision");
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
        if (markCompleteReviseError) toast.error(parseApiError(markCompleteReviseError)?.data?.message)
    }, [submitRevisionFeedbackError, decideStatusError, markCompleteReviseError])

    useEffect(() => {
        const firstSubmissionIndex = allRounds.findIndex(r => r.hasSubmission);
        if (firstSubmissionIndex !== -1) {
            setActiveRoundTab(firstSubmissionIndex);
        }
    }, [allRounds]);

    // useEffect(() => {
    //     if (markCompleteReviseError) toast.error(parseApiError(markCompleteReviseError)?.data?.message);
    // }, [markCompleteReviseError])

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
                        Final Review
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
                                disabled={
                                    isOutOfRevisionDecisionTime ||
                                    paperDetail.revisionPaper?.globalStatusName !== "Pending"
                                }
                            >
                                <Gavel className="w-4 h-4 mr-2" />
                                {paperDetail.revisionPaper?.globalStatusName !== "Pending"
                                    ? "Đã quyết định trạng thái, không thể lặp lại hành động này"
                                    : isOutOfRevisionDecisionTime
                                        ? "Ngoài thời gian quyết định"
                                        : "Quyết định cuối cùng"}
                            </Button>
                        </div>
                    )}
                    {/* {paperDetail.isHeadReviewer && (
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

                                {isOutOfRevisionDecisionTime
                                    ? "Ngoài thời gian quyết định"
                                    : "Quyết định cuối cùng"}
                            </Button>
                        </div>
                    )} */}
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
                        fileUrl: undefined,
                        reason: paperDetail.revisionPaper.reason
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

                                        {!paperDetail.isHeadReviewer && (
                                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md mb-3">
                                                Đây là giai đoạn <strong>Final Review</strong>. Chỉ có <strong>Head Reviewer</strong> mới được tham gia phản biện với tác giả.
                                            </p>
                                        )}

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
                                            {paperDetail.isHeadReviewer && (
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
                                            )}

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
                                            fileUrl: submission.revisionPaperUrl,
                                            reason: null
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
            {/* {paperDetail.revisionPaper.revisionPaperSubmissions.map(
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
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                            </Transition.Child>

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="w-full max-w-7xl transform rounded-2xl bg-white shadow-2xl transition-all">
                                            <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-6 py-5 rounded-t-2xl">
                                                <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div>Feedbacks đã gửi</div>
                                                        <div className="text-sm font-normal text-gray-600 mt-1">
                                                            Round {currentPhase?.revisionRoundsDetail?.find(
                                                                r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                                            )?.roundNumber}
                                                        </div>
                                                    </div>
                                                </Dialog.Title>
                                            </div>

                                            <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-6">
                                                {submission.revisionSubmissionFeedbacks.length === 0 ? (
                                                    <div className="text-center py-16">
                                                        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                                                            <MessageSquare className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500 text-lg">Chưa có feedback nào</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {submission.revisionSubmissionFeedbacks.map(
                                                            (feedback: RevisionSubmissionFeedbackForReviewer, index: number) => (
                                                                <div
                                                                    key={feedback.revisionSubmissionFeedbackId}
                                                                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                                                >
                                                                   
                                                                    <div className="bg-gradient-to-r from-green-500 to-blue-500 px-5 py-3 flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-green-600 text-sm font-bold flex items-center justify-center shadow-sm">
                                                                                {feedback.sortOrder}
                                                                            </span>
                                                                            <span className="text-white font-medium">
                                                                                Feedback #{index + 1}
                                                                            </span>
                                                                        </div>
                                                                        {feedback.createdAt && (
                                                                            <span className="text-xs text-white/90 bg-white/20 px-3 py-1 rounded-full">
                                                                                {formatDate(feedback.createdAt)}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                             
                                                                    <div className="p-6">
                                                                        <div className="prose prose-sm max-w-none">
                                                                            <div
                                                                                className="text-gray-800 leading-relaxed"
                                                                                dangerouslySetInnerHTML={{ __html: feedback.feedback }}
                                                                            />
                                                                        </div>

                                                                 
                                                                        {feedback.response && (
                                                                            <div className="mt-6 relative">
                                                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                                                                                <div className="ml-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
                                                                                    <div className="flex items-start gap-3">
                                                                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                                                            <MessageSquare className="w-4 h-4 text-white" />
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                                                                                Response từ Author
                                                                                            </p>
                                                                                            <div
                                                                                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                                                                                dangerouslySetInnerHTML={{ __html: feedback.response }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                 
                                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-between items-center">
                                                <div className="text-sm text-gray-600">
                                                    Tổng số feedback: <span className="font-semibold text-gray-900">{submission.revisionSubmissionFeedbacks.length}</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setShowViewFeedbackDialogs((prev) => ({
                                                            ...prev,
                                                            [submission.revisionPaperSubmissionId]: false,
                                                        }))
                                                    }
                                                    className="px-6 py-2 hover:bg-gray-100 transition-colors"
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
            )} */}

            {paperDetail.revisionPaper.revisionPaperSubmissions.map(
                (submission: RevisionPaperSubmissionForReviewer) => {
                    const isDetailView = selectedFeedback.submissionId === submission.revisionPaperSubmissionId && selectedFeedback.feedback !== null;

                    return (
                        <Transition
                            key={`view-${submission.revisionPaperSubmissionId}`}
                            appear
                            show={showViewFeedbackDialogs[submission.revisionPaperSubmissionId] || false}
                            as={Fragment}
                        >
                            <Dialog
                                as="div"
                                className="relative z-50"
                                onClose={() => {
                                    setShowViewFeedbackDialogs((prev) => ({
                                        ...prev,
                                        [submission.revisionPaperSubmissionId]: false,
                                    }));
                                    setSelectedFeedback({ submissionId: '', feedback: null });
                                }}
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
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                                </Transition.Child>

                                <div className="fixed inset-0 overflow-hidden">
                                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel className="w-full max-w-6xl h-[95vh] flex flex-col transform rounded-xl bg-white shadow-2xl transition-all">
                                                {/* Header */}
                                                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-4 sm:px-6 py-3 rounded-t-xl">
                                                    <div className="flex items-center justify-between">
                                                        <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                            {isDetailView && (
                                                                <button
                                                                    onClick={() => setSelectedFeedback({ submissionId: '', feedback: null })}
                                                                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <div className="p-1.5 bg-green-100 rounded-lg">
                                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <span>
                                                                    {isDetailView ? 'Chi tiết Feedback' : 'Danh sách Feedbacks'}
                                                                </span>
                                                                <span className="ml-3 text-sm font-normal text-gray-600">
                                                                    Round {currentPhase?.revisionRoundsDetail?.find(
                                                                        r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                                                    )?.roundNumber}
                                                                </span>
                                                            </div>
                                                        </Dialog.Title>
                                                        <button
                                                            onClick={() => {
                                                                setShowViewFeedbackDialogs((prev) => ({
                                                                    ...prev,
                                                                    [submission.revisionPaperSubmissionId]: false,
                                                                }));
                                                                setSelectedFeedback({ submissionId: '', feedback: null });
                                                            }}
                                                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white/50 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 overflow-y-auto">
                                                    {isDetailView ? (
                                                        /* Detail View */
                                                        <div className="h-full">
                                                            {selectedFeedback.feedback && (
                                                                <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
                                                                    {/* Feedback Info */}
                                                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                                                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 text-white text-lg font-bold flex items-center justify-center shadow-sm">
                                                                            {selectedFeedback.feedback.sortOrder}
                                                                        </span>
                                                                        <div>
                                                                            <div className="font-semibold text-gray-900">
                                                                                Feedback #{submission.revisionSubmissionFeedbacks.findIndex(
                                                                                    f => f.revisionSubmissionFeedbackId === selectedFeedback.feedback?.revisionSubmissionFeedbackId
                                                                                ) + 1}
                                                                            </div>
                                                                            {selectedFeedback.feedback.createdAt && (
                                                                                <div className="text-sm text-gray-500">
                                                                                    {formatDate(selectedFeedback.feedback.createdAt)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Feedback Section */}
                                                                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                                                                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-3">
                                                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                                {"Reviewer's Feedback"}
                                                                            </h3>
                                                                        </div>
                                                                        <div className="p-6 bg-gray-50">
                                                                            <div
                                                                                className="prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700"
                                                                                dangerouslySetInnerHTML={{ __html: selectedFeedback.feedback.feedback ?? "" }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Response Section */}
                                                                    {selectedFeedback.feedback.response && (
                                                                        <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
                                                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3">
                                                                                <h3 className="text-white font-semibold flex items-center gap-2">
                                                                                    <MessageSquare className="w-5 h-5" />
                                                                                    {"Author's Response"}
                                                                                </h3>
                                                                            </div>
                                                                            <div className="p-6 bg-blue-50">
                                                                                <div
                                                                                    className="prose prose-sm sm:prose-base max-w-none prose-headings:text-blue-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-strong:text-blue-900 prose-a:text-blue-600 hover:prose-a:text-blue-700"
                                                                                    dangerouslySetInnerHTML={{ __html: selectedFeedback.feedback.response }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* List View */
                                                        <div className="p-4 sm:p-6">
                                                            {submission.revisionSubmissionFeedbacks.length === 0 ? (
                                                                <div className="h-full flex items-center justify-center py-16">
                                                                    <div className="text-center">
                                                                        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                                                                            <MessageSquare className="w-10 h-10 text-gray-400" />
                                                                        </div>
                                                                        <p className="text-gray-500">Chưa có feedback nào</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid gap-4 max-w-5xl mx-auto">
                                                                    {submission.revisionSubmissionFeedbacks.map(
                                                                        (feedback: RevisionSubmissionFeedbackForReviewer, index: number) => (
                                                                            <div
                                                                                key={feedback.revisionSubmissionFeedbackId}
                                                                                className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all overflow-hidden"
                                                                            >
                                                                                <div className="p-4 sm:p-5">
                                                                                    <div className="flex items-start justify-between gap-4">
                                                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                                            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                                                                                                {feedback.sortOrder}
                                                                                            </span>
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <div className="font-semibold text-gray-900 mb-1">
                                                                                                    Feedback #{index + 1}
                                                                                                </div>
                                                                                                {feedback.createdAt && (
                                                                                                    <div className="text-xs text-gray-500 mb-3">
                                                                                                        {formatDate(feedback.createdAt)}
                                                                                                    </div>
                                                                                                )}
                                                                                                <div
                                                                                                    className="prose prose-sm max-w-none line-clamp-3 text-gray-600"
                                                                                                    dangerouslySetInnerHTML={{
                                                                                                        __html: (feedback.feedback ?? "").substring(0, 200) +
                                                                                                            ((feedback.feedback ?? "").length > 200 ? "..." : "")
                                                                                                        // __html: feedback.feedback.substring(0, 200) + (feedback.feedback.length > 200 ? '...' : '')
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                                                                            {feedback.response && (
                                                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                                                    Có phản hồi
                                                                                                </span>
                                                                                            )}
                                                                                            <button
                                                                                                onClick={() => setSelectedFeedback({
                                                                                                    submissionId: submission.revisionPaperSubmissionId,
                                                                                                    feedback: feedback
                                                                                                })}
                                                                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                                                            >
                                                                                                Xem chi tiết
                                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer */}
                                                <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 rounded-b-xl">
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-sm text-gray-600">
                                                            {!isDetailView && (
                                                                <span>
                                                                    Tổng số: <span className="font-semibold text-gray-900">{submission.revisionSubmissionFeedbacks.length}</span> feedback{submission.revisionSubmissionFeedbacks.length !== 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowViewFeedbackDialogs((prev) => ({
                                                                    ...prev,
                                                                    [submission.revisionPaperSubmissionId]: false,
                                                                }));
                                                                setSelectedFeedback({ submissionId: '', feedback: null });
                                                            }}
                                                            className="px-5"
                                                        >
                                                            Đóng
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    );
                }
            )}
            {/* {
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
                                                                                        <div
                                                                                            className="prose prose-sm max-w-none text-gray-900"
                                                                                            dangerouslySetInnerHTML={{ __html: feedback.feedback }}
                                                                                        ></div>
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
            } */}

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
                                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                                                                <div key={index} className="flex gap-4 items-start">
                                                                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center mt-2">
                                                                        {feedback.sortOrder}
                                                                    </span>

                                                                    <div className="flex-1 space-y-2">
                                                                        <Editor
                                                                            apiKey="YOUR_API_KEY_HERE"
                                                                            value={feedback.feedback || ""}
                                                                            onEditorChange={(content) =>
                                                                                updateFeedback(
                                                                                    submission.revisionPaperSubmissionId,
                                                                                    index,
                                                                                    content
                                                                                )
                                                                            }
                                                                            init={{
                                                                                height: 280,
                                                                                menubar: false,
                                                                                plugins: [
                                                                                    'advlist', 'autolink', 'lists', 'link', 'image',
                                                                                    'charmap', 'preview', 'anchor', 'searchreplace',
                                                                                    'visualblocks', 'code', 'fullscreen',
                                                                                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                                                                                ],
                                                                                toolbar:
                                                                                    'undo redo | styles | bold italic underline forecolor | ' +
                                                                                    'alignleft aligncenter alignright alignjustify | bullist numlist | ' +
                                                                                    'table image | removeformat | code',
                                                                                content_style:
                                                                                    'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }'
                                                                            }}
                                                                        // className="w-full"
                                                                        />
                                                                        {/* <textarea
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
                                                                        /> */}
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
                                        {/* <option value="Pending">Đang chờ quyết định</option> */}
                                        <option value="Accepted">Chấp nhận</option>
                                        <option value="Rejected">Từ chối</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lý do quyết định <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                                        placeholder="Nhập lý do quyết định..."
                                        value={revisionDecisionReason}
                                        onChange={(e) => setRevisionDecisionReason(e.target.value)}
                                        rows={4}
                                    />
                                    {!revisionDecisionReason.trim() && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Lý do quyết định là bắt buộc
                                        </p>
                                    )}
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
                                        disabled={
                                            isDecidingRevision ||
                                            !revisionDecisionReason.trim() ||
                                            revisionDecisionStatus === "Pending"
                                        }
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
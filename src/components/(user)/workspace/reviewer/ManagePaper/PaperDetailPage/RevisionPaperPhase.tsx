import { useState, useEffect } from "react";
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

    const { data: revisionReviews, isLoading } = useListRevisionPaperReviewsQuery(
        { revisionPaperId: paperDetail?.revisionPaper?.revisionPaperId || "", paperId },
        { skip: !paperDetail?.revisionPaper?.revisionPaperId }
    );

    const [submitRevisionReview, { isLoading: isSubmittingRevisionReview }] =
        useSubmitPaperRevisionReviewMutation();
    const [submitRevisionFeedback, { isLoading: isSubmittingRevision }] =
        useSubmitPaperRevisionFeedbackMutation();
    const [decideRevisionStatus, { isLoading: isDecidingRevision }] =
        useDecideRevisionStatusMutation();

    const [markCompleteRevise, { isLoading: isMarkingComplete, error: markCompleteReviseError }] =
        useMarkCompleteReviseMutation();

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

    const isWithinDateRange = (startDate: string, endDate: string): boolean => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return now >= start && now <= end;
    };

    const canSubmitRevisionReview = (): boolean => {
        if (!currentPhase?.revisionPaperReviewStart || !currentPhase?.revisionPaperReviewEnd) {
            return false;
        }
        return isWithinDateRange(
            currentPhase.revisionPaperReviewStart,
            currentPhase.revisionPaperReviewEnd
        );
    };

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
    const hasAtLeastOneReview =
        revisionReviews?.data &&
        revisionReviews?.data.length > 0;
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

    const handleSubmitRevisionReview = async () => {
        if (!paperDetail?.revisionPaper) return;

        if (!revisionReview.note && !revisionReview.feedbackToAuthor && !revisionReview.file) {
            toast.error("Vui lòng nhập thông tin đánh giá");
            return;
        }

        if (!canSubmitRevisionReview()) {
            toast.error(
                `Thời hạn nộp đánh giá Revision là từ ${formatDate(currentPhase!.revisionPaperReviewStart)} đến ${formatDate(currentPhase!.revisionPaperReviewEnd)}`
            );
            return;
        }

        try {
            await submitRevisionReview({
                paperId,
                revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
                globalStatus: revisionReview.globalStatus,
                note: revisionReview.note,
                feedbackToAuthor: revisionReview.feedbackToAuthor,
                feedbackMaterialFile: revisionReview.file || undefined,
            }).unwrap();

            toast.success("Gửi đánh giá revision thành công");

            setRevisionReview({
                note: "",
                feedbackToAuthor: "",
                globalStatus: "Accepted",
                file: null,
            });
        } catch (error: unknown) {
            const err = error as ApiError;
            const errorMessage = err?.message || "Lỗi khi gửi revision review";
            toast.error(errorMessage);
        }
    };

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

    if (!paperDetail.revisionPaper) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Chưa có thông tin Revision Paper</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Đánh giá tổng Revision Paper
                    </h3>
                    {paperDetail.isHeadReviewer && (
                        <Button
                            onClick={() => setShowRevisionDecisionPopup(true)}
                            className="bg-orange-600 hover:bg-orange-700"
                            size="lg"
                            disabled={!hasAtLeastOneReview || isOutOfRevisionDecisionTime}
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

                            {!hasAtLeastOneReview && !isOutOfRevisionDecisionTime && "Chưa thể quyết định, chưa có review nào"}
                            {hasAtLeastOneReview && isOutOfRevisionDecisionTime && "Ngoài thời gian quyết định"}
                            {!hasAtLeastOneReview && isOutOfRevisionDecisionTime && "Chưa có review & ngoài thời gian"}
                            {hasAtLeastOneReview && !isOutOfRevisionDecisionTime && "Quyết định cuối cùng"}

                        </Button>
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
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                />
            </div>

            {/* Reviews from Other Reviewers - Only for Head Reviewer */}
            {paperDetail.isHeadReviewer &&
                paperDetail.revisionPaper && (
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
                )}

            {/* Revision Submissions with Review Forms */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Các Round Revision
                </h3>

                {/* Overall Status */}
                {/* <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            Trạng thái tổng thể:
                        </span>
                        <span
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paperDetail.revisionPaper.globalStatusName)}`}
                        >
                            {getStatusIcon(paperDetail.revisionPaper.globalStatusName)}
                            {paperDetail.revisionPaper.globalStatusName}
                        </span>
                    </div>
                </div> */}

                {/* Revision Submissions */}
                <EmblaCarousel>
                    {paperDetail.revisionPaper.revisionPaperSubmissions.map(
                        (submission: RevisionPaperSubmissionForReviewer) => (
                            // <SwiperSlide key={submission.revisionPaperSubmissionId}>
                            <div key={submission.revisionPaperSubmissionId} className="border border-gray-600 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-semibold text-lg text-black">
                                            Round {currentPhase?.revisionRoundsDetail?.find(
                                                r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                            )?.roundNumber}
                                        </h4>
                                        <p className="text-xs text-black-400 mt-1">
                                            ID: {submission.revisionPaperSubmissionId}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
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
                                                : `Chưa đến hạn feedback cho round ${currentPhase?.revisionRoundsDetail?.find(
                                                    r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                                )?.roundNumber}`}
                                        </Button>

                                        {/* Status và nút đánh dấu hoàn tất */}
                                        <div className="flex items-center gap-2">
                                            {isSubmissionCompleted(submission.revisionPaperSubmissionId) ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-700">
                                                        Đã hoàn tất, chờ kết quả review
                                                    </span>
                                                </div>
                                            ) : isLatestSubmission(submission.revisionPaperSubmissionId) ? (
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
                                        {/* <button
                                            onClick={() => setShowFeedbackDialogs(prev => ({
                                                ...prev,
                                                [submission.revisionPaperSubmissionId]: true
                                            }))}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/80 hover:bg-blue-700 text-white text-xs rounded-md transition"
                                            disabled={!canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span>Nhập feedback</span>
                                        </button> */}
                                    </div>
                                </div>

                                {/* Paper Card */}
                                <ReviewerPaperCard
                                    paperInfo={{
                                        id: submission.revisionPaperSubmissionId,
                                        title: submission.title,
                                        description: submission.description,
                                        reviewStartDate: currentPhase?.revisionRoundsDetail?.find(
                                            r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                        )?.startSubmissionDate,
                                        reviewEndDate: currentPhase?.revisionRoundsDetail?.find(
                                            r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                        )?.endSubmissionDate,
                                        fileUrl: submission.revisionPaperUrl
                                    }}
                                    paperType={`Submission Round ${currentPhase?.revisionRoundsDetail?.find(
                                        r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                    )?.roundNumber}`}
                                    getStatusIcon={getStatusIcon}
                                    getStatusColor={getStatusColor}
                                />
                            </div>
                            // </SwiperSlide>
                        )
                    )}
                </EmblaCarousel>
                {/* <div className="space-y-6">
                    {(!paperDetail?.revisionPaper?.revisionPaperSubmissions ||
                        paperDetail.revisionPaper.revisionPaperSubmissions.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                                <p className="text-sm text-center">
                                    Chưa có vòng revision nào được mở cho bài báo này.
                                </p>
                            </div>
                        )}

                    {paperDetail.revisionPaper.revisionPaperSubmissions.map(
                        (submission: RevisionPaperSubmissionForReviewer) => {
                            return (
                                <div
                                    key={submission.revisionPaperSubmissionId}
                                // className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 border-2 border-orange-200"
                                >
                                    <div className="my-4">
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
                                                : `Chưa đến hạn feedback cho round ${currentPhase?.revisionRoundsDetail?.find(
                                                    r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                                )?.roundNumber}`}
                                        </Button>
                                    </div>

                                    <ReviewerPaperCard
                                        key={submission.revisionPaperSubmissionId}
                                        paperInfo={{
                                            id: submission.revisionPaperSubmissionId,
                                            title: submission.title,
                                            description: submission.description,
                                            reviewStartDate: currentPhase?.revisionRoundsDetail?.find(
                                                r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                            )?.startSubmissionDate,
                                            reviewEndDate: currentPhase?.revisionRoundsDetail?.find(
                                                r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                            )?.endSubmissionDate,
                                            fileUrl: submission.revisionPaperUrl
                                        }}
                                        paperType={`Submission Round ${currentPhase?.revisionRoundsDetail?.find(
                                            r => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
                                        )?.roundNumber}`}
                                        getStatusIcon={getStatusIcon}
                                        getStatusColor={getStatusColor}
                                    />


                                    <div className="flex flex-col items-start justify-between mb-4 pb-4 border-b border-orange-200">
                                        <div className="flex w-full items-start justify-between mb-4 pb-4 border-b border-orange-200">



                                        </div>

                                    </div>

                            
                                    {submission.revisionSubmissionFeedbacks.length > 0 && (
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
                                    )}

                                </div>
                            );
                        },
                    )}
                </div> */}
            </div>

            {/* Dialog XEM feedbacks đã gửi*/}
            {paperDetail.revisionPaper.revisionPaperSubmissions.map(
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
            )}

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
                                                onClick={handleSubmitRevisionReview}
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

            {showRevisionDecisionPopup && (
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
            )}
        </div>
    );
}
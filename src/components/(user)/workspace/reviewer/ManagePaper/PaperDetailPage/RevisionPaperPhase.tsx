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
import { formatDate } from "@/helper/format";
import {
    useSubmitPaperRevisionFeedbackMutation,
    useSubmitPaperRevisionReviewMutation,
    useListRevisionPaperReviewsQuery,
    useDecideRevisionStatusMutation,
} from "@/redux/services/paper.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { CurrentPaperPhaseForReviewer, CurrentResearchConferencePhaseForReviewer, PaperDetailForReviewer, RevisionPaperSubmissionForReviewer } from "@/types/paper.type";
import { isValidUrl } from "@/helper/paper";

interface RevisionPaperPhaseProps {
    paperDetail: PaperDetailForReviewer;
    currentPhase: CurrentResearchConferencePhaseForReviewer | null | undefined;
    paperId: string;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
}

// Component for Revision Reviews List
function RevisionReviewsList({
    paperId,
    revisionPaperId,
    // submissionId,
    isExpanded,
    onToggle,
    getStatusIcon,
    getStatusColor,
}: {
    paperId: string;
    revisionPaperId: string;
    // submissionId: string;
    isExpanded: boolean;
    onToggle: () => void;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
}) {
    const { data: revisionReviews, isLoading } = useListRevisionPaperReviewsQuery(
        { revisionPaperId, paperId },
        { skip: !isExpanded },
    );

    return (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                        Các đánh giá từ Reviewer khác
                    </span>
                    {revisionReviews?.data && (
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs font-medium">
                            {revisionReviews.data.length}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-purple-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-3">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600">Đang tải đánh giá...</p>
                        </div>
                    ) : revisionReviews?.data?.length ? (
                        revisionReviews.data.map((review) => (
                            <div
                                key={review.revisionPaperReviewId}
                                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0">
                                        {review.reviewerAvatarUrl ? (
                                            <img
                                                src={review.reviewerAvatarUrl}
                                                alt={review.reviewerName || "Reviewer"}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                                {review.reviewerName
                                                    ? review.reviewerName.charAt(0).toUpperCase()
                                                    : "R"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-gray-900">
                                                {review.reviewerName || "N/A"}
                                            </p>
                                            <span
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}
                                            >
                                                {getStatusIcon(review.globalStatusName)}
                                                {review.globalStatusName}
                                            </span>
                                        </div>
                                        {review.createdAt && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatDate(review.createdAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {review.note && (
                                    <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                        <p className="text-xs font-semibold text-yellow-800 mb-1">
                                            Ghi chú nội bộ:
                                        </p>
                                        <p className="text-sm text-gray-700">{review.note}</p>
                                    </div>
                                )}

                                {review.feedbackToAuthor && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-gray-600 mb-1">
                                            Phản hồi tới tác giả:
                                        </p>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {review.feedbackToAuthor}
                                        </p>
                                    </div>
                                )}

                                {review.feedbackMaterialUrl && (
                                    <div className="pt-3 border-t">
                                        <a
                                            href={review.feedbackMaterialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            <Download className="w-4 h-4" />
                                            Tải tài liệu đánh giá
                                        </a>
                                    </div>
                                )}

                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-400">
                                        Review ID: {review.revisionPaperReviewId}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
                            Chưa có đánh giá nào từ Reviewer
                        </p>
                    )}
                </div>
            )}
        </div>
    );
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

    const [submitRevisionReview, { isLoading: isSubmittingRevisionReview }] =
        useSubmitPaperRevisionReviewMutation();
    const [submitRevisionFeedback, { isLoading: isSubmittingRevision }] =
        useSubmitPaperRevisionFeedbackMutation();
    const [decideRevisionStatus, { isLoading: isDecidingRevision }] =
        useDecideRevisionStatusMutation();

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

    const getRevisionFeedbackPeriod = (
        roundNumber: number,
    ): { start: string; end: string } | null => {
        if (!currentPhase?.revisionRoundsDetail) return null;

        const sortedRounds = [...currentPhase.revisionRoundsDetail].sort(
            (a: any, b: any) => a.roundNumber - b.roundNumber,
        );
        const currentRoundIndex = sortedRounds.findIndex(
            (r: any) => r.roundNumber === roundNumber,
        );

        if (currentRoundIndex === -1) return null;

        const currentRound = sortedRounds[currentRoundIndex];
        const nextRound = sortedRounds[currentRoundIndex + 1];

        if (!nextRound) return null;

        return {
            start: currentRound.endSubmissionDate ?? "??",
            end: nextRound.endSubmissionDate ?? "",
        };
    };

    // const getRevisionFeedbackPeriod = (
    //     roundNumber: number,
    // ): { start: string; end: string } | null => {
    //     if (!paperDetail.currentResearchConferencePhase?.revisionRoundsDetail) return null;

    //     const sortedRounds = [...paperDetail.currentResearchConferencePhase?.revisionRoundsDetail].sort(
    //         (a: any, b: any) => a.roundNumber - b.roundNumber,
    //     );
    //     const currentRoundIndex = sortedRounds.findIndex(
    //         (r: any) => r.roundNumber === roundNumber,
    //     );

    //     if (currentRoundIndex === -1) return null;

    //     const currentRound = sortedRounds[currentRoundIndex];
    //     const nextRound = sortedRounds[currentRoundIndex + 1];

    //     if (!nextRound) return null;

    //     return {
    //         start: currentRound.endSubmissionDate ?? "??",
    //         end: nextRound.endSubmissionDate ?? "",
    //     };
    // };

    const canSubmitRevisionReview = (): boolean => {
        if (!currentPhase?.reviseStartDate || !currentPhase?.reviseEndDate) {
            return false;
        }
        return isWithinDateRange(
            currentPhase.reviseStartDate,
            currentPhase.reviseEndDate
        );
    };

    // const canSubmitRevisionReview = (submissionId: string): boolean => {
    //     if (!paperDetail?.revisionPaper) return false;
    //     const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
    //         (s) => s.revisionPaperSubmissionId === submissionId
    //     );
    //     const currentPhase = paperDetail.currentResearchConferencePhase;
    //     if (!submission || !currentPhase?.revisionRoundsDetail) return false;

    //     const roundDetail = currentPhase.revisionRoundsDetail.find(
    //         (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
    //     );

    //     if (!roundDetail || !roundDetail.startSubmissionDate || !roundDetail.endSubmissionDate)
    //         return false;

    //     return isWithinDateRange(roundDetail.startSubmissionDate, roundDetail.endSubmissionDate);
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

        return isWithinDateRange(
            roundDetail.startSubmissionDate,
            roundDetail.endSubmissionDate
        );
    };

    // const canSubmitRevisionFeedback = (submissionId: string): boolean => {
    //     if (!paperDetail?.revisionPaper) return false;
    //     const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
    //         (s) => s.revisionPaperSubmissionId === submissionId
    //     );
    //     const currentPhase = paperDetail.currentResearchConferencePhase;
    //     if (!submission || !currentPhase?.revisionRoundsDetail) return false;

    //     const roundDetail = currentPhase.revisionRoundsDetail.find(
    //         (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
    //     );

    //     if (!roundDetail || !roundDetail.startSubmissionDate || !roundDetail.endSubmissionDate)
    //         return false;

    //     return isWithinDateRange(roundDetail.startSubmissionDate, roundDetail.endSubmissionDate);
    // };

    const toggleReviewsExpansion = () => {
        setExpandedReviewsSubmissions((prev) => !prev);
    };

    const handleSubmitRevisionReview = async () => {
        if (!paperDetail?.revisionPaper) return;

        if (!revisionReview.note && !revisionReview.feedbackToAuthor && !revisionReview.file) {
            toast.error("Vui lòng nhập thông tin đánh giá");
            return;
        }

        if (!canSubmitRevisionReview()) {
            toast.error(
                `Thời hạn nộp đánh giá Revision là từ ${formatDate(currentPhase!.reviseStartDate)} đến ${formatDate(currentPhase!.reviseEndDate)}`
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

    //   const handleSubmitRevisionReview = async (submissionId: string) => {
    //     if (!paperDetail?.revisionPaper) return;

    //     const reviewData = revisionReviews[submissionId];
    //     if (!reviewData) {
    //       toast.error("Vui lòng nhập thông tin đánh giá");
    //       return;
    //     }

    //     if (!canSubmitRevisionReview(submissionId)) {
    //       const submission =
    //         paperDetail.revisionPaper.revisionPaperSubmissions.find(
    //           (s: any) => s.revisionPaperSubmissionId === submissionId,
    //         );
    //       toast.error(
    //         `Thời hạn nộp đánh giá cho Round ${paperDetail.currentResearchConferencePhase?.reviseStartDate} là từ ${formatDate(paperDetail.currentResearchConferencePhase?.reviseStartDate)} đến ${formatDate(paperDetail.currentResearchConferencePhase?.reviseEndDate)}`,
    //       );
    //       return;
    //     }

    //     try {
    //       await submitRevisionReview({
    //         paperId,
    //         revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
    //         revisionPaperSubmissionId: submissionId,
    //         globalStatus: reviewData.globalStatus,
    //         note: reviewData.note,
    //         feedbackToAuthor: reviewData.feedbackToAuthor,
    //         feedbackMaterialFile: reviewData.file || undefined,
    //       }).unwrap();

    //       toast.success("Gửi đánh giá revision thành công");

    //       setRevisionReviews((prev) => {
    //         const updated = { ...prev };
    //         delete updated[submissionId];
    //         return updated;
    //       });
    //     } catch (error: unknown) {
    //       const err = error as ApiError;
    //       const errorMessage = err?.message || "Lỗi khi gửi revision review";
    //       toast.error(errorMessage);
    //     }
    //   };

    const handleSubmitRevisionFeedback = async (submissionId: string) => {
        if (!paperDetail?.revisionPaper) return;

        const feedbacks = revisionFeedbacks[submissionId];
        if (!feedbacks || feedbacks.length === 0) {
            toast.error("Vui lòng nhập ít nhất một feedback");
            return;
        }

        const submission = paperDetail.revisionPaper.revisionPaperSubmissions.find(
            (s: any) => s.revisionPaperSubmissionId === submissionId,
        );

        if (!submission) return;

        const roundDeadline = paperDetail.currentResearchConferencePhase?.revisionRoundsDetail?.find(
            (r) => r.revisionRoundDeadlineId === submission.revisionDeadlineRoundId
        );

        if (!roundDeadline) {
            toast.error(`Không tìm thấy round tương ứng với submission này`);
            return;
        }

        if (!canSubmitRevisionFeedback(roundDeadline.revisionRoundDeadlineId)) {

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
    //   const updateRevisionReview = (
    //     submissionId: string,
    //     field: string,
    //     value: string | boolean | File | null,
    //   ) => {
    //     setRevisionReviews((prev) => ({
    //       ...prev,
    //       [submissionId]: {
    //         ...(prev[submissionId] || {
    //           note: "",
    //           feedbackToAuthor: "",
    //           globalStatus: "Accepted",
    //           file: null,
    //         }),
    //         [field]: value,
    //       },
    //     }));
    //   };

    //   const getRevisionReview = (submissionId: string) => {
    //     return (
    //       revisionReviews[submissionId] || {
    //         note: "",
    //         feedbackToAuthor: "",
    //         globalStatus: "Accepted",
    //         file: null,
    //       }
    //     );
    //   };


    const handleDecideRevisionStatus = async () => {
        if (!paperDetail?.revisionPaper) return;
        if (!canSubmitRevisionReview()) {
            toast.error(
                `Chỉ có thể quyết định Revision sau ngày ${formatDate(currentPhase!.reviseEndDate)}`,
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
                            disabled={!paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview}
                        >
                            <Gavel className="w-4 h-4 mr-2" />
                            {paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview
                                ? "Quyết định cuối cùng"
                                : "Chưa thể quyết định, còn reviewer chưa nộp"}
                        </Button>
                    )}
                </div>
                {/* ========== THÔNG TIN CƠ BẢN ========== */}
                <div className="space-y-3 mb-6">
                    {[
                        ["Tiêu đề:", paperDetail.revisionPaper.title],
                        ["Mô tả:", paperDetail.revisionPaper.description],
                        [
                            "Trạng thái Review:",
                            <span
                                key="reviewStatus"
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                    paperDetail.revisionPaper.globalStatusName
                                )}`}
                            >
                                {getStatusIcon(paperDetail.revisionPaper.globalStatusName)}
                                {paperDetail.revisionPaper.globalStatusName}
                            </span>,
                        ],
                        [
                            "Thời gian gửi đánh giá:",
                            `${formatDate(currentPhase?.reviewStartDate)} → ${formatDate(
                                currentPhase?.reviseEndDate
                            )}`,
                        ],
                        [
                            "Tình trạng hoàn thành đánh giá:",
                            <span
                                key="reviewDone"
                                className={`px-3 py-1 rounded-full text-sm font-medium ${paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    }`}
                            >
                                {paperDetail.revisionPaper.isAllSubmittedRevisionPaperReview
                                    ? "Tất cả Reviewer đã nộp"
                                    : "Đang chờ các reviewer còn lại gửi đánh giá"}
                            </span>,
                        ],
                    ].map(([label, value], idx) => (
                        <div key={idx} className="flex items-start">
                            <span className="w-60 text-sm text-gray-600 shrink-0">{label}</span>
                            <span className="text-sm text-gray-900 leading-relaxed">{value}</span>
                        </div>
                    ))}

                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={() => setShowReviewDialog(true)}
                            className="bg-orange-600 hover:bg-orange-700"
                            size="lg"
                            disabled={!canSubmitRevisionReview()}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {canSubmitRevisionReview() ? "Gửi đánh giá tổng" : "Chưa đến hạn đánh giá"}
                        </Button>
                    </div>
                </div>
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
                    />
                )}

            {/* Revision Submissions with Review Forms */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Các Round Revision
                </h3>

                {/* Overall Status */}
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
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
                </div>

                {/* Revision Submissions */}
                <div className="space-y-6">
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
                            //   const reviewData = getRevisionReview(
                            //     submission.revisionPaperSubmissionId,
                            //   );

                            return (
                                <div
                                    key={submission.revisionPaperSubmissionId}
                                    className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 border-2 border-orange-200"
                                >
                                    {/* Submission Header */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-orange-200">
                                        {/* <div>
                                            <h4 className="text-lg font-bold text-gray-900">
                                                Round {submission.roundNumber}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Deadline: {formatDate(submission.endDate)}
                                            </p>
                                        </div> */}
                                        <a
                                            href={submission.revisionPaperUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Tải xuống
                                        </a>

                                        <div className="pt-4 border-t max-h-[600px] overflow-auto">
                                            {docAvailability[submission.revisionPaperSubmissionId] === null && (
                                                <div className="text-gray-500 text-sm">Đang kiểm tra file...</div>
                                            )}

                                            {docAvailability[submission.revisionPaperSubmissionId] === false && (
                                                <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700 text-sm">
                                                    File không tồn tại hoặc URL không hợp lệ
                                                </div>
                                            )}

                                            {docAvailability[submission.revisionPaperSubmissionId] && (
                                                <DocViewer
                                                    documents={[{
                                                        uri: submission.revisionPaperUrl,
                                                        fileType: "pdf"
                                                    }]}
                                                    pluginRenderers={DocViewerRenderers}
                                                    config={{
                                                        header: { disableHeader: true },
                                                        pdfVerticalScrollByDefault: true,
                                                    }}
                                                    style={{ width: "100%", minHeight: 400, borderRadius: 8 }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Previous Feedbacks */}
                                    {submission.revisionSubmissionFeedbacks.length > 0 && (
                                        <div className="mb-6">
                                            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                Feedbacks đã gửi
                                            </h5>
                                            <div className="space-y-2">
                                                {submission.revisionSubmissionFeedbacks.map(
                                                    (feedback: any) => (
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

                                    {/* Review Form for this Submission */}
                                    {/* <div className="bg-white rounded-lg p-5 border border-orange-300">
                    <h5 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4 text-orange-600" />
                      Đánh giá cho Round {submission.roundNumber}
                    </h5>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ghi chú nội bộ
                        </label>
                        <textarea
                          placeholder="Nhập ghi chú nội bộ..."
                          className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={reviewData.note}
                          onChange={(e) =>
                            updateRevisionReview(
                              submission.revisionPaperSubmissionId,
                              "note",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phản hồi tới tác giả
                        </label>
                        <textarea
                          placeholder="Nhập phản hồi cho tác giả..."
                          className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={reviewData.feedbackToAuthor}
                          onChange={(e) =>
                            updateRevisionReview(
                              submission.revisionPaperSubmissionId,
                              "feedbackToAuthor",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trạng thái đánh giá
                        </label>
                        <select
                          className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-orange-500"
                          value={reviewData.globalStatus}
                          onChange={(e) =>
                            updateRevisionReview(
                              submission.revisionPaperSubmissionId,
                              "globalStatus",
                              e.target.value,
                            )
                          }
                        >
                          <option value="Accepted">Accepted</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tài liệu đánh giá (nếu có)
                        </label>
                        <input
                          type="file"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                          onChange={(e) =>
                            updateRevisionReview(
                              submission.revisionPaperSubmissionId,
                              "file",
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                        {reviewData.file && (
                          <p className="text-xs text-gray-600 mt-2">
                            File đã chọn: {reviewData.file.name}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() =>
                          handleSubmitRevisionReview(
                            submission.revisionPaperSubmissionId,
                          )
                        }
                        disabled={isSubmittingRevisionReview}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmittingRevisionReview
                          ? "Đang gửi..."
                          : "Gửi đánh giá"}
                      </Button>
                    </div>
                  </div> */}
                                </div>
                            );
                        },
                    )}
                </div>
            </div>

            {/* Feedback Section - Separated Like YouTube Comments */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Feedbacks chi tiết
                </h3>

                {(paperDetail.revisionPaper?.revisionPaperSubmissions?.length || 0) === 0 && (
                    <p className="text-gray-500 italic text-sm">
                        Chưa có đợt revision nào để gửi feedback.
                    </p>
                )}

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
                            <div className="flex gap-3">
                                <div className="w-8"></div>
                                <Button
                                    onClick={() => setShowFeedbackDialogs(prev => ({
                                        ...prev,
                                        [submission.revisionPaperSubmissionId]: true
                                    }))}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={!canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    {canSubmitRevisionFeedback(submission.revisionPaperSubmissionId)
                                        ? "Nhập feedback"
                                        : "Chưa đến hạn feedback"}
                                </Button>
                            </div>

                            {/* Dialog feedback cho submission này */}
                            <Transition
                                appear
                                show={showFeedbackDialogs[submission.revisionPaperSubmissionId] || false}
                                as={Fragment}
                            >
                                <Dialog
                                    as="div"
                                    className="relative z-50"
                                    onClose={() => setShowFeedbackDialogs(prev => ({
                                        ...prev,
                                        [submission.revisionPaperSubmissionId]: false
                                    }))}
                                >
                                    {/* Tương tự dialog review, nhưng chứa form feedback */}
                                    <div className="ml-13 space-y-3">
                                        {(
                                            revisionFeedbacks[submission.revisionPaperSubmissionId] || []
                                        ).map((feedback, index) => (
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
                                        ))}

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
                                        {(revisionFeedbacks[submission.revisionPaperSubmissionId]
                                            ?.length || 0) > 0 && (
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
                                                            : `Gửi ${revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0} feedback`}
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                    {/* ... */}
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
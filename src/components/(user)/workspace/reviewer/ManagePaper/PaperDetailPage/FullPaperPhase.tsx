import { useEffect, useState } from "react";
import {
    FileText,
    Download,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    Gavel,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";
import { useSubmitFullPaperReviewMutation, useDecideFullPaperStatusMutation } from "@/redux/services/paper.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { CurrentResearchConferencePhaseForReviewer, FullPaperReview, PaperDetailForReviewer } from "@/types/paper.type";
import { isValidUrl, isWithinDateRange } from "@/helper/paper";
import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";
import ReviewerPaperCard from "./ReviewerPaperCard";
import { parseApiError } from "@/helper/api";

interface FullPaperPhaseProps {
    paperDetail: PaperDetailForReviewer;
    currentPhase: CurrentResearchConferencePhaseForReviewer | null | undefined;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
    paperId: string;
}

export default function FullPaperPhase({
    paperDetail,
    currentPhase,
    getStatusIcon,
    getStatusColor,
    paperId,
}: FullPaperPhaseProps) {
    const [note, setNote] = useState<string>("");
    const [feedbackToAuthor, setFeedbackToAuthor] = useState<string>("");
    const [reviewStatus, setReviewStatus] = useState<string>("Accepted");
    const [file, setFile] = useState<File | null>(null);

    const [showDecisionPopup, setShowDecisionPopup] = useState(false);
    const [decisionStatus, setDecisionStatus] = useState("Accepted");

    const [showReviewDialog, setShowReviewDialog] = useState(false);

    const [docAvailable, setDocAvailable] = useState<boolean | null>(null);
    const [docViewerError, setDocViewerError] = useState<boolean>(false);

    const [showReviewsDialog, setShowReviewsDialog] = useState(false);

    const [submitReview, { isLoading: isSubmitting, error: submitReviewError }] =
        useSubmitFullPaperReviewMutation();

    const [decideStatus, { isLoading: isDeciding }] =
        useDecideFullPaperStatusMutation();

    useEffect(() => {
        if (submitReviewError) toast.error(parseApiError<string>(submitReviewError)?.data?.message)
    }, [submitReviewError])


    useEffect(() => {
        const url = paperDetail.fullPaper?.fullPaperUrl;

        if (!url) {  // url null/undefined
            setDocAvailable(false);
            return;
        }

        if (!isValidUrl(url)) {
            setDocAvailable(false);
            return;
        }

        fetch(url, { method: "HEAD" })
            .then((res) => setDocAvailable(res.ok))
            .catch(() => setDocAvailable(false));
    }, [paperDetail.fullPaper?.fullPaperUrl]);

    const canSubmitFullPaperReview = (): boolean => {
        if (
            !currentPhase ||
            !currentPhase.reviewStartDate ||
            !currentPhase.reviewEndDate
        ) {
            return false;
        }
        return isWithinDateRange(
            currentPhase.reviewStartDate,
            currentPhase.reviewEndDate,
        );
    };

    const canDecideFullPaperStatus = (): boolean => {
        if (
            !currentPhase ||
            !currentPhase.fullPaperDecideStatusStart ||
            !currentPhase.fullPaperDecideStatusEnd
        ) {
            return false;
        }
        return isWithinDateRange(
            currentPhase.fullPaperDecideStatusStart,
            currentPhase.fullPaperDecideStatusEnd,
        );
    };

    // const isNotAllSubmitted = !paperDetail.fullPaper?.isAllSubmittedFullPaperReview;
    const hasAtLeastOneReview =
        paperDetail?.fullPaper?.fullPaperReviews &&
        paperDetail?.fullPaper?.fullPaperReviews.length > 0;
    const isOutOfDecisionTime = !canDecideFullPaperStatus();

    const handleSubmitReview = async () => {
        if (!paperDetail?.fullPaper) return;
        if (!canSubmitFullPaperReview()) {
            toast.error(
                `Thời hạn nộp đánh giá Full Paper là từ ${formatDate(currentPhase!.reviewStartDate)} đến ${formatDate(currentPhase!.reviewEndDate)}`,
            );
            return;
        }
        try {
            await submitReview({
                fullPaperId: paperDetail.fullPaper.fullPaperId,
                note,
                feedbackToAuthor,
                reviewStatus,
                feedbackMaterialFile: file!,
            }).unwrap();
            toast.success("Gửi đánh giá thành công");
            setNote("");
            setFeedbackToAuthor("");
            setFile(null);
        } catch (error: unknown) {
            const err = error as ApiError;
            const errorMessage = err?.message || "Lỗi khi gửi đánh giá";
            toast.error(errorMessage);
        }
    };

    const handleDecideStatus = async () => {
        if (!paperDetail?.fullPaper) return;
        if (!canDecideFullPaperStatus()) {
            toast.error(
                `Thời hạn quyết định Full Paper là từ ${formatDate(currentPhase!.fullPaperDecideStatusStart)} đến ${formatDate(currentPhase!.fullPaperDecideStatusEnd)}`,
            );
            return;
        }
        try {
            await decideStatus({
                paperId,
                fullPaperId: paperDetail.fullPaper.fullPaperId,
                reviewStatus: decisionStatus,
            }).unwrap();
            toast.success("Cập nhật trạng thái thành công");
            setShowDecisionPopup(false);
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || "Lỗi khi cập nhật trạng thái";
            toast.error(errorMessage);
        }
    };

    if (!paperDetail.fullPaper) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Chưa có thông tin Full Paper</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Full Paper
                    </h3>

                    {paperDetail.isHeadReviewer && (
                        <div className="flex gap-3">
                            {paperDetail.fullPaper.fullPaperReviews?.length > 0 && (
                                <Button
                                    onClick={() => setShowReviewsDialog(true)}
                                    variant="outline"
                                    size="lg"
                                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {paperDetail.fullPaper.fullPaperReviews.length} lượt đánh giá
                                </Button>
                            )}

                            <Button
                                onClick={() => setShowDecisionPopup(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                                size="lg"
                                disabled={!hasAtLeastOneReview || isOutOfDecisionTime}
                            >
                                <Gavel className="w-4 h-4 mr-2" />
                                {/* {isNotAllSubmitted && !isOutOfDecisionTime && "Chưa thể quyết định, còn reviewer chưa nộp"}
                            {!isNotAllSubmitted && isOutOfDecisionTime && "Chưa thể quyết định, ngoài khoảng thời gian"}
                            {isNotAllSubmitted && isOutOfDecisionTime && "Chưa thể quyết định, reviewer chưa nộp & ngoài thời gian"}
                            {!isNotAllSubmitted && !isOutOfDecisionTime && "Quyết định cuối cùng"} */}

                                {!hasAtLeastOneReview && !isOutOfDecisionTime && "Chưa thể quyết định, chưa có review nào"}
                                {hasAtLeastOneReview && isOutOfDecisionTime && "Ngoài thời gian quyết định"}
                                {!hasAtLeastOneReview && isOutOfDecisionTime && "Chưa có review & ngoài thời gian"}
                                {hasAtLeastOneReview && !isOutOfDecisionTime && "Quyết định cuối cùng"}

                            </Button>
                        </div>
                        // <Button
                        //     onClick={() => setShowDecisionPopup(true)}
                        //     className="bg-purple-600 hover:bg-purple-700"
                        //     size="lg"
                        //     disabled={!paperDetail.fullPaper.isAllSubmittedFullPaperReview}
                        // >
                        //     <Gavel className="w-4 h-4 mr-2" />
                        //     {paperDetail.fullPaper.isAllSubmittedFullPaperReview
                        //         ? "Quyết định cuối cùng"
                        //         : "Chưa thể quyết định, còn reviewer chưa nộp"}
                        // </Button>
                    )}
                </div>

                {/* ========== THÔNG TIN CƠ BẢN ========== */}
                <ReviewerPaperCard
                    paperInfo={{
                        id: paperDetail.fullPaper.fullPaperId,
                        title: paperDetail.fullPaper.title,
                        description: paperDetail.fullPaper.description,
                        reviewStatusName: paperDetail.fullPaper.reviewStatusName,
                        isAllSubmittedReview: paperDetail.fullPaper.isAllSubmittedFullPaperReview,
                        reviewStartDate: currentPhase?.reviewStartDate,
                        reviewEndDate: currentPhase?.reviewEndDate,
                        fileUrl: paperDetail.fullPaper.fullPaperUrl
                    }}
                    paperType="Full Paper"
                    phaseInfo={paperDetail.currentResearchConferencePhase}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                />

                <div className="mt-6">
                    {canSubmitFullPaperReview() ? (
                        <Button
                            className="bg-black hover:bg-gray-800"
                            onClick={() => setShowReviewDialog(true)}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Đánh giá Full Paper
                        </Button>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Hiện không trong thời gian đánh giá Full Paper
                        </p>
                    )}
                </div>

                {/* ========== FORM REVIEW ========== */}
                {/* Dialog cho review */}
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 mb-4"
                                        >
                                            Phần đánh giá Full Paper
                                        </Dialog.Title>

                                        <div className="space-y-4">
                                            {/* Ghi chú nội bộ */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú nội bộ</label>
                                                <textarea
                                                    placeholder="Nhập ghi chú nội bộ..."
                                                    className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                />
                                            </div>

                                            {/* Phản hồi tới tác giả */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phản hồi tới tác giả</label>
                                                <textarea
                                                    placeholder="Nhập phản hồi cho tác giả..."
                                                    className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={feedbackToAuthor}
                                                    onChange={(e) => setFeedbackToAuthor(e.target.value)}
                                                />
                                            </div>

                                            {/* Trạng thái đánh giá */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái đánh giá</label>
                                                <select
                                                    className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                                                    value={reviewStatus}
                                                    onChange={(e) => setReviewStatus(e.target.value)}
                                                >
                                                    <option value="Accepted">Accepted</option>
                                                    <option value="Revise">Revise</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>

                                            {/* File đánh giá */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu đánh giá (nếu có)</label>
                                                <input
                                                    type="file"
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                />
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex gap-3 mt-4">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => setShowReviewDialog(false)}
                                                    disabled={isSubmitting}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-black hover:bg-gray-800"
                                                    onClick={handleSubmitReview}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                                                </Button>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
                {/* <div className="pt-6 border-t">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Phần đánh giá Full Paper
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú nội bộ
                            </label>
                            <textarea
                                placeholder="Nhập ghi chú nội bộ..."
                                className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phản hồi tới tác giả
                            </label>
                            <textarea
                                placeholder="Nhập phản hồi cho tác giả..."
                                className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={feedbackToAuthor}
                                onChange={(e) => setFeedbackToAuthor(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái đánh giá
                            </label>
                            <select
                                className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                                value={reviewStatus}
                                onChange={(e) => setReviewStatus(e.target.value)}
                            >
                                <option value="Accepted">Accepted</option>
                                <option value="Revise">Revise</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tài liệu đánh giá (nếu có)
                            </label>
                            <input
                                type="file"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <Button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="w-full bg-black hover:bg-gray-800"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                    </div>
                </div> */}
            </div>

            {/* ========== DANH SÁCH REVIEW CỦA CÁC REVIEWER KHÁC ========== */}
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
                                            <FileText className="w-5 h-5 text-purple-600" />
                                            Các đánh giá từ Reviewer ({paperDetail.fullPaper.fullPaperReviews?.length || 0})
                                        </Dialog.Title>
                                    </div>

                                    <div className="overflow-y-auto px-6 py-4 space-y-3">
                                        {paperDetail.fullPaper.fullPaperReviews?.map((review: FullPaperReview) => (
                                            <div key={review.fullPaperReviewId} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {review.reviewerAvatarUrl ? (
                                                        <img
                                                            src={review.reviewerAvatarUrl}
                                                            alt={review.reviewerName || "Reviewer"}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                                            {review.reviewerName?.charAt(0).toUpperCase() || "R"}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-semibold text-gray-900">{review.reviewerName || "N/A"}</p>
                                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.reviewStatusName)}`}>
                                                                {getStatusIcon(review.reviewStatusName)}
                                                                {review.reviewStatusName}
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
            {/* <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Các đánh giá từ Reviewer khác
                </h3>

                {paperDetail.fullPaper.fullPaperReviews?.length > 0 ? (
                    <div className="space-y-4">
                        {paperDetail.fullPaper.fullPaperReviews.map((review: FullPaperReview) => (
                            <div
                                key={review.fullPaperReviewId}
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
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                    review.reviewStatusName,
                                                )}`}
                                            >
                                                {getStatusIcon(review.reviewStatusName)}
                                                {review.reviewStatusName}
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
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Chưa có đánh giá nào từ Reviewer khác
                    </div>
                )}
            </div> */}

            {
                showDecisionPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-purple-600" />
                                Quyết định cuối cùng - Full Paper
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn trạng thái
                                    </label>
                                    <select
                                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                                        value={decisionStatus}
                                        onChange={(e) => setDecisionStatus(e.target.value)}
                                    >
                                        <option value="Accepted">Accepted</option>
                                        <option value="Revise">Revise</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDecisionPopup(false)}
                                        className="flex-1"
                                        disabled={isDeciding}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleDecideStatus}
                                        disabled={isDeciding}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isDeciding ? "Đang xử lý..." : "Xác nhận"}
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
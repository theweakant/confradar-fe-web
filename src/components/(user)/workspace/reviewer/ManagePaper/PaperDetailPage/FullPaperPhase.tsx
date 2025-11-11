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
import { CurrentResearchConferencePhaseForReviewer, PaperDetailForReviewer } from "@/types/paper.type";
import { isValidUrl } from "@/helper/paper";

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

    const [submitReview, { isLoading: isSubmitting }] =
        useSubmitFullPaperReviewMutation();

    const [decideStatus, { isLoading: isDeciding }] =
        useDecideFullPaperStatusMutation();


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

    const isWithinDateRange = (startDate: string, endDate: string): boolean => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return now >= start && now <= end;
    };

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
                `Thời hạn quyết định Full Paper là từ ${formatDate(currentPhase!.reviewStartDate)} đến ${formatDate(currentPhase!.reviewEndDate)}`,
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
                        <Button
                            onClick={() => setShowDecisionPopup(true)}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="lg"
                            disabled={!paperDetail.fullPaper.isAllSubmittedFullPaperReview}
                        >
                            <Gavel className="w-4 h-4 mr-2" />
                            {paperDetail.fullPaper.isAllSubmittedFullPaperReview
                                ? "Quyết định cuối cùng"
                                : "Chưa thể quyết định, còn reviewer chưa nộp"}
                        </Button>
                    )}
                </div>

                {/* ========== THÔNG TIN CƠ BẢN ========== */}
                <div className="space-y-3 mb-6">
                    {[
                        ["Tiêu đề:", paperDetail.fullPaper.title],
                        ["Mô tả:", paperDetail.fullPaper.description],
                        [
                            "Trạng thái Review:",
                            <span
                                key="reviewStatus"
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                    paperDetail.fullPaper.reviewStatusName
                                )}`}
                            >
                                {getStatusIcon(paperDetail.fullPaper.reviewStatusName)}
                                {paperDetail.fullPaper.reviewStatusName}
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
                                className={`px-3 py-1 rounded-full text-sm font-medium ${paperDetail.fullPaper.isAllSubmittedFullPaperReview
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    }`}
                            >
                                {paperDetail.fullPaper.isAllSubmittedFullPaperReview
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
                            className="bg-black hover:bg-gray-800 w-auto px-6"
                            size={"lg"}
                            disabled={!canSubmitFullPaperReview()}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {canSubmitFullPaperReview() ? "Gửi đánh giá" : "Chưa đến hạn nộp đánh giá"}
                        </Button>
                    </div>

                    <div className="pt-4 border-t max-h-[600px] overflow-auto">
                        {docAvailable === null && (
                            <div className="text-gray-500 text-sm">Đang kiểm tra file...</div>
                        )}

                        {docAvailable === false && (
                            <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700 text-sm">
                                File không tồn tại hoặc URL không hợp lệ
                            </div>
                        )}

                        {docAvailable && !docViewerError && (
                            <DocViewer
                                documents={[{ uri: paperDetail.fullPaper.fullPaperUrl, fileType: "pdf" }]}
                                pluginRenderers={DocViewerRenderers}
                                config={{
                                    header: { disableHeader: true },
                                    pdfVerticalScrollByDefault: true,
                                }}
                                style={{ width: "100%", minHeight: 400, borderRadius: 8 }}
                            />
                        )}
                    </div>

                    {/* <div className="pt-4 border-t max-h-[600px] overflow-auto">
                        {docAvailable === null && (
                            <div className="text-gray-500 text-sm">Đang kiểm tra file...</div>
                        )}
                        {docAvailable === false && (
                            <div className="text-red-500 text-sm">
                                Không thể mở file. Vui lòng tải xuống.
                                <a
                                    href={paperDetail.fullPaper.fullPaperUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline"
                                >
                                    Tải file
                                </a>
                            </div>
                        )}
                        {docAvailable && (
                            <DocViewer
                                documents={[{ uri: paperDetail.fullPaper.fullPaperUrl }]}
                                pluginRenderers={DocViewerRenderers}
                                config={{
                                    header: { disableHeader: true },
                                    pdfVerticalScrollByDefault: true,
                                    noRenderer: {
                                        overrideComponent: ({ document }) => (
                                            <div className="p-4 border border-gray-300 rounded bg-gray-50">
                                                <p className="text-gray-700 mb-2">
                                                    Không thể preview file này: {document?.fileName || document?.uri}
                                                </p>
                                                <a
                                                    href={document?.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    Tải xuống
                                                </a>
                                            </div>
                                        ),
                                    },
                                }}
                                style={{ width: "100%", minHeight: 400, borderRadius: 8 }}
                            />
                        )}
                    </div> */}

                    {/* <div className="pt-4 border-t">
                        <a
                            href={paperDetail.fullPaper.fullPaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Tải xuống Full Paper
                        </a>
                    </div> */}
                </div>
                {/* <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                        <span className="text-sm text-gray-600">Tiêu đề:</span>
                        <span className="text-sm font-medium text-gray-900">
                            {paperDetail.fullPaper.title}
                        </span>
                    </div>

                    <div className="flex items-start">
                        <span className="text-sm text-gray-600">Mô tả:</span>
                        <span className="text-sm text-gray-700">
                            {paperDetail.fullPaper.description}
                        </span>
                    </div>

                    <div className="flex items-start">
                        <span className="text-sm text-gray-600">Trạng thái Review:</span>
                        <span
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                paperDetail.fullPaper.reviewStatusName,
                            )}`}
                        >
                            {getStatusIcon(paperDetail.fullPaper.reviewStatusName)}
                            {paperDetail.fullPaper.reviewStatusName}
                        </span>
                    </div>

                    <div className="flex items-start ">
                        <span className="text-sm text-gray-600">Thời gian nộp bài:</span>
                        <span className="text-sm text-gray-700">
                            {formatDate(paperDetail.fullPaper.fullPaperStartDate)} →{" "}
                            {formatDate(paperDetail.fullPaper.fullPaperEndDate)}
                        </span>
                    </div>

                    <div className="flex items-start">
                        <span className="text-sm text-gray-600">
                            Tình trạng hoàn thành đánh giá:
                        </span>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${paperDetail.fullPaper.isAllSubmittedFullPaperReview
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                }`}
                        >
                            {paperDetail.fullPaper.isAllSubmittedFullPaperReview
                                ? "Tất cả Reviewer đã nộp"
                                : "Đang chờ Reviewer"}
                        </span>
                    </div>

                    <div className="pt-3 border-t">
                        <a
                            href={paperDetail.fullPaper.fullPaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Tải xuống Full Paper
                        </a>
                    </div>
                </div> */}

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
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Các đánh giá từ Reviewer khác
                </h3>

                {paperDetail.fullPaper.fullPaperReviews?.length > 0 ? (
                    <div className="space-y-4">
                        {paperDetail.fullPaper.fullPaperReviews.map((review: any) => (
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
            </div>
            {/* {paperDetail.fullPaper.fullPaperReviews?.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Các đánh giá từ Reviewer khác
                    </h3>

                    <div className="space-y-4">
                        {paperDetail.fullPaper.fullPaperReviews.map((review: any) => (
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
                </div>
            )} */}

            {showDecisionPopup && (
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
            )}
        </div>
    );
}
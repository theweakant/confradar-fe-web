import {
    FileText,
    Download,
    ChevronDown,
    ChevronUp,

} from "lucide-react";
import { formatDate } from "@/helper/format";
import {
    useListRevisionPaperReviewsQuery,
} from "@/redux/services/paper.service";
import { ApiResponse } from "@/types/api.type";
import { ListRevisionPaperReview } from "@/types/paper.type";

function RevisionReviewsList({
    paperId,
    revisionPaperId,
    // submissionId,
    isExpanded,
    onToggle,
    getStatusIcon,
    getStatusColor,
    revisionReviews,
    isLoading
}: {
    paperId: string;
    revisionPaperId: string;
    // submissionId: string;
    isExpanded: boolean;
    onToggle: () => void;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
    revisionReviews: ApiResponse<ListRevisionPaperReview[]> | undefined
    isLoading: boolean
}) {
    // const { data: revisionReviews, isLoading } = useListRevisionPaperReviewsQuery(
    //     { revisionPaperId, paperId },
    //     { skip: !isExpanded },
    // );

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

export default RevisionReviewsList;
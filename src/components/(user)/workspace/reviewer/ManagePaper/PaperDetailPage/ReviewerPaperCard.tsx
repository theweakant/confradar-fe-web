import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";
import { CurrentResearchConferencePhaseForReviewer, RevisionRoundDeadlineForReviewer, RevisionRoundDetail } from "@/types/paper.type";
import { FileText, Calendar, CheckCircle, Clock, Users, Eye, ArrowRight } from "lucide-react";

interface ReviewerPaperInfo {
    id: string;
    title?: string;
    description?: string;
    reviewStatusName?: string;
    globalStatusName?: string;
    isAllSubmittedReview?: boolean;
    reviewStartDate?: string;
    reviewEndDate?: string;
    createdAt?: string;
    updatedAt?: string;
    fileUrl?: string;
}

interface ReviewerPaperCardProps {
    paperInfo: ReviewerPaperInfo;
    paperType: "Full Paper" | "Revision Paper" | "Camera Ready" | string;
    phaseInfo?: CurrentResearchConferencePhaseForReviewer | null;
    revisionRoundDetail?: RevisionRoundDeadlineForReviewer | null;
    getStatusIcon?: (status?: string) => React.ReactNode;
    getStatusColor?: (status?: string) => string;
}

const ReviewerPaperCard: React.FC<ReviewerPaperCardProps> = ({
    paperInfo,
    paperType,
    phaseInfo,
    revisionRoundDetail,
    getStatusIcon,
    getStatusColor
}) => {
    const defaultGetStatusColor = (status?: string) => {
        if (!status) return "bg-gray-100 text-gray-600";
        const statusLower = status.toLowerCase();
        if (statusLower.includes("accepted")) return "bg-emerald-100 text-emerald-700";
        if (statusLower.includes("rejected")) return "bg-rose-100 text-rose-700";
        if (statusLower.includes("pending")) return "bg-amber-100 text-amber-700";
        if (statusLower.includes("revise")) return "bg-blue-100 text-blue-700";
        return "bg-gray-100 text-gray-600";
    };

    const statusColorClass = getStatusColor
        ? getStatusColor(paperInfo.reviewStatusName || paperInfo.globalStatusName)
        : defaultGetStatusColor(paperInfo.reviewStatusName || paperInfo.globalStatusName);

    // Determine which timeline to show based on paper type
    const getTimelineInfo = () => {
        if (!phaseInfo) return null;

        const paperTypeLower = paperType.toLowerCase();

        if (paperTypeLower.includes("full paper")) {
            return {
                sections: [
                    {
                        label: "Gửi đánh giá",
                        startDate: phaseInfo.reviewStartDate,
                        endDate: phaseInfo.reviewEndDate,
                    },
                    {
                        label: "Quyết định trạng thái Full Paper",
                        startDate: phaseInfo.fullPaperDecideStatusStart,
                        endDate: phaseInfo.fullPaperDecideStatusEnd,
                    },
                ],
            };
        }

        if (paperTypeLower.includes("revision")) {
            return {
                sections: [
                    {
                        label: "Quyết định trạng thái Revision Paper",
                        startDate: phaseInfo.revisionPaperDecideStatusStart,
                        endDate: phaseInfo.revisionPaperDecideStatusEnd,
                    },
                ],
            };
        }

        if (paperType.startsWith("Submission Round ")) {
            if (revisionRoundDetail) {
                return {
                    sections: [
                        {
                            label: `Nộp bài Round ${revisionRoundDetail.roundNumber}`,
                            startDate: revisionRoundDetail.startSubmissionDate,
                            endDate: revisionRoundDetail.endSubmissionDate,
                        },
                    ],
                };
            }
        }

        // if (paperTypeLower.includes("revision")) {
        //     return {
        //         sections: [
        //             {
        //                 label: "Quyết định trạng thái Revision Paper",
        //                 startDate: phaseInfo.revisionPaperDecideStatusStart,
        //                 endDate: phaseInfo.revisionPaperDecideStatusEnd,
        //             },
        //         ],
        //     };
        // }

        if (paperTypeLower.includes("camera ready")) {
            return {
                sections: [
                    {
                        label: "Quyết định trạng thái bản Camera Ready",
                        startDate: phaseInfo.cameraReadyDecideStatusStart,
                        endDate: phaseInfo.cameraReadyDecideStatusEnd,
                    },
                ],
            };
        }

        return null;
    };

    const timelineInfo = getTimelineInfo();

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{paperType}</h4>
                </div>
            </div>

            {/* Two Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
                {/* Left Column - Information */}
                <div className="space-y-4">
                    {/* ID Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-sm text-blue-700 font-mono">
                            ID: {paperInfo.id}
                        </span>
                    </div>

                    {/* Title & Description */}
                    {(paperInfo.title || paperInfo.description) && (
                        <div className="space-y-3">
                            {paperInfo.title && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Tiêu đề</p>
                                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                                        {paperInfo.title}
                                    </p>
                                </div>
                            )}

                            {paperInfo.description && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Mô tả</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {paperInfo.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status & Progress */}
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                        {(paperInfo.reviewStatusName || paperInfo.globalStatusName) && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1 font-medium">Trạng thái</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${statusColorClass}`}>
                                    {getStatusIcon && getStatusIcon(paperInfo.reviewStatusName || paperInfo.globalStatusName)}
                                    {paperInfo.reviewStatusName || paperInfo.globalStatusName}
                                </span>
                            </div>
                        )}

                        {/* {typeof paperInfo.isAllSubmittedReview !== 'undefined' && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1 font-medium">Tiến độ</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${paperInfo.isAllSubmittedReview
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                    }`}>
                                    {paperInfo.isAllSubmittedReview ? (
                                        <>
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Hoàn thành
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-3.5 h-3.5" />
                                            Đang chờ
                                        </>
                                    )}
                                </span>
                            </div>
                        )} */}
                    </div>

                    {/* Timeline Section */}
                    {timelineInfo && timelineInfo.sections.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-3 font-medium">Thời gian các giai đoạn</p>
                            <div className="space-y-3">
                                {timelineInfo.sections.map((section, index) => {
                                    const startDate = formatDate(section.startDate);
                                    const endDate = formatDate(section.endDate);

                                    if (!startDate || !endDate) return null;

                                    return (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">
                                                {section.label}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{startDate}</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{endDate}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    {(paperInfo.createdAt || paperInfo.updatedAt) && (
                        <div className="flex gap-4 pt-3 border-t border-gray-100">
                            {paperInfo.createdAt && (
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        <p className="text-xs text-gray-500">Ngày tạo</p>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {formatDate(paperInfo.createdAt)}
                                    </p>
                                </div>
                            )}
                            {paperInfo.updatedAt && (
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <p className="text-xs text-gray-500">Cập nhật</p>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {formatDate(paperInfo.updatedAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - File Viewer */}
                {paperInfo.fileUrl && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <p className="text-xs text-gray-500 font-medium">Xem trước tài liệu</p>
                        </div>
                        <div className="max-h-[70vh] border border-gray-200 rounded-lg bg-gray-50">
                            <ReusableDocViewer
                                fileUrl={paperInfo.fileUrl}
                                minHeight="70vh"
                                checkUrlBeforeRender={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// interface ReviewerPaperInfo {
//     id: string;
//     title?: string;
//     description?: string;
//     reviewStatusName?: string;
//     globalStatusName?: string;
//     isAllSubmittedReview?: boolean;
//     reviewStartDate?: string;
//     reviewEndDate?: string;
//     createdAt?: string;
//     updatedAt?: string;
//     fileUrl?: string;
// }

// interface ReviewerPaperCardProps {
//     paperInfo: ReviewerPaperInfo;
//     paperType: "Full Paper" | "Revision Paper" | "Camera Ready" | string;
//     getStatusIcon?: (status?: string) => React.ReactNode;
//     getStatusColor?: (status?: string) => string;
// }

// const ReviewerPaperCard: React.FC<ReviewerPaperCardProps> = ({
//     paperInfo,
//     paperType,
//     getStatusIcon,
//     getStatusColor
// }) => {
//     const defaultGetStatusColor = (status?: string) => {
//         if (!status) return "bg-gray-100 text-gray-600";
//         const statusLower = status.toLowerCase();
//         if (statusLower.includes("accepted")) return "bg-emerald-100 text-emerald-700";
//         if (statusLower.includes("rejected")) return "bg-rose-100 text-rose-700";
//         if (statusLower.includes("pending")) return "bg-amber-100 text-amber-700";
//         if (statusLower.includes("revise")) return "bg-blue-100 text-blue-700";
//         return "bg-gray-100 text-gray-600";
//     };

//     const statusColorClass = getStatusColor
//         ? getStatusColor(paperInfo.reviewStatusName || paperInfo.globalStatusName)
//         : defaultGetStatusColor(paperInfo.reviewStatusName || paperInfo.globalStatusName);

//     const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
//         <div className="flex gap-3">
//             <span className="text-xs font-medium text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
//             <div className="flex-1 text-sm text-gray-900">{children}</div>
//         </div>
//     );

//     const now = new Date();
//     const reviewStart = paperInfo.reviewStartDate ? new Date(paperInfo.reviewStartDate) : null;
//     const reviewEnd = paperInfo.reviewEndDate ? new Date(paperInfo.reviewEndDate) : null;

//     const canMakeDecision =
//         !!paperInfo.isAllSubmittedReview &&
//         reviewStart !== null &&
//         reviewEnd !== null &&
//         now >= reviewStart &&
//         now <= reviewEnd;

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//             {/* Header */}
//             <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
//                 <div className="flex items-center gap-2">
//                     <div className="p-1.5 bg-blue-100 rounded-lg">
//                         <FileText className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <h4 className="font-semibold text-gray-900 text-sm">{paperType}</h4>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="p-5 space-y-4">
//                 {/* Title & Description */}
//                 <div className="space-y-3">
//                     {paperInfo.title && (
//                         <InfoRow label="Tiêu đề">
//                             <span className="font-medium leading-relaxed">{paperInfo.title}</span>
//                         </InfoRow>
//                     )}

//                     {paperInfo.description && (
//                         <InfoRow label="Mô tả">
//                             <span className="leading-relaxed">{paperInfo.description}</span>
//                         </InfoRow>
//                     )}
//                 </div>

//                 {/* Status Grid */}
//                 <div className="grid grid-cols-1 gap-3 pt-3 border-t border-gray-100">
//                     {(paperInfo.reviewStatusName || paperInfo.globalStatusName) && (
//                         <InfoRow label="Trạng thái">
//                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${statusColorClass}`}>
//                                 {getStatusIcon && getStatusIcon(paperInfo.reviewStatusName || paperInfo.globalStatusName)}
//                                 {paperInfo.reviewStatusName || paperInfo.globalStatusName}
//                             </span>
//                         </InfoRow>
//                     )}

//                     {paperInfo.reviewStartDate && paperInfo.reviewEndDate && (
//                         <InfoRow label="Thời gian">
//                             <span className="inline-flex items-center gap-2 text-sm">
//                                 <Calendar className="w-3.5 h-3.5 text-gray-400" />
//                                 {new Date(paperInfo.reviewStartDate).toLocaleDateString('vi-VN')}
//                                 <span className="text-gray-400">→</span>
//                                 {new Date(paperInfo.reviewEndDate).toLocaleDateString('vi-VN')}
//                             </span>
//                         </InfoRow>
//                     )}

//                     {typeof paperInfo.isAllSubmittedReview !== 'undefined' && (
//                         <InfoRow label="Tiến độ">
//                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${paperInfo.isAllSubmittedReview
//                                 ? "bg-emerald-100 text-emerald-700"
//                                 : "bg-amber-100 text-amber-700"
//                                 }`}>
//                                 {paperInfo.isAllSubmittedReview ? (
//                                     <>
//                                         <CheckCircle className="w-3.5 h-3.5" />
//                                         Hoàn thành
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Clock className="w-3.5 h-3.5" />
//                                         Đang chờ
//                                     </>
//                                 )}
//                             </span>
//                         </InfoRow>
//                     )}
//                 </div>

//                 {/* Timestamps */}
//                 {(paperInfo.createdAt || paperInfo.updatedAt) && (
//                     <div className="flex gap-6 pt-3 border-t border-gray-100 text-xs">
//                         {paperInfo.createdAt && (
//                             <div className="flex items-center gap-1.5 text-gray-500">
//                                 <Calendar className="w-3.5 h-3.5" />
//                                 <span>{new Date(paperInfo.createdAt).toLocaleDateString('vi-VN')}</span>
//                             </div>
//                         )}
//                         {paperInfo.updatedAt && (
//                             <div className="flex items-center gap-1.5 text-gray-500">
//                                 <Clock className="w-3.5 h-3.5" />
//                                 <span>{new Date(paperInfo.updatedAt).toLocaleDateString('vi-VN')}</span>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* File Viewer */}
//                 {paperInfo.fileUrl && (
//                     <div className="pt-4 border-t border-gray-100">
//                         <div className="flex items-center gap-2 mb-3">
//                             <Eye className="w-4 h-4 text-gray-400" />
//                             <span className="text-xs font-medium text-gray-600">Xem trước tài liệu</span>
//                         </div>
//                         <div className="max-h-[70vh] rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
//                             <ReusableDocViewer
//                                 fileUrl={paperInfo.fileUrl}
//                                 minHeight={400}
//                                 checkUrlBeforeRender={true}
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

export default ReviewerPaperCard;
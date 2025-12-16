import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";
import { CurrentResearchConferencePhaseForReviewer, RevisionRoundDeadlineForReviewer, RevisionRoundDetail } from "@/types/paper.type";
import { FileText, Calendar, CheckCircle, Clock, Users, Eye, ArrowRight } from "lucide-react";

interface ReviewerPaperInfo {
    id: string;
    title?: string;
    description?: string;
    reason: string | null;
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

        // if (paperTypeLower.includes("camera ready")) {
        //     return {
        //         sections: [
        //             {
        //                 label: "Quyết định trạng thái bản Camera Ready",
        //                 startDate: phaseInfo.cameraReadyDecideStatusStart,
        //                 endDate: phaseInfo.cameraReadyDecideStatusEnd,
        //             },
        //         ],
        //     };
        // }

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
                    <h4 className="font-bold text-gray-900 text-sm tracking-wide">{paperType}</h4>
                </div>
            </div>

            {/* Two Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
                {/* Left Column - Information */}
                <div className="space-y-4">
                    {/* ID Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-sm text-blue-700 font-mono font-semibold">
                            ID: {paperInfo.id}
                        </span>
                    </div>

                    {/* Title & Description */}
                    {(paperInfo.title || paperInfo.description) && (
                        <div className="space-y-3">
                            {paperInfo.title && (
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <FileText className="w-3 h-3 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Tiêu đề</p>
                                    </div>
                                    <p className="text-base text-gray-900 font-semibold leading-relaxed">
                                        {paperInfo.title}
                                    </p>
                                </div>
                            )}

                            {paperInfo.description && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Mô tả</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {paperInfo.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status & Progress */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        {(paperInfo.reviewStatusName || paperInfo.globalStatusName) && (
                            <div>
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Trạng thái</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${statusColorClass}`}>
                                    {getStatusIcon && getStatusIcon(paperInfo.reviewStatusName || paperInfo.globalStatusName)}
                                    {paperInfo.reviewStatusName || paperInfo.globalStatusName}
                                </span>
                            </div>
                        )}

                        {paperInfo.reason && (
                            <div>
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Phản hồi từ reviewer</p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    {paperInfo.reason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Timeline Section */}
                    {timelineInfo && timelineInfo.sections.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Clock className="w-3.5 h-3.5 text-gray-600" />
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Thời gian các giai đoạn</p>
                            </div>
                            <div className="space-y-3">
                                {timelineInfo.sections.map((section, index) => {
                                    const startDate = formatDate(section.startDate);
                                    const endDate = formatDate(section.endDate);

                                    if (!startDate || !endDate) return null;

                                    return (
                                        <div key={index} className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-3 border border-blue-200">
                                            <p className="text-xs font-bold text-gray-800 mb-2">
                                                {section.label}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{startDate}</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
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
                        <div className="flex gap-6 pt-4 border-t border-gray-100">
                            {paperInfo.createdAt && (
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Calendar className="w-3 h-3 text-gray-500" />
                                        <p className="text-xs text-gray-600 font-semibold">Ngày tạo</p>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">
                                        {formatDate(paperInfo.createdAt)}
                                    </p>
                                </div>
                            )}
                            {paperInfo.updatedAt && (
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <p className="text-xs text-gray-600 font-semibold">Cập nhật</p>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">
                                        {formatDate(paperInfo.updatedAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - File Viewer */}
                {paperInfo.fileUrl && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-gray-700 font-semibold uppercase tracking-wide">Xem trước tài liệu</p>
                        </div>
                        <div className="max-h-[600px] border-2 border-gray-300 rounded-lg bg-gray-50 shadow-inner">
                            <ReusableDocViewer
                                fileUrl={paperInfo.fileUrl}
                                minHeight={600}
                                checkUrlBeforeRender={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // return (
    //     <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    //         {/* Header */}
    //         <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
    //             <div className="flex items-center gap-2">
    //                 <div className="p-1.5 bg-blue-100 rounded-lg">
    //                     <FileText className="w-4 h-4 text-blue-600" />
    //                 </div>
    //                 <h4 className="font-semibold text-gray-900 text-sm">{paperType}</h4>
    //             </div>
    //         </div>

    //         {/* Two Column Content */}
    //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
    //             {/* Left Column - Information */}
    //             <div className="space-y-4">
    //                 {/* ID Badge */}
    //                 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
    //                     <FileText className="w-3.5 h-3.5 text-blue-600" />
    //                     <span className="text-sm text-blue-700 font-mono">
    //                         ID: {paperInfo.id}
    //                     </span>
    //                 </div>

    //                 {/* Title & Description */}
    //                 {(paperInfo.title || paperInfo.description) && (
    //                     <div className="space-y-3">
    //                         {paperInfo.title && (
    //                             <div>
    //                                 <p className="text-xs text-gray-500 mb-1 font-medium">Tiêu đề</p>
    //                                 <p className="text-sm text-gray-900 font-medium leading-relaxed">
    //                                     {paperInfo.title}
    //                                 </p>
    //                             </div>
    //                         )}

    //                         {paperInfo.description && (
    //                             <div>
    //                                 <p className="text-xs text-gray-500 mb-1 font-medium">Mô tả</p>
    //                                 <p className="text-sm text-gray-700 leading-relaxed">
    //                                     {paperInfo.description}
    //                                 </p>
    //                             </div>
    //                         )}
    //                     </div>
    //                 )}

    //                 {/* Status & Progress */}
    //                 <div className="space-y-3 pt-3 border-t border-gray-100">
    //                     {(paperInfo.reviewStatusName || paperInfo.globalStatusName) && (
    //                         <div>
    //                             <p className="text-xs text-gray-500 mb-1 font-medium">Trạng thái</p>
    //                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${statusColorClass}`}>
    //                                 {getStatusIcon && getStatusIcon(paperInfo.reviewStatusName || paperInfo.globalStatusName)}
    //                                 {paperInfo.reviewStatusName || paperInfo.globalStatusName}
    //                             </span>
    //                         </div>
    //                     )}

    //                     {paperInfo.reason && (
    //                         <div className="mt-2">
    //                             <p className="text-xs text-gray-500 mb-1 font-medium">Phản hồi từ reviewer</p>
    //                             <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
    //                                 {paperInfo.reason}
    //                             </p>
    //                         </div>
    //                     )}
    //                 </div>

    //                 {/* Timeline Section */}
    //                 {timelineInfo && timelineInfo.sections.length > 0 && (
    //                     <div className="pt-3 border-t border-gray-100">
    //                         <p className="text-xs text-gray-500 mb-3 font-medium">Thời gian các giai đoạn</p>
    //                         <div className="space-y-3">
    //                             {timelineInfo.sections.map((section, index) => {
    //                                 const startDate = formatDate(section.startDate);
    //                                 const endDate = formatDate(section.endDate);

    //                                 if (!startDate || !endDate) return null;

    //                                 return (
    //                                     <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
    //                                         <p className="text-xs font-semibold text-gray-700 mb-2">
    //                                             {section.label}
    //                                         </p>
    //                                         <div className="flex items-center gap-2 text-sm text-gray-600">
    //                                             <Calendar className="w-3.5 h-3.5 text-gray-400" />
    //                                             <span>{startDate}</span>
    //                                             <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
    //                                             <span>{endDate}</span>
    //                                         </div>
    //                                     </div>
    //                                 );
    //                             })}
    //                         </div>
    //                     </div>
    //                 )}

    //                 {/* Timestamps */}
    //                 {(paperInfo.createdAt || paperInfo.updatedAt) && (
    //                     <div className="flex gap-4 pt-3 border-t border-gray-100">
    //                         {paperInfo.createdAt && (
    //                             <div>
    //                                 <div className="flex items-center gap-1 mb-1">
    //                                     <Calendar className="w-3 h-3 text-gray-400" />
    //                                     <p className="text-xs text-gray-500">Ngày tạo</p>
    //                                 </div>
    //                                 <p className="text-sm text-gray-700">
    //                                     {formatDate(paperInfo.createdAt)}
    //                                 </p>
    //                             </div>
    //                         )}
    //                         {paperInfo.updatedAt && (
    //                             <div>
    //                                 <div className="flex items-center gap-1 mb-1">
    //                                     <Clock className="w-3 h-3 text-gray-400" />
    //                                     <p className="text-xs text-gray-500">Cập nhật</p>
    //                                 </div>
    //                                 <p className="text-sm text-gray-700">
    //                                     {formatDate(paperInfo.updatedAt)}
    //                                 </p>
    //                             </div>
    //                         )}
    //                     </div>
    //                 )}
    //             </div>

    //             {/* Right Column - File Viewer */}
    //             {paperInfo.fileUrl && (
    //                 <div className="space-y-2">
    //                     <div className="flex items-center gap-2">
    //                         <Eye className="w-4 h-4 text-gray-400" />
    //                         <p className="text-xs text-gray-500 font-medium">Xem trước tài liệu</p>
    //                     </div>
    //                     <div className="max-h-[600px] border border-gray-200 rounded-lg bg-gray-50">
    //                         <ReusableDocViewer
    //                             fileUrl={paperInfo.fileUrl}
    //                             minHeight={600}
    //                             checkUrlBeforeRender={true}
    //                         />
    //                     </div>
    //                 </div>
    //             )}
    //         </div>
    //     </div>
    // );
};

export default ReviewerPaperCard;
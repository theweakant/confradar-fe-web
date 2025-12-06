import { FileText, Calendar, CheckCircle, Clock } from "lucide-react";
import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";

interface SubmittedPaperInfo {
    id: string;
    title?: string;
    description?: string;
    status?: string | null;
    reviewStatus?: string | null;
    overallStatus?: string | null;
    submissionCount?: number | null;
    created?: string;
    updated?: string;
    fileUrl?: string | null;
}

interface SubmittedPaperCardProps {
    paperInfo: SubmittedPaperInfo;
    paperType: "Abstract" | "Full Paper" | "Revision Paper" | "Camera Ready" | string;
}

const SubmittedPaperCard: React.FC<SubmittedPaperCardProps> = ({
    paperInfo,
    paperType
}) => {
    const getStatusColor = (status?: string) => {
        if (!status) return "text-gray-500";
        const statusLower = status.toLowerCase();
        if (statusLower.includes("accepted")) return "text-green-600";
        if (statusLower.includes("rejected")) return "text-red-600";
        return "text-yellow-600";
    };

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-xl">
            {/* Header */}
            <div className="bg-green-100 px-5 py-3 border-b border-green-300">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-700">
                        {paperType} đã nộp
                    </h4>
                </div>
            </div>

            {/* Two Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
                {/* Left Column - Information */}
                <div className="space-y-4">
                    {/* ID Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-lg border border-green-300">
                        <FileText className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-sm text-green-700 font-mono">
                            ID: {paperInfo.id}
                        </span>
                    </div>

                    {/* Title & Description */}
                    {(paperInfo.title || paperInfo.description) && (
                        <div className="space-y-3">
                            {paperInfo.title && (
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Tiêu đề</p>
                                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                                        {paperInfo.title}
                                    </p>
                                </div>
                            )}

                            {paperInfo.description && (
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Mô tả</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {paperInfo.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta Information Grid */}
                    <div className="grid grid-cols-1 gap-3 pt-3 border-t border-green-200">
                        {(paperInfo.status || paperInfo.reviewStatus || paperInfo.overallStatus) && (
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
                                <p className={`text-sm font-medium ${getStatusColor(
                                    paperInfo.status ?? paperInfo.reviewStatus ?? paperInfo.overallStatus ?? undefined
                                )}`}>
                                    {paperInfo.status || paperInfo.reviewStatus || paperInfo.overallStatus || "Chưa rõ"}
                                </p>
                            </div>
                        )}

                        {paperInfo.created && (
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <Calendar className="w-3 h-3 text-gray-600" />
                                    <p className="text-xs text-gray-600">Ngày tạo</p>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {new Date(paperInfo.created).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}

                        {paperInfo.updated && (
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <Clock className="w-3 h-3 text-gray-600" />
                                    <p className="text-xs text-gray-600">Ngày cập nhật</p>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {new Date(paperInfo.updated).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - File Viewer */}
                {paperInfo.fileUrl && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-600">Xem trước tài liệu</p>
                        <div className="max-h-[600px] border border-green-300 rounded-lg bg-white">
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
};

export default SubmittedPaperCard;

// import { FileText, Calendar, CheckCircle, Clock } from "lucide-react";
// import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";

// interface SubmittedPaperInfo {
//     id: string;
//     title?: string;
//     description?: string;
//     status?: string | null;
//     reviewStatus?: string | null;
//     overallStatus?: string | null;
//     submissionCount?: number | null;
//     created?: string;
//     updated?: string;
//     fileUrl?: string | null;
// }

// interface SubmittedPaperCardProps {
//     paperInfo: SubmittedPaperInfo;
//     paperType: "Abstract" | "Full Paper" | "Revision Paper" | "Camera Ready" | string;
// }

// const SubmittedPaperCard: React.FC<SubmittedPaperCardProps> = ({
//     paperInfo,
//     paperType
// }) => {
//     const getStatusColor = (status?: string) => {
//         if (!status) return "text-gray-400";
//         const statusLower = status.toLowerCase();
//         if (statusLower.includes("accepted")) return "text-green-400";
//         if (statusLower.includes("rejected")) return "text-red-400";
//         return "text-yellow-400";
//     };

//     return (
//         <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl">
//             {/* Header */}
//             <div className="bg-green-800/30 px-5 py-3 border-b border-green-700/50">
//                 <div className="flex items-center gap-2">
//                     <CheckCircle className="w-5 h-5 text-green-400" />
//                     <h4 className="font-semibold text-green-400">
//                         {paperType} đã nộp
//                     </h4>
//                 </div>
//             </div>

//             {/* Two Column Content */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
//                 {/* Left Column - Information */}
//                 <div className="space-y-4">
//                     {/* ID Badge */}
//                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
//                         <FileText className="w-3.5 h-3.5 text-green-400" />
//                         <span className="text-sm text-green-300 font-mono">
//                             ID: {paperInfo.id}
//                         </span>
//                     </div>

//                     {/* Title & Description */}
//                     {(paperInfo.title || paperInfo.description) && (
//                         <div className="space-y-3">
//                             {paperInfo.title && (
//                                 <div>
//                                     <p className="text-xs text-gray-400 mb-1">Tiêu đề</p>
//                                     <p className="text-sm text-white font-medium leading-relaxed">
//                                         {paperInfo.title}
//                                     </p>
//                                 </div>
//                             )}

//                             {paperInfo.description && (
//                                 <div>
//                                     <p className="text-xs text-gray-400 mb-1">Mô tả</p>
//                                     <p className="text-sm text-gray-300 leading-relaxed">
//                                         {paperInfo.description}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Meta Information Grid */}
//                     <div className="grid grid-cols-1 gap-3 pt-3 border-t border-green-700/30">
//                         {(paperInfo.status || paperInfo.reviewStatus || paperInfo.overallStatus) && (
//                             <div>
//                                 <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
//                                 <p className={`text-sm font-medium ${getStatusColor(
//                                     paperInfo.status ?? paperInfo.reviewStatus ?? paperInfo.overallStatus ?? undefined
//                                 )}`}>
//                                     {paperInfo.status || paperInfo.reviewStatus || paperInfo.overallStatus || "Chưa rõ"}
//                                 </p>
//                             </div>
//                         )}

//                         {paperInfo.created && (
//                             <div>
//                                 <div className="flex items-center gap-1 mb-1">
//                                     <Calendar className="w-3 h-3 text-gray-400" />
//                                     <p className="text-xs text-gray-400">Ngày tạo</p>
//                                 </div>
//                                 <p className="text-sm text-gray-300">
//                                     {new Date(paperInfo.created).toLocaleDateString('vi-VN', {
//                                         day: '2-digit',
//                                         month: '2-digit',
//                                         year: 'numeric'
//                                     })}
//                                 </p>
//                             </div>
//                         )}

//                         {paperInfo.updated && (
//                             <div>
//                                 <div className="flex items-center gap-1 mb-1">
//                                     <Clock className="w-3 h-3 text-gray-400" />
//                                     <p className="text-xs text-gray-400">Ngày cập nhật</p>
//                                 </div>
//                                 <p className="text-sm text-gray-300">
//                                     {new Date(paperInfo.updated).toLocaleDateString('vi-VN', {
//                                         day: '2-digit',
//                                         month: '2-digit',
//                                         year: 'numeric'
//                                     })}
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Right Column - File Viewer */}
//                 {paperInfo.fileUrl && (
//                     <div className="space-y-2">
//                         <p className="text-xs text-gray-400">Xem trước tài liệu</p>
//                         <div className="max-h-[600px] border border-green-700/50 rounded-lg bg-gray-900/50">
//                             <ReusableDocViewer
//                                 fileUrl={paperInfo.fileUrl}
//                                 minHeight={600}
//                                 checkUrlBeforeRender={true}
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SubmittedPaperCard;
import React from "react";
import { Download, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { ResearchConferenceDetailResponse } from "@/types/conference.type";

interface ResearchDocumentsTabProps {
    conference: ResearchConferenceDetailResponse;
}

const ResearchDocumentsTab: React.FC<ResearchDocumentsTabProps> = ({
    conference
}) => {
    const hasContent =
        (conference?.rankingFileUrls && conference.rankingFileUrls.length > 0) ||
        (conference?.materialDownloads && conference.materialDownloads.length > 0) ||
        (conference?.rankingReferenceUrls && conference.rankingReferenceUrls.length > 0);

    if (!hasContent) {
        return (
            <div className="text-center text-white/70 py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chưa có tài liệu nào được tải lên</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Tài liệu & Hướng dẫn</h2>

            {/* Author Note – dành cho tác giả muốn nộp bài, tách biệt với tài liệu xếp hạng hội nghị phía dưới */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-6 mb-8">
                <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            📝 Hướng dẫn dành cho tác giả (Paper Submission)
                        </h3>

                        <p className="text-white/80 text-sm leading-relaxed">
                            Nếu bạn muốn tham dự hội nghị với vai trò <strong>tác giả</strong> và gửi bài báo khoa học,
                            vui lòng tham khảo các tài liệu bên dưới. Đây là <strong>tài liệu hướng dẫn nộp paper</strong>,
                            {/* <u>không phải tài liệu chứng minh xếp hạng hội nghị</u>. */}
                        </p>

                        <ul className="text-white/70 text-sm mt-3 space-y-1 list-disc list-inside">
                            <li>Hướng dẫn format bài báo (format guideline)</li>
                            <li>Quy trình nộp và review paper</li>
                            <li>Tiêu chí đánh giá và chấm điểm</li>
                            <li>Template mẫu</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Material Downloads Section */}
            {conference.materialDownloads && conference.materialDownloads.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5 text-green-400" />
                        Tài liệu hướng dẫn nộp bài báo
                    </h3>
                    <p className="text-white/70 text-sm mb-4">
                        Tải xuống các tài liệu sau để biết cách thức nộp bài báo, định dạng yêu cầu và quy trình đánh giá:
                    </p>
                    <div className="space-y-4">
                        {conference.materialDownloads.map((material) => (
                            <div key={material.materialDownloadId} className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-xl p-5 hover:from-white/25 hover:to-white/15 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-lg">
                                        <Download className="w-7 h-7 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-semibold text-lg mb-1">
                                            {material.fileName || 'Tài liệu hướng dẫn'}
                                        </h4>
                                        {material.fileDescription && (
                                            <p className="text-white/70 text-sm mb-3 leading-relaxed">
                                                {material.fileDescription}
                                            </p>
                                        )}
                                        {material.fileUrl && (
                                            <a
                                                href={material.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                                Tải xuống tài liệu
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ranking Documents Section – các tài liệu minh chứng cho xếp hạng (CORE, IF, H5...), không phải review/đánh giá của người dùng */}
            {conference.rankingFileUrls && conference.rankingFileUrls.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Tài liệu minh chứng xếp hạng hội nghị
                    </h3>
                    <p className="text-white/70 text-sm mb-4">
                        Đây là các tài liệu chính thức nhằm chứng minh hội nghị đạt các chỉ số như
                        <strong> CORE rank, Impact Factor (IF), H-index, Scopus… </strong>
                        {/* (không phải đánh giá từ người dùng hoặc bên thứ ba). */}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {conference.rankingFileUrls.map((file, index) => (
                            <div
                                key={file.rankingFileUrlId}
                                className="bg-white/20 backdrop-blur-md rounded-lg p-5 hover:bg-white/25 transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium mb-2">
                                            Tài liệu minh chứng {index + 1}
                                        </p>
                                        {file.fileUrl && (
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Xem tài liệu
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ranking Verification Links – các đường dẫn xác thực hội nghị thuộc các bảng xếp hạng uy tín */}
            {conference.rankingReferenceUrls && conference.rankingReferenceUrls.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-purple-400" />
                        Liên kết xác thực xếp hạng hội nghị
                    </h3>

                    <p className="text-white/70 text-sm mb-4">
                        Đây là các đường dẫn chính thức dùng để xác minh hội nghị thuộc các bảng xếp hạng uy tín như
                        <strong> CORE, Scopus, SJR, Q-index, Impact Factor,... </strong>.
                        Các link này có chức năng <strong>chứng minh tính học thuật & mức độ uy tín</strong> của hội nghị.
                    </p>

                    <div className="space-y-3">
                        {conference.rankingReferenceUrls.map((reference, index) => (
                            <div
                                key={reference.referenceUrlId}
                                className="bg-white/20 backdrop-blur-md rounded-lg p-4 hover:bg-white/25 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <ExternalLink className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/80 font-medium text-sm mb-1">
                                            Link xác thực {index + 1}
                                        </p>
                                        {reference.referenceUrl && (
                                            <a
                                                href={reference.referenceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300 text-sm break-all transition-colors"
                                            >
                                                {reference.referenceUrl}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ResearchDocumentsTab;
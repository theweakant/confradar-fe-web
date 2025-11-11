import { FileText, Download } from "lucide-react";
import { formatDate } from "@/helper/format";
import { PaperDetailForReviewer } from "@/types/paper.type";

interface CameraReadyPhaseProps {
    paperDetail: PaperDetailForReviewer;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
}

export default function CameraReadyPhase({
    paperDetail,
    getStatusIcon,
    getStatusColor,
}: CameraReadyPhaseProps) {
    if (!paperDetail.cameraReady) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Chưa có thông tin Camera Ready</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Camera Ready
                </h3>

                <div className="space-y-3 mb-6">
                    <div>
                        <span className="text-sm text-gray-600">Tiêu đề:</span>
                        <p className="font-medium text-gray-900 mt-1">
                            {paperDetail.cameraReady.title}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm text-gray-600">Mô tả:</span>
                        <p className="text-gray-700 mt-1">
                            {paperDetail.cameraReady.description}
                        </p>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paperDetail.cameraReady.globalStatusName)}`}
                        >
                            {getStatusIcon(paperDetail.cameraReady.globalStatusName)}
                            {paperDetail.cameraReady.globalStatusName}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-600">Ngày tạo:</span>
                            <p className="text-gray-900 font-medium mt-1">
                                {formatDate(paperDetail.cameraReady.createdAt)}
                            </p>
                        </div>
                        {paperDetail.cameraReady.reviewAt && (
                            <div>
                                <span className="text-sm text-gray-600">Ngày đánh giá:</span>
                                <p className="text-gray-900 font-medium mt-1">
                                    {formatDate(paperDetail.cameraReady.reviewAt)}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t">
                        <a
                            href={paperDetail.cameraReady.cameraReadyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Tải xuống Camera Ready
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
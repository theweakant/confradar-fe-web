import { FileText, Download, Gavel } from "lucide-react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { isValidUrl } from "@/helper/paper";
import { formatDate } from "@/helper/format";
import { CurrentResearchConferencePhaseForReviewer, PaperDetailForReviewer } from "@/types/paper.type";
import { useDecideCameraReadyMutation } from "@/redux/services/paper.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { isWithinDateRange } from "@/helper/paper";
import ReviewerPaperCard from "./ReviewerPaperCard";

interface CameraReadyPhaseProps {
    paperDetail: PaperDetailForReviewer;
    currentPhase: CurrentResearchConferencePhaseForReviewer | null | undefined;
    getStatusIcon: (status?: string) => React.ReactNode;
    getStatusColor: (status?: string) => string;
    paperId: string;
}

export default function CameraReadyPhase({
    paperDetail,
    currentPhase,
    getStatusIcon,
    getStatusColor,
    paperId,
}: CameraReadyPhaseProps) {
    const [docAvailable, setDocAvailable] = useState<boolean | null>(null);
    const [docViewerError, setDocViewerError] = useState<boolean>(false);

    const [showCameraReadyDecisionPopup, setShowCameraReadyDecisionPopup] =
        useState(false);
    const [cameraReadyDecisionStatus, setCameraReadyDecisionStatus] =
        useState("Accepted");

    const [decideCameraReadyStatus, { isLoading: isDecidingCameraReady }] =
        useDecideCameraReadyMutation();

    useEffect(() => {
        const url = paperDetail.cameraReady?.cameraReadyUrl;

        if (!url) {
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
    }, [paperDetail.cameraReady?.cameraReadyUrl]);

    const canDecideCameraReadyStatus = (): boolean => {
        if (
            !currentPhase ||
            !currentPhase.cameraReadyDecideStatusStart ||
            !currentPhase.cameraReadyDecideStatusEnd
        ) {
            return false;
        }
        return isWithinDateRange(currentPhase.cameraReadyDecideStatusStart, currentPhase.cameraReadyDecideStatusEnd);
    };

    const handleDecideCameraReadyStatus = async () => {
        if (!paperDetail?.cameraReady) return;
        if (!canDecideCameraReadyStatus()) {
            toast.error(
                `Chỉ có thể quyết định Camera Ready trong khoảng ${formatDate(currentPhase!.cameraReadyDecideStatusStart)} - ${formatDate(currentPhase!.cameraReadyDecideStatusEnd)}`,
            );
            return;
        }
        try {
            const response = await decideCameraReadyStatus({
                cameraReadyId: paperDetail.cameraReady.cameraReadyId,
                globalStatus: cameraReadyDecisionStatus,
                paperid: paperId,
            }).unwrap();
            toast.success("Cập nhật trạng thái camera ready thành công");
            setShowCameraReadyDecisionPopup(false);
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err?.message || "Có lỗi xảy ra");
        }
    };


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
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Camera Ready
                    </h3>

                    {paperDetail.isHeadReviewer && (
                        <Button
                            onClick={() => setShowCameraReadyDecisionPopup(true)}
                            className="bg-green-600 hover:bg-green-700"
                            size="lg"
                            disabled={!canDecideCameraReadyStatus()}
                        >
                            <Gavel className="w-4 h-4 mr-2" />
                            {canDecideCameraReadyStatus()
                                ? "Quyết định cuối cùng"
                                : "Chưa đến lúc quyết định"}
                        </Button>
                    )}
                </div>

                <ReviewerPaperCard
                    paperInfo={{
                        id: paperDetail.cameraReady.cameraReadyId,
                        title: paperDetail.cameraReady.title,
                        description: paperDetail.cameraReady.description,
                        globalStatusName: paperDetail.cameraReady.globalStatusName,
                        reviewStartDate: currentPhase?.cameraReadyStartDate,
                        reviewEndDate: currentPhase?.cameraReadyEndDate,
                        createdAt: paperDetail.cameraReady.createdAt,
                        updatedAt: paperDetail.cameraReady.reviewAt ?? undefined,
                        fileUrl: paperDetail.cameraReady.cameraReadyUrl
                    }}
                    paperType="Camera Ready"
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                />

                {/* <div className="space-y-3 mb-6">
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
                                documents={[{ uri: paperDetail.cameraReady.cameraReadyUrl, fileType: "pdf" }]}
                                pluginRenderers={DocViewerRenderers}
                                config={{
                                    header: { disableHeader: true },
                                    pdfVerticalScrollByDefault: true,
                                }}
                                style={{ width: "100%", minHeight: 400, borderRadius: 8 }}
                            />
                        )}
                    </div>
                </div> */}
            </div>

            {showCameraReadyDecisionPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-green-600" />
                            Quyết định cuối cùng - Camera Ready
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn trạng thái
                                </label>
                                <select
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                                    value={cameraReadyDecisionStatus}
                                    onChange={(e) => setCameraReadyDecisionStatus(e.target.value)}
                                >
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCameraReadyDecisionPopup(false)}
                                    className="flex-1"
                                    disabled={isDecidingCameraReady}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleDecideCameraReadyStatus}
                                    disabled={isDecidingCameraReady}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isDecidingCameraReady ? "Đang xử lý..." : "Xác nhận"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
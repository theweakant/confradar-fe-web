import React, { useState } from "react";
import { CameraReady } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/paper/usePaper";

interface CameraReadyPhaseProps {
    paperId?: string;
    cameraReady?: CameraReady | null;
}

const CameraReadyPhase: React.FC<CameraReadyPhaseProps> = ({ paperId, cameraReady }) => {
    const isSubmitted = !!cameraReady;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        handleSubmitCameraReady,
        submitCameraReadyError,
        loading: submitLoading
    } = usePaperCustomer();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmitCameraReadyForm = async () => {
        if (!selectedFile || !paperId) {
            alert("Vui lòng chọn file camera-ready và đảm bảo có Paper ID");
            return;
        }

        try {
            await handleSubmitCameraReady({
                cameraReadyFile: selectedFile,
                paperId
            });

            alert("Nộp camera-ready thành công!");
            setSelectedFile(null);
        } catch (error: any) {
            let errorMessage = "Có lỗi xảy ra khi nộp camera-ready";

            if (error?.data?.Message) {
                errorMessage = error.data.Message;
            } else if (error?.data?.Errors) {
                const errors = Object.values(error.data.Errors);
                errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
            }

            alert(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Giai đoạn Camera Ready</h3>
            <p className="text-gray-400">Nộp bản camera-ready cuối cùng cho bài báo của bạn.</p>

            {/* Show current camera-ready if exists */}
            {cameraReady && (
                <div className="bg-green-900/20 border border-green-700 rounded-xl p-5">
                    <h4 className="font-semibold text-green-400 mb-2">Camera-ready đã nộp</h4>
                    <p className="text-green-300 text-sm">
                        Camera-ready ID: {cameraReady.cameraReadyId}
                    </p>
                    {cameraReady.fileUrl && (
                        <a
                            href={cameraReady.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
                        >
                            Xem file camera-ready →
                        </a>
                    )}
                </div>
            )}

            {isSubmitted && (
                <p className="text-sm text-yellow-400 mt-2">
                    Bạn đã nộp camera-ready, không thể nộp lại.
                </p>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <label className="block text-sm font-medium mb-2">Tải lên tệp camera-ready (.pdf)</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isSubmitted}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
                        file:rounded-lg file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white hover:file:bg-blue-700
                        disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {selectedFile && (
                    <p className="text-green-400 text-sm mt-2">
                        Đã chọn: {selectedFile.name}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmitCameraReadyForm}
                    disabled={isSubmitted || !selectedFile || !paperId || submitLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
                >
                    {isSubmitted ? "Đã nộp Camera-ready" : submitLoading ? "Đang nộp..." : "Nộp Camera-ready"}
                </button>
            </div>

            {/* Error Messages */}
            {submitCameraReadyError && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                    <p className="text-red-400 text-sm">
                        Lỗi: {typeof submitCameraReadyError === 'string' ? submitCameraReadyError : 'Có lỗi xảy ra khi nộp camera-ready'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CameraReadyPhase;
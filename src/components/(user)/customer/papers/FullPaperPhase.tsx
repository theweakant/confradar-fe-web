import React, { useState } from "react";
import { FullPaper } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/paper/usePaper";

interface FullPaperPhaseProps {
    paperId?: string;
    fullPaper?: FullPaper | null;
}

const FullPaperPhase: React.FC<FullPaperPhaseProps> = ({ paperId, fullPaper }) => {
    const isSubmitted = !!fullPaper;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        handleSubmitFullPaper,
        submitFullPaperError,
        loading: submitLoading
    } = usePaperCustomer();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmitFullPaperForm = async () => {
        if (!selectedFile || !paperId) {
            alert("Vui lòng chọn file full paper và đảm bảo có Paper ID");
            return;
        }

        try {
            await handleSubmitFullPaper({
                fullPaperFile: selectedFile,
                paperId
            });

            alert("Nộp full paper thành công!");
            setSelectedFile(null);
        } catch (error: any) {
            let errorMessage = "Có lỗi xảy ra khi nộp full paper";

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
            <h3 className="text-lg font-semibold">Giai đoạn Full Paper</h3>
            <p className="text-gray-400">Nộp bản full paper hoàn chỉnh cho bài báo của bạn.</p>

            {/* Show current full paper if exists */}
            {fullPaper && (
                <div className="bg-green-900/20 border border-green-700 rounded-xl p-5">
                    <h4 className="font-semibold text-green-400 mb-2">Full Paper đã nộp</h4>
                    <p className="text-green-300 text-sm">
                        Full Paper ID: {fullPaper.fullPaperId}
                    </p>
                    {fullPaper.fileUrl && (
                        <a
                            href={fullPaper.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
                        >
                            Xem file full paper →
                        </a>
                    )}
                </div>
            )}

            {isSubmitted && (
                <p className="text-sm text-yellow-400 mt-2">
                    Bạn đã nộp full paper, không thể nộp lại.
                </p>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <label className="block text-sm font-medium mb-2">Tải lên tệp full paper (.pdf)</label>
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
                    onClick={handleSubmitFullPaperForm}
                    disabled={isSubmitted || !selectedFile || !paperId || submitLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
                >
                    {isSubmitted ? "Đã nộp Full Paper" : submitLoading ? "Đang nộp..." : "Nộp Full Paper"}
                </button>
            </div>

            {/* Error Messages */}
            {submitFullPaperError && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                    <p className="text-red-400 text-sm">
                        Lỗi: {typeof submitFullPaperError === 'string' ? submitFullPaperError : 'Có lỗi xảy ra khi nộp full paper'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FullPaperPhase;
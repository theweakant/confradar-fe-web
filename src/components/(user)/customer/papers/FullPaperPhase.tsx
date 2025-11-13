import React, { useState } from "react";
import { FullPaper, ResearchPhaseDtoDetail } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { validatePhaseTime } from "@/helper/timeValidation";

interface FullPaperPhaseProps {
  paperId?: string;
  fullPaper?: FullPaper | null;
  researchPhase?: ResearchPhaseDtoDetail;
}

const FullPaperPhase: React.FC<FullPaperPhaseProps> = ({ paperId, fullPaper, researchPhase }) => {
  const isSubmitted = !!fullPaper;

  // Validate phase timing
  const phaseValidation = validatePhaseTime(
    researchPhase?.fullPaperStartDate,
    researchPhase?.fullPaperEndDate
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
    if (!selectedFile || !paperId || !title.trim() || !description.trim()) {
      alert("Vui lòng chọn file full paper, nhập title, description và đảm bảo có Paper ID");
      return;
    }

    try {
      await handleSubmitFullPaper({
        fullPaperFile: selectedFile,
        paperId,
        title: title.trim(),
        description: description.trim()
      });

      alert("Nộp full paper thành công!");
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      // Reload page to refresh data
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = "Có lỗi xảy ra khi nộp full paper";

      // if (error?.data?.Message) {
      //     errorMessage = error.data.Message;
      // } else if (error?.data?.Errors) {
      //     const errors = Object.values(error.data.Errors);
      //     errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
      // }

      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Giai đoạn Full Paper</h3>
      <p className="text-gray-400">Nộp bản full paper hoàn chỉnh cho bài báo của bạn.</p>

      {/* Phase timing information */}
      {phaseValidation.formattedPeriod && (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-2">
            <strong>Thời gian diễn ra:</strong> {phaseValidation.formattedPeriod}
          </p>

          {/* Time validation message */}
          {!phaseValidation.isAvailable && (
            <div className={`border rounded-lg p-3 ${phaseValidation.isExpired
              ? "bg-red-900/20 border-red-700"
              : "bg-yellow-900/20 border-yellow-700"
              }`}>
              <p className={`text-sm ${phaseValidation.isExpired ? "text-red-400" : "text-yellow-400"
                }`}>
                {phaseValidation.message}
              </p>
            </div>
          )}

          {/* Available deadline countdown */}
          {phaseValidation.isAvailable && phaseValidation.daysRemaining && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
              <p className="text-blue-400 text-sm">
                {phaseValidation.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show current full paper if exists */}
      {fullPaper && (
        <div className="bg-green-900/20 border border-green-700 rounded-xl p-5">
          <h4 className="font-semibold text-green-400 mb-2">Full Paper đã nộp</h4>
          <div className="space-y-2">
            <p className="text-green-300 text-sm">
              Full Paper ID: {fullPaper.fullPaperId}
            </p>
            {fullPaper.title && (
              <p className="text-green-300 text-sm">
                <span className="font-medium">Tiêu đề:</span> {fullPaper.title}
              </p>
            )}
            {fullPaper.description && (
              <p className="text-green-300 text-sm">
                <span className="font-medium">Mô tả:</span> {fullPaper.description}
              </p>
            )}
            {fullPaper.reviewStatusId && (
              <p className="text-green-300 text-sm">
                <span className="font-medium">Trạng thái đánh giá:</span> {fullPaper.reviewStatusId}
              </p>
            )}
            {fullPaper.created && (
              <p className="text-green-300 text-sm">
                <span className="font-medium">Ngày tạo:</span> {new Date(fullPaper.created).toLocaleDateString('vi-VN')}
              </p>
            )}
            {fullPaper.reviewedAt && (
              <p className="text-green-300 text-sm">
                <span className="font-medium">Ngày đánh giá:</span> {new Date(fullPaper.reviewedAt).toLocaleDateString('vi-VN')}
              </p>
            )}
            {fullPaper.fileUrl && (
              <div className="max-h-[80vh] overflow-auto">
                <DocViewer
                  documents={[{ uri: fullPaper.fileUrl }]}
                  pluginRenderers={DocViewerRenderers}
                  config={{
                    header: { disableHeader: true },
                    pdfVerticalScrollByDefault: true,
                  }}
                  style={{ minHeight: "100%", borderRadius: 8 }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* {isSubmitted && (
        <p className="text-sm text-yellow-400 mt-2">
          Bạn đã nộp full paper, không thể nộp lại.
        </p>
      )} */}

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitted || !phaseValidation.isAvailable}
            placeholder="Nhập tiêu đề bài báo"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitted || !phaseValidation.isAvailable}
            placeholder="Nhập mô tả bài báo"
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tải lên tệp full paper (.pdf)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isSubmitted || !phaseValidation.isAvailable}
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmitFullPaperForm}
          disabled={isSubmitted || !phaseValidation.isAvailable || !selectedFile || !paperId || !title.trim() || !description.trim() || submitLoading}
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
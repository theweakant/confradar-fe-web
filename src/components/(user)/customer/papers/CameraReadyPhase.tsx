import React, { useState, useEffect } from "react";
import { CameraReady, ResearchPhaseDtoDetail } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { validatePhaseTime } from "@/helper/timeValidation";
import SubmittedPaperCard from "./SubmittedPaperCard";
import { toast } from "sonner";
import SubmissionFormDialog from "./SubmissionFormDialog";
import { parseApiError } from "@/helper/api";

interface CameraReadyPhaseProps {
  paperId?: string;
  cameraReady?: CameraReady | null;
  researchPhase?: ResearchPhaseDtoDetail;

  onSubmittedCameraReady?: () => void;
}

const CameraReadyPhase: React.FC<CameraReadyPhaseProps> = ({ paperId, cameraReady, researchPhase, onSubmittedCameraReady }) => {
  const isSubmitted = !!cameraReady;

  // Validate phase timing
  const phaseValidation = validatePhaseTime(
    researchPhase?.cameraReadyStartDate,
    researchPhase?.cameraReadyEndDate
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const {
    handleSubmitCameraReady,
    handleUpdateCameraReady,
    submitCameraReadyError,
    updateCameraReadyError,
    loading: submitLoading
  } = usePaperCustomer();

  useEffect(() => {
    if (isEditing && cameraReady) {
      setTitle(cameraReady.title || "");
      setDescription(cameraReady.description || "");
    }
  }, [isEditing, cameraReady]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitCameraReadyForm = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Vui lòng nhập title và description");
      return;
    }

    if (!isEditing && (!selectedFile || !paperId)) {
      alert("Vui lòng chọn file camera-ready và đảm bảo có Paper ID");
      return;
    }

    try {
      if (isEditing) {
        // Update mode
        if (!cameraReady?.cameraReadyId) {
          alert("Không tìm thấy Camera Ready ID để cập nhật");
          return;
        }

        await handleUpdateCameraReady(cameraReady.cameraReadyId, {
          title: title.trim(),
          description: description.trim(),
          cameraReadyFile: selectedFile, // có thể null nếu không đổi file
        });

        toast.success("Cập nhật camera-ready thành công!");
        setIsEditing(false);
      } else {
        // Create mode
        await handleSubmitCameraReady({
          cameraReadyFile: selectedFile!,
          paperId: paperId!,
          title: title.trim(),
          description: description.trim()
        });
        toast.success("Nộp camera-ready thành công!");
      }

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");

      onSubmittedCameraReady?.();

      // Reload page to refresh data
      // window.location.reload();
    } catch (error: unknown) {
      const errorMessage = isEditing ? "Có lỗi xảy ra khi cập nhật camera-ready" : "Có lỗi xảy ra khi nộp camera-ready";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (submitCameraReadyError) toast.error(parseApiError<string>(submitCameraReadyError)?.data?.message)
    if (updateCameraReadyError) toast.error(parseApiError<string>(updateCameraReadyError)?.data?.message)
  }, [submitCameraReadyError, updateCameraReadyError]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Giai đoạn Camera Ready</h3>
      <p className="text-gray-400">Nộp bản camera-ready cuối cùng cho bài báo của bạn.</p>

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

      {/* Show current camera-ready if exists */}
      {cameraReady && (
        <SubmittedPaperCard
          paperInfo={{
            id: cameraReady.cameraReadyId,
            title: cameraReady.title,
            description: cameraReady.description,
            status: cameraReady.status,
            created: cameraReady.created,
            updated: cameraReady.updated,
            fileUrl: cameraReady.fileUrl
          }}
          paperType="Camera Ready"
        />
      )}

      {!cameraReady && phaseValidation.isAvailable && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Bạn chưa có submission nào</p>
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Nộp Camera Ready
          </button>
        </div>
      )}

      {cameraReady && phaseValidation.isAvailable && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
          >
            Chỉnh sửa Camera Ready
          </button>
        </div>
      )}

      {/* Submission Dialog */}
      <SubmissionFormDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onSubmit={async (data) => {
          try {
            if (cameraReady) {
              const result = await handleUpdateCameraReady(cameraReady.cameraReadyId, {
                title: data.title,
                description: data.description,
                cameraReadyFile: data.file,
              });

              if (result.success) {
                toast.success("Cập nhật camera-ready thành công!");
                onSubmittedCameraReady?.();
                return { success: true };
              }
            } else {
              const result = await handleSubmitCameraReady({
                cameraReadyFile: data.file!,
                paperId: paperId!,
                title: data.title,
                description: data.description
              });

              if (result.success) {
                toast.success("Nộp camera-ready thành công!");
                onSubmittedCameraReady?.();
                return { success: true };
              }
            }
            return { success: false };
          } catch (error) {
            return { success: false };
          }
        }}
        title={cameraReady ? "Chỉnh sửa Camera Ready" : "Nộp Camera Ready"}
        loading={submitLoading}
        includeCoauthors={false}
        isEditMode={!!cameraReady}
        initialData={cameraReady ? {
          title: cameraReady.title || "",
          description: cameraReady.description || "",
          file: null,
        } : undefined}
        shouldCloseOnSuccess={false}
      />

      {/* {cameraReady && phaseValidation.isAvailable && !isEditing && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
          >
            Chỉnh sửa Camera Ready
          </button>
        </div>
      )}

      {(!cameraReady || isEditing) && (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!phaseValidation.isAvailable}
                placeholder="Nhập tiêu đề bài báo"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!phaseValidation.isAvailable}
                placeholder="Nhập mô tả bài báo"
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tải lên tệp camera-ready (.pdf)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={!phaseValidation.isAvailable}
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

          <div className="flex justify-end gap-3">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition"
              >
                Hủy
              </button>
            )}
            <button
              onClick={handleSubmitCameraReadyForm}
              disabled={!title.trim() || !description.trim() || submitLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
            >
              {submitLoading
                ? "Đang xử lý..."
                : isEditing
                  ? "Cập nhật Camera Ready"
                  : "Nộp Camera Ready"
              }
            </button>
          </div>
        </>
      )} */}
    </div>
  );
};

export default CameraReadyPhase;
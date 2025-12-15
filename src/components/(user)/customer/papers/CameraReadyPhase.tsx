import React, { useState, useEffect, useMemo } from "react";
import { CameraReady, FullPaper, ResearchPhaseDtoDetail, RevisionPaper } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { validatePhaseTime } from "@/helper/timeValidation";
import SubmittedPaperCard from "./SubmittedPaperCard";
import { toast } from "sonner";
import SubmissionFormDialog from "./SubmissionFormDialog";
import { parseApiError } from "@/helper/api";
import { useGlobalTime } from "@/utils/TimeContext";

interface CameraReadyPhaseProps {
  paperId?: string;
  cameraReady?: CameraReady | null;
  researchPhase?: ResearchPhaseDtoDetail;

  onSubmittedCameraReady?: () => void;

  fullPaper?: FullPaper | null;
  revisionPaper?: RevisionPaper | null;
}

const CameraReadyPhase: React.FC<CameraReadyPhaseProps> = ({ paperId, cameraReady, researchPhase, onSubmittedCameraReady, fullPaper, revisionPaper, }) => {
  const isSubmitted = !!cameraReady;
  const { now } = useGlobalTime();

  // Validate phase timing
  const phaseValidation = useMemo(() => {
    const fullPaperStatus = fullPaper?.reviewStatus?.toLowerCase();

    if (fullPaperStatus === 'accepted') {
      // Full paper accepted → check deadline
      return validatePhaseTime(
        undefined,
        researchPhase?.authorPaymentEnd,
        now
      );
    }

    if (fullPaperStatus === 'revise') {
      const revisionAccepted = revisionPaper?.overallStatus?.toLowerCase() === 'accepted';

      if (!revisionAccepted) {
        return {
          isAvailable: false,
          isExpired: false,
          isPending: true,
          message: "Bản Final Review cần được chấp nhận để nộp bản Camera Ready"
        };
      }

      // Revision accepted → check deadline
      return validatePhaseTime(
        undefined,
        researchPhase?.authorPaymentEnd,
        now
      );
    }

    // Full paper rejected hoặc chưa có status
    return {
      isAvailable: false,
      isExpired: false,
      isPending: true,
      message: "Bản full paper cần được chấp nhận hoặc final review được chấp nhận mới có thể nộp Camera Ready"
    };
  }, [fullPaper?.reviewStatus, revisionPaper?.overallStatus, researchPhase?.authorPaymentEnd, now]);
  // const phaseValidation = validatePhaseTime(
  //   // researchPhase?.cameraReadyStartDate,
  //   // researchPhase?.cameraReadyEndDate,
  //   undefined,
  //   researchPhase?.authorPaymentEnd,
  //   now
  // );

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
      <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Camera Ready</h3>
      <p className="text-gray-600">Nộp bản camera-ready cuối cùng cho bài báo của bạn.</p>

      {/* Phase timing information */}
      {phaseValidation.formattedPeriod && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
          <p className="text-gray-700 text-sm mb-2">
            <strong>Hạn chót:</strong> {phaseValidation.formattedPeriod}
          </p>

          {!phaseValidation.isAvailable && phaseValidation.isExpired && (
            <div className="border rounded-lg p-3 bg-red-50 border-red-300">
              <p className="text-sm text-red-700">
                {phaseValidation.message}
              </p>
            </div>
          )}

          {phaseValidation.isAvailable && phaseValidation.daysRemaining && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                {phaseValidation.message}
              </p>
            </div>
          )}
        </div>
      )}
      {/* {phaseValidation.formattedPeriod && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
          <p className="text-gray-700 text-sm mb-2">
            <strong>Thời gian diễn ra:</strong> {phaseValidation.formattedPeriod}
          </p>

          {!phaseValidation.isAvailable && (
            <div className={`border rounded-lg p-3 ${phaseValidation.isExpired
              ? "bg-red-50 border-red-300"
              : "bg-yellow-50 border-yellow-300"
              }`}>
              <p className={`text-sm ${phaseValidation.isExpired ? "text-red-700" : "text-yellow-700"
                }`}>
                {phaseValidation.message}
              </p>
            </div>
          )}

          {phaseValidation.isAvailable && phaseValidation.daysRemaining && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                {phaseValidation.message}
              </p>
            </div>
          )}
        </div>
      )} */}

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
            fileUrl: cameraReady.fileUrl,
            reason: cameraReady.reason
          }}
          paperType="Camera Ready"
        />
      )}

      {!cameraReady && phaseValidation.isAvailable && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa có submission nào</p>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
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
    </div>
  );
};

export default CameraReadyPhase;
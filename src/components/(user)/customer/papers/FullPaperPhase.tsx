import React, { useState, useEffect, useMemo } from "react";
import { Abstract, FullPaper, ResearchPhaseDtoDetail } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { validatePhaseTime } from "@/helper/timeValidation";
import SubmittedPaperCard from "./SubmittedPaperCard";
import { toast } from "sonner";
import SubmissionFormDialog from "./SubmissionFormDialog";
import { parseApiError } from "@/helper/api";
import { useGlobalTime } from "@/utils/TimeContext";

interface FullPaperPhaseProps {
  paperId?: string;
  fullPaper?: FullPaper | null;
  researchPhase?: ResearchPhaseDtoDetail;

  onSubmittedFullPaper?: () => void;

  abstract?: Abstract | null;
}

const FullPaperPhase: React.FC<FullPaperPhaseProps> = ({ paperId, fullPaper, researchPhase, onSubmittedFullPaper, abstract }) => {
  const isSubmitted = !!fullPaper;

  const { now } = useGlobalTime();

  // Validate phase timing
  const phaseValidation = useMemo(() => {
    const abstractAccepted = abstract?.status?.toLowerCase() === 'accepted';

    if (!abstractAccepted) {
      return {
        isAvailable: false,
        isExpired: false,
        isPending: true,
        message: "Bản giới thiệu (Abstract) cần được chấp nhận trước khi nộp bản đầy đủ (Full paper)"
      };
    }

    // Nếu abstract đã accepted, chỉ cần check endDate
    return validatePhaseTime(
      undefined,
      researchPhase?.fullPaperEndDate,
      now
    );
  }, [abstract?.status, researchPhase?.fullPaperEndDate, now]);
  // const phaseValidation = validatePhaseTime(
  //   researchPhase?.fullPaperStartDate,
  //   researchPhase?.fullPaperEndDate,
  //   now
  // );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const {
    handleSubmitFullPaper,
    handleUpdateFullPaper,
    submitFullPaperError,
    updateFullPaperError,
    loading: submitLoading
  } = usePaperCustomer();

  useEffect(() => {
    if (isEditing && fullPaper) {
      setTitle(fullPaper.title || "");
      setDescription(fullPaper.description || "");
    }
  }, [isEditing, fullPaper]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitFullPaperForm = async () => {
    if (!paperId || !title.trim() || !description.trim()) {
      alert("Vui lòng nhập title, description và đảm bảo có Paper ID");
      return;
    }

    if (!isEditing && !selectedFile) {
      alert("Vui lòng chọn file full paper");
      return;
    }

    try {
      if (isEditing) {
        // Update mode
        await handleUpdateFullPaper(paperId, {
          title: title.trim(),
          description: description.trim(),
          fullPaperFile: selectedFile, // có thể null nếu không đổi file
        });

        toast.success("Cập nhật full paper thành công!");
        setIsEditing(false);
      } else {
        // Create mode
        await handleSubmitFullPaper({
          fullPaperFile: selectedFile!,
          paperId,
          title: title.trim(),
          description: description.trim()
        });
        toast.success("Nộp full paper thành công!");
      }

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");

      // Reload page to refresh data
      // window.location.reload();
      onSubmittedFullPaper?.();
    } catch (error: unknown) {
      const errorMessage = isEditing ? "Có lỗi xảy ra khi cập nhật full paper" : "Có lỗi xảy ra khi nộp full paper";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (submitFullPaperError) toast.error(parseApiError<string>(submitFullPaperError)?.data?.message)
    if (updateFullPaperError) toast.error(parseApiError<string>(updateFullPaperError)?.data?.message)
  }, [submitFullPaperError, updateFullPaperError]);


  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Full Paper</h3>
      <p className="text-gray-600">Nộp bản full paper hoàn chỉnh cho bài báo của bạn.</p>

      {/* Phase timing information */}
      {phaseValidation.formattedPeriod && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
          <p className="text-gray-700 text-sm mb-2">
            <strong>Thời gian diễn ra:</strong> {phaseValidation.formattedPeriod}
          </p>

          {/* Time validation message */}
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

          {/* Available deadline countdown */}
          {phaseValidation.isAvailable && phaseValidation.daysRemaining && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                {phaseValidation.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show current full paper if exists */}
      {fullPaper && (
        <SubmittedPaperCard
          paperInfo={{
            id: fullPaper.fullPaperId,
            title: fullPaper.title,
            description: fullPaper.description,
            reviewStatus: fullPaper.reviewStatus,
            created: fullPaper.created,
            updated: fullPaper.updated,
            fileUrl: fullPaper.fileUrl,
            reason: fullPaper.reason
          }}
          paperType="Full Paper"
        />
      )}

      {!fullPaper && phaseValidation.isAvailable && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa có submission nào</p>
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Nộp Full Paper
          </button>
        </div>
      )}

      {fullPaper && phaseValidation.isAvailable && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Chỉnh sửa Full Paper
          </button>
        </div>
      )}

      {/* Submission Dialog */}
      <SubmissionFormDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onSubmit={async (data) => {
          try {
            if (fullPaper) {
              const result = await handleUpdateFullPaper(paperId!, {
                title: data.title,
                description: data.description,
                fullPaperFile: data.file,
              });

              if (result.success) {
                toast.success("Cập nhật full paper thành công!");
                onSubmittedFullPaper?.();
                return { success: true };
              }
            } else {
              const result = await handleSubmitFullPaper({
                fullPaperFile: data.file!,
                paperId: paperId!,
                title: data.title,
                description: data.description
              });

              if (result.success) {
                toast.success("Nộp full paper thành công!");
                onSubmittedFullPaper?.();
                return { success: true };
              }
            }
            return { success: false };
          } catch (error) {
            return { success: false };
          }
        }}
        title={fullPaper ? "Chỉnh sửa Full Paper" : "Nộp Full Paper"}
        loading={submitLoading}
        includeCoauthors={false}
        isEditMode={!!fullPaper}
        initialData={fullPaper ? {
          title: fullPaper.title || "",
          description: fullPaper.description || "",
          file: null,
        } : undefined}
        shouldCloseOnSuccess={false}
      />
    </div>
  );
};

export default FullPaperPhase;
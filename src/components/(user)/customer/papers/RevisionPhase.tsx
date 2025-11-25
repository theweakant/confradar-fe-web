import { memo, useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import { usePaperCustomer } from '@/redux/hooks/usePaper';
import { ResearchPhaseDtoDetail, RevisionPaper, RevisionSubmissionFeedback, RevisionDeadlineDetail, RevisionSubmission } from '@/types/paper.type';
import "@cyntler/react-doc-viewer/dist/index.css";
import FeedbackDialog from './FeedbackDialog';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { toast } from 'sonner';
import { Dialog, Transition } from "@headlessui/react";
import { Info, X } from "lucide-react";
import { validatePhaseTime, PhaseValidationResult } from '@/helper/timeValidation';
import { cn } from '@/utils/utils';
import EmblaCarousel from '@/components/molecules/EmblaCarousel';
import SubmittedPaperCard from './SubmittedPaperCard';
import SubmissionFormDialog from './SubmissionFormDialog';

interface RevisionPhaseProps {
  paperId: string;
  revisionPaper: RevisionPaper | null;
  researchPhase?: ResearchPhaseDtoDetail;
  revisionDeadline?: RevisionDeadlineDetail[];

  onSubmittedRevision?: () => void;
}

const RevisionPhase: React.FC<RevisionPhaseProps> = ({ paperId, revisionPaper, researchPhase, revisionDeadline, onSubmittedRevision }) => {
  const {
    handleSubmitPaperRevision,
    handleSubmitPaperRevisionResponse,
    handleUpdateRevisionSubmission,
    loading,
    submitRevisionError,
    updateRevisionError
  } = usePaperCustomer();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedbackResponses, setFeedbackResponses] = useState<{ [key: string]: string }>({});
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [currentRoundForSubmission, setCurrentRoundForSubmission] = useState<number | null>(null);

  const [swiperInstance, setSwiperInstance] = useState<unknown>(null);

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number | null>(null);
  const [currentSubmissionData, setCurrentSubmissionData] = useState<{
    submissionId: string;
    title: string;
    description: string;
  } | null>(null);

  const revisionValidation: PhaseValidationResult = useMemo(() => {
    if (!revisionDeadline || revisionDeadline.length === 0) {
      return {
        isAvailable: false,
        isExpired: false,
        isPending: true,
        message: "Thông tin deadline revision chưa được cập nhật"
      };
    }

    const currentSubmissionCount = revisionPaper?.submissions?.length || 0;

    const sortedDeadlines = [...revisionDeadline].sort((a, b) => {
      if (a.roundNumber !== b.roundNumber) {
        return (a.roundNumber || 0) - (b.roundNumber || 0);
      }
      if (a.startSubmissionDate && b.startSubmissionDate) {
        return new Date(a.startSubmissionDate).getTime() - new Date(b.startSubmissionDate).getTime();
      }
      return 0;
    });

    const nextRoundIndex = currentSubmissionCount;
    const nextDeadline = sortedDeadlines[nextRoundIndex];

    if (!nextDeadline) {
      return {
        isAvailable: false,
        isExpired: true,
        isPending: false,
        message: "Đã hết round deadline để nộp revision submission"
      };
    }

    return validatePhaseTime(
      nextDeadline.startSubmissionDate,
      nextDeadline.endSubmissionDate
    );
  }, [revisionDeadline, revisionPaper?.submissions?.length]);

  const responseValidation: PhaseValidationResult = useMemo(() => {
    if (!revisionDeadline || revisionDeadline.length === 0) {
      return {
        isAvailable: false,
        isExpired: false,
        isPending: true,
        message: "Thông tin deadline revision chưa được cập nhật"
      };
    }

    const currentSubmissionCount = revisionPaper?.submissions?.length || 0;

    if (currentSubmissionCount === 0) {
      return {
        isAvailable: false,
        isExpired: false,
        isPending: true,
        message: "Chưa có submission nào để response"
      };
    }

    const sortedDeadlines = [...revisionDeadline].sort((a, b) => {
      if (a.roundNumber !== b.roundNumber) {
        return (a.roundNumber || 0) - (b.roundNumber || 0);
      }
      if (a.startSubmissionDate && b.startSubmissionDate) {
        return new Date(a.startSubmissionDate).getTime() - new Date(b.startSubmissionDate).getTime();
      }
      return 0;
    });

    const currentRoundIndex = currentSubmissionCount - 1;
    const currentDeadline = sortedDeadlines[currentRoundIndex];

    if (!currentDeadline) {
      return {
        isAvailable: false,
        isExpired: true,
        isPending: false,
        message: "Không tìm thấy deadline cho round hiện tại"
      };
    }

    return validatePhaseTime(
      currentDeadline.startSubmissionDate,
      currentDeadline.endSubmissionDate
    );
  }, [revisionDeadline, revisionPaper?.submissions?.length]);


  const allRounds = useMemo(() => {
    if (!revisionDeadline || revisionDeadline.length === 0) return [];

    const sortedDeadlines = [...revisionDeadline].sort((a, b) => {
      if (a.roundNumber !== b.roundNumber) {
        return (a.roundNumber || 0) - (b.roundNumber || 0);
      }
      if (a.startSubmissionDate && b.startSubmissionDate) {
        return new Date(a.startSubmissionDate).getTime() - new Date(b.startSubmissionDate).getTime();
      }
      return 0;
    });

    return sortedDeadlines.map((deadline) => {
      const existingSubmission = revisionPaper?.submissions?.find(
        sub => sub.revisionRoundId === deadline.revisionRoundDeadlineId
      );

      const validation = validatePhaseTime(
        deadline.startSubmissionDate,
        deadline.endSubmissionDate
      );

      return {
        roundNumber: deadline.roundNumber || 0,
        deadline,
        validation,
        submission: existingSubmission || null,
        hasSubmission: !!existingSubmission
      };
    });
  }, [revisionDeadline, revisionPaper?.submissions]);

  const isRevisionCompleted = useMemo(() => {
    return revisionPaper?.revisionRoundDeadlineId != null;
  }, [revisionPaper?.revisionRoundDeadlineId]);

  const getCompletedRoundNumber = useMemo(() => {
    if (!isRevisionCompleted || !revisionPaper?.revisionRoundDeadlineId) return null;

    const completedRound = revisionDeadline?.find(
      d => d.revisionRoundDeadlineId === revisionPaper.revisionRoundDeadlineId
    );

    return completedRound?.roundNumber || null;
  }, [isRevisionCompleted, revisionPaper?.revisionRoundDeadlineId, revisionDeadline]);

  const shouldDisableSubmission = useCallback((roundNumber: number): boolean => {
    if (!isRevisionCompleted || getCompletedRoundNumber === null) return false;

    // Disable tất cả các round sau round đã đánh dấu hoàn tất
    return roundNumber > getCompletedRoundNumber;
  }, [isRevisionCompleted, getCompletedRoundNumber]);

  const MemoizedFeedbackDialog = memo(FeedbackDialog);

  useEffect(() => {
    if (submitRevisionError) {
      let errorMessage = "Có lỗi xảy ra";
      if (submitRevisionError.data?.message) {
        errorMessage = submitRevisionError.data.message;
      }
      toast.error(errorMessage);
    }
  }, [submitRevisionError]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  }, []);

  const handleEditFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setEditFile(event.target.files[0]);
    }
  }, []);

  const handleResponseChange = useCallback(
    (feedbackId: string, response: string) => {
      setFeedbackResponses(prev => ({
        ...prev,
        [feedbackId]: response
      }));
    },
    []
  );


  const handleSubmitNewSubmission = useCallback(async () => {
    if (!selectedFile || !paperId || !title.trim() || !description.trim()) {
      alert("Vui lòng chọn file revision, nhập title, description và đảm bảo có Paper ID");
      return;
    }

    try {
      await handleSubmitPaperRevision({
        revisionPaperFile: selectedFile,
        paperId,
        title: title.trim(),
        description: description.trim()
      });

      alert("Nộp revision paper thành công!");
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      onSubmittedRevision?.();
      // window.location.reload();
    } catch (error: unknown) {
      // const errorMessage = "Có lỗi xảy ra khi nộp revision paper";
      // alert(errorMessage);
    }
  }, [selectedFile, paperId, title, description, handleSubmitPaperRevision]);

  const handleSubmitResponses = useCallback(
    async (submissionId: string) => {
      if (!responseValidation.isAvailable) {
        alert(`Không thể gửi phản hồi: ${responseValidation.message}`);
        return;
      }

      const submission = revisionPaper?.submissions.find(s => s.submissionId === submissionId);
      if (!submission || !paperId) return;

      const responses = submission.feedbacks
        .filter(f => f.feedBack && feedbackResponses[f.feedbackId])
        .map(f => ({
          revisionSubmissionFeedbackId: f.feedbackId,
          response: feedbackResponses[f.feedbackId]
        }));

      if (responses.length === 0) {
        alert("Vui lòng nhập phản hồi cho ít nhất một feedback");
        return;
      }

      try {
        await handleSubmitPaperRevisionResponse({
          responses,
          revisionPaperSubmissionId: submissionId,
          paperId
        });
        alert("Gửi phản hồi thành công!");
        setFeedbackResponses({});
        setActiveSubmissionId(null);
      } catch {
        alert("Có lỗi xảy ra khi gửi phản hồi");
      }
    },
    [feedbackResponses, paperId, revisionPaper?.submissions, handleSubmitPaperRevisionResponse, revisionValidation]
  );

  const handleStartEdit = useCallback((submission: RevisionSubmission | null) => {
    if (!submission) return;
    setCurrentSubmissionData({
      submissionId: submission.submissionId,
      title: submission.title || "",
      description: submission.description || ""
    });
    setIsSubmitDialogOpen(true);
  }, []);

  // ✅ SỬA LẠI
  const handleCancelEdit = useCallback(() => {
    setCurrentSubmissionData(null);
    setIsSubmitDialogOpen(false);
  }, []);

  // const handleStartEdit = useCallback((submission: RevisionSubmission | null) => {
  //   if (!submission) return;
  //   setEditingSubmissionId(submission.submissionId);
  //   setEditTitle(submission.title || "");
  //   setEditDescription(submission.description || "");
  //   setEditFile(null);
  // }, []);

  // const handleCancelEdit = useCallback(() => {
  //   setEditingSubmissionId(null);
  //   setEditTitle("");
  //   setEditDescription("");
  //   setEditFile(null);
  // }, []);

  const handleUpdateSubmission = useCallback(async (submissionId: string) => {
    if (!editTitle.trim() || !editDescription.trim()) {
      alert("Vui lòng nhập tiêu đề và mô tả");
      return;
    }

    try {
      await handleUpdateRevisionSubmission(paperId, submissionId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        revisionPaperFile: editFile, // có thể null nếu không đổi file
      });

      toast.success("Cập nhật submission thành công!");
      handleCancelEdit();
      onSubmittedRevision?.();
      // window.location.reload();
    } catch (error: unknown) {
      toast.error("Có lỗi xảy ra khi cập nhật submission");
    }
  }, [editTitle, editDescription, editFile, paperId, handleUpdateRevisionSubmission, handleCancelEdit]);

  const canRespondToFeedback = useCallback((feedback: RevisionSubmissionFeedback): boolean => {
    return !!feedback.feedBack && feedback.feedBack.trim().length > 0;
  }, []);

  useEffect(() => {
    if (submitRevisionError) {
      let errorMessage = "Có lỗi xảy ra khi nộp RevisionPaper";

      if (submitRevisionError?.data?.message) {
        errorMessage = submitRevisionError.data.message;
      }


      toast.error(errorMessage);
    }
  }, [submitRevisionError]);

  useEffect(() => {
    if (updateRevisionError) {
      let errorMessage = "Có lỗi xảy ra khi nộp RevisionPaper";

      if (updateRevisionError?.data?.message) {
        errorMessage = updateRevisionError.data.message;
      }


      toast.error(errorMessage);
    }
  }, [updateRevisionError]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Giai đoạn Revision</h3>
          <p className="text-gray-400 mt-1">
            Đây là giai đoạn chỉnh sửa bài báo dựa trên phản hồi của reviewer.
          </p>
        </div>
        <button
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <Info className="w-5 h-5" />
          Xem hướng dẫn
        </button>
      </div>
      <div className="rounded-lg">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content Section */}
          <div>
            {/* Revision Paper Information */}
            {revisionPaper ? (
              <div className="mb-6">
                <SubmittedPaperCard
                  paperInfo={{
                    id: revisionPaper.revisionPaperId,
                    overallStatus: revisionPaper.overallStatus,
                    submissionCount: revisionPaper.submissions?.length || 0,
                    created: revisionPaper.created,
                    updated: revisionPaper.updated,
                  }}
                  paperType="Revision Paper"
                // showFileViewer={false}
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                <p className="text-gray-400">Chưa có thông tin revision paper</p>
              </div>
            )}

            {/* All Rounds Display */}
            {allRounds.length > 0 && (
              <div className="rounded-xl p-2">
                <h3 className="text-lg font-bold mb-4">Các Round Revision</h3>

                <EmblaCarousel>
                  {allRounds.map((round, index) => {
                    const isCompleted = isRevisionCompleted && getCompletedRoundNumber === round.roundNumber;
                    const isDisabled = shouldDisableSubmission(round.roundNumber);

                    return (
                      <SwiperSlide key={`round-${round.roundNumber}`}>
                        {/* <div className="border border-gray-600 rounded-lg p-4 bg-gray-800"> */}
                        <div className={cn(
                          "border rounded-lg p-4 bg-gray-800",
                          isCompleted ? "border-green-500" : "border-gray-600",
                          isDisabled && "opacity-60"
                        )}>
                          <div className="flex justify-between items-center mb-4">
                            {/* Left side */}
                            <div>
                              <h4 className="font-semibold text-lg text-white">Round {round.roundNumber}</h4>
                              <p className="text-xs text-gray-400 mt-1">
                                {round.hasSubmission
                                  ? `ID submission: ${round.submission?.submissionId}`
                                  : "Chưa có submission"}
                              </p>
                            </div>

                            {/* Right side: badge + feedback button */}
                            <div className="flex items-center gap-2">
                              {/* Completed Badge */}
                              {isCompleted && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Đã hoàn tất, chờ review
                                </span>
                              )}

                              {/* Disabled Badge */}
                              {isDisabled && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                  Không cần nộp
                                </span>
                              )}

                              {/* Feedback Button */}
                              {round.hasSubmission &&
                                round.submission?.feedbacks &&
                                round.submission.feedbacks.length > 0 && (
                                  <button
                                    onClick={() =>
                                      setActiveSubmissionId(round.submission?.submissionId ?? null)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/80 hover:bg-blue-700 text-white text-xs rounded-md transition"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{round.submission.feedbacks.length} Feedback(s) từ Reviewer</span>
                                  </button>
                                )}

                              {/* Status Badge */}
                              {!isCompleted && !isDisabled && (
                                <span
                                  className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium",
                                    round.hasSubmission
                                      ? "bg-green-500/20 text-green-400"
                                      : round.validation.isAvailable
                                        ? "bg-blue-500/20 text-blue-400"
                                        : round.validation.isPending
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : "bg-gray-500/20 text-gray-400"
                                  )}
                                >
                                  {round.hasSubmission
                                    ? "Đã nộp"
                                    : round.validation.isAvailable
                                      ? "Đang mở"
                                      : round.validation.isPending
                                        ? "Sắp tới"
                                        : "Đã đóng"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Deadline Information */}
                          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                            <h5 className="font-medium text-white mb-2">Thông tin Deadline</h5>
                            {round.validation.formattedPeriod && (
                              <p className="text-sm text-gray-300 mb-2">
                                <span className="font-medium">Thời gian nộp:</span> {round.validation.formattedPeriod}
                              </p>
                            )}

                            {isDisabled ? (
                              <div className="text-sm font-medium text-gray-400">
                                Bạn không cần nộp submission cho round này nữa
                              </div>
                            ) : (
                              <>
                                <div className={`text-sm font-medium ${round.validation.isAvailable ? 'text-green-400' :
                                  round.validation.isExpired ? 'text-red-400' : 'text-yellow-400'
                                  }`}>
                                  {round.validation.message}
                                </div>
                                {round.validation.daysRemaining && (
                                  <div className="text-sm text-blue-400 mt-1">
                                    Còn {round.validation.daysRemaining} ngày
                                  </div>
                                )}
                                {round.validation.daysUntilStart && (
                                  <div className="text-sm text-yellow-400 mt-1">
                                    Còn {round.validation.daysUntilStart} ngày nữa mới có thể nộp
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* If has submission - show submission info */}
                          {isDisabled ? (
                            <div className="text-center py-8 text-gray-400">
                              <p className="text-sm">Round này không cần nộp submission</p>
                            </div>
                          ) : round.hasSubmission && round.submission ? (
                            <div>
                              {/* ✅ View mode - Đơn giản hơn nhiều */}
                              <div className="mb-4">
                                <SubmittedPaperCard
                                  paperInfo={{
                                    id: round.submission.submissionId,
                                    title: round.submission.title,
                                    description: round.submission.description,
                                    fileUrl: round.submission.fileUrl,
                                  }}
                                  paperType={`Submission Round ${round.roundNumber}`}
                                />
                                {round.validation.isAvailable && (
                                  <div className="flex justify-end mt-3">
                                    <button
                                      onClick={() => handleStartEdit(round.submission)}
                                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                                    >
                                      Chỉnh sửa Submission
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Feedback Dialog - giữ nguyên */}
                              {round.submission.feedbacks && round.submission.feedbacks.length > 0 && (
                                <MemoizedFeedbackDialog
                                  isOpen={activeSubmissionId === round.submission.submissionId}
                                  onClose={() => setActiveSubmissionId(null)}
                                  submission={round.submission}
                                  feedbackResponses={feedbackResponses}
                                  onResponseChange={handleResponseChange}
                                  onSubmitResponses={() =>
                                    round.submission?.submissionId && handleSubmitResponses(round.submission.submissionId)
                                  }
                                  loading={loading}
                                  canRespondToFeedback={canRespondToFeedback}
                                  responseValidation={responseValidation}
                                />
                              )}
                            </div>
                          ) : (
                            /* ✅ If no submission - show button only */
                            <div className="text-center py-8">
                              <button
                                onClick={() => {
                                  setCurrentRoundNumber(round.roundNumber);
                                  setIsSubmitDialogOpen(true);
                                }}
                                disabled={!round.validation.isAvailable}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                              >
                                Nộp Submission Round {round.roundNumber}
                              </button>
                            </div>
                          )}
                          {/* {isDisabled ? (
                            <div className="text-center py-8 text-gray-400">
                              <p className="text-sm">Round này không cần nộp submission</p>
                            </div>
                          ) : (
                            round.hasSubmission && round.submission ? (
                              <div>
                                {editingSubmissionId === round.submission.submissionId ? (
                                  // Edit mode for this submission
                                  <div className="space-y-4 mb-4 p-4 bg-gray-700 rounded-lg">
                                    <h5 className="font-medium text-white">Chỉnh sửa Submission</h5>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tiêu đề
                                      </label>
                                      <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề bài báo"
                                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mô tả
                                      </label>
                                      <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Nhập mô tả bài báo"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Chọn file mới (tùy chọn)
                                      </label>
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleEditFileSelect}
                                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                      {editFile && (
                                        <p className="text-sm text-green-400 mt-1">
                                          File mới đã chọn: {editFile.name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => handleUpdateSubmission(round.submission!.submissionId)}
                                        disabled={!editTitle.trim() || !editDescription.trim() || loading}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                      >
                                        {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // View mode for this submission
                                  <div className="mb-4">
                                    <SubmittedPaperCard
                                      paperInfo={{
                                        id: round.submission.submissionId,
                                        title: round.submission.title,
                                        description: round.submission.description,
                                        fileUrl: round.submission.fileUrl,
                                      }}
                                      paperType={`Submission Round ${round.roundNumber}`}
                                    />
                                    {round.validation.isAvailable && (
                                      <div className="flex justify-end mt-3">
                                        <button
                                          onClick={() => handleStartEdit(round.submission)}
                                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                                        >
                                          Chỉnh sửa Submission
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {round.submission.feedbacks && round.submission.feedbacks.length > 0 && (
                                  <>
                                    <MemoizedFeedbackDialog
                                      isOpen={activeSubmissionId === round.submission.submissionId}
                                      onClose={() => setActiveSubmissionId(null)}
                                      submission={round.submission}
                                      feedbackResponses={feedbackResponses}
                                      onResponseChange={handleResponseChange}
                                      onSubmitResponses={() =>
                                        round.submission?.submissionId && handleSubmitResponses(round.submission.submissionId)
                                      }
                                      loading={loading}
                                      canRespondToFeedback={canRespondToFeedback}
                                      responseValidation={responseValidation}
                                    />
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tiêu đề
                                  </label>
                                  <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề bài báo"
                                    disabled={!round.validation.isAvailable}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Mô tả
                                  </label>
                                  <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả bài báo"
                                    disabled={!round.validation.isAvailable}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Chọn file revision paper
                                  </label>
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    disabled={!round.validation.isAvailable}
                                    onChange={handleFileSelect}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                  {selectedFile && (
                                    <p className="text-sm text-green-400 mt-1">
                                      File đã chọn: {selectedFile.name}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={handleSubmitNewSubmission}
                                  disabled={!round.validation.isAvailable || !selectedFile || !title.trim() || !description.trim() || loading}
                                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                  {loading ? 'Đang nộp...' : 'Nộp Submission'}
                                </button>
                              </div>
                            )
                          )} */}
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </EmblaCarousel>

                <SubmissionFormDialog
                  isOpen={isSubmitDialogOpen}
                  onClose={() => {
                    setIsSubmitDialogOpen(false);
                    setCurrentSubmissionData(null);
                    setCurrentRoundNumber(null);
                  }}
                  onSubmit={async (data) => {
                    try {
                      if (currentSubmissionData) {
                        // Update existing submission
                        await handleUpdateRevisionSubmission(
                          paperId,
                          currentSubmissionData.submissionId,
                          {
                            title: data.title,
                            description: data.description,
                            revisionPaperFile: data.file,
                          }
                        );
                        toast.success("Cập nhật submission thành công!");
                      } else {
                        // Create new submission
                        await handleSubmitPaperRevision({
                          revisionPaperFile: data.file!,
                          paperId,
                          title: data.title,
                          description: data.description
                        });
                        toast.success("Nộp revision paper thành công!");
                      }

                      setIsSubmitDialogOpen(false);
                      setCurrentSubmissionData(null);
                      setCurrentRoundNumber(null);
                      onSubmittedRevision?.();
                      return { success: true };
                    } catch (error) {
                      return { success: false };
                    }
                  }}
                  title={
                    currentSubmissionData
                      ? `Chỉnh sửa Submission Round ${currentRoundNumber || ''}`
                      : `Nộp Submission Round ${currentRoundNumber || ''}`
                  }
                  loading={loading}
                  includeCoauthors={false}
                  isEditMode={!!currentSubmissionData}
                  initialData={
                    currentSubmissionData
                      ? {
                        title: currentSubmissionData.title,
                        description: currentSubmissionData.description,
                        file: null,
                      }
                      : undefined
                  }
                  shouldCloseOnSuccess={false}
                />

                {/* Custom styling cho Swiper navigation - giữ nguyên */}
                <style jsx global>{`
      .submissions-swiper .swiper-button-next,
      .submissions-swiper .swiper-button-prev {
          color: #3b82f6;
          background: rgba(31, 41, 55, 0.8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
      }
      
      .submissions-swiper .swiper-button-next:after,
      .submissions-swiper .swiper-button-prev:after {
          font-size: 20px;
      }
      
      .submissions-swiper .swiper-pagination-bullet {
          background: #9ca3af;
      }
      
      .submissions-swiper .swiper-pagination-bullet-active {
          background: #3b82f6;
      }
      
      .submissions-swiper {
          padding-bottom: 50px;
      }
    `}</style>
              </div>
            )}
          </div>

          {/* Guide Dialog */}
          <Transition appear show={isGuideOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsGuideOpen(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <Dialog.Title className="text-xl font-bold text-white">
                          Hướng dẫn Revision
                        </Dialog.Title>
                        <button
                          onClick={() => setIsGuideOpen(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-700 rounded-lg">
                          <h4 className="font-medium mb-2 text-white">Quy trình Revision</h4>
                          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                            <li>Đọc feedback từ reviewer</li>
                            <li>Chỉnh sửa bài báo theo feedback</li>
                            <li>Nộp submission mới</li>
                            <li>Trả lời feedback (nếu có)</li>
                          </ol>
                        </div>

                        <div className="p-4 bg-gray-700 rounded-lg">
                          <h4 className="font-medium mb-2 text-white">Lưu ý</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Có thể nộp nhiều submission</li>
                            <li>• Chỉ trả lời feedback khi có nội dung</li>
                            <li>• File chấp nhận: PDF, DOC, DOCX</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setIsGuideOpen(false)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Đóng
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default RevisionPhase;
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { usePaperCustomer } from '@/redux/hooks/usePaper';
import { ResearchPhaseDtoDetail, RevisionPaper, RevisionSubmission, RevisionSubmissionFeedback, RevisionDeadlineDetail } from '@/types/paper.type';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import FeedbackDialog from './FeedbackDialog';
import { MessageSquare } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { toast } from 'sonner';
import { validatePhaseTime, PhaseValidationResult } from '@/helper/timeValidation';

interface RevisionPhaseProps {
  paperId: string;
  revisionPaper: RevisionPaper | null;
  researchPhase?: ResearchPhaseDtoDetail;
  revisionDeadline?: RevisionDeadlineDetail[];
}

const MemoizedDocViewer = memo<{ fileUrl: string }>(({ fileUrl }) => {
  const documents = useMemo(() => [{ uri: fileUrl }], [fileUrl]);

  const config = useMemo(() => ({
    header: { disableHeader: true },
    pdfVerticalScrollByDefault: true,
  }), []);

  return (
    <DocViewer
      documents={documents}
      pluginRenderers={DocViewerRenderers}
      config={config}
      style={{ minHeight: "100%", borderRadius: 8 }}
    />
  );
});

MemoizedDocViewer.displayName = 'MemoizedDocViewer';

const RevisionPhase: React.FC<RevisionPhaseProps> = ({ paperId, revisionPaper, researchPhase, revisionDeadline }) => {
  const { handleSubmitPaperRevision, handleSubmitPaperRevisionResponse, loading, submitRevisionError } = usePaperCustomer();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedbackResponses, setFeedbackResponses] = useState<{ [key: string]: string }>({});
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  const [swiperInstance, setSwiperInstance] = useState<unknown>(null);

  // Validate revision deadline timing
  const revisionValidation: PhaseValidationResult = useMemo(() => {
    if (!revisionDeadline || revisionDeadline.length === 0) {
      return {
        isAvailable: false,
        isExpired: false,
        isPending: true,
        message: "Thông tin deadline revision chưa được cập nhật"
      };
    }

    // Current submission count (number of existing submissions)
    const currentSubmissionCount = revisionPaper?.submissions?.length || 0;

    // Sort deadlines by round number and then by start date to ensure correct order
    const sortedDeadlines = [...revisionDeadline].sort((a, b) => {
      if (a.roundNumber !== b.roundNumber) {
        return (a.roundNumber || 0) - (b.roundNumber || 0);
      }
      if (a.startSubmissionDate && b.startSubmissionDate) {
        return new Date(a.startSubmissionDate).getTime() - new Date(b.startSubmissionDate).getTime();
      }
      return 0;
    });

    // Get the next round deadline (current submission count + 1)
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

  useEffect(() => {
    console.log("=== RevisionPhase Debug ===");

    // Dữ liệu paper và submissions
    console.log("revisionPaper:", revisionPaper);
    console.log("revisionPaper.submissions:", revisionPaper?.submissions || []);

    // Dữ liệu deadlines
    console.log("revisionDeadline:", revisionDeadline || []);

    // Số lượt submit hiện tại
    const currentSubmissionCount = revisionPaper?.submissions?.length || 0;
    console.log("currentSubmissionCount:", currentSubmissionCount);

    if (revisionDeadline && revisionDeadline.length > 0) {
      // Sắp xếp deadlines theo roundNumber + startSubmissionDate
      const sortedDeadlines = [...revisionDeadline].sort((a, b) => {
        if (a.roundNumber !== b.roundNumber) {
          return (a.roundNumber || 0) - (b.roundNumber || 0);
        }
        if (a.startSubmissionDate && b.startSubmissionDate) {
          return new Date(a.startSubmissionDate).getTime() - new Date(b.startSubmissionDate).getTime();
        }
        return 0;
      });
      console.log("sortedDeadlines:", sortedDeadlines);

      // Lấy deadline tiếp theo
      const nextRoundIndex = currentSubmissionCount;
      const nextDeadline = sortedDeadlines[nextRoundIndex];
      console.log("nextRoundIndex:", nextRoundIndex);
      console.log("nextDeadline:", nextDeadline);

      if (!nextDeadline) {
        console.warn("Đã hết round deadline để nộp revision submission hoặc dữ liệu thiếu");
      }
    } else {
      console.warn("revisionDeadline chưa có dữ liệu hoặc rỗng");
    }

    // Log kết quả useMemo hiện tại
    console.log("revisionValidation:", revisionValidation);
  }, [revisionPaper, revisionDeadline, revisionValidation]);

  const MemoizedFeedbackDialog = memo(FeedbackDialog);

  // const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     if (event.target.files && event.target.files[0]) {
  //         setSelectedFile(event.target.files[0]);
  //     }
  // };

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

  // const handleResponseChange = (feedbackId: string, response: string) => {
  //     setFeedbackResponses(prev => ({
  //         ...prev,
  //         [feedbackId]: response
  //     }));
  // };

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
      window.location.reload();
    } catch (error: unknown) {
      // const errorMessage = "Có lỗi xảy ra khi nộp revision paper";
      // alert(errorMessage);
    }
  }, [selectedFile, paperId, title, description, handleSubmitPaperRevision]);
  // const handleSubmitNewSubmission = async () => {
  //     if (!selectedFile || !paperId || !title.trim() || !description.trim()) {
  //         alert("Vui lòng chọn file revision, nhập title, description và đảm bảo có Paper ID");
  //         return;
  //     }

  //     try {
  //         await handleSubmitPaperRevision({
  //             revisionPaperFile: selectedFile,
  //             paperId,
  //             title: title.trim(),
  //             description: description.trim()
  //         });

  //         alert("Nộp revision paper thành công!");
  //         setSelectedFile(null);
  //         setTitle("");
  //         setDescription("");
  //         window.location.reload();
  //     } catch (error: unknown) {
  //         const errorMessage = "Có lỗi xảy ra khi nộp revision paper";

  //         // if (error?.data?.Message) {
  //         //     errorMessage = error.data.Message;
  //         // } else if (error?.data?.Errors) {
  //         //     const errors = Object.values(error.data.Errors);
  //         //     errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
  //         // }

  //         alert(errorMessage);
  //     }
  // };

  const handleSubmitResponses = useCallback(
    async (submissionId: string) => {
      // Check if current time allows response submission
      if (!revisionValidation.isAvailable) {
        alert(`Không thể gửi phản hồi: ${revisionValidation.message}`);
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

  // const handleSubmitResponses = async (submissionId: string) => {
  //     const submission = revisionPaper?.submissions.find(s => s.submissionId === submissionId);
  //     if (!submission || !paperId) {
  //         alert("Không tìm thấy submission hoặc Paper ID");
  //         return;
  //     }

  //     const responses = submission.feedbacks
  //         .filter(feedback => feedback.feedBack && feedbackResponses[feedback.feedbackId])
  //         .map(feedback => ({
  //             revisionSubmissionFeedbackId: feedback.feedbackId,
  //             response: feedbackResponses[feedback.feedbackId]
  //         }));

  //     if (responses.length === 0) {
  //         alert("Vui lòng nhập phản hồi cho ít nhất một feedback");
  //         return;
  //     }

  //     try {
  //         await handleSubmitPaperRevisionResponse({
  //             responses,
  //             revisionPaperSubmissionId: submissionId,
  //             paperId
  //         });

  //         alert("Gửi phản hồi thành công!");
  //         setFeedbackResponses({});
  //         setActiveSubmissionId(null);
  //         // Reload page to refresh data
  //         // window.location.reload();
  //     } catch (error: unknown) {
  //         const errorMessage = "Có lỗi xảy ra khi gửi phản hồi";

  //         // if (error?.data?.Message) {
  //         //     errorMessage = error.data.Message;
  //         // } else if (error?.data?.Errors) {
  //         //     const errors = Object.values(error.data.Errors);
  //         //     errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
  //         // }

  //         alert(errorMessage);
  //     }
  // };

  // Check if feedback has content to allow response input
  // const canRespondToFeedback = (feedback: RevisionSubmissionFeedback) => {
  //     return feedback.feedBack && feedback.feedBack.trim().length > 0;
  // };

  const canRespondToFeedback = useCallback((feedback: RevisionSubmissionFeedback): boolean => {
    return !!feedback.feedBack && feedback.feedBack.trim().length > 0;
  }, []);

  // const canRespondToFeedback = (feedback: RevisionSubmissionFeedback): boolean => {
  //     return !!feedback.feedBack && feedback.feedBack.trim().length > 0;
  // };

  const paperStatus = [
    { id: 1, step: 'Nộp bài báo', completed: true, date: '15/01/2025' },
    { id: 2, step: 'Xác nhận tiếp nhận', completed: true, date: '17/01/2025' },
    { id: 3, step: 'Phân công reviewer', completed: true, date: '20/01/2025' },
    { id: 4, step: 'Đánh giá bài báo', completed: false, date: 'Đang tiến hành' },
    { id: 5, step: 'Kết quả review', completed: false, date: 'Chờ xử lý' },
    { id: 6, step: 'Camera-ready', completed: false, date: 'Chờ xử lý' },
  ];

  const paperDetails = {
    title: 'Nghiên cứu về Machine Learning trong xử lý ngôn ngữ tự nhiên',
    conference: 'Hội thảo Khoa học Máy tính Việt Nam 2025',
    submittedDate: '15/01/2025',
    reviewDeadline: '28/02/2025',
    status: 'Đang được đánh giá'
  };

  const actions = [
    { name: 'Xem chi tiết bài báo', progress: '100%', status: 'completed' },
    { name: 'Theo dõi phản hồi reviewer', progress: '60%', status: 'in-progress' },
    { name: 'Cập nhật thông tin tác giả', progress: '100%', status: 'completed' },
    { name: 'Chuẩn bị bản camera-ready', progress: '0%', status: 'pending' },
    { name: 'Đăng ký trình bày', progress: '0%', status: 'pending' },
  ];
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Giai đoạn Revision</h3>
      <p className="text-gray-400 mb-4">
        Đây là giai đoạn chỉnh sửa bài báo dựa trên phản hồi của reviewer.
      </p>
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Section */}
          <div className="lg:col-span-2">
            {/* Revision Paper Information */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <h3 className="text-xl font-bold mb-4">Thông tin Revision Paper</h3>
              {revisionPaper ? (
                <div className="space-y-2">
                  <p className="text-gray-400">
                    <span className="font-medium text-white">Revision Paper ID:</span> {revisionPaper.revisionPaperId}
                  </p>
                  {revisionPaper.title && (
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Tiêu đề:</span> {revisionPaper.title}
                    </p>
                  )}
                  {revisionPaper.description && (
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Mô tả:</span> {revisionPaper.description}
                    </p>
                  )}
                  <p className="text-gray-400">
                    <span className="font-medium text-white">Revision Round:</span> {revisionPaper.revisionRound || 1}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium text-white">Overall Status:</span> {revisionPaper.overallStatus || 'Đang xử lý'}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium text-white">Số submissions:</span> {revisionPaper.submissions?.length || 0}
                  </p>
                  {revisionPaper.created && (
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Ngày tạo:</span> {new Date(revisionPaper.created).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                  {revisionPaper.reviewedAt && (
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Ngày đánh giá:</span> {new Date(revisionPaper.reviewedAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">Chưa có thông tin revision paper</p>
              )}
            </div>

            {/* New Submission Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <h3 className="text-lg font-bold mb-4">Nộp Submission Mới</h3>

              {/* Deadline Information */}
              {revisionDeadline && revisionDeadline.length > 0 && (
                <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Thông tin Deadline</h4>
                  {revisionValidation.formattedPeriod && (
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-medium">Thời gian nộp:</span> {revisionValidation.formattedPeriod}
                    </p>
                  )}
                  <div className={`text-sm font-medium ${revisionValidation.isAvailable ? 'text-green-400' :
                    revisionValidation.isExpired ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                    {revisionValidation.message}
                  </div>
                  {revisionValidation.daysRemaining && (
                    <div className="text-sm text-blue-400 mt-1">
                      Còn {revisionValidation.daysRemaining} ngày
                    </div>
                  )}
                  {revisionValidation.daysUntilStart && (
                    <div className="text-sm text-yellow-400 mt-1">
                      Còn {revisionValidation.daysUntilStart} ngày nữa mới có thể nộp
                    </div>
                  )}
                </div>
              )}

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
                    disabled={!revisionValidation.isAvailable}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    disabled={!revisionValidation.isAvailable}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chọn file revision paper
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={!revisionValidation.isAvailable}
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-400 mt-1">
                      File đã chọn: {selectedFile.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSubmitNewSubmission}
                  disabled={!revisionValidation.isAvailable || !selectedFile || !title.trim() || !description.trim() || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Đang nộp...' : 'Nộp Submission'}
                </button>
              </div>
            </div>

            {/* Submissions History */}
            {revisionPaper?.submissions && revisionPaper.submissions.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Lịch sử Submissions</h3>
                  <div className="text-sm text-gray-400">
                    {revisionPaper.submissions.length} submission{revisionPaper.submissions.length > 1 ? 's' : ''}
                  </div>
                </div>

                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation
                  pagination={{
                    clickable: true,
                    dynamicBullets: true
                  }}
                  onSwiper={setSwiperInstance}
                  className="submissions-swiper"
                >
                  {revisionPaper.submissions.map((submission, index) => (
                    <SwiperSlide key={submission.submissionId}>
                      <div className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">Submission #{index + 1}</h4>
                            <p className="text-xs text-gray-400 mt-1">ID: {submission.submissionId}</p>
                          </div>
                          {submission.feedbacks && submission.feedbacks.length > 0 && (
                            <button
                              onClick={() => setActiveSubmissionId(submission.submissionId)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>{submission.feedbacks.length} Feedback{submission.feedbacks.length > 1 ? 's từ Reviewer' : ''}</span>
                            </button>
                          )}
                        </div>

                        <div className="mb-4 space-y-2">
                          {submission.title && (
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-white">Tiêu đề:</span> {submission.title}
                            </p>
                          )}
                          {submission.description && (
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-white">Mô tả:</span> {submission.description}
                            </p>
                          )}
                        </div>

                        {submission.fileUrl && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-300 mb-2">File đã nộp:</p>
                            <div className="max-h-[60vh] overflow-auto border border-gray-600 rounded-lg">
                              <MemoizedDocViewer fileUrl={submission.fileUrl} />
                              {/* <DocViewer
                                                                documents={[{ uri: submission.fileUrl }]}
                                                                pluginRenderers={DocViewerRenderers}
                                                                config={{
                                                                    header: { disableHeader: true },
                                                                    pdfVerticalScrollByDefault: true,
                                                                }}
                                                                style={{ minHeight: "100%", borderRadius: 8 }}
                                                            /> */}
                            </div>
                          </div>
                        )}

                        {/* Feedback Dialog */}
                        {submission.feedbacks && submission.feedbacks.length > 0 && (
                          <MemoizedFeedbackDialog
                            isOpen={activeSubmissionId === submission.submissionId}
                            onClose={() => setActiveSubmissionId(null)}
                            submission={submission}
                            feedbackResponses={feedbackResponses}
                            onResponseChange={handleResponseChange}
                            onSubmitResponses={() => handleSubmitResponses(submission.submissionId)}
                            loading={loading}
                            canRespondToFeedback={canRespondToFeedback}
                            revisionValidation={revisionValidation}
                          />
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom styling cho Swiper navigation */}
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
            {/* {revisionPaper?.submissions && revisionPaper.submissions.length > 0 && (
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Lịch sử Submissions</h3>
                                <div className="space-y-4">
                                    {revisionPaper.submissions.map((submission, index) => (
                                        <div key={submission.submissionId} className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-lg">Submission #{index + 1}</h4>
                                                    <p className="text-xs text-gray-400 mt-1">ID: {submission.submissionId}</p>
                                                </div>
                                                {submission.feedbacks && submission.feedbacks.length > 0 && (
                                                    <button
                                                        onClick={() => setActiveSubmissionId(submission.submissionId)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span>{submission.feedbacks.length} Feedback{submission.feedbacks.length > 1 ? 's từ Reviewer' : ''}</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mb-4 space-y-2">
                                                {submission.title && (
                                                    <p className="text-sm text-gray-400">
                                                        <span className="font-medium text-white">Tiêu đề:</span> {submission.title}
                                                    </p>
                                                )}
                                                {submission.description && (
                                                    <p className="text-sm text-gray-400">
                                                        <span className="font-medium text-white">Mô tả:</span> {submission.description}
                                                    </p>
                                                )}
                                            </div>

                                            {submission.fileUrl && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-gray-300 mb-2">File đã nộp:</p>
                                                    <div className="max-h-[60vh] overflow-auto border border-gray-600 rounded-lg">
                                                        <DocViewer
                                                            documents={[{ uri: submission.fileUrl }]}
                                                            pluginRenderers={DocViewerRenderers}
                                                            config={{
                                                                header: { disableHeader: true },
                                                                pdfVerticalScrollByDefault: true,
                                                            }}
                                                            style={{ minHeight: "100%", borderRadius: 8 }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {submission.feedbacks && submission.feedbacks.length > 0 && (
                                                <FeedbackDialog
                                                    isOpen={activeSubmissionId === submission.submissionId}
                                                    onClose={() => setActiveSubmissionId(null)}
                                                    submission={submission}
                                                    feedbackResponses={feedbackResponses}
                                                    onResponseChange={handleResponseChange}
                                                    onSubmitResponses={() => handleSubmitResponses(submission.submissionId)}
                                                    loading={loading}
                                                    canRespondToFeedback={canRespondToFeedback}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
            {/* {revisionPaper?.submissions && revisionPaper.submissions.length > 0 && (
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Lịch sử Submissions</h3>
                                <div className="space-y-6">
                                    {revisionPaper.submissions.map((submission, index) => (
                                        <div key={submission.submissionId} className="border border-gray-600 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-semibold">Submission #{index + 1}</h4>
                                            </div>

                                            <div className="mb-4 space-y-2">
                                                <p className="text-sm text-gray-400">
                                                    <span className="font-medium text-white">Submission ID:</span> {submission.submissionId}
                                                </p>
                                                {submission.title && (
                                                    <p className="text-sm text-gray-400">
                                                        <span className="font-medium text-white">Tiêu đề:</span> {submission.title}
                                                    </p>
                                                )}
                                                {submission.description && (
                                                    <p className="text-sm text-gray-400">
                                                        <span className="font-medium text-white">Mô tả:</span> {submission.description}
                                                    </p>
                                                )}
                                            </div>

                                            {submission.fileUrl && (
                                                <div className="mb-4">
                                                    <div className="max-h-[80vh] overflow-auto">
                                                        <DocViewer
                                                            documents={[{ uri: submission.fileUrl }]}
                                                            pluginRenderers={DocViewerRenderers}
                                                            config={{
                                                                header: { disableHeader: true },
                                                                pdfVerticalScrollByDefault: true,
                                                            }}
                                                            style={{ minHeight: "100%", borderRadius: 8 }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                    
                                            {submission.feedbacks && submission.feedbacks.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium mb-3">Feedbacks:</h5>
                                                    <div className="space-y-4">
                                                        {submission.feedbacks.map((feedback) => (
                                                            <div key={feedback.feedbackId} className="bg-gray-700 p-4 rounded-lg">
                                                                <div className="mb-3">
                                                                    <span className="text-xs text-gray-400">Feedback #{feedback.order}</span>
                                                                    <p className="text-sm mt-1">{feedback.feedBack || 'Chưa có feedback'}</p>
                                                                </div>

                                                                {canRespondToFeedback(feedback) && (
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                                                            Phản hồi của bạn:
                                                                        </label>
                                                                        <textarea
                                                                            value={feedbackResponses[feedback.feedbackId] || feedback.response || ''}
                                                                            onChange={(e) => handleResponseChange(feedback.feedbackId, e.target.value)}
                                                                            placeholder="Nhập phản hồi cho feedback này..."
                                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                            rows={3}
                                                                            // disabled={feedback.response && !feedbackResponses[feedback.feedbackId]}
                                                                            disabled={!!(feedback.response && !feedbackResponses[feedback.feedbackId])}
                                                                        />
                                                                        {feedback.response && !feedbackResponses[feedback.feedbackId] && (
                                                                            <p className="text-xs text-green-400 mt-1">Đã phản hồi</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {submission.feedbacks.some(f => canRespondToFeedback(f) && !f.response) && (
                                                        <button
                                                            onClick={() => handleSubmitResponses(submission.submissionId)}
                                                            disabled={loading}
                                                            className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4">Hướng dẫn</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">Quy trình Revision</h4>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Đọc feedback từ reviewer</li>
                    <li>Chỉnh sửa bài báo theo feedback</li>
                    <li>Nộp submission mới</li>
                    <li>Trả lời feedback (nếu có)</li>
                  </ol>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">Lưu ý</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Có thể nộp nhiều submission</li>
                    <li>• Chỉ trả lời feedback khi có nội dung</li>
                    <li>• File chấp nhận: PDF, DOC, DOCX</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionPhase;
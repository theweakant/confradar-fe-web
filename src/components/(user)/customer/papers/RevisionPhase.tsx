import { useState } from 'react';
import { usePaperCustomer } from '@/redux/hooks/paper/usePaper';
import { RevisionPaper, RevisionSubmission, RevisionSubmissionFeedback } from '@/types/paper.type';

interface RevisionPhaseProps {
    paperId: string;
    revisionPaper: RevisionPaper | null;
}

const RevisionPhase: React.FC<RevisionPhaseProps> = ({ paperId, revisionPaper }) => {
    const { handleSubmitPaperRevision, handleSubmitPaperRevisionResponse, loading } = usePaperCustomer();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [feedbackResponses, setFeedbackResponses] = useState<{ [key: string]: string }>({});
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleResponseChange = (feedbackId: string, response: string) => {
        setFeedbackResponses(prev => ({
            ...prev,
            [feedbackId]: response
        }));
    };

    const handleSubmitNewSubmission = async () => {
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
        } catch (error: any) {
            let errorMessage = "Có lỗi xảy ra khi nộp revision paper";

            if (error?.data?.Message) {
                errorMessage = error.data.Message;
            } else if (error?.data?.Errors) {
                const errors = Object.values(error.data.Errors);
                errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
            }

            alert(errorMessage);
        }
    };

    const handleSubmitResponses = async (submissionId: string) => {
        const submission = revisionPaper?.submissions.find(s => s.submissionId === submissionId);
        if (!submission || !paperId) {
            alert("Không tìm thấy submission hoặc Paper ID");
            return;
        }

        const responses = submission.feedbacks
            .filter(feedback => feedback.feedBack && feedbackResponses[feedback.feedbackId])
            .map(feedback => ({
                revisionSubmissionFeedbackId: feedback.feedbackId,
                response: feedbackResponses[feedback.feedbackId]
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
            // Reload page to refresh data
            // window.location.reload();
        } catch (error: any) {
            let errorMessage = "Có lỗi xảy ra khi gửi phản hồi";

            if (error?.data?.Message) {
                errorMessage = error.data.Message;
            } else if (error?.data?.Errors) {
                const errors = Object.values(error.data.Errors);
                errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
            }

            alert(errorMessage);
        }
    };

    // Check if feedback has content to allow response input
    const canRespondToFeedback = (feedback: RevisionSubmissionFeedback) => {
        return feedback.feedBack && feedback.feedBack.trim().length > 0;
    };
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
                                    disabled={!selectedFile || !title.trim() || !description.trim() || loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    {loading ? 'Đang nộp...' : 'Nộp Submission'}
                                </button>
                            </div>
                        </div>

                        {/* Submissions History */}
                        {revisionPaper?.submissions && revisionPaper.submissions.length > 0 && (
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Lịch sử Submissions</h3>
                                <div className="space-y-6">
                                    {revisionPaper.submissions.map((submission, index) => (
                                        <div key={submission.submissionId} className="border border-gray-600 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-semibold">Submission #{index + 1}</h4>
                                                <span className="text-sm text-gray-400">
                                                    Round {submission.revisionDeadline?.roundNumher || 'N/A'}
                                                </span>
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
                                                    <a
                                                        href={submission.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                                    >
                                                        Xem file submission
                                                    </a>
                                                </div>
                                            )}

                                            {submission.revisionDeadline?.deadline && (
                                                <p className="text-sm text-gray-400 mb-4">
                                                    Deadline: {new Date(submission.revisionDeadline.deadline).toLocaleDateString('vi-VN')}
                                                </p>
                                            )}

                                            {/* Feedbacks */}
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

                                                    {/* Submit Response Button */}
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
                        )}
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
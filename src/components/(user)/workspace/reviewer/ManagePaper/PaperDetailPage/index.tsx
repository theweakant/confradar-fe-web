"use client";

import { useParams } from "next/navigation";
import { FileText, Clock, Download, AlertCircle, CheckCircle, XCircle, Send, Gavel, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";
import {
  useGetPaperDetailForReviewerQuery,
  useGetFullPaperReviewsQuery,
  useSubmitFullPaperReviewMutation,
  useDecideFullPaperStatusMutation,
  useSubmitPaperRevisionFeedbackMutation,
  useSubmitPaperRevisionReviewMutation,
  useListRevisionPaperReviewsQuery,
  useDecideRevisionStatusMutation,
} from "@/redux/services/paper.service";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";

// Component for Revision Reviews List
function RevisionReviewsList({ 
  paperId, 
  revisionPaperId, 
  submissionId,
  isExpanded, 
  onToggle,
  getStatusIcon,
  getStatusColor 
}: {
  paperId: string;
  revisionPaperId: string;
  submissionId: string;
  isExpanded: boolean;
  onToggle: () => void;
  getStatusIcon: (status?: string) => React.ReactNode;
  getStatusColor: (status?: string) => string;
}) {
  const { data: revisionReviews, isLoading } = useListRevisionPaperReviewsQuery(
    { revisionPaperId, paperId },
    { skip: !isExpanded }
  );

  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-900">
            Các đánh giá từ Reviewer khác
          </span>
          {revisionReviews?.data && (
            <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs font-medium">
              {revisionReviews.data.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-purple-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-purple-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Đang tải đánh giá...</p>
            </div>
          ) : revisionReviews?.data?.length ? (
            revisionReviews.data.map((review) => (
              <div
                key={review.revisionPaperReviewId}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0">
                    {review.reviewerAvatarUrl ? (
                      <img
                        src={review.reviewerAvatarUrl}
                        alt={review.reviewerName || "Reviewer"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "R"}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">
                        {review.reviewerName || "N/A"}
                      </p>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}>
                        {getStatusIcon(review.globalStatusName)}
                        {review.globalStatusName}
                      </span>
                    </div>
                    {review.createdAt && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(review.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                {review.note && (
                  <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">
                      Ghi chú nội bộ:
                    </p>
                    <p className="text-sm text-gray-700">
                      {review.note}
                    </p>
                  </div>
                )}

                {review.feedbackToAuthor && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Phản hồi tới tác giả:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.feedbackToAuthor}
                    </p>
                  </div>
                )}

                {review.feedbackMaterialUrl && (
                  <div className="pt-3 border-t">
                    <a
                      href={review.feedbackMaterialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Download className="w-4 h-4" />
                      Tải tài liệu đánh giá
                    </a>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-400">
                    Review ID: {review.revisionPaperReviewId}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
              Chưa có đánh giá nào từ Reviewer
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewPaperPage() {
  const params = useParams();
  const paperId = params.paperId as string;

  const { data, isLoading, error } = useGetPaperDetailForReviewerQuery(paperId);
  const paperDetail = data?.data;

  // Tab state
  const [activeTab, setActiveTab] = useState<"fullPaper" | "revision">("fullPaper");

  // Full Paper Form states
  const [note, setNote] = useState("");
  const [feedbackToAuthor, setFeedbackToAuthor] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Accepted");
  const [file, setFile] = useState<File | null>(null);

  // Revision Paper Review Form states - keyed by submission ID
  const [revisionReviews, setRevisionReviews] = useState<{
    [key: string]: {
      note: string;
      feedbackToAuthor: string;
      globalStatus: string;
      file: File | null;
    };
  }>({});

  // Revision Paper Feedback Form states - keyed by submission ID
  const [revisionFeedbacks, setRevisionFeedbacks] = useState<{
    [key: string]: Array<{ feedback: string; sortOrder: number }>;
  }>({});

  // State to track which submissions have expanded reviews list
  const [expandedReviewsSubmissions, setExpandedReviewsSubmissions] = useState<{
    [key: string]: boolean;
  }>({});

  // Popup state for Head Reviewer decision
  const [showDecisionPopup, setShowDecisionPopup] = useState(false);
  const [decisionStatus, setDecisionStatus] = useState("Accepted");
  
  // Popup state for Head Reviewer decision - Revision
  const [showRevisionDecisionPopup, setShowRevisionDecisionPopup] = useState(false);
  const [revisionDecisionStatus, setRevisionDecisionStatus] = useState("Pending");

  // Mutations
  const [submitReview, { isLoading: isSubmitting }] = useSubmitFullPaperReviewMutation();
  const [decideStatus, { isLoading: isDeciding }] = useDecideFullPaperStatusMutation();
  const [decideRevisionStatus, { isLoading: isDecidingRevision }] = useDecideRevisionStatusMutation();
  const [submitRevisionReview, { isLoading: isSubmittingRevisionReview }] = useSubmitPaperRevisionReviewMutation();
  const [submitRevisionFeedback, { isLoading: isSubmittingRevision }] = useSubmitPaperRevisionFeedbackMutation();

  // Get reviews for Head Reviewer
  const { data: fullReviews } = useGetFullPaperReviewsQuery(
    paperDetail?.isHeadReviewer ? paperDetail?.fullPaper?.fullPaperId ?? "" : "",
    { skip: !paperDetail?.isHeadReviewer || !paperDetail?.fullPaper?.fullPaperId }
  );

  // Toggle function for expanding/collapsing reviews
  const toggleReviewsExpansion = (submissionId: string) => {
    setExpandedReviewsSubmissions(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId],
    }));
  };

  const handleSubmitReview = async () => {
    if (!paperDetail?.fullPaper) return;
    try {
      const response = await submitReview({
        fullPaperId: paperDetail.fullPaper.fullPaperId,
        note,
        feedbackToAuthor,
        reviewStatus,
        feedbackMaterialFile: file!,
      }).unwrap();
      toast.success( "Gửi đánh giá thành công");
      setNote("");
      setFeedbackToAuthor("");
      setFile(null);
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err?.Message || "Lỗi khi gửi đánh giá";
      toast.error(errorMessage);
    }
  };

  const handleSubmitRevisionReview = async (submissionId: string) => {
    if (!paperDetail?.revisionPaper) return;
    
    const reviewData = revisionReviews[submissionId];
    if (!reviewData) {
      toast.error("Vui lòng nhập thông tin đánh giá");
      return;
    }

    try {
      const response = await submitRevisionReview({
        paperId,
        revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
        revisionPaperSubmissionId: submissionId,
        globalStatus: reviewData.globalStatus,
        note: reviewData.note,
        feedbackToAuthor: reviewData.feedbackToAuthor,
        feedbackMaterialFile: reviewData.file || undefined,
      }).unwrap();
      
      toast.success("Gửi đánh giá revision thành công");
      
      // Clear the form for this submission
      setRevisionReviews(prev => {
        const updated = { ...prev };
        delete updated[submissionId];
        return updated;
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err?.Message || "Lỗi khi gửi revision review";
      toast.error(errorMessage);
    }
  };

  const handleSubmitRevisionFeedback = async (submissionId: string) => {
    if (!paperDetail?.revisionPaper) return;
    
    const feedbacks = revisionFeedbacks[submissionId];
    if (!feedbacks || feedbacks.length === 0) {
      toast.error("Vui lòng nhập ít nhất một feedback");
      return;
    }

    try {
      const response = await submitRevisionFeedback({
        paperId,
        revisionPaperSubmissionId: submissionId,
        feedbacks: feedbacks.map(f => ({
          feedback: f.feedback,
          sortOrder: f.sortOrder,
        })),
      }).unwrap();
      
      toast.success(response?.message || "Đã gửi thành công revision feedback");
      
      // Clear feedbacks for this submission
      setRevisionFeedbacks(prev => ({
        ...prev,
        [submissionId]: [],
      }));
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err?.Message || "Lỗi khi gửi revision feedback";
      toast.error(errorMessage);
    }
  };

  // Revision Review helpers
  const updateRevisionReview = (
    submissionId: string,
    field: string,
    value: string | boolean | File | null
  ) => {
    setRevisionReviews((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] || {
          note: "",
          feedbackToAuthor: "",
          globalStatus: "Accepted",
          file: null,
        }),
        [field]: value,
      },
    }));
  };

  const getRevisionReview = (submissionId: string) => {
    return revisionReviews[submissionId] || {
      note: "",
      feedbackToAuthor: "",
      globalStatus: "Accepted",
      file: null,
    };
  };

  const addFeedbackField = (submissionId: string) => {
    setRevisionFeedbacks(prev => {
      const current = prev[submissionId] || [];
      const nextSortOrder = current.length + 1;
      return {
        ...prev,
        [submissionId]: [...current, { feedback: "", sortOrder: nextSortOrder }],
      };
    });
  };

  const updateFeedback = (submissionId: string, index: number, value: string) => {
    setRevisionFeedbacks(prev => {
      const current = prev[submissionId] || [];
      const updated = [...current];
      updated[index] = { ...updated[index], feedback: value };
      return {
        ...prev,
        [submissionId]: updated,
      };
    });
  };

  const removeFeedback = (submissionId: string, index: number) => {
    setRevisionFeedbacks(prev => {
      const current = prev[submissionId] || [];
      const updated = current.filter((_, i) => i !== index);
      // Re-index sortOrder
      const reIndexed = updated.map((f, i) => ({ ...f, sortOrder: i + 1 }));
      return {
        ...prev,
        [submissionId]: reIndexed,
      };
    });
  };

  const handleDecideStatus = async () => {
    if (!paperDetail?.fullPaper) return;
    try {
      const response = await decideStatus({
        paperId,
        fullPaperId: paperDetail.fullPaper.fullPaperId,
        reviewStatus: decisionStatus,
      }).unwrap();
      toast.success("Cập nhật trạng thái thành công");
      setShowDecisionPopup(false);
    } catch (error: unknown) {
        const apiError = error as ApiError; 
        const errorMessage =apiError?.Message ||"Lỗi khi cập nhật trạng thái";
        toast.error(errorMessage);
      }
  };

  const handleDecideRevisionStatus = async () => {
    if (!paperDetail?.revisionPaper) return;
    try {
      const response = await decideRevisionStatus({
        revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
        paperId,
        globalStatus: revisionDecisionStatus,
      }).unwrap();
      toast.success("Cập nhật trạng thái revision thành công");
      setShowRevisionDecisionPopup(false);
      } catch (error: unknown) {
        const err = error as ApiError;
        toast.error(err.Message || "Lỗi khi cập nhật trạng thái revision");
      }
  };

  const getStatusIcon = (statusName?: string) => {
    if (!statusName) return <Clock className="w-5 h-5 text-gray-600" />;
    const normalizedStatus = statusName.toLowerCase();
    if (normalizedStatus === "accepted") {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (normalizedStatus === "rejected") {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else if (normalizedStatus === "pending") {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (statusName?: string) => {
    if (!statusName) return "bg-gray-100 text-gray-800 border-gray-200";
    const normalizedStatus = statusName.toLowerCase();
    if (normalizedStatus === "accepted") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (normalizedStatus === "rejected") {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (normalizedStatus === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết bài báo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải chi tiết bài báo</p>
        </div>
      </div>
    );
  }

  // No data
  if (!paperDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin bài báo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Paper Detail Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Header */}
          <div className="pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Chi tiết bài báo
            </h2>
            <p className="text-sm text-gray-500 mt-1">Paper ID: {paperId}</p>
          </div>

          {/* Role Badge with Decision Button */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-200 rounded-full text-xs">
                  {paperDetail.isHeadReviewer ? "HEAD REVIEWER" : "REVIEWER"}
                </span>
                {paperDetail.isHeadReviewer 
                  ? "Bạn là Head Reviewer cho bài báo này"
                  : "Bạn là Reviewer cho bài báo này"}
              </p>
              
              {paperDetail.isHeadReviewer && (
                <>
                  {activeTab === "fullPaper" && paperDetail.fullPaper && (
                    <Button 
                      onClick={() => setShowDecisionPopup(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Quyết định cuối cùng
                    </Button>
                  )}
                  
                  {activeTab === "revision" && paperDetail.revisionPaper && (
                    <Button 
                      onClick={() => setShowRevisionDecisionPopup(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Quyết định cuối cùng
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("fullPaper")}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === "fullPaper"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Full Paper
                </div>
              </button>
              <button
                onClick={() => setActiveTab("revision")}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === "revision"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Revision Paper
                  {/* {paperDetail.revisionPaper && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                      Round {paperDetail.revisionPaper.revisionRound}
                    </span>
                  )} */}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pt-4">
            {activeTab === "fullPaper" && (
              <>
                {/* Full Paper Section */}
                {paperDetail.fullPaper ? (
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Full Paper
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-gray-600">Trạng thái Review:</span>
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paperDetail.fullPaper.reviewStatusName)}`}>
                            {getStatusIcon(paperDetail.fullPaper.reviewStatusName)}
                            {paperDetail.fullPaper.reviewStatusName}
                          </span>
                        </div>

                        <div className="pt-3 border-t">
                          <a
                            href={paperDetail.fullPaper.fullPaperUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Tải xuống Full Paper
                          </a>
                        </div>
                      </div>

                      {/* Review Section */}
                      <div className="pt-6 border-t">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Phần đánh giá Full Paper
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ghi chú nội bộ
                            </label>
                            <textarea
                              placeholder="Nhập ghi chú nội bộ..."
                              className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phản hồi tới tác giả
                            </label>
                            <textarea
                              placeholder="Nhập phản hồi cho tác giả..."
                              className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={feedbackToAuthor}
                              onChange={(e) => setFeedbackToAuthor(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Trạng thái đánh giá
                            </label>
                            <select
                              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                              value={reviewStatus}
                              onChange={(e) => setReviewStatus(e.target.value)}
                            >
                              <option value="Accepted">Accepted</option>
                              <option value="Revise">Revise</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tài liệu đánh giá (nếu có)
                            </label>
                            <input
                              type="file"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                          </div>

                          <Button 
                            onClick={handleSubmitReview} 
                            disabled={isSubmitting}
                            className="w-full bg-black hover:bg-gray-800"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Reviews from Reviewers - Only for Head Reviewer */}
                    {paperDetail.isHeadReviewer && paperDetail.fullPaper && (
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          Các đánh giá từ Reviewer khác
                        </h3>
                        {fullReviews?.data?.length ? (
                          <div className="space-y-4">
                            {fullReviews.data.map((review) => (
                              <div
                                key={review.fullPaperReviewId}
                                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0">
                                    {review.reviewerAvatarUrl ? (
                                      <img
                                        src={review.reviewerAvatarUrl}
                                        alt={review.reviewerName || "Reviewer"}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                        {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "R"}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-semibold text-gray-900">
                                        {review.reviewerName || "N/A"}
                                      </p>
                                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}>
                                        {getStatusIcon(review.globalStatusName)}
                                        {review.globalStatusName}
                                      </span>
                                    </div>
                                    {review.createdAt && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {formatDate(review.createdAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {review.note && (
                                  <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                    <p className="text-xs font-semibold text-yellow-800 mb-1">
                                      Ghi chú nội bộ:
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {review.note}
                                    </p>
                                  </div>
                                )}

                                {review.feedbackToAuthor && (
                                  <div className="mb-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                      Phản hồi tới tác giả:
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {review.feedbackToAuthor}
                                    </p>
                                  </div>
                                )}

                                {review.feedbackMaterialUrl && (
                                  <div className="pt-3 border-t">
                                    <a
                                      href={review.feedbackMaterialUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                      <Download className="w-4 h-4" />
                                      Tải tài liệu đánh giá
                                    </a>
                                  </div>
                                )}

                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-gray-400">
                                    Review ID: {review.fullPaperReviewId}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
                            Chưa có đánh giá nào từ Reviewer
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600">Chưa có thông tin Full Paper</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "revision" && (
              <>
                {/* Revision Paper Section */}
                {paperDetail.revisionPaper ? (
                  <div className="space-y-6">
                    {/* Revision Submissions with Review & Feedback Forms */}
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Các Round Revision
                      </h3>

                      {/* Overall Status */}
                      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Trạng thái tổng thể:</span>
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paperDetail.revisionPaper.globalStatusName)}`}>
                            {getStatusIcon(paperDetail.revisionPaper.globalStatusName)}
                            {paperDetail.revisionPaper.globalStatusName}
                          </span>
                        </div>
                      </div>

                      {/* Revision Submissions */}
                      <div className="space-y-6">
                        {paperDetail.revisionPaper.revisionPaperSubmissions.map((submission) => {
                          const reviewData = getRevisionReview(submission.revisionPaperSubmissionId);
                          
                          return (
                            <div
                              key={submission.revisionPaperSubmissionId}
                              className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 border-2 border-orange-200"
                            >
                              {/* Submission Header */}
                              <div className="flex items-center justify-between mb-4 pb-4 border-b border-orange-200">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">
                                    Round {submission.roundNumber}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Deadline: {formatDate(submission.endDate)}
                                  </p>
                                </div>
                                <a
                                  href={submission.revisionPaperUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                                >
                                  <Download className="w-4 h-4" />
                                  Tải xuống
                                </a>
                              </div>

                              {/* Previous Feedbacks */}
                              {submission.revisionSubmissionFeedbacks.length > 0 && (
                                <div className="mb-6">
                                  <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Feedbacks đã gửi
                                  </h5>
                                  <div className="space-y-2">
                                    {submission.revisionSubmissionFeedbacks.map((feedback) => (
                                      <div
                                        key={feedback.revisionSubmissionFeedbackId}
                                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                                      >
                                        <div className="flex items-start gap-3">
                                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                                            {feedback.sortOrder}
                                          </span>
                                          <div className="flex-1">
                                            <p className="text-sm text-gray-900 leading-relaxed">{feedback.feedback || "N/A"}</p>
                                            {feedback.response && (
                                              <div className="mt-3 pl-4 border-l-2 border-blue-300 bg-blue-50 p-3 rounded">
                                                <p className="text-xs text-gray-600">
                                                  <span className="font-semibold text-blue-700">Response:</span> {feedback.response}
                                                </p>
                                              </div>
                                            )}
                                            {feedback.createdAt && (
                                              <p className="text-xs text-gray-400 mt-2">
                                                {formatDate(feedback.createdAt)}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Reviews from Other Reviewers - Only for Head Reviewer */}
                              {paperDetail.isHeadReviewer && paperDetail.revisionPaper && (
                                <RevisionReviewsList
                                  paperId={paperId}
                                  revisionPaperId={paperDetail.revisionPaper.revisionPaperId}
                                  submissionId={submission.revisionPaperSubmissionId}
                                  isExpanded={expandedReviewsSubmissions[submission.revisionPaperSubmissionId] || false}
                                  onToggle={() => toggleReviewsExpansion(submission.revisionPaperSubmissionId)}
                                  getStatusIcon={getStatusIcon}
                                  getStatusColor={getStatusColor}
                                />
                              )}

                              {/* Review Form for this Submission */}
                              <div className="mb-6 bg-white rounded-lg p-5 border border-orange-300">
                                <h5 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Send className="w-4 h-4 text-orange-600" />
                                  Đánh giá cho Round {submission.roundNumber}
                                </h5>
                                
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Ghi chú nội bộ
                                    </label>
                                    <textarea
                                      placeholder="Nhập ghi chú nội bộ..."
                                      className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      value={reviewData.note}
                                      onChange={(e) => updateRevisionReview(submission.revisionPaperSubmissionId, 'note', e.target.value)}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Phản hồi tới tác giả
                                    </label>
                                    <textarea
                                      placeholder="Nhập phản hồi cho tác giả..."
                                      className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      value={reviewData.feedbackToAuthor}
                                      onChange={(e) => updateRevisionReview(submission.revisionPaperSubmissionId, 'feedbackToAuthor', e.target.value)}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Trạng thái đánh giá
                                    </label>
                                    <select
                                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-orange-500"
                                      value={reviewData.globalStatus}
                                      onChange={(e) => updateRevisionReview(submission.revisionPaperSubmissionId, 'globalStatus', e.target.value)}
                                    >
                                      <option value="Accepted">Accepted</option>
                                      <option value="Pending">Pending</option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Tài liệu đánh giá (nếu có)
                                    </label>
                                    <input
                                      type="file"
                                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                      onChange={(e) => updateRevisionReview(submission.revisionPaperSubmissionId, 'file', e.target.files?.[0] || null)}
                                    />
                                    {reviewData.file && (
                                      <p className="text-xs text-gray-600 mt-2">
                                        File đã chọn: {reviewData.file.name}
                                      </p>
                                    )}
                                  </div>

                                  <Button 
                                    onClick={() => handleSubmitRevisionReview(submission.revisionPaperSubmissionId)} 
                                    disabled={isSubmittingRevisionReview}
                                    className="w-full bg-orange-600 hover:bg-orange-700"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmittingRevisionReview ? "Đang gửi..." : "Gửi đánh giá"}
                                  </Button>
                                </div>
                              </div>

                              {/* Feedback Form for this Submission */}
                              <div className="bg-white rounded-lg p-5 border border-gray-300">
                                <h5 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  Gửi Feedback chi tiết cho Round {submission.roundNumber}
                                </h5>
                                
                                <div className="space-y-3">
                                  {(revisionFeedbacks[submission.revisionPaperSubmissionId] || []).map((feedback, index) => (
                                    <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-2">
                                        {feedback.sortOrder}
                                      </span>
                                      <textarea
                                        placeholder={`Nhập feedback #${feedback.sortOrder}...`}
                                        className="flex-1 border rounded-lg p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={feedback.feedback}
                                        onChange={(e) => updateFeedback(submission.revisionPaperSubmissionId, index, e.target.value)}
                                      />
                                      <button
                                        onClick={() => removeFeedback(submission.revisionPaperSubmissionId, index)}
                                        className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa feedback"
                                      >
                                        <XCircle className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ))}

                                  <Button
                                    onClick={() => addFeedbackField(submission.revisionPaperSubmissionId)}
                                    variant="outline"
                                    className="w-full border-dashed border-2 hover:bg-blue-50 hover:border-blue-300"
                                  >
                                    + Thêm feedback
                                  </Button>

                                  {(revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0) > 0 && (
                                    <Button
                                      onClick={() => handleSubmitRevisionFeedback(submission.revisionPaperSubmissionId)}
                                      disabled={isSubmittingRevision}
                                      className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      {isSubmittingRevision ? "Đang gửi..." : `Gửi ${revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0} feedback`}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600">Chưa có thông tin Revision Paper</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Decision Popup for Head Reviewer */}
      {showDecisionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-purple-600" />
              Quyết định cuối cùng - Full Paper
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn trạng thái
                </label>
                <select
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                  value={decisionStatus}
                  onChange={(e) => setDecisionStatus(e.target.value)}
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Revise">Revise</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDecisionPopup(false)}
                  className="flex-1"
                  disabled={isDeciding}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleDecideStatus}
                  disabled={isDeciding}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isDeciding ? "Đang xử lý..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Popup for Head Reviewer - Revision */}
      {showRevisionDecisionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-orange-600" />
              Quyết định cuối cùng - Revision Paper
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn trạng thái
                </label>
                <select
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                  value={revisionDecisionStatus}
                  onChange={(e) => setRevisionDecisionStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRevisionDecisionPopup(false)}
                  className="flex-1"
                  disabled={isDecidingRevision}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleDecideRevisionStatus}
                  disabled={isDecidingRevision}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {isDecidingRevision ? "Đang xử lý..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";

// import { useParams } from "next/navigation";
// import { FileText, Clock, Download, AlertCircle, CheckCircle, XCircle, Send, Gavel, ChevronDown, ChevronUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { formatDate } from "@/helper/format";
// import {
//   useGetPaperDetailForReviewerQuery,
//   useGetFullPaperReviewsQuery,
//   useSubmitFullPaperReviewMutation,
//   useDecideFullPaperStatusMutation,
//   useSubmitPaperRevisionFeedbackMutation,
//   useSubmitPaperRevisionReviewMutation,
//   useListRevisionPaperReviewsQuery,
//   useDecideRevisionStatusMutation,
// } from "@/redux/services/paper.service";
// import { useState } from "react";
// import { toast } from "sonner";

// // Component for Revision Reviews List
// function RevisionReviewsList({ 
//   paperId, 
//   revisionPaperId, 
//   submissionId,
//   isExpanded, 
//   onToggle,
//   getStatusIcon,
//   getStatusColor 
// }: {
//   paperId: string;
//   revisionPaperId: string;
//   submissionId: string;
//   isExpanded: boolean;
//   onToggle: () => void;
//   getStatusIcon: (status?: string) => React.ReactNode;
//   getStatusColor: (status?: string) => string;
// }) {
//   const { data: revisionReviews, isLoading } = useListRevisionPaperReviewsQuery(
//     { revisionPaperId, paperId },
//     { skip: !isExpanded }
//   );

//   return (
//     <div className="mb-6">
//       <button
//         onClick={onToggle}
//         className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
//       >
//         <div className="flex items-center gap-2">
//           <FileText className="w-5 h-5 text-purple-600" />
//           <span className="font-semibold text-purple-900">
//             Các đánh giá từ Reviewer khác
//           </span>
//           {revisionReviews?.data && (
//             <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs font-medium">
//               {revisionReviews.data.length}
//             </span>
//           )}
//         </div>
//         {isExpanded ? (
//           <ChevronUp className="w-5 h-5 text-purple-600" />
//         ) : (
//           <ChevronDown className="w-5 h-5 text-purple-600" />
//         )}
//       </button>

//       {isExpanded && (
//         <div className="mt-3 space-y-3">
//           {isLoading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
//               <p className="text-sm text-gray-600">Đang tải đánh giá...</p>
//             </div>
//           ) : revisionReviews?.data?.length ? (
//             revisionReviews.data.map((review) => (
//               <div
//                 key={review.revisionPaperReviewId}
//                 className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start gap-3 mb-3">
//                   <div className="flex-shrink-0">
//                     {review.reviewerAvatarUrl ? (
//                       <img
//                         src={review.reviewerAvatarUrl}
//                         alt={review.reviewerName || "Reviewer"}
//                         className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
//                         {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "R"}
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between gap-2">
//                       <p className="font-semibold text-gray-900">
//                         {review.reviewerName || "N/A"}
//                       </p>
//                       <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}>
//                         {getStatusIcon(review.globalStatusName)}
//                         {review.globalStatusName}
//                       </span>
//                     </div>
//                     {review.createdAt && (
//                       <p className="text-xs text-gray-500 mt-0.5">
//                         {formatDate(review.createdAt)}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {review.note && (
//                   <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
//                     <p className="text-xs font-semibold text-yellow-800 mb-1">
//                       Ghi chú nội bộ:
//                     </p>
//                     <p className="text-sm text-gray-700">
//                       {review.note}
//                     </p>
//                   </div>
//                 )}

//                 {review.feedbackToAuthor && (
//                   <div className="mb-3">
//                     <p className="text-xs font-semibold text-gray-600 mb-1">
//                       Phản hồi tới tác giả:
//                     </p>
//                     <p className="text-sm text-gray-700 leading-relaxed">
//                       {review.feedbackToAuthor}
//                     </p>
//                   </div>
//                 )}

//                 {review.feedbackMaterialUrl && (
//                   <div className="pt-3 border-t">
//                     <a
//                       href={review.feedbackMaterialUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
//                     >
//                       <Download className="w-4 h-4" />
//                       Tải tài liệu đánh giá
//                     </a>
//                   </div>
//                 )}

//                 <div className="mt-3 pt-3 border-t">
//                   <p className="text-xs text-gray-400">
//                     Review ID: {review.revisionPaperReviewId}
//                   </p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
//               Chưa có đánh giá nào từ Reviewer
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function ReviewPaperPage() {
//   const params = useParams();
//   const paperId = params.paperId as string;

//   const { data, isLoading, error } = useGetPaperDetailForReviewerQuery(paperId);
//   const paperDetail = data?.data;

//   // Tab state
//   const [activeTab, setActiveTab] = useState<"fullPaper" | "revision">("fullPaper");

//   // Full Paper Form states
//   const [note, setNote] = useState("");
//   const [feedbackToAuthor, setFeedbackToAuthor] = useState("");
//   const [reviewStatus, setReviewStatus] = useState("Accepted");
//   const [file, setFile] = useState<File | null>(null);

//   // Revision Paper Review Form states - SINGLE FORM for entire revision paper
//   const [revisionNote, setRevisionNote] = useState("");
//   const [revisionFeedbackToAuthor, setRevisionFeedbackToAuthor] = useState("");
//   const [revisionGlobalStatus, setRevisionGlobalStatus] = useState("Accepted");
//   const [revisionFile, setRevisionFile] = useState<File | null>(null);

//   // Revision Paper Feedback Form states - keyed by submission ID
//   const [revisionFeedbacks, setRevisionFeedbacks] = useState<{
//     [key: string]: Array<{ feedback: string; sortOrder: number }>;
//   }>({});

//   // State to track which submissions have expanded reviews list
//   const [expandedReviewsSubmissions, setExpandedReviewsSubmissions] = useState<{
//     [key: string]: boolean;
//   }>({});

//   // Popup state for Head Reviewer decision
//   const [showDecisionPopup, setShowDecisionPopup] = useState(false);
//   const [decisionStatus, setDecisionStatus] = useState("Accepted");
  
//   // Popup state for Head Reviewer decision - Revision
//   const [showRevisionDecisionPopup, setShowRevisionDecisionPopup] = useState(false);
//   const [revisionDecisionStatus, setRevisionDecisionStatus] = useState("Pending");

//   // Mutations
//   const [submitReview, { isLoading: isSubmitting }] = useSubmitFullPaperReviewMutation();
//   const [decideStatus, { isLoading: isDeciding }] = useDecideFullPaperStatusMutation();
//   const [decideRevisionStatus, { isLoading: isDecidingRevision }] = useDecideRevisionStatusMutation();
//   const [submitRevisionReview, { isLoading: isSubmittingRevisionReview }] = useSubmitPaperRevisionReviewMutation();
//   const [submitRevisionFeedback, { isLoading: isSubmittingRevision }] = useSubmitPaperRevisionFeedbackMutation();

//   // Get reviews for Head Reviewer
//   const { data: fullReviews } = useGetFullPaperReviewsQuery(
//     paperDetail?.isHeadReviewer ? paperDetail?.fullPaper?.fullPaperId ?? "" : "",
//     { skip: !paperDetail?.isHeadReviewer || !paperDetail?.fullPaper?.fullPaperId }
//   );

//   // Toggle function for expanding/collapsing reviews
//   const toggleReviewsExpansion = (submissionId: string) => {
//     setExpandedReviewsSubmissions(prev => ({
//       ...prev,
//       [submissionId]: !prev[submissionId],
//     }));
//   };

//   const handleSubmitReview = async () => {
//     if (!paperDetail?.fullPaper) return;
//     try {
//       const response = await submitReview({
//         fullPaperId: paperDetail.fullPaper.fullPaperId,
//         note,
//         feedbackToAuthor,
//         reviewStatus,
//         feedbackMaterialFile: file!,
//       }).unwrap();
//       toast.success("Gửi đánh giá thành công");
//       setNote("");
//       setFeedbackToAuthor("");
//       setFile(null);
//     } catch (error: any) {
//       const errorMessage = error?.data?.Message || error?.Message || "Lỗi khi gửi đánh giá";
//       toast.error(errorMessage);
//     }
//   };

//   const handleSubmitRevisionReview = async () => {
//     if (!paperDetail?.revisionPaper) return;

//     try {
//       const response = await submitRevisionReview({
//         paperId,
//         revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
//         globalStatus: revisionGlobalStatus,
//         note: revisionNote,
//         feedbackToAuthor: revisionFeedbackToAuthor,
//         feedbackMaterialFile: revisionFile || undefined,
//       }).unwrap();
      
//       toast.success("Gửi đánh giá revision thành công");
      
//       // Clear the form
//       setRevisionNote("");
//       setRevisionFeedbackToAuthor("");
//       setRevisionGlobalStatus("Accepted");
//       setRevisionFile(null);
//     } catch (error: any) {
//       const errorMessage = error?.data?.Message || error?.Message || "Lỗi khi gửi đánh giá revision";
//       toast.error(errorMessage);
//     }
//   };

//   const handleSubmitRevisionFeedback = async (submissionId: string) => {
//     if (!paperDetail?.revisionPaper) return;
    
//     const feedbacks = revisionFeedbacks[submissionId];
//     if (!feedbacks || feedbacks.length === 0) {
//       toast.error("Vui lòng nhập ít nhất một feedback");
//       return;
//     }

//     try {
//       const response = await submitRevisionFeedback({
//         paperId,
//         revisionPaperSubmissionId: submissionId,
//         feedbacks: feedbacks.map(f => ({
//           feedback: f.feedback,
//           sortOrder: f.sortOrder,
//         })),
//       }).unwrap();
      
//       toast.success(response?.message || "Đã gửi thành công revision feedback");
      
//       // Clear feedbacks for this submission
//       setRevisionFeedbacks(prev => ({
//         ...prev,
//         [submissionId]: [],
//       }));
//     } catch (error: any) {
//       const errorMessage = error?.data?.Message || error?.message || "Lỗi khi gửi revision feedback";
//       toast.error(errorMessage);
//     }
//   };

//   const addFeedbackField = (submissionId: string) => {
//     setRevisionFeedbacks(prev => {
//       const current = prev[submissionId] || [];
//       const nextSortOrder = current.length + 1;
//       return {
//         ...prev,
//         [submissionId]: [...current, { feedback: "", sortOrder: nextSortOrder }],
//       };
//     });
//   };

//   const updateFeedback = (submissionId: string, index: number, value: string) => {
//     setRevisionFeedbacks(prev => {
//       const current = prev[submissionId] || [];
//       const updated = [...current];
//       updated[index] = { ...updated[index], feedback: value };
//       return {
//         ...prev,
//         [submissionId]: updated,
//       };
//     });
//   };

//   const removeFeedback = (submissionId: string, index: number) => {
//     setRevisionFeedbacks(prev => {
//       const current = prev[submissionId] || [];
//       const updated = current.filter((_, i) => i !== index);
//       // Re-index sortOrder
//       const reIndexed = updated.map((f, i) => ({ ...f, sortOrder: i + 1 }));
//       return {
//         ...prev,
//         [submissionId]: reIndexed,
//       };
//     });
//   };

//   const handleDecideStatus = async () => {
//     if (!paperDetail?.fullPaper) return;
//     try {
//       const response = await decideStatus({
//         paperId,
//         fullPaperId: paperDetail.fullPaper.fullPaperId,
//         reviewStatus: decisionStatus,
//       }).unwrap();
//       toast.success("Cập nhật trạng thái thành công");
//       setShowDecisionPopup(false);
//     } catch (error: any) {
//       const errorMessage = error?.data?.Message || error?.Message || "Lỗi khi cập nhật trạng thái";
//       toast.error(errorMessage);
//     }
//   };

//   const handleDecideRevisionStatus = async () => {
//     if (!paperDetail?.revisionPaper) return;
//     try {
//       const response = await decideRevisionStatus({
//         revisionPaperId: paperDetail.revisionPaper.revisionPaperId,
//         paperId,
//         globalStatus: revisionDecisionStatus,
//       }).unwrap();
//       toast.success("Cập nhật trạng thái revision thành công");
//       setShowRevisionDecisionPopup(false);
//     } catch (error: any) {
//       const errorMessage = error?.data?.Message || error?.Message || "Lỗi khi cập nhật trạng thái revision";
//       toast.error(errorMessage);
//     }
//   };

//   const getStatusIcon = (statusName?: string) => {
//     if (!statusName) return <Clock className="w-5 h-5 text-gray-600" />;
//     const normalizedStatus = statusName.toLowerCase();
//     if (normalizedStatus === "accepted") {
//       return <CheckCircle className="w-5 h-5 text-green-600" />;
//     } else if (normalizedStatus === "rejected") {
//       return <XCircle className="w-5 h-5 text-red-600" />;
//     } else if (normalizedStatus === "pending") {
//       return <Clock className="w-5 h-5 text-yellow-600" />;
//     }
//     return <Clock className="w-5 h-5 text-gray-600" />;
//   };

//   const getStatusColor = (statusName?: string) => {
//     if (!statusName) return "bg-gray-100 text-gray-800 border-gray-200";
//     const normalizedStatus = statusName.toLowerCase();
//     if (normalizedStatus === "accepted") {
//       return "bg-green-100 text-green-800 border-green-200";
//     } else if (normalizedStatus === "rejected") {
//       return "bg-red-100 text-red-800 border-red-200";
//     } else if (normalizedStatus === "pending") {
//       return "bg-yellow-100 text-yellow-800 border-yellow-200";
//     }
//     return "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Đang tải chi tiết bài báo...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải chi tiết bài báo</p>
//         </div>
//       </div>
//     );
//   }

//   // No data
//   if (!paperDetail) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600 mb-4">Không tìm thấy thông tin bài báo</p>
//         </div>
//       </div>
//     );
//   }

//   // Check conditions for buttons
//   const canDecideFullPaper = paperDetail.fullPaper?.isAllSubmittedFullPaperReview ?? false;
//   const canDecideRevision = paperDetail.revisionPaper?.isAllSubmittedRevisionPaperReview ?? false;
//   const canSubmitRevisionReview = paperDetail.revisionPaper?.isAnsweredAllDiscussion ?? false;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Paper Detail Card */}
//         <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
//           {/* Header */}
//           <div className="pb-4 border-b">
//             <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <FileText className="w-6 h-6 text-blue-600" />
//               Chi tiết bài báo
//             </h2>
//             <p className="text-sm text-gray-500 mt-1">Paper ID: {paperId}</p>
//           </div>

//           {/* Role Badge with Decision Button */}
//           <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-medium text-purple-900 flex items-center gap-2">
//                 <span className="px-3 py-1 bg-purple-200 rounded-full text-xs">
//                   {paperDetail.isHeadReviewer ? "HEAD REVIEWER" : "REVIEWER"}
//                 </span>
//                 {paperDetail.isHeadReviewer 
//                   ? "Bạn là Head Reviewer cho bài báo này"
//                   : "Bạn là Reviewer cho bài báo này"}
//               </p>
              
//               {paperDetail.isHeadReviewer && (
//                 <>
//                   {activeTab === "fullPaper" && paperDetail.fullPaper && (
//                     <div className="relative group">
//                       <Button 
//                         onClick={() => setShowDecisionPopup(true)}
//                         disabled={!canDecideFullPaper}
//                         className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//                       >
//                         <Gavel className="w-4 h-4 mr-2" />
//                         Quyết định cuối cùng
//                       </Button>
//                       {!canDecideFullPaper && (
//                         <div className="absolute bottom-full mb-2 right-0 w-48 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
//                           Chưa đáp ứng đủ yêu cầu
//                         </div>
//                       )}
//                     </div>
//                   )}
                  
//                   {activeTab === "revision" && paperDetail.revisionPaper && (
//                     <div className="relative group">
//                       <Button 
//                         onClick={() => setShowRevisionDecisionPopup(true)}
//                         disabled={!canDecideRevision}
//                         className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//                       >
//                         <Gavel className="w-4 h-4 mr-2" />
//                         Quyết định cuối cùng
//                       </Button>
//                       {!canDecideRevision && (
//                         <div className="absolute bottom-full mb-2 right-0 w-48 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
//                           Chưa đáp ứng đủ yêu cầu
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Tab Navigation */}
//           <div className="border-b border-gray-200">
//             <div className="flex gap-1">
//               <button
//                 onClick={() => setActiveTab("fullPaper")}
//                 className={`px-6 py-3 text-sm font-medium transition-all relative ${
//                   activeTab === "fullPaper"
//                     ? "text-blue-600 border-b-2 border-blue-600"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   Full Paper
//                 </div>
//               </button>
//               <button
//                 onClick={() => setActiveTab("revision")}
//                 className={`px-6 py-3 text-sm font-medium transition-all relative ${
//                   activeTab === "revision"
//                     ? "text-orange-600 border-b-2 border-orange-600"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   Revision Paper
//                 </div>
//               </button>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="pt-4">
//             {activeTab === "fullPaper" && (
//               <>
//                 {/* Full Paper Section */}
//                 {paperDetail.fullPaper ? (
//                   <div className="space-y-6">
//                     <div className="bg-white border rounded-lg p-6">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                         <FileText className="w-5 h-5 text-blue-600" />
//                         Full Paper
//                       </h3>
                      
//                       <div className="space-y-3 mb-6">
//                         <div className="flex items-start justify-between">
//                           <span className="text-sm text-gray-600">Trạng thái Review:</span>
//                           <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paperDetail.fullPaper.reviewStatusName)}`}>
//                             {getStatusIcon(paperDetail.fullPaper.reviewStatusName)}
//                             {paperDetail.fullPaper.reviewStatusName}
//                           </span>
//                         </div>

//                         <div className="pt-3 border-t">
//                           <a
//                             href={paperDetail.fullPaper.fullPaperUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                           >
//                             <Download className="w-4 h-4" />
//                             Tải xuống Full Paper
//                           </a>
//                         </div>
//                       </div>

//                       {/* Review Section */}
//                       <div className="pt-6 border-t">
//                         <h4 className="text-md font-semibold text-gray-900 mb-4">
//                           Phần đánh giá Full Paper
//                         </h4>
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Ghi chú nội bộ
//                             </label>
//                             <textarea
//                               placeholder="Nhập ghi chú nội bộ..."
//                               className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               value={note}
//                               onChange={(e) => setNote(e.target.value)}
//                             />
//                           </div>

//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Phản hồi tới tác giả
//                             </label>
//                             <textarea
//                               placeholder="Nhập phản hồi cho tác giả..."
//                               className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               value={feedbackToAuthor}
//                               onChange={(e) => setFeedbackToAuthor(e.target.value)}
//                             />
//                           </div>

//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Trạng thái đánh giá
//                             </label>
//                             <select
//                               className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
//                               value={reviewStatus}
//                               onChange={(e) => setReviewStatus(e.target.value)}
//                             >
//                               <option value="Accepted">Accepted</option>
//                               <option value="Revise">Revise</option>
//                               <option value="Rejected">Rejected</option>
//                             </select>
//                           </div>

//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Tài liệu đánh giá (nếu có)
//                             </label>
//                             <input
//                               type="file"
//                               className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                               onChange={(e) => setFile(e.target.files?.[0] || null)}
//                             />
//                           </div>

//                           <Button 
//                             onClick={handleSubmitReview} 
//                             disabled={isSubmitting}
//                             className="w-full bg-black hover:bg-gray-800"
//                           >
//                             <Send className="w-4 h-4 mr-2" />
//                             {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
//                           </Button>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Reviews from Reviewers - Only for Head Reviewer */}
//                     {paperDetail.isHeadReviewer && paperDetail.fullPaper && (
//                       <div className="bg-white border rounded-lg p-6">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                           <FileText className="w-5 h-5 text-purple-600" />
//                           Các đánh giá từ Reviewer khác
//                         </h3>
//                         {fullReviews?.data?.length ? (
//                           <div className="space-y-4">
//                             {fullReviews.data.map((review) => (
//                               <div
//                                 key={review.fullPaperReviewId}
//                                 className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
//                               >
//                                 <div className="flex items-start gap-3 mb-3">
//                                   <div className="flex-shrink-0">
//                                     {review.reviewerAvatarUrl ? (
//                                       <img
//                                         src={review.reviewerAvatarUrl}
//                                         alt={review.reviewerName || "Reviewer"}
//                                         className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                                       />
//                                     ) : (
//                                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
//                                         {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "R"}
//                                       </div>
//                                     )}
//                                   </div>
                                  
//                                   <div className="flex-1 min-w-0">
//                                     <div className="flex items-center justify-between gap-2">
//                                       <p className="font-semibold text-gray-900">
//                                         {review.reviewerName || "N/A"}
//                                       </p>
//                                       <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}>
//                                         {getStatusIcon(review.globalStatusName)}
//                                         {review.globalStatusName}
//                                       </span>
//                                     </div>
//                                     {review.createdAt && (
//                                       <p className="text-xs text-gray-500 mt-0.5">
//                                         {formatDate(review.createdAt)}
//                                       </p>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {review.note && (
//                                   <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
//                                     <p className="text-xs font-semibold text-yellow-800 mb-1">
//                                       Ghi chú nội bộ:
//                                     </p>
//                                     <p className="text-sm text-gray-700">
//                                       {review.note}
//                                     </p>
//                                   </div>
//                                 )}

//                                 {review.feedbackToAuthor && (
//                                   <div className="mb-3">
//                                     <p className="text-xs font-semibold text-gray-600 mb-1">
//                                       Phản hồi tới tác giả:
//                                     </p>
//                                     <p className="text-sm text-gray-700 leading-relaxed">
//                                       {review.feedbackToAuthor}
//                                     </p>
//                                   </div>
//                                 )}

//                                 {review.feedbackMaterialUrl && (
//                                   <div className="pt-3 border-t">
//                                     <a
//                                       href={review.feedbackMaterialUrl}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
//                                     >
//                                       <Download className="w-4 h-4" />
//                                       Tải tài liệu đánh giá
//                                     </a>
//                                   </div>
//                                 )}

//                                 <div className="mt-3 pt-3 border-t">
//                                   <p className="text-xs text-gray-400">
//                                     Review ID: {review.fullPaperReviewId}
//                                   </p>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
//                             Chưa có đánh giá nào từ Reviewer
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12 bg-gray-50 rounded-lg">
//                     <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                     <p className="text-gray-600">Chưa có thông tin Full Paper</p>
//                   </div>
//                 )}
//               </>
//             )}

//             {activeTab === "revision" && (
//               <>
//                 {/* Revision Paper Section */}
//                 {paperDetail.revisionPaper ? (
//                   <div className="space-y-6">
//                     {/* Overall Status */}
//                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm font-medium text-gray-700">Trạng thái tổng thể:</span>
//                         <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paperDetail.revisionPaper.globalStatusName)}`}>
//                           {getStatusIcon(paperDetail.revisionPaper.globalStatusName)}
//                           {paperDetail.revisionPaper.globalStatusName}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Revision Paper Review Form - MOVED OUTSIDE OF ROUNDS */}
//                     <div className="bg-white border-2 border-orange-300 rounded-lg p-6">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                         <Send className="w-5 h-5 text-orange-600" />
//                         Đánh giá Revision Paper
//                       </h3>
                      
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Ghi chú nội bộ
//                           </label>
//                           <textarea
//                             placeholder="Nhập ghi chú nội bộ..."
//                             className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                             value={revisionNote}
//                             onChange={(e) => setRevisionNote(e.target.value)}
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Phản hồi tới tác giả
//                           </label>
//                           <textarea
//                             placeholder="Nhập phản hồi cho tác giả..."
//                             className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                             value={revisionFeedbackToAuthor}
//                             onChange={(e) => setRevisionFeedbackToAuthor(e.target.value)}
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Trạng thái đánh giá
//                           </label>
//                           <select
//                             className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-orange-500"
//                             value={revisionGlobalStatus}
//                             onChange={(e) => setRevisionGlobalStatus(e.target.value)}
//                           >
//                             <option value="Accepted">Accepted</option>
//                             <option value="Pending">Pending</option>
//                             <option value="Rejected">Rejected</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Tài liệu đánh giá (nếu có)
//                           </label>
//                           <input
//                             type="file"
//                             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
//                             onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
//                           />
//                           {revisionFile && (
//                             <p className="text-xs text-gray-600 mt-2">
//                               File đã chọn: {revisionFile.name}
//                             </p>
//                           )}
//                         </div>

//                         <div className="relative group">
//                           <Button 
//                             onClick={handleSubmitRevisionReview} 
//                             disabled={isSubmittingRevisionReview || !canSubmitRevisionReview}
//                             className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//                           >
//                             <Send className="w-4 h-4 mr-2" />
//                             {isSubmittingRevisionReview ? "Đang gửi..." : "Gửi đánh giá"}
//                           </Button>
//                           {!canSubmitRevisionReview && (
//                             <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
//                               Chưa đáp ứng đủ yêu cầu
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Reviews from Other Reviewers - Only for Head Reviewer */}
//                     {paperDetail.isHeadReviewer && paperDetail.revisionPaper && (
//                       <div className="bg-white border rounded-lg p-6">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                           <FileText className="w-5 h-5 text-purple-600" />
//                           Các đánh giá từ Reviewer khác
//                         </h3>
//                         <div className="space-y-4">
//                           {paperDetail.revisionPaper.revisionPaperSubmissions[0]?.revisionPaperReviews?.length ? (
//                             paperDetail.revisionPaper.revisionPaperSubmissions[0].revisionPaperReviews.map((review) => (
//                               <div
//                                 key={review.revisionPaperReviewId}
//                                 className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
//                               >
//                                 <div className="flex items-start gap-3 mb-3">
//                                   <div className="flex-shrink-0">
//                                     {review.reviewerAvatarUrl ? (
//                                       <img
//                                         src={review.reviewerAvatarUrl}
//                                         alt={review.reviewerName || "Reviewer"}
//                                         className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                                       />
//                                     ) : (
//                                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
//                                         {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "R"}
//                                       </div>
//                                     )}
//                                   </div>
                                  
//                                   <div className="flex-1 min-w-0">
//                                     <div className="flex items-center justify-between gap-2">
//                                       <p className="font-semibold text-gray-900">
//                                         {review.reviewerName || "N/A"}
//                                       </p>
//                                       <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.globalStatusName)}`}>
//                                         {getStatusIcon(review.globalStatusName)}
//                                         {review.globalStatusName}
//                                       </span>
//                                     </div>
//                                     {review.createdAt && (
//                                       <p className="text-xs text-gray-500 mt-0.5">
//                                         {formatDate(review.createdAt)}
//                                       </p>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {review.note && (
//                                   <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
//                                     <p className="text-xs font-semibold text-yellow-800 mb-1">
//                                       Ghi chú nội bộ:
//                                     </p>
//                                     <p className="text-sm text-gray-700">
//                                       {review.note}
//                                     </p>
//                                   </div>
//                                 )}

//                                 {review.feedbackToAuthor && (
//                                   <div className="mb-3">
//                                     <p className="text-xs font-semibold text-gray-600 mb-1">
//                                       Phản hồi tới tác giả:
//                                     </p>
//                                     <p className="text-sm text-gray-700 leading-relaxed">
//                                       {review.feedbackToAuthor}
//                                     </p>
//                                   </div>
//                                 )}

//                                 {review.feedbackMaterialUrl && (
//                                   <div className="pt-3 border-t">
//                                     <a
//                                       href={review.feedbackMaterialUrl}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
//                                     >
//                                       <Download className="w-4 h-4" />
//                                       Tải tài liệu đánh giá
//                                     </a>
//                                   </div>
//                                 )}

//                                 <div className="mt-3 pt-3 border-t">
//                                   <p className="text-xs text-gray-400">
//                                     Review ID: {review.revisionPaperReviewId}
//                                   </p>
//                                 </div>
//                               </div>
//                             ))
//                           ) : (
//                             <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
//                               Chưa có đánh giá nào từ Reviewer
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Revision Submissions */}
//                     <div className="bg-white border rounded-lg p-6">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                         <FileText className="w-5 h-5 text-orange-600" />
//                         Các Round Revision
//                       </h3>

//                       <div className="space-y-6">
//                         {paperDetail.revisionPaper.revisionPaperSubmissions.map((submission) => {
//                           return (
//                             <div
//                               key={submission.revisionPaperSubmissionId}
//                               className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 border-2 border-orange-200"
//                             >
//                               {/* Submission Header */}
//                               <div className="flex items-center justify-between mb-4 pb-4 border-b border-orange-200">
//                                 <div>
//                                   <h4 className="text-lg font-bold text-gray-900">
//                                     Round {submission.roundNumber}
//                                   </h4>
//                                   <p className="text-sm text-gray-600 mt-1">
//                                     Deadline: {formatDate(submission.endDate)}
//                                   </p>
//                                 </div>
//                                 <a
//                                   href={submission.revisionPaperUrl}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
//                                 >
//                                   <Download className="w-4 h-4" />
//                                   Tải xuống
//                                 </a>
//                               </div>

//                               {/* Previous Feedbacks */}
//                               {submission.revisionSubmissionFeedbacks.length > 0 && (
//                                 <div className="mb-6">
//                                   <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                     <CheckCircle className="w-4 h-4 text-green-600" />
//                                     Feedbacks đã gửi
//                                   </h5>
//                                   <div className="space-y-2">
//                                     {submission.revisionSubmissionFeedbacks.map((feedback) => (
//                                       <div
//                                         key={feedback.revisionSubmissionFeedbackId}
//                                         className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
//                                       >
//                                         <div className="flex items-start gap-3">
//                                           <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
//                                             {feedback.sortOrder}
//                                           </span>
//                                           <div className="flex-1">
//                                             <p className="text-sm text-gray-900 leading-relaxed">{feedback.feedback || "N/A"}</p>
//                                             {feedback.response && (
//                                               <div className="mt-3 pl-4 border-l-2 border-blue-300 bg-blue-50 p-3 rounded">
//                                                 <p className="text-xs text-gray-600">
//                                                   <span className="font-semibold text-blue-700">Response:</span> {feedback.response}
//                                                 </p>
//                                               </div>
//                                             )}
//                                             {feedback.createdAt && (
//                                               <p className="text-xs text-gray-400 mt-2">
//                                                 {formatDate(feedback.createdAt)}
//                                               </p>
//                                             )}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Feedback Form for this Submission */}
//                               <div className="bg-white rounded-lg p-5 border border-gray-300">
//                                 <h5 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                   <FileText className="w-4 h-4 text-blue-600" />
//                                   Gửi Feedback chi tiết cho Round {submission.roundNumber}
//                                 </h5>
                                
//                                 <div className="space-y-3">
//                                   {(revisionFeedbacks[submission.revisionPaperSubmissionId] || []).map((feedback, index) => (
//                                     <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
//                                       <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-2">
//                                         {feedback.sortOrder}
//                                       </span>
//                                       <textarea
//                                         placeholder={`Nhập feedback #${feedback.sortOrder}...`}
//                                         className="flex-1 border rounded-lg p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         value={feedback.feedback}
//                                         onChange={(e) => updateFeedback(submission.revisionPaperSubmissionId, index, e.target.value)}
//                                       />
//                                       <button
//                                         onClick={() => removeFeedback(submission.revisionPaperSubmissionId, index)}
//                                         className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                         title="Xóa feedback"
//                                       >
//                                         <XCircle className="w-5 h-5" />
//                                       </button>
//                                     </div>
//                                   ))}

//                                   <Button
//                                     onClick={() => addFeedbackField(submission.revisionPaperSubmissionId)}
//                                     variant="outline"
//                                     className="w-full border-dashed border-2 hover:bg-blue-50 hover:border-blue-300"
//                                   >
//                                     + Thêm feedback
//                                   </Button>

//                                   {(revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0) > 0 && (
//                                     <Button
//                                       onClick={() => handleSubmitRevisionFeedback(submission.revisionPaperSubmissionId)}
//                                       disabled={isSubmittingRevision}
//                                       className="w-full bg-blue-600 hover:bg-blue-700"
//                                     >
//                                       <Send className="w-4 h-4 mr-2" />
//                                       {isSubmittingRevision ? "Đang gửi..." : `Gửi ${revisionFeedbacks[submission.revisionPaperSubmissionId]?.length || 0} feedback`}
//                                     </Button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-12 bg-gray-50 rounded-lg">
//                     <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                     <p className="text-gray-600">Chưa có thông tin Revision Paper</p>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Decision Popup for Head Reviewer */}
//       {showDecisionPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
//             <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Gavel className="w-5 h-5 text-purple-600" />
//               Quyết định cuối cùng - Full Paper
//             </h3>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Chọn trạng thái
//                 </label>
//                 <select
//                   className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
//                   value={decisionStatus}
//                   onChange={(e) => setDecisionStatus(e.target.value)}
//                 >
//                   <option value="Accepted">Accepted</option>
//                   <option value="Revise">Revise</option>
//                   <option value="Rejected">Rejected</option>
//                 </select>
//               </div>

//               <div className="flex gap-3">
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setShowDecisionPopup(false)}
//                   className="flex-1"
//                   disabled={isDeciding}
//                 >
//                   Hủy
//                 </Button>
//                 <Button 
//                   onClick={handleDecideStatus}
//                   disabled={isDeciding}
//                   className="flex-1 bg-purple-600 hover:bg-purple-700"
//                 >
//                   {isDeciding ? "Đang xử lý..." : "Xác nhận"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Decision Popup for Head Reviewer - Revision */}
//       {showRevisionDecisionPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
//             <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Gavel className="w-5 h-5 text-orange-600" />
//               Quyết định cuối cùng - Revision Paper
//             </h3>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Chọn trạng thái
//                 </label>
//                 <select
//                   className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
//                   value={revisionDecisionStatus}
//                   onChange={(e) => setRevisionDecisionStatus(e.target.value)}
//                 >
//                   <option value="Pending">Pending</option>
//                   <option value="Accepted">Accepted</option>
//                   <option value="Rejected">Rejected</option>
//                 </select>
//               </div>

//               <div className="flex gap-3">
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setShowRevisionDecisionPopup(false)}
//                   className="flex-1"
//                   disabled={isDecidingRevision}
//                 >
//                   Hủy
//                 </Button>
//                 <Button 
//                   onClick={handleDecideRevisionStatus}
//                   disabled={isDecidingRevision}
//                   className="flex-1 bg-orange-600 hover:bg-orange-700"
//                 >
//                   {isDecidingRevision ? "Đang xử lý..." : "Xác nhận"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
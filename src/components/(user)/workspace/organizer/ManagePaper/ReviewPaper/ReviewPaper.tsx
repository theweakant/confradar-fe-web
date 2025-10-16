"use client";

import { useState } from "react";
import {  FileText, Download, Eye, History, CheckCircle, XCircle, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ReviewPaper() {
  const [showPreviousVersion, setShowPreviousVersion] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [decision, setDecision] = useState("");
  
  const [reviewData, setReviewData] = useState({
    detailedComments: "",
    recommendation: ""
  });

  // Mock data
  const paperData = {
    id: "1",
    title: "Deep Learning Approaches for Natural Language Processing",
    version: "2.0",
    conference: "International Conference on AI 2024",
    category: "Machine Learning",
    submittedDate: "2024-03-15",
    deadline: "2024-04-30",
    authors: ["John Smith", "Jane Doe", "Robert Brown"],
    description: "This paper presents a comprehensive study on deep learning approaches for natural language processing. We propose a novel architecture that combines transformer models with attention mechanisms to improve text understanding and generation. Our experiments on multiple benchmark datasets demonstrate state-of-the-art performance with significant improvements in accuracy and efficiency.",
    hasRevision: true,
    pdfUrl: "#"
  };

  const previousVersion = {
    version: "1.0",
    submittedDate: "2024-02-10",
    changes: "Revised methodology section, added additional experiments, improved clarity in results discussion",
    reviewFeedback: "The paper needs more experimental validation and clearer explanation of the proposed methodology."
  };

  const handleInputChange = (field: string, value: string) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReview = () => {
    if (!reviewData.recommendation) {
      toast.error("Vui lòng chọn kết quả đánh giá!");
      return;
    }
    
    // TODO: Submit review to API
    console.log("Submit review:", reviewData);
    toast.success("Đã gửi đánh giá thành công!");
    setShowSubmitDialog(false);
  };

  const openSubmitDialog = (rec: string) => {
    setDecision(rec);
    setReviewData(prev => ({ ...prev, recommendation: rec }));
    setShowSubmitDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Đánh giá bài báo</h1>
                <p className="text-sm text-gray-600">Version {paperData.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Tải PDF
              </Button>
              {paperData.hasRevision && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviousVersion(!showPreviousVersion)}
                >
                  <History className="w-4 h-4 mr-2" />
                  {showPreviousVersion ? "Ẩn" : "So sánh"} phiên bản cũ
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className={showPreviousVersion ? "lg:col-span-2" : "lg:col-span-3"}>
            {/* Paper Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {paperData.title}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Tiêu đề</p>
                  <p className="font-medium">{paperData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phiên bản</p>
                  <p className="font-medium">{paperData.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hội thảo</p>
                  <p className="font-medium">{paperData.conference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Danh mục</p>
                  <p className="font-medium">{paperData.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày nộp</p>
                  <p className="font-medium">{paperData.submittedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạn đánh giá</p>
                  <p className="font-medium text-orange-600">{paperData.deadline}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Tác giả</p>
                <div className="flex flex-wrap gap-2">
                  {paperData.authors.map((author, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {author}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                <p className="text-gray-700 leading-relaxed">{paperData.description}</p>
              </div>
            </div>

            {/* PDF Viewer Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nội dung bài báo</h3>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Xem toàn màn hình
                </Button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">PDF Viewer</p>
                <p className="text-sm text-gray-500">Nội dung bài báo sẽ hiển thị tại đây</p>
              </div>
            </div>

            {/* Review Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">Biểu mẫu đánh giá</h3>

              {/* Comments Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét chi tiết *
                  </label>
                  <textarea
                    value={reviewData.detailedComments}
                    onChange={(e) => handleInputChange("detailedComments", e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhận xét chi tiết về nội dung, phương pháp, kết quả..."
                  />
                </div>
              </div>

              {/* Decision Buttons */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm font-medium text-gray-700 mb-4">Quyết định đánh giá *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    onClick={() => openSubmitDialog("accept")}
                    className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Chấp nhận
                  </Button>
                  <Button
                    onClick={() => openSubmitDialog("revision")}
                    className="bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Yêu cầu sửa
                  </Button>
                  <Button
                    onClick={() => openSubmitDialog("reject")}
                    className="bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Từ chối
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Version Comparison */}
          {showPreviousVersion && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Phiên bản trước</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    v{previousVersion.version}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ngày nộp</p>
                    <p className="font-medium">{previousVersion.submittedDate}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Thay đổi</p>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {previousVersion.changes}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Phản hồi đánh giá trước</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                      {previousVersion.reviewFeedback}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Tải phiên bản cũ
                  </Button>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">
                      So sánh để xem tác giả đã cải thiện những gì dựa trên phản hồi trước đó
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang chọn quyết định:{" "}
              <strong>
                {decision === "accept" && "Chấp nhận"}
                {decision === "revision" && "Yêu cầu sửa"}
                {decision === "reject" && "Từ chối"}
              </strong>
              <br />
              <br />
              Sau khi gửi, bạn không thể chỉnh sửa đánh giá. Vui lòng kiểm tra kỹ trước khi xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitReview}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Gửi đánh giá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
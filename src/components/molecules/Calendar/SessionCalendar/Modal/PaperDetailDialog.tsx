// src/components/molecules/Calendar/SessionCalendar/Modal/PaperDetailDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, User, Users, Calendar, FileCheck, CheckCircle } from "lucide-react";
import type { AcceptedPaper } from "@/types/paper.type";

interface PaperDetailDialogProps {
  open: boolean;
  onClose: () => void;
  paper: AcceptedPaper | null;
  onSelectPaper: () => void;
}

const PaperDetailDialog: React.FC<PaperDetailDialogProps> = ({
  open,
  onClose,
  paper,
  onSelectPaper,
}) => {
  if (!paper) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSelectForAssignment = () => {
    onSelectPaper();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Chi tiết bài báo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Paper Title */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Tiêu đề bài báo
            </label>
            <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
              {paper.title}
            </h3>
          </div>

          {/* Paper ID */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-gray-600">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-0.5">Mã bài báo</p>
              <p className="text-sm font-mono text-gray-900">{paper.paperId}</p>
            </div>
          </div>

          {/* Description */}
          {paper.description && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Mô tả
              </label>
              <p className="text-sm text-gray-700 leading-relaxed p-3 bg-gray-50 rounded-lg border border-gray-200">
                {paper.description}
              </p>
            </div>
          )}

          {/* Authors Section */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Tác giả
            </label>
            
            {/* Root Author */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="mt-0.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {paper.rootAuthor.fullName}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                    Tác giả chính
                  </span>
                </div>
                <p className="text-xs text-gray-600">User ID: {paper.rootAuthor.userId}</p>
              </div>
            </div>

            {/* Co-Authors */}
            {paper.coAuthors && paper.coAuthors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="w-3.5 h-3.5" />
                  <span>Đồng tác giả ({paper.coAuthors.length})</span>
                </div>
                <div className="space-y-2">
                  {paper.coAuthors.map((coAuthor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-900">{coAuthor.fullName || coAuthor.userId}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Paper Phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Abstract */}
            {paper.abstract && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Abstract</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {paper.abstract.title}
                </p>
                {paper.abstract.fileUrl && (
                  <a
                    href={paper.abstract.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3" />
                    Xem file
                  </a>
                )}
              </div>
            )}

            {/* Full Paper */}
            {paper.fullPaper && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Full Paper</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {paper.fullPaper.title}
                </p>
                {paper.fullPaper.fileUrl && (
                  <a
                    href={paper.fullPaper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3" />
                    Xem file
                  </a>
                )}
              </div>
            )}

            {/* Revision Paper */}
            {paper.revisionPaper && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Revision Paper</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {paper.revisionPaper.title}
                </p>
                {paper.revisionPaper.fileUrl && (
                  <a
                    href={paper.revisionPaper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3" />
                    Xem file
                  </a>
                )}
              </div>
            )}

            {/* Camera Ready */}
            {paper.cameraReady && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Camera Ready</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {paper.cameraReady.title}
                </p>
                {paper.cameraReady.fileUrl && (
                  <a
                    href={paper.cameraReady.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700 hover:underline inline-flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3" />
                    Xem file
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paper.currentPhase && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Giai đoạn hiện tại</p>
                  <p className="text-sm text-gray-900">{paper.currentPhase}</p>
                </div>
              </div>
            )}

            {paper.revisionDeadline && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Hạn chỉnh sửa</p>
                  <p className="text-sm text-gray-900">{formatDate(paper.revisionDeadline)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Assignment Status */}
          <div className={`flex items-start gap-2 p-3 rounded-lg border ${
            paper.isAssignedToSession 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className={paper.isAssignedToSession ? 'text-green-600' : 'text-blue-600'}>
              {paper.isAssignedToSession ? (
                <CheckCircle className="w-4 h-4 mt-0.5" />
              ) : (
                <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                paper.isAssignedToSession ? 'text-green-800' : 'text-blue-800'
              }`}>
                {paper.isAssignedToSession 
                  ? 'Bài báo đã được gán vào session' 
                  : 'Bài báo chưa được gán vào session'
                }
              </p>
              {!paper.isAssignedToSession && (
                <p className="text-xs text-blue-700 mt-1">
                  Click nút &quot;Chọn để gán&quot; để chọn bài báo này, sau đó click vào session trên lịch để gán.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </Button>
          
          {!paper.isAssignedToSession && (
            <Button
              onClick={handleSelectForAssignment}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Chọn để gán
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaperDetailDialog;
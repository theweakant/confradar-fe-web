import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, Eye, ChevronDown, ChevronUp, Star } from "lucide-react";
import type { AcceptedPaper } from "@/types/paper.type";
import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";

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
  const [viewMode, setViewMode] = useState<'abstract' | 'cameraReady'>('abstract');
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    authors: true,
  });

  if (!paper) return null;

  const handleSelectForAssignment = () => {
    onSelectPaper();
    onClose();
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const availableDocsCount = [paper.abstract, paper.cameraReady].filter(Boolean).length;
  const totalAuthors = 1 + (paper.coAuthors?.length || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[70vw] max-h-[90vh] bg-white border-gray-200 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Chi tiết bài báo
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Tiêu đề
                  </label>
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {paper.title}
                  </h3>
                </div>

                {paper.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                      Mô tả
                    </label>
                    <p className="text-sm text-gray-700 leading-relaxed p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {paper.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('authors')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Tác giả ({totalAuthors})
                    </h3>
                  </div>
                  {expandedSections.authors ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.authors && (
                  <div className="p-3 pt-0 space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-600 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-blue-600">
                          {paper.rootAuthor.fullName}
                        </p>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    </div>

                    {paper.coAuthors && paper.coAuthors.length > 0 && (
                      <div className="space-y-2">
                        {paper.coAuthors.map((coAuthor, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 border-2 border-gray-300 rounded-lg"
                          >
                            <p className="text-sm text-gray-700 font-medium">{coAuthor.fullName || coAuthor.userId}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('info')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Tài liệu ({availableDocsCount})</h3>
                  </div>
                  {expandedSections.info ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.info && (
                  <div className="p-3 pt-0 space-y-2">
                    {paper.abstract && (
                      <div 
                        onClick={() => setViewMode('abstract')}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          viewMode === 'abstract' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${
                            viewMode === 'abstract' ? 'border-blue-600 bg-blue-50' : 'border-blue-600 bg-blue-50'
                          }`}>
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-blue-600">Abstract</h4>
                              {viewMode === 'abstract' && (
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {paper.abstract.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {paper.cameraReady && (
                      <div 
                        onClick={() => setViewMode('cameraReady')}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          viewMode === 'cameraReady' 
                            ? 'border-green-600 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-green-400'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${
                            viewMode === 'cameraReady' ? 'border-green-600 bg-green-50' : 'border-green-600 bg-green-50'
                          }`}>
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-green-600">Camera Ready</h4>
                              {viewMode === 'cameraReady' && (
                                <Eye className="w-3.5 h-3.5 text-green-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {paper.cameraReady.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex items-start gap-2 p-3 rounded-lg border-2 ${
                paper.isAssignedToSession 
                  ? 'bg-green-50 border-green-600' 
                  : 'bg-blue-50 border-blue-600'
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
                    paper.isAssignedToSession ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {paper.isAssignedToSession 
                      ? 'Đã được gán vào session' 
                      : 'Chưa được gán vào session'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      viewMode === 'abstract'}`}>
                      <FileText className={`w-4 h-4 ${viewMode === 'abstract' ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${viewMode === 'abstract' ? 'text-blue-600' : 'text-green-600'}`}>
                        {viewMode === 'abstract' ? 'Abstract' : 'Camera Ready'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {viewMode === 'abstract' ? paper.abstract?.title : paper.cameraReady?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {paper.abstract && (
                      <button
                        onClick={() => setViewMode('abstract')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border-2 ${
                          viewMode === 'abstract'
                            ? 'bg-blue-50 text-blue-600 border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                        }`}
                      >
                        Abstract
                      </button>
                    )}
                    {paper.cameraReady && (
                      <button
                        onClick={() => setViewMode('cameraReady')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border-2 ${
                          viewMode === 'cameraReady'
                            ? 'bg-green-50 text-green-600 border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-600 hover:text-green-600'
                        }`}
                      >
                        Camera Ready
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-3">
                  {((viewMode === 'abstract' && paper.abstract?.fileUrl) || 
                    (viewMode === 'cameraReady' && paper.cameraReady?.fileUrl)) ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-full">
                      <ReusableDocViewer
                        fileUrl={
                          viewMode === 'abstract'
                            ? paper.abstract!.fileUrl
                            : paper.cameraReady!.fileUrl
                        }
                        minHeight={500}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Không có file để hiển thị</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </Button>
          
          {!paper.isAssignedToSession && (
            <Button
              onClick={handleSelectForAssignment}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-600"
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
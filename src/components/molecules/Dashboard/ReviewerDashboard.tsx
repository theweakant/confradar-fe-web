'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Clock } from 'lucide-react';
import { useGetAssignedPapersQuery, useGetReviewedPapersQuery, useGetPendingReviewPapersQuery } from '@/redux/services/reviewer.service';
import { useAuth } from '@/redux/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaperDetail } from '@/types/reviewer.type';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card className="rounded-2xl border border-gray-200 shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-md text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const PieChart: React.FC<{ papers: PaperDetail[] }> = ({ papers }) => {
const statusCount = papers.reduce<Record<string, number>>((acc, paper) => {
  const status = paper.paperPhaseName;
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

  const total = papers.length || 1;
  const fullPaperCount = statusCount['FullPaper'] || 0;
  const reviseCount = statusCount['Revise'] || 0;
  const cameraReadyCount = statusCount['CameraReady'] || 0;

  const completedPercent = ((cameraReadyCount / total) * 100).toFixed(0);

  const fullPaperAngle = (fullPaperCount / total) * 360;
  const reviseAngle = (reviseCount / total) * 360;
  const cameraReadyAngle = (cameraReadyCount / total) * 360;

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="24"
              />
              {cameraReadyCount > 0 && (
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeDasharray={`${(cameraReadyAngle / 360) * 502.65} 502.65`}
                  strokeDashoffset="0"
                />
              )}
              {reviseCount > 0 && (
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeDasharray={`${(reviseAngle / 360) * 502.65} 502.65`}
                  strokeDashoffset={`-${(cameraReadyAngle / 360) * 502.65}`}
                />
              )}
              {fullPaperCount > 0 && (
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="24"
                  strokeDasharray={`${(fullPaperAngle / 360) * 502.65} 502.65`}
                  strokeDashoffset={`-${((cameraReadyAngle + reviseAngle) / 360) * 502.65}`}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{completedPercent}%</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-700">Camera Ready</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{cameraReadyCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-700">Final Review</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{reviseCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-sm text-gray-700">Full Paper</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{fullPaperCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.userId || '';

  const { data: assignedData, isLoading: assignedLoading } = useGetAssignedPapersQuery(undefined, {
    skip: !userId,
  });
  const { data: reviewedData, isLoading: reviewedLoading } = useGetReviewedPapersQuery(undefined, {
    skip: !userId,
  });
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingReviewPapersQuery(undefined, {
    skip: !userId,
  });

  const totalAssigned = assignedData?.data?.totalPaperAssignPaper ?? 0;
  const totalReviewed = reviewedData?.data?.totalPaperReviewed ?? 0;
  const totalPending = pendingData?.data?.totalPaperPending ?? 0;
  const papers = assignedData?.data?.paperDetails || [];

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPaper, setSelectedPaper] = useState<PaperDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleViewDetail = (paper: PaperDetail) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPaper(null);
  };

  const sortedPapers = [...papers].sort((a, b) => {
    const dateA = new Date(a.paperCreatedAt).getTime();
    const dateB = new Date(b.paperCreatedAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  const getPhaseColor = (phaseName: string) => {
    const colors: { [key: string]: string } = {
      'CameraReady': 'bg-green-100 text-green-700',
      'Revise': 'bg-yellow-100 text-yellow-700',
      'FullPaper': 'bg-blue-100 text-blue-700',
      'Review': 'bg-purple-100 text-purple-700',
      'Submission': 'bg-gray-100 text-gray-700',
    };
    return colors[phaseName] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard đánh giá nội bộ</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Bài được giao"
          value={assignedLoading ? 0 : totalAssigned}
          icon={<FileText className="text-white" size={20} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Đã hoàn thành"
          value={reviewedLoading ? 0 : totalReviewed}
          icon={<Users className="text-white" size={20} />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Chờ đánh giá"
          value={pendingLoading ? 0 : totalPending}
          icon={<Clock className="text-white" size={20} />}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Nổi bật</h2>
          {assignedLoading ? (
            <div className="text-gray-500">Đang tải...</div>
          ) : papers.length === 0 ? (
            <div className="text-gray-500">Chưa có bài báo nào được giao</div>
          ) : (
            <div className="space-y-4">
              {papers.slice(0, 3).map((paper: PaperDetail) => (
                <Card key={paper.paperId} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {paper.paperTitle}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{paper.conferenceName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        paper.isHeadReviewer 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {paper.isHeadReviewer ? 'Head Reviewer' : 'Reviewer'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPhaseColor(paper.paperPhaseName)}`}>
                        {paper.paperPhaseName}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Thống kê</h2>
          <PieChart papers={papers} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Danh sách tất cả bài báo</h2>
          <button
            onClick={handleSort}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
          </button>
        </div>
        <div className="rounded-md border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Tiêu đề</TableHead>
                <TableHead>Hội nghị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPapers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    Không có bài báo nào
                  </TableCell>
                </TableRow>
              ) : (
                sortedPapers.map((paper: PaperDetail) => (
                  <TableRow key={paper.paperId} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{paper.paperTitle}</TableCell>
                    <TableCell className="text-gray-700">{paper.conferenceName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPhaseColor(paper.paperPhaseName)}`}>
                          {paper.paperPhaseName}
                        </span>
                        {paper.paperRefundedStatus && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Hoàn tiền
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleViewDetail(paper)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal chi tiết bài báo */}
{isModalOpen && selectedPaper && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">Chi tiết bài báo</h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Grid 2 cột cho các trường thông tin */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600">Tiêu đề</h4>
            <p className="text-gray-900">{selectedPaper.paperTitle}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Hội nghị</h4>
            <p className="text-gray-900">{selectedPaper.conferenceName}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Trạng thái</h4>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getPhaseColor(
                selectedPaper.paperPhaseName
              )}`}
            >
              {selectedPaper.paperPhaseName}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Vai trò của bạn</h4>
            <p className="text-gray-900">
              {selectedPaper.isHeadReviewer ? 'Head Reviewer' : 'Reviewer'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Ngày tạo</h4>
            <p className="text-gray-900">
              {new Date(selectedPaper.paperCreatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
          {selectedPaper.paperRefundedStatus && (
            <div>
              <h4 className="text-sm font-medium text-gray-600">Trạng thái hoàn tiền</h4>
              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 mt-1">
                Hoàn tiền
              </span>
            </div>
          )}
        </div>

        {/* Mô tả - chiếm toàn bộ chiều rộng */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600">Mô tả</h4>
          <p className="text-gray-900 whitespace-pre-wrap">
            {selectedPaper.paperDescription || '—'}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ReviewerDashboard;
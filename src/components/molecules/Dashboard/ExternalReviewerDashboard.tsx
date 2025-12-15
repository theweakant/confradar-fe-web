// src/components/dashboard/ExternalReviewerDashboard.tsx
'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Clock, Wallet, CheckCircle, TrendingUp } from 'lucide-react';
import {
  useGetAssignedPapersQuery,
  useGetReviewedPapersQuery,
  useGetPendingReviewPapersQuery,
} from '@/redux/services/reviewer.service';
import {
  useGetExternalContractsCountQuery,
  useGetExternalContractsActiveQuery,
  useGetExternalContractsWageTotalQuery,
} from '@/redux/services/contract.service';
import { useAuth } from '@/redux/hooks/useAuth';
import { formatCurrency } from '@/helper/format';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card className="rounded-2xl border border-gray-200 shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const ExternalReviewerDashboard: React.FC = () => {
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

  const { data: contractCountData, isLoading: contractCountLoading } = useGetExternalContractsCountQuery(undefined, {
    skip: !userId,
  });
  const { data: activeContractData, isLoading: activeContractLoading } = useGetExternalContractsActiveQuery(undefined, {
    skip: !userId,
  });
  const { data: wageTotalData, isLoading: wageTotalLoading } = useGetExternalContractsWageTotalQuery(undefined, {
    skip: !userId,
  });

  const totalAssigned = assignedData?.data?.totalPaperAssignPaper ?? 0;
  const totalReviewed = reviewedData?.data?.totalPaperReviewed ?? 0;
  const totalPending = pendingData?.data?.totalPaperPending ?? 0;

  const totalContracts = contractCountData?.data?.contractCount ?? 0;
  const activeContracts = activeContractData?.data?.activeContractCount ?? 0;
  const totalWage = wageTotalData?.data?.wage ?? 0;

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bảng điều khiển External Reviewer</h1>

      {/* 🔹 Thống kê hợp đồng */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Hợp Đồng Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tổng hợp đồng"
            value={contractCountLoading ? 0 : totalContracts}
            icon={<FileText className="text-white" size={20} />}
            color="bg-purple-500"
          />
          <StatCard
            title="Đang hoạt động"
            value={activeContractLoading ? 0 : activeContracts}
            icon={<CheckCircle className="text-white" size={20} />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Tổng lương"
            value={wageTotalLoading ? '...' : formatCurrency(totalWage)}
            icon={<Wallet className="text-white" size={20} />}
            color="bg-amber-600"
          />
        </div>
      </div>

      {/* 🔹 Thống kê bài review */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Bài Đánh Giá</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>ℹ️ Bạn là <strong>External Reviewer</strong> — có hợp đồng và được trả lương theo bài review.</p>
      </div>
    </div>
  );
};

export default ExternalReviewerDashboard;
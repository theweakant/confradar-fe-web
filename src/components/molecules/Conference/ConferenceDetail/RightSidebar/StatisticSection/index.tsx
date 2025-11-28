"use client";

import { TrendingUp, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetSoldTicketQuery } from "@/redux/services/statistics.service";
import { formatCurrency } from "@/helper/format";
import { useAuth } from "@/redux/hooks/useAuth";

interface StatisticsSectionProps {
  conferenceId: string;
}

export function StatisticsSection({ conferenceId }: StatisticsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();

  const userRoles = user?.role || [];
  const isCollaborator = userRoles.includes("Collaborator");
  const isOrganizer = userRoles.includes("Conference Organizer");

  const {
    data: soldTicketResponse,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useGetSoldTicketQuery(conferenceId);

  if (isLoadingStats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isErrorStats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 text-center text-yellow-600">
        Không có dữ liệu
      </div>
    );
  }

  const data = soldTicketResponse?.data;
  const totalRevenue = data?.totalRevenue || 0;
  const totalTicketsSold = data?.totalTicketsSold || 0;
  const totalRefundedAmount = data?.totalRefundedAmount || 0;
  const totalRevenueWithoutRefunded = data?.totalRevenueWithoutRefunded || 0;

  let totalCommission = 0; // tiền trả cho Collaborator
  let totalToConfRadar = 0; // tiền ConfRadar giữ lại
  let hasCommissionOrPlatformFee = false;

  data?.ticketPhaseStatistics.forEach((phase) => {
    if (phase.amountToCollaborator != null) {
      totalCommission += phase.amountToCollaborator;
      hasCommissionOrPlatformFee = true;
    }
    if (phase.amountToConfRadar != null) {
      totalToConfRadar += phase.amountToConfRadar;
      hasCommissionOrPlatformFee = true;
    }
  });

  // Xác định số tiền hiển thị chính
  let displayAmountLabel = "";
  let displayAmount = 0;

  if (isCollaborator) {
    displayAmountLabel = "Thu nhập của bạn";
    displayAmount = totalCommission; // Collaborator nhận đúng số này
  } else if (isOrganizer) {
    displayAmountLabel = "Doanh thu ròng";
    displayAmount = totalRevenueWithoutRefunded - totalCommission - totalToConfRadar;
  } else {
    // fallback: ví dụ admin hoặc vai trò khác
    displayAmountLabel = "Doanh thu hợp lệ";
    displayAmount = totalRevenueWithoutRefunded;
  }

  const basePath = isCollaborator
    ? "/workspace/collaborator"
    : "/workspace/organizer";

  const handleNavigate = () => {
    router.push(`${basePath}/manage-conference/statistic-conference/${conferenceId}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Thống kê bán vé</h3>
        <button
          onClick={handleNavigate}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Card nhỏ - Tổng quan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Vé đã bán</p>
              <p className="text-lg font-bold text-gray-900">{totalTicketsSold}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{displayAmountLabel}</p>
              {displayAmount >= 0 ? (
                <p className="text-base font-bold text-green-700">{formatCurrency(displayAmount)}</p>
              ) : (
                <p className="text-base font-bold text-red-700">-{formatCurrency(Math.abs(displayAmount))}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                Tổng thu: {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { TrendingUp, DollarSign, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetSoldTicketQuery } from "@/redux/services/statistics.service";
import { formatCurrency } from "@/helper/format";
import { useAuth } from "@/redux/hooks/useAuth";

interface StatisticsSectionProps {
  conferenceId: string;
  conferenceType: "research" | "technical"; 
  isOwnConference: boolean;           
}

export function StatisticsSection({ conferenceId, conferenceType, isOwnConference }: StatisticsSectionProps) {
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

  const basePath = isCollaborator
    ? "/workspace/collaborator"
    : "/workspace/organizer";

  const handleNavigate = () => {
    router.push(`${basePath}/manage-conference/statistic-conference/${conferenceId}`);
  };

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Thống kê</h3>
        {!isErrorStats && (
          <button
            onClick={handleNavigate}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Xem chi tiết
          </button>
        )}
      </div>

      {isErrorStats ? (
        <div className="text-center py-4 text-yellow-600 text-sm">
          Doanh thu không được liên kết với ConfRadar
        </div>
      ) : (
        <div className="space-y-3">
          {(() => {
            const data = soldTicketResponse?.data;
            const totalRevenue = data?.totalRevenue || 0;
            const totalTicketsSold = data?.totalTicketsSold || 0;
            const totalRevenueWithoutRefunded = data?.totalRevenueWithoutRefunded || 0;

            let totalCommission = 0;
            let totalToConfRadar = 0;

            data?.ticketPhaseStatistics.forEach((phase) => {
              if (phase.amountToCollaborator != null) {
                totalCommission += phase.amountToCollaborator;
              }
              if (phase.amountToConfRadar != null) {
                totalToConfRadar += phase.amountToConfRadar;
              }
            });

            let primaryLabel = "";
            let primaryValue = 0;

            if (isCollaborator) {
              // Collaborator chỉ xem technical của chính họ
              primaryLabel = "Số tiền đối tác nhận được";
              primaryValue = totalCommission;
            } else if (isOrganizer) {
              // Organizer:
              if (conferenceType === "technical" && !isOwnConference) {
                // Xem technical do collaborator tạo → chỉ thấy phần ConfRadar nhận
                primaryLabel = "Số tiền ConfRadar nhận";
                primaryValue = totalToConfRadar;
              } else {
                // Các trường hợp còn lại: technical của mình, hoặc mọi trường hợp research
                primaryLabel = "Doanh thu ròng";
                primaryValue = totalRevenueWithoutRefunded - totalCommission - totalToConfRadar;
              }
            } else {
              primaryLabel = "Doanh thu hợp lệ";
              primaryValue = totalRevenueWithoutRefunded;
            }

            return (
              <>
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
                      <p className="text-xs text-gray-500">{primaryLabel}</p>
                      {primaryValue >= 0 ? (
                        <p className="text-base font-bold text-green-700">
                          {formatCurrency(primaryValue)}
                        </p>
                      ) : (
                        <p className="text-base font-bold text-red-700">
                          -{formatCurrency(Math.abs(primaryValue))}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tổng thu: {formatCurrency(totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
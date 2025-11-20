"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useGetSoldTicketQuery, useExportSoldTicketQuery } from "@/redux/services/statistics.service";
import type { GroupedTicket } from "@/types/statistics.type"; // ✅ import kiểu mới

interface StatisticsSectionProps {
  conferenceId: string;
  isCollaborator?: boolean;
}

export function StatisticsSection({ 
  conferenceId,
  isCollaborator = false
}: StatisticsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const { 
    data: soldTicketResponse,
    isLoading: isLoadingStats,
    isError: isErrorStats
  } = useGetSoldTicketQuery(conferenceId);

  const { 
     data: exportBlob,
    isLoading: isExporting 
  } = useExportSoldTicketQuery(conferenceId, {
    skip: !exportTriggered,
  });

  useEffect(() => {
    if (exportBlob && exportTriggered) {
      const url = window.URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thong-ke-ve-${conferenceId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      setExportTriggered(false);
    }
  }, [exportBlob, conferenceId, exportTriggered]);

  const handleExport = () => {
    setExportTriggered(true);
  };

  if (isLoadingStats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
      <div className="bg-white rounded-lg border border-gray-200 p-5 text-center text-red-600">
        Không thể tải thống kê
      </div>
    );
  }

  const data = soldTicketResponse?.data;
  const totalRevenue = data?.totalRevenue || 0;
  const totalTicketsSold = data?.totalTicketsSold || 0;

  let totalCommission = 0;
  let hasCommissionData = false;

  // ✅ Dùng Record<string, GroupedTicket> thay vì any
  const groupedTickets = data?.ticketPhaseStatistics.reduce((acc, phase) => {
    const key = `${phase.ticketName}|${phase.conferencePriceId}`;
    if (!acc[key]) {
      acc[key] = {
        ticketName: phase.ticketName,
        ticketPrice: phase.originalPrice,
        soldSlot: 0,
        phases: [],
      };
    }
    acc[key].soldSlot += phase.totalSold;

    if (phase.amountToCollaborator != null) {
      totalCommission += phase.amountToCollaborator;
      hasCommissionData = true;
    }

    acc[key].phases.push({
      phaseName: phase.phaseName,
      applyPercent: phase.applyPhasePercent,
      soldSlot: phase.totalSold,
      actualPrice: phase.originalPrice * (phase.applyPhasePercent / 100),
      revenue: phase.totalAmount,
      commission: phase.amountToCollaborator, 
    });
    return acc;
  }, {} as Record<string, GroupedTicket>);

  const ticketList = Object.values(groupedTickets || {});

  const netRevenue = hasCommissionData && isCollaborator ? totalRevenue - totalCommission : totalRevenue;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Thống kê</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 disabled:opacity-50"
            title="Xuất Excel"
          >
            <Download className="w-3 h-3" />
            {isExporting ? 'Đang xuất...' : 'Xuất'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                Thu gọn <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Xem <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Vé đã bán</p>
              <p className="text-lg font-bold text-gray-900">{totalTicketsSold}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                {isCollaborator && hasCommissionData ? "Doanh thu (sau hoa hồng)" : "Tổng doanh thu"}
              </p>
              <p className="text-sm font-bold text-gray-900">
                {netRevenue.toLocaleString('vi-VN')} VND
              </p>
              {isCollaborator && hasCommissionData && (
                <p className="text-xs text-orange-600 mt-0.5">
                  Hoa hồng: {totalCommission.toLocaleString('vi-VN')} VND
                </p>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Chi tiết doanh thu</h4>
            
=            {ticketList.map((ticket, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ticket.ticketName}</p>
                    <p className="text-xs text-gray-500">
                      Giá gốc: {ticket.ticketPrice.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Đã bán</p>
                    <p className="text-sm font-bold text-gray-900">
                      {ticket.soldSlot} vé
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pl-2 border-l-2 border-gray-200">
=                  {ticket.phases.map((phase, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700">
                          {phase.phaseName}
                          <span className="text-gray-500 ml-1">
                            ({phase.applyPercent}%)
                          </span>
                        </p>
                        <p className="text-xs text-gray-600">
                          {phase.soldSlot} vé
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {phase.actualPrice.toLocaleString('vi-VN')} VND/vé
                        </p>
                        <p className="text-xs font-semibold text-green-600">
                          {phase.revenue.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      {isCollaborator && phase.commission != null && phase.commission > 0 && (
                        <p className="text-xs text-orange-600">
                          Hoa hồng: {phase.commission.toLocaleString('vi-VN')} VND
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700">Tổng thu ({ticket.ticketName})</p>
                    <p className="text-sm font-bold text-blue-600">
                      {/* ✅ p có kiểu GroupedTicketPhase */}
                      {ticket.phases.reduce((sum, p) => sum + p.revenue, 0).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Tổng doanh thu</p>
                  <p className="text-lg font-bold text-blue-600">
                    {totalRevenue.toLocaleString('vi-VN')} VND
                  </p>
                </div>
                
                {isCollaborator && hasCommissionData && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-orange-700">Tổng hoa hồng</p>
                      <p className="font-semibold text-orange-700">
                        - {totalCommission.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Thực nhận</p>
                        <p className="text-lg font-bold text-green-600">
                          {netRevenue.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
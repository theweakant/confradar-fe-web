"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Download, BarChart3 } from "lucide-react";
import { useGetSoldTicketQuery, useExportSoldTicketQuery } from "@/redux/services/statistics.service";
import type { GroupedTicket } from "@/types/statistics.type";
import { formatCurrency } from "@/helper/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StatisticsSectionProps {
  conferenceId: string;
  isCollaborator?: boolean;
}

export function StatisticsSection({ 
  conferenceId,
  isCollaborator = false
}: StatisticsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  let totalToConfRadar = 0;
  let hasCommissionData = false;

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
    
    if (phase.amountToConfRadar != null) {
      totalToConfRadar += phase.amountToConfRadar;
    }

    acc[key].phases.push({
      phaseName: phase.phaseName,
      applyPercent: phase.applyPhasePercent,
      soldSlot: phase.totalSold,
      actualPrice: phase.originalPrice * (phase.applyPhasePercent / 100),
      revenue: phase.totalAmount,
      commission: phase.amountToCollaborator,
      commissionPercent: phase.commissionPercentage,
      amountToConfRadar: phase.amountToConfRadar,
    });
    return acc;
  }, {} as Record<string, GroupedTicket>);

  const ticketList = Object.values(groupedTickets || {});

  const netRevenue = hasCommissionData && isCollaborator 
    ? totalRevenue - totalCommission 
    : totalRevenue;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Thống kê</h3>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Chi tiết
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
              <DialogHeader className="p-6 border-b border-gray-200">
                <DialogTitle className="text-xl font-bold">Chi tiết thống kê doanh thu</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {data?.conferenceName}
                </DialogDescription>
              </DialogHeader>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Tổng vé đã bán</p>
                        <p className="text-2xl font-bold text-green-900">{totalTicketsSold}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-purple-700">
                          {isCollaborator && hasCommissionData ? "Doanh thu thực nhận" : "Tổng doanh thu"}
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatCurrency(netRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bảng phân tích doanh thu */}
                {isCollaborator && hasCommissionData && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Phân tích doanh thu</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Tổng doanh thu</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">Hoa hồng cho hệ thống</span>
                        <span className="text-sm font-semibold text-orange-700">
                          - {formatCurrency(totalCommission)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-700">Doanh thu thực nhận</span>
                          <span className="text-lg font-bold text-green-700">
                            {formatCurrency(netRevenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chi tiết từng loại vé */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Chi tiết theo loại vé</h3>
                  
                  {ticketList.map((ticket, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      {/* Header loại vé */}
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-gray-900">{ticket.ticketName}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Giá gốc: {formatCurrency(ticket.ticketPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Tổng đã bán</p>
                            <p className="text-lg font-bold text-blue-600">
                              {ticket.soldSlot} vé
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết các giai đoạn */}
                      <div className="p-4 space-y-3">
                        {ticket.phases.map((phase, pIdx) => (
                          <div key={pIdx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {phase.phaseName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Giảm giá: {phase.applyPercent}%
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                  {phase.soldSlot} vé
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500">Giá bán thực tế</p>
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency(phase.actualPrice)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500">Doanh thu</p>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(phase.revenue)}
                                </p>
                              </div>
                            </div>

                            {isCollaborator && phase.commission != null && phase.commission > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-orange-600">
                                    Hoa hồng hệ thống ({phase.commissionPercent}%)
                                  </span>
                                  <span className="font-semibold text-orange-600">
                                    {formatCurrency(phase.commission)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                  <span className="text-green-600 font-medium">
                                    Bạn nhận được
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(phase.revenue - phase.commission)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Tổng kết loại vé */}
                      <div className="bg-blue-50 p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            Tổng doanh thu ({ticket.ticketName})
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(ticket.phases.reduce((sum, p) => sum + p.revenue, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng kết cuối */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200 mt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-900">Tổng doanh thu</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(totalRevenue)}
                      </span>
                    </div>
                    
                    {isCollaborator && hasCommissionData && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-orange-700 font-medium">Hoa hồng hệ thống</span>
                          <span className="font-semibold text-orange-700">
                            - {formatCurrency(totalCommission)}
                          </span>
                        </div>
                        <div className="pt-3 border-t-2 border-blue-300">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-green-700">Bạn thực nhận</span>
                            <span className="text-2xl font-bold text-green-700">
                              {formatCurrency(netRevenue)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors rounded-lg border border-gray-300"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
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
                {isCollaborator && hasCommissionData ? (
                  <>
                    <p className="text-xs text-gray-500">Doanh thu thực nhận</p>
                    <p className="text-sm font-bold text-green-700">
                      {formatCurrency(netRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tổng doanh thu: {formatCurrency(totalRevenue)}
                    </p>
                    <p className="text-xs text-orange-600">
                      Hoa hồng: {formatCurrency(totalCommission)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">Tổng doanh thu</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
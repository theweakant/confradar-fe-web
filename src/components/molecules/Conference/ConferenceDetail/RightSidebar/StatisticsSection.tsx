"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Download, CheckCircle, XCircle, Clock, AlertCircle, Users } from "lucide-react";
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
  const totalTicketRefunded = data?.totalTicketRefunded || 0;
  const totalNotRefundedTicket = data?.totalNotRefundedTicket || 0;

  let totalCommission = 0;
  let totalToConfRadar = 0;
  let hasCommissionData = false;
  let totalHasCheckin = 0;
  let totalExpireCheckin = 0;
  let totalPending = 0;

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

    totalHasCheckin += phase.hasCheckin || 0;
    totalExpireCheckin += phase.expireCheckin || 0;
    totalPending += phase.pending || 0;

    acc[key].phases.push({
      phaseName: phase.phaseName,
      applyPercent: phase.applyPhasePercent,
      soldSlot: phase.totalSold,
      actualPrice: phase.originalPrice * (phase.applyPhasePercent / 100),
      revenue: phase.totalAmount,
      commission: phase.amountToCollaborator,
      commissionPercent: phase.commissionPercentage,
      amountToConfRadar: phase.amountToConfRadar,
      hasCheckin: phase.hasCheckin,
      expireCheckin: phase.expireCheckin,
      pending: phase.pending,
      totalNotRefuned: phase.totalNotRefuned,
      totalRefunded: phase.totalRefunded,
      totalAmountNotRefunded: phase.totalAmountNotRefunded,
      totalAmountRefunded: phase.totalAmountRefunded,
    });
    return acc;
  }, {} as Record<string, GroupedTicket>);

  const ticketList = Object.values(groupedTickets || {});

  const netRevenue = hasCommissionData && isCollaborator 
    ? totalRevenue - totalCommission 
    : totalRevenue;

  // Tính toán vé chưa check-in
  const notCheckedIn = totalNotRefundedTicket - totalHasCheckin - totalExpireCheckin;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Thống kê bán vé</h3>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Xem chi tiết
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-xl max-h-[90vh] overflow-y-auto flex flex-col p-0">              <DialogHeader className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <DialogTitle className="text-xl font-bold text-gray-900">Báo cáo thống kê chi tiết</DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {data?.conferenceName}
                </DialogDescription>
              </DialogHeader>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {/* Section 1: Tổng quan bán vé */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Tổng quan doanh thu
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-600 font-medium">Tổng vé đã bán</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{totalTicketsSold}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-gray-600 font-medium">Bán thành công </p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{totalNotRefundedTicket}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-gray-600 font-medium">Đã hoàn tiền </p>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{totalTicketRefunded}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs text-gray-600 font-medium">Đang xử lý</p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Tình trạng check-in */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Tình trạng check-in
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-gray-600 font-medium">Thành công</p>
                      </div>
                      <p className="text-3xl font-bold text-green-600">{totalHasCheckin}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-600 font-medium">Chưa check-in</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{notCheckedIn}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-gray-600 font-medium">Quá hạn</p>
                      </div>
                      <p className="text-3xl font-bold text-orange-600">{totalExpireCheckin}</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Phân tích doanh thu */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    Phân tích doanh thu
                  </h3>
                  <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Doanh thu</p>
                          <p className="text-xs text-gray-500">Bao gồm cả vé đã hoàn và chưa hoàn</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-red-700 font-medium">Số tiền đã hoàn trả</p>
                          <p className="text-xs text-gray-500">Khách đã hủy và đã được hoàn tiền</p>
                        </div>
                        <p className="text-xl font-bold text-red-700">- {formatCurrency(totalRefundedAmount)}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                        <div>
                          <p className="text-sm text-green-700 font-bold">Doanh thu thực tế</p>
                          <p className="text-xs text-gray-500">Số tiền từ vé bán thành công</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenueWithoutRefunded)}</p>
                      </div>

                      {isCollaborator && hasCommissionData && (
                        <>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-sm text-orange-700 font-medium">Phí hoa hồng</p>
                              <p className="text-xs text-gray-500">Phí dịch vụ cho ConfRadar</p>
                            </div>
                            <p className="text-xl font-bold text-orange-700">- {formatCurrency(totalCommission)}</p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t-2 border-green-300 bg-green-50 -mx-5 -mb-5 px-5 py-4 rounded-b-lg">
                            <div>
                              <p className="text-base text-green-700 font-bold">Số tiền thực nhận</p>
                              <p className="text-xs text-green-600">Sau khi trừ hoàn tiền và phí hoa hồng</p>
                            </div>
                            <p className="text-3xl font-bold text-green-700">{formatCurrency(netRevenue)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4: Chi tiết từng loại vé */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Chi tiết theo từng loại vé
                  </h3>
                  
                  {ticketList.map((ticket, idx) => (
                    <div key={idx} className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                      {/* Header loại vé */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-gray-900">{ticket.ticketName}</p>
                            <p className="text-xs text-gray-600 mt-1">Giá gốc: {formatCurrency(ticket.ticketPrice)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Đã bán</p>
                            <p className="text-2xl font-bold text-indigo-600">{ticket.soldSlot} vé</p>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết các giai đoạn */}
                      <div className="p-4 space-y-3">
                        {ticket.phases.map((phase, pIdx) => (
                          <div key={pIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {/* Thông tin giai đoạn */}
                            <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{phase.phaseName}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Giá sau giảm {phase.applyPercent}%: <span className="font-semibold text-indigo-600">{formatCurrency(phase.actualPrice)}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Đã bán</p>
                                <p className="text-lg font-bold text-gray-900">{phase.soldSlot} vé</p>
                              </div>
                            </div>
                            
                            {/* Tình trạng check-in */}
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Tình trạng check-in:</p>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="bg-green-50 rounded p-2 border border-green-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-700 font-medium">Thành công</span>
                                  </div>
                                  <p className="text-lg font-bold text-green-900">{phase.hasCheckin}</p>
                                </div>
                                
                                <div className="bg-blue-50 rounded p-2 border border-blue-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <AlertCircle className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs text-blue-700 font-medium">Chưa check-in</span>
                                  </div>
                                  <p className="text-lg font-bold text-blue-900">
                                    {phase.totalNotRefuned - phase.hasCheckin - phase.expireCheckin}
                                  </p>
                                </div>
                                
                                <div className="bg-orange-50 rounded p-2 border border-orange-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <XCircle className="w-3 h-3 text-orange-600" />
                                    <span className="text-xs text-orange-700 font-medium">Quá hạn</span>
                                  </div>
                                  <p className="text-lg font-bold text-orange-900">{phase.expireCheckin}</p>
                                </div>
                                
                                <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="w-3 h-3 text-yellow-600" />
                                    <span className="text-xs text-yellow-700 font-medium">Đang chờ</span>
                                  </div>
                                  <p className="text-lg font-bold text-yellow-900">{phase.pending}</p>
                                </div>
                              </div>
                            </div>

                            {/* Tình trạng hoàn tiền */}
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Giai đoạn:</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-green-50 rounded p-3 border border-green-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-green-700 font-medium">Bán thành công</span>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </div>
                                  <p className="text-xl font-bold text-green-900 mb-1">{phase.totalNotRefuned} vé</p>
                                  <p className="text-xs text-green-600">{formatCurrency(phase.totalAmountNotRefunded)}</p>
                                </div>
                                
                                <div className="bg-red-50 rounded p-3 border border-red-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-red-700 font-medium">Đã hoàn trả</span>
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </div>
                                  <p className="text-xl font-bold text-red-900 mb-1">{phase.totalRefunded} vé</p>
                                  <p className="text-xs text-red-600">- {formatCurrency(phase.totalAmountRefunded)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Doanh thu */}
                            <div className="pt-3 border-t-2 border-gray-300 bg-white -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-600">Doanh thu giai đoạn:</span>
                                <span className="text-lg font-bold text-indigo-600">{formatCurrency(phase.revenue)}</span>
                              </div>

                              {isCollaborator && phase.commission != null && phase.commission > 0 && (
                                <>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-orange-600">Hoa hồng hệ thống ({phase.commissionPercent}%)</span>
                                    <span className="font-semibold text-orange-600">- {formatCurrency(phase.commission)}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-sm text-green-700 font-bold">Bạn nhận được:</span>
                                    <span className="text-lg font-bold text-green-700">{formatCurrency(phase.revenue - phase.commission)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tổng kết loại vé */}
                      <div className="bg-indigo-50 p-4 border-t-2 border-indigo-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            Tổng doanh thu ({ticket.ticketName})
                          </span>
                          <span className="text-2xl font-bold text-indigo-700">
                            {formatCurrency(ticket.phases.reduce((sum, p) => sum + p.revenue, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Đang xuất file...' : 'Tải xuống báo cáo Excel'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Card nhỏ - Tổng quan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
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
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                {isCollaborator && hasCommissionData ? (
                  <>
                    <p className="text-xs text-gray-500">Nhận được</p>
                    <p className="text-base font-bold text-green-700">{formatCurrency(netRevenue)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">Doanh thu</p>
                    <p className="text-base font-bold text-green-700">{formatCurrency(totalRevenueWithoutRefunded)}</p>
                  </>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  Tổng thu: {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
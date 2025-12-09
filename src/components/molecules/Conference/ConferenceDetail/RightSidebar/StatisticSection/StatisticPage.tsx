"use client";

import { Fragment } from 'react';
import { useState, useEffect } from "react";
import { TrendingUp, Download, CheckCircle, XCircle, Clock, AlertCircle, Users, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useGetSoldTicketQuery, useExportSoldTicketQuery } from "@/redux/services/statistics.service";
import type { GroupedTicket } from "@/types/statistics.type";
import { formatCurrency } from "@/helper/format";
import { useAuth } from "@/redux/hooks/useAuth";


export default function StatisticsDashboard() {
    const router = useRouter();
    const { id } = useParams();
    const conferenceId = id as string;
    const [exportTriggered, setExportTriggered] = useState(false);

    const { user } = useAuth();
    const userRoles = user?.role || [];
    const isCollaborator = userRoles.includes("Collaborator");
    const isOrganizer = userRoles.includes("Conference Organizer");

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
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isErrorStats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</p>
                    <p className="text-sm text-gray-600">Vui lòng thử lại sau</p>
                </div>
            </div>
        );
    }

    const data = soldTicketResponse?.data;
    const totalRevenue = data?.totalRevenue || 0;
    const totalTicketsSold = data?.totalTicketsSold || 0;
    const totalRefundedAmount = data?.totalRefundedAmount || 0;
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
            isAuthor: phase.isAuthor,
        });
        return acc;
    }, {} as Record<string, GroupedTicket>);

    const ticketList = Object.values(groupedTickets || {});
    // const notCheckedIn = totalNotRefundedTicket - totalHasCheckin - totalExpireCheckin;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Thống kê doanh thu</h1>
                            <p className="text-sm text-gray-600 mt-0.5">{data?.conferenceName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-400 border border-blue-400  hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative bg-blue-400 text-white rounded-xl p-6 flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-5 right-5">
                            <Users className="w-5 h-5 opacity-70" />
                        </div>
                        <div className="text-3xl font-bold">{totalTicketsSold}</div>
                        <div className="text-xs mt-1 opacity-80">Tổng vé đã bán</div>
                    </div>

                    <div className="relative bg-green-100 text-green-900 rounded-xl p-6 flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-5 right-5">
                            <CheckCircle className="w-5 h-5 opacity-70" />
                        </div>
                        <div className="text-3xl font-bold">{totalNotRefundedTicket}</div>
                        <div className="text-xs mt-1 opacity-80">Bán thành công</div>
                    </div>

                    <div className="relative bg-red-100 text-red-900 rounded-xl p-6 flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-5 right-5">
                            <XCircle className="w-5 h-5 opacity-70" />
                        </div>
                        <div className="text-3xl font-bold">{totalTicketRefunded}</div>
                        <div className="text-xs mt-1 opacity-80">Đã hoàn tiền</div>
                    </div>

                    <div className="relative bg-yellow-100 text-yellow-900 rounded-xl p-6 flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-5 right-5">
                            <Clock className="w-5 h-5 opacity-70" />
                        </div>
                        <div className="text-3xl font-bold">{totalPending}</div>
                        <div className="text-xs mt-1 opacity-80">Đang xử lý</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {isCollaborator ? "Thu nhập của bạn" : "Phân tích doanh thu"}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Tổng doanh thu</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Bao gồm tất cả chi phí</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-red-700 font-medium">Đã hoàn tiền</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Khách đã hủy & đã hoàn tiền lại cho khách hàng</p>
                                </div>
                                <p className="text-xl font-bold text-red-700">{formatCurrency(totalRefundedAmount)}</p>
                            </div>

                            <div className="flex justify-between items-center border-t-2 border-gray-300">
                            </div>

                            {hasCommissionData && isCollaborator && (
                                <>
                                    <div className="flex justify-between items-center pt-4">
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Phí liên kết bán vé ConfRadar</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Số tiền ConfRadar nhận</p>
                                        </div>
                                        <p className="text-xl font-bold text-gray-600">{formatCurrency(totalToConfRadar)}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium">Số tiền đối tác nhận được</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Số tiền nhận được sau khi trừ phí hoa hồng</p>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalCommission)}</p>
                                    </div>
                                </>
                            )}

                            {hasCommissionData && isOrganizer && (
                                <>
                                    {totalCommission > 0 && (
                                        <div className="flex justify-between items-center pt-4">
                                            <div>
                                                <p className="text-sm text-yellow-600 font-medium">Chi phí hoa hồng đối tác</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Số tiền phải chuyển cho đối tác</p>
                                            </div>
                                            <p className="text-xl font-bold text-yellow-600">{formatCurrency(totalCommission)}</p>
                                        </div>
                                    )}

                                    {totalToConfRadar > 0 && (
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                            <div>
                                                <p className="text-sm text-green-700 font-medium">Chi phí nền tảng ConfRadar</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Phí dịch vụ nền tảng</p>
                                            </div>
                                            <p className="text-xl font-bold text-green-700">{formatCurrency(totalToConfRadar)}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            Tình trạng check-in
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Thành công</p>
                                        <p className="text-xs text-gray-500">Đã check-in</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-green-600">{totalHasCheckin}</p>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Chưa check-in</p>
                                        <p className="text-xs text-gray-500">Chưa tham dự</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">{totalPending}</p>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Quá hạn</p>
                                        <p className="text-xs text-gray-500">Hết hạn check-in</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-orange-600">{totalExpireCheckin}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Chi tiết theo loại vé
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Loại vé</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Giai đoạn</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Đã bán</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Giá bán</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {ticketList.map((ticket, idx) => (
                                    <Fragment key={`ticket-${idx}`}>
                                        {ticket.phases.map((phase, pIdx) => (
                                            <tr
                                                key={`${ticket.ticketName}-${phase.phaseName}-${pIdx}`}
                                                className={`transition-colors ${
                                                    phase.isAuthor 
                                                        ? 'bg-blue-50' 
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                {pIdx === 0 && (
                                                    <td rowSpan={ticket.phases.length} className="px-6 py-4 border-r border-gray-200">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{ticket.ticketName}</p>
                                                            <p className="text-xs text-gray-500 mt-1">Giá gốc: {formatCurrency(ticket.ticketPrice)}</p>
                                                            <p className="text-xs font-medium text-indigo-600 mt-1">Tổng: {ticket.soldSlot}</p>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{phase.phaseName}</p>
                                                        <p className="text-xs text-gray-500">Giảm {phase.applyPercent}%</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-lg font-medium text-blue-800">
                                                        {phase.soldSlot}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-semibold text-yellow-900">{formatCurrency(phase.actualPrice)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-semibold text-green-600">{formatCurrency(phase.revenue)}</p>
                                                    {isCollaborator && phase.commission != null && phase.commission > 0 && (
                                                        <p className="text-xs text-blue-600 mt-1">Nhận được: {formatCurrency(phase.commission)}</p>
                                                    )}
                                                    {isOrganizer && (phase.commission != null || phase.amountToConfRadar != null) && (
                                                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                            {phase.commission != null && phase.commission > 0 && (
                                                                <div>Hoa hồng đối tác: {formatCurrency(phase.commission)}</div>
                                                            )}
                                                            {phase.amountToConfRadar != null && phase.amountToConfRadar > 0 && (
                                                                <div>Phí ConfRadar: {formatCurrency(phase.amountToConfRadar)}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
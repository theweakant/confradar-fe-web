// components/RightSidebar/StatisticsSection.tsx
"use client";

import { useState } from "react";
import { TrendingUp, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import type { CommonConference } from "@/types/conference.type";

// Interfaces for ticket statistics
interface Phase {
  pricePhaseId?: string;
  phaseName: string;
  applyPercent: number;
  startDate: string;
  endDate: string;
  totalslot: number;
  soldSlot?: number;
}

interface Ticket {
  ticketId?: string;
  priceId?: string;
  ticketPrice: number;
  ticketName: string;
  ticketDescription: string;
  totalSlot: number;
  soldSlot?: number;
  phases: Phase[];
}

interface StatisticsSectionProps {
  conference: CommonConference;
  totalRegistered?: number;
  isCollaborator?: boolean;
  commissionRate?: number; 
}

export function StatisticsSection({ 
  conference,
  totalRegistered = 0,
  isCollaborator = false,
  commissionRate = 0.15
}: StatisticsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock ticket data - replace with actual data from API
  const mockTickets: Ticket[] = [
    {
      ticketId: "1",
      ticketName: "Vé Standard",
      ticketPrice: 500000,
      ticketDescription: "Vé tham dự tiêu chuẩn",
      totalSlot: 200,
      soldSlot: 150,
      phases: [
        {
          pricePhaseId: "1-1",
          phaseName: "Early Bird",
          applyPercent: 70,
          startDate: "2025-01-01",
          endDate: "2025-02-01",
          totalslot: 80,
          soldSlot: 80
        },
        {
          pricePhaseId: "1-2",
          phaseName: "Regular",
          applyPercent: 100,
          startDate: "2025-02-01",
          endDate: "2025-03-01",
          totalslot: 120,
          soldSlot: 70
        }
      ]
    },
    {
      ticketId: "2",
      ticketName: "Vé VIP",
      ticketPrice: 1000000,
      ticketDescription: "Vé tham dự VIP",
      totalSlot: 50,
      soldSlot: 35,
      phases: [
        {
          pricePhaseId: "2-1",
          phaseName: "Early Bird",
          applyPercent: 80,
          startDate: "2025-01-01",
          endDate: "2025-02-01",
          totalslot: 20,
          soldSlot: 20
        },
        {
          pricePhaseId: "2-2",
          phaseName: "Regular",
          applyPercent: 100,
          startDate: "2025-02-01",
          endDate: "2025-03-01",
          totalslot: 30,
          soldSlot: 15
        }
      ]
    }
  ];

  const totalSlots = conference.totalSlot || 0;
  const availableSlots = conference.availableSlot || 0;
  const soldSlots = totalSlots - availableSlots;
  const soldPercentage = totalSlots > 0 ? Math.round((soldSlots / totalSlots) * 100) : 0;

  // Calculate total revenue
  const calculateRevenue = () => {
    let total = 0;
    mockTickets.forEach(ticket => {
      ticket.phases.forEach(phase => {
        const phasePrice = ticket.ticketPrice * (phase.applyPercent / 100);
        const phaseSold = phase.soldSlot || 0;
        total += phasePrice * phaseSold;
      });
    });
    return total;
  };

  const totalRevenue = calculateRevenue();
  const commission = totalRevenue * commissionRate;
  const netRevenue = totalRevenue - commission;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Thống kê</h3>
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
      
      <div className="space-y-4">
        {/* Total Tickets */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng vé</p>
              <p className="text-lg font-bold text-gray-900">{totalSlots}</p>
            </div>
          </div>
        </div>

        {/* Sold Tickets */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Đã bán</p>
              <p className="text-lg font-bold text-gray-900">
                {soldSlots}
                <span className="text-sm text-gray-500 font-normal ml-1">
                  ({soldPercentage}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Tiến độ bán vé</span>
            <span className="text-xs font-semibold text-blue-600">{soldPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${soldPercentage}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                {isCollaborator ? "Doanh thu (sau hoa hồng)" : "Tổng doanh thu"}
              </p>
              <p className="text-sm font-bold text-gray-900">
                {(isCollaborator ? netRevenue : totalRevenue).toLocaleString('vi-VN')} VND
              </p>
              {isCollaborator && (
                <p className="text-xs text-orange-600 mt-0.5">
                  Hoa hồng: {commission.toLocaleString('vi-VN')} VND ({commissionRate * 100}%)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Registered Users Count */}
        {totalRegistered > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Người đã đăng ký</p>
              <p className="text-sm font-bold text-gray-900">{totalRegistered}</p>
            </div>
          </div>
        )}

        {/* Expanded Revenue Details */}
        {isExpanded && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Chi tiết doanh thu</h4>
            
            {mockTickets.map((ticket) => {
              const ticketRevenue = ticket.phases.reduce((sum, phase) => {
                const phasePrice = ticket.ticketPrice * (phase.applyPercent / 100);
                const phaseSold = phase.soldSlot || 0;
                return sum + (phasePrice * phaseSold);
              }, 0);

              return (
                <div key={ticket.ticketId} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {/* Ticket Header */}
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
                        {ticket.soldSlot}/{ticket.totalSlot}
                      </p>
                    </div>
                  </div>

                  {/* Phases */}
                  <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                    {ticket.phases.map((phase) => {
                      const phasePrice = ticket.ticketPrice * (phase.applyPercent / 100);
                      const phaseSold = phase.soldSlot || 0;
                      const phaseRevenue = phasePrice * phaseSold;

                      return (
                        <div key={phase.pricePhaseId} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-700">
                              {phase.phaseName}
                              <span className="text-gray-500 ml-1">
                                ({phase.applyPercent}%)
                              </span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {phaseSold}/{phase.totalslot} vé
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {phasePrice.toLocaleString('vi-VN')} VND/vé
                            </p>
                            <p className="text-xs font-semibold text-green-600">
                              {phaseRevenue.toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Total */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-700">Tổng thu ({ticket.ticketName})</p>
                      <p className="text-sm font-bold text-blue-600">
                        {ticketRevenue.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Grand Total */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Tổng doanh thu</p>
                  <p className="text-lg font-bold text-blue-600">
                    {totalRevenue.toLocaleString('vi-VN')} VND
                  </p>
                </div>
                
                {isCollaborator && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-orange-700">Hoa hồng ({commissionRate * 100}%)</p>
                      <p className="font-semibold text-orange-700">
                        - {commission.toLocaleString('vi-VN')} VND
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

      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
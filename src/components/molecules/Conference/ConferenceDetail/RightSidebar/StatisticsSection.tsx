// components/RightSidebar/StatisticsSection.tsx
"use client";

import { TrendingUp, Users, DollarSign } from "lucide-react";
import type { CommonConference } from "@/types/conference.type";

interface StatisticsSectionProps {
  conference: CommonConference;
  totalRegistered?: number; // Pass from RegisteredUserTab data
}

export function StatisticsSection({ 
  conference,
  totalRegistered = 0 
}: StatisticsSectionProps) {
  const totalSlots = conference.totalSlot || 0;
  const availableSlots = conference.availableSlot || 0;
  const soldSlots = totalSlots - availableSlots;
  const soldPercentage = totalSlots > 0 ? Math.round((soldSlots / totalSlots) * 100) : 0;

  // Calculate estimated revenue (mock - should come from API)
  const estimatedRevenue = soldSlots * 50000; // 50k VND per ticket (example)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Thống kê</h3>
      
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

        {/* Revenue (Optional - Mock Data) */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Doanh thu ước tính</p>
              <p className="text-sm font-bold text-gray-900">
                {estimatedRevenue.toLocaleString('vi-VN')} VND
              </p>
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
// components/pages/ConferenceDetailPage/Tab/CustomerTab.tsx
"use client";

import { useState } from "react";
import { Ticket, User, Calendar, DollarSign } from "lucide-react";
import { useGetTicketHoldersQuery } from "@/redux/services/statistics.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { formatCurrency } from "@/helper/format";
import { CustomerTicketModal } from "./Ticket/CustomerTicketModal";
import type { TicketHolder } from "@/types/statistics.type";

interface CustomerTabProps {
  conferenceId: string;
  conferenceType: "technical" | "research" | null;
}

export function CustomerTab({ conferenceId, conferenceType }: CustomerTabProps) {
  const { data, isLoading, isError } = useGetTicketHoldersQuery(
    conferenceId ? conferenceId : skipToken
  );

  const ticketHolders = Array.isArray(data?.data?.items) ? data.data.items : [];
  const totalRevenue = ticketHolders.reduce((sum, t) => sum + t.actualPrice, 0);

  const [selectedTicket, setSelectedTicket] = useState<TicketHolder | null>(null);

  const closeModal = () => setSelectedTicket(null);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-gray-600">Đang tải danh sách người mua vé...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
        <p className="text-sm text-gray-500">Không thể lấy danh sách người mua vé. Vui lòng thử lại.</p>
      </div>
    );
  }


  return (
    <>
      <div className="space-y-4 p-6">
        {/* Header with stats */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Người mua vé</h2>
            <p className="text-sm text-gray-500 mt-0.5">{ticketHolders.length} vé đã bán</p>
          </div>
          {ticketHolders.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-700 font-medium">Tổng thu</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          )}
        </div>

        {ticketHolders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có ai mua vé</h3>
            <p className="text-sm text-gray-500">Chưa có giao dịch nào được ghi nhận</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketHolders.map((holder) => (
              <div
                key={holder.ticketId}
                className="group p-4 border border-gray-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedTicket(holder)}
              >
                {/* Customer name & status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {holder.customerName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{holder.ticketTypeName}</p>
                    </div>
                  </div>
                </div>

                {/* Key info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(holder.purchaseDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(holder.actualPrice)}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        holder.overallStatus === "Đã thanh toán"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {holder.overallStatus}
                    </span>
                  </div>
                </div>

                {/* Click hint */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center group-hover:text-blue-500 transition-colors">
                    Nhấn để xem chi tiết
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <CustomerTicketModal
          open={true}
          onOpenChange={closeModal}
          ticket={selectedTicket}
          conferenceType={conferenceType}
        />
      )}
    </>
  );
}
"use client";

import { Ticket, User, Calendar, CreditCard } from "lucide-react";
import { useGetTicketHoldersQuery } from "@/redux/services/statistics.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { formatCurrency } from "@/helper/format"; 
interface CustomerTabProps {
  conferenceId: string;
}

interface TicketHolder {
  ticketId: string;
  customerName: string;
  ticketTypeName: string;
  phaseName: string;
  actualPrice: number;
  purchaseDate: string; 
  status: string;
}

export function CustomerTab({ conferenceId }: CustomerTabProps) {
  const { data, isLoading, isError } = useGetTicketHoldersQuery(
    conferenceId ? conferenceId : skipToken
  );

  const ticketHolders = data?.data || [];

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-600">Đang tải danh sách người mua vé...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
        <p className="text-gray-500">Không thể lấy danh sách người mua vé. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Người mua vé ({ticketHolders.length})
        </h2>
        <div className="text-sm text-gray-500">
          Tổng thu:{" "}
          <span className="font-bold text-green-700">
            {formatCurrency(
              ticketHolders.reduce((sum, t) => sum + t.actualPrice, 0)
            )}
          </span>
        </div>
      </div>

      {ticketHolders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có ai mua vé</h3>
          <p className="text-gray-500">Chưa có giao dịch nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketHolders.map((holder) => (
            <div
              key={holder.ticketId}
              className="p-5 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{holder.customerName}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Loại vé: {holder.ticketTypeName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Đợt: {holder.phaseName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Mua ngày: {formatDate(holder.purchaseDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              holder.status === "Đã thanh toán"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {holder.status}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(holder.actualPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
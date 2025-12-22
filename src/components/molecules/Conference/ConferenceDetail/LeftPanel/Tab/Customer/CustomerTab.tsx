"use client";

import { useState } from "react";
import { Ticket, User, Calendar, CreditCard, DollarSign, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } from "@/redux/services/statistics.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { formatCurrency } from "@/helper/format";
import { CustomerTicketModal } from "./Ticket/CustomerTicketModal";
import type { TicketHolder, UserTransactionHistory, Transaction } from "@/types/statistics.type";

interface CustomerTabProps {
  conferenceId: string;
  conferenceType: "technical" | "research" | null;
  currentUserId?: string;
  conferenceOwnerId?: string;
}

export function CustomerTab({ conferenceId, conferenceType, currentUserId, conferenceOwnerId }: CustomerTabProps) {
  const { data: ticketData, isLoading: isLoadingTickets, isError: isErrorTickets } = useGetTicketHoldersQuery(
    conferenceId ? conferenceId : skipToken
  );

  const { data: transactionData, isLoading: isLoadingTransactions, isError: isErrorTransactions } = useGetTransactionHistoryQuery(
    conferenceId ? conferenceId : skipToken
  );

  const ticketHolders = Array.isArray(ticketData?.data?.items) ? ticketData.data.items : [];
  const userHistories = Array.isArray(transactionData?.data?.userHistories) ? transactionData.data.userHistories : [];

  const [selectedTicket, setSelectedTicket] = useState<TicketHolder | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [showAllUsers, setShowAllUsers] = useState(false);

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const displayedUsers = showAllUsers ? userHistories : userHistories.slice(0, 3);

  const closeModal = () => setSelectedTicket(null);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const renderTransactionTypeBadge = (type: string, status: string) => {
    if (type === "Hoàn tiền") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full border border-orange-200">
          Hoàn tiền
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        status === "Thành công"
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-gray-100 text-gray-700 border-gray-200"
      }`}>
        {status}
      </span>
    );
  };

  const isLoading = isLoadingTickets || isLoadingTransactions;
  const isError = isErrorTickets || isErrorTransactions;

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-gray-600">Đang tải dữ liệu...</p>
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
        <p className="text-sm text-gray-500">Không thể lấy thông tin người mua hoặc lịch sử giao dịch. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-3">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                Người mua
                <span className="text-sm font-normal text-gray-500">
                  ({ticketHolders.length} đã bán)
                </span>
              </h2>
            </div>
          </div>

          {ticketHolders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có người mua</h3>
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {holder.customerName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{holder.ticketTypeName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(holder.purchaseDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-md font-semibold text-blue-600">
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

        <div>
          <div className="pb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Lịch sử giao dịch
            </h2>
          </div>

          {userHistories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Chưa có lịch sử giao dịch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedUsers.map((user) => {
                const isExpanded = expandedUsers.has(user.userId);
                const displayedTransactions = isExpanded ? user.transactions : user.transactions.slice(0, 1);
                const hasMoreTransactions = user.transactions.length > 1;

                return (
                  <div
                    key={user.userId}
                    className="border border-gray-200 rounded-xl bg-white overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-blue-200">
                            <span className="text-sm font-semibold text-gray-900">
                              {user.transactions.length} giao dịch
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {displayedTransactions.map((tx: Transaction) => (
                        <div key={tx.transactionId} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-2">{tx.ticketType}</p>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                    {tx.paymentMethod}
                                  </span>
                                  {renderTransactionTypeBadge(tx.type, tx.status)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">
                                  {formatCurrency(tx.amount)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              {tx.transactionCode && (
                                <>
                                  <span className="text-xs text-gray-500">Mã GD: </span>
                                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                                    {tx.transactionCode}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(tx.time)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasMoreTransactions && (
                      <button
                        onClick={() => toggleUserExpand(user.userId)}
                        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-blue-600 flex items-center justify-center gap-2 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Thu gọn
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Xem thêm {user.transactions.length - 1} giao dịch
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {userHistories.length > 3 && (
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-all"
                >
                  {showAllUsers ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Thu gọn danh sách
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Xem thêm {userHistories.length - 3} người dùng khác
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedTicket && (
        <CustomerTicketModal
          open={true}
          onOpenChange={closeModal}
          ticket={selectedTicket}
          conferenceType={conferenceType}
          currentUserId={currentUserId}
          conferenceOwnerId={conferenceOwnerId}
        />
      )}
    </>
  );
}
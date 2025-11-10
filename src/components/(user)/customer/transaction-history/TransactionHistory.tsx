"use client";

import { CreditCard, Calendar, Download, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransaction } from "@/redux/hooks/transaction/useTransaction";
import { useEffect } from "react";

export default function TransactionHistory() {
  const { transactions, loading, transactionsError, fetchTransactions } =
    useTransaction();

  const filterOptions = [
    { id: "recent", label: "Gần đây", active: true },
    { id: "this-month", label: "Tháng này", active: false },
    { id: "this-year", label: "Năm nay", active: false },
    { id: "all", label: "Tất cả", active: false },
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (statusName?: string) => {
    const status = statusName?.toLowerCase();
    switch (status) {
      case "success":
      case "thành công":
      case "completed":
        return (
          <Badge className="bg-green-800 text-green-200 border-green-600">
            Thành công
          </Badge>
        );
      case "pending":
      case "đang chờ":
      case "processing":
        return (
          <Badge className="bg-yellow-800 text-yellow-200 border-yellow-600">
            Đang chờ
          </Badge>
        );
      case "failed":
      case "thất bại":
      case "cancelled":
        return (
          <Badge className="bg-red-800 text-red-200 border-red-600">
            Thất bại
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-800 text-gray-200 border-gray-600">
            {statusName || "Không xác định"}
          </Badge>
        );
    }
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return "0đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải lịch sử giao dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              Có lỗi xảy ra khi tải dữ liệu
            </div>
            <p className="text-gray-400">{transactionsError.data?.message}</p>
            <Button
              onClick={() => fetchTransactions()}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Lịch sử thanh toán
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Theo dõi các giao dịch và thanh toán trên hệ thống
          </p>
        </div>

        {/* Filter Options */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                variant={option.active ? "default" : "outline"}
                className={`whitespace-nowrap ${option.active
                  ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                  }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {transactions.map((txn) => (
            <Card
              key={txn.transactionId}
              className="bg-gray-800 border-gray-700 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-shadow"
            >
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDate(txn.createdAt)}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    Giao dịch {txn.transactionId || "N/A"}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>
                      Số tiền:{" "}
                      <span className="font-semibold text-purple-400">
                        {formatAmount(txn.amount, txn.currency)}
                      </span>
                    </span>
                    <span>
                      Phương thức: {txn.paymentMethodName || "Không xác định"}
                    </span>
                    {getStatusBadge(txn.paymentStatusName)}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Mã giao dịch: {txn.transactionId}
                  </div>
                  {txn.transactionCode && (
                    <div className="text-xs text-gray-500 font-mono">
                      Mã tham chiếu: {txn.transactionCode}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                  {txn.paymentStatusName
                    ?.toLowerCase()
                    .includes("thành công") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
                      >
                        <Download className="h-4 w-4" />
                        Tải biên lai
                      </Button>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
                  >
                    Chi tiết
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {transactions.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Chưa có giao dịch
            </h3>
            <p className="text-gray-500">
              Thực hiện thanh toán để hiển thị lịch sử giao dịch
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

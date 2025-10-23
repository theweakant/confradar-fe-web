"use client";

import { CreditCard, Calendar, Clock, Download, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TransactionHistory() {
    const filterOptions = [
        { id: "recent", label: "Gần đây", active: true },
        { id: "this-month", label: "Tháng này", active: false },
        { id: "this-year", label: "Năm nay", active: false },
        { id: "all", label: "Tất cả", active: false },
    ];

    const transactions = [
        {
            id: "1",
            title: "Thanh toán vé Vietnam AI Conference 2024",
            amount: "1,500,000đ",
            date: "15 tháng 10, 2024",
            status: "success",
            paymentMethod: "Credit Card",
            transactionId: "TXN-001234",
        },
        {
            id: "2",
            title: "Thanh toán vé Blockchain Việt Nam",
            amount: "750,000đ",
            date: "20 tháng 10, 2024",
            status: "success",
            paymentMethod: "Momo",
            transactionId: "TXN-005678",
        },
        {
            id: "3",
            title: "Thanh toán vé Startup Pitch Competition",
            amount: "2,000,000đ",
            date: "05 tháng 11, 2024",
            status: "pending",
            paymentMethod: "Bank Transfer",
            transactionId: "TXN-009876",
        },
        {
            id: "4",
            title: "Thanh toán vé Digital Transformation 2024",
            amount: "450,000đ",
            date: "12 tháng 9, 2024",
            status: "failed",
            paymentMethod: "Credit Card",
            transactionId: "TXN-012345",
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return <Badge className="bg-green-100 text-green-700">Thành công</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700">Đang chờ</Badge>;
            case "failed":
                return <Badge className="bg-red-100 text-red-700">Thất bại</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-8 w-8 text-purple-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Lịch sử thanh toán
                        </h1>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
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
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
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
                        <Card key={txn.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Calendar className="h-4 w-4" />
                                        {txn.date}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                        {txn.title}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>Số tiền: <span className="font-semibold">{txn.amount}</span></span>
                                        <span>Phương thức: {txn.paymentMethod}</span>
                                        {getStatusBadge(txn.status)}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        Mã giao dịch: {txn.transactionId}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3 sm:mt-0">
                                    {txn.status === "success" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Tải biên lai
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
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
                        <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">
                            Chưa có giao dịch
                        </h3>
                        <p className="text-gray-400">
                            Thực hiện thanh toán để hiển thị lịch sử giao dịch
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

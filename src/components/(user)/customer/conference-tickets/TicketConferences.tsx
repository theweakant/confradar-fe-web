"use client";

import { Ticket, MapPin, Calendar, Users, ExternalLink, QrCode, Download, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTicket } from "@/redux/hooks/ticket/useTicket";
import { useEffect } from "react";

export default function TicketConferences() {
  const { tickets, loading, ticketsError, refetchTickets } = useTicket();

  const filterOptions = [
    { id: "upcoming", label: "Sắp diễn ra", active: true },
    { id: "today", label: "Hôm nay", active: false },
    { id: "this-week", label: "Tuần này", active: false },
    { id: "this-month", label: "Tháng này", active: false },
    { id: "all", label: "Tất cả", active: false },
  ];

  useEffect(() => {
    refetchTickets();
  }, []);

  const getStatusBadge = (isRefunded?: boolean) => {
    if (isRefunded) {
      return <Badge className="bg-gray-800 text-gray-200 border-gray-600">Đã hoàn tiền</Badge>;
    }
    return <Badge className="bg-green-800 text-green-200 border-green-600">Đã xác nhận</Badge>;
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Miễn phí";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải vé của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu</div>
            <p className="text-gray-400">{ticketsError}</p>
            <Button 
              onClick={() => refetchTickets()} 
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
            <Ticket className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Vé sự kiện của tôi
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Quản lý và theo dõi các vé hội nghị bạn đã mua
          </p>
        </div>

        {/* Filter/Sort Options */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                variant={option.active ? "default" : "outline"}
                className={`whitespace-nowrap ${
                  option.active 
                    ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Card key={ticket.ticketId} className="bg-gray-800 border-gray-700 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-shadow">
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {formatDate(ticket.registeredDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.isRefunded)}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                        Vé hội nghị #{ticket.ticketId.slice(-8)}
                      </h2>

                      {/* Ticket Info */}
                      <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-800 text-purple-200 border-purple-600">
                              Vé tham dự
                            </Badge>
                            <span className="text-lg font-bold text-purple-400">
                              {formatPrice(ticket.actualPrice)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4" />
                            {formatDate(ticket.registeredDate)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Ngày đăng ký: {formatDate(ticket.registeredDate)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          Mã vé: {ticket.ticketId}
                        </div>
                        {ticket.transactionId && (
                          <div className="text-xs text-gray-500 font-mono">
                            Mã giao dịch: {ticket.transactionId}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <div className="flex gap-2">
                          {!ticket.isRefunded && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-purple-400 border-purple-600 hover:bg-purple-900/50 bg-gray-800"
                              >
                                <QrCode className="h-4 w-4" />
                                QR Code
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
                              >
                                <Download className="h-4 w-4" />
                                Tải vé
                              </Button>
                            </>
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
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Image */}
                <div className="lg:w-80 lg:flex-shrink-0">
                  <div className="h-48 lg:h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Ticket className="h-16 w-16 text-white/70" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Chưa có vé nào
            </h3>
            <p className="text-gray-500">
              Mua vé cho hội nghị đầu tiên của bạn
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
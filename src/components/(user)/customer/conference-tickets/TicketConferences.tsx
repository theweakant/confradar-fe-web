"use client";

import { Ticket, MapPin, Calendar, Users, ExternalLink, QrCode, Download, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TicketConferences() {
  const filterOptions = [
    { id: "upcoming", label: "Sắp diễn ra", active: true },
    { id: "today", label: "Hôm nay", active: false },
    { id: "this-week", label: "Tuần này", active: false },
    { id: "this-month", label: "Tháng này", active: false },
    { id: "all", label: "Tất cả", active: false },
  ];

  const ticketConferences = [
    {
      id: "1",
      title: "Vietnam AI & Data Science Conference 2024",
      date: "Thứ 7, 23 - 25 tháng 11, 2024",
      location: "TP. Hồ Chí Minh, Việt Nam",
      ticketType: "VIP Pass",
      ticketPrice: "1,500,000đ",
      purchaseDate: "Đã mua: 15 tháng 10, 2024",
      status: "confirmed",
      category: "Công nghệ",
      attendees: 892,
      venue: "Trung tâm Hội nghị Quốc gia",
      timeLeft: "Còn 12 ngày",
      qrCode: "VN-AI-2024-VIP-001234",
      image: "/images/ai-data-conference.jpg",
    },
    {
      id: "2", 
      title: "Hội nghị Blockchain & Cryptocurrency Việt Nam",
      date: "Chủ nhật, 01 - 02 tháng 12, 2024",
      location: "Hà Nội, Việt Nam",
      ticketType: "Standard Pass",
      ticketPrice: "750,000đ",
      purchaseDate: "Đã mua: 20 tháng 10, 2024",
      status: "confirmed",
      category: "Fintech",
      attendees: 445,
      venue: "Trung tâm Hội nghị FLC",
      timeLeft: "Còn 20 ngày",
      qrCode: "VN-CRYPTO-2024-STD-005678",
      image: "/images/blockchain-event.jpg",
    },
    {
      id: "3",
      title: "Vietnam Startup Pitch Competition 2024",
      date: "Thứ 5, 14 - 15 tháng 12, 2024",
      location: "Đà Nẵng, Việt Nam", 
      ticketType: "Investor Pass",
      ticketPrice: "2,000,000đ",
      purchaseDate: "Đã mua: 05 tháng 11, 2024",
      status: "confirmed",
      category: "Khởi nghiệp",
      attendees: 234,
      venue: "Ariyana Convention Centre",
      timeLeft: "Còn 33 ngày",
      qrCode: "VN-PITCH-2024-INV-009876",
      image: "/images/startup-pitch.jpg",
    },
    {
      id: "4",
      title: "Hội thảo Digital Transformation 2024",
      date: "Thứ 2, 28 - 29 tháng 10, 2024",
      location: "Cần Thơ, Việt Nam",
      ticketType: "Early Bird",
      ticketPrice: "450,000đ",
      purchaseDate: "Đã mua: 12 tháng 9, 2024",
      status: "expired", 
      category: "Chuyển đổi số",
      attendees: 567,
      venue: "Đại học Cần Thơ",
      timeLeft: "Đã kết thúc",
      qrCode: "VN-DX-2024-EB-012345",
      image: "/images/digital-transformation.jpg",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Đã xác nhận</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Chờ xác nhận</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-700">Đã hết hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTicketTypeBadge = (type: string) => {
    const colors = {
      "VIP Pass": "bg-purple-100 text-purple-700",
      "Standard Pass": "bg-blue-100 text-blue-700", 
      "Investor Pass": "bg-gold-100 text-yellow-700",
      "Early Bird": "bg-green-100 text-green-700"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700"}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Vé sự kiện của tôi
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
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
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-6">
          {ticketConferences.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {ticket.date}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          <Badge variant="secondary" className="w-fit">
                            {ticket.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                        {ticket.title}
                      </h2>

                      {/* Location & Venue */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{ticket.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 ml-6">
                          <span className="text-sm">{ticket.venue}</span>
                        </div>
                      </div>

                      {/* Ticket Info */}
                      <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getTicketTypeBadge(ticket.ticketType)}
                            <span className="text-lg font-bold text-purple-700">
                              {ticket.ticketPrice}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {ticket.timeLeft}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {ticket.purchaseDate}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          Mã vé: {ticket.qrCode}
                        </div>
                      </div>

                      {/* Attendees & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{ticket.attendees} người tham gia</span>
                        </div>
                        <div className="flex gap-2">
                          {ticket.status === "confirmed" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-purple-600 border-purple-600 hover:bg-purple-50"
                              >
                                <QrCode className="h-4 w-4" />
                                QR Code
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Tải vé
                              </Button>
                            </>
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
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Image */}
                <div className="lg:w-80 lg:flex-shrink-0">
                  <div className="h-48 lg:h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Ticket className="h-16 w-16 text-white/70" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {ticketConferences.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              Chưa có vé nào
            </h3>
            <p className="text-gray-400">
              Mua vé cho hội nghị đầu tiên của bạn
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
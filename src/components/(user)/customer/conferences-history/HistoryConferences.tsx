"use client";

import { History, MapPin, Calendar, Users, ExternalLink, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HistoryConferences() {
  const filterOptions = [
    { id: "most-recent", label: "Gần đây nhất", active: true },
    { id: "oldest", label: "Cũ nhất", active: false },
    { id: "highest-rated", label: "Đánh giá cao nhất", active: false },
    { id: "by-category", label: "Theo danh mục", active: false },
    { id: "alphabetical", label: "Theo bảng chữ cái", active: false },
  ];

  const historyConferences = [
    {
      id: "1",
      title: "Vietnam Tech Innovation Summit 2023",
      date: "Đã tham gia: 15 - 17 tháng 11, 2023",
      location: "TP. Hồ Chí Minh, Việt Nam",
      category: "Công nghệ",
      status: "Đã hoàn thành",
      rating: 5,
      attendees: 1024,
      certificate: true,
      feedback: "Hội nghị rất bổ ích với nhiều kiến thức mới về AI và IoT",
      image: "/images/tech-summit.jpg",
    },
    {
      id: "2",
      title: "Hội thảo Digital Marketing Việt Nam 2023",
      date: "Đã tham gia: 20 - 21 tháng 9, 2023",
      location: "Hà Nội, Việt Nam",
      category: "Marketing",
      status: "Đã hoàn thành",
      rating: 4,
      attendees: 567,
      certificate: true,
      feedback: "Nhiều case study thực tế và networking tốt",
      image: "/images/marketing-conference.jpg",
    },
    {
      id: "3",
      title: "Vietnam Fintech Conference 2023",
      date: "Đã tham gia: 05 - 06 tháng 8, 2023",
      location: "Đà Nẵng, Việt Nam",
      category: "Tài chính",
      status: "Đã hoàn thành",
      rating: 4,
      attendees: 389,
      certificate: false,
      feedback: "Tốt nhưng cần thêm workshop thực hành",
      image: "/images/fintech-conference.jpg",
    },
    {
      id: "4",
      title: "Hội nghị Khởi nghiệp Đông Nam Á 2023",
      date: "Đã tham gia: 12 - 14 tháng 6, 2023",
      location: "Cần Thơ, Việt Nam",
      category: "Khởi nghiệp",
      status: "Đã hoàn thành",
      rating: 5,
      attendees: 725,
      certificate: true,
      feedback: "Inspiring speakers và nhiều cơ hội kết nối",
      image: "/images/startup-asia.jpg",
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Lịch sử tham gia
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Các hội nghị bạn đã tham gia và đánh giá
          </p>
        </div>

        {/* Filter/Sort Options */}
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

        {/* Conference List */}
        <div className="space-y-6">
          {historyConferences.map((conference) => (
            <Card key={conference.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {conference.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-700 w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {conference.status}
                          </Badge>
                          <Badge variant="secondary" className="w-fit">
                            {conference.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                        {conference.title}
                      </h2>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{conference.location}</span>
                      </div>

                      {/* Rating & Certificate */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Đánh giá:</span>
                          {renderStars(conference.rating)}
                          <span className="text-sm text-gray-600">({conference.rating}/5)</span>
                        </div>
                        {conference.certificate && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600 w-fit">
                            Có chứng chí
                          </Badge>
                        )}
                      </div>

                      {/* Feedback */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 italic">
                          {/* "{conference.feedback}" */}
                          &quot;{conference.feedback}&quot;
                        </p>
                      </div>

                      {/* Attendees & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{conference.attendees} người đã tham gia</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            Xem chi tiết
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {conference.certificate && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Tải chứng chí
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Image */}
                <div className="lg:w-80 lg:flex-shrink-0">
                  <div className="h-48 lg:h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <CheckCircle className="h-16 w-16 text-white/70" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {historyConferences.length === 0 && (
          <div className="text-center py-16">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              Chưa có lịch sử tham gia
            </h3>
            <p className="text-gray-400">
              Tham gia hội nghị đầu tiên của bạn để xây dựng lịch sử
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { Heart, MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FavoriteConferences() {
  const filterOptions = [
    { id: "most-popular", label: "Phổ biến nhất", active: true },
    { id: "start-date-desc", label: "Ngày bắt đầu (Mới nhất)", active: false },
    { id: "most-attending", label: "Nhiều người tham gia", active: false },
    { id: "start-date-asc", label: "Ngày bắt đầu (Cũ nhất)", active: false },
    { id: "alphabetical", label: "Theo bảng chữ cái", active: false },
  ];

  const favoriteConferences = [
    {
      id: "1",
      title: "Hội thảo Trí tuệ Nhân tạo Việt Nam 2024",
      date: "Thứ 7, 15 - 17 tháng 11, 2024",
      location: "TP. Hồ Chí Minh, Việt Nam",
      price: "Từ 500,000đ",
      attendees: 324,
      category: "Công nghệ",
      image: "/images/ai-conference.jpg",
      isLiked: true,
    },
    {
      id: "2",
      title: "Vietnam Blockchain Summit 2024",
      date: "Chủ nhật, 20 - 22 tháng 10, 2024",
      location: "Hà Nội, Việt Nam",
      price: "Từ 750,000đ",
      attendees: 156,
      category: "Fintech",
      image: "/images/blockchain-summit.jpg",
      isLiked: true,
    },
    {
      id: "3",
      title: "Hội nghị Đổi mới Giáo dục Số",
      date: "Thứ 6, 05 - 06 tháng 12, 2024",
      location: "Đà Nẵng, Việt Nam",
      price: "Từ 300,000đ",
      attendees: 89,
      category: "Giáo dục",
      image: "/images/education-conference.jpg",
      isLiked: true,
    },
    {
      id: "4",
      title: "Vietnam Startup Ecosystem Conference",
      date: "Thứ 4, 25 - 26 tháng 9, 2024",
      location: "Cần Thơ, Việt Nam",
      price: "Từ 450,000đ",
      attendees: 267,
      category: "Khởi nghiệp",
      image: "/images/startup-conference.jpg",
      isLiked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-400 fill-current" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Hội nghị yêu thích
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Danh sách các hội nghị bạn đã đánh dấu yêu thích
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
                    ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                  }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Conference List */}
        <div className="space-y-6">
          {favoriteConferences.map((conference) => (
            <Card key={conference.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date & Category */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {conference.date}
                        </div>
                        <Badge variant="secondary" className="w-fit bg-gray-700 text-gray-300">
                          {conference.category}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                        {conference.title}
                      </h2>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{conference.location}</span>
                      </div>

                      {/* Price */}
                      <div className="text-lg font-semibold text-red-400">
                        {conference.price}
                      </div>

                      {/* Attendees & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{conference.attendees} người quan tâm</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Xem chi tiết
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Image */}
                <div className="lg:w-80 lg:flex-shrink-0">
                  <div className="h-48 lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-white/70" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {favoriteConferences.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Chưa có hội nghị yêu thích
            </h3>
            <p className="text-gray-500">
              Khám phá và đánh dấu những hội nghị bạn quan tâm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
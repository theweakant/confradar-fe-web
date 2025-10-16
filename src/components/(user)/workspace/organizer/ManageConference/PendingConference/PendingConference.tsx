"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Users, Tag, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PendingConference() {
  const [pendingConferences, setPendingConferences] = useState([
    {
      id: "1",
      title: "International Conference on Artificial Intelligence 2024",
      organizer: "Vietnam AI Association",
      category: "Công nghệ",
      location: "Hà Nội, Việt Nam",
      startDate: "2024-06-15",
      endDate: "2024-06-17",
      submittedDate: "2024-03-10",
      maxAttendees: 500,
      description: "Hội nghị quốc tế về trí tuệ nhân tạo và học máy, tập trung vào các ứng dụng thực tế trong công nghiệp."
    },
    {
      id: "2",
      title: "Southeast Asia Research Symposium 2024",
      organizer: "ASEAN Research Network",
      category: "Nghiên cứu",
      location: "Bangkok, Thailand",
      startDate: "2024-07-20",
      endDate: "2024-07-22",
      submittedDate: "2024-03-15",
      maxAttendees: 300,
      description: "Hội thảo nghiên cứu khu vực Đông Nam Á, tập trung vào phát triển bền vững và đổi mới sáng tạo."
    },
    {
      id: "3",
      title: "Digital Transformation Summit 2024",
      organizer: "Tech Innovation Hub",
      category: "Kinh doanh",
      location: "TP. Hồ Chí Minh, Việt Nam",
      startDate: "2024-08-10",
      endDate: "2024-08-12",
      submittedDate: "2024-03-20",
      maxAttendees: 800,
      description: "Hội nghị về chuyển đổi số cho doanh nghiệp, với các chuyên gia hàng đầu về công nghệ và quản trị."
    }
  ]);

  const handleApprove = (id: string) => {
    setPendingConferences(prev => prev.filter(c => c.id !== id));
    toast.success("Đã phê duyệt hội nghị thành công!");
  };

  const handleReject = (id: string) => {
    setPendingConferences(prev => prev.filter(c => c.id !== id));
    toast.error("Đã từ chối hội nghị!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/workspace/organizer/manage-conference">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Hội nghị chờ duyệt
          </h1>
          <p className="text-gray-600 mt-2">
            Danh sách các hội nghị đang chờ phê duyệt từ ban tổ chức
          </p>
        </div>

        <div className="grid gap-6">
          {pendingConferences.map((conference) => (
            <div
              key={conference.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {conference.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {conference.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Ban tổ chức: {conference.organizer}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="w-4 h-4 mr-2" />
                  <span>Danh mục: {conference.category}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{conference.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{conference.startDate} - {conference.endDate}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Sức chứa: {conference.maxAttendees} người</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Nộp ngày: {conference.submittedDate}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Chờ phê duyệt
                </span>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleReject(conference.id)}
                  >
                    Từ chối
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(conference.id)}
                  >
                    Phê duyệt
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingConferences.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có hội nghị chờ duyệt
            </h3>
            <p className="text-gray-600">
              Hiện tại không có hội nghị nào đang chờ phê duyệt
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
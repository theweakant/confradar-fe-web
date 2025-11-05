"use client";

import { useState } from "react";
import {
  MapPin,
  Building,
  Tag,
  Calendar,
  Home,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { RoomDetailProps, RoomOccupationSlot } from "@/types/room.type";
import { useGetRoomOccupationSlotsQuery } from "@/redux/services/room.service";

export function RoomDetail({ room, onClose }: RoomDetailProps) {
  const [activeTab, setActiveTab] = useState<"info" | "sessions">("info");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Only call API when we have both dates and user has searched
  const shouldFetch = hasSearched && startDate && endDate && activeTab === "sessions";
  
  const {
    data: occupationSlotsResponse,
    isLoading: slotsLoading,
    error: slotsError,
  } = useGetRoomOccupationSlotsQuery(
    {
      roomId: room.roomId,
      startDate,
      endDate,
    },
    {
      skip: !shouldFetch,
    }
  );

  const occupationSlots = occupationSlotsResponse?.data || [];

  const handleSearchSessions = () => {
    if (startDate && endDate) {
      setHasSearched(true);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {room.displayName}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Thông tin phòng
            </div>
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sessions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Lịch sử sử dụng
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "info" ? (
        /* Room Info Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Tên phòng</p>
                <p className="text-gray-900">{room.displayName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Mã phòng</p>
                <p className="text-gray-900">{room.number}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Mã điểm đến</p>
                <p className="text-gray-900">{room.destinationId}</p>
              </div>
            </div>
          </div>

          {/* Destination Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Thông tin điểm đến</p>
                <p className="text-gray-900 italic text-gray-500">
                  (Chưa có thông tin chi tiết — chỉ hiển thị mã điểm đến)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Ngày hiển thị</p>
                <p className="text-gray-900">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sessions Tab */
        <div className="space-y-6">
          {/* Date Filter */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Tìm kiếm lịch sử sử dụng phòng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Button
                  onClick={handleSearchSessions}
                  disabled={!startDate || !endDate || slotsLoading}
                  className="w-full flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {slotsLoading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          {hasSearched && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                Kết quả tìm kiếm ({occupationSlots.length} session)
              </h4>
              
              {slotsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : slotsError ? (
                <div className="text-center py-8 text-red-500">
                  Có lỗi xảy ra khi tải dữ liệu
                </div>
              ) : occupationSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có session nào trong khoảng thời gian đã chọn
                </div>
              ) : (
                <div className="space-y-3">
                  {occupationSlots.map((slot) => (
                    <div
                      key={slot.sessionId}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">
                            {slot.sessionTitle}
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            Conference: {slot.conferenceName}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {slot.sessionId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}

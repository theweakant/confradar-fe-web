"use client";

import { MapPin, Building, Tag, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { RoomDetailProps } from "@/types/room.type";

export function RoomDetail({ room, onClose }: RoomDetailProps) {
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

      {/* Grid Info */}
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
              <p className="text-sm font-medium text-gray-700">
                Thông tin điểm đến
              </p>
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

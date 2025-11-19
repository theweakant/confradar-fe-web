import React from "react";
import { DoorOpen, Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { AvailableRoom } from "@/types/room.type";

interface RoomCardProps {
  room: AvailableRoom;
  selectedRoom?: string | null;
  onRoomClick: (room: AvailableRoom) => void;
  allRoomDates: AvailableRoom[]; 
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  selectedRoom,
  onRoomClick,
  allRoomDates,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Count availability stats
  const wholeDayCount = allRoomDates.filter(r => r.isAvailableWholeday).length;
  const partialDayCount = allRoomDates.filter(r => !r.isAvailableWholeday).length;

  return (
    <div
      id={`room-${room.roomId}`}
      onClick={() => onRoomClick(room)}
      className={`relative bg-white rounded-lg p-3 cursor-pointer transition-all hover:bg-green-50 hover:shadow-sm border ${
        selectedRoom === room.roomId
          ? "border-green-500 bg-green-50 shadow-sm"
          : "border-gray-200"
      }`}
    >
      {/* Room Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="mt-0.5">
            <DoorOpen className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {room.roomDisplayName || `Phòng ${room.roomNumber}`}
            </h3>
            <p className="text-xs text-gray-500">Số: {room.roomNumber}</p>
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className="space-y-2 text-sm mb-2">
        <div className="flex items-center gap-2">
          {room.isAvailableWholeday ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-700 font-medium text-xs">Trống cả ngày</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700 font-medium text-xs">Trống một phần</span>
            </>
          )}
        </div>

        {/* Current date info */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs">{formatDate(room.date)}</span>
        </div>

        {/* Time spans for partial availability */}
        {!room.isAvailableWholeday && room.availableTimeSpans.length > 0 && (
          <div className="mt-2 pl-5">
            <p className="text-xs text-gray-500 mb-1 font-medium">Khung giờ trống:</p>
            <div className="space-y-1">
              {room.availableTimeSpans.map((span, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>
                    {span.startTime.slice(0, 5)} - {span.endTime.slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            <span className="text-gray-600">{wholeDayCount} ngày trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-gray-600">{partialDayCount} ngày 1 phần</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
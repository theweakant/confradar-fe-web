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
      className={`relative bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-600 hover:shadow-lg border-2 ${
        selectedRoom === room.roomId
          ? "border-green-500 bg-gray-600"
          : "border-transparent"
      }`}
    >
      {/* Room Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-green-400" />
          <div>
            <h3 className="font-semibold text-white">
              {room.roomDisplayName || `Phòng ${room.roomNumber}`}
            </h3>
            <p className="text-xs text-gray-400">Số phòng: {room.roomNumber}</p>
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          {room.isAvailableWholeday ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">Trống cả ngày</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium">Trống một phần</span>
            </>
          )}
        </div>

        {/* Current date info */}
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>{formatDate(room.date)}</span>
        </div>

        {/* Time spans for partial availability */}
        {!room.isAvailableWholeday && room.availableTimeSpans.length > 0 && (
          <div className="mt-2 pl-6">
            <p className="text-xs text-gray-400 mb-1">Khung giờ trống:</p>
            {room.availableTimeSpans.map((span, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>
                  {span.startTime.slice(0, 5)} - {span.endTime.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-400">{wholeDayCount} ngày trống</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-gray-400">{partialDayCount} ngày 1 phần</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
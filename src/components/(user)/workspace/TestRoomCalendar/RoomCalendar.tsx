// components/molecules/Calendar/RoomCalendar.tsx
"use client";
import React, { useState, useMemo } from "react";
import BaseCalendar from "../../../molecules/Calendar/BaseCalendar";
import { SingleSessionForm } from "./SingleSessionForm";
import { useGetAvailableRoomsBetweenDatesQuery } from "@/redux/services/room.service";
import { useGetAvailableTimesInRoomQuery } from "@/redux/services/room.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Session } from "@/types/conference.type";

interface AvailableRoom {
  roomId: string;
  roomNumber: string;
  roomDisplayName: string;
  date: string;
  availableTimeSpans: { startTime: string; endTime: string }[];
  isAvailableWholeday: boolean;
}

export interface RoomCalendarProps {
  onSessionSave?: (session: Session) => void;
  onRoomSelect?: (data: {
    roomId: string;
    roomDisplayName: string;
    roomNumber: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
}

export const RoomCalendar: React.FC<RoomCalendarProps> = ({ onSessionSave }) => {
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return {
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(nextWeek, "yyyy-MM-dd"),
    };
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  
  // Thông tin cho form
  const [formData, setFormData] = useState<{
    roomId: string;
    roomDisplayName: string;
    roomNumber: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type === "start" ? "startDate" : "endDate"]: value,
    }));
    setSelectedDate(null);
    setSelectedRoom(null);
    setShowSessionForm(false);
    setFormData(null);
  };

  const { data, isLoading, isError } = useGetAvailableRoomsBetweenDatesQuery({
    startdate: dateRange.startDate,
    endate: dateRange.endDate,
  });

  const roomsForSelectedDate = useMemo(() => {
    if (!selectedDate || !data?.data) return [];
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const roomMap = new Map<string, AvailableRoom>();
    (data.data as AvailableRoom[]).forEach((room) => {
      if (room.date === selectedDateStr && room.availableTimeSpans.length > 0) {
        roomMap.set(room.roomId, room);
      }
    });
    return Array.from(roomMap.values());
  }, [data, selectedDate]);

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const {
    data: availableTimesData,
    isLoading: loadingAvailable,
    isError: errorAvailable,
  } = useGetAvailableTimesInRoomQuery(
    { roomId: selectedRoom?.roomId || "", date: selectedDateStr },
    { skip: !selectedRoom || !selectedDate }
  );

  const handleRoomClick = (room: AvailableRoom) => {
    setSelectedRoom(room);
    setShowSessionForm(false);
  };

  const handleTimeSelect = (timeSpan: { startTime: string; endTime: string }) => {
    if (!selectedDate || !selectedRoom) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startTime = `${dateStr}T${timeSpan.startTime}`;
    const endTime = `${dateStr}T${timeSpan.endTime}`;

    setFormData({
      roomId: selectedRoom.roomId,
      roomDisplayName: selectedRoom.roomDisplayName,
      roomNumber: selectedRoom.roomNumber,
      date: dateStr,
      startTime,
      endTime,
    });
    setShowSessionForm(true);
  };

  const handleSessionSave = (session: Session) => {
    if (onSessionSave) {
      onSessionSave(session);
    }
    // Reset sau khi save
    setShowSessionForm(false);
    setSelectedRoom(null);
    setFormData(null);
  };

  const handleCancelForm = () => {
    setShowSessionForm(false);
    setFormData(null);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setShowSessionForm(false);
    setFormData(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Bộ lọc khoảng ngày */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Tìm kiếm theo khoảng ngày</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange("start", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              max={dateRange.endDate}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange("end", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={dateRange.startDate}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1 sm:mt-0">
            Đang xem:{" "}
            <span className="font-medium">
              {format(new Date(dateRange.startDate), "dd/MM/yyyy", { locale: vi })} –{" "}
              {format(new Date(dateRange.endDate), "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
        </div>
      </div>

      {/* Lịch + Nội dung chính */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80">
          <BaseCalendar
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setSelectedRoom(null);
              setShowSessionForm(false);
              setFormData(null);
            }}
            minDate={dateRange.startDate}
            maxDate={dateRange.endDate}
            title="Chọn ngày cụ thể"
          />
        </div>

        <div className="flex-1 border rounded-lg overflow-hidden">
          {showSessionForm && formData ? (
            // ✅ Hiển thị Form tạo session
            <div className="p-4">
              <SingleSessionForm
                roomId={formData.roomId}
                roomDisplayName={formData.roomDisplayName}
                roomNumber={formData.roomNumber}
                date={formData.date}
                startTime={formData.startTime}
                endTime={formData.endTime}
                onSave={handleSessionSave}
                onCancel={handleCancelForm}
              />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b bg-gray-50">
                {selectedRoom ? (
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">
                      Khung giờ khả dụng - {selectedRoom.roomDisplayName}
                    </h3>
                    <button
                      type="button"
                      onClick={handleBackToRooms}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ← Quay lại danh sách
                    </button>
                  </div>
                ) : (
                  <h3 className="font-medium text-gray-800">
                    {selectedDate
                      ? `Phòng khả dụng - ${format(selectedDate, "dd/MM/yyyy", { locale: vi })}`
                      : `Phòng khả dụng (${format(new Date(dateRange.startDate), "dd/MM/yyyy", { locale: vi })} – ${format(new Date(dateRange.endDate), "dd/MM/yyyy", { locale: vi })})`}
                  </h3>
                )}
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {selectedRoom ? (
                  loadingAvailable ? (
                    <div>Đang tải khung giờ...</div>
                  ) : errorAvailable ? (
                    <div className="text-red-600">Không thể tải giờ khả dụng.</div>
                  ) : availableTimesData?.data && availableTimesData.data.length > 0 ? (
                    <div className="space-y-2">
                      {availableTimesData.data.map((span, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleTimeSelect(span)}
                          className="p-3 border rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
                        >
                          <span className="font-mono">
                            {span.startTime} – {span.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">Không có khung giờ khả dụng.</div>
                  )
                ) : (
                  isLoading ? (
                    <div className="text-gray-600">Đang tải...</div>
                  ) : isError ? (
                    <div className="text-red-600">Không thể tải danh sách phòng.</div>
                  ) : selectedDate && roomsForSelectedDate.length === 0 ? (
                    <div className="text-gray-500">Không có phòng nào khả dụng vào ngày này.</div>
                  ) : !selectedDate ? (
                    <div className="text-gray-500">Vui lòng chọn một ngày để xem phòng khả dụng.</div>
                  ) : (
                    <div className="space-y-3">
                      {roomsForSelectedDate.map((room) => (
                        <div
                          key={room.roomId}
                          onClick={() => handleRoomClick(room)}
                          className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-gray-900">{room.roomDisplayName}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-mono">ID: {room.roomId}</span> • Số: {room.roomNumber}
                          </div>
                          {room.isAvailableWholeday && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Cả ngày
                            </span>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Khung giờ:{" "}
                            {room.availableTimeSpans
                              .map((span) => `${span.startTime}–${span.endTime}`)
                              .join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
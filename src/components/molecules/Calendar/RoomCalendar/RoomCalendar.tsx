import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { DoorOpen } from "lucide-react";
import { useGetAvailableRoomsBetweenDatesQuery } from "@/redux/services/room.service";
import type { AvailableRoom } from "@/types/room.type";
import type { Session } from "@/types/conference.type";
import { DatesSetArg } from '@fullcalendar/core';
import RoomCard from "./RoomCard";
import RoomDetailDialog from "./RoomDetailDialog";

interface RoomCalendarProps {
  conferenceId?: string;
  onSessionCreated?: (session: Session) => void;
  startDate?: string;
  existingSessions?: Session[];
}

const RoomCalendar: React.FC<RoomCalendarProps> = ({ 
  conferenceId, 
  onSessionCreated,
  startDate,
  existingSessions
}) => {
  useEffect(() => {
    console.log('🔍 RoomCalendar received conferenceId:', conferenceId);
  }, [conferenceId]);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const calendarRef = useRef<FullCalendar | null>(null);
  const roomListRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (calendarRef.current && startDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
    }
  }, [startDate]);

  // Fetch rooms
  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    error: roomsError,
    refetch: refetchRooms
  } = useGetAvailableRoomsBetweenDatesQuery({
    startdate: dateRange.start,
    endate: dateRange.end
  });

  const rooms = roomsData?.data || [];

  const roomsByDate = rooms.reduce((acc, room) => {
    if (!acc[room.date]) {
      acc[room.date] = [];
    }
    acc[room.date].push(room);
    return acc;
  }, {} as Record<string, AvailableRoom[]>);

  const uniqueRooms = Array.from(
    new Map(rooms.map(room => [room.roomId, room])).values()
  );

  const getRoomColor = (isAvailableWholeday: boolean): { bg: string; border: string } => {
    return isAvailableWholeday
      ? { bg: "#10b981", border: "#059669" } 
      : { bg: "#f59e0b", border: "#d97706" }; 
  };

  const calendarEvents = rooms.map((room) => {
    const colors = getRoomColor(room.isAvailableWholeday);
    if (room.isAvailableWholeday) {
      return {
        id: `${room.roomId}-${room.date}`,
        title: room.roomDisplayName || `Room ${room.roomNumber}`,
        start: room.date,
        end: room.date,
        allDay: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          room: room,
          isWholeDay: true
        }
      };
    }
    return room.availableTimeSpans.map((span, index) => ({
      id: `${room.roomId}-${room.date}-${index}`,
      title: room.roomDisplayName || `Room ${room.roomNumber}`,
      start: `${room.date}T${span.startTime}`,
      end: `${room.date}T${span.endTime}`,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      extendedProps: {
        room: room,
        timeSpan: span,
        isWholeDay: false
      }
    }));
  }).flat();

  const handleRoomClick = (room: AvailableRoom) => {
    setSelectedRoom(room.roomId);
    setSelectedDate(room.date);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && room.date) {
      calendarApi.gotoDate(room.date);
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const room = info.event.extendedProps.room as AvailableRoom;
    setSelectedRoom(room.roomId);
    setSelectedDate(room.date);
    setRoomDetailOpen(true);
  };

  const selectedRoomData = selectedRoom 
    ? rooms.find(r => r.roomId === selectedRoom && r.date === selectedDate)
    : null;

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const start = dateInfo.start.toISOString().split('T')[0];
    const maxEndDate = new Date(dateInfo.start);
    maxEndDate.setDate(maxEndDate.getDate() + 7);
    const end = maxEndDate.toISOString().split('T')[0];
    
    if (start !== dateRange.start || end !== dateRange.end) {
      setDateRange({ start, end });
    }
  };

  if (isLoadingRooms) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải lịch phòng...</p>
        </div>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <button
            onClick={() => refetchRooms()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Lịch Phòng Trống
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý tình trạng phòng (Hiển thị tối đa 7 ngày)
          </p>
          {conferenceId && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              Conference ID: {conferenceId}
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-6 items-center text-sm bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-green-500 to-green-600 shadow-sm"></div>
            <span className="text-gray-700 font-medium">Trống cả ngày</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm"></div>
            <span className="text-gray-700 font-medium">Trống một phần</span>
          </div>
        </div>

        {/* Layout: 2 columns - Calendar and Room List */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="calendar-container">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "weekNoTime,timeGridDay",
                }}
                views={{
                  weekNoTime: {
                    type: "timeGridWeek",
                    slotMinTime: "24:00:00",
                    slotMaxTime: "24:00:00",
                  }
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                height="auto"
                eventDisplay="block"
                displayEventTime={true}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                eventContent={(arg) => {
                  const isWholeDay = arg.event.extendedProps.isWholeDay;
                  const timeSpan = arg.event.extendedProps.timeSpan;
                  
                  return (
                    <div className="flex flex-col overflow-hidden text-ellipsis p-1">
                      <span className="text-xs font-semibold text-white leading-snug truncate">
                        {arg.event.title}
                      </span>
                      {!isWholeDay && timeSpan && (
                        <span className="text-[10px] text-gray-200">
                          {timeSpan.startTime.slice(0, 5)} - {timeSpan.endTime.slice(0, 5)}
                        </span>
                      )}
                      {isWholeDay && (
                        <span className="text-[10px] text-gray-200">
                          Cả ngày
                        </span>
                      )}
                    </div>
                  );
                }}
                eventClassNames={() => [
                  "transition-all",
                  "duration-200",
                  "ease-in-out",
                  "hover:scale-105",
                  "hover:shadow-lg",
                  "hover:z-10",
                  "cursor-pointer",
                  "rounded-md",
                ]}
              />
            </div>
          </div>

          {/* Room List */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-green-400" />
              Danh sách Phòng ({uniqueRooms.length})
            </h2>
            <div
              ref={roomListRef}
              className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4b5563 #1f2937",
              } as React.CSSProperties}
            >
              {uniqueRooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  selectedRoom={selectedRoom}
                  onRoomClick={handleRoomClick}
                  allRoomDates={rooms.filter(r => r.roomId === room.roomId)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Room Detail Dialog */}
      <RoomDetailDialog
        open={roomDetailOpen}
        roomId={selectedRoom}
        roomNumber={selectedRoomData?.roomNumber}
        roomDisplayName={selectedRoomData?.roomDisplayName}
        date={selectedDate}
        conferenceId={conferenceId}
        existingSessions={existingSessions}
        onClose={() => {
          setRoomDetailOpen(false);
          setSelectedRoom(null);
          setSelectedDate(null);
        }}
        onSessionCreated={onSessionCreated}
      />

      <style jsx global>{`
        /* Ẩn cột giờ bên trái */
        .fc-timegrid-axis {
          display: none !important;
        }

        /* Ẩn header của cột giờ */
        .fc-timegrid-slot-label {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default RoomCalendar;
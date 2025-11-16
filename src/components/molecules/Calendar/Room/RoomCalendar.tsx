import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { DoorOpen } from "lucide-react";
import { useGetAvailableRoomsBetweenDatesQuery } from "@/redux/services/room.service";
import type { AvailableRoom } from "@/types/room.type";
import RoomCard from "./RoomCard";
import RoomDetailDialog from "./RoomDetailDialog";

const RoomCalendar: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);
  
  // ✅ FIX: Thay đổi từ 30 ngày → 7 ngày (theo giới hạn API)
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days instead of 30
  });

  const calendarRef = useRef<FullCalendar | null>(null);
  const roomListRef = useRef<HTMLDivElement>(null);

  const {
    data: roomsData,
    isLoading,
    error,
    refetch
  } = useGetAvailableRoomsBetweenDatesQuery({
    startdate: dateRange.start,
    endate: dateRange.end
  });

  const rooms = roomsData?.data || [];

  // Group rooms by date for easier access
  const roomsByDate = rooms.reduce((acc, room) => {
    if (!acc[room.date]) {
      acc[room.date] = [];
    }
    acc[room.date].push(room);
    return acc;
  }, {} as Record<string, AvailableRoom[]>);

  // Get unique rooms (deduplicate by roomId)
  const uniqueRooms = Array.from(
    new Map(rooms.map(room => [room.roomId, room])).values()
  );

  const getRoomColor = (isAvailableWholeday: boolean): { bg: string; border: string } => {
    return isAvailableWholeday
      ? { bg: "#10b981", border: "#059669" } 
      : { bg: "#f59e0b", border: "#d97706" }; 
  };

  // Create calendar events from room data
  const calendarEvents = rooms.map((room) => {
    const colors = getRoomColor(room.isAvailableWholeday);
    
    // For whole day availability
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

    // For partial availability - create events for each time span
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

  // ✅ FIX: Giới hạn date range tối đa 7 ngày khi user navigate calendar
  const handleDatesSet = (dateInfo: any) => {
    const start = dateInfo.start.toISOString().split('T')[0];
    const requestedEnd = dateInfo.end.toISOString().split('T')[0];
    
    // Calculate max end date (7 days from start)
    const maxEndDate = new Date(dateInfo.start);
    maxEndDate.setDate(maxEndDate.getDate() + 7);
    const end = maxEndDate.toISOString().split('T')[0];
    
    // Only update if different and within 7-day limit
    if (start !== dateRange.start || end !== dateRange.end) {
      setDateRange({ start, end });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải lịch phòng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Lịch Phòng Trống
          </h1>
          <p className="text-gray-400">
            Theo dõi và quản lý tình trạng phòng (Hiển thị tối đa 7 ngày)
          </p>
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-gray-300">Trống cả ngày</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-600"></div>
            <span className="text-gray-300">Trống một phần</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="calendar-container">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek" // ✅ Thay đổi: mặc định hiển thị tuần thay vì tháng
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "timeGridWeek,timeGridDay", // ✅ Bỏ dayGridMonth vì không phù hợp với 7 ngày
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

          {/* Room List Section */}
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
        date={selectedDate}
        onClose={() => {
          setRoomDetailOpen(false);
          setSelectedRoom(null);
          setSelectedDate(null);
        }}
      />

      <style jsx global>{`
        .calendar-container .fc {
          background: transparent;
          color: rgb(243 244 246);
        }
        .calendar-container .fc .fc-button {
          background-color: rgb(55 65 81);
          border-color: rgb(75 85 99);
          color: rgb(243 244 246);
          text-transform: capitalize;
        }
        .calendar-container .fc .fc-button:hover {
          background-color: rgb(75 85 99);
          border-color: rgb(107 114 128);
        }
        .calendar-container .fc .fc-button:disabled {
          background-color: rgb(31 41 55);
          border-color: rgb(55 65 81);
          opacity: 0.6;
        }
        .calendar-container .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: rgb(16 185 129);
          border-color: rgb(5 150 105);
        }
        .calendar-container .fc-theme-standard .fc-scrollgrid {
          border-color: rgb(55 65 81);
        }
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgb(55 65 81);
        }
        .calendar-container .fc .fc-col-header-cell {
          background-color: rgb(31 41 55);
          color: rgb(156 163 175);
          font-weight: 600;
        }
        .calendar-container .fc .fc-daygrid-day {
          background-color: rgb(17 24 39);
        }
        .calendar-container .fc .fc-daygrid-day:hover {
          background-color: rgb(31 41 55);
        }
        .calendar-container .fc .fc-daygrid-day-number {
          color: rgb(209 213 219);
        }
        .calendar-container .fc .fc-day-today {
          background-color: rgb(6 78 59) !important;
        }
        .calendar-container .fc .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          margin-bottom: 2px;
        }
        .calendar-container .fc .fc-event-title {
          font-size: 0.75rem;
          font-weight: 500;
        }
        .calendar-container .fc .fc-timegrid-slot {
          height: 3rem;
        }
        .calendar-container .fc .fc-timegrid-slot-label {
          color: rgb(156 163 175);
        }
        .calendar-container .fc-direction-ltr .fc-daygrid-event {
          margin-left: 2px;
          margin-right: 2px;
        }
        .calendar-container .fc .fc-toolbar-title {
          color: rgb(243 244 246);
          font-size: 1.5rem;
        }
        .calendar-container .fc .fc-daygrid-day-top {
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default RoomCalendar;
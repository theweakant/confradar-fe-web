import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core"; 
import { DoorOpen } from "lucide-react";
import { useGetAvailableRoomsBetweenDatesQuery } from "@/redux/services/room.service";
import type { AvailableRoom } from "@/types/room.type";
import type { Session, ResearchSession } from "@/types/conference.type";
import { DatesSetArg } from '@fullcalendar/core';
import RoomCard from "./Room/RoomCard";
import RoomDetailDialog from "./Room/RoomDetail";
import { ChangeDateModal } from "@/components/molecules/Calendar/RoomCalendar/Modal/ChangeDateModal";
import { ChangeRoomModal } from "@/components/molecules/Calendar/RoomCalendar/Modal/ChangeRoomModal";

interface RoomCalendarProps {
  conferenceId?: string;
  conferenceType?: "Tech" | "Research";
  onSessionCreated?: (session: Session | ResearchSession) => void;
  onSessionUpdated?: (session: Session | ResearchSession, index: number) => void; 
  onSessionDeleted?: (index: number) => void; 
  startDate?: string;
  endDate?: string;
  existingSessions?: (Session | ResearchSession)[];
}

const RoomCalendar: React.FC<RoomCalendarProps> = ({ 
  conferenceId, 
  conferenceType,
  onSessionCreated,
  onSessionUpdated, 
  onSessionDeleted, 
  startDate,
  endDate,
  existingSessions = []
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);
  
  // State cho Change Date/Room modals
  const [changeDateModalOpen, setChangeDateModalOpen] = useState(false);
  const [changeRoomModalOpen, setChangeRoomModalOpen] = useState(false);
  const [targetSession, setTargetSession] = useState<Session | ResearchSession | null>(null);
  const [targetSessionIndex, setTargetSessionIndex] = useState<number>(-1);
  
  const [dateRange, setDateRange] = useState(() => {
    const defaultStart = startDate || new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(new Date(defaultStart).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      start: defaultStart,
      end: defaultEnd
    };
  });

  const calendarRef = useRef<FullCalendar | null>(null);
  const roomListRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (calendarRef.current && startDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (startDate) {
      const start = startDate;
      const end = new Date(new Date(start).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDateRange({ start, end });
    }
  }, [startDate]);

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
      : { bg: "#3b82f6", border: "#2563eb" }; 
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

  // ✅ Implement handleChangeDate
  const handleChangeDate = (session: Session | ResearchSession, index: number) => {
    console.log('Đổi ngày cho session:', session.title, 'tại index:', index);
    setTargetSession(session);
    setTargetSessionIndex(index);
    setChangeDateModalOpen(true);
  };

  // ✅ Implement handleChangeRoom
  const handleChangeRoom = (session: Session | ResearchSession, index: number) => {
    console.log('Đổi phòng cho session:', session.title, 'tại index:', index);
    setTargetSession(session);
    setTargetSessionIndex(index);
    setChangeRoomModalOpen(true);
  };

  // ✅ Handle confirm từ ChangeDateModal
  const handleChangeDateConfirm = (updatedSession: Session | ResearchSession) => {
    if (onSessionUpdated && targetSessionIndex !== -1) {
      onSessionUpdated(updatedSession, targetSessionIndex);
    }
    setChangeDateModalOpen(false);
    setTargetSession(null);
    setTargetSessionIndex(-1);
  };

  // ✅ Handle confirm từ ChangeRoomModal
  const handleChangeRoomConfirm = (updatedSession: Session | ResearchSession) => {
    if (onSessionUpdated && targetSessionIndex !== -1) {
      onSessionUpdated(updatedSession, targetSessionIndex);
    }
    setChangeRoomModalOpen(false);
    setTargetSession(null);
    setTargetSessionIndex(-1);
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Đang tải lịch phòng...</p>
        </div>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">Có lỗi xảy ra khi tải dữ liệu</p>
          <button
            onClick={() => refetchRooms()}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-4 my-6 flex gap-4 items-center text-sm px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-600"></div>
          <span className="text-gray-600">Cả ngày</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span className="text-gray-600">Một phần</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <style>{`
            .fc {
              --fc-border-color: #e5e7eb;
              --fc-button-bg-color: #3b82f6;
              --fc-button-border-color: #3b82f6;
              --fc-button-hover-bg-color: #2563eb;
              --fc-button-hover-border-color: #2563eb;
              --fc-button-active-bg-color: #1d4ed8;
              --fc-button-active-border-color: #1d4ed8;
              --fc-today-bg-color: #eff6ff;
            }
            .fc .fc-button {
              font-size: 0.875rem;
              padding: 0.375rem 0.75rem;
              text-transform: capitalize;
            }
            .fc .fc-toolbar-title {
              font-size: 1.125rem;
              font-weight: 600;
              color: #111827;
            }
            .fc .fc-col-header-cell {
              background-color: #f9fafb;
              font-weight: 500;
              color: #374151;
              font-size: 0.75rem;
              text-transform: uppercase;
              padding: 0.5rem 0;
            }
            .fc .fc-daygrid-day-number {
              color: #374151;
              font-size: 0.875rem;
              padding: 0.25rem;
            }
            .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
              background-color: #3b82f6;
              color: white;
              border-radius: 50%;
              width: 1.75rem;
              height: 1.75rem;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .fc-timegrid-axis {
              display: none !important;
            }
            .fc-timegrid-slot-label {
              display: none !important;
            }
          `}</style>
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridWeek"
              firstDay={1}
              validRange={{
                start: startDate || undefined,
                end: endDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridWeek,timeGridDay",
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
                      <span className="text-[10px] text-white/90">
                        {timeSpan.startTime.slice(0, 5)} - {timeSpan.endTime.slice(0, 5)}
                      </span>
                    )}
                    {isWholeDay && (
                      <span className="text-[10px] text-white/90">
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
                "hover:shadow-md",
                "hover:z-10",
                "cursor-pointer",
                "rounded-md",
              ]}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
            <DoorOpen className="w-4 h-4 text-green-600" />
            Danh sách Phòng ({uniqueRooms.length})
          </h2>
          <div
            ref={roomListRef}
            className="space-y-2 overflow-y-auto max-h-[500px] pr-1"
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

      {/* RoomDetailDialog với callbacks */}
      <RoomDetailDialog
        open={roomDetailOpen}
        roomId={selectedRoom}
        roomNumber={selectedRoomData?.roomNumber}
        roomDisplayName={selectedRoomData?.roomDisplayName}
        date={selectedDate}
        conferenceId={conferenceId}
        conferenceType={conferenceType}
        existingSessions={existingSessions}
        onClose={() => {
          setRoomDetailOpen(false);
          setSelectedRoom(null);
          setSelectedDate(null);
        }}
        onSessionCreated={onSessionCreated}
        onSessionUpdated={onSessionUpdated} 
        onSessionDeleted={onSessionDeleted} 
        onChangeDate={handleChangeDate}  
        onChangeRoom={handleChangeRoom}  
      />

      {/* ChangeDateModal */}
      <ChangeDateModal
        open={changeDateModalOpen}
        session={targetSession}
        existingSessions={existingSessions}
        conferenceStartDate={startDate}
        conferenceEndDate={endDate}
        onClose={() => {
          setChangeDateModalOpen(false);
          setTargetSession(null);
          setTargetSessionIndex(-1);
        }}
        onConfirm={handleChangeDateConfirm}
      />

      {/* ChangeRoomModal */}
      <ChangeRoomModal
        open={changeRoomModalOpen}
        session={targetSession}
        existingSessions={existingSessions}
        onClose={() => {
          setChangeRoomModalOpen(false);
          setTargetSession(null);
          setTargetSessionIndex(-1);
        }}
        onConfirm={handleChangeRoomConfirm}
      />
    </div>
  );
};

export default RoomCalendar;
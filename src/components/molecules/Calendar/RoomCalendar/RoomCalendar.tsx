import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { DatesSetArg } from "@fullcalendar/core";

import { DoorOpen, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useGetAvailableRoomsBetweenDatesQuery } from "@/redux/services/room.service";
import { useGetAllDestinationsQuery } from "@/redux/services/destination.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import type { AvailableRoom } from "@/types/room.type";
import type { Session, ResearchSession } from "@/types/conference.type";

import RoomCard from "./Room/RoomCard";
import RoomDetailDialog from "./Room/RoomDetail";
import { ChangeDateModal } from "@/components/molecules/Calendar/RoomCalendar/Modal/ChangeDateModal";
import { ChangeRoomModal } from "@/components/molecules/Calendar/RoomCalendar/Modal/ChangeRoomModal";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface RoomCalendarProps {
  conferenceId?: string;
  conferenceType?: "Tech" | "Research";
  onSessionCreated?: (session: Session | ResearchSession) => void;
  onSessionUpdated?: (session: Session | ResearchSession, index: number) => void;
  onSessionDeleted?: (index: number) => void;
  startDate?: string;
  endDate?: string;
  existingSessions?: (Session | ResearchSession)[];
  cityId?: string; 
  conferenceStatusId?: string;
}

const RoomCalendar: React.FC<RoomCalendarProps> = ({
  conferenceId,
  conferenceType,
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
  startDate,
  endDate,
  existingSessions = [],
  cityId,
  conferenceStatusId
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);

  const [filterDestination, setFilterDestination] = useState("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilterDestination, setTempFilterDestination] = useState("all");

  const [changeDateModalOpen, setChangeDateModalOpen] = useState(false);
  const [changeRoomModalOpen, setChangeRoomModalOpen] = useState(false);
  const [targetSession, setTargetSession] = useState<Session | ResearchSession | null>(null);
  const [targetSessionIndex, setTargetSessionIndex] = useState<number>(-1);

  const [dateRange, setDateRange] = useState(() => {
    const defaultStart = startDate || new Date().toISOString().split("T")[0];
    const defaultEnd = new Date(
      new Date(defaultStart).getTime() + 7 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    return { start: defaultStart, end: defaultEnd };
  });

  const calendarRef = useRef<FullCalendar>(null);
  const roomListRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (calendarRef.current && startDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (startDate) {
      const start = startDate;
      const end = new Date(new Date(start).getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setDateRange({ start, end });
    }
  }, [startDate]);

  const { data: destinationsData } = useGetAllDestinationsQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

  const destinations = destinationsData?.data || [];
  const cities = citiesData?.data || [];

  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    error: roomsError,
    refetch: refetchRooms,
  } = useGetAvailableRoomsBetweenDatesQuery({
    startdate: dateRange.start,
    endate: dateRange.end,
    cityId: cityId || undefined, 
    ...(filterDestination !== "all" && { destinationId: filterDestination }),
  });

  const rooms = roomsData?.data || [];


  const destinationOptions = useMemo(() => {
    const allOption = { value: "all", label: "Tất cả điểm đến" };
    const apiDests = destinations.map((dest) => ({
      value: dest.destinationId,
      label: dest.name || "N/A",
    }));
    return [allOption, ...apiDests];
  }, [destinations]);

  const activeFilterCount = useMemo(() => {
    return filterDestination !== "all" ? 1 : 0;
  }, [filterDestination]);

  const uniqueRooms = Array.from(
    new Map(rooms.map((room) => [room.roomId, room])).values()
  );

  const getRoomColor = (isAvailableWholeday: boolean): { bg: string; border: string } => {
    return isAvailableWholeday
      ? { bg: "#10b981", border: "#059669" }
      : { bg: "#3b82f6", border: "#2563eb" };
  };

  const calendarEvents = rooms
    .map((room) => {
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
            room,
            isWholeDay: true,
          },
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
          room,
          timeSpan: span,
          isWholeDay: false,
        },
      }));
    })
    .flat();

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

  const handleChangeDate = (session: Session | ResearchSession, index: number) => {
    setTargetSession(session);
    setTargetSessionIndex(index);
    setChangeDateModalOpen(true);
  };

  const handleChangeRoom = (session: Session | ResearchSession, index: number) => {
    setTargetSession(session);
    setTargetSessionIndex(index);
    setChangeRoomModalOpen(true);
  };

  const handleChangeDateConfirm = (updatedSession: Session | ResearchSession) => {
    if (onSessionUpdated && targetSessionIndex !== -1) {
      onSessionUpdated(updatedSession, targetSessionIndex);
    }
    setChangeDateModalOpen(false);
    setTargetSession(null);
    setTargetSessionIndex(-1);
  };

  const handleChangeRoomConfirm = (updatedSession: Session | ResearchSession) => {
    if (onSessionUpdated && targetSessionIndex !== -1) {
      onSessionUpdated(updatedSession, targetSessionIndex);
    }
    setChangeRoomModalOpen(false);
    setTargetSession(null);
    setTargetSessionIndex(-1);
  };

  const handleOpenFilterModal = () => {
    setTempFilterDestination(filterDestination);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setFilterDestination(tempFilterDestination);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilterDestination("all");
  };

  const handleClearAllFilters = () => {
    setFilterDestination("all");
  };

  const selectedRoomData = selectedRoom
    ? rooms.find((r) => r.roomId === selectedRoom && r.date === selectedDate)
    : null;

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const start = dateInfo.start.toISOString().split("T")[0];
    const maxEndDate = new Date(dateInfo.start);
    maxEndDate.setDate(maxEndDate.getDate() + 7);
    const end = maxEndDate.toISOString().split("T")[0];
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
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          {cityId && (
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Thành phố:</span>{" "}
              {cities.find((c) => c.cityId === cityId)?.cityName || "N/A"}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleOpenFilterModal} className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white px-2 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAllFilters}
                title="Xóa tất cả bộ lọc"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap justify-end gap-2 mt-3 pt-3 border-t">
              {filterDestination !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Điểm đến: {destinationOptions.find((o) => o.value === filterDestination)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterDestination("all")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bộ lọc tìm kiếm</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Điểm đến</Label>
              <Select value={tempFilterDestination} onValueChange={setTempFilterDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn điểm đến" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {destinationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Đặt lại
            </Button>
            <Button onClick={handleApplyFilters}>Áp dụng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                end: endDate
                  ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                  : undefined,
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
                      <span className="text-[10px] text-white/90">Cả ngày</span>
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
            Danh sách phòng ({uniqueRooms.length})
          </h2>
          <div
            ref={roomListRef}
            className="space-y-2 overflow-y-auto max-h-[500px] pr-1"
          >
            {uniqueRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Không tìm thấy phòng nào</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-2 text-xs text-green-600 hover:text-green-700"
                  >
                    Xóa bộ lọc để xem tất cả
                  </button>
                )}
              </div>
            ) : (
              uniqueRooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  selectedRoom={selectedRoom}
                  onRoomClick={handleRoomClick}
                  allRoomDates={rooms.filter((r) => r.roomId === room.roomId)}
                />
              ))
            )}
          </div>
        </div>
      </div>

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
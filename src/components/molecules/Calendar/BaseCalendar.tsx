import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  X,
  Plus,
  Filter
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Room {
  roomId: string;
  roomName: string;
  capacity?: number;
  equipment?: string[];
  floor?: string;
  building?: string;
}

export interface CalendarEvent {
  eventId: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  roomId?: string;
  room?: Room;
  type?: 'session' | 'paper' | 'other';
  color?: string;
  metadata?: Record<string, unknown>; 
}

export interface TimeSlot {
  time: string; // "09:00"
  roomId: string;
  isAvailable: boolean;
  event?: CalendarEvent;
}

export interface BaseCalendarProps {
  /** Array of events to display */
  events: CalendarEvent[];
  
  /** Array of rooms/resources */
  rooms: Room[];
  
  /** Callback when a date is clicked */
  onDateClick?: (date: Date) => void;
  
  /** Callback when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  
  /** Callback when a time slot is clicked */
  onSlotClick?: (date: Date, time: string, roomId: string) => void;
  
  /** Custom render for sidebar when date is selected */
  renderSidebar?: (date: Date, events: CalendarEvent[], rooms: Room[]) => React.ReactNode;
  
  /** Custom render for event popup/modal */
  renderEventModal?: (event: CalendarEvent, onClose: () => void) => React.ReactNode;
  
  /** Show timeline sidebar */
  showTimeline?: boolean;
  
  /** Timeline hours range */
  timelineHours?: { start: number; end: number };
  
  /** Enable room filtering */
  enableRoomFilter?: boolean;
  
  /** Custom category colors */
  categoryColors?: Record<string, string>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Custom title */
  title?: string;
  
  /** Initial view mode */
  initialView?: 'month' | 'week' | 'day';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => {
    try {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    } catch {
      return false;
    }
  });
};

const generateTimeSlots = (
  start: number = 8, 
  end: number = 18, 
  interval: number = 30
): string[] => {
  const slots: string[] = [];
  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};

// ============================================================================
// TIMELINE SIDEBAR COMPONENT
// ============================================================================

interface TimelineSidebarProps {
  date: Date;
  events: CalendarEvent[];
  rooms: Room[];
  timeSlots: string[];
  onSlotClick?: (time: string, roomId: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const TimelineSidebar: React.FC<TimelineSidebarProps> = ({
  date,
  events,
  rooms,
  timeSlots,
  onSlotClick,
  onEventClick
}) => {
  const getEventForSlot = (time: string, roomId: string): CalendarEvent | undefined => {
    return events.find(event => {
      if (event.roomId !== roomId) return false;
      
      try {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date(date);
        slotTime.setHours(hours, minutes, 0, 0);
        
        return slotTime >= eventStart && slotTime < eventEnd;
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4">
        <h3 className="font-semibold text-gray-900">
          {formatDate(date)}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {events.length} sự kiện
        </p>
      </div>

      <div className="p-4">
        {/* Header - Room columns */}
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(${rooms.length}, minmax(120px, 1fr))` }}>
          <div className="text-xs font-semibold text-gray-600">Thời gian</div>
          {rooms.map(room => (
            <div key={room.roomId} className="text-xs font-semibold text-gray-700 text-center">
              {room.roomName}
              {room.capacity && (
                <span className="block text-gray-500 font-normal">
                  ({room.capacity} người)
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Timeline grid */}
        <div className="space-y-1">
          {timeSlots.map(time => (
            <div 
              key={time}
              className="grid gap-2"
              style={{ gridTemplateColumns: `80px repeat(${rooms.length}, minmax(120px, 1fr))` }}
            >
              <div className="text-xs text-gray-600 py-2">
                {time}
              </div>
              
              {rooms.map(room => {
                const event = getEventForSlot(time, room.roomId);
                const isAvailable = !event;

                return (
                  <div
                    key={`${time}-${room.roomId}`}
                    onClick={() => {
                      if (event && onEventClick) {
                        onEventClick(event);
                      } else if (isAvailable && onSlotClick) {
                        onSlotClick(time, room.roomId);
                      }
                    }}
                    className={`
                      min-h-[40px] rounded border transition-all cursor-pointer
                      ${event 
                        ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-300'
                      }
                    `}
                  >
                    {event && (
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                        </div>
                      </div>
                    )}
                    {isAvailable && (
                      <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN BASE CALENDAR COMPONENT
// ============================================================================

const BaseCalendar: React.FC<BaseCalendarProps> = ({
  events = [],
  rooms = [],
  onDateClick,
  onEventClick,
  onSlotClick,
  renderSidebar,
  renderEventModal,
  showTimeline = true,
  timelineHours = { start: 8, end: 18 },
  enableRoomFilter = true,
  categoryColors,
  isLoading = false,
  title = 'Lịch Hội nghị',
  initialView = 'month'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>(initialView);
  const [filteredRooms, setFilteredRooms] = useState<string[]>(
    rooms.map(r => r.roomId)
  );

  const timeSlots = useMemo(
    () => generateTimeSlots(timelineHours.start, timelineHours.end, 30),
    [timelineHours]
  );

  const filteredEvents = useMemo(
    () => events.filter(e => !e.roomId || filteredRooms.includes(e.roomId)),
    [events, filteredRooms]
  );

  const selectedDateEvents = useMemo(
    () => selectedDate ? getEventsForDate(filteredEvents, selectedDate) : [],
    [selectedDate, filteredEvents]
  );

  const activeRooms = useMemo(
    () => rooms.filter(r => filteredRooms.includes(r.roomId)),
    [rooms, filteredRooms]
  );

  // Calendar calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleSlotClick = (time: string, roomId: string) => {
    if (selectedDate && onSlotClick) {
      onSlotClick(selectedDate, time, roomId);
    }
  };

  const toggleRoomFilter = (roomId: string) => {
    setFilteredRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const getEventColor = (event: CalendarEvent): string => {
    if (event.color) return event.color;
    if (event.type && categoryColors?.[event.type]) return categoryColors[event.type];
    return '#3b82f6'; // default blue
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Room Filter */}
            {enableRoomFilter && rooms.length > 0 && (
              <div className="relative group">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Phòng ({filteredRooms.length}/{rooms.length})</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  <div className="p-3 space-y-2 max-h-64 overflow-auto">
                    {rooms.map(room => (
                      <label key={room.roomId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={filteredRooms.includes(room.roomId)}
                          onChange={() => toggleRoomFilter(room.roomId)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{room.roomName}</span>
                        {room.capacity && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {room.capacity} người
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View Switcher */}
            <div className="flex gap-2">
              {(['month', 'week', 'day'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm capitalize ${
                    view === v 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {v === 'month' ? 'Tháng' : v === 'week' ? 'Tuần' : 'Ngày'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar View */}
        <div className={`${selectedDate && showTimeline ? 'w-1/2' : 'w-full'} p-6 overflow-auto transition-all`}>
          {/* Month Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
            </h2>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 42 }, (_, i) => {
                const dayNum = i - startingDayOfWeek + 1;
                const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                const today = new Date();
                const isToday = isCurrentMonth && isSameDay(date, today);
                const isSelected = selectedDate && isCurrentMonth && isSameDay(date, selectedDate);
                const dayEvents = isCurrentMonth ? getEventsForDate(filteredEvents, date) : [];

                return (
                  <div
                    key={i}
                    onClick={() => isCurrentMonth && handleDateClick(date)}
                    className={`
                      min-h-[100px] rounded-lg border p-2 cursor-pointer transition-all
                      ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                      ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}
                      ${!isCurrentMonth ? 'opacity-30 bg-gray-50' : 'bg-white hover:bg-blue-50'}
                      ${!isToday && !isSelected && isCurrentMonth ? 'hover:border-blue-300' : ''}
                    `}
                  >
                    {isCurrentMonth && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                          {dayNum}
                        </div>
                        
                        {dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.eventId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                className="text-xs p-1 rounded truncate font-medium cursor-pointer hover:opacity-80"
                                style={{
                                  backgroundColor: getEventColor(event) + '20',
                                  color: getEventColor(event),
                                  borderLeft: `3px solid ${getEventColor(event)}`
                                }}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 pl-1">
                                +{dayEvents.length - 2} sự kiện
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Sidebar */}
        {selectedDate && showTimeline && (
          <div className="w-1/2 border-l border-gray-200 bg-white">
            {renderSidebar ? (
              renderSidebar(selectedDate, selectedDateEvents, activeRooms)
            ) : (
              <TimelineSidebar
                date={selectedDate}
                events={selectedDateEvents}
                rooms={activeRooms}
                timeSlots={timeSlots}
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && renderEventModal && (
        renderEventModal(selectedEvent, () => setSelectedEvent(null))
      )}
    </div>
  );
};

export default BaseCalendar;
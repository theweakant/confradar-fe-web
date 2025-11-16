import React, { useState, useRef, useMemo } from "react";
import { Calendar, Clock, MapPin, Users, Tag, Eye, X } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Session {
  conferenceSessionId?: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  roomDisplayName?: string;
  destinationName?: string;
}

interface Conference {
  conferenceId: string;
  conferenceName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  address?: string;
  totalSlot?: number;
  availableSlot?: number;
  conferenceCategoryName?: string;
  bannerImageUrl?: string;
  sessions: Session[];
}

interface ConferenceCalendarProps {
  /** Array of conferences to display */
  conferences: Conference[];
  /** Callback when modal is closed */
  onClose: () => void;
  /** Custom color mapping for categories (optional) */
  categoryColors?: Record<string, { main: string; light: string }>;
  /** Loading state (optional) */
  isLoading?: boolean;
  /** Custom title (optional) */
  title?: string;
  /** Custom subtitle (optional) */
  subtitle?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ConferenceCalendar: React.FC<ConferenceCalendarProps> = ({
  conferences = [],
  onClose,
  categoryColors,
  isLoading = false,
  title = "Title",
  subtitle = "Subtitle",
}) => {
  const [selectedConference, setSelectedConference] = useState<string | null>(
    null,
  );
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedConferenceForDialog, setSelectedConferenceForDialog] =
    useState<Conference | null>(null);
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">(
    "month",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const conferenceListRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // CALENDAR EVENTS
  // ============================================================================

  const calendarEvents = useMemo(
    () =>
      (conferences || []).flatMap((conf) => [
        {
          id: conf.conferenceId,
          title: conf.conferenceName || "Untitled Conference",
          start: conf.startDate,
          end: conf.endDate,
          conference: conf,
          isSession: false,
        },
        ...conf.sessions.map((session) => ({
          id: session.conferenceSessionId,
          title: session.title || "Untitled Session",
          start: session.startTime,
          end: session.endTime,
          session: session,
          conference: conf,
          isSession: true,
        })),
      ]),
    [conferences],
  );

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const defaultCategoryColors: Record<string, { main: string; light: string }> =
    {
      Technology: { main: "#2563eb", light: "#3b82f6" },
      Blockchain: { main: "#7c3aed", light: "#8b5cf6" },
      DevOps: { main: "#0891b2", light: "#06b6d4" },
      Design: { main: "#db2777", light: "#ec4899" },
    };

  const colors = categoryColors || defaultCategoryColors;

  function getCategoryColor(
    category?: string,
    isSession: boolean = false,
  ): string {
    const colorSet = colors[category || ""];
    if (!colorSet) return isSession ? "#64748b" : "#475569";
    return isSession ? colorSet.light : colorSet.main;
  }

  const handleConferenceClick = (conf: Conference) => {
    setSelectedConference(conf.conferenceId);
    if (conf.startDate) {
      setCurrentDate(new Date(conf.startDate));
    }
  };

  const handleViewSessions = (conf: Conference, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConferenceForDialog(conf);
    setSessionDialogOpen(true);
  };

  const handleSessionClick = (session: Session) => {
    setSessionDialogOpen(false);
    if (session.startTime) {
      setCurrentDate(new Date(session.startTime));
      setCurrentView("day");
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "prev" ? -1 : 1));
    setCurrentDate(newDate);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch hội nghị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-sm text-blue-100 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800/30 rounded-lg transition-colors"
            aria-label="Close calendar"
          >
            <X className="w-6 h-6 text-white hover:text-blue-100" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Calendar Section - 65% width */}
          <div className="flex-1 bg-gray-50 border-r border-gray-200 p-6 overflow-auto">
            <div className="h-full">
              {/* Calendar Controls */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors text-sm"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                  >
                    Hôm nay
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors text-sm"
                  >
                    Sau
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  Tháng {currentDate.getMonth() + 1},{" "}
                  {currentDate.getFullYear()}
                </h3>

                <div className="flex gap-2">
                  {(["month", "week", "day"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view)}
                      className={`px-3 py-1.5 rounded transition-colors text-sm capitalize ${
                        currentView === view
                          ? "bg-blue-600 text-white"
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {view === "month"
                        ? "Tháng"
                        : view === "week"
                          ? "Tuần"
                          : "Ngày"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-[calc(100%-4rem)] shadow-sm">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2 h-[calc(100%-3rem)]">
                  {Array.from({ length: 42 }, (_, i) => {
                    const dayNum = i - startingDayOfWeek + 1;
                    const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                    const today = new Date();
                    const isToday =
                      isCurrentMonth &&
                      dayNum === today.getDate() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getFullYear() === today.getFullYear();

                    const dayEvents = isCurrentMonth
                      ? calendarEvents.filter((event) => {
                          const eventDate = new Date(event.start || "");
                          return (
                            eventDate.getDate() === dayNum &&
                            eventDate.getMonth() === currentDate.getMonth() &&
                            eventDate.getFullYear() ===
                              currentDate.getFullYear()
                          );
                        })
                      : [];

                    return (
                      <div
                        key={i}
                        className={`
                          bg-white border border-gray-200 rounded p-2 min-h-[90px] cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300
                          ${isToday ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                          ${!isCurrentMonth ? "opacity-40 bg-gray-50" : ""}
                        `}
                      >
                        {isCurrentMonth && (
                          <>
                            <div
                              className={`text-sm mb-1 font-medium ${isToday ? "text-blue-600 font-bold" : "text-gray-700"}`}
                            >
                              {dayNum}
                            </div>
                            {dayEvents.length > 0 && (
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                  <div
                                    key={event.id}
                                    className="text-xs p-1 rounded truncate font-medium"
                                    style={{
                                      backgroundColor:
                                        getCategoryColor(
                                          event.conference
                                            .conferenceCategoryName,
                                          event.isSession,
                                        ) + "20",
                                      color: getCategoryColor(
                                        event.conference.conferenceCategoryName,
                                        event.isSession,
                                      ),
                                      borderLeft: `3px solid ${getCategoryColor(event.conference.conferenceCategoryName, event.isSession)}`,
                                    }}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                ))}
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
          </div>

          {/* Conference List Section - 35% width */}
          <div className="w-[35%] bg-white flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                Danh sách Hội nghị ({conferences.length})
              </h3>
            </div>

            <div
              ref={conferenceListRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 #f1f5f9",
              }}
            >
              {conferences.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Chưa có hội nghị nào
                  </p>
                  <p className="text-sm">Các hội nghị sẽ hiển thị ở đây</p>
                </div>
              ) : (
                conferences.map((conf) => (
                  <div
                    key={conf.conferenceId}
                    id={`conference-${conf.conferenceId}`}
                    onClick={() => handleConferenceClick(conf)}
                    className={`
                      bg-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                      border-2 
                      ${selectedConference === conf.conferenceId ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-blue-300"}
                    `}
                  >
                    {conf.bannerImageUrl && (
                      <img
                        src={conf.bannerImageUrl}
                        alt={conf.conferenceName || "Conference"}
                        className="w-full h-28 object-cover rounded-md mb-3"
                      />
                    )}

                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {conf.conferenceName || "Untitled Conference"}
                    </h4>

                    {conf.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {conf.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs">
                      {conf.startDate && conf.endDate && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {formatDate(conf.startDate)} -{" "}
                            {formatDate(conf.endDate)}
                          </span>
                        </div>
                      )}

                      {conf.address && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-green-600" />
                          <span className="line-clamp-1">{conf.address}</span>
                        </div>
                      )}

                      {conf.totalSlot !== undefined && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>
                            {conf.availableSlot}/{conf.totalSlot} slots
                          </span>
                        </div>
                      )}

                      {conf.conferenceCategoryName && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-pink-600" />
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor:
                                getCategoryColor(conf.conferenceCategoryName) +
                                "20",
                              color: getCategoryColor(
                                conf.conferenceCategoryName,
                              ),
                            }}
                          >
                            {conf.conferenceCategoryName}
                          </span>
                        </div>
                      )}

                      {conf.sessions.length > 0 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            {conf.sessions.length} phiên họp
                          </div>
                          <button
                            onClick={(e) => handleViewSessions(conf, e)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Xem
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Details Dialog */}
      {sessionDialogOpen && selectedConferenceForDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSessionDialogOpen(false)}
          />

          <div className="relative bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedConferenceForDialog.conferenceName ||
                  "Chi tiết phiên họp"}
              </h3>
              <p className="text-sm text-gray-600">
                Danh sách các phiên họp trong hội nghị. Click vào phiên họp để
                xem trên lịch.
              </p>
            </div>

            <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2">
              {selectedConferenceForDialog.sessions.length > 0 ? (
                selectedConferenceForDialog.sessions.map((session) => (
                  <div
                    key={session.conferenceSessionId}
                    onClick={() => handleSessionClick(session)}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {session.title || "Untitled Session"}
                      </h4>
                      <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>

                    {session.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {session.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {session.startTime && session.endTime && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs">
                            {new Date(session.startTime).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}{" "}
                            -{" "}
                            {new Date(session.endTime).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      )}

                      {session.roomDisplayName && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-xs">
                            {session.roomDisplayName}
                          </span>
                          {session.destinationName && (
                            <span className="text-gray-500 text-xs">
                              - {session.destinationName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có phiên họp nào được lên lịch</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSessionDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceCalendar;
export type { Conference, Session, ConferenceCalendarProps };

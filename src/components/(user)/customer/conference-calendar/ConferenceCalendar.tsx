import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { Calendar } from "lucide-react";
import { useConference } from "@/redux/hooks/useConference";
import type {
  ConferenceDetailForScheduleResponse,
  SessionDetailForScheduleResponse,
} from "@/types/conference.type";
import ConferenceCard from "./ConferenceCard";
import SessionDetailDialog from "./SessionDetailDialog";

const ConferenceCalendar: React.FC = () => {
  const [selectedConference, setSelectedConference] = useState<string | null>(
    null
  );
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionDetailForScheduleResponse | null>(null);

  const calendarRef = useRef<FullCalendar | null>(null);
  const conferenceListRef = useRef<HTMLDivElement>(null);

  const {
    lazyOwnConferencesForSchedule: conferences,
    fetchOwnConferencesForSchedule,
    ownConferencesForScheduleLoading: isLoading,
    ownConferencesForScheduleError: error,
  } = useConference();

  useEffect(() => {
    fetchOwnConferencesForSchedule();
  }, [fetchOwnConferencesForSchedule]);

  const getCategoryColor = (
    category?: string,
    isSession: boolean = false
  ): string => {
    const colors: Record<string, string> = {
      Technology: isSession ? "#3b82f6" : "#2563eb",
      Blockchain: isSession ? "#8b5cf6" : "#7c3aed",
      DevOps: isSession ? "#06b6d4" : "#0891b2",
      Design: isSession ? "#ec4899" : "#db2777",
    };
    return colors[category || ""] || (isSession ? "#64748b" : "#475569");
  };

  const calendarEvents = (conferences || []).flatMap((conf) => [
    {
      id: conf.conferenceId,
      title: conf.conferenceName || "Untitled Conference",
      start: conf.startDate,
      end: conf.endDate,
      backgroundColor: getCategoryColor(conf.conferenceCategoryName),
      borderColor: getCategoryColor(conf.conferenceCategoryName),
      extendedProps: {
        conference: conf,
      },
    },
    ...conf.sessions.map((session) => ({
      id: session.conferenceSessionId,
      title: session.title || "Untitled Session",
      start: session.startTime,
      end: session.endTime,
      backgroundColor: getCategoryColor(conf.conferenceCategoryName, true),
      borderColor: getCategoryColor(conf.conferenceCategoryName),
      display: "block",
      extendedProps: {
        session: session,
        conference: conf,
      },
    })),
  ]);

  const handleConferenceClick = (conf: ConferenceDetailForScheduleResponse) => {
    setSelectedConference(conf.conferenceId);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && conf.startDate) {
      calendarApi.gotoDate(conf.startDate);
    }
  };

  const navigateToSession = (session: SessionDetailForScheduleResponse) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && session.startTime) {
      const sessionDate = new Date(session.startTime);
      calendarApi.gotoDate(sessionDate);
      calendarApi.changeView("dayGridMonth", sessionDate);
      calendarApi.changeView("timeGridWeek", sessionDate);

      setTimeout(() => {
        const sessionElement = document.querySelector(
          `[data-session-id="${session.conferenceSessionId}"]`
        ) as HTMLElement | null;
        if (sessionElement) {
          sessionElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          sessionElement.classList.add("highlighted-session");

          setTimeout(() => {
            sessionElement.classList.remove("highlighted-session");
          }, 2000);
        }
      }, 300);
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const conf = info.event.extendedProps.conference;
    const session = info.event.extendedProps.session;

    if (session) {
      // Clicked on a session from calendar - open detail without back button
      setSelectedSession(session);
      setSessionDetailOpen(true);
    } else {
      // Clicked on a conference - highlight it in the list
      setSelectedConference(conf.conferenceId);
      const conferenceElement = document.getElementById(
        `conference-${conf.conferenceId}`
      );
      if (conferenceElement && conferenceListRef.current) {
        conferenceElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải lịch hội nghị...</p>
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
            Lịch Hội nghị & Hội thảo
          </h1>
          <p className="text-gray-400">
            Theo dõi và quản lý các sự kiện sắp tới
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="calendar-container">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek",
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                eventDidMount={(info) => {
                  // gán data-id cho session để querySelector tìm được
                  if (info.event.extendedProps.session) {
                    info.el.setAttribute(
                      "data-session-id",
                      info.event.extendedProps.session.conferenceSessionId
                    );

                    // nếu session hiện tại đang được highlight
                    if (
                      selectedSession &&
                      selectedSession.conferenceSessionId ===
                      info.event.extendedProps.session.conferenceSessionId
                    ) {
                      info.el.classList.add("highlighted-session");
                    }
                  }
                }}
                height="auto"
                eventDisplay="block"
                displayEventTime={true}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                eventContent={(arg) => {
                  const session = arg.event.extendedProps.session;
                  const startTime = session?.startTime
                    ? new Date(session.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    : "";

                  const endTime = session.endTime
                    ? new Date(session.endTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    : "";
                  return (
                    <div className="flex flex-col overflow-hidden text-ellipsis">
                      <span className="text-xs font-semibold text-white leading-snug">
                        {arg.event.title}
                      </span>
                      {(startTime && endTime) && (
                        <span className="text-[10px] text-gray-300">
                          {startTime} - {endTime}
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
                  "hover:bg-blue-600",
                  "hover:text-white",
                  "cursor-pointer",
                  "rounded-md",
                  "px-1",
                ]}
              />
            </div>
          </div>

          {/* Conference List Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Danh sách Hội nghị
            </h2>
            <div
              ref={conferenceListRef}
              className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
              style={
                {
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4b5563 #1f2937",
                } as React.CSSProperties
              }
            >
              {(conferences || []).map((conf) => (
                <ConferenceCard
                  key={conf.conferenceId}
                  conf={conf}
                  selectedConference={selectedConference}
                  onConferenceClick={handleConferenceClick}
                  onSessionNavigate={navigateToSession}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session Detail Dialog from Calendar (no back button) */}
      <SessionDetailDialog
        open={sessionDetailOpen}
        session={selectedSession}
        onClose={() => {
          setSessionDetailOpen(false);
          setSelectedSession(null);
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
        .calendar-container
          .fc
          .fc-button-primary:not(:disabled).fc-button-active {
          background-color: rgb(59 130 246);
          border-color: rgb(37 99 235);
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
          background-color: rgb(30 58 138) !important;
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
        .highlighted-session {
        outline: 2px solid #3b82f6; /* viền xanh nổi bật */
        background-color: rgba(59, 130, 246, 0.3) !important; /* nền sáng hơn */
        transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ConferenceCalendar;
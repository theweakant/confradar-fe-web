import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { Calendar, Search } from "lucide-react";
import { useConference } from "@/redux/hooks/useConference";
import type {
  ConferenceDetailForScheduleResponse,
  SessionDetailForScheduleResponse,
} from "@/types/conference.type";
import ConferenceCard from "./ConferenceCard";
import SessionDetailDialog from "./SessionDetailDialog";
import { useAppSelector } from "@/redux/hooks/hooks";
import { RootState } from "@/redux/store";
import { checkUserRole } from "@/helper/conference";

const ConferenceCalendar: React.FC = () => {
  const user = useAppSelector(
    (state: RootState) => state.auth.user,
  );

  const [selectedConference, setSelectedConference] = useState<ConferenceDetailForScheduleResponse | null>(
    null
  );
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionDetailForScheduleResponse | null>(null);

  const [activeTab, setActiveTab] = useState<'technical' | 'research'>('technical');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredConferences = (conferences || []).filter((conf) => {
    const matchesTab = activeTab === 'technical'
      ? !conf.isResearchConference
      : conf.isResearchConference;

    const matchesSearch = conf.conferenceName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getSessionColor = (
    category?: string,
    userRole?: { isRootAuthor: boolean; isPresenter: boolean }
  ): { backgroundColor: string; borderColor: string } => {
    if (userRole?.isRootAuthor) {
      return {
        backgroundColor: "#f59e0b",
        borderColor: "#d97706",
      };
    }

    if (userRole?.isPresenter) {
      return {
        backgroundColor: "#10b981",
        borderColor: "#059669",
      };
    }

    const colors: Record<string, { backgroundColor: string; borderColor: string }> = {
      Technology: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
      Blockchain: { backgroundColor: "#8b5cf6", borderColor: "#7c3aed" },
      DevOps: { backgroundColor: "#06b6d4", borderColor: "#0891b2" },
      Design: { backgroundColor: "#ec4899", borderColor: "#db2777" },
    };

    return colors[category || ""] || { backgroundColor: "#64748b", borderColor: "#475569" };
  };

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
    ...conf.sessions.map((session) => {
      const userRole = checkUserRole(session, user);
      const colors = getSessionColor(conf.conferenceCategoryName, userRole);

      return {
        id: session.conferenceSessionId,
        title: session.title || "Untitled Session",
        start: session.startTime,
        end: session.endTime,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        display: "block",
        extendedProps: {
          session: session,
          conference: conf,
          userRole: userRole,
        },
      };
    }),
  ]);

  const handleConferenceClick = (conf: ConferenceDetailForScheduleResponse) => {
    setSelectedConference(conf);
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
      setSelectedSession(session);
      setSessionDetailOpen(true);
    } else {
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
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch hội nghị...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
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
    <div className="h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lịch Hội nghị & Hội thảo
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý các sự kiện sắp tới
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-lg border border-gray-200 flex flex-col h-full">
            <div className="calendar-container flex-1 h-full">
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
                  if (info.event.extendedProps.session) {
                    info.el.setAttribute(
                      "data-session-id",
                      info.event.extendedProps.session.conferenceSessionId
                    );

                    if (
                      selectedSession &&
                      selectedSession.conferenceSessionId ===
                      info.event.extendedProps.session.conferenceSessionId
                    ) {
                      info.el.classList.add("highlighted-session");
                    }
                  }
                }}
                height="100%"
                eventDisplay="block"
                displayEventTime={true}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                eventContent={(arg) => {
                  const session = arg.event.extendedProps.session;
                  const userRole = arg.event.extendedProps.userRole;
                  const startTime = session?.startTime
                    ? new Date(session.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    : "";

                  const endTime = session?.endTime
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
                        {userRole?.isRootAuthor && (
                          <span className="ml-1 text-[10px] bg-amber-700 px-1 rounded">👑</span>
                        )}
                        {userRole?.isPresenter && !userRole?.isRootAuthor && (
                          <span className="ml-1 text-[10px] bg-emerald-700 px-1 rounded">🎤</span>
                        )}
                      </span>
                      {(startTime && endTime) && (
                        <span className="text-[10px] text-gray-200">
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
          {/* <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"> */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Danh sách Hội nghị
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('technical')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'technical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Technical
              </button>
              <button
                onClick={() => setActiveTab('research')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'research'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Research
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm hội nghị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Conference List */}
            <div
              ref={conferenceListRef}
              // className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
              className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
              style={
                {
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d1d5db #f3f4f6",
                } as React.CSSProperties
              }
            >
              {filteredConferences.length > 0 ? (
                filteredConferences.map((conf) => (
                  <ConferenceCard
                    key={conf.conferenceId}
                    conf={conf}
                    selectedConference={selectedConference?.conferenceId}
                    onConferenceClick={handleConferenceClick}
                    onSessionNavigate={navigateToSession}
                  />
                ))
              ) : (
                // <div className="text-center py-8 text-gray-500">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Không tìm thấy hội nghị nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Detail Dialog from Calendar (no back button) */}
      <SessionDetailDialog
        open={sessionDetailOpen}
        session={selectedSession}
        sessionForChange={selectedConference?.sessions ?? []}
        onClose={() => {
          setSessionDetailOpen(false);
          setSelectedSession(null);
        }}
      />

      <style jsx global>{`
        .calendar-container .fc {
          background: transparent;
          color: rgb(17 24 39);
        }
        .calendar-container .fc .fc-button {
          background-color: rgb(243 244 246);
          border-color: rgb(209 213 219);
          color: rgb(17 24 39);
          text-transform: capitalize;
        }
        .calendar-container .fc .fc-button:hover {
          background-color: rgb(229 231 235);
          border-color: rgb(156 163 175);
        }
        .calendar-container .fc .fc-button:disabled {
          background-color: rgb(249 250 251);
          border-color: rgb(229 231 235);
          opacity: 0.6;
        }
        .calendar-container
          .fc
          .fc-button-primary:not(:disabled).fc-button-active {
          background-color: rgb(59 130 246);
          border-color: rgb(37 99 235);
        }
        .calendar-container .fc-theme-standard .fc-scrollgrid {
          border-color: rgb(229 231 235);
        }
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgb(229 231 235);
        }
        .calendar-container .fc .fc-col-header-cell {
          background-color: rgb(249 250 251);
          color: rgb(75 85 99);
          font-weight: 600;
        }
        .calendar-container .fc .fc-daygrid-day {
          background-color: rgb(255 255 255);
        }
        .calendar-container .fc .fc-daygrid-day:hover {
          background-color: rgb(249 250 251);
        }
        .calendar-container .fc .fc-daygrid-day-number {
          color: rgb(55 65 81);
        }
        .calendar-container .fc .fc-day-today {
          background-color: rgb(219 234 254) !important;
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
          color: rgb(107 114 128);
        }
        .calendar-container .fc-direction-ltr .fc-daygrid-event {
          margin-left: 2px;
          margin-right: 2px;
        }
        .calendar-container .fc .fc-toolbar-title {
          color: rgb(17 24 39);
          font-size: 1.5rem;
        }
        .calendar-container .fc .fc-daygrid-day-top {
          justify-content: center;
        }
        .highlighted-session {
          outline: 2px solid #3b82f6;
          background-color: rgba(59, 130, 246, 0.3) !important;
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ConferenceCalendar;

// import React, { useState, useRef, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { EventClickArg } from "@fullcalendar/core";
// import { Calendar, Search } from "lucide-react";
// import { useConference } from "@/redux/hooks/useConference";
// import type {
//   ConferenceDetailForScheduleResponse,
//   SessionDetailForScheduleResponse,
// } from "@/types/conference.type";
// import ConferenceCard from "./ConferenceCard";
// import SessionDetailDialog from "./SessionDetailDialog";
// import { useAppSelector } from "@/redux/hooks/hooks";
// import { RootState } from "@/redux/store";
// import { checkUserRole } from "@/helper/conference";

// const ConferenceCalendar: React.FC = () => {
//   const user = useAppSelector(
//     (state: RootState) => state.auth.user,
//   );

//   const [selectedConference, setSelectedConference] = useState<ConferenceDetailForScheduleResponse | null>(
//     null
//   );
//   const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
//   const [selectedSession, setSelectedSession] =
//     useState<SessionDetailForScheduleResponse | null>(null);

//   const [activeTab, setActiveTab] = useState<'technical' | 'research'>('technical');
//   const [searchQuery, setSearchQuery] = useState('');

//   const calendarRef = useRef<FullCalendar | null>(null);
//   const conferenceListRef = useRef<HTMLDivElement>(null);

//   const {
//     lazyOwnConferencesForSchedule: conferences,
//     fetchOwnConferencesForSchedule,
//     ownConferencesForScheduleLoading: isLoading,
//     ownConferencesForScheduleError: error,
//   } = useConference();

//   useEffect(() => {
//     fetchOwnConferencesForSchedule();
//   }, [fetchOwnConferencesForSchedule]);

//   const filteredConferences = (conferences || []).filter((conf) => {
//     // Filter by tab
//     const matchesTab = activeTab === 'technical'
//       ? !conf.isResearchConference
//       : conf.isResearchConference;

//     // Filter by search query
//     const matchesSearch = conf.conferenceName
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase());

//     return matchesTab && matchesSearch;
//   });

//   const getSessionColor = (
//     category?: string,
//     userRole?: { isRootAuthor: boolean; isPresenter: boolean }
//   ): { backgroundColor: string; borderColor: string } => {
//     // Nếu user là root author - màu vàng/gold
//     if (userRole?.isRootAuthor) {
//       return {
//         backgroundColor: "#f59e0b", // amber-500
//         borderColor: "#d97706", // amber-600
//       };
//     }

//     // Nếu user là presenter - màu xanh lá
//     if (userRole?.isPresenter) {
//       return {
//         backgroundColor: "#10b981", // emerald-500
//         borderColor: "#059669", // emerald-600
//       };
//     }

//     // Màu mặc định theo category
//     const colors: Record<string, { backgroundColor: string; borderColor: string }> = {
//       Technology: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
//       Blockchain: { backgroundColor: "#8b5cf6", borderColor: "#7c3aed" },
//       DevOps: { backgroundColor: "#06b6d4", borderColor: "#0891b2" },
//       Design: { backgroundColor: "#ec4899", borderColor: "#db2777" },
//     };

//     return colors[category || ""] || { backgroundColor: "#64748b", borderColor: "#475569" };
//   };


//   const getCategoryColor = (
//     category?: string,
//     isSession: boolean = false
//   ): string => {
//     const colors: Record<string, string> = {
//       Technology: isSession ? "#3b82f6" : "#2563eb",
//       Blockchain: isSession ? "#8b5cf6" : "#7c3aed",
//       DevOps: isSession ? "#06b6d4" : "#0891b2",
//       Design: isSession ? "#ec4899" : "#db2777",
//     };
//     return colors[category || ""] || (isSession ? "#64748b" : "#475569");
//   };

//   const calendarEvents = (conferences || []).flatMap((conf) => [
//     {
//       id: conf.conferenceId,
//       title: conf.conferenceName || "Untitled Conference",
//       start: conf.startDate,
//       end: conf.endDate,
//       backgroundColor: getCategoryColor(conf.conferenceCategoryName),
//       borderColor: getCategoryColor(conf.conferenceCategoryName),
//       extendedProps: {
//         conference: conf,
//       },
//     },
//     ...conf.sessions.map((session) => {
//       const userRole = checkUserRole(session, user);
//       const colors = getSessionColor(conf.conferenceCategoryName, userRole);

//       return {
//         id: session.conferenceSessionId,
//         title: session.title || "Untitled Session",
//         start: session.startTime,
//         end: session.endTime,
//         backgroundColor: colors.backgroundColor,
//         borderColor: colors.borderColor,
//         display: "block",
//         extendedProps: {
//           session: session,
//           conference: conf,
//           userRole: userRole,
//         },
//       };
//     }),
//   ]);

//   // const calendarEvents = (conferences || []).flatMap((conf) => [
//   //   {
//   //     id: conf.conferenceId,
//   //     title: conf.conferenceName || "Untitled Conference",
//   //     start: conf.startDate,
//   //     end: conf.endDate,
//   //     backgroundColor: getCategoryColor(conf.conferenceCategoryName),
//   //     borderColor: getCategoryColor(conf.conferenceCategoryName),
//   //     extendedProps: {
//   //       conference: conf,
//   //     },
//   //   },
//   //   ...conf.sessions.map((session) => ({
//   //     id: session.conferenceSessionId,
//   //     title: session.title || "Untitled Session",
//   //     start: session.startTime,
//   //     end: session.endTime,
//   //     backgroundColor: getCategoryColor(conf.conferenceCategoryName, true),
//   //     borderColor: getCategoryColor(conf.conferenceCategoryName),
//   //     display: "block",
//   //     extendedProps: {
//   //       session: session,
//   //       conference: conf,
//   //     },
//   //   })),
//   // ]);

//   const handleConferenceClick = (conf: ConferenceDetailForScheduleResponse) => {
//     setSelectedConference(conf);
//     const calendarApi = calendarRef.current?.getApi();
//     if (calendarApi && conf.startDate) {
//       calendarApi.gotoDate(conf.startDate);
//     }
//   };

//   const navigateToSession = (session: SessionDetailForScheduleResponse) => {
//     const calendarApi = calendarRef.current?.getApi();
//     if (calendarApi && session.startTime) {
//       const sessionDate = new Date(session.startTime);
//       calendarApi.gotoDate(sessionDate);
//       calendarApi.changeView("dayGridMonth", sessionDate);
//       calendarApi.changeView("timeGridWeek", sessionDate);

//       setTimeout(() => {
//         const sessionElement = document.querySelector(
//           `[data-session-id="${session.conferenceSessionId}"]`
//         ) as HTMLElement | null;
//         if (sessionElement) {
//           sessionElement.scrollIntoView({
//             behavior: "smooth",
//             block: "center",
//           });

//           sessionElement.classList.add("highlighted-session");

//           setTimeout(() => {
//             sessionElement.classList.remove("highlighted-session");
//           }, 2000);
//         }
//       }, 300);
//     }
//   };

//   const handleEventClick = (info: EventClickArg) => {
//     const conf = info.event.extendedProps.conference;
//     const session = info.event.extendedProps.session;

//     if (session) {
//       // Clicked on a session from calendar - open detail without back button
//       setSelectedSession(session);
//       setSessionDetailOpen(true);
//     } else {
//       // Clicked on a conference - highlight it in the list
//       setSelectedConference(conf.conferenceId);
//       const conferenceElement = document.getElementById(
//         `conference-${conf.conferenceId}`
//       );
//       if (conferenceElement && conferenceListRef.current) {
//         conferenceElement.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-400">Đang tải lịch hội nghị...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
//       <div className="max-w-7xl mx-auto flex-1 flex flex-col">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-white mb-2">
//             Lịch Hội nghị & Hội thảo
//           </h1>
//           <p className="text-gray-400">
//             Theo dõi và quản lý các sự kiện sắp tới
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
//           {/* Calendar Section */}
//           <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col h-full">
//             <div className="calendar-container flex-1 h-full">
//               <FullCalendar
//                 ref={calendarRef}
//                 plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 headerToolbar={{
//                   left: "prev,next today",
//                   center: "title",
//                   right: "dayGridMonth,timeGridWeek",
//                 }}
//                 events={calendarEvents}
//                 eventClick={handleEventClick}
//                 eventDidMount={(info) => {
//                   // gán data-id cho session để querySelector tìm được
//                   if (info.event.extendedProps.session) {
//                     info.el.setAttribute(
//                       "data-session-id",
//                       info.event.extendedProps.session.conferenceSessionId
//                     );

//                     // nếu session hiện tại đang được highlight
//                     if (
//                       selectedSession &&
//                       selectedSession.conferenceSessionId ===
//                       info.event.extendedProps.session.conferenceSessionId
//                     ) {
//                       info.el.classList.add("highlighted-session");
//                     }
//                   }
//                 }}
//                 height="100%"
//                 eventDisplay="block"
//                 displayEventTime={true}
//                 eventTimeFormat={{
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   hour12: false,
//                 }}
//                 eventContent={(arg) => {
//                   const session = arg.event.extendedProps.session;
//                   const userRole = arg.event.extendedProps.userRole;
//                   const startTime = session?.startTime
//                     ? new Date(session.startTime).toLocaleTimeString("vi-VN", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: false,
//                     })
//                     : "";

//                   const endTime = session?.endTime
//                     ? new Date(session.endTime).toLocaleTimeString("vi-VN", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: false,
//                     })
//                     : "";

//                   return (
//                     <div className="flex flex-col overflow-hidden text-ellipsis">
//                       <span className="text-xs font-semibold text-white leading-snug">
//                         {arg.event.title}
//                         {userRole?.isRootAuthor && (
//                           <span className="ml-1 text-[10px] bg-amber-700 px-1 rounded">👑</span>
//                         )}
//                         {userRole?.isPresenter && !userRole?.isRootAuthor && (
//                           <span className="ml-1 text-[10px] bg-emerald-700 px-1 rounded">🎤</span>
//                         )}
//                       </span>
//                       {(startTime && endTime) && (
//                         <span className="text-[10px] text-gray-300">
//                           {startTime} - {endTime}
//                         </span>
//                       )}
//                     </div>
//                   );
//                 }}
//                 // eventContent={(arg) => {
//                 //   const session = arg.event.extendedProps.session;
//                 //   const startTime = session?.startTime
//                 //     ? new Date(session.startTime).toLocaleTimeString("vi-VN", {
//                 //       hour: "2-digit",
//                 //       minute: "2-digit",
//                 //       hour12: false,
//                 //     })
//                 //     : "";

//                 //   const endTime = session?.endTime
//                 //     ? new Date(session.endTime).toLocaleTimeString("vi-VN", {
//                 //       hour: "2-digit",
//                 //       minute: "2-digit",
//                 //       hour12: false,
//                 //     })
//                 //     : "";
//                 //   return (
//                 //     <div className="flex flex-col overflow-hidden text-ellipsis">
//                 //       <span className="text-xs font-semibold text-white leading-snug">
//                 //         {arg.event.title}
//                 //       </span>
//                 //       {(startTime && endTime) && (
//                 //         <span className="text-[10px] text-gray-300">
//                 //           {startTime} - {endTime}
//                 //         </span>
//                 //       )}
//                 //     </div>
//                 //   );
//                 // }}
//                 eventClassNames={() => [
//                   "transition-all",
//                   "duration-200",
//                   "ease-in-out",
//                   "hover:scale-105",
//                   "hover:shadow-lg",
//                   "hover:z-10",
//                   "hover:bg-blue-600",
//                   "hover:text-white",
//                   "cursor-pointer",
//                   "rounded-md",
//                   "px-1",
//                 ]}
//               />
//             </div>
//           </div>

//           {/* Conference List Section */}
//           <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-400" />
//               Danh sách Hội nghị
//             </h2>

//             {/* Tabs */}
//             <div className="flex gap-2 mb-4">
//               <button
//                 onClick={() => setActiveTab('technical')}
//                 className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'technical'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                   }`}
//               >
//                 Technical
//               </button>
//               <button
//                 onClick={() => setActiveTab('research')}
//                 className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'research'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                   }`}
//               >
//                 Research
//               </button>
//             </div>

//             {/* Search Bar */}
//             <div className="relative mb-4">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm hội nghị..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Conference List */}
//             <div
//               ref={conferenceListRef}
//               className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
//               style={
//                 {
//                   scrollbarWidth: "thin",
//                   scrollbarColor: "#4b5563 #1f2937",
//                 } as React.CSSProperties
//               }
//             >
//               {filteredConferences.length > 0 ? (
//                 filteredConferences.map((conf) => (
//                   <ConferenceCard
//                     key={conf.conferenceId}
//                     conf={conf}
//                     selectedConference={selectedConference?.conferenceId}
//                     onConferenceClick={handleConferenceClick}
//                     onSessionNavigate={navigateToSession}
//                   />
//                 ))
//               ) : (
//                 <div className="text-center py-8 text-gray-400">
//                   <p>Không tìm thấy hội nghị nào</p>
//                 </div>
//               )}
//             </div>
//           </div>
//           {/* <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-400" />
//               Danh sách Hội nghị
//             </h2>
//             <div
//               ref={conferenceListRef}
//               className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
//               style={
//                 {
//                   scrollbarWidth: "thin",
//                   scrollbarColor: "#4b5563 #1f2937",
//                 } as React.CSSProperties
//               }
//             >
//               {(conferences || []).map((conf) => (
//                 <ConferenceCard
//                   key={conf.conferenceId}
//                   conf={conf}
//                   selectedConference={selectedConference?.conferenceId}
//                   onConferenceClick={handleConferenceClick}
//                   onSessionNavigate={navigateToSession}
//                 />
//               ))}
//             </div>
//           </div>*/}
//         </div>
//       </div>

//       {/* Session Detail Dialog from Calendar (no back button) */}
//       <SessionDetailDialog
//         open={sessionDetailOpen}
//         session={selectedSession}
//         sessionForChange={selectedConference?.sessions ?? []}
//         onClose={() => {
//           setSessionDetailOpen(false);
//           setSelectedSession(null);
//         }}
//       />

//       <style jsx global>{`
//         .calendar-container .fc {
//           background: transparent;
//           color: rgb(243 244 246);
//         }
//         .calendar-container .fc .fc-button {
//           background-color: rgb(55 65 81);
//           border-color: rgb(75 85 99);
//           color: rgb(243 244 246);
//           text-transform: capitalize;
//         }
//         .calendar-container .fc .fc-button:hover {
//           background-color: rgb(75 85 99);
//           border-color: rgb(107 114 128);
//         }
//         .calendar-container .fc .fc-button:disabled {
//           background-color: rgb(31 41 55);
//           border-color: rgb(55 65 81);
//           opacity: 0.6;
//         }
//         .calendar-container
//           .fc
//           .fc-button-primary:not(:disabled).fc-button-active {
//           background-color: rgb(59 130 246);
//           border-color: rgb(37 99 235);
//         }
//         .calendar-container .fc-theme-standard .fc-scrollgrid {
//           border-color: rgb(55 65 81);
//         }
//         .calendar-container .fc-theme-standard td,
//         .calendar-container .fc-theme-standard th {
//           border-color: rgb(55 65 81);
//         }
//         .calendar-container .fc .fc-col-header-cell {
//           background-color: rgb(31 41 55);
//           color: rgb(156 163 175);
//           font-weight: 600;
//         }
//         .calendar-container .fc .fc-daygrid-day {
//           background-color: rgb(17 24 39);
//         }
//         .calendar-container .fc .fc-daygrid-day:hover {
//           background-color: rgb(31 41 55);
//         }
//         .calendar-container .fc .fc-daygrid-day-number {
//           color: rgb(209 213 219);
//         }
//         .calendar-container .fc .fc-day-today {
//           background-color: rgb(30 58 138) !important;
//         }
//         .calendar-container .fc .fc-event {
//           border-radius: 4px;
//           padding: 2px 4px;
//           margin-bottom: 2px;
//         }
//         .calendar-container .fc .fc-event-title {
//           font-size: 0.75rem;
//           font-weight: 500;
//         }
//         .calendar-container .fc .fc-timegrid-slot {
//           height: 3rem;
//         }
//         .calendar-container .fc .fc-timegrid-slot-label {
//           color: rgb(156 163 175);
//         }
//         .calendar-container .fc-direction-ltr .fc-daygrid-event {
//           margin-left: 2px;
//           margin-right: 2px;
//         }
//         .calendar-container .fc .fc-toolbar-title {
//           color: rgb(243 244 246);
//           font-size: 1.5rem;
//         }
//         .calendar-container .fc .fc-daygrid-day-top {
//           justify-content: center;
//         }
//         .highlighted-session {
//         outline: 2px solid #3b82f6; /* viền xanh nổi bật */
//         background-color: rgba(59, 130, 246, 0.3) !important; /* nền sáng hơn */
//         transition: all 0.3s ease-in-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ConferenceCalendar;
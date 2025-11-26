// // src/components/SessionCalendar.tsx
// import React, { useState, useRef, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { EventClickArg, DatesSetArg } from "@fullcalendar/core";
// import { FileText } from "lucide-react";
// import { useGetResearchSessionsQuery } from "@/redux/services/conferenceStep.service";
// import { useListAcceptedPapersQuery } from "@/redux/services/paper.service";
// import type { SessionDetailForScheduleResponse } from "@/types/conference.type";
// import type { AcceptedPaper } from "@/types/paper.type";
// import PaperCard from "./Paper/PaperCard";
// import SessionDetailDialog from "./SessionDetail";

// interface SessionCalendarProps {
//   conferenceId?: string;
//   onPaperSelected?: (paperId: string) => void;
//   onSessionSelected?: (session: SessionDetailForScheduleResponse) => void;
//   startDate?: string; 
//   acceptedPapers?: AcceptedPaper[];
// }

// const SessionCalendar: React.FC<SessionCalendarProps> = ({
//   conferenceId,
//   onPaperSelected,
//   onSessionSelected,
//   startDate,
//   acceptedPapers: externalAcceptedPapers,
// }) => {
//   const [selectedSession, setSelectedSession] = useState<SessionDetailForScheduleResponse | null>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const calendarRef = useRef<FullCalendar>(null);

//   // 🔹 Fetch sessions
//   const {
//     data: sessionsResponse,
//     isLoading: isLoadingSessions,
//     error: sessionsError,
//     refetch: refetchSessions,
//   } = useGetResearchSessionsQuery(conferenceId!, {
//     skip: !conferenceId,
//   });

//   // 🔹 Fetch accepted papers
//   const {
//     data: acceptedPapersResponse,
//     isLoading: isLoadingPapers,
//     error: papersError,
//   } = useListAcceptedPapersQuery(
//     { confId: conferenceId! },
//     { skip: !conferenceId || externalAcceptedPapers !== undefined }
//   );

//   const sessions = sessionsResponse?.data || [];
//   const internalAcceptedPapers = acceptedPapersResponse?.data || [];
//   const papersToDisplay = externalAcceptedPapers !== undefined
//     ? externalAcceptedPapers
//     : internalAcceptedPapers;

//   const calendarEvents = sessions.map((session) => ({
//     id: session.sessionId,
//     title: session.title,
//     start: `${session.date}T${session.startTime}`,
//     end: `${session.date}T${session.endTime}`,
//     backgroundColor: "#3b82f6",
//     borderColor: "#2563eb",
//     extendedProps: {
//       session,
//     },
//   }));


//   const handleEventClick = (info: EventClickArg) => {
//     info.jsEvent.preventDefault(); 
//     const session = info.event.extendedProps.session as SessionDetailForScheduleResponse;
//     setSelectedSession(session);
//     onSessionSelected?.(session);
//     setDialogOpen(true);
//   };

//   useEffect(() => {
//     if (calendarRef.current && startDate) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.gotoDate(startDate);
//     }
//   }, [startDate]);

//   const isLoading = isLoadingSessions || (externalAcceptedPapers === undefined && isLoadingPapers);
//   const error = sessionsError || papersError;

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
//           <p className="text-sm text-gray-600">Đang tải lịch phiên...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <p className="text-sm text-red-600 mb-3">Có lỗi xảy ra khi tải dữ liệu phiên</p>
//           <button
//             onClick={() => refetchSessions()}
//             className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* Legend */}
//       <div className="mb-4 flex gap-4 items-center text-xs px-1">
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 rounded bg-blue-600"></div>
//           <span className="text-gray-600">Phiên đã lên lịch</span>
//         </div>
//       </div>

//       <div className="grid gap-4 lg:grid-cols-3">
//         {/* Calendar */}
//         <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
//           <style>{`
//             .fc {
//               --fc-border-color: #e5e7eb;
//               --fc-button-bg-color: #3b82f6;
//               --fc-button-border-color: #3b82f6;
//               --fc-button-hover-bg-color: #2563eb;
//               --fc-button-hover-border-color: #2563eb;
//               --fc-button-active-bg-color: #1d4ed8;
//               --fc-button-active-border-color: #1d4ed8;
//               --fc-today-bg-color: #eff6ff;
//             }
//             .fc .fc-button {
//               font-size: 0.875rem;
//               padding: 0.375rem 0.75rem;
//               text-transform: capitalize;
//             }
//             .fc .fc-toolbar-title {
//               font-size: 1.125rem;
//               font-weight: 600;
//               color: #111827;
//             }
//             .fc .fc-col-header-cell {
//               background-color: #f9fafb;
//               font-weight: 500;
//               color: #374151;
//               font-size: 0.75rem;
//               text-transform: uppercase;
//               padding: 0.5rem 0;
//             }
//             .fc .fc-daygrid-day-number {
//               color: #374151;
//               font-size: 0.875rem;
//               padding: 0.25rem;
//             }
//             .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
//               background-color: #3b82f6;
//               color: white;
//               border-radius: 50%;
//               width: 1.75rem;
//               height: 1.75rem;
//               display: flex;
//               align-items: center;
//               justify-content: center;
//             }
//           `}</style>
//           <FullCalendar
//             ref={calendarRef}
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             initialView="dayGridWeek"
//             headerToolbar={{
//               left: "prev,next today",
//               center: "title",
//               right: "dayGridWeek,timeGridDay",
//             }}
//             events={calendarEvents}
//             eventClick={handleEventClick}
//             height="auto"
//             eventDisplay="block"
//             displayEventTime={true}
//             eventTimeFormat={{
//               hour: "2-digit",
//               minute: "2-digit",
//               hour12: false,
//               meridiem: false,
//             }}
//             eventContent={(arg) => {
//               const start = arg.event.start;
//               const end = arg.event.end;

//               const formatTime = (date: Date | null): string => {
//                 if (!date) return "--:--";
//                 return date.toTimeString().slice(0, 5);
//               };

//               return (
//                 <div className="flex flex-col overflow-hidden text-ellipsis p-1">
//                   <span className="text-xs font-semibold text-white leading-snug truncate">
//                     {arg.event.title}
//                   </span>
//                   <span className="text-[10px] text-blue-100">
//                     {formatTime(start)} - {formatTime(end)}
//                   </span>
//                 </div>
//               );
//             }}
//             eventClassNames={() => [
//               "transition-all",
//               "duration-200",
//               "ease-in-out",
//               "hover:scale-105",
//               "hover:shadow-md",
//               "hover:z-10",
//               "cursor-pointer",
//               "rounded-md",
//             ]}
//           />
//         </div>

//         {/* Paper List */}
//         <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
//           <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
//             <FileText className="w-4 h-4 text-blue-600" />
//             Bài báo ({papersToDisplay.length})
//           </h2>
//           <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
//             {papersToDisplay.length === 0 ? (
//               <div className="text-gray-500 text-sm py-8 text-center">
//                 Không có bài báo nào
//               </div>
//             ) : (
//               papersToDisplay.map((paper) => (
//                 <PaperCard
//                   key={paper.paperId}
//                   paper={paper}
//                   onClick={() => onPaperSelected?.(paper.paperId)}
//                 />
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Session Detail Dialog */}
//       <SessionDetailDialog
//         open={dialogOpen}
//         session={selectedSession}
//         onClose={() => {
//           setDialogOpen(false);
//           setSelectedSession(null);
//         }}
//       />
//     </div>
//   );
// };

// export default SessionCalendar;


// src/components/SessionCalendar.tsx
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { FileText, Plus, Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useGetResearchSessionsQuery } from "@/redux/services/conferenceStep.service";
import { useListAcceptedPapersQuery } from "@/redux/services/paper.service";
import type { SessionDetailForScheduleResponse } from "@/types/conference.type";
import type { AcceptedPaper } from "@/types/paper.type";
import type { Session } from "@/types/conference.type";
import PaperCard from "./Paper/PaperCard";
import SessionDetailDialog from "./SessionDetail";
import { CollaboratorSessionFormDialog } from "@/components/molecules/Calendar/RoomCalendar/Form/CollaboratorSessionForm";

interface SessionCalendarProps {
  conferenceId?: string;
  onPaperSelected?: (paperId: string) => void;
  onSessionSelected?: (session: SessionDetailForScheduleResponse) => void;
  startDate?: string; 
  acceptedPapers?: AcceptedPaper[];
  
  // 🔹 Props mới cho Collaborator
  isCollaboratorMode?: boolean;
  conferenceStartDate?: string;
  conferenceEndDate?: string;
  existingSessions?: Session[];
  onSessionCreated?: (session: Session) => void;
  onSessionUpdated?: (session: Session, index: number) => void;
  onSessionDeleted?: (index: number) => void;
}

const SessionCalendar: React.FC<SessionCalendarProps> = ({
  conferenceId,
  onPaperSelected,
  onSessionSelected,
  startDate,
  acceptedPapers: externalAcceptedPapers,
  
  // 🔹 Destructure props mới
  isCollaboratorMode = false,
  conferenceStartDate,
  conferenceEndDate,
  existingSessions = [],
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
}) => {
  const [selectedSession, setSelectedSession] = useState<SessionDetailForScheduleResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // 🔹 State cho Collaborator session form
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  
  const calendarRef = useRef<FullCalendar>(null);

  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useGetResearchSessionsQuery(conferenceId!, {
    skip: !conferenceId,
  });

  const {
    data: acceptedPapersResponse,
    isLoading: isLoadingPapers,
    error: papersError,
  } = useListAcceptedPapersQuery(
    { confId: conferenceId! },
    { skip: !conferenceId || externalAcceptedPapers !== undefined }
  );

  const sessions = sessionsResponse?.data || [];
  const internalAcceptedPapers = acceptedPapersResponse?.data || [];
  const papersToDisplay = externalAcceptedPapers !== undefined
    ? externalAcceptedPapers
    : internalAcceptedPapers;

  const allSessions = isCollaboratorMode 
    ? [...sessions, ...existingSessions]
    : sessions;

  const calendarEvents = allSessions.map((session) => {
    const isLocal = !session.sessionId;
    return {
      id: session.sessionId || `temp-${session.title}-${session.date}-${session.startTime}`,
      title: session.title,
      start: `${session.date}T${session.startTime}`,
      end: `${session.date}T${session.endTime}`,
      backgroundColor: isLocal ? "#8b5cf6" : "#3b82f6", 
      borderColor: isLocal ? "#7c3aed" : "#2563eb",
      extendedProps: {
        session,
        isLocal,
      },
    };
  });

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault(); 
    const session = info.event.extendedProps.session as SessionDetailForScheduleResponse | Session;
    const isLocal = info.event.extendedProps.isLocal;
    
    if (isCollaboratorMode && isLocal) {
      const index = existingSessions.findIndex(s => 
        s.title === session.title && 
        s.date === session.date && 
        s.startTime === session.startTime
      );
      
      if (index !== -1) {
        setEditingSession(existingSessions[index]);
        setEditingIndex(index);
        setShowSessionForm(true);
      }
    } else {
      setSelectedSession(session as SessionDetailForScheduleResponse);
      onSessionSelected?.(session as SessionDetailForScheduleResponse);
      setDialogOpen(true);
    }
  };

  // 🔹 Handler tạo session mới
  const handleCreateSession = () => {
    if (!conferenceId) {
      toast.error("Thiếu Conference ID!");
      return;
    }
    if (!conferenceStartDate || !conferenceEndDate) {
      toast.error("Thiếu thông tin ngày tổ chức hội thảo!");
      return;
    }
    setEditingSession(null);
    setEditingIndex(-1);
    setShowSessionForm(true);
  };

  // 🔹 Handler save session từ form
  const handleSessionFormSave = (session: Session) => {
    if (editingIndex !== -1) {
      // Update existing
      onSessionUpdated?.(session, editingIndex);
    } else {
      // Create new
      onSessionCreated?.(session);
    }
    setShowSessionForm(false);
    setEditingSession(null);
    setEditingIndex(-1);
  };

  // 🔹 Handler delete session
  const handleDeleteSession = (index: number) => {
    const session = existingSessions[index];
    if (window.confirm(`Xóa phiên họp "${session.title}"?`)) {
      onSessionDeleted?.(index);
      toast.success("Đã xóa phiên họp!");
    }
  };

  useEffect(() => {
    if (calendarRef.current && startDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
    }
  }, [startDate]);

  const isLoading = isLoadingSessions || (externalAcceptedPapers === undefined && isLoadingPapers);
  const error = sessionsError || papersError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Đang tải lịch phiên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">Có lỗi xảy ra khi tải dữ liệu phiên</p>
          <button
            onClick={() => refetchSessions()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 🔹 Header với button tạo session cho Collaborator */}
      <div className="ml-2 mb-4 flex justify-between items-center">
        {/* Legend */}
        <div className="flex gap-4 items-center text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-600"></div>
            <span className="text-gray-600">Phiên đã lưu</span>
          </div>
          {isCollaboratorMode && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-600"></div>
              <span className="text-gray-600">Phiên mới tạo</span>
            </div>
          )}
        </div>

        {/* 🔹 Button tạo session cho Collaborator */}
        {isCollaboratorMode && conferenceId && (
          <button
            onClick={handleCreateSession}
            className="px-4 py-2 mt-4 mr-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo session
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar */}
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
          `}</style>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              meridiem: false,
            }}
            eventContent={(arg) => {
              const start = arg.event.start;
              const end = arg.event.end;

              const formatTime = (date: Date | null): string => {
                if (!date) return "--:--";
                return date.toTimeString().slice(0, 5);
              };

              return (
                <div className="flex flex-col overflow-hidden text-ellipsis p-1">
                  <span className="text-xs font-semibold text-white leading-snug truncate">
                    {arg.event.title}
                  </span>
                  <span className="text-[10px] text-blue-100">
                    {formatTime(start)} - {formatTime(end)}
                  </span>
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

        {/* Right Sidebar - Papers hoặc Sessions List */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
          {isCollaboratorMode ? (
            // 🔹 Hiển thị danh sách sessions cho Collaborator
            <>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <FileText className="w-4 h-4 text-blue-600" />
                Danh sách session ({existingSessions.length})
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {existingSessions.length === 0 ? (
                  <div className="text-gray-500 text-sm py-8 text-center">
                    <p className="mb-2">Chưa có phiên họp nào</p>
                    <button
                      onClick={handleCreateSession}
                      className="text-blue-600 hover:text-blue-700 underline text-xs"
                    >
                      Tạo phiên họp đầu tiên
                    </button>
                  </div>
                ) : (
                  existingSessions.map((session, index) => {
                    const formatTime = (timeStr: string) => {
                      if (timeStr.includes('T')) {
                        return new Date(timeStr).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      }
                      return timeStr.slice(0, 5);
                    };

                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.date).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                        {session.speaker && session.speaker.length > 0 && (
                          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.speaker.length} diễn giả
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingSession(session);
                              setEditingIndex(index);
                              setShowSessionForm(true);
                            }}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSession(index)}
                            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            // 🔹 Hiển thị danh sách papers cho non-Collaborator
            <>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <FileText className="w-4 h-4 text-blue-600" />
                Bài báo ({papersToDisplay.length})
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {papersToDisplay.length === 0 ? (
                  <div className="text-gray-500 text-sm py-8 text-center">
                    Không có bài báo nào
                  </div>
                ) : (
                  papersToDisplay.map((paper) => (
                    <PaperCard
                      key={paper.paperId}
                      paper={paper}
                      onClick={() => onPaperSelected?.(paper.paperId)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Session Detail Dialog - cho view-only */}
      <SessionDetailDialog
        open={dialogOpen}
        session={selectedSession}
        onClose={() => {
          setDialogOpen(false);
          setSelectedSession(null);
        }}
      />

      {/* 🔹 Session Form Dialog cho Collaborator */}
      {isCollaboratorMode && showSessionForm && conferenceId && conferenceStartDate && conferenceEndDate && (
        <CollaboratorSessionFormDialog
          open={showSessionForm}
          conferenceId={conferenceId}
          conferenceStartDate={conferenceStartDate}
          conferenceEndDate={conferenceEndDate}
          existingSessions={existingSessions}
          initialSession={editingSession}
          onSave={handleSessionFormSave}
          onClose={() => {
            setShowSessionForm(false);
            setEditingSession(null);
            setEditingIndex(-1);
          }}
        />
      )}
    </div>
  );
};

export default SessionCalendar;
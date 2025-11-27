import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { FileText, Plus, Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useGetResearchSessionsQuery } from "@/redux/services/conferenceStep.service";
import type { SessionDetailForScheduleResponse } from "@/types/conference.type";
import type { Session } from "@/types/conference.type";
import SessionDetailDialog from "@/components/molecules/Calendar/SessionCalendar/Modal/SessionDetail";
import { CollaboratorSessionForm } from "@/components/molecules/Calendar/RoomCalendar/Form/CollaboratorSessionForm";

interface CalendarSession {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  speaker?: string[];
  original?: Session | SessionDetailForScheduleResponse;
}

interface SessionProposalCalendarProps {
  conferenceId?: string;
  conferenceStartDate?: string;
  conferenceEndDate?: string;
  existingSessions: Session[];
  onSessionCreated: (session: Session) => void;
  onSessionUpdated: (session: Session, index: number) => void;
  onSessionDeleted: (index: number) => void;
  startDate?: string;
}

const SessionProposalCalendar: React.FC<SessionProposalCalendarProps> = ({
  conferenceId,
  conferenceStartDate,
  conferenceEndDate,
  existingSessions = [],
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
  startDate,
}) => {
  const [selectedSession, setSelectedSession] = useState<SessionDetailForScheduleResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);
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

  const normalizeApiSession = (s: SessionDetailForScheduleResponse): CalendarSession => {
    const date = s.date || s.sessionDate || new Date().toISOString().split("T")[0];
    const startTime = s.startTime?.slice(0, 5) || "09:00";
    const endTime = s.endTime?.slice(0, 5) || "10:00";

    return {
      id: s.conferenceSessionId,
      title: s.title || "",
      date,
      startTime,
      endTime,
      speaker: s.speakerNames || [],
      original: s,
    };
  };

  const normalizeCollaboratorSession = (s: Session): CalendarSession => ({
    id: s.sessionId,
    title: s.title,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    speaker: s.speaker?.map(sp => sp.name) || [],
    original: s,
  });

  const apiSessions: SessionDetailForScheduleResponse[] = sessionsResponse?.data || [];
  const normalizedApiSessions = apiSessions.map(normalizeApiSession);
  const normalizedLocalSessions = existingSessions.map(normalizeCollaboratorSession);
  const allNormalizedSessions = [...normalizedApiSessions, ...normalizedLocalSessions];

  const getInitialCalendarDate = (): string | undefined => {
    if (startDate) return startDate;
    if (allNormalizedSessions.length > 0) {
      const dates = allNormalizedSessions
        .map(s => s.date)
        .filter(Boolean)
        .sort();
      return dates[0];
    }
    return conferenceStartDate;
  };

  const initialCalendarDate = getInitialCalendarDate();

  const calendarEvents = allNormalizedSessions.map((session) => {
    const isLocal = !session.id || !apiSessions.find(s => s.conferenceSessionId === session.id);
    return {
      id: session.id || `temp-${session.title}-${session.date}-${session.startTime}`,
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
    const calendarSession = info.event.extendedProps.session as CalendarSession;
    const isLocal = info.event.extendedProps.isLocal;

    if (isLocal) {
      const index = existingSessions.findIndex((s) =>
        s.title === calendarSession.title &&
        s.date === calendarSession.date &&
        s.startTime === calendarSession.startTime
      );

      if (index !== -1) {
        setEditingSession(existingSessions[index]);
        setEditingIndex(index);
        setShowSessionForm(true);
      }
    } else {
      const originalSession = calendarSession.original as SessionDetailForScheduleResponse;
      setSelectedSession(originalSession);
      setDialogOpen(true);
    }
  };

  const handleCreateSession = () => {
    if (!conferenceId) {
      toast.error("Thiếu Conference ID!");
      return;
    }
    if (!conferenceStartDate || !conferenceEndDate) {
      toast.error("Thiếu thông tin ngày tổ chức hội thảo!");
      return;
    }
    setEditingSession(undefined);
    setEditingIndex(-1);
    setShowSessionForm(true);
  };

  const handleSessionFormSave = (session: Session) => {
    if (editingIndex !== -1) {
      onSessionUpdated(session, editingIndex);
    } else {
      onSessionCreated(session);
    }
    setShowSessionForm(false);
    setEditingSession(undefined);
    setEditingIndex(-1);
  };

  const handleDeleteSession = (index: number) => {
    const session = existingSessions[index];
    if (window.confirm(`Xóa phiên họp "${session.title}"?`)) {
      onSessionDeleted(index);
      toast.success("Đã xóa phiên họp!");
    }
  };

  useEffect(() => {
    if (calendarRef.current && startDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
    }
  }, [startDate]);

  const isLoading = isLoadingSessions;
  const error = sessionsError;

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
      <div className="ml-2 mb-4 flex justify-between items-center">
        <div className="flex gap-4 items-center text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-600"></div>
            <span className="text-gray-600">Phiên đã lưu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-600"></div>
            <span className="text-gray-600">Phiên mới tạo</span>
          </div>
        </div>

        {conferenceId && (
          <button
            onClick={handleCreateSession}
            className="px-4 py-2 mt-4 mr-4 border border-white-700 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo session
          </button>
        )}
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
          `}</style>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridWeek"
            initialDate={initialCalendarDate}
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

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Danh sách phiên họp ({existingSessions.length})
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {existingSessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-3">Chưa có phiên họp nào</p>
                <button
                  onClick={handleCreateSession}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + Tạo phiên họp đầu tiên
                </button>
              </div>
            ) : (
              existingSessions.map((session, index) => {
                const formatTime = (timeStr: string) => {
                  if (timeStr.includes("T")) {
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
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <span className="font-medium">
                        {session.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium ">
                        {new Date(session.date).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                    </div>
                    {session.speaker && session.speaker.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{session.speaker.length} diễn giả</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setEditingSession(session);
                          setEditingIndex(index);
                          setShowSessionForm(true);
                        }}
                        className="flex-1 px-4 py-2 bg-yellow-100 text-gray-700 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteSession(index)}
                        className="flex-1 px-4 py-2 bg-red-100 text-gray-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <SessionDetailDialog
        open={dialogOpen}
        session={selectedSession}
        onClose={() => {
          setDialogOpen(false);
          setSelectedSession(null);
        }}
      />

      {showSessionForm && conferenceId && conferenceStartDate && conferenceEndDate && (
        <CollaboratorSessionForm
          open={showSessionForm}
          conferenceId={conferenceId}
          conferenceStartDate={conferenceStartDate}
          conferenceEndDate={conferenceEndDate}
          existingSessions={existingSessions}
          initialSession={editingSession}
          onSave={handleSessionFormSave}
          onClose={() => {
            setShowSessionForm(false);
            setEditingSession(undefined);
            setEditingIndex(-1);
          }}
        />
      )}
    </div>
  );
};

export default SessionProposalCalendar;
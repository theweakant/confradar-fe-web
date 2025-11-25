// src/components/SessionCalendar.tsx
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { FileText } from "lucide-react";
import { useGetResearchSessionsQuery } from "@/redux/services/conferenceStep.service";
import { useListAcceptedPapersQuery } from "@/redux/services/paper.service";
import type { SessionDetailForScheduleResponse } from "@/types/conference.type";
import type { AcceptedPaper } from "@/types/paper.type";
import PaperCard from "./Paper/PaperCard";
import SessionDetailDialog from "./SessionDetail";

interface SessionCalendarProps {
  conferenceId?: string;
  onPaperSelected?: (paperId: string) => void;
  onSessionSelected?: (session: SessionDetailForScheduleResponse) => void;
  startDate?: string; 
  acceptedPapers?: AcceptedPaper[];
}

const SessionCalendar: React.FC<SessionCalendarProps> = ({
  conferenceId,
  onPaperSelected,
  onSessionSelected,
  startDate,
  acceptedPapers: externalAcceptedPapers,
}) => {
  const [selectedSession, setSelectedSession] = useState<SessionDetailForScheduleResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // 🔹 Fetch sessions
  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useGetResearchSessionsQuery(conferenceId!, {
    skip: !conferenceId,
  });

  // 🔹 Fetch accepted papers
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

  const calendarEvents = sessions.map((session) => ({
    id: session.sessionId,
    title: session.title,
    start: `${session.date}T${session.startTime}`,
    end: `${session.date}T${session.endTime}`,
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
    extendedProps: {
      session,
    },
  }));


  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault(); 
    const session = info.event.extendedProps.session as SessionDetailForScheduleResponse;
    setSelectedSession(session);
    onSessionSelected?.(session);
    setDialogOpen(true);
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
      {/* Legend */}
      <div className="mb-4 flex gap-4 items-center text-xs px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span className="text-gray-600">Phiên đã lên lịch</span>
        </div>
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

        {/* Paper List */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
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
        </div>
      </div>

      {/* Session Detail Dialog */}
      <SessionDetailDialog
        open={dialogOpen}
        session={selectedSession}
        onClose={() => {
          setDialogOpen(false);
          setSelectedSession(null);
        }}
      />
    </div>
  );
};

export default SessionCalendar;
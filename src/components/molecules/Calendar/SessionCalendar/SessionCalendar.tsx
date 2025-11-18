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
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải lịch phiên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu phiên</p>
          <button
            onClick={() => refetchSessions()}
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
            Lịch Phiên Hội Nghị
          </h1>
          <p className="text-gray-400">
            Quản lý và gán bài báo vào các phiên đã lên lịch
          </p>
          {conferenceId && (
            <p className="text-xs text-blue-400 mt-1">Conference ID: {conferenceId}</p>
          )}
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-gray-300">Phiên đã lên lịch</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-xl">
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
                    <span className="text-[10px] text-gray-200">
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
                "hover:shadow-lg",
                "hover:z-10",
                "cursor-pointer",
                "rounded-md",
              ]}
            />
          </div>

          {/* Paper List — Luôn hiển thị */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Bài báo có thể gán ({papersToDisplay.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {papersToDisplay.length === 0 ? (
                <div className="text-gray-500 text-sm py-4 text-center">
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
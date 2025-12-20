"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { useGetPresentSessionQuery } from "@/redux/services/statistics.service";
import { useListAcceptedPapersQuery } from "@/redux/services/paper.service";
import type { AcceptedPaper } from "@/types/paper.type";
import PaperCard from "@/components/molecules/Calendar/SessionCalendar/Paper/PaperCard";
import PresenterSessionDetailDialog from "@/components/molecules/Calendar/SessionCalendar/Modal/PresenterSessionDetail";
import PaperDetailDialog from "@/components/molecules/Calendar/SessionCalendar/Modal/PaperDetailDialog";

interface PresentSessionData {
  sessionId: string;
  title: string;
  onDate: string;
  presenters: Array<{
    presenterName: string;
    paperTitle: string;
  }>;
}

interface PaperAssignmentCalendarProps {
  conferenceId?: string;
  onPaperSelected?: (paperId: string) => void;
  selectedPaperId?: string | null; 
  startDate?: string;
  acceptedPapers?: AcceptedPaper[];
}

const PaperAssignmentCalendar: React.FC<PaperAssignmentCalendarProps> = ({
  conferenceId,
  onPaperSelected,
  selectedPaperId,
  startDate,
  acceptedPapers: externalAcceptedPapers,
}) => {
  const [selectedSession, setSelectedSession] = useState<PresentSessionData | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<AcceptedPaper | null>(null);
  const [paperDetailDialogOpen, setPaperDetailDialogOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useGetPresentSessionQuery(conferenceId!, {
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

  const unassignedPapers = useMemo(() => {
    return papersToDisplay.filter(paper => !paper.isAssignedToSession);
  }, [papersToDisplay]);

  const calendarEvents = sessions.map((session) => ({
    id: session.sessionId,
    title: session.title,
    start: session.onDate,
    allDay: true,
    backgroundColor: session.presenters.length > 0 ? "#3b82f6" : "#9ca3af",
    borderColor: session.presenters.length > 0 ? "#2563eb" : "#6b7280",
    extendedProps: {
      session,
      presenterCount: session.presenters.length,
    },
  }));

  useEffect(() => {
    if (calendarRef.current && sessions.length > 0) {
      const calendarApi = calendarRef.current.getApi();
      
      const sortedSessions = [...sessions]
        .filter((session) => session.onDate)
        .sort((a, b) => {
          return new Date(a.onDate).getTime() - new Date(b.onDate).getTime();
        });
      
      const firstSessionDate = sortedSessions[0]?.onDate;
      
      if (firstSessionDate) {
        calendarApi.gotoDate(firstSessionDate);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (calendarRef.current && startDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
    }
  }, [startDate]);

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    const session = info.event.extendedProps.session as PresentSessionData;
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleSessionDialogClose = () => {
    setSessionDialogOpen(false);
    setSelectedSession(null);
    refetchSessions();
  };

  const handlePaperCardClick = (paper: AcceptedPaper) => {
    setSelectedPaper(paper);
    setPaperDetailDialogOpen(true);
  };

  const handlePaperDetailDialogClose = () => {
    setPaperDetailDialogOpen(false);
    setSelectedPaper(null);
  };

  const handleSelectPaperForAssignment = () => {
    if (selectedPaper) {
      onPaperSelected?.(selectedPaper.paperId);
    }
  };

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
      <div className="mb-4 flex gap-4 items-center text-xs px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span className="text-gray-600">Đã gán presenter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-400"></div>
          <span className="text-gray-600">Chưa gán presenter</span>
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
          `}</style>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridWeek,dayGridMonth",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            displayEventTime={false}
            eventContent={(arg) => {
              const presenterCount = arg.event.extendedProps.presenterCount || 0;

              return (
                <div className="flex flex-col overflow-hidden text-ellipsis p-1">
                  <span className="text-xs font-semibold text-white leading-snug truncate">
                    {arg.event.title}
                  </span>
                  <span className="text-[10px] text-white/80">
                    {presenterCount} presenter{presenterCount !== 1 ? 's' : ''}
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

        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
            Danh sách bài báo chưa gán ({unassignedPapers.length})
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {unassignedPapers.length === 0 ? (
              <div className="text-gray-500 text-sm py-8 text-center">
                <div className="mb-2">✓</div>
                <p className="font-medium">Tất cả bài báo đã được gán</p>
                <p className="text-xs text-gray-400 mt-1">
                  Không còn bài báo nào cần gán vào session
                </p>
              </div>
            ) : (
              unassignedPapers.map((paper) => (
                <PaperCard
                  key={paper.paperId}
                  paper={paper}
                  onClick={() => handlePaperCardClick(paper)}
                  isSelected={selectedPaperId === paper.paperId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <PresenterSessionDetailDialog
        open={sessionDialogOpen}
        session={selectedSession}
        onClose={handleSessionDialogClose}
        onRefetch={refetchSessions}
        selectedPaperId={selectedPaperId}
        conferenceId={conferenceId}
      />

      <PaperDetailDialog
        open={paperDetailDialogOpen}
        paper={selectedPaper}
        onClose={handlePaperDetailDialogClose}
        onSelectPaper={handleSelectPaperForAssignment}
      />
    </div>
  );
};

export default PaperAssignmentCalendar;
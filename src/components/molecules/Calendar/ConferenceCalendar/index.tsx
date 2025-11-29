"use client";

import React, { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { Loader2, Info } from "lucide-react";
import {
  useGetTechnicalConferencesByOrganizerQuery,
  useGetTechnicalConferencesByCollaboratorNoDraftQuery,
  useGetResearchConferencesForOrganizerQuery,
} from "@/redux/services/conference.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import type { ConferenceResponse } from "@/types/conference.type";
import { useAppSelector } from "@/redux/hooks/hooks";

type Conference = ConferenceResponse;

interface ConferenceCalendarProps {
  filterType?: "all" | "technical" | "research";
  categoryId?: string;
  statusId?: string;
}

const hasRole = (roles: string[] | null | undefined, targetRole: string): boolean => {
  return Array.isArray(roles) && roles.includes(targetRole);
};

const ConferenceCalendar: React.FC<ConferenceCalendarProps> = ({
  filterType = "all",
  categoryId,
  statusId,
}) => {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);

  const { user } = useAppSelector((state) => state.auth);
  const isConferenceOrganizer = hasRole(user?.role, "Conference Organizer");
  const isCollaborator = hasRole(user?.role, "Collaborator");

  // API cho Conference Organizer - Technical conferences
  const { 
    data: techOrganizerData, 
    isLoading: techOrganizerLoading, 
    error: techOrganizerError 
  } = useGetTechnicalConferencesByOrganizerQuery(
    {
      page: 1,
      pageSize: 1000,
      ...(statusId && { conferenceStatusId: statusId }),
      ...(categoryId && { conferenceCategoryId: categoryId }),
    },
    {
      skip: !isConferenceOrganizer,
    }
  );

  // API cho Conference Organizer - Research conferences
  const { 
    data: researchData, 
    isLoading: researchLoading, 
    error: researchError 
  } = useGetResearchConferencesForOrganizerQuery(
    {
      page: 1,
      pageSize: 1000,
      ...(statusId && { conferenceStatusId: statusId }),
      ...(categoryId && { conferenceCategoryId: categoryId }),
    },
    {
      skip: !isConferenceOrganizer,
    }
  );

  const { 
    data: techCollaboratorData, 
    isLoading: techCollaboratorLoading, 
    error: techCollaboratorError 
  } = useGetTechnicalConferencesByCollaboratorNoDraftQuery(
    {
      page: 1,
      pageSize: 1000,
      ...(statusId && { conferenceStatusId: statusId }),
      ...(categoryId && { conferenceCategoryId: categoryId }),
    },
    {
      skip: !isCollaborator,
    }
  );

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

  const techOrganizerConferences = techOrganizerData?.data?.items || [];
  const researchConferences = researchData?.data?.items || [];
  const techCollaboratorConferences = techCollaboratorData?.data?.items || [];
  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];
  const cities = citiesData?.data || [];

  const isLoading = techOrganizerLoading || researchLoading || techCollaboratorLoading;
  const error = techOrganizerError || researchError || techCollaboratorError;

  const allConferences = useMemo(() => {
    let conferences: Conference[] = [];

    // Lấy conferences dựa trên role
    if (isConferenceOrganizer) {
      conferences = [...techOrganizerConferences, ...researchConferences];
    } else if (isCollaborator) {
      conferences = [...techCollaboratorConferences];
    }

    // Áp dụng filter theo loại conference
    if (filterType !== "all") {
      conferences = conferences.filter((conf) =>
        filterType === "research" ? conf.isResearchConference : !conf.isResearchConference
      );
    }

    // Áp dụng filter theo category
    if (categoryId) {
      conferences = conferences.filter((conf) => conf.conferenceCategoryId === categoryId);
    }

    // Áp dụng filter theo status
    if (statusId) {
      conferences = conferences.filter((conf) => conf.conferenceStatusId === statusId);
    }

    return conferences;
  }, [
    techOrganizerConferences,
    researchConferences,
    techCollaboratorConferences,
    isConferenceOrganizer,
    isCollaborator,
    filterType,
    categoryId,
    statusId,
  ]);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.conferenceCategoryId === categoryId)?.conferenceCategoryName || categoryId;

  const getStatusName = (statusId: string) =>
    statuses.find((s) => s.conferenceStatusId === statusId)?.conferenceStatusName || statusId;

  const getCityName = (cityId: string) =>
    cities.find((c) => c.cityId === cityId)?.cityName || cityId;

  const calendarEvents = useMemo(
    () =>
      allConferences.map((conf) => ({
        id: conf.conferenceId,
        title: conf.conferenceName || "N/A",
        start: conf.startDate || new Date().toISOString(),
        end: conf.endDate
          ? new Date(new Date(conf.endDate).getTime() + 86400000).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        backgroundColor: conf.isResearchConference ? "#A865B5" : "#4682B4",
        borderColor: conf.isResearchConference ? "#8B4A9E" : "#3A6F99",
        extendedProps: {
          conference: conf,
        },
      })),
    [allConferences]
  );

  const handleEventClick = (info: EventClickArg) => {
    const conference = info.event.extendedProps.conference as Conference;
    const conferenceId = conference.conferenceId;

    if (isConferenceOrganizer) {
      router.push(`/workspace/organizer/manage-conference/view-detail/${conferenceId}`);
    } else if (isCollaborator) {
      router.push(`/workspace/collaborator/manage-conference/view-detail/${conferenceId}`);
    } else {
      router.push(`/conference/${conferenceId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Đang tải lịch hội thảo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-gray-600 mb-6">Đã xảy ra lỗi khi tải danh sách</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch trình</h1>
        <p className="text-gray-600">
          {isConferenceOrganizer
            ? "Xem lịch trình các hội thảo công nghệ và nghiên cứu"
            : "Xem lịch trình các hội thảo công nghệ"}
        </p>
      </div>

      <div className="mb-4 flex gap-6 items-center text-sm px-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-300"></div>
          <span className="text-gray-700">Hội thảo Công nghệ</span>
        </div>
        {isConferenceOrganizer && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-300"></div>
            <span className="text-gray-700">Hội nghị Nghiên cứu</span>
          </div>
        )}
        <div className="ml-auto text-gray-600">
          Tổng: <span className="font-semibold">{allConferences.length}</span>S
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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
            padding: 0.5rem 1rem;
            text-transform: capitalize;
            font-weight: 500;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
          }
          .fc .fc-col-header-cell {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 0.75rem;
            text-transform: uppercase;
            padding: 0.75rem 0;
            border-bottom: 2px solid #e5e7eb;
          }
          .fc .fc-daygrid-day-number {
            color: #374151;
            font-size: 0.875rem;
            padding: 0.5rem;
            font-weight: 500;
          }
          .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .fc-event {
            cursor: pointer;
            border-radius: 0.375rem;
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.25rem;
          }
          .fc-event:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .fc .fc-daygrid-event {
            white-space: normal;
          }
        `}</style>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          locale="vi"
          buttonText={{
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
          }}
          eventContent={(arg) => (
            <div className="text-xs font-medium text-white leading-tight p-1">
              <div className="truncate">{arg.event.title}</div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ConferenceCalendar;
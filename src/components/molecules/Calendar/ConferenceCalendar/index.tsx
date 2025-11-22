import React, { useState, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { Calendar, MapPin, Users, Ticket, X, Loader2 } from "lucide-react";

// ==================== TYPE DEFINITIONS ====================

interface ConferenceBase {
  conferenceId: string;
  conferenceName: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSlot: number;
  availableSlot: number;
  address: string;
  bannerImageUrl: string;
  createdAt: string;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  isInternalHosted: boolean;
  isResearchConference: boolean;
  cityId: string;
  conferenceCategoryId: string;
  conferenceStatusId: string;
  createdBy: string;
}

interface TechnicalConference extends ConferenceBase {
  targetAudience: string;
  contractURL: string | null;
  commission: number | null;
}

interface ResearchConference extends ConferenceBase {
  name: string | null;
  paperFormat: string | null;
  numberPaperAccept: number | null;
  revisionAttemptAllowed: number | null;
  rankingDescription: string | null;
  allowListener: boolean | null;
  rankValue: string | null;
  rankYear: number | null;
  reviewFee: number | null;
  rankingCategoryId: string | null;
  rankingCategoryName: string | null;
}

type Conference = TechnicalConference | ResearchConference;

interface ConferenceListResponse {
  success: boolean;
  message: string;
  data: {
    items: Conference[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  errors: Record<string, unknown>;
}

interface ConferenceCalendarProps {
  // Có thể thêm props để filter
  filterType?: "all" | "technical" | "research";
  categoryId?: string;
  statusId?: string;
}

// ==================== MAIN COMPONENT ====================

const ConferenceCalendar: React.FC<ConferenceCalendarProps> = ({
  filterType = "all",
  categoryId,
  statusId,
}) => {
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // ==================== API CALLS ====================
  // TODO: Replace with actual RTK Query hooks
  // const { data: techData, isLoading: techLoading } = useGetTechnicalConferencesQuery();
  // const { data: researchData, isLoading: researchLoading } = useGetResearchConferencesQuery();
  
  const isLoading = false; // Mock loading state
  
  // Mock data - Replace with actual API data
  const mockConferences: Conference[] = [
    {
      conferenceId: "9117fd4d-5b00-40ea-8139-93741f3e78f8",
      conferenceName: "[21/11] TEST UPDATE CALENDAR",
      description: "[21/11] TEST UPDATE CALENDAR",
      startDate: "2026-05-02",
      endDate: "2026-05-06",
      totalSlot: 20,
      availableSlot: 20,
      address: "Trung tâm Hội nghị Quốc tế (ICC), Hà Nội",
      bannerImageUrl: "https://minio-api.confradar.io.vn/conferencebanner/jGfugpZqw_JWSy1bmfNlINO2TCxy-jiUJvXjd06jHyA.png",
      createdAt: "2026-03-09T17:30:00",
      ticketSaleStart: "2025-11-22",
      ticketSaleEnd: "2025-11-28",
      isInternalHosted: true,
      isResearchConference: false,
      cityId: "HCM",
      conferenceCategoryId: "7e889868-e0f2-4ed9-b751-9e2a41c71200",
      conferenceStatusId: "4993c2d6-357d-4dae-813b-53ed201861ef",
      createdBy: "aa6b55db-cbea-40d9-9c9a-4bf62f23d387",
      targetAudience: "Học sinh",
      contractURL: null,
      commission: null,
    },
    {
      conferenceId: "98d75ac3-9271-4dde-8c3b-052a63f5bb72",
      conferenceName: "ICRISE 2025",
      description: "Hội nghị quốc tế về Nghiên cứu & Đổi mới trong Khoa học Kỹ thuật.",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
      totalSlot: 50,
      availableSlot: 49,
      address: "Trung tâm Hội nghị Quốc tế (ICC), Hà Nội",
      bannerImageUrl: "https://minio-api.confradar.io.vn/conferencebanner/yoz35r0A60jIEcNyCEcGXj3Q-k26kEShCDbAFgBHMh4.png",
      createdAt: "2026-01-15T17:30:00",
      ticketSaleStart: "2026-07-17",
      ticketSaleEnd: "2026-07-27",
      isInternalHosted: true,
      isResearchConference: true,
      cityId: "HN",
      conferenceCategoryId: "13035260-4729-4aa7-ad67-c7dcdeff041e",
      conferenceStatusId: "d593a591-3072-4323-8283-ab084a01b59d",
      createdBy: "aa6b55db-cbea-40d9-9c9a-4bf62f23d387",
      name: "ICRISE Main Track",
      paperFormat: "ieee",
      numberPaperAccept: 30,
      revisionAttemptAllowed: 1,
      rankingDescription: "Indexed by Scopus, IEEE Xplore.",
      allowListener: false,
      rankValue: "1.04",
      rankYear: 2023,
      reviewFee: 150000,
      rankingCategoryId: "394aedfe-015f-46e1-b8f1-54c78cf98c68",
      rankingCategoryName: "CiteScore",
    },
    {
      conferenceId: "848570ae-be82-450a-aa51-2fc050905e3c",
      conferenceName: "Test Room Calendar",
      description: "Test Room Calendar",
      startDate: "2026-01-16",
      endDate: "2026-01-21",
      totalSlot: 3,
      availableSlot: 3,
      address: "Trung tâm Hội nghị Quốc gia, Quận 1",
      bannerImageUrl: "https://minio-api.confradar.io.vn/conferencebanner/zgbS85x-KDl5HYVM7OZ1OzXgWOtlD0UNdMzMvKYH3eg.png",
      createdAt: "2026-01-15T17:30:00",
      ticketSaleStart: "2025-12-16",
      ticketSaleEnd: "2025-12-20",
      isInternalHosted: false,
      isResearchConference: false,
      cityId: "BTH",
      conferenceCategoryId: "037bb175-4dad-42c1-a6b6-42876cb44bd2",
      conferenceStatusId: "9759fa56-0306-4434-afc4-959da121fd6d",
      createdBy: "aa6b55db-cbea-40d9-9c9a-4bf62f23d387",
      targetAudience: "Học sinh",
      contractURL: "https://minio-api.confradar.io.vn/contract/DNsdJKZ7wnpGf6O7C5b970w0kd9fJrep1OWjvhvMMSs.docx",
      commission: 20,
    },
  ];

  // ==================== FILTERED DATA ====================
  const filteredConferences = useMemo(() => {
    let filtered = mockConferences;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((conf) =>
        filterType === "research"
          ? conf.isResearchConference
          : !conf.isResearchConference
      );
    }

    // Filter by category
    if (categoryId) {
      filtered = filtered.filter((conf) => conf.conferenceCategoryId === categoryId);
    }

    // Filter by status
    if (statusId) {
      filtered = filtered.filter((conf) => conf.conferenceStatusId === statusId);
    }

    return filtered;
  }, [filterType, categoryId, statusId]);

  // ==================== CALENDAR EVENTS ====================
  const calendarEvents = useMemo(
    () =>
      filteredConferences.map((conf) => ({
        id: conf.conferenceId,
        title: conf.conferenceName,
        start: conf.startDate,
        end: new Date(new Date(conf.endDate).getTime() + 86400000)
          .toISOString()
          .split("T")[0], // +1 day for inclusive end
        backgroundColor: conf.isResearchConference ? "#8b5cf6" : "#3b82f6",
        borderColor: conf.isResearchConference ? "#7c3aed" : "#2563eb",
        extendedProps: {
          conference: conf,
        },
      })),
    [filteredConferences]
  );

  // ==================== EVENT HANDLERS ====================
  const handleEventClick = (info: EventClickArg) => {
    const conference = info.event.extendedProps.conference as Conference;
    setSelectedConference(conference);
    setDialogOpen(true);
  };

  // ==================== UTILITY FUNCTIONS ====================
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAvailabilityColor = (available: number, total: number): string => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "text-green-600 bg-green-50";
    if (percentage > 20) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const isTechnicalConference = (conf: Conference): conf is TechnicalConference => {
    return !conf.isResearchConference;
  };

  const isResearchConference = (conf: Conference): conf is ResearchConference => {
    return conf.isResearchConference;
  };

  // ==================== LOADING STATE ====================
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

  // ==================== RENDER ====================
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Hội thảo</h1>
        <p className="text-gray-600">Xem lịch trình các hội thảo sắp diễn ra</p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex gap-6 items-center text-sm px-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span className="text-gray-700">Hội thảo Kỹ thuật</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-600"></div>
          <span className="text-gray-700">Hội thảo Nghiên cứu</span>
        </div>
        <div className="ml-auto text-gray-600">
          Tổng: <span className="font-semibold">{filteredConferences.length}</span> hội thảo
        </div>
      </div>

      {/* Calendar */}
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
          eventContent={(arg) => {
            return (
              <div className="text-xs font-medium text-white leading-tight p-1">
                <div className="truncate">{arg.event.title}</div>
              </div>
            );
          }}
        />
      </div>

      {/* Detail Modal */}
      {dialogOpen && selectedConference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header with Banner */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
              {selectedConference.bannerImageUrl && (
                <img
                  src={selectedConference.bannerImageUrl}
                  alt={selectedConference.conferenceName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <button
                onClick={() => setDialogOpen(false)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Title */}
              <div className="mb-6">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 bg-blue-100 text-blue-700">
                  {selectedConference.isResearchConference
                    ? "Hội thảo Nghiên cứu"
                    : "Hội thảo Kỹ thuật"}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedConference.conferenceName}
                </h2>
                {selectedConference.description && (
                  <p className="mt-2 text-gray-600 text-sm">
                    {selectedConference.description}
                  </p>
                )}
              </div>

              {/* Info Grid */}
              <div className="space-y-4">
                {/* Dates */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Thời gian diễn ra
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {formatDate(selectedConference.startDate)} -{" "}
                      {formatDate(selectedConference.endDate)}
                    </div>
                  </div>
                </div>

                {/* Ticket Sale */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Ticket className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">Bán vé</div>
                    <div className="text-base text-gray-900">
                      {formatDate(selectedConference.ticketSaleStart)} -{" "}
                      {formatDate(selectedConference.ticketSaleEnd)}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">Địa điểm</div>
                    <div className="text-base text-gray-900">
                      {selectedConference.address}
                    </div>
                  </div>
                </div>

                {/* Slots */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Số lượng chỗ
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {selectedConference.availableSlot}
                        </span>
                        <span className="text-gray-500 ml-1">
                          / {selectedConference.totalSlot}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityColor(
                          selectedConference.availableSlot,
                          selectedConference.totalSlot
                        )}`}
                      >
                        {Math.round(
                          (selectedConference.availableSlot /
                            selectedConference.totalSlot) *
                            100
                        )}
                        % còn trống
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (selectedConference.availableSlot /
                              selectedConference.totalSlot) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Additional Info for Research Conference */}
                {isResearchConference(selectedConference) &&
                  selectedConference.rankingCategoryName && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-sm font-medium text-purple-900 mb-2">
                        Thông tin nghiên cứu
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Ranking:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {selectedConference.rankingCategoryName} {selectedConference.rankValue}
                          </span>
                        </div>
                        {selectedConference.numberPaperAccept && (
                          <div>
                            <span className="text-gray-600">Papers:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {selectedConference.numberPaperAccept}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Additional Info for Technical Conference */}
                {isTechnicalConference(selectedConference) &&
                  selectedConference.targetAudience && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        Đối tượng tham gia
                      </div>
                      <div className="text-base font-semibold text-blue-700">
                        {selectedConference.targetAudience}
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Navigate to detail page
                    window.location.href = `/conference/${selectedConference.conferenceId}`;
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceCalendar;
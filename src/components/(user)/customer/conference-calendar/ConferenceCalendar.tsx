import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';

// TypeScript interfaces
interface ConferenceDetailForScheduleResponse {
    conferenceId: string;
    conferenceName?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    totalSlot?: number;
    availableSlot?: number;
    address?: string;
    bannerImageUrl?: string;
    createdAt?: string;
    ticketSaleStart?: string;
    ticketSaleEnd?: string;
    isInternalHosted?: boolean;
    isResearchConference?: boolean;
    cityId?: string;
    cityName?: string;
    conferenceCategoryId?: string;
    conferenceCategoryName?: string;
    conferenceStatusId?: string;
    conferenceStatusName?: string;
    sessions: SessionDetailForScheduleResponse[];
}

interface SessionDetailForScheduleResponse {
    conferenceSessionId: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    sessionDate?: string;
    conferenceId?: string;
    roomId?: string;
    roomNumber?: string;
    roomDisplayName?: string;
    destinationId?: string;
    destinationName?: string;
    destinationDistrict?: string;
    destinationStreet?: string;
    cityId?: string;
    cityName?: string;
}

// Mock data với camelCase
const mockConferences: ConferenceDetailForScheduleResponse[] = [
    {
        conferenceId: "conf-001",
        conferenceName: "AI & Machine Learning Summit 2025",
        description: "Khám phá những xu hướng mới nhất trong AI và Machine Learning",
        startDate: "2025-11-10",
        endDate: "2025-11-12",
        totalSlot: 500,
        availableSlot: 120,
        address: "SECC, Quận 7",
        bannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        ticketSaleStart: "2025-10-01",
        ticketSaleEnd: "2025-11-09",
        isInternalHosted: true,
        isResearchConference: true,
        cityName: "Hồ Chí Minh",
        conferenceCategoryName: "Technology",
        conferenceStatusName: "Upcoming",
        sessions: [
            {
                conferenceSessionId: "sess-001",
                title: "Keynote: Future of AI",
                description: "Opening keynote về tương lai của AI",
                startTime: "2025-11-10T09:00:00",
                endTime: "2025-11-10T10:30:00",
                sessionDate: "2025-11-10",
                roomDisplayName: "Main Hall A",
                destinationName: "SECC"
            },
            {
                conferenceSessionId: "sess-002",
                title: "Deep Learning Workshop",
                startTime: "2025-11-10T14:00:00",
                endTime: "2025-11-10T17:00:00",
                sessionDate: "2025-11-10",
                roomDisplayName: "Room 201"
            }
        ]
    },
    {
        conferenceId: "conf-002",
        conferenceName: "Vietnam Blockchain Conference",
        description: "Hội nghị về công nghệ Blockchain và Web3",
        startDate: "2025-11-18",
        endDate: "2025-11-19",
        totalSlot: 300,
        availableSlot: 85,
        address: "Gem Center, Quận 1",
        bannerImageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
        ticketSaleStart: "2025-10-15",
        ticketSaleEnd: "2025-11-17",
        isInternalHosted: false,
        isResearchConference: false,
        cityName: "Hồ Chí Minh",
        conferenceCategoryName: "Blockchain",
        conferenceStatusName: "Upcoming",
        sessions: [
            {
                conferenceSessionId: "sess-003",
                title: "Web3 Development",
                startTime: "2025-11-18T10:00:00",
                endTime: "2025-11-18T12:00:00",
                sessionDate: "2025-11-18",
                roomDisplayName: "Hall B"
            }
        ]
    },
    {
        conferenceId: "conf-003",
        conferenceName: "DevOps Vietnam 2025",
        description: "Hội thảo về DevOps, Cloud và Infrastructure",
        startDate: "2025-11-25",
        endDate: "2025-11-26",
        totalSlot: 400,
        availableSlot: 200,
        address: "Bitexco, Quận 1",
        bannerImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
        ticketSaleStart: "2025-10-20",
        ticketSaleEnd: "2025-11-24",
        isInternalHosted: true,
        isResearchConference: false,
        cityName: "Hồ Chí Minh",
        conferenceCategoryName: "DevOps",
        conferenceStatusName: "Upcoming",
        sessions: [
            {
                conferenceSessionId: "sess-004",
                title: "Kubernetes Best Practices",
                startTime: "2025-11-25T09:00:00",
                endTime: "2025-11-25T11:00:00",
                sessionDate: "2025-11-25",
                roomDisplayName: "Tech Hall"
            }
        ]
    },
    {
        conferenceId: "conf-004",
        conferenceName: "UX/UI Design Conference",
        description: "Hội nghị thiết kế trải nghiệm người dùng",
        startDate: "2025-12-05",
        endDate: "2025-12-06",
        totalSlot: 250,
        availableSlot: 50,
        address: "Saigon Exhibition Center",
        bannerImageUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400",
        ticketSaleStart: "2025-11-01",
        ticketSaleEnd: "2025-12-04",
        isInternalHosted: false,
        isResearchConference: false,
        cityName: "Hồ Chí Minh",
        conferenceCategoryName: "Design",
        conferenceStatusName: "Upcoming",
        sessions: []
    }
];

const ConferenceCalendar: React.FC = () => {
    const [conferences, setConferences] = useState<ConferenceDetailForScheduleResponse[]>(mockConferences);
    const [selectedConference, setSelectedConference] = useState<string | null>(null);
    const calendarRef = useRef<any>(null);

    const calendarEvents = conferences.flatMap(conf => [
        {
            id: conf.conferenceId,
            title: conf.conferenceName || 'Untitled Conference',
            start: conf.startDate,
            end: conf.endDate,
            backgroundColor: getCategoryColor(conf.conferenceCategoryName),
            borderColor: getCategoryColor(conf.conferenceCategoryName),
            extendedProps: {
                conference: conf
            }
        },
        ...conf.sessions.map(session => ({
            id: session.conferenceSessionId,
            title: session.title || 'Untitled Session',
            start: session.startTime,
            end: session.endTime,
            backgroundColor: getCategoryColor(conf.conferenceCategoryName, true),
            borderColor: getCategoryColor(conf.conferenceCategoryName),
            display: 'block',
            extendedProps: {
                session: session,
                conference: conf
            }
        }))
    ]);

    function getCategoryColor(category?: string, isSession: boolean = false): string {
        const colors: Record<string, string> = {
            'Technology': isSession ? '#3b82f6' : '#2563eb',
            'Blockchain': isSession ? '#8b5cf6' : '#7c3aed',
            'DevOps': isSession ? '#06b6d4' : '#0891b2',
            'Design': isSession ? '#ec4899' : '#db2777'
        };
        return colors[category || ''] || (isSession ? '#64748b' : '#475569');
    }

    const handleConferenceClick = (conf: ConferenceDetailForScheduleResponse) => {
        setSelectedConference(conf.conferenceId);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi && conf.startDate) {
            calendarApi.gotoDate(conf.startDate);
        }
    };

    const handleEventClick = (info: any) => {
        const conf = info.event.extendedProps.conference;
        setSelectedConference(conf.conferenceId);
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Lịch Hội nghị & Hội thảo</h1>
                    <p className="text-gray-400">Theo dõi và quản lý các sự kiện sắp tới</p>
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
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={calendarEvents}
                                eventClick={handleEventClick}
                                height="auto"
                                eventDisplay="block"
                                displayEventTime={true}
                                eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }}
                            />
                        </div>
                    </div>

                    {/* Conference List Section */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            Danh sách Hội nghị
                        </h2>
                        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                            {conferences.map((conf) => (
                                <div
                                    key={conf.conferenceId}
                                    onClick={() => handleConferenceClick(conf)}
                                    className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-600 hover:shadow-lg ${selectedConference === conf.conferenceId ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                >
                                    {conf.bannerImageUrl && (
                                        <img
                                            src={conf.bannerImageUrl}
                                            alt={conf.conferenceName || 'Conference'}
                                            className="w-full h-32 object-cover rounded-md mb-3"
                                        />
                                    )}

                                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                                        {conf.conferenceName || 'Untitled Conference'}
                                    </h3>

                                    {conf.description && (
                                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                            {conf.description}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                            <span>{formatDate(conf.startDate)} - {formatDate(conf.endDate)}</span>
                                        </div>

                                        {conf.address && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <MapPin className="w-4 h-4 text-green-400" />
                                                <span className="line-clamp-1">{conf.address}</span>
                                            </div>
                                        )}

                                        {conf.totalSlot !== undefined && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Users className="w-4 h-4 text-purple-400" />
                                                <span>{conf.availableSlot}/{conf.totalSlot} slots</span>
                                            </div>
                                        )}

                                        {conf.conferenceCategoryName && (
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-pink-400" />
                                                <span
                                                    className="text-xs px-2 py-1 rounded-full"
                                                    style={{
                                                        backgroundColor: getCategoryColor(conf.conferenceCategoryName) + '30',
                                                        color: getCategoryColor(conf.conferenceCategoryName)
                                                    }}
                                                >
                                                    {conf.conferenceCategoryName}
                                                </span>
                                            </div>
                                        )}

                                        {conf.sessions.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-2">
                                                {conf.sessions.length} phiên họp
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .fc {
          background: transparent;
          color: #f3f4f6;
        }
        .fc .fc-button {
          background-color: #374151;
          border-color: #4b5563;
          color: #f3f4f6;
          text-transform: capitalize;
        }
        .fc .fc-button:hover {
          background-color: #4b5563;
          border-color: #6b7280;
        }
        .fc .fc-button:disabled {
          background-color: #1f2937;
          border-color: #374151;
          opacity: 0.6;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #3b82f6;
          border-color: #2563eb;
        }
        .fc-theme-standard .fc-scrollgrid {
          border-color: #374151;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #374151;
        }
        .fc .fc-col-header-cell {
          background-color: #1f2937;
          color: #9ca3af;
          font-weight: 600;
        }
        .fc .fc-daygrid-day {
          background-color: #111827;
        }
        .fc .fc-daygrid-day:hover {
          background-color: #1f2937;
        }
        .fc .fc-daygrid-day-number {
          color: #d1d5db;
        }
        .fc .fc-day-today {
          background-color: #1e3a5f !important;
        }
        .fc .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          margin-bottom: 2px;
        }
        .fc .fc-event-title {
          font-size: 0.75rem;
          font-weight: 500;
        }
        .fc .fc-timegrid-slot {
          height: 3em;
        }
        .fc .fc-timegrid-slot-label {
          color: #9ca3af;
        }
        .fc-direction-ltr .fc-daygrid-event {
          margin-left: 2px;
          margin-right: 2px;
        }
        .fc .fc-toolbar-title {
          color: #f3f4f6;
          font-size: 1.5rem;
        }
        .fc .fc-daygrid-day-top {
          justify-content: center;
        }
      `}</style>
        </div>
    );
};

export default ConferenceCalendar;
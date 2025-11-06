import React, { useState, useRef, Fragment } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from "@fullcalendar/core";
import type { Calendar as FullCalendarInstance } from '@fullcalendar/core';
import { Calendar, Clock, MapPin, Users, Tag, X, Eye } from 'lucide-react';
import { useConference } from '@/redux/hooks/conference/useConference';
import type { ConferenceDetailForScheduleResponse, SessionDetailForScheduleResponse } from '@/types/conference.type';
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
// } from '@/components/ui/dialog';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";


const ConferenceCalendar: React.FC = () => {
    const [selectedConference, setSelectedConference] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedConferenceForDialog, setSelectedConferenceForDialog] = useState<ConferenceDetailForScheduleResponse | null>(null);
    // const calendarRef = useRef<any>(null);
    const calendarRef = useRef<FullCalendar | null>(null);
    const conferenceListRef = useRef<HTMLDivElement>(null);

    // API call to get conferences using useConference hook
    const {
        ownConferencesForSchedule: conferences,
        ownConferencesForScheduleLoading: isLoading,
        ownConferencesForScheduleError: error
    } = useConference();

    const calendarEvents = (conferences || []).flatMap(conf => [
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

    const handleViewSessions = (conf: ConferenceDetailForScheduleResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedConferenceForDialog(conf);
        setDialogOpen(true);
    };

    const handleSessionClick = (session: SessionDetailForScheduleResponse) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi && session.startTime) {
            // Close the dialog first
            setDialogOpen(false);

            // Navigate to the session date and time
            const sessionDate = new Date(session.startTime);
            calendarApi.gotoDate(sessionDate);

            // Switch to day view to show the session clearly
            calendarApi.changeView('timeGridDay', sessionDate);

            // Optional: Scroll to the session time
            setTimeout(() => {
                const sessionElement = document.querySelector(`[data-event-id="${session.conferenceSessionId}"]`);
                if (sessionElement) {
                    sessionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    };

    const handleEventClick = (info: EventClickArg) => {
        const conf = info.event.extendedProps.conference;
        setSelectedConference(conf.conferenceId);

        // Scroll to the selected conference card in the list
        const conferenceElement = document.getElementById(`conference-${conf.conferenceId}`);
        if (conferenceElement && conferenceListRef.current) {
            conferenceElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
                                eventClassNames={() => [
                                    'transition-all',
                                    'duration-200',
                                    'ease-in-out',
                                    'hover:scale-105',
                                    'hover:shadow-lg',
                                    'hover:z-10',
                                    'hover:bg-blue-600',
                                    'hover:text-white',
                                    'cursor-pointer',
                                    'rounded-md',
                                    'px-1',
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
                            // className="space-y-4 overflow-y-auto max-h-[600px] pr-2"
                            className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"

                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#4b5563 #1f2937',
                                WebkitScrollbarWidth: 'thin',
                            } as React.CSSProperties & { WebkitScrollbarWidth?: string }}
                        >
                            {(conferences || []).map((conf) => (
                                <div
                                    key={conf.conferenceId}
                                    id={`conference-${conf.conferenceId}`}
                                    onClick={() => handleConferenceClick(conf)}
                                    className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-600 hover:shadow-lg border-2 ${selectedConference === conf.conferenceId ? 'border-blue-500 bg-gray-600' : 'border-transparent'
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
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                                                <div className="text-xs text-gray-400">
                                                    {conf.sessions.length} phiên họp
                                                </div>
                                                <button
                                                    onClick={(e) => handleViewSessions(conf, e)}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Transition appear show={dialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(false)}>
                    {/* Backdrop */}
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </TransitionChild>

                    {/* Dialog Container */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                                    {/* Header */}
                                    <div className="mb-4">
                                        <DialogTitle className="text-xl font-bold text-white mb-2">
                                            {selectedConferenceForDialog?.conferenceName || 'Chi tiết phiên họp'}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-400">
                                            Danh sách các phiên họp trong hội nghị. Click vào phiên họp để xem trên lịch.
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-4">
                                        {selectedConferenceForDialog?.sessions && selectedConferenceForDialog.sessions.length > 0 ? (
                                            <div className="space-y-3 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
                                                {selectedConferenceForDialog.sessions.map((session) => (
                                                    <div
                                                        key={session.conferenceSessionId}
                                                        onClick={() => handleSessionClick(session)}
                                                        className="bg-gray-700 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-600 hover:border-blue-500 transition-all duration-200 group"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                                {session.title || 'Untitled Session'}
                                                            </h4>
                                                            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                        </div>

                                                        {session.description && (
                                                            <p className="text-sm text-gray-300 mb-3">
                                                                {session.description}
                                                            </p>
                                                        )}

                                                        <div className="space-y-2 text-sm">
                                                            {session.startTime && session.endTime && (
                                                                <div className="flex items-center gap-2 text-gray-300">
                                                                    <Clock className="w-4 h-4 text-blue-400" />
                                                                    <span>
                                                                        {new Date(session.startTime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })} - {new Date(session.endTime).toLocaleTimeString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {session.roomDisplayName && (
                                                                <div className="flex items-center gap-2 text-gray-300">
                                                                    <MapPin className="w-4 h-4 text-green-400" />
                                                                    <span>{session.roomDisplayName}</span>
                                                                    {session.destinationName && (
                                                                        <span className="text-gray-400">
                                                                            - {session.destinationName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400">
                                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>Chưa có phiên họp nào được lên lịch</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Close Button */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                            onClick={() => setDialogOpen(false)}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                    className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4"
                // className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl max-h-[80vh] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300"
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">
                            {selectedConferenceForDialog?.conferenceName || 'Chi tiết phiên họp'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Danh sách các phiên họp trong hội nghị. Click vào phiên họp để xem trên lịch.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        {selectedConferenceForDialog?.sessions && selectedConferenceForDialog.sessions.length > 0 ? (
                            <div
                                // className="space-y-3 overflow-y-auto max-h-96 pr-2"
                                className="space-y-3 overflow-y-auto max-h-96 pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"

                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#4b5563 #1f2937',
                                    WebkitScrollbarWidth: 'thin',
                                } as React.CSSProperties & { WebkitScrollbarWidth?: string }}
                            >
                                {selectedConferenceForDialog.sessions.map((session) => (
                                    <div
                                        key={session.conferenceSessionId}
                                        onClick={() => handleSessionClick(session)}
                                        className="bg-gray-700 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-600 hover:border-blue-500 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                {session.title || 'Untitled Session'}
                                            </h4>
                                            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                        </div>

                                        {session.description && (
                                            <p className="text-sm text-gray-300 mb-3">
                                                {session.description}
                                            </p>
                                        )}

                                        <div className="space-y-2 text-sm">
                                            {session.startTime && session.endTime && (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4 text-blue-400" />
                                                    <span>
                                                        {new Date(session.startTime).toLocaleString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })} - {new Date(session.endTime).toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}

                                            {session.roomDisplayName && (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <MapPin className="w-4 h-4 text-green-400" />
                                                    <span>{session.roomDisplayName}</span>
                                                    {session.destinationName && (
                                                        <span className="text-gray-400">
                                                            - {session.destinationName}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Chưa có phiên họp nào được lên lịch</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog> */}

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
                .calendar-container .fc .fc-button-primary:not(:disabled).fc-button-active {
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
            `}</style>
        </div>
    );
};

export default ConferenceCalendar;
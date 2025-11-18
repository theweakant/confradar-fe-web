import React, { useState } from "react";
import { Clock, MapPin, Users, Tag, Eye } from "lucide-react";
import {
    ConferenceDetailForScheduleResponse,
    SessionDetailForScheduleResponse,
} from "@/types/conference.type";
import SessionsListDialog from "./SessionsListDialog";
import SessionDetailDialog from "./SessionDetailDialog";

interface ConferenceCardProps {
    conf: ConferenceDetailForScheduleResponse;
    selectedConference?: string | null;
    onConferenceClick: (conf: ConferenceDetailForScheduleResponse) => void;
    onSessionNavigate?: (session: SessionDetailForScheduleResponse) => void;
}

const ConferenceCard: React.FC<ConferenceCardProps> = ({
    conf,
    selectedConference,
    onConferenceClick,
    onSessionNavigate,
}) => {
    const [sessionsListOpen, setSessionsListOpen] = useState(false);
    const [sessionDetailOpen, setSessionDetailOpen] = useState(false);
    const [selectedSession, setSelectedSession] =
        useState<SessionDetailForScheduleResponse | null>(null);
    const [internalSession, setInternalSession] = useState<SessionDetailForScheduleResponse | null>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleViewSessions = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionsListOpen(true);
    };

    const handleSessionSelect = (session: SessionDetailForScheduleResponse) => {
        setSelectedSession(session);
        setInternalSession(session);
        setSessionDetailOpen(true);
        // Navigate calendar to session
        if (onSessionNavigate) {
            onSessionNavigate(session);
        }
    };

    const handleBackToList = () => {
        // setSessionDetailOpen(false);
        // setSessionsListOpen(true);
        setSessionDetailOpen(false);
        setSelectedSession(null);
        setTimeout(() => {
            setSessionsListOpen(true);
        }, 200);
    };

    const handleCloseAll = () => {
        setSessionDetailOpen(false);
        setTimeout(() => {
            setSelectedSession(null);
            setInternalSession(null);
            setSessionsListOpen(false);
        }, 200);
        // setSessionsListOpen(false);
        // setSelectedSession(null);
    };

    return (
        <>
            <div
                id={`conference-${conf.conferenceId}`}
                onClick={() => onConferenceClick(conf)}
                className={`relative bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-600 hover:shadow-lg border-2 ${selectedConference === conf.conferenceId
                    ? "border-blue-500 bg-gray-600"
                    : "border-transparent"
                    }`}
            >
                {conf.bannerImageUrl && (
                    <img
                        src={conf.bannerImageUrl}
                        alt={conf.conferenceName || "Conference"}
                        className="w-full h-32 object-cover rounded-md mb-3"
                    />
                )}

                <h3 className="font-semibold text-white mb-2 line-clamp-2">
                    {conf.conferenceName || "Untitled Conference"}
                </h3>

                {conf.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {conf.description}
                    </p>
                )}

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>
                            {formatDate(conf.startDate)} - {formatDate(conf.endDate)}
                        </span>
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
                            <span>
                                {conf.availableSlot}/{conf.totalSlot} slots
                            </span>
                        </div>
                    )}

                    {conf.conferenceCategoryName && (
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-pink-400" />
                            <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white">
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
                                onClick={handleViewSessions}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                            >
                                <Eye className="w-3 h-3" /> Xem chi tiết
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sessions List Dialog */}
            <SessionsListDialog
                open={sessionsListOpen}
                conference={conf}
                onClose={handleCloseAll}
                onSessionSelect={handleSessionSelect}
            />

            {/* Session Detail Dialog with Back Button */}
            <SessionDetailDialog
                open={sessionDetailOpen}
                session={internalSession}
                sessionForChange={conf?.sessions || []}
                onClose={handleCloseAll}
                onBack={handleBackToList}
            />
        </>
    );
};

export default ConferenceCard;
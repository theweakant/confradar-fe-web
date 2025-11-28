// ConferenceTitleCard.tsx
import React from "react";
import { MapPin, Calendar, Star } from "lucide-react";
import {
    ResearchConferenceDetailResponse,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";

interface ConferenceTitleCardProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
    isFavorite: boolean;
    onFavoriteToggle: () => void;
    isTogglingFavorite: boolean;
    accessToken: string | null;
}

const ConferenceTitleCard: React.FC<ConferenceTitleCardProps> = ({
    conference,
    formatDate,
    isFavorite,
    onFavoriteToggle,
    isTogglingFavorite,
    accessToken,
}) => {
    return (
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
            <div className="flex items-start gap-3 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold flex-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(56,189,248,0.4)]">
                    {conference.conferenceName}
                </h1>

                {accessToken && (
                    <button
                        onClick={onFavoriteToggle}
                        disabled={isTogglingFavorite}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                        <Star
                            className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"
                                } ${isTogglingFavorite ? "animate-pulse" : ""}`}
                        />
                    </button>
                )}

                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    {conference.isResearchConference ? "Nghiên cứu" : "Công nghệ"}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-white" />
                    <span>{formatDate(conference.startDate)}</span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="w-5 h-5 text-white" />
                    <span>{conference.address}</span>
                </div>
                {conference.totalSlot && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Số người tham dự tối đa: {conference.totalSlot} người</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConferenceTitleCard;
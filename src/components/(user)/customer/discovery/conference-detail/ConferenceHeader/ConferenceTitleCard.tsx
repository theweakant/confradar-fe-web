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
    showSubscribeCard?: boolean;
    isResearch?: boolean;
}

const ConferenceTitleCard: React.FC<ConferenceTitleCardProps> = ({
    conference,
    formatDate,
    isFavorite,
    onFavoriteToggle,
    isTogglingFavorite,
    accessToken,
    showSubscribeCard,
    isResearch = false,
}) => {
    const baseClasses = isResearch
        ? "h-full bg-white rounded-xl shadow-md p-6"
        : "h-full bg-white rounded-xl shadow-md p-6 md:p-8";

    const textColor = isResearch ? "text-gray-900" : "text-gray-800";
    const titleColor = isResearch
        ? "text-gray-900"
        : "text-blue-600";

    return (
        <div className={baseClasses}>
            <div className="flex items-start gap-3 mb-4">
                <h1 className={`text-2xl md:text-3xl font-bold flex-1 ${titleColor}`}>
                    {conference.conferenceName}
                </h1>

                {accessToken && (
                    <button
                        onClick={onFavoriteToggle}
                        disabled={isTogglingFavorite}
                        className={`p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed ${isResearch
                            ? "bg-gray-100 hover:bg-gray-200"
                            : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                        <Star
                            className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                } ${isTogglingFavorite ? "animate-pulse" : ""}`}
                        />
                    </button>
                )}

                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    {conference.isResearchConference ? "Nghiên cứu" : "Công nghệ"}
                </span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${textColor}`}>
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span>{formatDate(conference.startDate)}</span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span>{conference.address}</span>
                </div>
                {conference.totalSlot && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Số người tham dự tối đa: {conference.totalSlot} người</span>
                    </div>
                )}
            </div>

            {!showSubscribeCard && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
                    Đây là hội thảo của bên đối tác liên kết với Confradar nhưng không liên kết bán vé.
                    Bạn vui lòng xem thông tin về hội thảo, và liên hệ bên liên quan để mua vé nếu có nhu cầu.
                </div>
            )}
        </div>
    );
};

// interface ConferenceTitleCardProps {
//     conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
//     formatDate: (dateString?: string) => string;
//     isFavorite: boolean;
//     onFavoriteToggle: () => void;
//     isTogglingFavorite: boolean;
//     accessToken: string | null;
//     showSubscribeCard?: boolean;
// }

// const ConferenceTitleCard: React.FC<ConferenceTitleCardProps> = ({
//     conference,
//     formatDate,
//     isFavorite,
//     onFavoriteToggle,
//     isTogglingFavorite,
//     accessToken,
//     showSubscribeCard,
// }) => {
//     return (
//         <div className="h-full bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
//             <div className="flex items-start gap-3 mb-4">
//                 <h1 className="text-2xl md:text-3xl font-bold flex-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(56,189,248,0.4)]">
//                     {conference.conferenceName}
//                 </h1>

//                 {accessToken && (
//                     <button
//                         onClick={onFavoriteToggle}
//                         disabled={isTogglingFavorite}
//                         className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                         title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
//                     >
//                         <Star
//                             className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"
//                                 } ${isTogglingFavorite ? "animate-pulse" : ""}`}
//                         />
//                     </button>
//                 )}

//                 <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
//                     {conference.isResearchConference ? "Nghiên cứu" : "Công nghệ"}
//                 </span>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
//                 <div className="flex items-center gap-2">
//                     <Calendar className="w-5 h-5 text-white" />
//                     <span>{formatDate(conference.startDate)}</span>
//                 </div>
//                 <div className="flex items-start gap-2 md:col-span-2">
//                     <MapPin className="w-5 h-5 text-white" />
//                     <span>{conference.address}</span>
//                 </div>
//                 {conference.totalSlot && (
//                     <div className="flex items-center gap-2">
//                         <span className="text-sm">Số người tham dự tối đa: {conference.totalSlot} người</span>
//                     </div>
//                 )}
//             </div>

//             {!showSubscribeCard && (
//                 <div className="mt-4 p-4 bg-white/10 rounded-lg text-sm text-yellow-200">
//                     Đây là hội thảo của bên đối tác liên kết với Confradar nhưng không liên kết bán vé.
//                     Bạn vui lòng xem thông tin về hội thảo, và liên hệ bên liên quan để mua vé nếu có nhu cầu.
//                 </div>
//             )}
//         </div>
//     );
// };

export default ConferenceTitleCard;
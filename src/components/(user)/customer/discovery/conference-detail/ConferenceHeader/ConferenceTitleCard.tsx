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

    activeTab?: string;
    onTabChange?: (tab: string) => void;
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

    activeTab,
    onTabChange,
}) => {
    const tabs = [
        { key: "info", label: "Thông tin & Hình ảnh về hội nghị", icon: "📋" },
        { key: "sessions", label: "Lịch trình Sessions", icon: "📅" },
        { key: "prices", label: "Các mức phí tham dự", icon: "🎫" },
        { key: "research-timeline", label: "Deadline nộp bài báo", icon: "⏰" },
        { key: "research-documents", label: "Tài liệu & Hướng dẫn", icon: "📄" },
        { key: "policy", label: "Chính sách", icon: "📜" },
    ];

    const academicCard = "bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200";
    const academicTitle = "text-slate-800 font-serif";
    const academicAccent = "text-blue-700";

    // Tech style cho technical
    const techCard = "bg-white shadow-lg";
    const techTitle = "text-blue-600";
    const techAccent = "text-cyan-500";

    const cardClasses = isResearch
        ? `h-full rounded-xl p-6 ${academicCard}`
        : `h-full rounded-xl shadow-md p-6 md:p-8 ${techCard}`;

    const titleClasses = isResearch ? academicTitle : techTitle;
    const accentColor = isResearch ? academicAccent : techAccent;

    return (
        <div className={cardClasses}>
            {/* Header Section */}
            <div className="mb-4 space-y-2">

                {/* Title */}
                <h1 className={`text-2xl md:text-3xl font-bold w-full ${titleClasses}`}>
                    {conference.conferenceName}
                </h1>

                {/* Row of badges + favorite */}
                <div className="flex flex-wrap items-center gap-3">

                    {/* Status Badge */}
                    {conference.statusName && (
                        <span
                            className={`
                    px-3 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm border
                    ${conference.statusName === "Ready" ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                    ${conference.statusName === "OnHold" ? "bg-amber-100 text-amber-700 border-amber-300" : ""}
                    ${conference.statusName === "Completed" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : ""}
                    ${conference.statusName === "Cancel" ? "bg-red-100 text-red-600 border-red-300" : ""}
                `}
                        >
                            {conference.statusName === "Ready" && "Đang diễn ra"}
                            {conference.statusName === "OnHold" && "Tạm hoãn"}
                            {conference.statusName === "Completed" && "Đã kết thúc"}
                            {conference.statusName === "Cancel" && "Đã hủy"}
                        </span>
                    )}

                    {/* Type Badge */}
                    <span
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap
                ${isResearch
                                ? "bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm"
                                : "bg-red-100 text-red-600 border-2 border-red-300 shadow-sm"
                            }`
                        }
                    >
                        {conference.isResearchConference ? "Hội nghị nghiên cứu" : "Hội thảo công nghệ"}
                    </span>

                    {/* Favorite Button */}
                    {accessToken && (
                        <button
                            onClick={onFavoriteToggle}
                            disabled={isTogglingFavorite}
                            className="p-2 ml-auto rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                        >
                            <Star
                                className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                    } ${isTogglingFavorite ? "animate-pulse" : ""}`}
                            />
                        </button>
                    )}

                </div>
            </div>
            {/* <div className="flex items-start gap-3 mb-4">
                <h1 className={`text-2xl md:text-3xl font-bold flex-1 ${titleClasses}`}>
                    {conference.conferenceName}
                </h1>

                {conference.statusName && (
                    <span
                        className={`
            px-3 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm border
            ${conference.statusName === "Ready" ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
            ${conference.statusName === "OnHold" ? "bg-amber-100 text-amber-700 border-amber-300" : ""}
            ${conference.statusName === "Completed" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : ""}
            ${conference.statusName === "Cancel" ? "bg-red-100 text-red-600 border-red-300" : ""}
        `}
                    >
                        {conference.statusName === "Ready" && "Sẵn sàng cho đăng ký tham dự"}
                        {conference.statusName === "OnHold" && "Tạm hoãn"}
                        {conference.statusName === "Completed" && "Đã kết thúc"}
                        {conference.statusName === "Cancel" && "Đã hủy"}
                    </span>
                )}

                {accessToken && (
                    <button
                        onClick={onFavoriteToggle}
                        disabled={isTogglingFavorite}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                        <Star
                            className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                } ${isTogglingFavorite ? "animate-pulse" : ""}`}
                        />
                    </button>
                )}

                <span
                    className={`px-4 py-2 rounded-full text-md font-semibold whitespace-nowrap 
        ${isResearch
                            ? "bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm"
                            : "bg-red-100 text-red-600 border-2 border-red-300 shadow-sm"
                        }`
                    }
                >
                    {conference.isResearchConference ? "Hội nghị nghiên cứu" : "Hội thảo công nghệ"}
                </span>
            </div> */}

            <div
                className={`my-2 md:mt-2 flex items-start gap-2 max-w-2xl
        ${isResearch ? "text-slate-700" : "text-gray-700"}`}
            >
                {/* <span
                    className={`mt-1 w-2 h-2 rounded-full 
            ${isResearch ? "bg-blue-500" : "bg-red-500"}`}
                ></span> */}

                <p className="text-sm md:text-base leading-relaxed font-medium opacity-90">
                    {isResearch
                        ? "Một hội nghị nghiên cứu nơi công bố bài báo, thảo luận học thuật và kết nối cộng đồng khoa học đa lĩnh vực."
                        : "Hội thảo công nghệ giúp bạn khám phá các chủ đề chuyên sâu, gặp gỡ những chuyên gia hàng đầu và cập nhật thông tin mới nhất."}
                </p>
            </div>

            {/* <p
                className={`mt-2 text-sm md:text-base leading-relaxed ${isResearch ? "text-slate-700 italic" : "text-gray-700"
                    }`}
            >
                {isResearch
                    ? "Không gian học thuật dành cho công bố bài báo, phản biện khoa học và kết nối các nhà nghiên cứu trong nhiều lĩnh vực."
                    : "Sự kiện công nghệ đa chiều với các session chuyên sâu, speaker danh tiếng và nhiều lựa chọn giá vé linh hoạt."
                }
            </p> */}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                    <Calendar className={`w-5 h-5 ${accentColor}`} />
                    <span>{formatDate(conference.startDate)}</span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className={`w-5 h-5 ${accentColor}`} />
                    <span>{conference.address}</span>
                </div>
                {conference.totalSlot && (
                    <div className="flex items-center gap-2 text-sm">
                        <span>Số người tham dự tối đa: {conference.totalSlot} người</span>
                    </div>
                )}
            </div>

            {/* Tab Navigation - CHỈ hiển thị khi isResearch = true */}
            {isResearch && activeTab && onTabChange && (
                <div className="mt-6 pt-4 border-t-2 border-slate-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === tab.key
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200"
                                    }`}
                            >
                                <span className="text-base">{tab.icon}</span>
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!showSubscribeCard && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
                    Đây là hội thảo của bên đối tác liên kết với Confradar nhưng không liên kết bán vé.
                    Bạn vui lòng xem thông tin về hội thảo, và liên hệ bên liên quan để mua vé nếu có nhu cầu.
                </div>
            )}
        </div>
    );

    // const baseClasses = isResearch
    //     ? "h-full bg-white rounded-xl shadow-md p-6"
    //     : "h-full bg-white rounded-xl shadow-md p-6 md:p-8";

    // const textColor = isResearch ? "text-gray-900" : "text-gray-800";
    // const titleColor = isResearch
    //     ? "text-gray-900"
    //     : "text-blue-600";

    // return (
    //     <div className={baseClasses}>
    //         <div className="flex items-start gap-3 mb-4">
    //             <h1 className={`text-2xl md:text-3xl font-bold flex-1 ${titleColor}`}>
    //                 {conference.conferenceName}
    //             </h1>

    //             {accessToken && (
    //                 <button
    //                     onClick={onFavoriteToggle}
    //                     disabled={isTogglingFavorite}
    //                     className={`p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed ${isResearch
    //                         ? "bg-gray-100 hover:bg-gray-200"
    //                         : "bg-gray-100 hover:bg-gray-200"
    //                         }`}
    //                     title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    //                 >
    //                     <Star
    //                         className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
    //                             } ${isTogglingFavorite ? "animate-pulse" : ""}`}
    //                     />
    //                 </button>
    //             )}

    //             <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
    //                 {conference.isResearchConference ? "Nghiên cứu" : "Công nghệ"}
    //             </span>
    //         </div>

    //         <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${textColor}`}>
    //             <div className="flex items-center gap-2">
    //                 <Calendar className="w-5 h-5 text-gray-600" />
    //                 <span>{formatDate(conference.startDate)}</span>
    //             </div>
    //             <div className="flex items-start gap-2 md:col-span-2">
    //                 <MapPin className="w-5 h-5 text-gray-600" />
    //                 <span>{conference.address}</span>
    //             </div>
    //             {conference.totalSlot && (
    //                 <div className="flex items-center gap-2">
    //                     <span className="text-sm">Số người tham dự tối đa: {conference.totalSlot} người</span>
    //                 </div>
    //             )}
    //         </div>

    //         {!showSubscribeCard && (
    //             <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
    //                 Đây là hội thảo của bên đối tác liên kết với Confradar nhưng không liên kết bán vé.
    //                 Bạn vui lòng xem thông tin về hội thảo, và liên hệ bên liên quan để mua vé nếu có nhu cầu.
    //             </div>
    //         )}
    //     </div>
    // );
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
import React, { Fragment } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    ConferenceDetailForScheduleResponse,
    SessionDetailForScheduleResponse,
} from "@/types/conference.type";
import { useAppSelector } from "@/redux/hooks/hooks";
import { RootState } from "@/redux/store";
import { checkUserRole } from "@/helper/conference";

interface SessionsListDialogProps {
    open: boolean;
    conference: ConferenceDetailForScheduleResponse | null;
    onClose: () => void;
    onSessionSelect: (session: SessionDetailForScheduleResponse) => void;
}

const SessionsListDialog: React.FC<SessionsListDialogProps> = ({
    open,
    conference,
    onClose,
    onSessionSelect,
}) => {
    const user = useAppSelector((state: RootState) => state.auth.user);

    const groupSessionsByDate = (
        sessions: SessionDetailForScheduleResponse[]
    ) => {
        const grouped = sessions.reduce((acc, session) => {
            if (session.startTime) {
                const date = new Date(session.startTime).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(session);
            }
            return acc;
        }, {} as Record<string, SessionDetailForScheduleResponse[]>);

        return grouped;
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white border border-gray-300 shadow-2xl transition-all">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <DialogTitle className="text-xl font-bold text-white mb-1">
                                                {conference?.conferenceName || "Chi tiết phiên họp"}
                                            </DialogTitle>
                                            <p className="text-sm text-blue-100">
                                                {conference?.sessions.length || 0} phiên họp
                                            </p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="max-h-[70vh] overflow-y-auto"
                                    style={{
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "rgba(96,165,250,0.7) transparent",
                                    }}>
                                    {conference?.sessions && conference.sessions.length > 0 ? (
                                        Object.entries(groupSessionsByDate(conference.sessions)).map(
                                            ([date, sessions]) => (
                                                <div key={date} className="mb-6 last:mb-0  px-6">
                                                    <h4 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                                                        <Calendar className="w-4 h-4" />
                                                        {date}
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {sessions.map((session) => {
                                                            const userRole = checkUserRole(session, user);

                                                            return (
                                                                <div
                                                                    key={session.conferenceSessionId}
                                                                    onClick={() => onSessionSelect(session)}
                                                                    className="bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-blue-500 rounded-lg p-4 cursor-pointer transition-all duration-200 group"
                                                                >
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                                    {session.title || "Untitled Session"}
                                                                                </h5>
                                                                                {(userRole.isRootAuthor || userRole.isPresenter) && (
                                                                                    <span className="text-gray-700 text-xs italic">| Vai trò của bạn:</span>
                                                                                )}

                                                                                {userRole.isRootAuthor && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">
                                                                                        👑 Tác giả gốc
                                                                                    </span>
                                                                                )}

                                                                                {userRole.isPresenter && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-semibold rounded">
                                                                                        🎤 Diễn giả
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {session.description && (
                                                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                                    {session.description}
                                                                                </p>
                                                                            )}
                                                                            <div className="flex flex-wrap gap-3 text-xs">
                                                                                {session.startTime && session.endTime && (
                                                                                    <div className="flex items-center gap-1 text-gray-700">
                                                                                        <Clock className="w-3 h-3 text-blue-600" />
                                                                                        {new Date(session.startTime).toLocaleTimeString("vi-VN", {
                                                                                            hour: "2-digit",
                                                                                            minute: "2-digit",
                                                                                        })}{" "}
                                                                                        -{" "}
                                                                                        {new Date(session.endTime).toLocaleTimeString("vi-VN", {
                                                                                            hour: "2-digit",
                                                                                            minute: "2-digit",
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                                {session.roomDisplayName && (
                                                                                    <div className="flex items-center gap-1 text-gray-700">
                                                                                        <MapPin className="w-3 h-3 text-green-600" />
                                                                                        {session.roomDisplayName}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Chưa có phiên họp nào được lên lịch</p>
                                        </div>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition >
    );
};

export default SessionsListDialog;

// import React, { Fragment } from "react";
// import { Calendar, Clock, MapPin, X } from "lucide-react";
// import {
//     Dialog,
//     DialogPanel,
//     DialogTitle,
//     Transition,
//     TransitionChild,
// } from "@headlessui/react";
// import {
//     ConferenceDetailForScheduleResponse,
//     SessionDetailForScheduleResponse,
// } from "@/types/conference.type";
// import { useAppSelector } from "@/redux/hooks/hooks";
// import { RootState } from "@/redux/store";
// import { checkUserRole } from "@/helper/conference";

// interface SessionsListDialogProps {
//     open: boolean;
//     conference: ConferenceDetailForScheduleResponse | null;
//     onClose: () => void;
//     onSessionSelect: (session: SessionDetailForScheduleResponse) => void;
// }

// const SessionsListDialog: React.FC<SessionsListDialogProps> = ({
//     open,
//     conference,
//     onClose,
//     onSessionSelect,
// }) => {
//     const user = useAppSelector((state: RootState) => state.auth.user);

//     const groupSessionsByDate = (
//         sessions: SessionDetailForScheduleResponse[]
//     ) => {
//         const grouped = sessions.reduce((acc, session) => {
//             if (session.startTime) {
//                 const date = new Date(session.startTime).toLocaleDateString("vi-VN", {
//                     day: "2-digit",
//                     month: "2-digit",
//                     year: "numeric",
//                 });
//                 if (!acc[date]) {
//                     acc[date] = [];
//                 }
//                 acc[date].push(session);
//             }
//             return acc;
//         }, {} as Record<string, SessionDetailForScheduleResponse[]>);

//         return grouped;
//     };

//     return (
//         <Transition appear show={open} as={Fragment}>
//             <Dialog as="div" className="relative z-50" onClose={onClose}>
//                 <TransitionChild
//                     as={Fragment}
//                     enter="ease-out duration-300"
//                     enterFrom="opacity-0"
//                     enterTo="opacity-100"
//                     leave="ease-in duration-200"
//                     leaveFrom="opacity-100"
//                     leaveTo="opacity-0"
//                 >
//                     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
//                 </TransitionChild>

//                 <div className="fixed inset-0 overflow-y-auto">
//                     <div className="flex min-h-full items-center justify-center p-4">
//                         <TransitionChild
//                             as={Fragment}
//                             enter="ease-out duration-300"
//                             enterFrom="opacity-0 scale-95"
//                             enterTo="opacity-100 scale-100"
//                             leave="ease-in duration-200"
//                             leaveFrom="opacity-100 scale-100"
//                             leaveTo="opacity-0 scale-95"
//                         >
//                             <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-gray-800 border border-gray-700 shadow-2xl transition-all">
//                                 {/* Header */}
//                                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex-1">
//                                             <DialogTitle className="text-xl font-bold text-white mb-1">
//                                                 {conference?.conferenceName || "Chi tiết phiên họp"}
//                                             </DialogTitle>
//                                             <p className="text-sm text-blue-100">
//                                                 {conference?.sessions.length || 0} phiên họp
//                                             </p>
//                                         </div>
//                                         <button
//                                             onClick={onClose}
//                                             className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
//                                         >
//                                             <X className="w-5 h-5 text-white" />
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Content */}
//                                 <div className="max-h-[70vh] overflow-y-auto"
//                                     style={{
//                                         scrollbarWidth: "thin",
//                                         scrollbarColor: "rgba(96,165,250,0.7) transparent",
//                                     }}>
//                                     {conference?.sessions && conference.sessions.length > 0 ? (
//                                         Object.entries(groupSessionsByDate(conference.sessions)).map(
//                                             ([date, sessions]) => (
//                                                 <div key={date} className="mb-6 last:mb-0  px-6">
//                                                     <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2 sticky top-0 bg-gray-800 py-2 z-10">
//                                                         <Calendar className="w-4 h-4" />
//                                                         {date}
//                                                     </h4>
//                                                     <div className="space-y-3">
//                                                         {sessions.map((session) => {
//                                                             const userRole = checkUserRole(session, user);

//                                                             return (
//                                                                 <div
//                                                                     key={session.conferenceSessionId}
//                                                                     onClick={() => onSessionSelect(session)}
//                                                                     className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-blue-500 rounded-lg p-4 cursor-pointer transition-all duration-200 group"
//                                                                 >
//                                                                     <div className="flex items-start justify-between gap-3">
//                                                                         <div className="flex-1 min-w-0">
//                                                                             <div className="flex items-center gap-2 mb-2">
//                                                                                 <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors">
//                                                                                     {session.title || "Untitled Session"}
//                                                                                 </h5>
//                                                                                 {/* Chỉ hiển thị label role khi có role */}
//                                                                                 {(userRole.isRootAuthor || userRole.isPresenter) && (
//                                                                                     <span className="text-gray-300 text-xs italic">| Vai trò của bạn:</span>
//                                                                                 )}

//                                                                                 {userRole.isRootAuthor && (
//                                                                                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">
//                                                                                         👑 Tác giả gốc
//                                                                                     </span>
//                                                                                 )}

//                                                                                 {userRole.isPresenter && (
//                                                                                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-semibold rounded">
//                                                                                         🎤 Diễn giả
//                                                                                     </span>
//                                                                                 )}
//                                                                                 {/* {userRole.isRootAuthor && (
//                                                                                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">
//                                                                                         👑Bạn là Tác giả gốc
//                                                                                     </span>
//                                                                                 )}
//                                                                                 {userRole.isPresenter && (
//                                                                                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-semibold rounded">
//                                                                                         🎤 Diễn giả
//                                                                                     </span>
//                                                                                 )} */}
//                                                                             </div>
//                                                                             {session.description && (
//                                                                                 <p className="text-sm text-gray-400 mb-3 line-clamp-2">
//                                                                                     {session.description}
//                                                                                 </p>
//                                                                             )}
//                                                                             <div className="flex flex-wrap gap-3 text-xs">
//                                                                                 {session.startTime && session.endTime && (
//                                                                                     <div className="flex items-center gap-1 text-gray-300">
//                                                                                         <Clock className="w-3 h-3 text-blue-400" />
//                                                                                         {new Date(session.startTime).toLocaleTimeString("vi-VN", {
//                                                                                             hour: "2-digit",
//                                                                                             minute: "2-digit",
//                                                                                         })}{" "}
//                                                                                         -{" "}
//                                                                                         {new Date(session.endTime).toLocaleTimeString("vi-VN", {
//                                                                                             hour: "2-digit",
//                                                                                             minute: "2-digit",
//                                                                                         })}
//                                                                                     </div>
//                                                                                 )}
//                                                                                 {session.roomDisplayName && (
//                                                                                     <div className="flex items-center gap-1 text-gray-300">
//                                                                                         <MapPin className="w-3 h-3 text-green-400" />
//                                                                                         {session.roomDisplayName}
//                                                                                     </div>
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             );
//                                                         })}
//                                                         {/* {sessions.map((session) => (
//                                                             <div
//                                                                 key={session.conferenceSessionId}
//                                                                 onClick={() => onSessionSelect(session)}
//                                                                 className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-blue-500 rounded-lg p-4 cursor-pointer transition-all duration-200 group"
//                                                             >
//                                                                 <div className="flex items-start justify-between gap-3">
//                                                                     <div className="flex-1 min-w-0">
//                                                                         <h5 className="font-medium text-white mb-2 group-hover:text-blue-300 transition-colors">
//                                                                             {session.title || "Untitled Session"}
//                                                                         </h5>
//                                                                         {session.description && (
//                                                                             <p className="text-sm text-gray-400 mb-3 line-clamp-2">
//                                                                                 {session.description}
//                                                                             </p>
//                                                                         )}
//                                                                         <div className="flex flex-wrap gap-3 text-xs">
//                                                                             {session.startTime && session.endTime && (
//                                                                                 <div className="flex items-center gap-1 text-gray-300">
//                                                                                     <Clock className="w-3 h-3 text-blue-400" />
//                                                                                     {new Date(
//                                                                                         session.startTime
//                                                                                     ).toLocaleTimeString("vi-VN", {
//                                                                                         hour: "2-digit",
//                                                                                         minute: "2-digit",
//                                                                                     })}{" "}
//                                                                                     -{" "}
//                                                                                     {new Date(
//                                                                                         session.endTime
//                                                                                     ).toLocaleTimeString("vi-VN", {
//                                                                                         hour: "2-digit",
//                                                                                         minute: "2-digit",
//                                                                                     })}
//                                                                                 </div>
//                                                                             )}
//                                                                             {session.roomDisplayName && (
//                                                                                 <div className="flex items-center gap-1 text-gray-300">
//                                                                                     <MapPin className="w-3 h-3 text-green-400" />
//                                                                                     {session.roomDisplayName}
//                                                                                 </div>
//                                                                             )}
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         ))} */}
//                                                     </div>
//                                                 </div>
//                                             )
//                                         )
//                                     ) : (
//                                         <div className="text-center py-8 text-gray-400">
//                                             <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                                             <p>Chưa có phiên họp nào được lên lịch</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </DialogPanel>
//                         </TransitionChild>
//                     </div>
//                 </div>
//             </Dialog>
//         </Transition >
//     );
// };

// export default SessionsListDialog;
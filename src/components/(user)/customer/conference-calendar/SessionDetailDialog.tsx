import React, { Fragment } from "react";
import { Clock, MapPin, ArrowLeft, X } from "lucide-react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { SessionDetailForScheduleResponse } from "@/types/conference.type";

interface SessionDetailDialogProps {
    open: boolean;
    session: SessionDetailForScheduleResponse | null;
    onClose: () => void;
    onBack?: () => void; // Optional back button
}

const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
    open,
    session,
    onClose,
    onBack,
}) => {
    return (
        <Transition appear show={open} as={Fragment} unmount={true}>
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            {onBack && (
                                                <button
                                                    onClick={onBack}
                                                    className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
                                                >
                                                    <ArrowLeft className="w-5 h-5 text-white" />
                                                </button>
                                            )}
                                            <DialogTitle className="text-xl font-bold text-white">
                                                {session?.title || "Chi tiết phiên họp"}
                                            </DialogTitle>
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
                                <div className="p-6">
                                    {session ? (
                                        <div className="space-y-4">
                                            {session.description && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Mô tả
                                                    </label>
                                                    <p className="text-gray-200 mt-1">
                                                        {session.description}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {session.startTime && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-400">
                                                            Thời gian bắt đầu
                                                        </label>
                                                        <div className="flex items-center gap-2 text-gray-200 mt-1">
                                                            <Clock className="w-4 h-4 text-blue-400" />
                                                            {new Date(session.startTime).toLocaleString(
                                                                "vi-VN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {session.endTime && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-400">
                                                            Thời gian kết thúc
                                                        </label>
                                                        <div className="flex items-center gap-2 text-gray-200 mt-1">
                                                            <Clock className="w-4 h-4 text-blue-400" />
                                                            {new Date(session.endTime).toLocaleString(
                                                                "vi-VN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {(session.roomDisplayName || session.roomNumber) && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Phòng họp
                                                    </label>
                                                    <div className="flex items-center gap-2 text-gray-200 mt-1">
                                                        <MapPin className="w-4 h-4 text-green-400" />
                                                        {session.roomDisplayName ||
                                                            `Phòng ${session.roomNumber}`}
                                                    </div>
                                                </div>
                                            )}

                                            {session.destinationName && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Địa điểm
                                                    </label>
                                                    <div className="text-gray-200 mt-1">
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="w-4 h-4 text-green-400 mt-1" />
                                                            <div>
                                                                <div>{session.destinationName}</div>
                                                                {(session.destinationStreet ||
                                                                    session.destinationDistrict) && (
                                                                        <div className="text-sm text-gray-400 mt-1">
                                                                            {[
                                                                                session.destinationStreet,
                                                                                session.destinationDistrict,
                                                                                session.cityName,
                                                                            ]
                                                                                .filter(Boolean)
                                                                                .join(", ")}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-48" />
                                    )}

                                    <div className="mt-6 flex justify-end gap-2">
                                        {onBack && (
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                onClick={onBack}
                                            >
                                                Quay lại
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                            onClick={() => {
                                                if (onBack) {
                                                    onBack();
                                                } else {
                                                    onClose();
                                                }
                                            }}
                                        >
                                            {onBack ? 'Đóng' : 'Đóng'}
                                        </button>
                                        {/* <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                            onClick={onClose}
                                        >
                                            Đóng
                                        </button> */}
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SessionDetailDialog;
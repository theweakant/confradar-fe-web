import React, { Fragment, useState } from "react";
import { Clock, Users, AlertCircle, X, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type { Session } from "@/types/conference.type";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  onEditSession?: (session: Session, index: number) => void;
  onDeleteSession?: (index: number) => void;
}

export function SessionDetailModal({ 
  isOpen, 
  onClose, 
  sessions,
  onEditSession,
  onDeleteSession 
}: SessionDetailModalProps) {
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
  };

  const handleEdit = (session: Session, index: number) => {
    if (onEditSession) {
      onEditSession(session, index);
      onClose();
    }
  };

  const handleDeleteConfirm = (index: number) => {
    if (onDeleteSession) {
      onDeleteSession(index);
      setDeleteConfirmIndex(null);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
              <DialogPanel className="w-full max-w-6xl transform overflow-hidden rounded-lg bg-white border border-gray-200 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <DialogTitle className="text-xl font-bold text-white">
                        Chi tiết phiên họp
                      </DialogTitle>
                      <p className="text-sm text-green-100 mt-1">
                        Tổng cộng: {sessions.length} phiên họp
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-green-500/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[75vh] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">Chưa có phiên họp nào</p>
                      <p className="text-sm mt-2">Hãy tạo phiên họp đầu tiên của bạn!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessions.map((session, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group"
                        >
                          {/* Action Buttons */}
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEditSession && (
                              <button
                                onClick={() => handleEdit(session, index)}
                                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
                                title="Sửa session"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteSession && (
                              <button
                                onClick={() => setDeleteConfirmIndex(index)}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm"
                                title="Xóa session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Delete Confirmation Overlay */}
                          {deleteConfirmIndex === index && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 z-10">
                              <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                              <p className="text-sm font-semibold text-gray-900 mb-1 text-center">
                                Xác nhận xóa?
                              </p>
                              <p className="text-xs text-gray-600 mb-3 text-center">
                                Session này sẽ bị xóa vĩnh viễn
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setDeleteConfirmIndex(null)}
                                  className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleDeleteConfirm(index)}
                                  className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Title */}
                          <h4 className="font-bold text-gray-900 mb-2 text-base line-clamp-2 min-h-[3rem] pr-16">
                            {session.title}
                          </h4>

                          {/* Time Info */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium">
                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-4 h-4" /> {/* Spacer */}
                              <span>Thời lượng: {calculateDuration(session.startTime, session.endTime)}</span>
                            </div>
                          </div>

                          {/* Description */}
                          {session.description && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {session.description}
                              </p>
                            </div>
                          )}

                          {/* Speakers */}
                          {session.speaker && session.speaker.length > 0 && (
                            <div className="border-t border-blue-200 pt-3 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-gray-700 uppercase">
                                  Diễn giả ({session.speaker.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {session.speaker.map((speaker, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-blue-100"
                                  >
                                    {speaker.image && (
                                      <img
                                        src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                                        alt={speaker.name}
                                        className="w-6 h-6 rounded-full object-cover border border-blue-200"
                                      />
                                    )}
                                    <span className="text-xs font-medium text-gray-800">
                                      {speaker.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
  );
}
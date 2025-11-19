import React, { Fragment, useState } from "react";
import { Clock, Users, X, Edit2, Trash2 } from "lucide-react";
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Danh sách session ({sessions.length})
                    </DialogTitle>
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="font-medium">Chưa có phiên họp nào</p>
                      <p className="text-sm mt-1">Hãy tạo phiên họp đầu tiên của bạn!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessions.map((session, index) => (
                        <div
                          key={index}
                          className="relative bg-blue-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all group"
                        >
                          {/* Action Buttons */}
                          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEditSession && (
                              <button
                                onClick={() => handleEdit(session, index)}
                                className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-lg transition-colors shadow-sm border border-blue-200"
                                title="Sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteSession && (
                              <button
                                onClick={() => setDeleteConfirmIndex(index)}
                                className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg transition-colors shadow-sm border border-red-200"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Delete Confirmation Overlay */}
                          {deleteConfirmIndex === index && (
                            <div className="absolute inset-0 bg-white/98 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 z-10">
                              <p className="text-sm font-semibold text-gray-900 mb-1 text-center">
                                Xác nhận xóa?
                              </p>
                              <p className="text-xs text-gray-600 mb-4 text-center">
                                Session sẽ bị xóa vĩnh viễn
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setDeleteConfirmIndex(null)}
                                  className="px-4 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleDeleteConfirm(index)}
                                  className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Title */}
                          <h4 className="font-semibold text-gray-900 mb-3 text-base pr-16">
                            {session.title}
                          </h4>

                          {/* Time Info */}
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </span>
                            <span className="text-gray-500">
                              {calculateDuration(session.startTime, session.endTime)}
                            </span>
                          </div>

                          {/* Speakers */}
                          {session.speaker && session.speaker.length > 0 && (
                            <div className="border-t border-blue-200 pt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  DIỄN GIẢ ({session.speaker.length})
                                </span>
                              </div>
                              <div className="space-y-2">
                                {session.speaker.map((speaker, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                  >
                                    {speaker.image ? (
                                      <img
                                        src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                                        alt={speaker.name}
                                        className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center border-2 border-white shadow-sm">
                                        <span className="text-xs font-semibold text-blue-700">
                                          {speaker.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-sm text-gray-800">
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
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
"use client";

import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type {
  CommonConference,
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";

interface SessionTabProps {
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  conferenceId: string; 
}

export function SessionTab({ conference, conferenceType, conferenceId }: SessionTabProps) {
  const sessions =
    conferenceType === "research"
      ? (conference as ResearchConferenceDetailResponse).researchSessions
      : (conference as TechnicalConferenceDetailResponse).sessions;

  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "--:--";
    
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    return timeString.slice(0, 5);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">
          Danh sách session ({sessions?.length || 0})
        </h2>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const sessionId = session.conferenceSessionId || index.toString();
            const isExpanded = expandedSessions.has(sessionId);

            return (
              <div
                key={sessionId}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleSession(sessionId)}
                  className="w-full text-left p-4 flex items-start justify-between group"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {session.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      {(session.startTime || session.endTime) && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            {formatTime(session.startTime)} – {formatTime(session.endTime)}
                          </span>
                        </div>
                      )}
                      
                      {(session.date || session.sessionDate) && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(session.date || session.sessionDate!).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{session.room?.displayName || session.room?.number || "Chưa có phòng"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    {session.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Mô tả</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{session.description}</p>
                      </div>
                    )}

                    {session.room && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Thông Tin Phòng
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-gray-200">
                          <InfoField label="Mã phòng" value={session.roomId} />
                          <InfoField label="Tên phòng" value={session.room.displayName} />
                          <InfoField label="Số phòng" value={session.room.number} />
                        </div>
                      </div>
                    )}

                    {!session.room && session.roomId && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Thông Tin Phòng
                        </h4>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <InfoField label="Mã phòng" value={session.roomId} />
                        </div>
                      </div>
                    )}

                    {session.sessionMedia && session.sessionMedia.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Tài Liệu Phiên Họp ({session.sessionMedia.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {session.sessionMedia.map((media, idx) => (
                            <div
                              key={idx}
                              className="relative h-32 rounded-lg overflow-hidden border border-gray-300 group cursor-pointer"
                            >
                              <Image
                                src={
                                  media.conferenceSessionMediaUrl?.startsWith("http")
                                    ? media.conferenceSessionMediaUrl
                                    : `https://minio-api.confradar.io.vn/${media.conferenceSessionMediaUrl}`
                                }
                                alt={`Tài liệu ${idx + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chưa có phiên họp nào được tạo</p>
        </div>
      )}
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">
        {value != null && value !== "" ? String(value) : "N/A"}
      </p>
    </div>
  );
}
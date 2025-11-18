// components/pages/ConferenceDetailPage/Tab/SessionTab.tsx
"use client";

import {
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";

import Image from "next/image";
import { useState } from "react";
import { formatTimeDate } from "@/helper/format";
import type {
  CommonConference,
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
  RevisionRoundDeadlineResponse,
} from "@/types/conference.type";

interface SessionTabProps {
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
}

export function SessionTab({ conference, conferenceType }: SessionTabProps) {
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

  const researchPhase =
    conferenceType === "research"
      ? (conference as ResearchConferenceDetailResponse).researchPhase
      : null;

  return (
    <div className="space-y-4 p-4">

      {/* Session List */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Lịch Các Phiên Họp
        </h2>
        {sessions && sessions.length > 0 ? (
          sessions.map((session, index) => {
            const sessionId = session.conferenceSessionId || index.toString();
            const isExpanded = expandedSessions.has(sessionId);

            return (
              <div
                key={sessionId}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* Header Card - Clickable */}
                <button
                  onClick={() => toggleSession(sessionId)}
                  className="w-full text-left p-4 flex items-start justify-between group"
                >
                  <div className="flex-1 pr-4">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600">
                      {session.title}
                    </h3>
                    {/* Time */}
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTimeDate(session.startTime)} – {formatTimeDate(session.endTime)}
                    </div>
                    {/* Location */}
                    <div className="text-xs text-gray-600 mt-1">
                      {session.room?.displayName || session.room?.number || "Không xác định"}
                    </div>
                  </div>
                  {/* Chevron Right */}
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                    {session.description && (
                      <p className="text-sm text-gray-700 italic">
                        {session.description}
                      </p>
                    )}

                    {/* Room Info */}
                    {session.room && (
                      <div className="pt-2 border-t border-gray-300">
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">
                          Thông Tin Phòng
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white p-2 rounded border border-gray-200">
                          <InfoField label="Mã phòng" value={session.roomId} />
                          <InfoField label="Tên Phòng" value={session.room.displayName} />
                          <InfoField label="Số Phòng" value={session.room.number} />
                        </div>
                      </div>
                    )}

                    {/* Session Media */}
                    {session.sessionMedia && session.sessionMedia.length > 0 && (
                      <div className="pt-2 border-t border-gray-300">
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">
                          Tài Liệu Phiên Họp
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {session.sessionMedia.map((media, idx) => (
                            <div
                              key={idx}
                              className="relative h-24 rounded overflow-hidden border border-gray-300"
                            >
                              <Image
                                src={
                                  media.conferenceSessionMediaUrl?.startsWith("http")
                                    ? media.conferenceSessionMediaUrl
                                    : `https://minio-api.confradar.io.vn/${media.conferenceSessionMediaUrl}`
                                }
                                alt={`Tài liệu ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">
            Không có phiên họp nào
          </p>
        )}
      </div>
    </div>
  );
}

// --- Reusable Helper Component ---
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
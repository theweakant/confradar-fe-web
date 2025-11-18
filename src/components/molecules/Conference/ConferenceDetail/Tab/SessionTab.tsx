"use client";

import {
  ChevronDown,
  Calendar,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { useState } from "react";
import { formatDate } from "@/helper/format";
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
      {/* Research Phase Timeline (only for research) */}
      {conferenceType === "research" && researchPhase && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Giai Đoạn Hội Nghị
          </h3>
          {/* Main Phase Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <InfoField
              label="Đăng ký"
              value={formatDate(researchPhase.registrationStartDate)}
            />
            <InfoField
              label="Nộp bài"
              value={formatDate(researchPhase.fullPaperStartDate)}
            />
            <InfoField
              label="Đánh giá"
              value={formatDate(researchPhase.reviewStartDate)}
            />
            <InfoField
              label="Chỉnh sửa"
              value={formatDate(researchPhase.reviseStartDate)}
            />
            <InfoField
              label="Camera Ready"
              value={formatDate(researchPhase.cameraReadyStartDate)}
            />
            <div className="flex gap-2 items-center">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  researchPhase.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {researchPhase.isActive
                  ? "✓ Đang diễn ra"
                  : "✗ Không hoạt động"}
              </span>
            </div>
          </div>

          {researchPhase.revisionRoundDeadlines &&
            researchPhase.revisionRoundDeadlines.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="revision-rounds"
                  className="border border-blue-200"
                >
                  <AccordionTrigger className="text-sm font-semibold text-gray-900 py-2 px-3 hover:bg-blue-100">
                    Các Vòng Chỉnh Sửa (
                    {researchPhase.revisionRoundDeadlines.length})
                  </AccordionTrigger>
                  <AccordionContent className="pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {researchPhase.revisionRoundDeadlines.map(
                        (deadline: RevisionRoundDeadlineResponse) => (
                          <div
                            key={deadline.revisionRoundDeadlineId}
                            className="bg-white border border-blue-100 rounded p-2"
                          >
                            <div className="text-xs font-bold text-blue-700 mb-1">
                              Vòng {deadline.roundNumber}
                            </div>
                            <div className="text-xs text-gray-700">
                              {deadline.endDate
                                ? formatDate(deadline.endDate)
                                : "Chưa xác định"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
        </div>
      )}

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
                {/* Session Header - Clickable */}
                <button
                  onClick={() => toggleSession(sessionId)}
                  className="w-full text-left p-3 hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {session.title}
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(session.date)} • {session.startTime} -{" "}
                      {session.endTime}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Session Details - Collapsed/Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
                    {session.description && (
                      <p className="text-sm text-gray-700 italic">
                        {session.description}
                      </p>
                    )}

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <InfoField
                        label="ID Phiên"
                        value={session.conferenceSessionId}
                      />
                      <InfoField label="Phòng" value={session.roomId} />
                      <InfoField
                        label="ID Hội Nghị"
                        value={session.conferenceId}
                      />
                    </div>

                    {/* Room Info */}
                    {session.room && (
                      <div className="pt-2 border-t border-gray-300">
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">
                          Thông Tin Phòng
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2 rounded border border-gray-200">
                          <InfoField
                            label="Tên Phòng"
                            value={session.room.displayName}
                          />
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
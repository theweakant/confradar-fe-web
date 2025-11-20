// components/pages/ConferenceDetailPage/Tab/SessionTab.tsx
"use client";

import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatTimeDate } from "@/helper/format";
import { useGetPresentSessionQuery } from "@/redux/services/statistics.service"; 
import { skipToken } from "@reduxjs/toolkit/query/react";

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

  // === Gọi API chỉ khi là research ===
  const shouldFetchPresentSessions = conferenceType === "research";
  const { data: presentSessionData, isLoading: isLoadingPresent, isError: isErrorPresent } =
    useGetPresentSessionQuery(shouldFetchPresentSessions ? conferenceId : skipToken);

  const presentSessions = presentSessionData?.data || [];

  return (
    <div className="space-y-6 p-4">
      {/* === Danh sách session gốc (từ conference detail) === */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-gray-900">Lịch Các Phiên Họp</h2>
        {sessions && sessions.length > 0 ? (
          sessions.map((session, index) => {
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
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600">
                      {session.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTimeDate(session.startTime)} – {formatTimeDate(session.endTime)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {session.room?.displayName || session.room?.number || "Không xác định"}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                    {session.description && (
                      <p className="text-sm text-gray-700 italic">{session.description}</p>
                    )}

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
          <p className="text-gray-500 text-center py-4 text-sm">Không có phiên họp nào</p>
        )}
      </div>

      {/* === Danh sách Phiên có bài báo đã gán (chỉ research) === */}
      {conferenceType === "research" && (
        <div className="space-y-2 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Phiên có bài báo đã gán ({presentSessions.length})
            </h2>
          </div>

          {isLoadingPresent ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : isErrorPresent ? (
            <p className="text-red-500">Lỗi khi tải danh sách phiên có presenter.</p>
          ) : presentSessions.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có bài báo nào được gán vào phiên.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {presentSessions.map((item) => (
                <div
                  key={item.sessionId}
                  className="p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ngày: {new Date(item.onDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {item.presenters.length} bài báo
                    </span>
                  </div>

                  {item.presenters.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">Bài báo đã gán:</p>
                      <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                        {item.presenters.map((presenter, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{presenter.presenterName}</span>:{" "}
                            {presenter.paperTitle}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
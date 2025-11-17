"use client";

import {
  Calendar,
  BookOpen,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/helper/format";
import type { ResearchConferenceDetailResponse, RevisionRoundDeadlineResponse } from "@/types/conference.type";

interface ResearchInfoTabProps {
  conference: ResearchConferenceDetailResponse;
}

export function ResearchInfoTab({ conference }: ResearchInfoTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Research Conference Information
      </h2>

      {/* Basic Research Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Research Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Name" value={conference.name} />
          <InfoField label="Paper Format" value={conference.paperFormat} />
          <InfoField
            label="Number of Papers to Accept"
            value={conference.numberPaperAccept}
          />
          <InfoField
            label="Revision Attempts Allowed"
            value={conference.revisionAttemptAllowed}
          />
          <InfoField
            label="Review Fee (VND)"
            value={`${(conference.reviewFee || 0).toLocaleString("vi-VN")}₫`}
          />
          <InfoField label="Rank Value" value={conference.rankValue} />
          <InfoField label="Rank Year" value={conference.rankYear} />
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                conference.allowListener
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {conference.allowListener ? "✓" : "✗"} Allow Listener
            </span>
          </div>
        </div>
      </div>

      {/* Ranking Description */}
      {conference.rankingDescription && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Ranking Description
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
            {conference.rankingDescription}
          </p>
        </div>
      )}

      {/* Research Phase Timeline */}
      {conference.researchPhase ? (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Research Phase Timeline
          </h3>
          <div className="space-y-4">
            {/* Registration Phase */}
            <PhaseCard
              title="Registration Phase"
              number={1}
              color="blue"
              startDate={conference.researchPhase.registrationStartDate??null}
              endDate={conference.researchPhase.registrationEndDate??null}
            />

            {/* Full Paper Submission Phase */}
            <PhaseCard
              title="Full Paper Submission Phase"
              number={2}
              color="purple"
              startDate={conference.researchPhase.fullPaperStartDate??null}
              endDate={conference.researchPhase.fullPaperEndDate??null}
            />

            {/* Review Phase */}
            <PhaseCard
              title="Review Phase"
              number={3}
              color="orange"
              startDate={conference.researchPhase.reviewStartDate??null}
              endDate={conference.researchPhase.reviewEndDate??null}
            />

            {/* Revision Phase */}
            <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs font-bold">
                  4
                </span>
                Revision Phase
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Start Date"
                  value={formatDate(conference.researchPhase.reviseStartDate)}
                />
                <InfoField
                  label="End Date"
                  value={formatDate(conference.researchPhase.reviseEndDate)}
                />
              </div>

              {/* Revision Round Deadlines */}
              {conference.researchPhase.revisionRoundDeadlines &&
                conference.researchPhase.revisionRoundDeadlines.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-xs font-semibold text-yellow-900 mb-2">
                      Revision Rounds:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {conference.researchPhase.revisionRoundDeadlines.map(
                        (deadline: RevisionRoundDeadlineResponse) => (
                          <div
                            key={deadline.revisionRoundDeadlineId}
                            className="bg-white border border-yellow-200 rounded p-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-yellow-900">
                                Round {deadline.roundNumber}
                              </span>
                              <span className="text-xs text-gray-600">
                                {deadline.endDate
                                  ? formatDate(deadline.endDate)
                                  : "Not set"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Camera Ready Phase */}
            <PhaseCard
              title="Camera Ready Phase"
              number={5}
              color="green"
              startDate={conference.researchPhase.cameraReadyStartDate??null}
              endDate={conference.researchPhase.cameraReadyEndDate??null}
            />

            {/* Phase Status */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Phase Status</h4>
              <div className="flex gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    conference.researchPhase.isWaitlist
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {conference.researchPhase.isWaitlist ? "✓" : "✗"} Waitlist Mode
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    conference.researchPhase.isActive
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {conference.researchPhase.isActive ? "✓" : "✗"} Active
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Research Phase Timeline
          </h3>
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No research phase data available
          </p>
        </div>
      )}
    </div>
  );
}

// --- Reusable Helper Components ---

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

interface PhaseCardProps {
  title: string;
  number: number;
  color: "blue" | "purple" | "orange" | "green";
  startDate: string | null;
  endDate: string | null;
}

function PhaseCard({ title, number, color, startDate, endDate }: PhaseCardProps) {
  const colorMap = {
    blue: { bg: "bg-blue-600", text: "text-blue-900", border: "border-blue-200", gradient: "from-blue-50 to-white" },
    purple: { bg: "bg-purple-600", text: "text-purple-900", border: "border-purple-200", gradient: "from-purple-50 to-white" },
    orange: { bg: "bg-orange-600", text: "text-orange-900", border: "border-orange-200", gradient: "from-orange-50 to-white" },
    green: { bg: "bg-green-600", text: "text-green-900", border: "border-green-200", gradient: "from-green-50 to-white" },
  };

  const style = colorMap[color];

  return (
    <div className={`bg-gradient-to-br ${style.gradient} border-2 ${style.border} rounded-lg p-4`}>
      <h4 className={`font-semibold ${style.text} mb-3 flex items-center gap-2`}>
        <span className={`px-2 py-1 ${style.bg} text-white rounded text-xs font-bold`}>
          {number}
        </span>
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoField label="Start Date" value={formatDate(startDate)} />
        <InfoField label="End Date" value={formatDate(endDate)} />
      </div>
    </div>
  );
}
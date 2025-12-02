"use client";

import { Calendar, BookOpen } from "lucide-react";
import { formatDate } from "@/helper/format";
import type { ResearchConferenceDetailResponse, RevisionRoundDeadlineResponse } from "@/types/conference.type";

interface ResearchInfoTabProps {
  conference: ResearchConferenceDetailResponse;
}

export function ResearchInfoTab({ conference }: ResearchInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Research Info */}
      <div className="bg-white rounded-lg p-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Thông tin nghiên cứu
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                conference.allowListener
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {conference.allowListener ? "Có thính giả" : "Không có thính giả"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Tên hội nghị" value={conference.name} />
          <InfoField label="Định dạng bài báo" value={conference.paperFormat} />
          <InfoField
            label="Số bài chấp nhận"
            value={conference.numberPaperAccept}
          />
          <InfoField
            label="Số lần chỉnh sửa"
            value={conference.revisionAttemptAllowed}
          />
          <InfoField
            label="Phí đánh giá bài báo"
            value={`${(conference.reviewFee || 0).toLocaleString("vi-VN")}₫`}
          />
          <InfoField label="Xếp hạng" value={`${conference.rankValue} (${conference.rankYear})`} />
          <InfoField 
            label="Mô tả xếp hạng" 
            value={
              conference.rankingDescription && conference.rankingDescription.length > 20 
                ? `${conference.rankingDescription.substring(0, 20)}...` 
                : conference.rankingDescription
            } 
          />
        </div>
      </div>

      {/* Research Phase Timeline */}
      {/* {Array.isArray(conference.researchPhase) && conference.researchPhase.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lộ trình nghiên cứu
          </h3>

          {conference.researchPhase.map((phase, idx) => (
            <div key={phase.researchConferencePhaseId ?? idx} className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">
                Giai đoạn {idx + 1} {phase.isWaitlist ? "(Waitlist)" : ""}
              </h4>

              <div className="space-y-4">
                <PhaseCard
                  title="Đăng ký"
                  number={1}
                  color="blue"
                  startDate={phase.registrationStartDate ?? null}
                  endDate={phase.registrationEndDate ?? null}
                />
                <PhaseCard
                  title="Nộp bài"
                  number={2}
                  color="purple"
                  startDate={phase.fullPaperStartDate ?? null}
                  endDate={phase.fullPaperEndDate ?? null}
                />
                <PhaseCard
                  title="Phản biện"
                  number={3}
                  color="orange"
                  startDate={phase.reviewStartDate ?? null}
                  endDate={phase.reviewEndDate ?? null}
                />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded text-xs font-bold">
                      4
                    </span>
                    Giai đoạn chỉnh sửa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <InfoField label="Bắt đầu" value={formatDate(phase.reviseStartDate)} />
                    <InfoField label="Kết thúc" value={formatDate(phase.reviseEndDate)} />
                  </div>

                  {phase.revisionRoundDeadlines?.length ? (
                    <div className="pt-4 border-t border-yellow-200">
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        Các vòng chỉnh sửa:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {phase.revisionRoundDeadlines?.map((deadline: RevisionRoundDeadlineResponse) => (
                          <div
                            key={deadline.revisionRoundDeadlineId}
                            className="bg-white border border-yellow-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                Vòng {deadline.roundNumber}
                              </span>
                              <span>
                                Bắt đầu: {deadline.startSubmissionDate ? formatDate(deadline.startSubmissionDate) : "Chưa có"}
                              </span>
                              <span>
                                Kết thúc: {deadline.endSubmissionDate ? formatDate(deadline.endSubmissionDate) : "Chưa có"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <PhaseCard
                  title="Hoàn thiện"
                  number={5}
                  color="green"
                  startDate={phase.cameraReadyStartDate ?? null}
                  endDate={phase.cameraReadyEndDate ?? null}
                />

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Trạng thái</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${phase.isWaitlist ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                      }`}>
                      {phase.isWaitlist ? "✓" : "✗"} Chờ danh sách
                    </span>
                    <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${phase.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                      {phase.isActive ? "✓" : "✗"} Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lộ trình nghiên cứu
          </h3>
          <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            Chưa có thông tin lộ trình nghiên cứu
          </p>
        </div>
      )} */}

      {/* {conference.researchPhase ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lộ trình nghiên cứu
          </h3>
          <div className="space-y-4">
          
            <PhaseCard
              title="Giai đoạn đăng ký"
              number={1}
              color="blue"
              startDate={conference.researchPhase.registrationStartDate ?? null}
              endDate={conference.researchPhase.registrationEndDate ?? null}
            />

      
            <PhaseCard
              title="Giai đoạn nộp bài"
              number={2}
              color="purple"
              startDate={conference.researchPhase.fullPaperStartDate ?? null}
              endDate={conference.researchPhase.fullPaperEndDate ?? null}
            />

      
            <PhaseCard
              title="Giai đoạn phản biện"
              number={3}
              color="orange"
              startDate={conference.researchPhase.reviewStartDate ?? null}
              endDate={conference.researchPhase.reviewEndDate ?? null}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded text-xs font-bold">
                  4
                </span>
                Giai đoạn chỉnh sửa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InfoField
                  label="Bắt đầu"
                  value={formatDate(conference.researchPhase.reviseStartDate)}
                />
                <InfoField
                  label="Kết thúc"
                  value={formatDate(conference.researchPhase.reviseEndDate)}
                />
              </div>


              {conference.researchPhase.revisionRoundDeadlines &&
                conference.researchPhase.revisionRoundDeadlines.length > 0 && (
                  <div className="pt-4 border-t border-yellow-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Các vòng chỉnh sửa:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {conference.researchPhase.revisionRoundDeadlines.map(
                        (deadline: RevisionRoundDeadlineResponse) => (
                          <div
                            key={deadline.revisionRoundDeadlineId}
                            className="bg-white border border-yellow-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                Vòng {deadline.roundNumber}
                              </span>
                              <span className="text-xs text-gray-600">
                                {deadline.endDate
                                  ? formatDate(deadline.endDate)
                                  : "Chưa có"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

        
            <PhaseCard
              title="Giai đoạn hoàn thiện"
              number={5}
              color="green"
              startDate={conference.researchPhase.cameraReadyStartDate ?? null}
              endDate={conference.researchPhase.cameraReadyEndDate ?? null}
            />


            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Trạng thái</h4>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    conference.researchPhase.isWaitlist
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {conference.researchPhase.isWaitlist ? "✓" : "✗"} Chờ danh sách
                </span>
                <span
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    conference.researchPhase.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {conference.researchPhase.isActive ? "✓" : "✗"} Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lộ trình nghiên cứu
          </h3>
          <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            Chưa có thông tin lộ trình nghiên cứu
          </p>
        </div>
      )} */}
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
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium break-words">
        {value != null && value !== "" ? String(value) : "Chưa có"}
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
    blue: {
      bg: "bg-blue-500",
      border: "border-blue-200",
      bgLight: "bg-blue-50"
    },
    purple: {
      bg: "bg-purple-500",
      border: "border-purple-200",
      bgLight: "bg-purple-50"
    },
    orange: {
      bg: "bg-orange-500",
      border: "border-orange-200",
      bgLight: "bg-orange-50"
    },
    green: {
      bg: "bg-green-500",
      border: "border-green-200",
      bgLight: "bg-green-50"
    },
  };

  const style = colorMap[color];

  return (
    <div className={`${style.bgLight} border ${style.border} rounded-lg p-4`}>
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className={`flex items-center justify-center w-6 h-6 ${style.bg} text-white rounded text-xs font-bold`}>
          {number}
        </span>
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Bắt đầu" value={formatDate(startDate)} />
        <InfoField label="Kết thúc" value={formatDate(endDate)} />
      </div>
    </div>
  );
}